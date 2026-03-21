const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const webpush = require("web-push");

admin.initializeApp();
const db = admin.firestore();

// VAPID keys for web push (same public key used in the client)
webpush.setVapidDetails(
  "mailto:morow01@gmail.com",
  "BDJe4av7QjifE6l7dqNpb3ee-19fkGJcpaYaLNOv54NWLd-pyejhZBnzCx78fHxy1zDOWXyaSY_SjfhFHN4bQkE",
  "CFIQosadsS5MzPNvgfQuE3LIwbXkIgUxwvlJnJH_M7g"
);

/**
 * Runs every minute. Checks all users for pending reminders that are due,
 * sends Web Push notifications, and marks them as fired.
 */
exports.checkReminders = onSchedule("* * * * *", async () => {
  const now = Date.now();
  console.log(`[checkReminders] Running at ${new Date(now).toISOString()}`);

  const usersSnap = await db.collection("users").get();
  console.log(`[checkReminders] Found ${usersSnap.size} users`);

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;

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

        // Get user's push subscriptions (raw Web Push, not FCM)
        const subsDoc = await db.doc(`users/${uid}/data/push_subscriptions`).get();
        if (!subsDoc.exists) { console.log(`[checkReminders] No push_subscriptions for user`); continue; }

        const subs = subsDoc.data().subs || {};
        const deviceNames = Object.keys(subs);
        console.log(`[checkReminders] Found ${deviceNames.length} push subscriptions`);
        if (deviceNames.length === 0) continue;

        const body = r.description + (r.location ? " — " + r.location : "");
        const payload = JSON.stringify({
          title: "Rian Reminder",
          body: body,
          reminderId: r.id || "",
          noteId: r.noteId || "",
          type: "reminder"
        });

        const invalidDevices = [];
        for (const device of deviceNames) {
          const sub = subs[device];
          const pushSub = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth }
          };

          try {
            await webpush.sendNotification(pushSub, payload);
            console.log(`[checkReminders] Push sent to ${device}`);
          } catch (err) {
            console.error(`[checkReminders] Push to ${device} failed:`, err.statusCode, err.body);
            // Remove expired/invalid subscriptions (410 Gone or 404)
            if (err.statusCode === 410 || err.statusCode === 404) {
              invalidDevices.push(device);
            }
          }
        }

        // Clean up invalid subscriptions
        if (invalidDevices.length > 0) {
          for (const d of invalidDevices) delete subs[d];
          await db.doc(`users/${uid}/data/push_subscriptions`).set(
            { subs, _updatedAt: Date.now() }
          );
          console.log(`[checkReminders] Removed ${invalidDevices.length} expired subscriptions`);
        }
      }
    }

    if (changed) {
      await db.doc(`users/${uid}/data/reminders`).update({ reminders, _updatedAt: Date.now() });
      console.log(`[checkReminders] Updated reminders in Firestore`);
    }
  }
});
