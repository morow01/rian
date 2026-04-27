# Memory transfer — PC → Laptop

Snapshot of `.auto-memory/` taken 2026-04-06. Use this to seed Claude's memory on a new machine so it doesn't lose context.

## What's in here

- `MEMORY.md` — the index file (always loaded)
- `user_rob.md` — Rob's developer profile
- `feedback_session_loss.md` — "always save progress to memory" feedback
- `project_conflict_resolution.md` — active sync-conflict UI work
- `reference_claude_reset.md` — pointer to the PowerShell reset script
- `reference_app_map.md` — pointer to `_docs/APP_MAP.md`

## How to install on the laptop

1. Pull the latest `main` branch on the laptop (or copy this folder over by USB / cloud).
2. Open Cowork on the laptop and start a new Claude session in this same TimeSheet folder.
3. Tell Claude: **"Copy every file from `_memory-transfer/` (except this README) into `.auto-memory/`, overwriting whatever is there."**
4. Claude will read each file and write it to its `.auto-memory/` directory.
5. Verify by asking: "What do you remember about me?" — should mention field tech, Rian, sync conflicts, app map.

## Notes

- These files are committed to git, so the laptop just needs `git pull`.
- Refresh this snapshot before any future PC↔laptop swap by asking Claude to re-copy `.auto-memory/*.md` here.
- Safe to commit — no secrets, no personal data beyond Rob's name and dev role.
