# Rian — Project Context for Claude

## What is Rian
A Progressive Web App for field technicians — timesheets, notes (TipTap rich text), site finder, routines, callouts/on-call scheduling, and AI assistant. Single-file architecture (`app.html`, ~26,000 lines) with Firestore sync, IndexedDB offline cache, and Google Apps Script backend.

## Key Files
- `app.html` — the entire app (HTML + CSS + JS, inline). This is the only file you'll edit 99% of the time.
- `index.html` — production landing page
- `Code.gs` — Google Apps Script backend
- `manifest.json` — PWA manifest
- `functions/` — Firebase Cloud Functions (reminders)
- `.git/hooks/pre-commit` — integrity check for 31 critical element IDs (blocks commit if any are missing)
- `capacitor.config.ts` — Capacitor Android wrapper config
- `android/` — Android project (Capacitor-generated, do not hand-edit except resources)
- `scripts/build-www.js` — copies app files into `android/app/src/main/assets/public/`

## Version
`const VERSION = 'x.y.z'` in `app.html` (~line 13965). Bump on every change. Only location that needs updating (index.html version references are static).
Current version: **5.3.92**

## Git
- Remote: `https://github.com/morow01/rian.git`, branch: `main`
- Commit style: `vX.Y.Z — Short description of what changed`
- Pre-commit hook checks 31 critical HTML element IDs exist. If commit is blocked, an element was accidentally deleted — fix before committing.
- GitHub Pages URL: `https://morow01.github.io/rian/app.html`

## Architecture Decisions

### Firestore Sync & Data Protection (v4.35.39–4.35.40)
The app syncs week data, notes, callouts, and reminders with Firestore in real-time via `onSnapshot` listeners. Several data protection mechanisms are in place:

**Hours High-Water-Mark (HWM):** Tracks the max total hours ever seen per week in localStorage (`rian_hwm_{weekStart}`). If incoming Firestore data has >4h fewer than the HWM, it's rejected and local data is pushed back. This prevents stale data from another device silently overwriting a week. When the user explicitly saves (scheduleAutoSave), the HWM is SET (can go lower) so deliberate deletions work. When remote data arrives, the HWM is only RAISED.

**Callouts HWM:** Same pattern — tracks max callout entry count (`rian_co_hwm`). Threshold is 2 entries.

**Week Navigation Race Guard:** `_loadWeekInProgress` flag prevents overlapping async `loadWeek()` calls from corrupting state when clicking prev/next rapidly.

**Notes Merge:** Per-note merge using `updatedAt` timestamps. Local-only notes preserved for 2 minutes (not synced yet). Empty remote never overwrites non-empty local.

**Reminders Merge:** Per-reminder merge (keeps newer version). Local-only reminders preserved.

**Snapshots:** Auto-snapshots taken on every save to `users/{uid}/weeks/{weekStart}/snapshots/`. Include notes, callouts, and reminders as `_callouts`, `_notes`, `_reminders` fields. User can restore from ☰ → Cloud Backups.

### Template Literal Gotcha
The `renderCardView()` function builds HTML inside a template literal. You CANNOT nest template literals inside it — use plain string concatenation with `function(){}` expressions instead of arrow functions with backticks. This caused a blank-page bug before (v4.35.32).

### Callouts in Weekly Summary
Callouts are rendered inside the expandable `sum-table-wrap` div in `renderCardView()`. The code uses `state.callouts?.weeks?.[state.weekData.weekStart]?.callouts` to look up entries. CSS classes: `.co-sum-*` prefix.

### Email/Export
`buildEmailHtml(weekData)` and `buildPreviewHtml(weekData)` generate fixed-palette HTML. The `email-preview-modal` is static HTML in the body (not dynamically generated). `showEmailPreview()` / `closeEmailPreview()` control it.

### onclick HTML Attribute Gotcha (v5.3.92)
When building HTML strings and embedding a value inside an `onclick="..."` attribute, NEVER use `JSON.stringify()` — it wraps strings in double quotes which immediately close the attribute. Always use single-quoted JS strings with backslash-escaped single quotes and backslashes:
```js
'\'' + (value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\''
```
Or use the existing pattern: `esc(value).replace(/'/g, "\\'")`  and wrap in `\'...\''`.

## Key Functions
- `loadWeek(weekStart)` — loads week data from IndexedDB + subscribes to Firestore
- `scheduleAutoSave()` — debounced save (1s) to IndexedDB + Firestore
- `renderCardView()` — renders the mobile card view with weekly summary
- `calcSummary(weekData)` — computes hours by work code
- `loadCallouts()` / `saveCallouts()` — callouts Firestore sync
- `loadNotes()` / `scheduleNotesSave()` — notes Firestore sync with per-note merge
- `maybeTakeAutoSnapshot()` — auto-backup on save
- `buildEmailHtml()` / `buildPreviewHtml()` — email export HTML builders

### Notebooks (Journal) Key Functions
- `jOpenRename(id, currentTitle)` — opens rename bottom sheet for any notebook/section/page
- `jCancelRename()` / `jCommitRename()` — cancel/save rename
- `_jRenameSheet()` — renders the rename input bottom sheet (checks `state.jEditId`)
- `jOpenNbAction(nbId)` / `_jNbActionSheet()` — notebook action sheet (Rename)
- `jOpenSecAction(secId)` / `_jSecActionSheet()` — section action sheet (Rename, Change Colour)
- `jOpenPageAction(pgId)` / `_jPageActionSheet()` / `jPgAction(act, pgId)` — page action sheet
- `_jColorPickSheet()` — colour picker sheet for sections
- `_jCopyMoveSheet()` — copy/move page to another section
- `scheduleJSave()` — debounced save for notebooks data

## State
`state` object holds everything: `weekStart`, `weekData`, `notes`, `callouts`, `view`, `currentUser`, etc. Views: `'week'` (timesheet), `'notes'`, `'exchanges'` (finder), `'callouts'`, `'routines'`, `'ai'`.

Notebooks state keys: `jNotebooks`, `jSections`, `jPages`, `jEditId`, `jRenameTitle`, `jNbActionId`, `jSecActionId`, `jPageActionId`, `jDatePickId`, `jCopyMovePgId`, `jCopyMoveMode`, `jCopyMoveTargetSecId`.

## CSS Variables
`--accent: #2D6BE4`, `--bg-card`, `--bg-card-alt`, `--border`, `--text-primary`, `--text-secondary`, `--text-muted`, `--font-mono` (DM Mono).

## About Rob (the developer)
- Field technician who built Rian for his own use
- Prefers concise responses, no fluff
- Expects familiarity with the project — don't ask obvious questions
- Uses Windows, deploys via GitHub
- Currently uses OneNote for field notes (site visits with voltage readings, ticket tables, photos) — long-term goal is to replace OneNote with Rian's TipTap-based notes
- Device: Samsung SM-S918B

## Testing
- Served locally at `http://localhost:3000/app` for dev
- No test framework — manual testing in browser
- After changes, always hard-reload (Ctrl+Shift+R) to bypass service worker cache
- PWA live at: `https://morow01.github.io/rian/app.html`

---

## Android App (Capacitor) — Setup & Status

### Overview
Rian is wrapped as a native Android APK using Capacitor 8.x. The APK loads the app live from GitHub Pages — no rebuild needed for app updates, just `git push`.

### Key Config: `capacitor.config.ts`
```ts
server: {
  url: 'https://morow01.github.io/rian/app.html',
  cleartext: false,
  allowNavigation: ['accounts.google.com', '*.firebaseapp.com', '*.googleapis.com'],
},
plugins: {
  FirebaseAuthentication: {
    skipNativeAuth: false,
    providers: ['google.com'],
  },
  SplashScreen: { launchShowDuration: 1500, backgroundColor: '#0f1117' },
  Keyboard: { resize: 'body', style: 'dark' },
  StatusBar: { style: 'dark', backgroundColor: '#0f1117' },
}
```

### Native Google Sign-In
Uses `@capacitor-firebase/authentication` v8.2.0 to bypass the WebView OAuth block (disallowed_useragent error). Code in `signInWithGoogle()`:
```js
if (IS_NATIVE && window.Capacitor?.Plugins?.FirebaseAuthentication) {
  const { FirebaseAuthentication } = window.Capacitor.Plugins;
  const result = await FirebaseAuthentication.signInWithGoogle();
  if (result?.credential?.idToken) {
    const credential = firebase.auth.GoogleAuthProvider.credential(result.credential.idToken);
    await auth_fb.signInWithCredential(credential);
  }
  return;
}
```
`IS_NATIVE` flag: `typeof window.Capacitor !== 'undefined'`

### Google Cloud API Keys — CRITICAL
Two separate restriction systems exist — both must include the app's origin:

**Firebase Auth authorized domains** (Firebase Console → Authentication → Settings):
- `morow01.github.io`
- `eir-fieldlog.firebaseapp.com`
- `localhost`

**Google Cloud Browser API key** (used for Firebase JS SDK auth):
- HTTP referrer restrictions must include: `https://morow01.github.io/*`, `http://localhost:3000/*`, `https://eir-fieldlog.firebaseapp.com/*`

**Google Maps API key**:
- Same referrer restrictions as Browser key

If auth or maps breaks after a URL/hostname change → check BOTH the Firebase authorized domains AND the Google Cloud API key referrer restrictions.

### App Icon
- Source: `icon-192.png` (briefcase icon) in the TimeSheet folder
- White background: `android/app/src/main/res/drawable/ic_launcher_background.xml` is a white `<shape>`
- `android/app/src/main/res/values/colors.xml` has `<color name="ic_launcher_background">#FFFFFF</color>`
- All mipmap densities regenerated via Python/Pillow from `icon-192.png`

### TipTap Table CSS Fix (for Android WebView)
```css
:is(#note-fs-editor .ProseMirror, .tt-prose) .tableWrapper {
  overflow-x: auto; display: block; width: 100%; max-width: 100%;
}
:is(#note-fs-editor .ProseMirror, .tt-prose) table {
  border-collapse: collapse; width: 100%; min-width: 100%;
}
:is(#note-fs-editor .ProseMirror, .tt-prose) td,
:is(#note-fs-editor .ProseMirror, .tt-prose) th { min-width: 60px; }
```

### Building the APK
From `C:\Users\morow\Documents\Claude\TimeSheet\` (the project root):
```powershell
node scripts/build-www.js          # copy app files into android assets
npx cap sync android               # sync Capacitor plugins
cd android
.\gradlew assembleDebug            # build APK
```
APK output: `android\app\build\outputs\apk\debug\app-debug.apk`

If Gradle fails with file-lock errors (OneDrive or Android Studio locking files):
```powershell
# Close Android Studio first, then:
Remove-Item -Recurse -Force "app\build"
.\gradlew assembleDebug
```

If `build-www.js` fails with "not a regular file" — a file listed in the script is an OneDrive placeholder (not downloaded). Either download it or remove it from the script's file list.

### Live Update Flow (no APK rebuild needed)
1. Edit `app.html`, bump VERSION
2. `git add app.html && git commit -m "vX.Y.Z — ..."  && git push`
3. GitHub Pages updates in ~1 minute
4. On phone: pull down to refresh (or relaunch app)

### Pending / Known Issues
- **Offline mode**: Service worker is disabled in native mode (`IS_NATIVE` check). App requires internet since it loads from GitHub Pages. Need to implement offline caching for Android separately.
- **Play Store**: Not published, sideloaded via USB or direct APK install.
