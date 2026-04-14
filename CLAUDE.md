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
Current version: **5.5.24**

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

### Voice Table Recorder Key Functions
- `openBatteryRecorder()` — opens modal, resets state, pre-warms mic, unlocks AudioContext
- `closeBatteryRecorder()` — stops audio + mic, restores body scroll
- `_batteryMicToggle()` — start/stop SpeechRecognition (continuous:false)
- `_batteryTextSubmit()` — sends text input to AI
- `_batterySendToAI(text)` — multi-turn chat with Gemini, parses `<state>` block
- `_batterySpeak(text)` — Gemini TTS (model `gemini-2.5-flash-preview-tts`) with browser fallback
- `_batteryPlayPCM(bytes, rate, onEnd, onFail)` — decode + play via Web Audio API
- `_batteryStopSpeaking()` — cancels speechSynthesis, stops active AudioBufferSourceNode
- `_batteryCycleVoice()` — rotates through 9 Gemini prebuilt voices
- `_batteryUpdateProgress()` / `_batteryShowResults()` — UI updates based on mode
- `_batteryBuildCellsHtml` / `_batteryBuildGenericHtml` — table HTML generators
- `_batteryTitleCase(s)` — Title-Case with acronym preservation
- `_batteryInsertTable()` — inserts result HTML at cursor in TipTap

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

### Native Exit Bridge (v5.4.6)
Capacitor's `App.exitApp()` plugin doesn't work when loading from a remote URL (GitHub Pages). Instead, `MainActivity.java` exposes a `RianNative` JavaScript interface:
```java
wv.addJavascriptInterface(new Object() {
    @JavascriptInterface
    public void exitApp() { runOnUiThread(() -> finishAffinity()); }
}, "RianNative");
```
In `app.html`, `_exitApp()` tries `window.RianNative.exitApp()` first, then falls back to Capacitor and `window.close()`. Any change to exit behavior requires an APK rebuild.

### TipTap Table CSS (v5.4.7–5.4.9)
Tables shrink-wrap to content (not 100% width). Column resizing is enabled via `Table.configure({ resizable: true })`. The `_ttStripDefaultTableWidths()` function strips the columnResizing plugin's bloated default `min-width` from tables without user-set column widths. CSS uses `!important` to override the columnResizing plugin's inline styles that re-expand tables on click/blur.
```css
:is(#note-fs-editor .ProseMirror, .tt-prose) .tableWrapper {
  overflow-x: auto; display: inline-block; max-width: 100%;
}
:is(#note-fs-editor .ProseMirror, .tt-prose) table {
  border-collapse: collapse; width: auto !important; min-width: unset !important;
}
:is(#note-fs-editor .ProseMirror, .tt-prose) td,
:is(#note-fs-editor .ProseMirror, .tt-prose) th { min-width: 60px; }
```
`_ttStripDefaultTableWidths()` runs on both `onUpdate` and `onSelectionUpdate` to catch the plugin re-applying styles.

### WebView Microphone Permission (v5.4.10)
`MainActivity.java` sets a custom `WebChromeClient` that auto-grants `onPermissionRequest` — required for mic access when loading from a remote URL. The Android manifest declares `RECORD_AUDIO`. Without the WebChromeClient override, the WebView silently blocks mic requests.

### PWA Back Button (v5.4.10)
On Android standalone PWA, the system back gesture exits the app if the history stack empties. The app traps `popstate` and re-pushes a history entry *before* calling `_handleBackButton()`, so the stack never runs dry. Only one seed entry is needed at init since popstate always replenishes.

### Offline Support via Service Worker (v5.4.11)
Service worker registration (in app.html init) no longer skips native mode. Same `sw.js` serves both PWA and APK — network-first, cache fallback. First launch online installs the cache; later launches work offline. Data sync (Firestore) still requires internet, but cached IndexedDB data loads.

### WebView Media Autoplay (v5.5.17)
`MainActivity.java` sets `webView.getSettings().setMediaPlaybackRequiresUserGesture(false)` — needed so Gemini TTS audio can play after the async fetch completes (the user-tap gesture context is lost by then). Without this, audio silently fails in APK even though it works in PWA.

### Voice Table Recorder (v5.5.0–5.5.24)
Green battery-icon button in the TipTap fullscreen header (next to mic) opens `#battery-modal`. Conversational AI built on Gemini for voice-to-table capture. Two modes:
- **battery**: user says "battery with 24 cells" → AI walks through cells 1..N + overall voltage → outputs 4-column Cell/Volts/Cell/Volts table.
- **generic**: user lists fields like "rectifiers, DC load, boost voltage, temperature" → AI asks each → outputs 2-column key-value table with title header (e.g. "VALUES", "ALARM LIMITS").

Key implementation details:
- State tracked via hidden `<state>{...}</state>` JSON block at end of each AI reply (stripped from visible text).
- `_batteryChat.complete` only set when AI's visible message literally contains "All done" AND `nextAsk === 'complete'` — prevents premature finish during clarification questions.
- Field names Title-Cased at render time (`_batteryTitleCase()`), preserving short all-caps acronyms (DC, AC, UPS).
- TTS via Gemini `gemini-2.5-flash-preview-tts` model with "Puck" (male) default voice; 9-voice picker in modal header, persisted in localStorage. On HTTP error/timeout → 30 s backoff then falls back to browser `speechSynthesis` (male voice + pitch 0.7). Fallback picks Ryan/David/Daniel/Alex etc., never explicitly female voices.
- Audio played via Web Audio API (`AudioContext.createBufferSource` on decoded 24kHz mono 16-bit PCM) — more reliable in Android WebView than `<audio>` blob URLs. AudioContext unlocked in `openBatteryRecorder()` during the user tap.
- Mic: `SpeechRecognition` with `continuous: false`. Pre-warmed once in `openBatteryRecorder` (briefly `start()` then `stop()`) to satisfy user-gesture rule so subsequent `recognition.start()` calls within the session work without a fresh tap.
- After AI finishes speaking, mic auto-opens (hands-free flow).
- Text input alongside mic in single row — submits via Enter or Send button. Calling `inp.blur()` before sending prevents focus issues that previously broke the mic click target.
- Modal locks body scroll via `document.body.style.overflow = 'hidden'` so the note page behind doesn't move.
- "Insert into note" pipes the generated HTML into `_tiptapEditor.chain().focus().insertContent(html + '<p></p>').run()`.

### Building the APK
From the project root (`C:\Users\morow\OneDrive\Vibe Code\TimeSheet\`):
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
