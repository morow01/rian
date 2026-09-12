# Rian — Project Context for Claude

## What is Rian
A Progressive Web App for field technicians — timesheets, notes (TipTap rich text), site finder, routines, callouts/on-call scheduling, and AI assistant. Single-file architecture (`app.html`, ~32,000 lines) with Firestore sync, IndexedDB offline cache, and Google Apps Script backend.

## Key Files
- `app.html` — the entire app (HTML + CSS + JS, inline). This is the only file you'll edit 99% of the time.
- `index.html` — production landing page
- `Code.gs` — Google Apps Script backend
- `manifest.json` — PWA manifest
- `functions/` — Firebase Cloud Functions (reminders)
- `.git/hooks/pre-commit` — local-only integrity check for 31 critical element IDs (not committed, create locally if needed)
- `capacitor.config.ts` — Capacitor Android wrapper config
- `android/` — Android project (Capacitor-generated, do not hand-edit except resources)
- `scripts/build-www.js` — copies app files into `android/app/src/main/assets/public/`

## Version
`const VERSION = 'x.y.z'` in `app.html` (~line 18699). Bump on every change. Only location that needs updating (index.html version references are static).
**Patch (z) must not exceed 99.** When a bump would take it to 100, bump the minor version instead and reset patch to 0 (e.g. `6.7.99` → `6.8.0`, never `6.7.100`). 6.7.100–6.7.102 already broke this rule and were left as-is rather than rewriting pushed history — the rule applies from 6.8.0 onward.
Current version: **6.8.41**

**12 themes active**: `claude` (default light), `dark` (slate-based), `champagne`, `champagne-dark`, `ios`, `apple` (macOS), `gray` (Grayscale), `gameboy` (Game Boy), `win31` (Win 3.1), `lcd` (LCD), `spectrum` (ZX Spectrum), `retro` (Retro). Theme picker lives in ☰ menu → Display. Switcher at `setTheme(key)`, registry at `THEME_META`.

**Variable system**: `:root` defines all structural tokens; `[data-theme="dark"]` overrides them. Includes RGB triples (`--accent-rgb`, `--priority-high-rgb`, `--priority-low-rgb`, `--priority-medium-rgb`, `--amber-rgb`, `--shadow-rgb`, `--shadow-brand-rgb`) so any opacity tint becomes themable via `rgba(var(--X-rgb), opacity)`.

**Dark theme palette** (key values):
- `--bg-page: #0f1624` / `--bg-header: #090e1c`
- `--bg-card: #1e293b` / `--bg-card-alt: #273449`
- `--bg-input: #171f2d` / `--bg-code-group: #141c2b`
- `--bg-segment-active: #273449` (active pill in segmented controls — light: `#fff`, dark: `#273449`)
- `--accent: #4d94ff` in dark
- `color-scheme: dark` applied to `input[type="date/time/datetime-local"]` for visible calendar icon

**Segmented control pattern** (`--bg-code-group` container + `--bg-segment-active` active pill):
- Used in Notes tab bar (Active | Archive | Bin), Finder tab bar (Exchanges | Cabinets), and Routines mobile tab bar (Grid | Stats | Due)
- Container: `border-radius: 14px`, `padding: 3px`, `gap: 2px`. Buttons: `border-radius: 11px`, `padding: 7px 4px`, `font-size: 12px`, `font-weight: 700`
- Previously `--bg-card` was used for active pill — caused invisible pill in dark mode since both were `#1e293b`

**Border standard** (enforced v5.6.40): ALL borders and outlines throughout the app are `1px`. There are zero `1.5px` borders remaining. Do not introduce `1.5px` for new elements.

**Border-radius standard** for activity card fields: `12px` on `.act-textarea`, `.act-input`, `.act-codes-wrap`. Chips/pills inside containers use `8px`.

**Remaining hardcoded values** (intentional — should stay):
- `color: #fff` — white text on coloured buttons
- Brand indigo/purple `#818cf8`, `#7c3aed` — accent colours
- Status dark-text variants `#15803d`, `#b91c1c`, `#854d0e`, `#D97706`, `#F59E0B` — semantic colours
- SVG `fill=`/`stroke=` inside icons — visual identity
- Email/preview HTML (`buildEmailHtml`, `buildPreviewHtml`) — sent to external mail clients with fixed palette

**Adding new themes**: copy the `[data-theme="dark"]` block, rename, change variable values, register in `THEME_META`. No code changes needed in switcher.

## Git
- Remote: `https://github.com/morow01/rian.git`, branch: `main`
- Commit style: `vX.Y.Z — Short description of what changed`
- **Every commit carries the version prefix — including docs-only, rules-only and revert commits.** GitHub's Deployments page labels each deployment with the commit subject, so a commit without a version leaves the *live* deployment showing no version at all. For a commit that doesn't change `VERSION`, prefix it with whatever `VERSION` currently is in `app.html`.
- Pre-commit hook checks 31 critical HTML element IDs exist. If commit is blocked, an element was accidentally deleted — fix before committing.
- GitHub Pages URL: `https://morow01.github.io/rian/app.html`

## Architecture Decisions

### Firestore Sync & Data Protection (v4.35.39–v5.6.99)
The app syncs week data, notes, callouts, and reminders with Firestore in real-time via `onSnapshot` listeners.

**CRITICAL RULE (v5.6.93+): The `onSnapshot` handler must NEVER call `fsSetWeek()`.** Writing to Firestore inside a snapshot handler creates snapshot→write→snapshot infinite loops that cause UI flashing, render storms, and sync wars across devices. All data writes must happen through user-initiated actions (`scheduleAutoSave`, conflict resolution, etc.), never as a reaction to incoming snapshots.

**Auto-dedup (v5.6.94+):** Activities with identical content (description + workCode + ordinary + overtime) are automatically deduplicated on every load path — IndexedDB cache load, Firestore snapshot, and conflict resolution. This replaced the old regression guards as the primary data protection mechanism.

**Draft system:** `createActivity()` sets `_draft: true`. `scheduleAutoSave` strips drafts before saving. Copy/move operations delete the `_draft` flag so copied tasks auto-save immediately (v5.6.99).

**Disabled guards (v5.6.96–v5.6.97):** The following guards were removed because they caused cascading sync wars when HWM values were inflated by a duplicate bug. Do NOT re-introduce them:
- Inbound HWM regression guard (rejected remote data with fewer hours than HWM)
- Inbound activity-count regression guard (rejected remote data with fewer activities)
- Inbound stale-timestamp push-back (wrote local data back to Firestore when remote was older)
- Outbound HWM guard in `fsSetWeek` (blocked saves and registered infinite conflict loops)

**Still active:**
- `hasPendingWrites` guard — skips snapshots that echo our own pending writes
- `_snapWriteBackCooldown` — 5s cooldown after any snapshot-triggered write (safety net)
- `_loadWeekInProgress` flag — prevents overlapping async `loadWeek()` calls
- Ghost task removal — strips empty activities locally on snapshot (does NOT write back)
- `executeCopyTask._running` — re-entrancy guard prevents double-execution of copy/move
- Callouts HWM — tracks max callout entry count (`rian_co_hwm`). Threshold is 2 entries.

**Notes Merge:** Per-note merge using `updatedAt` timestamps. Local-only notes preserved for 2 minutes (not synced yet). Empty remote never overwrites non-empty local.

**Reminders Merge:** Per-reminder merge (keeps newer version). Local-only reminders preserved.

**Snapshots:** Auto-snapshots taken on every save to `users/{uid}/weeks/{weekStart}/snapshots/`. Include notes, callouts, and reminders as `_callouts`, `_notes`, `_reminders` fields. User can restore from ☰ → Cloud Backups.

### backdrop-filter Containing Block (v5.6.89)
CSS `backdrop-filter` creates a new containing block for `position: fixed` descendants (same spec rule as `transform`, `will-change`, `filter`, `perspective`). This caused modals (Copy picker, Add to Notes, Task picker) to appear at the bottom of the page instead of as proper overlays when `backdrop-filter: blur(3px)` was on a parent wrapper div. Fix: apply `backdrop-filter` to the `.xxx-overlay` element (which IS the fixed-position overlay), not to the wrapper div that contains fixed-position children.

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
`--accent: #2D6BE4`, `--bg-card`, `--bg-card-alt`, `--bg-input: #F4F7FA`, `--border`, `--text-primary`, `--text-secondary`, `--text-muted`, `--font-mono` (DM Mono).

**Theme state**: All 12 themes are fully working. `initTheme()` reads localStorage and applies the saved theme on load. Theme picker in ☰ → Display. Each theme defines a `[data-theme="name"]` block with full CSS variable overrides. `setTheme(t)` sets `data-theme` on `document.documentElement`.

**Theme-aware TipTap tables (v5.8.84+):** Non-default themes strip inline `background-color` from table cells inside ProseMirror editors with `!important`, replacing with `var(--table-header-bg)` for `<th>` and `transparent` for `<td>`. This prevents hardcoded white/gray backgrounds from clashing with themed UIs.

**Journal editor background (v5.8.85+):** `.dj-editor` uses `var(--bg-card)` — previously was hardcoded `#fff` with only a dark theme override, causing white editor backgrounds on all non-dark themed views.

## Notes Section — UX decisions
- **Tab bar** uses a pill/segmented control (not underline tabs): `Active | Archive 3 | Bin 22`
  - "Active" (not "Notes") avoids the duplicate "Notes" label — top nav already says NOTES
  - Archive count badge: amber. Bin count badge: red.
- **Notes icon** in top nav: folded-corner document with 3 content lines (not the old bookmark/tag shape)
- **NOTES field label** added in activity card above the TipTap inline note (`+ Add a note…`)
- All field labels use `.act-field-label` class (10px, 800 weight, uppercase, `--text-muted`)

## Desktop Mode (v5.8.0+)
Desktop layout activates at `min-width: 1280px` via `_isDesktop()`. Mobile layout unchanged below that breakpoint.

### Timesheet — Three-Panel Layout
- **Left panel (260px)**: Day selector with date, day name, hours summary, task count badge. Collapsible Weekly Summary at bottom (v5.8.86+) — reuses all mobile `sum-*` CSS classes with percentage bars, ORD/OT columns, Total footer, and chevron toggle.
- **Middle panel (381px)**: Task list for selected day with Add Task button (top if empty, bottom if tasks exist)
- **Detail panel (flex)**: Full task editing — description, notes (TipTap inline), location, work codes, hours, action buttons

Key functions: `_renderDesktopTimesheetView()`, `_renderDeskTasks(di)`, `_renderDeskDetail(di, actId)`, `deskSelectDay(di)`, `deskSelectAct(id)`, `deskAddTask(di)`

State: `deskSelectedDay` (day index), `deskSelectedAct` (activity ID)

CSS classes: `.desk-three-panel`, `.desk-panel-days`, `.desk-panel-tasks`, `.desk-panel-detail`, `.desk-card-wrap`, `.desk-sel-wrap`, `.desk-add-task-btn`, `.desk-detail-actions`, `.desk-detail-btn`

Selection pattern: gradient `linear-gradient(to right, rgba(var(--accent-rgb), 0.10), rgba(var(--accent-rgb), 0.03))` with `border-left: 3px solid var(--accent)`.

### Notes — Three-Panel Layout B
- **Sidebar (200px)**: Active/Archive/Bin nav buttons, category tag filters with colored dots
- **Notes list (380px)**: Search bar, "New Note" button (dashed, same as Add Task), scrollable note rows
- **Editor panel (flex)**: Description, Notes content (TipTap preview with custom scroll indicator), Location, Date, Due Date, Reminder, Priority dots, action buttons (Mark Done, Archive, Delete)

Note list rows reuse mobile classes: `note-row-top`, `note-dot`, `note-row-title`, `note-row-meta`, `note-meta-item`, `note-meta-icon`, `note-pin-btn`, `note-cat-badge`. Includes bell icon, due date tag, location+date row — matching mobile exactly.

Draft notes show Save + Discard buttons instead of the regular action bar.

Content preview: `dnotes-note-content-area` with inner `.dnotes-content-scroll` div. Native scrollbar hidden; uses same custom round-dot `note-inline-thumb` indicator as mobile via `_updateInlineNoteThumb()`.

**Tag selector in list column (v5.9.6+):** Tag badge sits in the meta row of each note row (not the detail panel). Clicking it opens/closes a tag pill menu directly. No tag → shows `note-ghost-pill` placeholder (`+ Add tag`), hidden when note is not selected (`.dnotes-ghost-visible` class added when `isSel`). Tag menu renders as `position: absolute` overlay (`.dnotes-tag-menu`) on `.dnotes-note-row` (which has `position: relative`) so it overlays rows below without pushing them down. "Edit Tags" button hidden on desktop (`!_isDesktop()` guard in `buildNoteCatMenuHtml`) — use Tag Manager in sidebar instead. Tag menu padding applied to `.dnotes-tag-menu .ncm-pills` (`12px 14px 8px`) and `.dnotes-tag-menu .ncm-action-row` (`margin: 0 10px 10px`).

**Journal rename guard (v5.9.2+):** `loadJournal()` onSnapshot handlers check `!state.jEditId` before calling `render()` — prevents the rename bottom sheet from being destroyed while the user is typing.

**TipTap table block display (v5.9.3+):** `.tableWrapper` uses `display: block; width: fit-content` instead of `display: inline-block` so headings/text do not flow alongside tables.

Key functions: `_renderDesktopNotes()`, `deskSelectNote(id)`, `deskNotesTab(tab)`, `deskNotesCatFilter(key)`, `deskNotesNew()`, `deskRefreshNotesList()`, `toggleNoteCatDD(noteId)`, `buildNoteCatMenuHtml(noteId, catKey)`

State: `deskSelectedNote`, `deskNotesCatFilter`

CSS: `.dnotes-wrap`, `.dnotes-sidebar`, `.dnotes-list`, `.dnotes-editor`, `.dnotes-note-row`, `.dnotes-tag-menu`, `.dnotes-ghost-visible`

### Desktop Navigation
Top tab nav bar replaces bottom mobile nav. `desk-tab-nav` with horizontal buttons. Mobile bottom-nav hidden via `display: none !important` at 1280px+.

`renderCardView()` intercept: `if (_isDesktop()) return _renderDesktopTimesheetView();`
`renderNotesView()` intercept: `if (_isDesktop()) return _renderDesktopNotes();`
`renderExchangesView()` intercept: `if (_isDesktop()) return _renderDesktopFinder();`
`renderCalloutsView()` intercept: `if (_isDesktop()) return _renderDesktopCallouts();`
`renderRoutinesView()` uses `if (_isDesktop())` inside the function to branch layout.
Journal (`renderJournal()`) uses `if (_isDesktop())` inside the function.

### Routines — Desktop Dashboard (v5.8.36+)
Two-column grid: main table card (left, flex) + sidebar (right, 340px). Sidebar contains stats (2×2 grid), Visits per Month bar chart, Never Visited list, Due Visits list (sites not visited in 3+ months), and Recent Visits (scrollable, max 340px).

CSS: `.rtn-dash` (grid container), `.rtn-dash-card`, `.rtn-dash-sidebar`, `.rtn-stats-bar`, `.rtn-recent-card`, `.rtn-recent-scroll`, `.rtn-due-scroll`

### Routines — Mobile Tab Switcher (v5.8.44+)
Mobile view uses a segmented tab bar (Grid | Stats | Due) matching the Notes tab bar pattern exactly. Grid tab shows the site×month table edge-to-edge (no horizontal padding). Stats and Due tabs have `16px` side padding.

Shared stats variables (`monthTotals`, `visitCount`, `coverage`, `neverVisited`, `recentVisits`, `dueVisits`, `dueHtml`, `neverHtml`, `recentHtml`, `maxMonthTotal`, `monthBarHtml`) are computed BEFORE the `if (_isDesktop())` check so both desktop and mobile paths can access them.

Key function: `rtnMobTab(id, btn)` — switches active tab content.

CSS: `.rtn-tab-bar`, `.rtn-tab-btn`, `.rtn-tab-badge`, `.rtn-tab-content`, `.rtn-mob-stats`, `.rtn-mob-stat`, `.rtn-mob-card`, `.rtn-mob-month-bar`, `.rtn-mob-recent-scroll`

Shared list styles (used by both desktop sidebar and mobile tabs): `.rtn-alert-item`, `.rtn-alert-dot`, `.rtn-alert-name`, `.rtn-alert-detail`, `.rtn-recent-item`, `.rtn-recent-badge`, `.rtn-recent-info`, `.rtn-recent-name`, `.rtn-recent-date`, `.rtn-month-bar`, `.rtn-month-col` — defined globally, NOT inside a media query.

**Map tab blank after returning from note editor (v6.8.6 fix):** The Map tab (`state.rtnMobTab === 'map'`) renders a Leaflet instance into `#rtn-map`, built by `_rtnInitMap()`. Any `_renderNow()` call rebuilds the routines view HTML from scratch — including a brand-new empty `#rtn-map` div — so the Leaflet canvas is discarded every render, not just when its own tab button is clicked. Only clicking Grid/Stats/Map explicitly called `_rtnInitMap()` again; nothing did on a *passive* re-render, e.g. closing the TipTap note editor for a site's notes (opened from a map marker popup) and landing back on Routines with the Map tab still marked active from `state.rtnMobTab` — result: white background where the map was, until manually toggling to Grid/Stats and back to Map. The desktop equivalent (`_rtnDeskPanel === 'map'`) already had a re-init hook in the shared post-render block in `_renderNow()`; mobile had no equivalent. Fixed by extending that same hook to also check `state.rtnMobTab === 'map'` on mobile.

**Follow-up (v6.8.7) — fixed re-init lost zoom/pan.** The v6.8.6 fix above made the map reappear, but `_rtnInitMap()` always called `setView([53.0, -8.0], 7)` (the default Ireland-wide view) on every rebuild, so each re-render — not just the note-editor round trip — reset whatever zoom/pan the user had. Fixed with a module-level `_rtnMapLastView` (`{center, zoom}`), captured right before the old Leaflet instance is torn down and also kept live via a `moveend` listener (covers ordinary panning/zooming, not just the teardown moment), and used as the new map's initial view when present.

**Due Visits site names are Google Maps links (v6.8.14):** Each site name in the `dueHtml` list (`.rtn-alert-name`, shared by desktop sidebar + mobile Stats tab) is wrapped with `onclick="_openUrl(...)"` when `_rtnSiteCoords(d.site)` resolves coordinates, styled via the new `.rtn-alert-link` modifier (accent colour, dotted underline, pointer cursor). Sites with no resolvable coordinates render as plain text, same as before. The "Never Visited" list (`neverHtml`) was left untouched — same pattern would apply there if wanted later. Mobile's "Action Items" section divider (above Due Visits / Never Visited) renamed to "Needs Attention" for a clearer, non-generic label.

### Callouts — Desktop Three-Panel Layout (v5.8.52+)
Three-panel layout (Weeks → Callouts → Detail) matching Timesheet pattern. Accessed via ☰ menu → Callouts (not in the top desktop tab nav).

- **Left panel (280px)**: Stats 2×2 grid (On-Call Weeks, Extra Shifts, Total Incidents, Avg/Week), "Schedule" button, Current/Previous week rows
- **Middle panel (360px)**: Callouts list grouped by date, "Paste Fault" button, "+ Add Callout" dashed button
- **Detail panel (flex)**: "CALLOUT DETAILS" header, callout header (blue badge + fault + location/ticket), form fields (Date, Ticket Number, Location, Fault Description, Notes), action buttons. "Engineer On Site" field removed from all callout UIs in v6.6.10 (`engineerOnSite` kept in the data model for old records, no longer displayed or editable)

Detail panel reuses Timesheet CSS classes: `desk-detail-body`, `desk-detail-header`, `desk-detail-form`, `desk-field-group`, `desk-detail-actions`, `desk-detail-btn`.

**Draft system (v5.8.64+):** `dcoAddCallout()` sets `_draft: true`. Draft callouts show Save/Discard buttons (matching Timesheet draft pattern). `dcoUpdateField()` skips `_coScheduleSave()` for drafts. `saveCallouts()` strips `_draft` entries before writing to Firestore. `dcoSaveDraft()` removes draft flag and saves. `dcoDiscardDraft()` removes the callout entirely.

Week list filtering: only shows weeks with actual callouts OR past/current on-call weeks (not future scheduled). Uses `_ocIsPast(k)` filter. Current week always rendered first under "Current" header.

Key functions: `_renderDesktopCallouts()`, `dcoSelectWeek(wk)`, `dcoSelectCo(coId)`, `dcoAddCallout()`, `dcoUpdateField(field, value)`, `dcoDeleteCallout()`, `dcoSaveDraft()`, `dcoDiscardDraft()`, `dcoOpenNoteFs()`

State: `dcoSelectedWeek`, `dcoSelectedCo`

CSS: `.dco-wrap`, `.dco-panel-weeks`, `.dco-panel-callouts`, `.dco-panel-detail`, `.dco-stats`, `.dco-stat`, `.dco-week-row`, `.dco-co-row`, `.dco-detail-hdr`

### Callouts — Mobile "Upcoming Weeks" section (v6.7.99 fix)
`renderCalloutsList()` (mobile, distinct from the desktop three-panel view above) builds one deduplicated week set (`allPastKeys` — badly named, it's not past-only) and splits it into `upcomingWeeks`/`previousWeeks` by comparing to the current week key. A scheduled-but-not-yet-logged future on-call week has no entry in `state.callouts.weeks`, so it can only reach that set via the `Object.keys(onCall)` loop. That loop had an `&& _ocIsPast(wk)` guard — copied from (or shared reasoning with) the desktop view's deliberate "hide future scheduled weeks" behavior above — which made it impossible for any future week to ever enter the set, so the `upcomingWeeks` variable and its "Upcoming Weeks" rendering section (both still fully implemented) were permanently dead for the normal case. Removed the guard on mobile only; desktop's `_ocIsPast(k)` filtering is untouched and still intentional there.

**Upcoming/Previous toggle (v6.7.100):** now that upcoming weeks actually populate, the two lists are behind a segmented toggle instead of stacked, with a count badge on each. `state.calloutsWeekTab` ('upcoming' | 'previous', defaults to 'previous', not persisted — matches `notesTab`'s in-memory-only pattern). Switcher: `coSwitchWeekTab(tab)`.

Height iterated twice on user feedback: v6.7.101 first matched Finder's taller Exchanges/Cabinets bar (a separate Tailwind-styled component, `flex p-1 rounded-xl` / `flex-1 py-2 px-4 rounded-lg text-sm font-bold`, ≈39px measured) since that's what the user pointed at initially; a follow-up message asked to match the Notes Active/Archive/Bin bar instead, so v6.7.102 uses the shared `.seg-bar`/`.seg-btn` component directly (≈34px measured) — same component Notes/Routines/History already use, so no new CSS.

`renderCalloutsView()` intercept: `if (_isDesktop()) return _renderDesktopCallouts();`

`pasteTicketCreate()` sets `state.dcoSelectedWeek` and `state.dcoSelectedCo` on desktop so pasted callouts appear in the detail panel immediately.

**On-Call Schedule edit mode (v6.6.12+):** The schedule grid is locked by default — tapping a cell shows a toast. "Edit Schedule" (`ocStartEdit()`) copies `state.callouts.onCall` into `state.ocScheduleDraft`; `ocCellTap()` cycles blank → oncall → extra → blank on the draft. Changed cells get `.oc-pending` (1px dashed outline). `ocSaveEdit()` shows ONE confirm summarising adds/removes/changes, then commits + `_ocSave()`. `ocCancelEdit()` discards. `ocCloseSchedule()` confirms discard if unsaved changes exist. The old tap-confirm + long-press-for-extra handlers (`ocToggle`, `ocToggleExtra`, `ocCellTouch*`, `ocCellMouse*`) were deleted. Colour legend row (`.oc-legend`) sits under the year nav. State keys: `ocScheduleEditing`, `ocScheduleDraft`.

### Finder — Desktop Two-Panel Layout (v5.8.77+)
Two-panel layout: search list (left, 320px) + wide detail (right, flex).

- **Left panel (320px)**: "FINDER" header, Exchanges/Cabinets segmented tab bar, search input, results list with 40px badges (matching Timesheet day badge style using `var(--date-badge-bg)`)
- **Right panel (flex)**: "DETAILS" header, exchange name + subtitle, 7 detail tabs (Location, Details, Address, Security, Power, Emergency, Additional), content area. Location tab: two-column grid (fields left + Google Map right). Other tabs: 3-column field grid.

**Search behavior (v5.8.80+):** `dfndSearch()` updates `#dfnd-results` innerHTML in-place via `_dfndBuildListHtml()` helper — does NOT call `render()`. This preserves search input focus. When search is empty: shows only the selected item (if any) + "Type to search..." prompt. No browse list on initial load.

**List panel height (v5.8.81+):** `.dfnd-wrap` has `height: calc(100vh - 90px)` with `overflow: hidden`. The `#dfnd-results` div has `flex:1;overflow:auto` with a thin accent-colored scrollbar.

Key functions: `_renderDesktopFinder()`, `_dfndBuildListHtml()`, `dfndSetTab(tab)`, `dfndSearch(val)`, `dfndSelect(id)`, `dfndSetDetailTab(tab)`

State: `selectedExchange`, `selectedCabinet`, `exchangeTab`, `exchangeDetailTab`

Module-level: `_dfndSearch` (search text, not in state to avoid render cycles)

CSS: `.dfnd-wrap`, `.dfnd-panel-list`, `.dfnd-panel-detail`, `.dfnd-panel-hdr`, `.dfnd-search-wrap`, `.dfnd-item`, `.dfnd-selected`, `.dfnd-badge`, `.dfnd-detail-grid`

`renderExchangesView()` intercept: `if (_isDesktop()) return _renderDesktopFinder();`

### Desktop Tag Manager (v5.8.69+)
On desktop, Tag Manager opens inside the Notes editor panel (not as a fullscreen modal). Two-column grid layout: Built-in tags (left) + Custom tags (right). "New Tag" button opens a modal popup with blur overlay. Hidden from hamburger menu on desktop (accessible only via Notes sidebar).

### Desktop Weekly Summary (v5.8.86+)
Desktop Timesheet days panel uses the exact same Weekly Summary as mobile — reuses all `sum-*` CSS classes. Shows code, description, percentage bars, ORD/OT columns, and Total footer. Collapsible via chevron toggle button, shares `state.showSummary` with mobile (v5.8.87+). v5.8.89 adds the `sum-section-hdr` divider ("WEEKLY SUMMARY" between two horizontal lines) above the card to match mobile.

### Desktop Weekend Collapse (v5.8.88+)
Desktop Timesheet days panel now mirrors mobile's weekend collapse: when both Sat and Sun are empty, they collapse behind a "› WEEKEND" divider. Shares `state.weekendOpen` and `toggleWeekend()` with mobile, so the open/closed state syncs across views. Auto-expands when a weekend day is the currently selected day (`state.deskSelectedDay === 1 || 2`).

### Copy/Move Task Picker Fixes (v6.8.17–v6.8.23)
Fixes to the Copy/Move task bottom sheet (`copyPickerState`, `renderCopyPicker()`, `buildCopyPickerDaysHtml()`, `executeCopyTask()` — ~line 31271):

- **"Copying…" showed even in Move mode (v6.8.17).** `executeCopyTask()` hardcoded the in-flight button label regardless of `copyPickerState.moveMode`. Now picks `'Moving…'` vs `'Copying…'` based on it.
- **"Moving…"/"Copying…" could hang forever (v6.8.18).** Reported hang was very likely the pre-existing `fsSetWeek()` hang risk (see Firestore Sync section) surfacing through this specific path: `executeCopyTask()` awaits `saveWeekNow()` (current-week changes) and, for cross-week copies, `fsSetWeek(ws, weekData)` directly — neither had any timeout, and a `.catch()` on the latter doesn't help against a promise that never settles (only one that rejects). Both are now raced against a 15s timeout; local data is already safe by that point (IndexedDB writes happen before the Firestore call in both paths), so timing out just closes the sheet — the cloud write is left for the normal sync machinery to retry once connectivity allows.
- **Still slow even capped at 15s — "why does it take 10 seconds?" (v6.8.19).** The 15s cap in v6.8.18 was never the point of the 10s duration — `fsSetWeek()` itself does 2-5 *sequential* Firestore round trips per week touched (merge fetch, write, verify read, possibly a retry of both), and `executeCopyTask()` was awaiting all of that before closing the sheet. Every other edit in the app (`scheduleAutoSave()`) never blocks the UI on its own Firestore write, so this was the odd one out. Restructured: the in-memory `state.weekData` mutation (add/remove activity) is fully synchronous, so the sheet now closes, re-renders, and shows the success toast immediately after that — the entire persistence step (`saveWeekNow()` + the cross-week `dbGet`/`dbPut`/`fsSetWeek` loop, still timeout-capped from v6.8.18) runs afterward in a fire-and-forget async IIFE. The toast's day-count now reports `selectedDates.size` optimistically instead of waiting for confirmed pushes; the old "actual vs expected push count" mismatch sanity check still runs, just console-only now (it was already a "should never happen" defensive check, not normal-flow feedback).
- **Collapsible Weekend (v6.8.23):** Saturday and Sunday collapse behind a "› Weekend" divider (`.weekend-divider` + `.wk-collapse`), matching Timesheet. Smooth CSS grid transition with animated rotating chevron, auto-opens when a weekend day is selected or is the source day, and toggles smoothly via `toggleCopyPickerWeekend()`.

### Note Conflict Dialog — "Return to editor" (v6.8.24+)
When a note or task note has remote changes during fullscreen TipTap editing (`closeNoteFullscreen()`), the conflict dialog now offers a dedicated "Return to editor" option alongside "Keep cloud version" and "Save mine". Clicking "Return to editor", pressing ESC, or tapping the overlay backdrop immediately returns to the editor with all unsaved text edits and cursor position intact without closing or discarding. `showRianDialog()` updated to support `cancelValue` and `value` on `extraBtns`.

### TipTap Fullscreen Editor — Separate "Close" and "Save" (v6.8.25+)
TipTap fullscreen header buttons changed from "Cancel / Save" to "Close / Save":
- **Save (`saveNoteFullscreen()`)**: Saves note data immediately to Firestore & local storage with "Saved!" flash feedback and toast without closing the editor, so users can save intermediate progress and keep writing.
- **Close (`closeNoteFullscreen()`)**: Closes the editor cleanly. If there are unsaved edits since the last save, prompts with "Discard changes?"; if already saved (clean), closes immediately without prompt.

### Header Icon Hover & Unified Modal Open Animations (v6.8.26+)
- **Header Icon Buttons (`.hist-icon-btn`)**: Added smooth interactive hover & active transitions across Callouts, Week History, and Availability headers (accent glow, border tint, scale feedback).
- **Unified Modal Animations**: Unified the opening behaviors of "On-Call Schedule" and "Week History" Select Week / Jump modals:
  - Mobile: Both slide up smoothly from the bottom with `sheetUp` transition, backdrop blur (`backdrop-filter: blur(2px)`), and dim backdrop.
  - Desktop: Both display as centered modal dialogs with smooth backdrop fade (`overlayIn`), pop-in scale animation (`rdn-pop`), and soft elevated box-shadows.

### goToFaultDay Desktop Selection (v5.8.90+)
`goToFaultDay(dateStr, actId)` (used by Routines "Open day" button and AI Fault Assistant) now sets `state.deskSelectedDay` and `state.deskSelectedAct` when on desktop, so the three-panel layout drills into the right day + task instead of just landing on the week. Mobile path (`expandedDays`, `activitiesExpanded`, `notesOpen`) unchanged.

### Universal ESC Handler (v5.8.91+)
Single global `keydown` listener closes the topmost open modal/sheet on ESC. Walks a priority-ordered stack via `_isModalShown(id)` (checks `.hidden` class, computed display/visibility, inline style, offsetParent). First match wins — calls the modal's specific close function (e.g. `closeBatteryRecorder`, `closeNoteFullscreen`, `closeFaultAssistant`, `closePasteTicket`, etc.), then `oc-schedule-overlay` and `state.isMenuOpen` as final fallbacks. Safe to add new modals to the stack — bug-tolerant via `try/catch` and `typeof === 'function'` guards. Lives near line 29435 next to the older notes-modal-only ESC handler (kept for compatibility).

### Journal Desktop — Notebook Highlighting & Empty Notebook Fix (v5.9.28–5.9.31)
Clicking a notebook in the left column now highlights it (accent left-border gradient) and deselects any active section. Clicking a section deselects the notebook highlight. Three separate code paths all needed updating:

- **Render-time `secDisabled`**: checks `state.djActiveNb` first (before falling back to selected section's notebook). This allows empty notebooks (no sections) to serve as the "Add Section" target.
- **Auto-select guard**: `if (!state.djSelectedSec && !state.djActiveNb && allNbs.length)` — the `!state.djActiveNb` condition prevents auto-selecting the first section when a notebook was just clicked.
- **`djToggle(id)`**: sets `state.djActiveNb = id`, clears `state.djSelectedSec` and `state.djSelectedPage`.
- **`djSelectSec(secId)`**: clears `state.djActiveNb = null`.
- **Active CSS**: `.dj-nb-row.active` uses `isNbActive = state.djActiveNb === nb.id && !state.djSelectedSec`.

**`+` dropdown letter-spacing fix**: `.dj-add-dropdown` inherits `letter-spacing: 0.1em; text-transform: uppercase` from the NOTEBOOKS header. Fixed by adding `letter-spacing: normal; text-transform: none` to `.dj-add-dropdown`.

### Journal Desktop — Context Menu Popover (v5.9.32–5.9.35)
`djCtxMenu(e, type, id)` — unified right-click context menu popover for notebooks, sections, and pages. Injects a `div.dj-ctx-menu` into `document.body` at cursor position. Handles three types:
- `'nb'`: Rename, Delete
- `'sec'`: Rename, Change Colour…, Delete
- `'page'`: Rename, Copy/Move, Change Date, Delete

Closes on next click/right-click via one-shot `document.addEventListener('click', ...)`. `djCloseCtx()` removes the menu from DOM. Mobile still uses the existing bottom sheet action menus (`jOpenNbAction`, `jOpenSecAction`, `jOpenPageAction`).

CSS: `.dj-ctx-menu` (fixed position, `z-index:9500`, box shadow, 180px min-width), `.dj-ctx-menu button` (full-width, hover highlight), `.dj-ctx-menu .danger` (red text), `.dj-ctx-sep` (1px divider).

### Journal Desktop — Centered Modals Replacing Bottom Sheets (v5.9.36)
On desktop, the four mobile bottom-sheet dialogs now render as centered `position:fixed` overlay modals instead of sliding up from the bottom:
- `_jRenameSheet()` — "Rename" input + Cancel/Save buttons (340px centered card)
- `_jColorPickSheet()` — colour dot picker grid (centered card)
- `_jCopyMoveSheet()` — section selector for Copy/Move page (centered card)
- `_jDatePickSheet()` — date input for Change Date (centered card)

Pattern: `if (_isDesktop())` branch returns `position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:9000;display:flex;align-items:center;justify-content:center` overlay with `background:var(--bg-card);border-radius:14px` inner card. Click on backdrop calls the cancel function.

### Notes Desktop — Section Headings (v5.9.37–5.9.38)
Desktop Notes list now shows Overdue / Pinned / Open section headings matching mobile, using a "background band" style (Option B):
- **Sort order**: overdue first, then pinned, then open, each sub-sorted by `updatedAt` descending.
- **Band style**: `margin: 0 -12px` breaks out of `dnotes-list-scroll`'s `padding: 0 12px` for full-width bands. Each band has a `border-top` + `border-bottom` + tinted `background`.
  - Overdue: `rgba(var(--priority-high-rgb), 0.08)` background, red border tint, clock SVG
  - Pinned: `var(--bg-input)` background, `var(--border)` borders, pin SVG
  - Open: `var(--bg-input)` background, `var(--border)` borders, no icon
- Headings injected just before the first note in each group using `_addedOverdueHdr / _addedPinnedHdr / _addedOpenHdr` flags.

### Notes Desktop — Convert to Task & Add to Calendar Buttons (v5.9.39)
Desktop Notes action bar (Active tab only) now includes two extra action buttons matching the existing `desk-detail-btn` style:
- **Convert to Task** — calls `openNoteToTask(noteId)` (existing function)
- **Add to Calendar** — calls `addNoteToCalendar(noteId)` (existing function)

Both buttons only shown when `notesTab === 'notes'` (Active tab). Same guard as the existing Archive/Delete buttons.

### Week History Redesign + Search (v6.0.26-v6.0.36)
Week History has both desktop and mobile implementations in `renderHistoryView()` with a desktop branch to `_renderDesktopHistory()`.

Key functions:
- `_loadAllWeeks()` now collects `tasks` per week, including `id`, `dayIdx`, `date`, `dayName`, `description`, `location`, `notes`, and `codes`.
- `_histBuildSearchResults(q, scope, weeks, coWeeks)` searches saved tasks and callouts only. Scope values: `all`, `tasks`, `callouts`.
- `_histHighlight()`, `_histSnippet()`, `_histSearchScore()` handle highlighting, snippets, and ranking. Highlight uses `.hist-mark` with no padding so matched text does not cause temporary letter spacing/gaps.
- `_histBuildResultsHtml()` renders desktop search results in the right panel.
- `_histBuildMobileResultsHtml()` renders mobile search results as grouped cards by week.
- `histOpenSearchResult(type, weekStart, id, dayIdx)` opens a task in Timesheet or a callout in Callouts. Task rows/cards themselves are clickable; no separate "Open task" button.

Desktop history notes:
- Desktop layout is a resizable three-column-ish view: left filter/stats sidebar, table, optional search results panel.
- Sidebar width persists in `localStorage` key `rian_hist_sidebar_width`; resize entry point `histSidebarResizeStart(event)`.
- Search results panel width persists in `localStorage` key `rian_hist_results_width`; resize entry point `histResultsResizeStart(event)`.
- Table-column resizing was removed; resizing is between sidebar/table/results panels.
- Desktop sidebar stats use the Callouts-style 2x2 bordered stat grid.
- The old vertical marker beside the On-Call/Extra pill was removed.
- Header summary text is informational, not a button. "Jump to Week" copy was changed to "Select Week".

Mobile history notes:
- Mobile now has a search card at the top with scope segmented control: All / Tasks / Callouts.
- When search is empty, mobile shows the 2x2 Callouts-style stats block, filter chips, upcoming/current/history rows.
- When search has text, mobile hides the week list and shows grouped search results by week. Results are clickable and open the matching task/callout.
- Mobile stats CSS classes are shared with the old history stats names (`.hist-stats`, `.hist-stat-card`) but restyled to the bordered 2x2 pattern.
- Mobile search CSS classes: `.hist-mobile-search-card`, `.hist-mobile-search`, `.hist-mobile-scope`, `.hist-mobile-results-card`, `.hist-mobile-result*`.

Mockups used during review live in untracked `mockups/`:
- `mockups/week-history-desktop-review.html`
- `mockups/week-history-search-review.html`
- `mockups/week-history-mobile-search-review.html`

### Poll-Based Sync (v5.8.11+)
Firestore `onSnapshot` WebSocket can silently go stale across browsers. Added 10-second polling fallback:

- `_weekFingerprint(weekData)` — fingerprints activities by ID + description + hours + location
- Poll runs via `setInterval(10000)`, also fires on tab focus (`visibilitychange`)
- Compares local vs remote fingerprints. If different and `remoteTs >= localTs`, accepts server data (preserving drafts, stripping deleted IDs)
- `_lastFirestoreSnapAt` tracks last snapshot delivery time

### Merge-on-Save (v5.8.8+)
`fsSetWeek()` fetches remote data via `ref.get({source:'server'})` before writing. Merges activities per-day by ID. Remote-only activities recovered unless in `_deletedActIds`. After `ref.set()`, verifies write landed by reading back.

### Deleted Activity Tracking (v5.8.10+)
`_deletedActIds` object tracks deleted activity IDs with timestamps. 5-minute TTL prevents resurrection by sync mechanisms (poll, merge-on-save, snapshot). `removeActivity()` calls `_trackDeletedAct(actId)` before filtering. All three sync paths check `_isRecentlyDeleted(id)`. Persisted to `localStorage` (`rian_deleted_act_ids`) since v6.7.82 — it was memory-only, so a refresh wiped every tombstone.

### Cloud Deletion Markers — `_deletedIds` (v6.7.83+)
**The durable fix for "deleted tasks come back".** `_deletedActIds` above is per-device, so the OTHER device never learned a task was deleted: it still held the task, its save overwrote the whole week doc, and the task returned. Deleting is the only edit that cannot survive last-writer-wins, because it is an *absence* rather than a value.

`_deletedIds { id: timestamp }` lives **inside the week document**, so it is written atomically with the save and every device sees it. 90-day TTL (week docs are ~3kb).

Helpers: `_tombAdd`, `_tombMerge`, `_tombPrune`, `_tombHas`, `_tombApply`.

**Rules — do not weaken these:**
- Markers are **unioned, never intersected**, on every sync. A marker may only be added by a sync, never dropped by a device that hadn't heard about it.
- An id in `_deletedIds` must not be re-added by *any* path: `fsSetWeek`'s remote-only recovery, the `onSnapshot` unsynced re-injection, or `_fsPollSync`'s local-newer merge branch.
- Markers are honoured **regardless of which copy looks newer or whose clock is ahead** — clock skew was a live suspect during diagnosis.
- `fsSetWeek` enforces them on the final payload, which also covers the offline path where the server fetch failed.

### Poll Sync Timestamp Comparison (v6.7.82)
`_fsPollSync` used `remoteTs >= localTs` ("same age = another browser saved at ~same time, trust server"). Equal timestamps in practice mean the server read is a **stale echo of our own just-completed write**, so accepting it discarded that write. Observed live: `Write verified on server (9 activities)` immediately followed by `server data differs (remote: T local: T) — accepting server version`, after which the deleted task was back. Now `>` — accept only genuinely newer data. **Do not revert to `>=`.**

### Diagnosing sync bugs — read this first
Three speculative fixes were shipped and reverted on 2026-08-21 before anyone looked at the actual data. The many interacting guards (HWM, tombstones, first-snapshot gate, merge-on-save, poll, onSnapshot) make code reading produce confident but unfalsifiable theories. **Get ground truth first:**
```js
// Compare cloud vs screen — run in the console
Promise.resolve(userDoc('weeks/'+state.weekStart).get({source:'server'})).then(s=>{
  console.log('SERVER: ' + (s.data().days[0].activities||[]).map(a=>a.description).join(' | '));
  console.log('LOCAL:  ' + (state.weekData.days[0].activities||[]).map(a=>a.description).join(' | '));
  console.log('markers:', Object.keys(s.data()._deletedIds||{}).length);
});
```
`[Rian] Write verified on server (N activities)` is the single most useful log line — it says what actually reached the cloud.

### Inbound Snapshot/Poll Wipe of Unsynced Local Activities (v6.7.79)
Diagnosed via a deliberate two-device test (task created offline on S23 phone, task created on laptop, both brought back online — phone's task vanished, and was gone from the phone's own IndexedDB too, not just the cloud).

**Root cause:** `fsSetWeek()`'s post-write verification (`ref.get({source:'server'})`) throws when offline, so `state.syncStatus` ends up `'error'` instead of staying `'pending'`. Both the `onSnapshot` handler (~line 26210) and `_fsPollSync()` (~line 40515) only defer/guard their wholesale `state.weekData = deepCopy(remote)` overwrite while `state.syncStatus === 'pending'` — once it's `'error'`, an incoming snapshot/poll from another device freely replaces local state. The only local-only activities protected across that overwrite were ones flagged `_draft: true` (still being typed); a *committed* activity that simply hadn't confirmed sync yet (e.g. created while offline) had no protection at all and was silently discarded, then persisted (missing) back to IndexedDB on the next save.

**Fix:** In both the `onSnapshot` handler and `_fsPollSync()`, the "activities to preserve across the overwrite" collection was broadened from `a._draft` only to also include any local activity with real content whose `id` is absent from the incoming remote data and isn't in `_deletedActIds` (mirrors the remote-only-activity recovery `fsSetWeek()`'s merge-on-save already does in the outbound direction — this closes the equivalent gap inbound). If anything non-draft gets recovered this way, `scheduleAutoSave()` is triggered immediately afterward (we know we're online since a snapshot/poll just arrived) instead of leaving it to sit local-only again until some unrelated future edit happened to trigger a save.

### TipTap CDN Load Resilience (v6.7.80)
TipTap and its extensions (~20 packages) are loaded at runtime via dynamic `import()` from `esm.sh`, not bundled — see `_loadTipTapModules()` (~line 51020). The service worker caches these (`esm.sh` is in `ALLOWED_CDN_HOSTS`, [sw.js](sw.js)), but only *after* a first successful load on that device/browser. A connectivity drop during that first-ever fetch previously threw an uncaught "Failed to fetch dynamically imported module" error with a raw stack-trace dump and no way to recover short of closing/reopening the editor.

Fixes:
- `_ttFetchModulesWithRetry()` wraps the module `Promise.all()` with up to 4 attempts, backing off 1.5s × attempt; if `navigator.onLine` is false it waits for the `online` event (capped by the same timer) instead of burning retries against a dead connection.
- `_ttErrorHtml(retryCallJs)` / `_ttEscJs()` build a friendly "No internet connection" / "Editor failed to load" panel with a Retry button, replacing the raw stack trace, at all 5 `_ensureTipTap()`/`_loadTipTapModules()` call sites (`openFieldNoteFullscreen`, `openCoNoteFullscreen`, `openNoteFullscreen`, `openTemplateNoteFullscreen`, `_djMountTiptap`). Retry re-invokes the original open function with its original arguments.
- `init()` prewarms `_loadTipTapModules()` 4s after startup (fire-and-forget, only if `navigator.onLine`) so the service worker has a chance to cache the modules before the user's first real editor open.

### Intermittent "Task Notes Editor Loads Empty" (v6.7.81)
Reported: opening a task's TipTap notes editor sometimes shows a blank editor even though the note has content; closing and reopening usually fixes it. Not a data-loss bug (content stays intact in `state`/IndexedDB throughout) — two independent gaps in how the editor gets populated, both fixed defensively since neither could be confirmed as *the* sole cause without live reproduction:

1. **Stale captured value.** `openNoteFullscreen()` read the note's content once synchronously at modal-open time, then applied it via `_ttSetContent()` after `await _ensureTipTap()` + an 80ms delay. Anything that updated `state.weekData` for that activity during that gap (incoming snapshot, poll-sync, in-flight save) meant the editor got the pre-gap value. Fixed by re-reading the activity's notes (DOM textarea on mobile, `state.weekData` on desktop) immediately before `_ttSetContent()` runs, and refreshing `window._actNoteOpenContent`/`_actNoteBaseUpdatedAt`/`_actNoteBaseHash` to match (those baselines drive the stale-editor guard in the `onSnapshot` handler, so they must stay in sync with whatever was actually applied).
2. **Silent-empty fast-path parse.** `_ttSetContent()`'s fast path parses HTML via `PmDOMParser.fromSchema(...).parse()` and dispatches it directly. ProseMirror can drop content it can't map to the schema without throwing, so a non-empty source could dispatch as an empty doc with no error and no fallback triggered. Now checks whether the source HTML actually had content (`_sourceHasContent`) and whether the parsed result looks meaningfully empty (`parsedDoc.content.size <= 2`); if source-had-content-but-parsed-empty, it falls through to the `commands.setContent()` fallback path instead of trusting the fast-path result.

Only `openNoteFullscreen` (task notes) got the re-read fix, since that's the reported path; `_ttSetContent`'s fast-path guard is shared by all 5 editor-open sites.

**Still recurring after both fixes (v6.7.97).** User reported the same symptom again on a later version, so there's a third, unidentified gap — not reproduced live this time (unlike the two fixes above, which were). Rather than leave it unfixed pending reproduction, added an automatic self-healing check in `openNoteFullscreen`: 300ms after the initial `_ttSetContent()` call, re-reads the activity's current notes and checks `_sourceHasContent && _tiptapEditor.isEmpty`. If content should be showing but isn't, silently re-applies it via `commands.setContent()` (bypassing the fast path) — the same recovery closing and reopening gives the user, just automatic and without them noticing. No data risk: it only ever reads from `state`/the DOM textarea, never writes. If this stops the reports, the 300ms delay and specific trigger condition are a live clue toward the actual root cause; if it doesn't, extend the same check to the other 4 editor-open sites (`openCoNoteFullscreen`, `openTemplateNoteFullscreen`, `openFieldNoteFullscreen`, `_djMountTiptap`) — this fix only covers task notes, matching the reported path.

### Spotty-Connection Login Screen (v6.7.98)
Reported: on a flaky/slow connection (not fully offline), the app sometimes just shows the sign-in screen and won't load, even on a device that was already signed in. Full offline actually works better — Firebase Auth resolves the persisted session instantly with no network attempted; a *slow* connection is worse because it blocks on a real request that just hangs.

`init()` already had `_preload()`, an optimistic-render IIFE that shows cached data before Firebase Auth resolves — but only when **this specific week** (`getCurrentFriday()`) is already cached locally. If Auth is slow and this week hasn't been opened on that device before, there was no fallback: the user just sat on the raw sign-in button until Auth eventually resolved or gave up.

Fix: a `setTimeout(..., 3000)` alongside `_preload()` — if `state.currentUser` is still unset after 3s and `localStorage.rian_last_uid` proves this device was previously signed in, sets the same cached-uid stub `_preload()` uses and calls `render()`. Safe because every view already has its own "Loading…" placeholder for missing data (e.g. `renderWeekView()`'s `!state.weekData` guard) — confirmed by reading, not assumed. The real `onAuthStateChanged` callback unconditionally overwrites `state.currentUser` whenever it does fire, so the stub never fights the real session, it only fills the gap.

Not reproduced live (couldn't simulate a genuinely flaky connection) — implemented from code-reading the gap, not live DOM inspection like the fixes above. If reports continue, that's the next thing to verify.

### TipTap scroll/cursor position restore — extended to Callout notes & Task Templates (v6.8.15)
`openNoteFullscreen` (task notes) and `openFieldNoteFullscreen` (standalone Notes) already saved/restored scroll+cursor position on close/reopen via `localStorage['rian_tt_pos_a_'+actId]` / `['rian_tt_pos_n_'+noteId]`, written centrally in the shared `closeNoteFullscreen()`. `openCoNoteFullscreen` (Callout notes) and `openTemplateNoteFullscreen` (Task Templates) — 2 of the 5 shared-modal editor-open sites — never had this: they always `blur()`/`focus('end')` on open with no restore attempt, and `closeNoteFullscreen`'s save logic had no branch for either, so a callout note or template note editor always opened wherever the content happened to put the cursor by default, reported as "TipTap should remember where I was."

Extended the exact same pattern to both: `_coNoteFsCoId` (new module var, resolved via the existing `_coGetOrCreate()?.id`, since `openCoNoteFullscreen()` takes no id argument) keys `rian_tt_pos_co_<coId>`; `_tplNoteFsId` (already existed, used elsewhere) keys `rian_tt_pos_tpl_<tplId>`. `closeNoteFullscreen`'s `_pk` computation extended to a 4-branch check covering all of `_fnFsNoteId` / `_noteFsActId` / `_coNoteFsActive+_coNoteFsCoId` / `_tplNoteFsId`. While in there, also fixed a latent (pre-existing, now actually reachable) bug: `openCoNoteFullscreen()` never cleared `_fnFsNoteId`/`_tplNoteFsId` on open, so a stale value from a previous Field Note or Template session could hijack the position-save key on close since those checks come earlier in the ternary chain — added the missing clears.

Verified live end-to-end for both (not just code-reviewed): opened, set a specific cursor offset, closed via `closeNoteFullscreen('save')`, confirmed the correct `localStorage` key held that offset, reopened, confirmed the cursor landed back at the same offset rather than the old blur/end-of-doc behavior.

### TipTap image insert could hang forever on an undecodable photo (v6.8.15)
Reported: "can't add images" — but only the Insert Photo button, not Attach File (both go through the same `<input type="file">` → Android `onShowFileChooser` path, which the Attach File report proved was working fine — so the file *picker* wasn't the problem). Root cause in `_ttHandleImageUpload()`: the compression step loads the selected file into `new Image()` via a blob URL and waits on `img.onload` to proceed — but there was no `img.onerror` handler and no timeout. If the browser's image decoder can't decode a given file for any reason (a format its codec doesn't support, a corrupt file, some HEIC/HEIF edge case), `onload` simply never fires and the `await new Promise(...)` hangs forever — no error, no toast, nothing visibly happens. Exactly matches "I can attach a file but can't add images": attaching never needs to decode the file as an image, so it always succeeded through the identical file-picker plumbing.

Fixed with both an `img.onerror` handler and a 10s timeout, either of which resolves the promise to `null` (revoking the object URL either way to avoid leaking it) instead of leaving it pending; the calling loop then skips that file and shows `⚠️ Photo couldn't be read` (or "...were skipped" if only some of a multi-select batch failed) rather than silently doing nothing. If every selected file fails, the function returns before touching the editor at all.

Verified live: dispatched a `change` event on the hidden file input with a deliberately-corrupt "image" file (garbage bytes, `image/jpeg` MIME) — resolved via `onerror` almost instantly (not the 10s timeout), correct toast shown, editor content unchanged. Then verified a real 1×1 PNG still inserts correctly (`<img>` tag present, no regression).

**This wasn't actually the cause on a real device (v6.8.16) — the onerror/timeout fix above is still worth keeping, but the user retested on their S23 after it shipped and images still didn't insert.** Diagnosed properly this time using adb + the WebView's remote debug socket to simulate the real flow (a desktop-browser DataTransfer-injected File, used in the v6.8.15 "verification," bypasses Android's native file chooser entirely — it never actually exercised the real device code path). Live-testing on the phone (screenshots to find real tap coordinates, the actual Android system Photo Picker, an actual photo selection) showed `tt-image-input.files.length === 0` after a completed, confirmed selection — the file never reached the WebView's `<input>` at all, while Attach File (which uses a separate `#tt-file-input` with no `accept`/`multiple` attributes) worked fine through the same native flow.

Root cause confirmed via temporary `Log.d` calls in `MainActivity.java`'s `onActivityResult` + `adb logcat`: `WebChromeClient.FileChooserParams.parseResult(resultCode, data)` — the standard, deprecated helper for extracting picked file URIs — returned null/empty even though the Intent it received genuinely carried the selection (`resultCode=-1/RESULT_OK`, `clipData` present and non-null in the raw Intent). This is a known category of gap: `accept="image/*" multiple` routes Android 13+ to its system Photo Picker (branded "Google Photos" on this device), which returns results via `Intent.getClipData()`, and `parseResult()` doesn't reliably unpack that shape on every device/OS combination. `#tt-file-input` has no `accept`/`multiple`, so it never hits this picker or this code path, matching "attach works, insert photo doesn't" exactly.

Fixed in `onActivityResult`: when `parseResult()` returns null/empty, fall back to reading `data.getClipData()` (iterating `getItemAt(i).getUri()` for each item) or `data.getData()` directly, rather than trusting `parseResult()` alone. Native change, needs an APK rebuild.

Verified end-to-end on the real S23: confirmed via logcat that `parseResult()` genuinely returned nothing and the ClipData fallback engaged (`used ClipData fallback, count=1`, `final results=1`); confirmed via the WebView debug socket that the image subsequently uploaded to Firebase Storage and landed in the editor's HTML (`<img src="https://firebasestorage...">`); confirmed visually via a device screenshot that the photo renders. Diagnostic `Log.d` calls removed after confirming the fix; the fallback logic itself stays.

**Lesson for next time:** a DataTransfer-injected File dispatched directly on the `<input>` in a desktop browser test proves the *JS-side* handling is correct, but does not exercise Android's native file-chooser round trip at all — it cannot catch a bug like this one, which lived entirely in `onActivityResult`. Real device testing (or at least driving the actual native picker via adb) is required to verify anything touching `onShowFileChooser`/`onActivityResult`.

### Firestore IndexedDB Cache Corruption
`?cleanup=1` URL parameter nukes Firestore's local IndexedDB caches (built into app since v5.1.79). Use when sync behaves inconsistently — `get({source:'server'})` can return cached data from corrupted IndexedDB even when claiming server source. Ad blockers (uBlock Origin Lite) can also interfere with Firestore network requests.

## Themes — All Done
All planned themes are implemented: claude, dark, champagne, champagne-dark, ios, apple, gray, gameboy, win31, lcd, spectrum, retro. To add more: copy an existing `[data-theme="..."]` block, rename, change variable values, register in `THEME_META`.

## About Rob (the developer)
- Field technician who built Rian for his own use
- Prefers concise responses, no fluff
- Expects familiarity with the project — don't ask obvious questions
- Uses Windows, deploys via GitHub
- Currently uses OneNote for field notes (site visits with voltage readings, ticket tables, photos) — long-term goal is to replace OneNote with Rian's TipTap-based notes
- Device: Samsung SM-S918B

## Landing Page (index.html)

The production landing page at `https://morow01.github.io/rian/` is a separate static file — not part of `app.html`. Edit `index.html` directly; it has its own self-contained CSS and JS.

### Screenshot Phone Frames (2026-04-22)
Real app screenshots displayed in Samsung Android phone frame mockups (`.samsung-frame`). Images live in `images/` folder:
- `01 TimeSheet.png`, `02 Notes.png`, `03 Notes.png`, `04. Journal.png`, `05. Journal.png`, `06. Finder.png`, `07. Routines.png`, `08. Routines.png`, `09. OnCall.png`, `10. OnCall.png`, `11. Desktop Mode.png`

### Carousel Pattern
Each phone section uses `.samsung-col > .samsung-wrap > .samsung-slide(s)` structure:
- `.samsung-col`: flex column, centers carousel + nav row
- `.samsung-wrap`: `overflow-x: auto; scroll-snap-type: x mandatory; width: 290px` — fixed width so carousel is always active (not media-query gated)
- `.samsung-slide`: `width: 290px; padding: 20px 40px 52px` — padding must accommodate shadow (`0 10px 28px` = 38px clearance needed; 52px bottom covers it)
- Sections with 1 image: just one slide, no nav added
- Sections with 2 images: JS adds `‹ dots ›` nav row inside `.samsung-col`

### Carousel JS
`document.querySelectorAll('.samsung-col')` — for each col with 2+ slides, injects a `.samsung-nav` div (prev button + `.samsung-dots` + next button). Prev/next click `wrap.scrollTo({left: idx * wrap.offsetWidth, behavior:'smooth'})`. Dots sync via `wrap.addEventListener('scroll', ...)`. Dots are also clickable. Touch swipe works natively via scroll-snap.

**Why not mouse drag**: `scroll-snap-type: mandatory` fights against programmatic `scrollLeft` changes on Chrome — browser snaps back during drag, making it feel broken. Arrow buttons are reliable on desktop.

### Responsive Layout
- `> 900px`: 2-column grid (`1fr 1fr`), phone carousel in right column
- `≤ 900px`: single-column grid, carousel centred below text (290px fixed)
- `≤ 600px`: carousel goes full-width (`width: 100%` on wrap + slide)
- Odd-numbered sections use `direction: rtl` on `.feature-inner` to flip photo/text order; reset to `ltr` at ≤ 900px

### Shadow Clipping Rule
`overflow-x: auto` clips `box-shadow` of children. Keep `.samsung-slide` padding ≥ shadow extent on all sides. Current shadow: `0 10px 28px` → needs ≥ 38px bottom clearance, ≥ 28px sides. Current padding: `20px 40px 52px` — do not reduce without adjusting the shadow first.

## Testing
- Served locally at `http://localhost:3000/app` for dev
- No test framework — manual testing in browser
- After changes, always hard-reload (Ctrl+Shift+R) to bypass service worker cache
- PWA live at: `https://morow01.github.io/rian/app.html`
- Landing page live at: `https://morow01.github.io/rian/`

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
Uses `@capacitor-firebase/authentication` (v8.5.1 as of 2026-09; bumped from 8.2.0 while chasing the sign-in failure below — Google has been deprecating the legacy GoogleSignIn API in favor of Credential Manager) to bypass the WebView OAuth block (disallowed_useragent error). Code in `signInWithGoogle()`:
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

**"App" / "PWA" label (v6.8.5+):** Both installs use the same name/icon and are visually
indistinguishable on a phone (Android auto-converts a "Add to Home Screen" PWA into a
WebAPK that looks just as native as the real APK). User asked how to tell which one they
were in while already signed into both. Since both load the exact same live `app.html` from
GitHub Pages, the version number is identical on both and can't be used to tell them apart
either. Added `${IS_NATIVE ? 'App' : 'PWA'}` next to both existing version displays — the
header top-bar version (next to sync status) and the ☰ menu footer (`Rian v6.8.5 · App`) —
so the distinction is visible without digging into Android Settings → App info.

#### Fresh-machine sign-in failures (2026-09 PC rebuild) — two separate causes, both required
Setting up the APK build on a brand-new PC broke Google Sign-In with a webpage-rendered "400: malformed request" error, and after fixing that, a native "Account reauth failed (err 16)" error. Both had to be fixed before sign-in worked again — **a fresh machine needs both of these, not just one:**

1. **`android/app/google-services.json` is git-ignored and was never committed** — only a project-root copy is tracked. `android/app/build.gradle` only applies the `com.google.gms.google-services` plugin `if (file('google-services.json').text)` exists inside `android/app/`; without it, the plugin silently skips, the native `FirebaseAuthentication` plugin has no OAuth config, and `signInWithGoogle()` falls through to the broken web `signInWithPopup`/`signInWithRedirect` path inside the WebView — which renders as a Google error page, not a native dialog. Fix: copy the root `google-services.json` into `android/app/google-services.json` on every fresh machine (not automated by `scripts/build-www.js` or any Gradle task — has to be done manually once per machine).
2. **The new machine's auto-generated `debug.keystore` has a SHA-1 fingerprint that isn't registered in Firebase.** Once (1) is fixed, native sign-in actually engages and immediately fails with `Account reauth failed` / error 16 — this is Google's standard error for "this app's signing certificate isn't recognized." Fix: get the new machine's SHA-1 (`keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android`), add it in Firebase Console → Project settings → Your apps → the Android app → **Add fingerprint**, then **re-download `google-services.json`** (it embeds the registered fingerprints, so the old copy won't have the new one) and replace both the root and `android/app/` copies before rebuilding. Each fresh dev machine adds its own fingerprint — old machines' fingerprints stay registered too, so switching back and forth between machines doesn't break anything.

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

### External Links (Open Map, ↗ Open) Silently Failing in the APK (v6.8.13)
Reported: "Open Map" on a Routines site popup did nothing when tapped in the installed APK (worked fine as a PWA). Root cause in `_openUrl()` (~line 54197): the Android WebView's user-agent always contains "Android" (same as real Chrome), so a plain `https://` URL was falling into the branch that hand-builds a custom `intent://` URI and navigates the WebView to it directly (`window.location.href = intentUrl`) — a trick that works in a real Chrome browser (which understands the `intent://` scheme specially) but not in the bare `android.webkit.WebView` Capacitor uses, since `MainActivity.java` has no `shouldOverrideUrlLoading` override to interpret it. The navigation just silently went nowhere.

**Fix:** for `IS_NATIVE` (inside the APK), skip the custom intent:// construction entirely and navigate directly to the URL as-is. `capacitor.config.ts`'s `server.allowNavigation` only allow-lists Google/Firebase auth domains — that restriction only makes sense because Capacitor's own `BridgeWebViewClient` is already intercepting any other navigation attempt and launching the matching Android Intent itself (opens the Maps app or system browser, whichever handles it). The old code was bypassing that built-in mechanism with a hand-rolled one the WebView can't interpret on its own. The non-native "Android Chrome" intent:// path (for the PWA, not the APK) is unchanged, aside from adding the standard `category=android.intent.category.BROWSABLE;` field for correctness.

This is a pure `app.html` fix — no APK rebuild needed, takes effect on the already-installed app the next time it loads the live GitHub Pages content.

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

### Toggle Header Row Lost Default Background + Table Bar Layout Jump (v6.7.92–v6.7.96)
Two related table-editing bugs, both fixed by inspecting the live DOM in the browser (repro'd, not just theorized):

**Header background not applied after Toggle Header Row.** `_ttToggleRowHeader()` (~line 54516) converts a row's cells between `tableCell`/`tableHeader` via `tr.setNodeMarkup(pos, toType, cell.attrs)`, carrying the cell's existing `attrs` over unchanged. `TableCellWithBg`/`TableHeaderWithBg` both support a per-cell `background` attribute (set via the Cell actions → colour swatch row, `setCellAttribute('background', color)`), rendered as an inline `style="background-color:..."` when non-null. The default header look (`th { background: var(--table-header-bg) }`, no `!important` for the default `claude` theme) is CSS-only and loses to any inline style. So: pick a custom background for a body cell, later promote that row to a header, and the header keeps the old custom colour instead of the clean default — confirmed via a live repro (set a cell to blue, toggled it to header, computed background stayed the custom blue with the inline style still present). Fixed by stripping `background` back to `null` specifically when a cell is being promoted to header (not on the reverse direction — toggling a header back to a body row keeps whatever it had).

**Table context bar caused a layout jump.** `#note-fs-tt-table-bar` (~line 9999) was a normal in-flow flex row inside `.tt-toolbar-wrap`, toggled `display:none`/`flex` by `_ttUpdateToolbar()` whenever `editor.isActive('table')` changes. Appearing/disappearing changed `.tt-toolbar-wrap`'s height, which pushed `#note-fs-editor` (its next sibling) down/up — visible as the table/text "jumping" the moment the cursor entered or left a table. Fixed by converting it to the same absolute-overlay pattern `#note-fs-tt-colors` (the text colour dropdown) already used: `position:absolute; top:100%` anchored to `.tt-toolbar-wrap` (`position:relative`), so it now draws over the top of the editor content instead of reflowing it. Since both bars now anchor to the same spot, `_ttUpdateToolbar()` closes the colour dropdown when the table bar opens, and the colour dropdown was given a higher z-index (22 vs the table bar's 21) so an explicit palette click still wins if the cursor happens to be inside a table.

**Follow-up (v6.7.93) — caret-following nudge wasn't enough.** First attempt: `_ttRevealCaretBelowTableBar(editor, tableBar)` (~line 53419) compares the caret's screen position (`editor.view.coordsAtPos(selection.from)`) against the table bar's `getBoundingClientRect().bottom` every time `_ttUpdateToolbar()` runs with the cursor inside a table, nudging `#note-fs-editor.scrollTop` down when they overlap. This only protects the caret's own line — live-tested with a real note (heading text, then a table a couple rows down) and clicking into a body cell left the *heading* (unrelated to the caret) hidden under the bar, since the caret itself wasn't covered so no nudge fired. Kept as a secondary safety net for tables scrolled into the middle of a long note, but insufficient alone.

**Follow-up (v6.7.94) — permanent reserved gutter looked wrong.** Tried making the `#note-fs-editor .ProseMirror` top padding a blanket `59px` (up from `16px`) on every note, unconditionally, so there'd always be room for the bar. User feedback: looks weird as a permanent empty gap on the (far more common) notes that never contain a table at all.

**Follow-up (v6.7.95) — reserved it only for notes with a table.** `.tt-doc-has-table` class toggled by a `doc.descendants()` scan in `_ttUpdateToolbar()`. Worked, but user decided (v6.7.96) they'd rather the bar just cover top content and click out of the table to see it than have any reserved space at all — reverted. Left as a design note in case this trade-off gets revisited: reserving space *conditionally* (only for notes that actually have a table, computed from content rather than toggled by cursor position) is the pattern to reach for if "the bar hides my content" comes back as a complaint instead of "there's a gap I don't want."

**Settled design (v6.7.96):** table bar is a plain absolute overlay with no reserved space anywhere — it covers whatever's at the top of the note when active; clicking out of the table reveals it again. `_ttRevealCaretBelowTableBar()` (~line 53419) stays as a narrower safety net: it only nudges scroll to keep the *caret's own line* visible (not surrounding content), which doesn't add any visible padding/whitespace.

**Desktop scroll fix (v6.8.0):** `#note-fs-tt-table-bar` has the same `overflow-x:auto` as the main toolbar, so it scrolled fine on mobile (native touch swipe) but not at all on desktop — a mouse has no built-in gesture for horizontal overflow, no visible scrollbar (`scrollbar-width:none`), and it never got the wheel/click-drag enhancement `#note-fs-tt-toolbar` already had for exactly this reason. That enhancement (`~58` lines: wheel handler, pointer-drag, click-suppression-after-drag) was extracted into a reusable `_ttBindDesktopHScroll(el)` (~line 53309, right before `_ttUpdateToolbar`) and is now bound to both toolbars. `.tt-dragging` cursor styling (`@media (min-width:768px)`, ~line 8740) extended to cover the table bar too.

### WebView Microphone Permission (v5.4.10, v6.0.78)
`MainActivity.java` sets a custom `WebChromeClient` that auto-grants `onPermissionRequest` — required for mic access when loading from a remote URL. The Android manifest declares `RECORD_AUDIO`. Without the WebChromeClient override, the WebView silently blocks mic requests.

Since v6.0.78, `MainActivity.java` also requests Android runtime `RECORD_AUDIO` permission on startup and again before granting a WebView permission request. This is required on modern target SDKs; the manifest permission alone is not enough. If the user previously denied the mic permission, Android may require enabling it from App info → Permissions → Microphone after installing the new APK.

### WebView Geolocation Permission — Routines map "show my location" never worked in the APK (v6.8.15)
Reported: the Routines map's location dot never appears on the APK (works fine on the PWA — real Chrome browsers prompt for and handle geolocation permission natively). Root cause was a straightforward gap, same shape as the mic permission above but never done for location: `AndroidManifest.xml` had no `ACCESS_FINE_LOCATION`/`ACCESS_COARSE_LOCATION` at all, and — separately, and just as fatal on its own — `MainActivity.java`'s `WebChromeClient` had no `onGeolocationPermissionsShowPrompt` override. Geolocation is *not* one of `onPermissionRequest`'s resource types (that one covers mic/camera/protected-media-id); the WebView asks for location through this entirely separate callback, and without overriding it the WebView's default behavior silently denies every request — `navigator.geolocation` (which is what Leaflet's `map.locate()` calls internally) just gets a `locationerror` with no native permission dialog ever shown.

Fixed by mirroring the audio permission pattern exactly: manifest permissions added, `wv.getSettings().setGeolocationEnabled(true)` set explicitly (defaults to true, but easy to lose track of), and `onGeolocationPermissionsShowPrompt` added alongside `onPermissionRequest` — grants immediately if the runtime permission is already held, otherwise stores the pending origin + callback and requests `ACCESS_FINE_LOCATION`/`ACCESS_COARSE_LOCATION`, resolving the stored callback from `onRequestPermissionsResult` once the user responds (new `LOCATION_PERMISSION_REQUEST_CODE = 102`, alongside the existing `AUDIO_PERMISSION_REQUEST_CODE = 101`). Native change — requires an APK rebuild to take effect, not reachable by a web-only push.

### PWA Back Button (v5.4.10)
On Android standalone PWA, the system back gesture exits the app if the history stack empties. The app traps `popstate` and re-pushes a history entry *before* calling `_handleBackButton()`, so the stack never runs dry. Only one seed entry is needed at init since popstate always replenishes.

**Exit confirm button did nothing on a plain PWA (v6.8.4).** Reported: the exit dialog appears (so the trap above was working), but tapping "Exit" sometimes did nothing. `_exitApp()`'s fallback chain — `RianNative.exitApp()` → `Capacitor.Plugins.App.exitApp()` → `navigator.app.exitApp()` → `window.close()` — has its first three gated behind bridges that only exist in the compiled APK (`IS_NATIVE = typeof window.Capacitor !== 'undefined'`); a plain "Add to Home Screen" PWA has none of them, and `window.close()` is a browser no-op on a window it didn't open itself via script, which every home-screen-launched PWA is. So on that path, confirming exit silently did nothing — matching the report exactly, and the dialog itself wasn't even being removed on that click, making it look stuck.

Fix: `_exitApp()` now removes the dialog unconditionally up front (so it never looks stuck regardless of which path runs), and its final fallback — reached only when no native bridge exists — sets `window._rianExitConfirmed = true` then calls `history.back()` instead of `window.close()`. The popstate listener checks that flag and skips its own re-push when set, undoing the anti-exit trap for just this one confirmed exit so history can actually run dry, which is what closes an Android PWA (the exact mechanism the trap exists to prevent during normal back-presses).

Not verified against a real Android device/PWA — `history.back()` triggering an actual WebAPK close is a platform behavior a desktop browser tab can't fully reproduce. If exit still doesn't work after this, next step is checking how many real history entries actually exist at exit time (one `history.back()` may not be enough if something outside this trap ever pushes its own entries).

### Offline Support via Service Worker (v5.4.11)
Service worker registration (in app.html init) no longer skips native mode. Same `sw.js` serves both PWA and APK — stale-while-revalidate (serves cached instantly, refreshes cache in the background; see [sw.js](sw.js) comment — this replaced an earlier network-first strategy that stalled 20-60s per request on weak signal before falling back to cache). First launch online installs the cache; later launches work offline. Data sync (Firestore) still requires internet, but cached IndexedDB data loads.

#### Update detection was passive — users had no way to know a new version was even available (v6.8.8)
Stale-while-revalidate means the *page currently open* always runs whatever was cached at the time it loaded — a code push only reaches a given device the next time it's opened after the background revalidation fetch completes, normally the launch-after-next. There was no code to detect or surface this: no update-available prompt, and nothing actively re-checked for a new `sw.js` beyond the browser's own default (infrequent, and — confirmed via user reports of the APK sitting stale through 2+ full closes/reopens where the PWA in Chrome updated promptly on the same push — the Android WebView's own passive check timing is less reliable than Chrome's). The only tool users had was guessing how many times to close/reopen, or as a last resort clearing app storage entirely (which also signs them out — clearly not acceptable as a routine update step).

Fixed by making update-checking active instead of passive, in `init()`:
- `navigator.serviceWorker.addEventListener('controllerchange', ...)` — fires whenever the SW controlling the page changes. Guarded by `_hadControllerAtLoad` (`!!navigator.serviceWorker.controller` captured before `register()` runs) so the very first-ever activation (`controller` goes `null` → set, not an update) doesn't false-trigger. When a real controller *swap* happens — i.e. an update actually landed — shows a `showActionToast('Update ready', 'Refresh', () => location.reload(), ...)` prompt rather than silently auto-reloading, since a field tech could be mid-edit on a timesheet or note.
- `document.addEventListener('visibilitychange', ...)` calling `reg.update()` on every foreground — `update()` explicitly bypasses the browser's own SW-script cache throttling (which otherwise only checks occasionally), so this catches an update within one foreground instead of requiring several full closes/reopens.

Not verified against the actual Android WebView update-timing bug that prompted this (couldn't reproduce the "still stale after 2 reopens" behavior in a desktop test) — the fix is built from the two documented gaps in the code (no active check, no update-available signal), which are real regardless of whatever WebView-specific timing quirk was also in play. If this doesn't fully resolve the "how many times do I reopen" uncertainty, that WebView-specific angle is the next thing to chase.

#### Follow-up (v6.8.9) — the actual root cause of the zoom reset, found via live reproduction
The v6.8.7 restore-the-last-view fix (above, in the earlier Routines Map section) turned out to be solving a problem it didn't fully have: `_rtnMapLastView` was being captured and applied correctly the whole time — confirmed by instrumenting a real run in the browser (`javascript_tool` driving `setView`/`rtnMobTab` directly, tagging the `#rtn-map` DOM node to prove it was genuinely torn down and rebuilt, not just skipped). The bug was a few lines further down the *same* function: `if (bounds.length > 0) map.fitBounds(bounds, {padding:[40,40], maxZoom:11});` ran unconditionally on every single call to `_rtnInitMap()` — not just first creation — so it silently overwrote whatever view (restored or otherwise) had just been set, every time the map rebuilt. Since the map rebuilds on *any* re-render while its tab is active (not only on navigating away and back), this reset the zoom far more often than the reported "note editor round trip" scenario suggested, which is presumably why v6.8.7 alone didn't fix it despite being correct as far as it went. Fixed with a `_rtnUsedRestoredView` flag set at map-creation time, gating the `fitBounds()` call to only the case where there was no prior view to restore (i.e. genuinely first-ever open).

This is the one fix in this whole Routines Map saga that was actually reproduced live end-to-end (zoom set → navigate away → navigate back → zoom verified unchanged, with DOM-node identity checked to rule out a false-positive from the old instance never being torn down) rather than reasoned from reading the code, worth noting given the earlier two attempts (v6.8.6, v6.8.7) were each shipped on code-reading confidence alone and each turned out to be an incomplete fix.

### SW-independent update check — the v6.8.8 mechanism wasn't enough on the Android WebView (v6.8.10)
Diagnosed live against a real phone (adb + the WebView's `webview_devtools_remote_<pid>` debug socket, forwarded and driven via raw Chrome DevTools Protocol over a Node.js WebSocket — no `chrome://inspect` UI needed, just `Runtime.evaluate` calls): the phone was confirmed stuck on v6.8.8 while v6.8.9 was live on GitHub Pages. `navigator.serviceWorker.controller.scriptURL` and `caches.keys()` both still showed `6.8.8`, and calling `reg.update()` reported success but changed nothing. Critically, a **direct** `fetch(...,{cache:'no-store'})` for the live URL from that same WebView context returned `6.8.9` instantly on a healthy 4G connection — so the network path was never the problem. The gap is specifically that the SW's own background revalidation of the `app.html` *document* (the stale-while-revalidate fetch inside the `fetch` event handler in [sw.js](sw.js)) never lands in the WebView's cache, even left untouched for 20+ seconds — unlike a real Chrome tab, where the same mechanism updates promptly (confirmed earlier in this session: the PWA in Chrome picked up 6.8.7 immediately while the APK didn't). Root cause not fully pinned down (Android WebView's top-level navigation request may not route through the SW fetch handler the same way Chrome's does) — not worth chasing further given a direct fix is simple and reliable.

Added a completely SW-independent check in `init()`: `_rianCheckForUpdate()` fetches `app.html` directly with `cache:'no-store'`, regexes out `const VERSION = '...'`, and compares against the running `VERSION`. Runs once ~4s after load and again on every `visibilitychange` foreground. On a mismatch, shows the same `showActionToast('Update ready (vX)', 'Refresh', ...)` UI as the v6.8.8 controllerchange path (both funnel through `_rianShowUpdateToast()` now, gated by one shared `_rianUpdateToastShown` flag so they can't double-prompt) — but the refresh action navigates to `location.pathname + '?_r=' + Date.now()` rather than a plain `location.reload()`, since a plain reload could hit whatever cache layer was the actual problem; a genuinely new URL can't be served from any cache keyed by exact URL.

The v6.8.8 controllerchange/reg.update() code is left in place — it's correct and still fires in browsers where the underlying mechanism does work (confirmed on the PWA), so this is a second, independent layer rather than a replacement.

### Update indicator: toast → header icon (v6.8.12)
The v6.8.8/6.8.10 update checks originally surfaced via `showActionToast('Update ready', 'Refresh', ...)` — user feedback: a toast popping up mid-task felt intrusive. Replaced with a small pulsing refresh-icon button next to the version number in the header top-bar (`v${VERSION} · App/PWA`), visible but passive — no popup, no interruption, click it when convenient.

Implementation: `_rianUpdateAvailable` (top-level `var`, not nested in `init()`) holds the detected new-version string once found; the header template in `render()` reads it directly and conditionally renders the icon (`@keyframes rianUpdatePulse` for the subtle pulse). `_rianShowUpdateToast(newVersion)` (name kept for continuity even though it no longer shows a toast) sets the flag and calls `render()`. `_rianDoRefresh()` — called from the icon's `onclick`, which executes in global scope — navigates to `location.pathname + '?_r=' + Date.now()`, same cache-busting approach as before.

All four functions (`_rianUpdateAvailable`, `_rianDoRefresh`, `_rianShowUpdateToast`, `_rianCheckForUpdate`) moved to top-level scope (near `showActionToast`, well before `render()` and `init()`) — they were previously nested inside `init()`, which worked for the wiring (`setTimeout`, event listeners) but meant `render()`'s header template couldn't read `_rianUpdateAvailable` and the `onclick="_rianDoRefresh()"` attribute couldn't resolve the function, since neither runs inside `init()`'s closure.

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

If Gradle fails with file-lock errors (On