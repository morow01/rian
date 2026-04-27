---
name: App map document
description: Location of the living app map for Rian — inventory of every view, modal, and dialog. Survives Claude resets via git.
type: reference
---

The Rian app map lives at **`_docs/APP_MAP.md`** in the TimeSheet repo.

It's organised view-by-view (Timesheet, Notes, Routines, Callouts, Conflicts, AI). Each view section has three layers:

1. Inventory table — DOM id, trigger function, close function, state touched
2. Mermaid flowchart — navigation between view, sub-screens, dialogs
3. Per-modal notes — purpose, when it appears, non-obvious behaviour

**Status as of 2026-04-06:**
- Timesheet section: complete (inventory + Mermaid + per-modal notes)
- Notes / Routines / Callouts / Conflicts / AI: stubbed only
- Screenshots: deferred (Chrome viewport was stuck at innerWidth=110 when this was started)

**How to apply:** when Rob asks "where does X live in the app" or "how does Y get triggered", check APP_MAP.md first before re-grepping app.html. When adding a new modal or view, update APP_MAP.md in the same commit so the map doesn't drift.

The map is committed to git, so it survives Claude resets — unlike conversation context.
