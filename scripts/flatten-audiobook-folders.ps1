param(
  [Parameter(Mandatory = $true)]
  [string]$Root
)

$audioExts = @('.mp3', '.m4a', '.m4b', '.aac', '.wav', '.flac', '.ogg', '.wma')

$singleChildDirs = Get-ChildItem -LiteralPath $Root -Recurse -Directory | ForEach-Object {
  $children = @(Get-ChildItem -LiteralPath $_.FullName -Force)
  $subdirs = @($children | Where-Object { $_.PSIsContainer })
  $directAudio = @($children | Where-Object { -not $_.PSIsContainer -and $audioExts -contains $_.Extension.ToLower() })
  if ($subdirs.Count -eq 1 -and $directAudio.Count -eq 0) {
    [PSCustomObject]@{
      Parent = $_.FullName
      Child = $subdirs[0].FullName
    }
  }
}

$flattened = New-Object System.Collections.Generic.List[string]
foreach ($pair in $singleChildDirs) {
  if (-not (Test-Path -LiteralPath $pair.Parent) -or -not (Test-Path -LiteralPath $pair.Child)) {
    continue
  }

  $items = @(Get-ChildItem -LiteralPath $pair.Child -Force)
  foreach ($item in $items) {
    $dest = Join-Path $pair.Parent $item.Name
    if (Test-Path -LiteralPath $dest) {
      continue
    }

    Move-Item -LiteralPath $item.FullName -Destination $pair.Parent
  }

  if (@(Get-ChildItem -LiteralPath $pair.Child -Force).Count -eq 0) {
    cmd /c rmdir "$($pair.Child)" | Out-Null
    $null = $flattened.Add($pair.Parent)
  }
}

$renamed = New-Object System.Collections.Generic.List[string]
Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object { [string]::IsNullOrEmpty($_.Extension) } | ForEach-Object {
  $newName = $_.Name + '.mp3'
  $dest = Join-Path $_.DirectoryName $newName
  if (-not (Test-Path -LiteralPath $dest)) {
    Rename-Item -LiteralPath $_.FullName -NewName $newName
    $null = $renamed.Add($dest)
  }
}

[PSCustomObject]@{
  FlattenedCount = $flattened.Count
  RenamedCount = $renamed.Count
  Flattened = $flattened
  Renamed = $renamed
}
