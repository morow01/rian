param(
  [string]$Root = '\\Synology1621\Hovorene Slovo\Hovorene slovo',
  [string]$FfmpegPath = 'C:\Users\morow\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe',
  [string]$FfprobePath = 'C:\Users\morow\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffprobe-8.0.1-full_build\bin\ffprobe.exe',
  [string]$AnalyzerScript = 'C:\Users\morow\OneDrive\Vibe Code\TimeSheet\scripts\audio-tools\analyze-speaker-variation.js',
  [string]$ReportPath = '\\Synology1621\Hovorene Slovo\Hovorene slovo\hybrid-audiobook-audit-report.json',
  [switch]$ApplyMoves
)

$ErrorActionPreference = 'Stop'

$audiobookPath = Join-Path $Root '-= Audioknihy =-'
$dramaPath = Join-Path $Root '-= Rozhlasove Hry =-'
$manualPath = Join-Path $Root '-= Manual Check =-'
$audioExt = @('.mp3', '.m4a', '.ogg', '.flac', '.wav', '.wma', '.aac')

if (-not (Test-Path -LiteralPath $manualPath)) {
  New-Item -ItemType Directory -Path $manualPath | Out-Null
}

function Get-AudioFiles {
  param([string]$ItemPath)

  Get-ChildItem -LiteralPath $ItemPath -Recurse -File |
    Where-Object { $audioExt -contains $_.Extension.ToLowerInvariant() } |
    Sort-Object Name
}

function Get-SampleFiles {
  param([System.IO.FileInfo[]]$Files)

  if (-not $Files -or -not $Files.Count) {
    return @()
  }

  $indexes = New-Object System.Collections.Generic.List[int]
  $indexes.Add(0)
  if ($Files.Count -gt 2) {
    $indexes.Add([int][Math]::Floor($Files.Count / 2))
  }
  if ($Files.Count -gt 1) {
    $indexes.Add($Files.Count - 1)
  }

  $uniqueIndexes = $indexes | Select-Object -Unique
  return $uniqueIndexes | ForEach-Object { $Files[$_] }
}

function Get-RepresentativeAudioFile {
  param([System.IO.FileInfo[]]$Files)

  if (-not $Files -or -not $Files.Count) {
    return $null
  }

  return $Files | Sort-Object Length -Descending | Select-Object -First 1
}

function Get-TagText {
  param(
    [string]$FfprobePath,
    [string]$AudioPath
  )

  $output = & $FfprobePath -v error -show_entries format_tags=genre,comment,title,artist,album -of default=noprint_wrappers=1:nokey=0 $AudioPath 2>$null
  return ($output -join "`n")
}

function Add-Reason {
  param(
    [System.Collections.Generic.List[string]]$Reasons,
    [string]$Reason
  )

  if (-not $Reasons.Contains($Reason)) {
    $Reasons.Add($Reason) | Out-Null
  }
}

function Score-TextSignals {
  param(
    [string]$Text,
    [System.Collections.Generic.List[string]]$Reasons
  )

  $score = 0
  if ([string]::IsNullOrWhiteSpace($Text)) {
    return $score
  }

  if ($Text -match 'Rozhlasová hra|Rozhlasova hra|Rozhlasový seriál|Rozhlasovy serial|Rozhlasová pohádka|Rozhlasova pohadka|Hra pro ml[aá]de[zž]|Hra pro d[eě]ti') {
    $score += 7
    Add-Reason $Reasons 'explicit-radio-genre'
  }
  if ($Text -match 'Dramatizace|dramatizace|dramatizovan') {
    $score += 3
    Add-Reason $Reasons 'dramatization'
  }
  if ($Text -match 'Osoby a obsaz|obsazení|obsazeni|účinkují|ucinkuji|účinkuje|ucinkuje') {
    $score += 2
    Add-Reason $Reasons 'cast-list'
  }
  if ($Text -match 'Prix Italia') {
    $score += 2
    Add-Reason $Reasons 'award-drama'
  }
  if ($Text -match 'Vltava|ČRo|CRO|Rádio|Radio Proglas|rozhlasov') {
    $score += 1
    Add-Reason $Reasons 'broadcast-context'
  }
  if ($Text -match 'Audiokniha|Audiobook|Knihy a.mluvené slovo|Knihy a mluvené slovo|Četba na pokračování|Cetba na pokracovani|Letní čtení|Letni cteni') {
    $score -= 2
    Add-Reason $Reasons 'audiobook-signal'
  }

  return $score
}

function Get-TitleSuspicionScore {
  param([string]$Name)

  $score = 0
  if ($Name -match '(^|[ _\-\(])hra([ _\-\)]|$)') { $score += 1 }
  if ($Name -match 'divadlo|kabaret|panoptikum|ministr|pohadk') { $score += 1 }
  if ($Name -match 'cimrman|narozny|brodsky|r[uů]zn[ií] interpreti') { $score += 1 }
  return $score
}

function Get-HybridDecision {
  param(
    [int]$MetaScore,
    [string]$AudioOverall
  )

  if ($MetaScore -ge 7) {
    return 'Drama'
  }
  if ($MetaScore -ge 4 -and $AudioOverall -in @('likely-multi-voice', 'possibly-multi-voice')) {
    return 'Drama'
  }
  if ($MetaScore -ge 3 -and $AudioOverall -eq 'likely-multi-voice') {
    return 'Drama'
  }
  if ($MetaScore -ge 4) {
    return 'Manual'
  }
  if ($MetaScore -ge 2 -and $AudioOverall -in @('likely-multi-voice', 'possibly-multi-voice')) {
    return 'Manual'
  }
  return 'Keep'
}

$results = New-Object System.Collections.Generic.List[object]
$items = Get-ChildItem -LiteralPath $audiobookPath -Directory
$index = 0
$total = $items.Count

foreach ($item in $items) {
  $index += 1
  Write-Output ("[{0}/{1}] {2}" -f $index, $total, $item.Name)

  $audioFiles = @(Get-AudioFiles -ItemPath $item.FullName)
  if (-not $audioFiles.Count) {
    $results.Add([pscustomobject]@{
      name = $item.Name
      metaScore = 0
      titleScore = 0
      audioOverall = 'no-audio'
      decision = 'Keep'
      moved = $false
      reasons = @()
    })
    continue
  }

  $reasons = New-Object System.Collections.Generic.List[string]
  $metaScore = 0

  $sampleFiles = @(Get-SampleFiles -Files $audioFiles)
  foreach ($sampleFile in $sampleFiles) {
    $metaScore += Score-TextSignals -Text (Get-TagText -FfprobePath $FfprobePath -AudioPath $sampleFile.FullName) -Reasons $reasons
  }

  $metaFiles = Get-ChildItem -LiteralPath $item.FullName -File | Where-Object { $_.Extension -in '.txt', '.nfo' }
  foreach ($metaFile in $metaFiles) {
    $text = (Get-Content -LiteralPath $metaFile.FullName -TotalCount 120 -ErrorAction SilentlyContinue) -join "`n"
    $metaScore += Score-TextSignals -Text $text -Reasons $reasons
  }

  $titleScore = Get-TitleSuspicionScore -Name $item.Name
  if ($titleScore -gt 0) {
    $metaScore += $titleScore
    Add-Reason $reasons 'title-suspicion'
  }

  $audioOverall = 'not-run'
  $analysisSamples = @()
  $shouldAnalyzeAudio = $metaScore -ge 2
  if ($shouldAnalyzeAudio) {
    $representative = Get-RepresentativeAudioFile -Files $audioFiles
    if ($representative) {
      $analysis = (& node $AnalyzerScript $FfmpegPath $FfprobePath $representative.FullName | Out-String | ConvertFrom-Json)
      $audioOverall = $analysis.overall
      $analysisSamples = $analysis.samples
      switch ($audioOverall) {
        'likely-multi-voice' {
          $metaScore += 3
          Add-Reason $reasons 'audio-multi'
        }
        'possibly-multi-voice' {
          $metaScore += 1
          Add-Reason $reasons 'audio-possible-multi'
        }
        'likely-single-narrator' {
          $metaScore -= 1
          Add-Reason $reasons 'audio-single'
        }
      }
    }
  }

  $decision = Get-HybridDecision -MetaScore $metaScore -AudioOverall $audioOverall
  $moved = $false

  if ($ApplyMoves) {
    if ($decision -eq 'Drama') {
      $destination = Join-Path $dramaPath $item.Name
      if (-not (Test-Path -LiteralPath $destination)) {
        Move-Item -LiteralPath $item.FullName -Destination $destination
        $moved = $true
      }
    } elseif ($decision -eq 'Manual') {
      $destination = Join-Path $manualPath $item.Name
      if (-not (Test-Path -LiteralPath $destination)) {
        Move-Item -LiteralPath $item.FullName -Destination $destination
        $moved = $true
      }
    }
  }

  $results.Add([pscustomobject]@{
    name = $item.Name
    metaScore = $metaScore
    titleScore = $titleScore
    audioOverall = $audioOverall
    decision = $decision
    moved = $moved
    reasons = @($reasons)
    sampledFiles = @($sampleFiles | ForEach-Object { $_.Name })
    audioSamples = $analysisSamples
  })
}

$results | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $ReportPath -Encoding UTF8

Write-Output '--- Summary ---'
$results | Group-Object decision | Sort-Object Name | ForEach-Object { '{0}: {1}' -f $_.Name, $_.Count }
Write-Output ('Moves applied: ' + (($results | Where-Object { $_.moved }).Count))
