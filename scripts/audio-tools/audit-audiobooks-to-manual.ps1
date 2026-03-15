param(
  [string]$Root = '\\Synology1621\Hovorene Slovo\Hovorene slovo',
  [string]$FfmpegPath = 'C:\Users\morow\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe',
  [string]$FfprobePath = 'C:\Users\morow\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffprobe.exe',
  [string]$AnalyzerScript = 'C:\Users\morow\OneDrive\Vibe Code\TimeSheet\scripts\audio-tools\analyze-speaker-variation.js',
  [string]$ReportPath = '\\Synology1621\Hovorene Slovo\Hovorene slovo\audiobook-audit-report.json'
)

$ErrorActionPreference = 'Stop'

$audiobookPath = Join-Path $Root '-= Audioknihy =-'
$manualPath = Join-Path $Root '-= Manual Check =-'
$audioExt = @('.mp3', '.m4a', '.ogg', '.flac', '.wav', '.wma', '.aac')

function Get-RepresentativeAudioFile {
  param([string]$ItemPath)

  return Get-ChildItem -LiteralPath $ItemPath -Recurse -File |
    Where-Object { $audioExt -contains $_.Extension.ToLowerInvariant() } |
    Sort-Object Length -Descending |
    Select-Object -First 1
}

$items = Get-ChildItem -LiteralPath $audiobookPath -Force
$results = New-Object System.Collections.Generic.List[object]
$index = 0
$total = $items.Count

foreach ($item in $items) {
  $index += 1
  Write-Output ("[{0}/{1}] {2}" -f $index, $total, $item.Name)

  $audio = Get-RepresentativeAudioFile -ItemPath $item.FullName
  if (-not $audio) {
    $results.Add([pscustomobject]@{
      name = $item.Name
      analyzedFile = $null
      overall = 'no-audio'
      moved = $false
    })
    continue
  }

  $analysis = (& node $AnalyzerScript $FfmpegPath $FfprobePath $audio.FullName | Out-String | ConvertFrom-Json)
  $moveToManual = $analysis.overall -ne 'likely-single-narrator'
  $moved = $false

  if ($moveToManual) {
    $dest = Join-Path $manualPath $item.Name
    if (-not (Test-Path -LiteralPath $dest)) {
      Move-Item -LiteralPath $item.FullName -Destination $dest
      $moved = $true
    }
  }

  $results.Add([pscustomobject]@{
    name = $item.Name
    analyzedFile = $audio.FullName
    overall = $analysis.overall
    moved = $moved
    samples = $analysis.samples
  })
}

$results | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $ReportPath -Encoding UTF8
Write-Output '--- Summary ---'
$results | Group-Object overall | Sort-Object Name | ForEach-Object { '{0}: {1}' -f $_.Name, $_.Count }
Write-Output ('Moved to Manual: ' + (($results | Where-Object { $_.moved }).Count))
