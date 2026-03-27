# Claude Memory Export - Rian Project

**Export Date:** March 27, 2026

---

## User Profile

**Name:** Rob
**Email:** morow01@gmail.com
**Windows Path:** C:\Users\morow\OneDrive\Vibe Code\TimeSheet

Rob builds and maintains Rian, a field technician timesheet app. He works on both the frontend (HTML/CSS/JS PWA) and backend (Google Apps Script, Firebase). He uses Windows (PowerShell scripts in the repo) and deploys via GitHub. He expects Claude to remember the project context between sessions and work efficiently without excessive clarification.

**Preferences:**
- Prefers concise responses
- Expects familiarity with project across sessions
- Needs version number changes visible in app UI to know when updates are deployed on mobile

---

## Project: Rian PWA

Rian is a Progressive Web App for field technicians — timesheets, notes, site finder, routines, and on-call scheduling.

**Key Files:**
- `app.html` — main app (single-file PWA with inline JS, VERSION const at line 8700)
- `index.html` — production landing page
- `landing-preview.html` — preview landing page with proposed changes
- `Code.gs` — Google Apps Script backend
- `manifest.json` — PWA manifest (name: "Rian")
- `functions/` — Firebase Cloud Functions (reminders)

**Version Tracking:**
- Tracked in 4 places: `app.html` (VERSION const, line 8700), `index.html` (3 spots in UI text, lines 372, 413, 985)
- Format: 4.X.Y (currently at v4.26.1)
- **IMPORTANT:** Don't exceed 99 for minor version (Y). When Y=99, bump X and reset Y=0. Example: 4.25.99 → 4.26.0

**Git:**
- Remote: https://github.com/morow01/rian.git
- Branch: main
- Commit style: `fix:`/`feat:` prefix with version in parens, e.g. "fix: suppress password manager (v4.26.1)"
- Always run `git push origin main` after commits so user can test on mobile

---

## Recent Work Summary (v4.26.0-4.26.1)

### Password Manager Issue - SOLVED
**Problem:** Google Password Manager popup appeared on Chrome mobile for:
- TAG NAME field in Notes Tag Manager
- HOURS inputs (type="number") in Tasks
- CALLOUT fields

**Solution Implemented (v4.26.1):**
1. TAG NAME: Changed `<textarea>` to `<input type="search">` (bypasses password manager heuristics)
2. HOURS inputs (all 4 places): Changed `type="number"` to `type="text"` with `inputmode="decimal"` and `pattern="[0-9]*"`
3. Voice Confirm Modal: Added full attribute suite (`autocomplete="off"` + data attributes) to vc-hrs, vc-ot, nvc-desc

**Key Insight:** Chrome password manager treats different input types differently. `type="search"` and `type="text"` bypass detection, while `type="number"` triggers it aggressively.

**Status:** Awaiting user test on Chrome mobile to confirm fix works.

### Earlier Work (v4.25.81-4.25.100)
- Swipe gesture feedback refinement (icon pulse timing, rounded corners)
- Data loss incident debugging (service worker cache issue)
- Multiple password manager suppression attempts (autocomplete, data attributes, form wrappers)

---

## Development Notes

**Mobile Testing:**
- User tests on Chrome mobile PWA and Firefox
- Must clear cache/service worker to see updates
- Can verify version changed in app UI (shows at v4.26.1 location in landing page)

**Chrome Mobile Limitations:**
- Firefox PWA has no password manager issues
- Desktop has no issues
- Appears to be Chrome mobile specific behavior

**Git Workflow:**
1. Make changes locally
2. Update VERSION in all 4 locations
3. Commit with proper format
4. Push to remote
5. User clears cache and tests

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `git add -A && git commit -m "..."` | Commit changes |
| `git push origin main` | Push to GitHub |
| VERSION at line 8700 | app.html version constant |
| Lines 372, 413, 985 | index.html version locations |

