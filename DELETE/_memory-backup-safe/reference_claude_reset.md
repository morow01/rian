---
name: Claude reset script location
description: Path to Rob's PowerShell script that resets Claude when it degrades, and what survives the reset
type: reference
---

When Rob says "I had to reset" or "you crashed again", he ran the script at:

**`<repo>/_claude-reset.ps1`** (in the TimeSheet workspace folder)

The script stops Claude.exe + cowork-svc + CoworkVMService, then deletes:
- `%APPDATA%\Claude\vm_bundles`
- `%APPDATA%\Claude\vm_cache`
- `%APPDATA%\Claude\vm_warm`
- `%APPDATA%\Claude\Cache`
- `%APPDATA%\Claude\Code Cache`
- `%APPDATA%\Claude\local-agent-mode-sessions`
- `%LOCALAPPDATA%\.claude-code-cache`

Then relaunches Claude Desktop.

**What survives the reset (and is therefore the only continuity between Claude instances):**
- Git repo at `mnt/TimeSheet`
- `.auto-memory/` folder (mounted by cowork-svc, lives outside `%APPDATA%\Claude`)

**What dies:**
- Current conversation transcript
- Todo list / in-flight context
- VM caches (which is the point)

**How to apply:** when Rob mentions a reset just happened or is about to happen, the practical action is to (a) make sure any load-bearing work is committed to git, and (b) make sure any context worth preserving is in `.auto-memory/`. Don't promise to "remember" anything that lives only in the current conversation.

Rob is degrading on roughly a weekly cadence — if it happens again soon, worth flagging to Anthropic via thumbs-down feedback as it might indicate a memory leak or context-bloat issue.
