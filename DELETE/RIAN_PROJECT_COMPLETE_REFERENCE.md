# RIAN PROJECT - COMPLETE TECHNICAL REFERENCE
**Last Updated:** March 27, 2026 | **Current Version:** 4.26.1

---

## TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [User Profile](#user-profile)
3. [Development Setup](#development-setup)
4. [Architecture & Key Files](#architecture--key-files)
5. [Current Work Status](#current-work-status)
6. [Session History (v4.25.81 - v4.26.1)](#session-history-v42581---v42661)
7. [Technical Details by Feature](#technical-details-by-feature)
8. [Known Issues & Solutions](#known-issues--solutions)
9. [Git Workflow & Versioning](#git-workflow--versioning)
10. [Mobile Testing Guide](#mobile-testing-guide)

---

## PROJECT OVERVIEW

**Rian** is a Progressive Web App (PWA) for field technicians to manage:
- **Timesheets** - Track ordinary and overtime hours daily
- **Notes** - Create notes with custom tags, pin/delete functionality
- **Site Finder** - Location search and history
- **Routines** - Predefined task templates
- **On-Call Scheduling** - On-call calendar with incident logging (callouts)

**Technology Stack:**
- Frontend: Single-file HTML/CSS/JavaScript PWA (app.html)
- Backend: Google Apps Script (Code.gs) + Firebase Firestore
- Cloud Functions: Firebase Cloud Functions for reminders
- Deployment: GitHub Pages (morow01/rian repo)
- Mobile: Both PWA and responsive web on Chrome/Firefox mobile

---

## USER PROFILE

**Name:** Rob
**Email:** morow01@gmail.com
**Windows Path:** C:\Users\morow\OneDrive\Vibe Code\TimeSheet
**GitHub:** morow01 (morow01/rian repo)

**Working Style:**
- Prefers concise, direct responses
- Expects deep project familiarity across sessions
- Works efficiently - minimal back-and-forth needed
- Tests extensively on mobile (Chrome PWA, Firefox, desktop)
- Values version visibility in app UI for knowing when updates deploy

**Environment:**
- Windows 11 machine with PowerShell scripts in repo
- Tests on mobile (Chrome mobile, Firefox mobile, desktop Chrome)
- Needs to see version number change in app to confirm updates (since PWA caching makes it unclear)

---

## DEVELOPMENT SETUP

**Repository:** https://github.com/morow01/rian.git
**Branch:** main
**Local Testing:** localhost:3000 (when running locally)

**Key Directories:**
```
TimeSheet/
├── app.html                 (Main PWA - 21000+ lines)
├── index.html              (Landing page)
├── manifest.json           (PWA manifest)
├── Code.gs                 (Google Apps Script backend)
├── functions/              (Firebase Cloud Functions)
├── scripts/                (PowerShell utilities)
├── _mockups/               (Design references)
└── firebase.json           (Firebase config)
```

**Local Development:**
- Edit app.html directly (all code inline)
- Test in browser
- Push to GitHub
- User clears PWA cache on mobile to see updates
- Version number in app.html indicates which version is deployed

---

## ARCHITECTURE & KEY FILES

### app.html (Single-File PWA)
**Size:** 21,000+ lines with inline HTML/CSS/JavaScript
**VERSION constant location:** Line 8700
**Key Sections:**

| Line Range | Section | Purpose |
|-----------|---------|---------|
| 1-200 | DOCTYPE, head, manifest link | Page setup |
| 200-8000 | CSS styles (inline `<style>`) | All app styling |
| 8000-15000 | HTML template (div#app) | App layout |
| 15000+ | JavaScript (inline `<script>`) | Logic and state management |

**State Management:**
- Global `state` object holds all app data
- `render()` function updates DOM based on state
- Firebase listener syncs Firestore changes to state
- IndexedDB for offline caching (dbPut, dbGet)

**Key Variables/Objects:**
- `state.tasks` - Array of task objects
- `state.notes` - Array of note objects
- `state.callouts` - Array of callout objects (on-call incidents)
- `state.categories` - Note tag/category objects
- `CAT_COLORS` - Predefined tag colors (line ~14200)
- `NOTE_ICON_SVGS` - Inline SVG icons for tags (line ~14100)

### index.html (Landing Page)
**Version locations:** Lines 372, 413, 985
**Purpose:** Public landing page with app preview
**Contains:** Branding, feature descriptions, app screenshots

### Code.gs (Google Apps Script Backend)
**Purpose:** Server-side logic for Firestore operations
**Integration:** Called from app.html via fetch()

### manifest.json (PWA Manifest)
**App Name:** Rian
**Enables:** Installable PWA, offline functionality, home screen icon

---

## CURRENT WORK STATUS

### Latest: v4.26.1 - Password Manager Suppression (TESTING)

**Problem:** Google Password Manager popup appeared on Chrome mobile for:
1. TAG NAME field in Notes Tag Manager modal
2. HOURS inputs (Ordinary and Overtime) in Tasks
3. CALLOUT description field

**Root Cause:** Chrome mobile's password manager is aggressive with certain input types:
- `type="number"` triggers password manager detection
- Nested forms or modals trigger different detection behavior
- Firefox and desktop Chrome don't have this issue

**Solution Implemented:**

**1. TAG NAME Input (Line 14263-14264)**
- **Before:** `<textarea>` with inline `style="resize:none;overflow:hidden"`
- **After:** `<input type="search">` with proper styling
- **Rationale:** `type="search"` bypasses password manager heuristics

**2. HOURS Inputs (4 locations)**

a) **Detail View - Ordinary Hours (Line 11649)**
```html
<!-- Before -->
<input type="number" step="1" min="0" ... />

<!-- After -->
<input type="text" inputmode="decimal" pattern="[0-9]*" ... />
```

b) **Detail View - Overtime Hours (Line 11657)**
- Same change as above

c) **Table View - Ordinary Hours (Line 11058)**
- Same change: type="number" → type="text" with inputmode="decimal"

d) **Table View - Overtime Hours (Line 11063)**
- Same change: type="number" → type="text" with inputmode="decimal"

**3. Voice Confirm Modal Inputs (Lines 20995, 20999, 21121)**
- Added attributes: `autocomplete="off" data-lpignore="true" data-form-type="other" data-1p-ignore="true"`
- Changed type="number" to type="text" with inputmode="decimal"

**Status:** Awaiting user test on Chrome mobile to confirm fix works

---

## SESSION HISTORY (v4.25.81 - v4.26.1)

### v4.25.81 - Swipe Gesture Bottom Corners Fix
**Issue:** Bottom corners of note cards were not rounded during swipe animation
**Fix:** Changed `.note-row` border-radius from `16px 16px 0 0` to `16px` (all corners)
**Location:** CSS around line 7100

### v4.25.82-84 - Swipe Action Timing Issues
**Issue:** Swipe action fired before pulse animation completed, visual feedback was premature
**Fix:** Increased setTimeout delay from 220ms to 380ms to let 350ms pulse animation finish
**Location:** Line 13783-13784 (touchend handler)

**Code Detail:**
```javascript
// Was: setTimeout(() => { performAction(); }, 220);
// Now: setTimeout(() => { performAction(); }, 380);
```

**Additional Fix:** Keep row displaced during pulse, snap back only after action fires (v4.25.85)
**Location:** Lines 13779-13783

### v4.25.86 - Swipe Rounded Corners During Animation
**Issue:** Rounded corners were lost during animation
**Fix:** Keep row displaced during pulse (don't snap back early)
**Status:** Changed to keep row position stable during pulse animation

### v4.25.90-91 - On-Call Calendar Opacity
**Issue:** Past on-call shifts should be visually distinguished
**Fix:** Added `.oc-cell.oc-past.oc-oncall { opacity: 0.4; }`
**Location:** Lines 7436-7453 and line 17350

**Code Change (Line 17350):**
```javascript
// Was: if (past && !type)
// Now: if (past)
// This applies oc-past class to all past cells including oncall/extra
```

### v4.25.91+ - Password Manager Suppression Attempts (EXTENSIVE TROUBLESHOOTING)

**Problem:** Google Password Manager popup on TAG NAME, HOURS, CALLOUT fields on Chrome mobile

**Attempt 1: autocomplete="off"**
- **Result:** No effect on Chrome mobile
- **Firefox:** Works perfectly
- **Note:** DESCRIPTION field also has this but works fine

**Attempt 2: data-lpignore="true"** (LastPass ignore)
- **Result:** No effect
- **Also tried:** `data-form-type="other"`, `data-1p-ignore="true"`

**Attempt 3: Different input types**
- Tried: `type="search"`, `type="password"` (rejected), `type="hidden"` (rejected)
- **Result:** type="search" showed promise, added to final solution

**Attempt 4: readonly + animationstart interception**
- **Code Location:** Line 20897-20917
- **Result:** Ineffective, removed in v4.25.98

**Attempt 5: Form wrappers with onsubmit="return false"**
- **Structure:** `<form autocomplete="off" onsubmit="return false"><textarea/></form>`
- **Result:** No effect; TAG NAME still triggered password manager

**Attempt 6: textarea conversion for TAG NAME**
- **Changed from:** input type="search" to textarea
- **Result:** Still triggered password manager despite identical attributes to DESCRIPTION

**Key Discovery:** DESCRIPTION field works fine despite identical code structure and attributes to TAG NAME. This led to hypothesis that Chrome detects context differently (modal vs inline, edit vs create, etc.)

**Attempt 7: overflow:hidden removal**
- **First attempt:** Removed from parent container (.note-cat-form.ncf-open)
- **Result:** No effect

- **Second attempt:** Removed inline overflow:hidden from TAG NAME textarea itself
- **Result:** No effect (and was changed back anyway)

**Final Solution: Input type strategy (v4.26.1)**
- Combined: type="search" for TAG NAME + type="text" for numbers
- Added: inputmode="decimal" + pattern="[0-9]*" for numeric inputs
- Rationale: Chrome treats different input types differently; text/search bypass detection

### v4.25.100 - Data Loss Incident (RESOLVED)
**Issue:** User cleared browser cache to test password manager suppression; Friday's tasks and callouts disappeared from Chrome mobile
**Root Cause:** Service worker cache corruption during cache clear
**Solution:** Clear cache again + refresh, service worker rebuilds from Firestore
**Status:** Confirmed data safe in Firestore, cache issue only, not actual data loss

### v4.26.0 → v4.26.1 - Version Bump
**Reason:** User needs version number visibility on mobile to know when updates deploy
**Updated:** Line 8700 (app.html), Lines 372/413/985 (index.html)

---

## TECHNICAL DETAILS BY FEATURE

### Notes Feature
**Files:** app.html Lines ~13400-14500 (Notes section rendering)

**Structure:**
- Notes displayed as cards in scrollable list
- Each note has: id, title, content (description), tags (categories), pin status
- Clicking note opens detail view
- Swipe left/right to delete/mark done or reopen

**Tag Manager:**
```
Location: buildNoteCatFormHtml() - Line 14249
Container: .note-cat-form - Line 4901 (CSS)
Trigger: "Edit Tags" button in note card
Modal shows: Tag name input, color picker, icon picker, preview
```

**Colors (CAT_COLORS):** Line ~14200
**Icons (NOTE_ICON_SVGS):** Line ~14100

**Swipe Gestures (Notes):**
- Swipe right: Mark done (shows pulse icon, reopens if already done)
- Swipe left: Delete (shows trash icon)
- Threshold: 40% of card width to trigger
- Animation: 350ms pulse effect, action executes at 380ms

### Tasks/Timesheet Feature
**Files:** app.html Lines ~11000-12000 (Task rendering)

**Structure:**
- Weekly view with expandable day cards
- Each day shows: date, task count
- Expanded day shows: list of tasks with hours, description, location, codes
- Add task button at bottom

**Task Fields:**
- Description: textarea (works perfectly, no password manager issue)
- Ordinary Hours: input type="text" inputmode="decimal"
- Overtime Hours: input type="text" inputmode="decimal"
- Location: Input with location modal picker
- Codes: Multi-select dropdown

**Hours Input Locations:**
1. Detail view (expandable task card) - Lines 11649, 11657
2. Table view (alternative view) - Lines 11058, 11063

### On-Call Calendar (Callouts)
**Files:** app.html Lines ~9300-10000 (State & logic)

**Structure:**
- Calendar grid showing on-call assignments
- Colors: Oncall (blue) vs Extra (orange) vs Past (faded)
- Click to add incident (callout)
- Callout fields: Description, Location, Hours

**Callout Form:**
- Rendered inline in callouts section
- Fields inside form with autocomplete="off"
- Location picker integration

### Voice Entry Feature
**Files:** app.html Lines ~19100-21200 (Voice functionality)

**Modules:**
1. **Task Voice Entry (vc-*):** Lines 20994-21005
   - Fields: Hours (vc-hrs, vc-ot), Codes picker
   - Changed to type="text" with decimal input

2. **Note Voice Entry (nvc-*):** Lines 21120-21135
   - Fields: Description (nvc-desc), Location (nvc-loc)
   - Location has button to open location modal

---

## KNOWN ISSUES & SOLUTIONS

### 1. Google Password Manager on Chrome Mobile (v4.26.1 - TESTING)
**Status:** Awaiting test results
**Solution:** Input type changes (search, text instead of number)
**Fallback:** Accept as Chrome limitation; Firefox PWA works fine

### 2. Brave Browser Login Loop (DOCUMENTED)
**Issue:** Login screen appears, user selects Google account, loops back to login
**Root Cause:** Brave blocks third-party cookies by default
**Solution:** Add exception at brave://settings/cookies → [*.]firebaseapp.com
**Status:** Documented, not a bug

### 3. Pinned Notes Not Synchronized
**Issue:** Pinned note on Firefox didn't appear in Chrome
**Status:** RESOLVED - was temporary sync issue, now works across browsers

### 4. Time Format Display (RED COLOR)
**Issue:** Hours displayed as "00;00" instead of "00:00" (with semicolon)
**Fix:** Changed time format string to use colon
**Status:** RESOLVED (v4.25.79 or earlier)

---

## GIT WORKFLOW & VERSIONING

### Version Numbering
**Format:** 4.X.Y where:
- 4 = Major version (unlikely to change)
- X = Minor version (features/major fixes)
- Y = Patch version (bug fixes)

**IMPORTANT CONSTRAINT:** Max Y = 99
- When Y reaches 99, next patch must bump X and reset Y
- Example: 4.25.99 → 4.26.0 (NOT 4.25.100)

### Version Locations (Must Update All 4)
1. **app.html Line 8700:** `const VERSION = '4.26.1';`
2. **index.html Line 372:** `<p>v4.26.1</p>`
3. **index.html Line 413:** `<div class="app-week-sub">Synced · v4.26.1</div>`
4. **index.html Line 985:** `<p>v4.26.1</p>`

### Commit Style
**Format:** `[prefix]: [message] (v[VERSION])`
**Prefixes:**
- `fix:` - Bug fixes, suppression attempts
- `feat:` - New features
- `bump:` - Version number updates only

**Examples:**
```
fix: suppress password manager on HOURS inputs (v4.26.1)
feat: add pin notes functionality (v4.25.95)
bump: version 4.26.1
```

### Git Commands Workflow
```bash
# Make changes to app.html, index.html
# Test locally

# Update VERSION in all 4 locations

# Stage and commit
git add -A
git commit -m "fix: password manager issue (v4.26.1)"

# Push to remote (CRITICAL - user needs this to test on mobile)
git push origin main

# User clears cache and tests on mobile
```

**CRITICAL:** Always `git push origin main` - user tests on mobile via https://morow01.github.io/rian/app.html

---

## MOBILE TESTING GUIDE

### Chrome Mobile PWA Testing
**URL:** https://morow01.github.io/rian/app.html
**Installation:** "Add to home screen" from Chrome menu

**To See Updates:**
1. User must clear service worker cache:
   - Open DevTools → Application → Service Workers → Unregister
   - Or: Close PWA entirely, reopen, force refresh
2. Check version number in app UI to confirm update
3. Version locations: Bottom of pages, in "Synced" status text

### Cache Issues
**Problem:** PWA caches code aggressively
**Solution:**
1. Pull to refresh in PWA
2. Or: Settings → Clear app data/cache
3. Or: Uninstall and reinstall PWA

**Debugging:** Open in browser DevTools, check Network tab to see if files are cached

### Firefox Mobile PWA
**Advantages:** No password manager issues, works identically to Chrome
**Usage:** Same installation as Chrome, more responsive UI in some areas

### Desktop Testing
**Benefits:** No caching issues, can use DevTools
**Method:** Open https://morow01.github.io/rian/app.html directly in Chrome/Firefox

---

## FEATURE CHECKLIST & IMPLEMENTATION NOTES

### Completed Features
- ✅ Timesheet (daily task tracking)
- ✅ Notes with tags (create, edit, delete, pin)
- ✅ On-call calendar (schedule view with incident logging)
- ✅ Swipe gestures (mark done/delete on cards)
- ✅ Voice entry (AI assistance for task creation)
- ✅ Location search (with history)
- ✅ Firebase sync (real-time across devices)
- ✅ PWA offline capability

### Recent Improvements
- ✅ Icon pulse feedback on swipe (v4.25.81-86)
- ✅ On-call calendar opacity for past shifts (v4.25.91)
- ✅ Password manager suppression attempts (v4.25.90-v4.26.1)

### Known Limitations
- ❌ Password manager still appears on Chrome mobile (workaround in progress)
- ❌ Full-text search not implemented (user uses current search bar)

---

## QUICK REFERENCE FOR NEXT SESSION

**To Continue Work:**
1. Clone/navigate to https://github.com/morow01/rian
2. Open `TimeSheet/app.html` in editor
3. Make changes
4. Update VERSION in 4 locations
5. Commit with proper message format
6. Push to GitHub
7. User tests on mobile

**Common Edits:**
- Add feature → Search HTML section + add JS logic
- Fix bug → Find issue line, test locally, commit
- Password manager → Try different input type/attributes
- Styling → Search CSS section, modify classes

**File to Reference:**
- This document (RIAN_PROJECT_COMPLETE_REFERENCE.md)
- Session transcript: Full details at 0b4cb04f-5a20-4d5a-965f-a49ab90926e0.jsonl

---

**Document Version:** 1.0
**Created:** March 27, 2026
**For:** Continued development on other PC
