param(
  [Parameter(Mandatory = $true)]
  [string]$RootPath
)

$ErrorActionPreference = 'Stop'

function Get-TextContent {
  param([string]$Path)

  try {
    return [System.IO.File]::ReadAllText($Path)
  } catch {
    return ''
  }
}

function Add-Reason {
  param(
    [System.Collections.Generic.List[string]]$Reasons,
    [string]$Text
  )

  if ($Text -and -not $Reasons.Contains($Text)) {
    $null = $Reasons.Add($Text)
  }
}

function Test-Pattern {
  param(
    [string]$Text,
    [string[]]$Patterns
  )

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return $false
  }

  foreach ($pattern in $Patterns) {
    if ($Text -match $pattern) {
      return $true
    }
  }

  return $false
}

$dramaticPatterns = @(
  'dramatiz',
  'rozhlas',
  'hlas[oa]v[aá]',
  'herec',
  'herci',
  'obsazen',
  'ú?čink',
  'radioh',
  'multihlas'
)

$singlePatterns = @(
  'audiokni',
  'mluven[eé]\s+slovo',
  '\bčte\b',
  '\bcte\b',
  'interpret'
)

$audioExtensions = @('.mp3', '.m4a', '.m4b', '.aac', '.flac', '.wav', '.ogg', '.wma')

$results = foreach ($dir in Get-ChildItem -LiteralPath $RootPath -Directory) {
  $audioFiles = Get-ChildItem -LiteralPath $dir.FullName -File | Where-Object { $audioExtensions -contains $_.Extension.ToLower() }
  $textFiles = Get-ChildItem -LiteralPath $dir.FullName -File | Where-Object { $_.Extension -in '.txt', '.nfo', '.m3u' }

  $reasons = New-Object 'System.Collections.Generic.List[string]'
  $folderText = $dir.Name
  $allText = $folderText + "`n"

  foreach ($textFile in $textFiles) {
    $allText += Get-TextContent -Path $textFile.FullName
    $allText += "`n"
  }

  $audioCount = $audioFiles.Count
  $scoreDrama = 0
  $scoreSingle = 0

  if (Test-Pattern -Text $allText -Patterns $dramaticPatterns) {
    $scoreDrama += 4
    Add-Reason -Reasons $reasons -Text 'Description or folder text contains dramatization/radio-play terms'
  }

  if (Test-Pattern -Text $allText -Patterns $singlePatterns) {
    $scoreSingle += 2
    Add-Reason -Reasons $reasons -Text 'Description or folder text contains audiobook/spoken-word terms'
  }

  if ($folderText -match '\(audio\)') {
    $scoreSingle += 2
    Add-Reason -Reasons $reasons -Text 'Folder name is labeled as audio'
  }

  if ($audioCount -ge 10 -and ($audioFiles | Where-Object Extension -eq '.mp3').Count -ge 8) {
    $scoreSingle += 2
    Add-Reason -Reasons $reasons -Text 'Many chapter-like MP3 files suggest a conventional audiobook rip'
  }

  if ($audioCount -eq 1 -and ($audioFiles[0].Extension.ToLower() -in '.m4a', '.m4b', '.aac')) {
    $scoreDrama += 1
    Add-Reason -Reasons $reasons -Text 'Single packaged AAC/M4A file is common for broadcast/dramatized releases'
  }

  $classification = 'Unclear'
  $confidence = 'Low'

  if ($scoreDrama -ge ($scoreSingle + 2)) {
    $classification = 'Likely dramatized / multi-voice'
    $confidence = if ($scoreDrama -ge 4) { 'High' } else { 'Medium' }
  } elseif ($scoreSingle -ge ($scoreDrama + 2)) {
    $classification = 'Likely single narrator'
    $confidence = if ($scoreSingle -ge 4) { 'High' } else { 'Medium' }
  }

  [PSCustomObject]@{
    Folder = $dir.Name
    AudioFiles = $audioCount
    Formats = (($audioFiles | Group-Object Extension | ForEach-Object { '{0}:{1}' -f $_.Name, $_.Count }) -join ', ')
    Classification = $classification
    Confidence = $confidence
    Reasons = ($reasons -join '; ')
  }
}

$results | Sort-Object Folder
