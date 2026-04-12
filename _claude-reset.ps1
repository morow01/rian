# Claude / Cowork reset script
# Run this when Claude starts degrading (slow, forgetful, crashes).
# Wipes VM bundles + caches + agent sessions, then restarts Claude Desktop.
#
# Survives the reset:
#   - Git repo (this folder)
#   - .auto-memory/ folder (mounted by cowork-svc, not in %APPDATA%\Claude)
#
# Lost by the reset:
#   - Current conversation transcript
#   - In-flight todos / context
#   - VM caches (the point — that's what was making Claude bad)
#
# Before running: commit your code, and make sure anything load-bearing
# is written to .auto-memory/ — those two are the lifeline for next-Claude.

# Stop all Claude & CoWorks processes
Write-Host "Stopping Claude..." -ForegroundColor Yellow
Stop-Process -Name "Claude" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "cowork-svc" -Force -ErrorAction SilentlyContinue
Stop-Service CoworkVMService -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Show size before cleanup
Write-Host "`nBefore cleanup:" -ForegroundColor Cyan
$claudePath = "$env:APPDATA\Claude"
"{0:N2} MB" -f ((Get-ChildItem $claudePath -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB)

# Delete VM bundles and cache
$foldersToDelete = @(
    "$env:APPDATA\Claude\vm_bundles",
    "$env:APPDATA\Claude\vm_cache",
    "$env:APPDATA\Claude\vm_warm",
    "$env:APPDATA\Claude\Cache",
    "$env:APPDATA\Claude\Code Cache",
    "$env:APPDATA\Claude\local-agent-mode-sessions",
    "$env:LOCALAPPDATA\.claude-code-cache"
)
foreach ($folder in $foldersToDelete) {
    if (Test-Path $folder) {
        Remove-Item -Path $folder -Recurse -Force
        Write-Host "Deleted: $folder" -ForegroundColor Green
    }
}

Write-Host "`nDone! Restart Claude Desktop." -ForegroundColor Green
Start-Process "shell:AppsFolder\$(Get-StartApps | Where-Object {$_.Name -like '*Claude*'} | Select-Object -First 1 -ExpandProperty AppID)"
