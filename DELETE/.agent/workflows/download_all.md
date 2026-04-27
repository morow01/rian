---
description: Download all remaining torrents from SkTorrent Category 24
---

// turbo-all

1. Use a browser subagent to extract torrent IDs and titles for pages 12 through 216.
2. Save these IDs incrementally to `Torrents/all_ids_remaining.json`.
3. Use a PowerShell script (with the active session cookies) to batch download the `.torrent` files into the `Torrents` folder.
4. Verify the total count of downloaded files.
5. Notify the user upon completion.
