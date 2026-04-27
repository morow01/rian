// ─── Rian: March Notes Bulk Import ───────────────────────────────────────────
// Paste this entire block into the browser console while logged into Rian.
// It will create a "March 2026" section and import all 30 notes into it.
// The page will reload automatically when done — Rian's storage migration
// will then upload images to Firebase Storage in the background.
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  // 1. Sanity checks
  if (!window.state?.currentUser) {
    alert('Not logged in — sign in to Rian first, then re-run this script.');
    return;
  }
  if (!window.state.notes) {
    alert('state.notes not found — make sure you are on the Notes view first.');
    return;
  }

  // 2. Load import data from the local dev server
  console.log('[Import] Fetching march_import.json…');
  let items;
  try {
    const res = await fetch('/march_import.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    items = await res.json();
  } catch (e) {
    alert('Could not load march_import.json: ' + e.message);
    return;
  }
  console.log(`[Import] Loaded ${items.length} items (1 section + ${items.length - 1} notes)`);

  // 3. Check for duplicate section (in case script is run twice)
  const section = items[0];
  const alreadyImported = state.notes.some(n => n.id === section.id);
  if (alreadyImported) {
    alert('These notes have already been imported (section ID already exists).');
    return;
  }

  // 4. Merge: new items go at the START (they'll appear at top of notes list)
  //    Preserve all existing notes/sections untouched.
  const existing = window.state.notes || [];
  window.state.notes = [...items, ...existing];

  console.log(`[Import] state.notes now has ${state.notes.length} items`);

  // 5. Save to IndexedDB + Firestore (Rian will auto-compress if needed)
  if (typeof scheduleNotesSave === 'function') {
    scheduleNotesSave();
    console.log('[Import] scheduleNotesSave() called — saving to IndexedDB & Firestore…');
  } else {
    console.warn('[Import] scheduleNotesSave not found — data added to state but not saved!');
    return;
  }

  // 6. Wait 1.5s for IDB write, then reload so the UI refreshes cleanly
  //    (Firestore upload of large images continues in background after reload)
  console.log('[Import] Waiting for IndexedDB write, then reloading…');
  await new Promise(r => setTimeout(r, 1500));

  console.log('[Import] Done — reloading page…');
  window.location.reload();
})();
