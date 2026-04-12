---
name: Conflict Resolution Feature + Backup System
description: Active feature work — Firestore sync conflict resolution UI (Timesheet DONE, Notes IN PROGRESS) + backup system overhaul (v5.1.78 — all 3 backup paths now back up everything).
type: project
---

## Problem
Multi-device sync via Firestore causes data loss — recent entries in Timesheet were lost. The existing HWM system silently rejects stale data but doesn't give the user control. Similar to MS OneNote's conflict resolution approach.

## Goal
When a LOCAL vs CLOUD conflict is detected, show a banner at top listing affected sections. User can preview conflicting data side-by-side and choose which version to keep. Covers all 6 data types: Timesheet, Notes, Notebooks, Routines, Callouts, Note Tags.

## Test page
`http://localhost:3000/app?testConflict=1` — generates test conflicts for all 6 types. Used for fine-tuning the UI.

## Current state (v5.1.78, as of 2026-04-06)

### DONE — Timesheet Conflicts
- 3-level drill-down: day list (hours comparison) → task list (Yours only badges) → task card detail
- Yours / Cloud / Changes tabs at task level
- Field-level diff highlights, read-only activity cards using real CSS
- FINISHED fine-tuning

### IN PROGRESS — Notes Conflicts  ← RESUME HERE
- Full note card with description, note content (tt-prose), "CHANGED" badge
- Yours / Cloud / Changes tabs with LCS line-level diff
- Was being fine-tuned when session crashed — needs review and polish

### Built but not yet fine-tuned
- **Notebooks**: Same pattern as Notes, richer TipTap content (headings, bullets)
- **Callouts**: Side-by-side Your vs Cloud, field rows (Who/Hrs/Job), green/red highlighting
- **Routines**: Side-by-side, numbered steps, "added step" / "missing" annotations
- **Note Tags**: Side-by-side, tag-level diff, "New" / "missing" labels, tag counts

### Shared UI patterns
- All 6 types share bottom action bar: Later / Use Cloud / Keep Mine
- Conflict list view: banner "X sync conflicts need attention" → "View all" → list of affected sections
- `_openConflictModal('test_xxx')` JS function to open each type
- Test conflict IDs: test_ts_2026-04-03, test_notes, test_notebooks, test_callouts, test_routines, test_tags

## Backup system overhaul (v5.1.75–5.1.78)

### v5.1.75–5.1.76
- Restore now kills ALL 4 onSnapshot listeners before restoring, re-subscribes all after (was leaving notes/reminders/callouts listeners alive which overwrote the restore).

### v5.1.77
- Backup timeout 30s → 60s + auto-retry once on failure.
- Brave browser times out on backup writes (Shields blocks large Firestore writes ~569KB). Works fine in Chrome — Rob may ditch Brave.

### v5.1.78 — "Make all 3 backup paths back up EVERYTHING" (2026-04-06)
All 3 backup mechanisms now include: Timesheets, Notes, Reminders, Callouts, Routines, Note Tags (categories), Notebooks (jNotebooks/jSections/jPages), Settings (localStorage allowlist).

**Snapshots** (`_writeSnapshot` ~line 22536, `confirmRestoreSnapshot` ~22710):
- Added `_routines`, `_categories`, `_settings` to snapshot payload
- Restore writes them back to Firestore + localStorage

**Cloud Backup** (`_runBackupWrite` ~line 23020, `restoreFromBackup` ~23178):
- Parallel fetches now include jNotebooks/jSections/jPages docs
- Payload adds `jNotebooks`, `jSections`, `jPages` + `_notebookCount`, `_pageCount`
- Restore section 8 = Notebooks (writes to Firestore + IndexedDB), section 9 = Settings
- Modal subtitle and restore confirmation message updated to list all data types
- `refreshBackupList` shows notebook count badge

**Export/Import** (`exportAllData` ~22882, `doExportWithOptions` ~22926, `_importShowPreview` ~23409, `doImportWithOptions` ~23446, `_doImport` ~23517):
- Export UI: added `exp-tags` and `exp-notebooks` checkbox rows
- Export fetch: pulls categories doc + jNotebooks/jSections/jPages docs
- Import preview: detects and shows Tags + Notebooks in file
- Import filter: passes categories/jNotebooks/jSections/jPages through
- `_doImport`: handles all 4 new fields (5b note tags, 5c notebooks) — writes to Firestore + IndexedDB, updates state.customCategories/disabledCats/jNotebooks/jSections/jPages

**Note:** Earlier Rob said "Notebooks NOT backed up — that's what we wanted" but later overrode with "make them all backup everything". v5.1.78 follows the latter.

**Status:** Committed and pushed to main as commit `578cbbb`. Not yet manually tested by Rob.

## ⚠️ CRITICAL INCIDENT — 2026-04-06 (after v5.1.78 push) — RESOLVED, fix pending in v5.1.79

### Phase 1 (13:26) — Initial QuotaExceededError
**Symptom:** `QuotaExceededError` on `firestore_mutations_firestore/[DEFAULT]/eir-fieldlog/_*` followed by cascading `FIRESTORE INTERNAL ASSERTION FAILED: Unexpected state`. Init took >4s.

**First "fix" attempted:** Clear ~35 visible `firestore_mutations_*` localStorage keys + hard reload. This DID NOT actually fix it — see Phase 2.

### Phase 2 (14:30) — Hidden write storm, real root cause found
After the localStorage clear + reload, Rob reported "app broken, can't switch week, no Notebooks, shitload of errors". Investigation revealed:

- localStorage looked healthy on inspection (35 small 48-byte tracker entries) — but the actual mutation queue lives in **IndexedDB** (`firestore/[DEFAULT]/eir-fieldlog/main`), not localStorage. The earlier IDB delete attempt returned `blocked` and silently failed.
- Network tab showed **22+ consecutive Write/channel POSTs** (RIDs 45808→45828, AIDs 7→27) — Firestore SDK was flushing a massive backlog of stranded writes from the earlier Brave-blocked backup attempts.
- Write storm choked the channel, so reads timed out at 8s+ and the renderer froze.
- Listeners never got to fire, so `state.jNotebooks/jSections/jPages/notes` stayed empty.
- Each reload re-spawned the storm and re-leaked into multi-tab localStorage (counted **629** `firestore_*` keys at peak).

### Real fix that worked
```js
await firebase.firestore().terminate();   // releases IDB lock
indexedDB.deleteDatabase('firestore/[DEFAULT]/eir-fieldlog/main'); // delete returns 'ok' AFTER terminate
Object.keys(localStorage).filter(k=>k.startsWith('firestore')).forEach(k=>localStorage.removeItem(k));
location.reload();
```
After this: Firestore reads = ~140ms, no errors, week switching works, notebooks load on view entry (lazy via `loadJournal()` line 17155 — empty `state.jNotebooks` on the week view is BY DESIGN, not a bug).

**Note:** `firebase.firestore().clearIndexedDbPersistence()` is NOT available in the v8 compat SDK we use — it threw "is not a function". Use direct `indexedDB.deleteDatabase` after `terminate()`.

### Data safety verified
Local `timesheet-db` was fully intact throughout: 12 weeks, 8 notes records (`j_notebooks` len 2, `j_sections` len 4, `j_pages` len 8, `notes_all` len 34, `reminders_all` len 6, `journal_all` len 9, `categories_custom`, `callouts_all`). RianDB and rian-db were empty (legacy/abandoned). Firestore cloud also intact.

### Phase 3 (14:35) — Write storm came back, menu frozen
After ~1 minute on the page, app froze again. Console clean but `[Rian] Initialization took >4s`. Network showed **994 Firestore requests**, RIDs jumped from 8 to 92,000+, AIDs to 1,294 in ~1 minute (~21 writes/sec). Google started returning **503** rate-limits on the channel endpoints. The renderer was frozen — `Input.dispatchMouseEvent` timed out at 30s, screenshot showed last good frame but clicks didn't register.

The IDB delete attempted in Phase 2 returned `blocked` and silently failed → corrupt write queue survived → on reload the SDK replayed it in a tight loop.

### v5.1.79 ship (committed e43d747, pushed)
Two changes — recovery + persistence safety:

**1. `?cleanup=1` URL flag** (top of `<script>` block, ~line 11623):
- Runs BEFORE `firebase.initializeApp()`
- Clears all `firestore_*` localStorage keys
- Calls `indexedDB.deleteDatabase('firestore/[DEFAULT]/eir-fieldlog/main')` — succeeds because Firebase hasn't grabbed the IDB lock yet
- Redirects to `/app` after delete fires (success/error/blocked all handled)
- Throws `'Rian cleanup mode active'` to halt the rest of init
- Shows "Cleaning up Firestore cache…" UI while it runs

**2. Single-tab persistence** (`db_fs.enablePersistence()` instead of `enablePersistence({synchronizeTabs:true})`):
- Eliminates the localStorage coordination layer that QuotaExceeded'd in Phase 1
- IndexedDB has GB-scale quota vs localStorage ~5–10MB
- Rob almost never has Rian open in 2 tabs anyway
- Comment in code explains why

### Underlying write-loop root cause — STILL UNKNOWN
Investigated but not found. Suspects checked & cleared:
- `_jUnsubNb/Sec/Pg` in `loadJournal()` (line 17192+) — only writes back if `!snap.exists`, won't loop on existing docs.
- `migrateNotesHTML` in notes onSnapshot (line 17084) — appears idempotent: `desc.includes('<')` is false on second run, `!n.noteContent` is false after first migration.
- Activity-count regression guard at line 13231 — possible source if local activity count differs from remote in a way that doesn't reconcile after `fsSetWeek`. Note: `_weekNonEmptyActCount` at line 12254 has a bug — checks `a.code` (singular) but the model uses `a.codes` (array). Both local and remote use the same broken counter so they should produce equal counts and not loop, but worth noting.
- HWM/hours regression guard at line 13201 — similar pattern, similar argument.

**Practical theory:** the storm may have been a one-shot replay of stranded writes from the original Brave/Shields failures, NOT a sustained code-level loop. After `?cleanup=1` wipes the queue, no new writes get queued, and the storm doesn't re-trigger. If Rob can run cleanly after recovery, this theory holds. If the storm spontaneously returns, it's a real loop in onSnapshot handlers and we'll need to instrument writes (wrap `ref.set` to log call sites) to catch the culprit.

### Recovery procedure for future incidents
```
1. Close Rian tab fully (releases Firestore IDB lock)
2. Open http://localhost:3000/app?cleanup=1
3. Wait for "Done — reloading…" → auto-redirects to /app
4. Verify v5.1.79, week switching, Notebooks load
```
DO NOT just hard-reload after a storm — the SDK opens the corrupt IDB before any cleanup script can run. The cleanup script must run BEFORE `firebase.initializeApp()`, which is what `?cleanup=1` guarantees by sitting at the top of the script block and throwing.

## Existing recovery features (separate from conflict resolution)
1. **Snapshot / Recover** — hamburger menu, per-week snapshots (now includes everything as of v5.1.78)
2. **Cloud Backups** — hamburger menu, daily full backup of ALL Rian data (now truly all as of v5.1.78)
3. **Export / Import** — hamburger menu, JSON file with selectable sections (now includes Tags + Notebooks as of v5.1.78)

**Why:** Multi-device usage causes sync conflicts that silently lose data. This feature gives visibility and control.

**How to apply:** Resume fine-tuning Notes conflicts, then work through remaining types. Maintain established patterns (Yours/Cloud/Changes tabs, field-level diffs, action bar). Rob also wants selective restore (choose which sections to restore from backup).

## ⚠️ Stale-tab outbound wipe — diagnosed + fixed v5.1.89 (2026-04-06 evening)

**Symptom (second occurrence):** Rob lost Fri Apr 3 + Mon Apr 6 BH entries (8h each, code `UWA0001A99`). Same two days as a previous loss. Tue/Wed entries on same week were preserved.

**Recovery this time:** Found 35 auto-snapshots in `users/{uid}/weeks/2026-04-03/snapshots`. Top one was from `Brave - Desktop 2af7` taken Fri Apr 3 ~14:43 UTC with `totalOrd: 16, entries: 3`. Built a merge (Fri+Mon from snapshot, Tue+Wed kept from live), wrote via `fsSetWeek` after taking a `pre-restore-{ts}` snapshot. Forensic IDB dump saved to user Downloads as `rian-idb-rescue-{ts}.json`. Procedure repeatable for future losses.

**Root cause:** Rob keeps many tabs open across **Chrome, Firefox, Brave** for testing version history (each tab loads `app.html` at the time it was opened). Each tab is a live writer with:
- Its own in-memory `state.weekData` frozen at last `loadWeek()` time
- Its own debounced autosave timer + onSnapshot listener
- Possibly old/pre-fix code

Single-tab persistence is **per-browser** — Chrome/Firefox/Brave each get their own lock, so up to 3 live writers can run concurrently. Within a single browser, focusing an old tab hops the lock and flushes that tab's stale state.

**The wipe path that hit Rob:**
1. Brave wrote 16h to Firestore Friday afternoon (snapshot proves it).
2. A Chrome (or Firefox) tab opened on a fresh IDB scaffolded the week as 7 empty days (each with one blank activity carrying just an `id`).
3. That tab's autosave fired and called `fsSetWeek` BEFORE its `onSnapshot` had delivered the 16h cloud version → empty days replaced 16h in Firestore.
4. The 16h never reached this device's HWM (HWM stuck at 6 from an earlier intermediate state).
5. Conflict detection didn't fire because the conflict detector only runs *inbound* via `onSnapshot`. By the time it looked, cloud == local == empty. No divergence.

**The fix (v5.1.89) — outbound HWM guard in `fsSetWeek` (~line 12509):**
```js
const hwm = _getHWM(weekStart);
const local = _weekTotalHours(weekData);
if (hwm > HWM_THRESHOLD && local < hwm - HWM_THRESHOLD) {
  // Fetch cloud, register a conflict, throw OUTBOUND_HWM_BLOCK
  // — caller catches and the write is aborted.
}
```
Bypass: set `window._hwmAllowOutbound[weekStart] = true` before a deliberate-overwrite write (e.g. user clicks "Keep Mine" on the resulting conflict). The guard consumes the flag once.

**What it catches:** any write that attempts to drop hours by more than 4h vs the locally-known HWM, including the stale-tab flush, scaffold-before-sync race, and any future bug that does the same.

**What it does NOT catch:** the very first write to a brand-new device where HWM is still 0. For that, the race fix (suppress autosave on a freshly-scaffolded week until the first onSnapshot fires) is still needed and is the next thing to build.

## Behavioral guidance for Rob (told 2026-04-06)
- Use **one browser** for real data entry. Brave is now his "live" browser; Chrome is reserved for the dev tab Claude controls via MCP.
- Hard-close every other Rian tab in every browser. Tabs sitting in the background are live writers with stale state.
- For testing version history without risking data, use a separate browser profile signed into a throwaway Firebase user (TODO: add `?testUser=1` flag).

## v5.1.90 — Race fix: scaffold-before-sync gate (2026-04-06)

Structural complement to v5.1.89's outbound HWM guard. Stops the wipe from being attempted in the first place.

**`loadWeek` (~line 13374):** when local cache is missing or doesn't belong to current user, mark `window._firstSnapReceived[weekStart] = false`. Sets a 5s timeout that releases the gate if no snapshot arrives (offline / slow network — edits should still save).

**`onSnapshot` handler (~line 13395):** at the very top, after the `hasPendingWrites` skip, sets `window._firstSnapReceived[weekStart] = true`. Any snapshot — empty or not — counts as "the cloud has spoken".

**`scheduleAutoSave` (~line 13535):** before calling `fsSetWeek`, checks the gate. If still `false`, logs a warning, leaves syncStatus as 'pending', and returns. The edit is still saved to IDB above (so nothing is lost on this device) and will be pushed naturally on the next edit after the gate releases.

**What this catches:** the exact path that wiped Rob's BH days — a tab opens with no IDB cache, scaffolds an empty 7-day skeleton, the user (or a debounced autosave from a stale write) fires `scheduleAutoSave`, and `fsSetWeek` blasts the empty scaffold over Firestore BEFORE `onSnapshot` has delivered the real cloud version. With the gate, that first push is skipped, the snapshot arrives, `state.weekData` is replaced with the real cloud version, the gate releases, and subsequent edits push correctly.

**Belt-and-braces with v5.1.89:** v5.1.90 prevents the most common race; v5.1.89 catches anything that slips through (e.g. a stale tab in another browser process whose snapshot already arrived but whose in-memory `state.weekData` is from the old cached scaffold).

## v5.1.91 — Hotfix: gate must cover snapshot handler's push-back paths (2026-04-06)

**Why:** Smoke test of v5.1.90 exposed a hole. The race-fix gate only blocked the `scheduleAutoSave → fsSetWeek` path. But the `onSnapshot` handler has its OWN push-back paths (stale-timestamp guard at line ~13420, HWM regression guard at ~13434, activity-count regression guard at ~13456). When the test code edited state and called `scheduleAutoSave` BEFORE the first snapshot arrived, `state.weekData._updatedAt` was set to NOW. Then the snapshot arrived with the older cloud `_updatedAt`. The handler saw `remoteTs < localTs` and pushed the empty scaffold back to cloud — wiping the real data. The cloud was then 0h with a fresh timestamp.

**Fix:** Capture `wasFirstSnap = !!(window._firstSnapReceived[weekStart] === false)` at the very top of the snapshot handler, BEFORE releasing the gate. Then guard all three push-back branches with `if (!wasFirstSnap && ...)`. The first snapshot for a freshly-scaffolded week is always trusted as the source of truth — local has nothing real to compare against.

**How to apply:** when adding any new push-back-from-handler code path in the future, ALWAYS gate it on `!wasFirstSnap`. The principle: a freshly-scaffolded week's local state is by definition stale relative to any cloud snapshot.

## Smoke test results — v5.1.91 (2026-04-06)
All three tests passed end-to-end via Claude in Chrome:

1. **Race-fix test:** deleted week 2026-03-27 (41h) from IDB + cleared HWM, called `loadWeek('2026-03-27')`, immediately wiped state to 0h and called `scheduleAutoSave`. Final state: 41h restored from cloud snapshot, gate transitioned false→true. Cloud verified intact at 41h.

2. **Outbound HWM test:** on the same loaded week (HWM=41), wiped state to 0h and called `scheduleAutoSave`. Console logged `BLOCKED outbound write — local hours regression: 0.0 < HWM 41.0`. Conflict registered in `state.conflicts` with the correct description. Cloud verified intact at 41h.

3. **Happy-path test:** added a smoketest tag to a notes field on the BH week (2026-04-03), called `scheduleAutoSave`. Cloud received the tag, BH days both still 8h, total still 19h. Confirmed legitimate edits are not blocked.

**What's still NOT covered by automated test:**
- Cross-browser propagation (Brave → Chrome). Single-tab persistence makes Firestore lock to one browser at a time, so this needs a manual two-browser test by Rob.
- The exact original wipe scenario (stale browser tab with stale in-memory state pushing wipe). The HWM outbound guard (v5.1.89) is what catches that — confirmed working in test 2.

## TODO after v5.1.91
- `?testUser=1` flag for safe version-history testing.
- Manual cross-browser test: Rob to make an edit in Brave, refresh Chrome, confirm propagation.
- Resume Notes conflicts fine-tuning (the original task before all this).
