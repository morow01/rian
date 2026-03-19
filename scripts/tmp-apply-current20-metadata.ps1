$ErrorActionPreference='Stop'
function U([string]$s){ [uri]::UnescapeDataString($s) }
$root='\\Synology1621\Hovorene Slovo\-= Audioknihy =-'

# Simple single-file folders
$single=@(
 @{ Src='Jonas Hassen Khemiri'; NewDir='Jonas Hassen Khemiri - Jak bys mi to (nejspíš) vyprávěl, kdybychom se poznali dřív, než jsi umřel'; NewFile='Jonas Hassen Khemiri - Jak bys mi to (nejspíš) vyprávěl, kdybychom se poznali dřív, než jsi umřel.mp3' },
 @{ Src='Jorge Luis Borges'; NewDir='Jorge Luis Borges - Jih'; NewFile='Jorge Luis Borges - Jih.mp3' },
 @{ Src='Karel Siktanc-Sen o svatem Frantiskovi 2016 03 28 Jan Hyhlik VBR-HQ'; NewDir='Karel Šiktanc - Sen o svatém Františkovi'; NewFile='Karel Šiktanc - Sen o svatém Františkovi.mp3' },
 @{ Src='Magdalena Platzova'; NewDir='Magdalena Platzová - Složitý příběh'; NewFile='Magdalena Platzová - Složitý příběh.mp3' },
 @{ Src='Michal Laznovsky-Zahradkari 2013 12 05 20 01 VBR-HQ'; NewDir='Michal Láznovský - Zahrádkáři'; NewFile='Michal Láznovský - Zahrádkáři.mp3' },
 @{ Src='Michal Sanda'; NewDir='Michal Šanda - Pošramocený orloj'; NewFile='Michal Šanda - Pošramocený orloj.mp3' },
 @{ Src='Milena Strafeldova'; NewDir='Milena Štráfeldová - Časový snímek'; NewFile='Milena Štráfeldová - Časový snímek.mp3' },
 @{ Src='Milos Dolezal'; NewDir='Miloš Doležal - Všechny děti Josefiny'; NewFile='Miloš Doležal - Všechny děti Josefiny.mp3' },
 @{ Src='Ondrej Abraham'; NewDir='Ondřej Abraham - Sirény'; NewFile='Ondřej Abraham - Sirény.mp3' },
 @{ Src='Petr Pazdera Payne'; NewDir='Petr Pazdera Payne - Cécile, léto, podzim, netopýr'; NewFile='Petr Pazdera Payne - Cécile, léto, podzim, netopýr.mp3' },
 @{ Src='Stanislav Struhar'; NewDir='Stanislav Struhar - Zlodějka'; NewFile='Stanislav Struhar - Zlodějka.mp3' }
)
foreach($op in $single){
  $src=Join-Path $root $op.Src
  if(-not (Test-Path -LiteralPath $src)){ continue }
  $f=Get-ChildItem -LiteralPath $src -File -Filter *.mp3 | Select-Object -First 1
  if($f){ Rename-Item -LiteralPath $f.FullName -NewName $op.NewFile }
  $target=Join-Path $root $op.NewDir
  if(-not (Test-Path -LiteralPath $target)){ Rename-Item -LiteralPath $src -NewName $op.NewDir }
}

# John Lennon set
$src=Join-Path $root 'Lennon John-Vyroci'
if(Test-Path -LiteralPath $src){
  $map=@{
    'John_Lennon-70_vyroci_narozeni_128kbps.mp3'='John Lennon - Výročí 128kbps.mp3'
    'John_Lennon-70_vyroci_narozeni_192kbps.mp3'='John Lennon - Výročí 192kbps.mp3'
    'John_Lennon-70_vyroci_narozeni.txt'='John Lennon - Výročí.txt'
  }
  foreach($old in $map.Keys){ $p=Join-Path $src $old; if(Test-Path -LiteralPath $p){ Rename-Item -LiteralPath $p -NewName $map[$old] } }
  $target=Join-Path $root 'John Lennon - Výročí'
  if(-not (Test-Path -LiteralPath $target)){ Rename-Item -LiteralPath $src -NewName 'John Lennon - Výročí' }
}

# Karel Machacek set
$src=Join-Path $root 'Machacek Karel-Utek do Anglie'
if(Test-Path -LiteralPath $src){
  $map=@{
    'Karel_Machacek-Utek_do_Anglie1 2015_11_17_Vojtech_Babka.mp3'='Karel Macháček - Útěk do Anglie 1.mp3'
    'Karel_Machacek-Utek_do_Anglie2 2015_11_17_VBR-HQ_.mp3'='Karel Macháček - Útěk do Anglie 2.mp3'
    'Karel_Machacek-Utek_do_Anglie3 2015_11_17_Vojtech_Babka.mp3'='Karel Macháček - Útěk do Anglie 3.mp3'
    'Karel_Machacek-Utek_do_Anglie.txt'='Karel Macháček - Útěk do Anglie.txt'
  }
  foreach($old in $map.Keys){ $p=Join-Path $src $old; if(Test-Path -LiteralPath $p){ Rename-Item -LiteralPath $p -NewName $map[$old] } }
  $target=Join-Path $root 'Karel Macháček - Útěk do Anglie'
  if(-not (Test-Path -LiteralPath $target)){ Rename-Item -LiteralPath $src -NewName 'Karel Macháček - Útěk do Anglie' }
}

# Sarka Koskova set
$src=Join-Path $root 'Koskova Sarka-Porazeny Vitez-VBR-HQ'
if(Test-Path -LiteralPath $src){
  $map=@{
    'Sarka_Koskova-Porazeny_vitez1_info.mp3'='Šárka Košková - Poražený vítěz - Info 1.mp3'
    'Sarka_Koskova-Porazeny_vitez2_VBR-HQ.mp3'='Šárka Košková - Poražený vítěz 2.mp3'
    'Sarka_Koskova-Porazeny_vitez3_info.mp3'='Šárka Košková - Poražený vítěz - Info 3.mp3'
    'Sarka_Koskova-Porazeny_vitez.txt'='Šárka Košková - Poražený vítěz.txt'
  }
  foreach($old in $map.Keys){ $p=Join-Path $src $old; if(Test-Path -LiteralPath $p){ Rename-Item -LiteralPath $p -NewName $map[$old] } }
  $target=Join-Path $root 'Šárka Košková - Poražený vítěz'
  if(-not (Test-Path -LiteralPath $target)){ Rename-Item -LiteralPath $src -NewName 'Šárka Košková - Poražený vítěz' }
}

# Stage next 20 folders
$testRoot='\\Synology1621\Hovorene Slovo\-= Manual Check =-\-= Filename Rename Test =-'
$before=Join-Path $testRoot 'Before'
$after=Join-Path $testRoot 'After'
if(Test-Path -LiteralPath $before){ Remove-Item -LiteralPath $before -Recurse -Force }
if(Test-Path -LiteralPath $after){ Remove-Item -LiteralPath $after -Recurse -Force }
New-Item -ItemType Directory -Path $before | Out-Null
New-Item -ItemType Directory -Path $after | Out-Null

$next=@(
 @{ Src='Tatjana Tolstaja'; Dst='Tatjana Tolstaja - Noc'; File='Tatjana Tolstaja - Noc.mp3' },
 @{ Src='Villiers de Isle Adam'; Dst='Villiers de l''Isle-Adam - Mučení nadějí'; File='Villiers de l''Isle-Adam - Mučení nadějí.mp3' },
 @{ Src='Zinaida Gippiusova'; Dst='Zinaida Gippiusová - Vyměněné dveře'; File='Zinaida Gippiusová - Vyměněné dveře.mp3' },
 @{ Src='Dvorak_Ladislav'; Dst='Ladislav Dvořák - Jak hromady pobitých ptáků'; Multi=$true },
 @{ Src='Lennon John-Vyroci'; Dst='John Lennon - Výročí'; Multi=$true },
 @{ Src='Machacek Karel-Utek do Anglie'; Dst='Karel Macháček - Útěk do Anglie'; Multi=$true },
 @{ Src='Koskova Sarka-Porazeny Vitez-VBR-HQ'; Dst='Šárka Košková - Poražený vítěz'; Multi=$true },
 @{ Src='Pianino na rance Lomito'; Dst='Rudolf Sloboda - Pianino a ranč Lomito'; File='Rudolf Sloboda - Pianino a ranč Lomito.mp3' },
 @{ Src='Robert Musil'; Dst='Robert Musil - Tonka'; File='Robert Musil - Tonka.mp3' },
 @{ Src='Seneca-Na kus řeči se Senekou etc mp3 256 2018 04 25-19 59 VBR-HQ'; Dst='Seneca - Na kus řeči se Senekou'; File='Seneca - Na kus řeči se Senekou.mp3' },
 @{ Src='Shakespeare-Zimní pohádka-1960 mp3 2016 12 25-09 58 VBR-HQ'; Dst='William Shakespeare - Zimní pohádka'; File='William Shakespeare - Zimní pohádka.mp3' },
 @{ Src='Sny-Karel IV 2016 05 14-23 58 04 VBR-HQ OK'; Dst='Karel IV. - Sny'; File='Karel IV. - Sny.mp3' },
 @{ Src='Dvorak_Ladislav'; Skip=$true },
 @{ Src='Stephen Clarke - Merde!\Stephen Clarke - 03 Celkem jde o Merde'; Dst='Stephen Clarke - Celkem jde o Merde'; File='Stephen Clarke - Celkem jde o Merde.mp3' },
 @{ Src='Betty MacDonaldova\Betty MacDonaldova - Vejce a ja CD 3'; Dst='Betty MacDonaldová - Vejce a já CD 3'; File='Betty MacDonaldová - Vejce a já CD 3.mp3' },
 @{ Src='Betty MacDonaldova\Betty MacDonaldova - Vejce a ja CD 5'; Dst='Betty MacDonaldová - Vejce a já CD 5'; File='Betty MacDonaldová - Vejce a já CD 5.mp3' },
 @{ Src='Bohumil Hrabal\Legenda o krasne Julince'; Dst='Bohumil Hrabal - Legenda o krásné Julince'; File='Bohumil Hrabal - Legenda o krásné Julince.mp3' },
 @{ Src='James Joyce\Mracek'; Dst='James Joyce - Mraček'; File='James Joyce - Mraček.mp3' },
 @{ Src='Mark Twain\Tajemny cizinec (Mark Twain)'; Dst='Mark Twain - Tajemný cizinec'; File='Mark Twain - Tajemný cizinec.mp3' },
 @{ Src='O Henry\Policajt a choral'; Dst='O. Henry - Policajt a chorál'; File='O. Henry - Policajt a chorál.mp3' },
 @{ Src='Jaroslav Hasek\Jaroslav Hašek - Osudy dobrého vojáka Švejka (2008)\CD 7'; Dst='Jaroslav Hašek - Osudy dobrého vojáka Švejka CD 7'; File='Jaroslav Hašek - Osudy dobrého vojáka Švejka CD 7.mp3' }
)
$staged=0
foreach($it in $next){
  if($it.ContainsKey('Skip')){ continue }
  if($staged -ge 20){ break }
  $src=Join-Path $root $it.Src
  if(-not (Test-Path -LiteralPath $src)){ continue }
  $bd=Join-Path $before (Split-Path -Leaf $src)
  $ad=Join-Path $after $it.Dst
  Copy-Item -LiteralPath $src -Destination $bd -Recurse
  Copy-Item -LiteralPath $src -Destination $ad -Recurse
  if(-not $it.Multi){
    $f=Get-ChildItem -LiteralPath $ad -File -Filter *.mp3 | Select-Object -First 1
    if($f){ Rename-Item -LiteralPath $f.FullName -NewName $it.File }
  }
  $staged++
}
(Get-ChildItem -LiteralPath $after -Directory | Measure-Object).Count
