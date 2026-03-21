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

  // Get all users who have reminders
  const usersSnap = await db.collectionGroup("data").where(
    admin.firestore.FieldPath.documentId(), ">=", ""
  ).get();

  // Filter to just 'reminders' docs
  const reminderDocs = [];
  usersSnap.forEach(doc => {
    if (doc.ref.path.endsWith("/data/reminders")) {
      reminderDocs.push(doc);
    }
  });

  for (const doc of reminderDocs) {
    const data = doc.data();
    if (!Array.isArray(data.reminders)) continue;

    let changed = false;
    const reminders = data.reminders;

    for (const r of reminders) {
      if (!r.fired && r.remindAt <= now) {
        r.fired = true;
        r.firedBy = "server";
        r.firedAt = Date.now();
        changed = true;

        // Get user's FCM tokens
        const uid = doc.ref.parent.parent.id;
        const tokensDoc = await db.doc(`users/${uid}/data/fcm_tokens`).get();
        if (!tokensDoc.exists) continue;

        const tokens = tokensDoc.data().tokens || [];
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
          }
        } catch (e) {
          console.error(`FCM send failed for user ${uid}:`, e);
        }
      }
    }

    if (changed) {
      await doc.ref.update({ reminders, _updatedAt: Date.now() });
    }
  }
});
