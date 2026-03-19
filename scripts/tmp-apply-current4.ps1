$ErrorActionPreference='Stop'
function U([string]$s){ [uri]::UnescapeDataString($s) }
$root='\\Synology1621\Hovorene Slovo\-= Audioknihy =-'
$ops=@(
 @{ Src='Böll Heinrich-Chleb mladych let 128kbps\Heinrich Böll - Chléb mladých let'; NewDir=U('Heinrich%20B%C3%B6ll%20-%20Chl%C3%A9b%20mlad%C3%BDch%20let'); Prefix=U('Heinrich%20B%C3%B6ll%20-%20Chl%C3%A9b%20mlad%C3%BDch%20let%20') },
 @{ Src='Coudenhove-Calergi_Micu-Pameti_hrabenky_VBR-HQ'; NewDir=U('Micu%20Coudenhove-Calergi%20-%20Pam%C4%9Bti%20hrab%C4%9Bnky'); Prefix=U('Micu%20Coudenhove-Calergi%20-%20Pam%C4%9Bti%20hrab%C4%9Bnky%20') },
 @{ Src='Dauthendey_Max-Lingam_VBR-HQ'; NewDir='Max Dauthendey - Lingam'; Prefix='Max Dauthendey - Lingam ' },
 @{ Src='James Henry-Mala cesta po Francii'; NewDir=U('Henry%20James%20-%20Mal%C3%A1%20cesta%20po%20Francii'); Prefix=U('Henry%20James%20-%20Mal%C3%A1%20cesta%20po%20Francii%20') }
)
foreach($op in $ops){
  $src=Join-Path $root $op.Src
  if(-not (Test-Path -LiteralPath $src)){ continue }
  Get-ChildItem -LiteralPath $src -File -Filter *.mp3 | Sort-Object Name | ForEach-Object {
    if($_.Name -match '(\d{2})'){
      Rename-Item -LiteralPath $_.FullName -NewName ($op.Prefix + $matches[1] + '.mp3')
    }
  }
  $parent=Split-Path -Parent $src
  $target=Join-Path $parent $op.NewDir
  if($src -ne $target -and -not (Test-Path -LiteralPath $target)){
    Rename-Item -LiteralPath $src -NewName $op.NewDir
  }
}
