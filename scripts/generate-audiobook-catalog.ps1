param(
  [string]$LibraryRoot = 'E:\CODEX Test Folder\Audiobook',
  [string]$OutputFile = 'E:\CODEX Test Folder\Audiobook\catalog-data.js'
)

$ErrorActionPreference = 'Stop'

$audioExtensions = @('.mp3', '.m4a', '.ogg', '.flac', '.wav', '.wma', '.aac')
$descriptionExtensions = @('.txt', '.nfo')

function Remove-Diacritics {
  param([string]$Text)

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return ''
  }

  $normalized = $Text.Normalize([Text.NormalizationForm]::FormD)
  $builder = New-Object System.Text.StringBuilder

  foreach ($char in $normalized.ToCharArray()) {
    if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$builder.Append($char)
    }
  }

  return $builder.ToString().Normalize([Text.NormalizationForm]::FormC)
}

function Get-NormalizedKey {
  param([string]$Text)

  $ascii = Remove-Diacritics $Text
  $ascii = $ascii.ToLowerInvariant()
  $ascii = $ascii -replace '[^a-z0-9]+', ' '
  return ($ascii -replace '\s+', ' ').Trim()
}

function Normalize-Tag {
  param([string]$Tag)

  $clean = ($Tag -replace '\s+', ' ').Trim(" -.,;:`"'()[]{}")
  if (-not $clean) {
    return $null
  }

  return $clean.ToLowerInvariant()
}

function Add-Tag {
  param(
    [System.Collections.Generic.List[string]]$Tags,
    [string]$Tag
  )

  $normalized = Normalize-Tag $Tag
  if ($normalized -and -not $Tags.Contains($normalized)) {
    $Tags.Add($normalized)
  }
}

function Get-DescriptionText {
  param([string]$FolderPath)

  $folderLeaf = Split-Path $FolderPath -Leaf
  $folderKey = Get-NormalizedKey $folderLeaf

  $descriptionFile = Get-ChildItem -LiteralPath $FolderPath -File |
    Where-Object { $descriptionExtensions -contains $_.Extension.ToLowerInvariant() } |
    Sort-Object @{
      Expression = {
        $nameKey = Get-NormalizedKey $_.BaseName
        if ($nameKey -match 'seznam|odkaz|upload|info') { return 3 }
        if ($folderKey -and $nameKey -and $folderKey.Contains($nameKey.Substring(0, [Math]::Min($nameKey.Length, 12)))) { return 0 }
        return 1
      }
    }, @{
      Expression = { -1 * $_.Length }
    }, Name |
    Select-Object -First 1

  if (-not $descriptionFile) {
    return ''
  }

  try {
    return Get-Content -LiteralPath $descriptionFile.FullName -Raw
  } catch {
    return ''
  }
}

function Get-CleanTitle {
  param(
    [string]$FolderName,
    [string]$DescriptionText
  )

  $firstLine = $null
  if ($DescriptionText) {
    $firstLine = ($DescriptionText -split "`r?`n" |
      ForEach-Object { $_.Trim() } |
      Where-Object { $_ } |
      Select-Object -First 1)
  }

  if ($firstLine) {
    $candidate = $firstLine -replace '\s*\(\d+\s*d[ií]l[ůu]?\)\s*$', ''
    $candidate = $candidate -replace '\s*\(\d+\s*dielov?\)\s*$', ''

    if (
      $candidate.Length -ge 6 -and
      $candidate.Length -le 120 -and
      (Get-NormalizedKey $candidate) -notmatch '^seznam uploadu mluveneho slova'
    ) {
      return $candidate.Trim()
    }
  }

  $title = $FolderName
  $title = $title -replace '_', ' '
  $title = $title -replace '\s+', ' '
  $title = $title -replace '\s+VBR-HQ.*$', ''
  $title = $title -replace '\s+128kbps.*$', ''
  $title = $title -replace '\s+ogg.*$', ''
  $title = $title -replace '\s+mp3.*$', ''
  $title = $title -replace '\s+\d{4}([ _-]\d{2}){1,5}.*$', ''
  $title = $title -replace '\s+\(\d{2}.\d{2}.\d{4}.*$', ''
  return $title.Trim()
}

function Get-Summary {
  param(
    [string]$DescriptionText,
    [string]$FallbackTitle,
    [int]$TrackCount
  )

  if ($DescriptionText) {
    $lines = $DescriptionText -split "`r?`n" |
      ForEach-Object { ($_ -replace '\s+', ' ').Trim() } |
      Where-Object {
        $_ -and
        $_ -notmatch '^(Info|http|https)[:/]?' -and
        $_ -notmatch '^seznam uploadu mluveneho slova' -and
        $_ -notmatch 'pravidelne aktualizace' -and
        $_ -notmatch '^[A-Za-z]:\\'
      }

    if ($lines.Count -gt 1) {
      $summaryLines = @()
      foreach ($line in $lines[1..($lines.Count - 1)]) {
        if ($line.Length -lt 4) {
          continue
        }

        $summaryLines += $line
        if ((($summaryLines -join ' ').Length) -gt 240) {
          break
        }
      }

      if ($summaryLines.Count -gt 0) {
        $summary = ($summaryLines -join ' ')
        if ($summary.Length -gt 280) {
          $summary = $summary.Substring(0, 277).TrimEnd() + '...'
        }
        return $summary
      }
    }
  }

  if ($TrackCount -gt 1) {
    return "Viacdielna nahravka z lokalnej kniznice. Pocet stop: $TrackCount."
  }

  return "Jednodielna nahravka z lokalnej kniznice pre titul $FallbackTitle."
}

function Get-Tags {
  param(
    [string]$Category,
    [string]$Title,
    [string]$DescriptionText,
    [int]$TrackCount
  )

  $tags = New-Object 'System.Collections.Generic.List[string]'

  if ($Category -eq 'Audiokniha') {
    Add-Tag $tags 'audiokniha'
  } else {
    Add-Tag $tags 'rozhlasova hra'
  }

  if ($TrackCount -gt 1) {
    Add-Tag $tags 'viacdielne'
  } else {
    Add-Tag $tags 'jednodielne'
  }

  $haystack = (Get-NormalizedKey "$Title`n$DescriptionText")

  $rules = @(
    @{ Pattern = 'cetba na pokracovani'; Tag = 'ctenie na pokracovanie' },
    @{ Pattern = 'roman'; Tag = 'roman' },
    @{ Pattern = 'povid'; Tag = 'povidka' },
    @{ Pattern = 'poezi|basn|verse'; Tag = 'poezia' },
    @{ Pattern = 'memoar|vzpomink|pameti|spomien'; Tag = 'memoare' },
    @{ Pattern = 'histor'; Tag = 'historicke' },
    @{ Pattern = 'dobrodruz'; Tag = 'dobrodruzstvo' },
    @{ Pattern = 'detektiv|krimi'; Tag = 'detektivka' },
    @{ Pattern = 'filozof'; Tag = 'filozofia' },
    @{ Pattern = 'rozprav|pohad'; Tag = 'rozpravka' },
    @{ Pattern = 'humor|komed'; Tag = 'komedia' },
    @{ Pattern = 'drama|inscen|divadl'; Tag = 'drama' },
    @{ Pattern = 'ucinkuji|obsazeni|role|herec'; Tag = 'viac-hlasov' },
    @{ Pattern = 'proza'; Tag = 'proza' },
    @{ Pattern = 'cestopis|cesta'; Tag = 'cestopis' },
    @{ Pattern = 'duchovn|nabozen'; Tag = 'duchovne' },
    @{ Pattern = 'voj'; Tag = 'vojna' },
    @{ Pattern = 'franci'; Tag = 'francuzsko' },
    @{ Pattern = 'ital'; Tag = 'taliansko' },
    @{ Pattern = 'holands'; Tag = 'holandsko' },
    @{ Pattern = 'cesk'; Tag = 'ceska tvorba' },
    @{ Pattern = 'sloven'; Tag = 'slovenska tvorba' }
  )

  foreach ($rule in $rules) {
    if ($haystack -match $rule.Pattern) {
      Add-Tag $tags $rule.Tag
    }
  }

  return @($tags)
}

function Get-QualityScore {
  param($Item)

  $score = 0
  if ($Item.path -match 'VBR-HQ') { $score += 4 }
  if ($Item.path -match '128kbps') { $score -= 2 }
  if ($Item.path -match 'ogg') { $score -= 1 }
  if ($Item.tracks -gt 1) { $score += 1 }
  return $score
}

$sources = @(
  @{ Category = 'Audiokniha'; Path = Join-Path $LibraryRoot '-= Audioknihy =-' },
  @{ Category = 'Rozhlasová hra'; Path = Join-Path $LibraryRoot '-= Rozhlasove Hry =-' }
)

$catalog = New-Object System.Collections.Generic.List[object]

foreach ($source in $sources) {
  if (-not (Test-Path -LiteralPath $source.Path)) {
    continue
  }

  Get-ChildItem -LiteralPath $source.Path -Directory | Sort-Object Name | ForEach-Object {
    $audioFiles = Get-ChildItem -LiteralPath $_.FullName -Recurse -File |
      Where-Object { $audioExtensions -contains $_.Extension.ToLowerInvariant() }

    if (-not $audioFiles) {
      return
    }

    $descriptionText = Get-DescriptionText -FolderPath $_.FullName
    $title = Get-CleanTitle -FolderName $_.Name -DescriptionText $descriptionText
    $summary = Get-Summary -DescriptionText $descriptionText -FallbackTitle $title -TrackCount $audioFiles.Count
    $tags = Get-Tags -Category $source.Category -Title $title -DescriptionText $descriptionText -TrackCount $audioFiles.Count

    $catalog.Add([pscustomobject]@{
      id = 0
      title = $title
      category = $source.Category
      summary = $summary
      tags = $tags
      tracks = $audioFiles.Count
      path = $_.FullName
    })
  }
}

$dedupedCatalog = $catalog |
  Group-Object {
    '{0}|{1}' -f $_.category, (Get-NormalizedKey $_.title)
  } |
  ForEach-Object {
    $_.Group |
      Sort-Object @{
        Expression = { Get-QualityScore $_ }
        Descending = $true
      }, @{
        Expression = { $_.tracks }
        Descending = $true
      }, path |
      Select-Object -First 1
  }

$sortedCatalog = $dedupedCatalog | Sort-Object category, title
$nextId = 1
$sortedCatalog = $sortedCatalog | ForEach-Object {
  $_.id = $nextId
  $nextId += 1
  $_
}

$json = $sortedCatalog | ConvertTo-Json -Depth 5
$output = @(
  'window.AUDIOBOOK_CATALOG = ',
  $json,
  ';'
) -join "`r`n"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($OutputFile, $output, $utf8NoBom)
Write-Output "Generated $($sortedCatalog.Count) items to $OutputFile"
