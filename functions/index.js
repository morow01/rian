const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Runs every minute. Checks all users for pending reminders that are due,
 * sends FCM push notifications, and marks them as fired.
 */
exports.checkReminders = onSchedule("* * * * *", async () => {
  const now = Date.now();
  console.log(`[checkReminders] Running at ${new Date(now).toISOString()}`);

  // Get all users
  const usersSnap = await db.collection("users").get();
  console.log(`[checkReminders] Found ${usersSnap.size} users`);

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;

    // Get this user's reminders doc
    const remindersDoc = await db.doc(`users/${uid}/data/reminders`).get();
    if (!remindersDoc.exists) continue;

    const data = remindersDoc.data();
    if (!Array.isArray(data.reminders)) continue;

    let changed = false;
    const reminders = data.reminders;
    const TWO_MINUTES = 2 * 60 * 1000;

    const pending = reminders.filter(r => !r.fired && r.remindAt <= now);
    const clientFired = reminders.filter(r => r.fired && r.firedBy && r.firedBy !== "server" && r.firedAt && (now - r.firedAt) < TWO_MINUTES);
    console.log(`[checkReminders] User ${uid}: ${reminders.length} total, ${pending.length} due, ${clientFired.length} client-fired recently`);

    for (const r of reminders) {
      const needsFiring = !r.fired && r.remindAt <= now;
      const clientFiredRecently = r.fired && r.firedBy && r.firedBy !== "server"
        && r.firedAt && (now - r.firedAt) < TWO_MINUTES;

      if (needsFiring || clientFiredRecently) {
        console.log(`[checkReminders] Processing reminder "${r.description}" (${needsFiring ? 'unfired' : 'client-fired'})`);

        if (needsFiring) {
          r.fired = true;
          r.firedBy = "server";
          r.firedAt = Date.now();
          changed = true;
        } else if (clientFiredRecently) {
          r.firedBy = "server";
          changed = true;
        }

        // Get user's FCM tokens
        const tokensDoc = await db.doc(`users/${uid}/data/fcm_tokens`).get();
        if (!tokensDoc.exists) { console.log(`[checkReminders] No fcm_tokens doc for user`); continue; }

        const tokens = tokensDoc.data().tokens || [];
        console.log(`[checkReminders] Found ${tokens.length} FCM tokens`);
        if (tokens.length === 0) continue;

        // Build notification
        const body = r.description + (r.location ? " — " + r.location : "");
        const message = {
          data: {
            type: "reminder",
            title: "Rian Reminder",
            body: body,
            reminderId: r.id || "",
            noteId: r.noteId || "",
          },
          tokens: tokens,
        };

        try {
          const result = await messaging.sendEachForMulticast(message);
          console.log(`[checkReminders] FCM result: ${result.successCount} success, ${result.failureCount} failures`);
          result.responses.forEach((resp, i) => {
            if (!resp.success) {
              console.error(`[checkReminders] Token ${i} failed:`, resp.error?.code, resp.error?.message);
            }
          });
          // Remove any invalid tokens
          const invalidTokens = [];
          result.responses.forEach((resp, i) => {
            if (!resp.success && resp.error &&
                (resp.error.code === "messaging/registration-token-not-registered" ||
                 resp.error.code === "messaging/invalid-registration-token")) {
              invalidTokens.push(tokens[i]);
            }
          });
          if (invalidTokens.length > 0) {
            const validTokens = tokens.filter(t => !invalidTokens.includes(t));
            await db.doc(`users/${uid}/data/fcm_tokens`).set(
              { tokens: validTokens, _updatedAt: Date.now() },
              { merge: true }
            );
            console.log(`[checkReminders] Removed ${invalidTokens.length} invalid tokens`);
          }
        } catch (e) {
          console.error(`[checkReminders] FCM send failed:`, e);
        }
      }
    }

    if (changed) {
      await db.doc(`users/${uid}/data/reminders`).update({ reminders, _updatedAt: Date.now() });
      console.log(`[checkReminders] Updated reminders in Firestore`);
    }
  }
});
