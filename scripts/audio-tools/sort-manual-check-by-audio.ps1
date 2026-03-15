param(
  [string]$Root = '\\Synology1621\Hovorene Slovo\Hovorene slovo',
  [string]$FfmpegPath = 'C:\Users\morow\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe',
  [string]$FfprobePath = 'C:\Users\morow\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffprobe.exe',
  [string]$AnalyzerScript = 'C:\Users\morow\OneDrive\Vibe Code\TimeSheet\scripts\audio-tools\analyze-speaker-variation.js',
  [string]$ReportPath = '\\Synology1621\Hovorene Slovo\Hovorene slovo\audio-sort-report.json'
)

$ErrorActionPreference = 'Stop'

$manualPath = Join-Path $Root '-= Manual Check =-'
$audiobookPath = Join-Path $Root '-= Audioknihy =-'
$dramaPath = Join-Path $Root '-= Rozhlasove Hry =-'
$audioExt = @('.mp3', '.m4a', '.ogg', '.flac', '.wav', '.wma', '.aac')

function Get-RepresentativeAudioFile {
  param([string]$ItemPath)

  if (Test-Path -LiteralPath $ItemPath -PathType Leaf) {
    return Get-Item -LiteralPath $ItemPath
  }

  return Get-ChildItem -LiteralPath $ItemPath -Recurse -File |
    Where-Object { $audioExt -contains $_.Extension.ToLowerInvariant() } |
    Sort-Object Length -Descending |
    Select-Object -First 1
}

function Get-TargetBucket {
  param([string]$Overall)

  switch ($Overall) {
    'likely-single-narrator' { return 'Audiobook' }
    'likely-multi-voice' { return 'Drama' }
    default { return 'Manual' }
  }
}

$results = New-Object System.Collections.Generic.List[object]
$items = Get-ChildItem -LiteralPath $manualPath -Force
$total = $items.Count
$index = 0

foreach ($item in $items) {
  $index += 1
  Write-Output ("[{0}/{1}] {2}" -f $index, $total, $item.Name)

  $audio = Get-RepresentativeAudioFile -ItemPath $item.FullName
  if (-not $audio) {
    $results.Add([pscustomobject]@{
      name = $item.Name
      source = $item.FullName
      analyzedFile = $null
      overall = 'no-audio'
      target = 'Manual'
      moved = $false
    })
    continue
  }

  $json = & node $AnalyzerScript $FfmpegPath $FfprobePath $audio.FullName
  $analysis = $json | ConvertFrom-Json
  $target = Get-TargetBucket -Overall $analysis.overall
  $moved = $false

  if ($target -eq 'Audiobook') {
    $dest = Join-Path $audiobookPath $item.Name
    if (-not (Test-Path -LiteralPath $dest)) {
      Move-Item -LiteralPath $item.FullName -Destination $dest
      $moved = $true
    }
  } elseif ($target -eq 'Drama') {
    $dest = Join-Path $dramaPath $item.Name
    if (-not (Test-Path -LiteralPath $dest)) {
      Move-Item -LiteralPath $item.FullName -Destination $dest
      $moved = $true
    }
  }

  $results.Add([pscustomobject]@{
    name = $item.Name
    source = $item.FullName
    analyzedFile = $audio.FullName
    overall = $analysis.overall
    target = $target
    moved = $moved
    samples = $analysis.samples
  })
}

$results | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $ReportPath -Encoding UTF8

$summary = $results | Group-Object target | Sort-Object Name | ForEach-Object {
  '{0}: {1}' -f $_.Name, $_.Count
}

Write-Output '--- Summary ---'
$summary
