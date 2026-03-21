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
 * Runs every minute. Checks all users for reminders that became due
 * in the last 5 minutes and haven't been server-pushed yet.
 * IMPORTANT: Writes firedBy:"server" to Firestore BEFORE sending push,
 * so the client sees the update when it opens and doesn't double-fire.
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

    const reminders = data.reminders;
    const FIVE_MINUTES = 5 * 60 * 1000;

    // Phase 1: Find all due reminders and mark them in-memory
    const dueReminders = [];
    let changed = false;

    for (const r of reminders) {
      if (!r.remindAt || r.remindAt > now) continue;
      if (r.firedBy === "server") continue;
      const recentlyDue = (now - r.remindAt) < FIVE_MINUTES;
      if (!recentlyDue) continue;

      const label = !r.fired ? "unfired" : (r.firedBy ? `client-fired by ${r.firedBy}` : "fired-no-firedBy");
      console.log(`[checkReminders] Processing reminder "${r.description}" (${label})`);

      r.fired = true;
      r.firedBy = "server";
      r.firedAt = r.firedAt || Date.now();
      changed = true;
      dueReminders.push(r);
    }

    // Phase 2: Write to Firestore FIRST (so clients see firedBy:"server" before push arrives)
    if (changed) {
      await db.doc(`users/${uid}/data/reminders`).update({ reminders, _updatedAt: Date.now() });
      console.log(`[checkReminders] Updated reminders in Firestore (before sending push)`);
    }

    // Phase 3: Now send push notifications
    if (dueReminders.length === 0) continue;

    const subsDoc = await db.doc(`users/${uid}/data/push_subscriptions`).get();
    if (!subsDoc.exists) { console.log(`[checkReminders] No push_subscriptions for user`); continue; }

    const subs = subsDoc.data().subs || {};
    const deviceNames = Object.keys(subs);
    console.log(`[checkReminders] Found ${deviceNames.length} push subscriptions`);
    if (deviceNames.length === 0) continue;

    const invalidDevices = [];

    for (const r of dueReminders) {
      const body = r.description + (r.location ? " — " + r.location : "");
      const payload = JSON.stringify({
        title: "Rian Reminder",
        body: body,
        reminderId: r.id || "",
        noteId: r.noteId || "",
        type: "reminder"
      });

      for (const device of deviceNames) {
        const sub = subs[device];
        const pushSub = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth }
        };

        try {
          await webpush.sendNotification(pushSub, payload, {
            TTL: 3600,
            urgency: "high",
            topic: r.id || "rian-reminder"
          });
          console.log(`[checkReminders] Push sent to ${device} for "${r.description}"`);
        } catch (err) {
          console.error(`[checkReminders] Push to ${device} failed:`, err.statusCode, err.body);
          if (err.statusCode === 410 || err.statusCode === 404) {
            invalidDevices.push(device);
          }
        }
      }
    }

    // Clean up invalid subscriptions
    if (invalidDevices.length > 0) {
      const uniqueInvalid = [...new Set(invalidDevices)];
      for (const d of uniqueInvalid) delete subs[d];
      await db.doc(`users/${uid}/data/push_subscriptions`).set(
        { subs, _updatedAt: Date.now() }
      );
      console.log(`[checkReminders] Removed ${uniqueInvalid.length} expired subscriptions`);
    }
  }
});
