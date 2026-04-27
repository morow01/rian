# Rian — Project Context for Codex

## What is Rian
A Progressive Web App for field technicians — timesheets, notes (TipTap rich text), site finder, routines, callouts/on-call scheduling, and AI assistant. Single-file architecture (`app.html`, ~32,000 lines) with Firestore sync, IndexedDB offline cache, and Google Apps Script backend.

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
`const VERSION = 'x.y.z'` in `app.html` (~line 18699). Bump on every change. Only location that needs updating (index.html version references are static).
Current version: **6.0.36**

**12 themes active**: `Codex` (default light), `dark` (slate-based), `champagne`, `champagne-dark`, `ios`, `apple` (macOS), `gray` (Grayscale), `gameboy` (Game Boy), `win31` (Win 3.1), `lcd` (LCD), `spectrum` (ZX Spectrum), `retro` (Retro). Theme picker lives in ☰ menu → Display. Switcher at `setTheme(key)`, registry at `THEME_META`.

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

### Callouts — Desktop Three-Panel Layout (v5.8.52+)
Three-panel layout (Weeks → Callouts → Detail) matching Timesheet pattern. Accessed via ☰ menu → Callouts (not in the top desktop tab nav).

- **Left panel (280px)**: Stats 2×2 grid (On-Call Weeks, Extra Shifts, Total Incidents, Avg/Week), "Schedule" button, Current/Previous week rows
- **Middle panel (360px)**: Callouts list grouped by date, "Paste Fault" button, "+ Add Callout" dashed button
- **Detail panel (flex)**: "CALLOUT DETAILS" header, callout header (blue badge + fault + location/ticket), form fields (Date, Ticket Number, Location, Fault Description, Notes, Engineer On Site), action buttons

Detail panel reuses Timesheet CSS classes: `desk-detail-body`, `desk-detail-header`, `desk-detail-form`, `desk-field-group`, `desk-detail-actions`, `desk-detail-btn`.

**Draft system (v5.8.64+):** `dcoAddCallout()` sets `_draft: true`. Draft callouts show Save/Discard buttons (matching Timesheet draft pattern). `dcoUpdateField()` skips `_coScheduleSave()` for drafts. `saveCallouts()` strips `_draft` entries before writing to Firestore. `dcoSaveDraft()` removes draft flag and saves. `dcoDiscardDraft()` removes the callout entirely.

Week list filtering: only shows weeks with actual callouts OR past/current on-call weeks (not future scheduled). Uses `_ocIsPast(k)` filter. Current week always rendered first under "Current" header.

Key functions: `_renderDesktopCallouts()`, `dcoSelectWeek(wk)`, `dcoSelectCo(coId)`, `dcoAddCallout()`, `dcoUpdateField(field, value)`, `dcoDeleteCallout()`, `dcoSaveDraft()`, `dcoDiscardDraft()`, `dcoOpenNoteFs()`

State: `dcoSelectedWeek`, `dcoSelectedCo`

CSS: `.dco-wrap`, `.dco-panel-weeks`, `.dco-panel-callouts`, `.dco-panel-detail`, `.dco-stats`, `.dco-stat`, `.dco-week-row`, `.dco-co-row`, `.dco-detail-hdr`

`renderCalloutsView()` intercept: `if (_isDesktop()) return _renderDesktopCallouts();`

`pasteTicketCreate()` sets `state.dcoSelectedWeek` and `state.dcoSelectedCo` on desktop so pasted callouts appear in the detail panel immediately.

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
`_deletedActIds` object tracks deleted activity IDs with timestamps. 5-minute TTL prevents resurrection by sync mechanisms (poll, merge-on-save, snapshot). `removeActivity()` calls `_trackDeletedAct(actId)` before filtering. All three sync paths check `_isRecentlyDeleted(id)`.

### Firestore IndexedDB Cache Corruption
`?cleanup=1` URL parameter nukes Firestore's local IndexedDB caches (built into app since v5.1.79). Use when sync behaves inconsistently — `get({source:'server'})` can return cached data from corrupted IndexedDB even when claiming server source. Ad blockers (uBlock Origin Lite) can also interfere with Firestore network requests.

## Themes — All Done
All planned themes are implemented: Codex, dark, champagne, champagne-dark, ios, apple, gray, gameboy, win31, lcd, spectrum, retro. To add more: copy an existing `[data-theme="..."]` block, rename, change variable values, register in `THEME_META`.

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
