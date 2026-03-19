$ErrorActionPreference='Stop'
function U([string]$s){ [uri]::UnescapeDataString($s) }
$root='\\Synology1621\Hovorene Slovo\-= Audioknihy =-'

# Apply approved current 20-folder batch
$single=@(
 @{ Src='Adriena Simotova-Hlava k listovani-SCH S LIT 2016 08 07 D Cermakova VBR-HQ OK'; NewDir=U('Adriena%20%C5%A0imotov%C3%A1%20-%20Hlava%20k%20listov%C3%A1n%C3%AD'); NewFile=U('Adriena%20%C5%A0imotov%C3%A1%20-%20Hlava%20k%20listov%C3%A1n%C3%AD.mp3') },
 @{ Src='Adriena Simotova-Magie casu casu casu-SOUZVUK 2016 08 07 V Babka VBR-HQ OK'; NewDir=U('Adriena%20%C5%A0imotov%C3%A1%20-%20Magie%20%C4%8Dasu%2C%20%C4%8Dasu%2C%20%C4%8Dasu'); NewFile=U('Adriena%20%C5%A0imotov%C3%A1%20-%20Magie%20%C4%8Dasu%2C%20%C4%8Dasu%2C%20%C4%8Dasu.mp3') },
 @{ Src='Antonin Pridal-Zpovedi a odposlechy'; NewDir=U('Anton%C3%ADn%20P%C5%99idal%20-%20Zpov%C4%9Bdi%20a%20odposlechy'); NewFile=U('Anton%C3%ADn%20P%C5%99idal%20-%20Zpov%C4%9Bdi%20a%20odposlechy.mp3') },
 @{ Src='Drahomira Pithartova'; NewDir=U('Drahom%C3%ADra%20Pithartov%C3%A1%20-%20Z%20t%C3%A1borov%C3%A9ho%20den%C3%ADku'); NewFile=U('Drahom%C3%ADra%20Pithartov%C3%A1%20-%20Z%20t%C3%A1borov%C3%A9ho%20den%C3%ADku.mp3') },
 @{ Src='Edvard Valenta-Nejdrazsi jidlo sveta 2016 08 14 M Ditrichova VBR-HQ'; NewDir=U('Edvard%20Valenta%20-%20Nejdra%C5%BE%C5%A1%C3%AD%20j%C3%ADdlo%20sv%C4%9Bta'); NewFile=U('Edvard%20Valenta%20-%20Nejdra%C5%BE%C5%A1%C3%AD%20j%C3%ADdlo%20sv%C4%9Bta.mp3') },
 @{ Src='Ferkova_Ilona'; NewDir=U('Ilona%20Ferkov%C3%A1%20-%20P%C5%99%C3%ADb%C4%9Bhy%20z%20Anglie'); NewFile=U('Ilona%20Ferkov%C3%A1%20-%20P%C5%99%C3%ADb%C4%9Bhy%20z%20Anglie.mp3') },
 @{ Src='Galina Voronska'; NewDir=U('Galina%20Voronsk%C3%A1%20-%20Serpantinka'); NewFile=U('Galina%20Voronsk%C3%A1%20-%20Serpantinka.mp3') },
 @{ Src='Gundega Repseova'; NewDir=U('Gundega%20Rep%C5%A1eov%C3%A1%20-%20P%C5%99ed%20nebeskou%20br%C3%A1nou'); NewFile=U('Gundega%20Rep%C5%A1eov%C3%A1%20-%20P%C5%99ed%20nebeskou%20br%C3%A1nou.mp3') },
 @{ Src='Hannah Arendtova-MEDAILON mp3 256 2016 10 08 VBR-HQ'; NewDir=U('Hannah%20Arendtov%C3%A1%20-%20Medailon'); NewFile=U('Hannah%20Arendtov%C3%A1%20-%20Medailon.mp3') },
 @{ Src='Henry Lawson - Mitchell'; NewDir='Henry Lawson - Mitchell'; NewFile='Henry Lawson - Mitchell.mp3' },
 @{ Src='Hermann Bahr'; NewDir='Hermann Bahr - Austriaca'; NewFile='Hermann Bahr - Austriaca.mp3' },
 @{ Src='Hugo von Hofmannsthal'; NewDir=U('Hugo%20von%20Hofmannsthal%20-%20Kyrysnick%C3%BD%20p%C5%99%C3%ADb%C4%9Bh'); NewFile=U('Hugo%20von%20Hofmannsthal%20-%20Kyrysnick%C3%BD%20p%C5%99%C3%ADb%C4%9Bh.mp3') },
 @{ Src='Ilse Aichingerova'; NewDir=U('Ilse%20Aichingerov%C3%A1%20-%20Herodes'); NewFile=U('Ilse%20Aichingerov%C3%A1%20-%20Herodes.mp3') },
 @{ Src='Jahannes Mario SImmel'; NewDir='Johannes Mario Simmel - Docela malé a docela velké tajemství'; NewFile='Johannes Mario Simmel - Docela malé a docela velké tajemství.mp3' },
 @{ Src='Jan Kresadlo'; NewDir=U('Jan%20K%C5%99esadlo%20-%20Rikitan'); NewFile=U('Jan%20K%C5%99esadlo%20-%20Rikitan.mp3') },
 @{ Src='Jana Krejcarova Cerna'; NewDir=U('Jana%20Krejcarov%C3%A1%20%C4%8Cern%C3%A1%20-%20Jak%20jsem%20jednou%20byla%20kr%C3%A1sn%C3%A1'); NewFile=U('Jana%20Krejcarov%C3%A1%20%C4%8Cern%C3%A1%20-%20Jak%20jsem%20jednou%20byla%20kr%C3%A1sn%C3%A1.mp3') },
 @{ Src='Jiri Grusa'; NewDir=U('Ji%C5%99%C3%AD%20Gru%C5%A1a%20-%20P%C4%9B%C5%A1%C3%AD%20pt%C3%A1ci'); NewFile=U('Ji%C5%99%C3%AD%20Gru%C5%A1a%20-%20P%C4%9B%C5%A1%C3%AD%20pt%C3%A1ci.mp3') },
 @{ Src='Jiri Kratochvil'; NewDir=U('Ji%C5%99%C3%AD%20Kratochvil%20-%20Fl%C3%A9tna'); NewFile=U('Ji%C5%99%C3%AD%20Kratochvil%20-%20Fl%C3%A9tna.mp3') }
)
foreach($op in $single){
  $src=Join-Path $root $op.Src
  if(-not (Test-Path -LiteralPath $src)){ continue }
  $file=Get-ChildItem -LiteralPath $src -File -Filter *.mp3 | Select-Object -First 1
  if($file){ Rename-Item -LiteralPath $file.FullName -NewName $op.NewFile }
  $target=Join-Path $root $op.NewDir
  if($src -ne $target -and -not (Test-Path -LiteralPath $target)){ Rename-Item -LiteralPath $src -NewName $op.NewDir }
}

# Ladislav Dvorak multi-file set
$src=Join-Path $root 'Dvorak_Ladislav'
if(Test-Path -LiteralPath $src){
  $map=@{
    'Ladislav_Dvorak-Jak_hromady_pobitych_ptaku-INFO1 2011_12_15_Eva_Hazdrova-Kopecka.mp3'=U('Ladislav%20Dvo%C5%99%C3%A1k%20-%20Jak%20hromady%20pobit%C3%BDch%20pt%C3%A1k%C5%AF%20-%20Info%201.mp3')
    'Ladislav_Dvorak-Jak_hromady_pobitych_ptaku-INFO3 2011_12_15_Eva_Hazdrova-Kopecka.mp3'=U('Ladislav%20Dvo%C5%99%C3%A1k%20-%20Jak%20hromady%20pobit%C3%BDch%20pt%C3%A1k%C5%AF%20-%20Info%203.mp3')
    'Ladislav_Dvorak-Jak_hromady_pobitych_ptaku1 2014_11_30_Michaela_Ditrichova.mp3'=U('Ladislav%20Dvo%C5%99%C3%A1k%20-%20Jak%20hromady%20pobit%C3%BDch%20pt%C3%A1k%C5%AF%2001.mp3')
    'Ladislav_Dvorak-Jak_hromady_pobitych_ptaku2 2014_11_30_VBR-HQ.mp3'=U('Ladislav%20Dvo%C5%99%C3%A1k%20-%20Jak%20hromady%20pobit%C3%BDch%20pt%C3%A1k%C5%AF%2002.mp3')
    'Ladislav_Dvorak-Jak_hromady_pobitych_ptaku3 2014_11_30_Michaela_Ditrichova.mp3'=U('Ladislav%20Dvo%C5%99%C3%A1k%20-%20Jak%20hromady%20pobit%C3%BDch%20pt%C3%A1k%C5%AF%2003.mp3')
    'Ladislav_Dvorak-Jak_hromady_pobitych_ptaku.txt'=U('Ladislav%20Dvo%C5%99%C3%A1k%20-%20Jak%20hromady%20pobit%C3%BDch%20pt%C3%A1k%C5%AF.txt')
  }
  foreach($old in $map.Keys){ $p=Join-Path $src $old; if(Test-Path -LiteralPath $p){ Rename-Item -LiteralPath $p -NewName $map[$old] } }
  $newDir=Join-Path $root (U('Ladislav%20Dvo%C5%99%C3%A1k%20-%20Jak%20hromady%20pobit%C3%BDch%20pt%C3%A1k%C5%AF'))
  if(-not (Test-Path -LiteralPath $newDir)){ Rename-Item -LiteralPath $src -NewName (Split-Path -Leaf $newDir) }
}

# Vaclav Havel multi-file set
$src=Join-Path $root 'Havel_Vaclav'
if(Test-Path -LiteralPath $src){
  $map=@{
    'Vaclav_Havel-Z_dopisu_Olze1 2011-12-22_VBR-HQ.mp3'=U('V%C3%A1clav%20Havel%20-%20Z%20dopis%C5%AF%20Olze%201.mp3')
    'Vaclav_Havel-Z_dopisu_Olze2 2011-12-22_Pavel_Ryjacek.mp3'=U('V%C3%A1clav%20Havel%20-%20Z%20dopis%C5%AF%20Olze%202.mp3')
    'Vaclav_Havel-Z_dopisu_Olze.txt'=U('V%C3%A1clav%20Havel%20-%20Z%20dopis%C5%AF%20Olze.txt')
  }
  foreach($old in $map.Keys){ $p=Join-Path $src $old; if(Test-Path -LiteralPath $p){ Rename-Item -LiteralPath $p -NewName $map[$old] } }
  $newDir=Join-Path $root (U('V%C3%A1clav%20Havel%20-%20Z%20dopis%C5%AF%20Olze'))
  if(-not (Test-Path -LiteralPath $newDir)){ Rename-Item -LiteralPath $src -NewName (Split-Path -Leaf $newDir) }
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
 @{ Src='Jonas Hassen Khemiri'; Dst='Jonas Hassen Khemiri - Všechno si nepamatuju'; File='Jonas Hassen Khemiri - Všechno si nepamatuju.mp3' },
 @{ Src='Jorge Luis Borges'; Dst='Jorge Luis Borges - Kniha z písku'; File='Jorge Luis Borges - Kniha z písku.mp3' },
 @{ Src='Karel Siktanc-Sen o svatem Frantiskovi 2016 03 28 Jan Hyhlik VBR-HQ'; Dst='Karel Šiktanc - Sen o svatém Františkovi'; File='Karel Šiktanc - Sen o svatém Františkovi.mp3' },
 @{ Src='Koskova Sarka-Porazeny Vitez-VBR-HQ'; Dst='Šárka Košková - Poražený vítěz'; File='Šárka Košková - Poražený vítěz.mp3' },
 @{ Src='Lennon John-Vyroci'; Dst='John Lennon - Výročí'; File='John Lennon - Výročí.mp3' },
 @{ Src='Machacek Karel-Utek do Anglie'; Dst='Karel Macháček - Útěk do Anglie'; File='Karel Macháček - Útěk do Anglie.mp3' },
 @{ Src='Magdalena Platzova'; Dst='Magdalena Platzová - Aaronův skok'; File='Magdalena Platzová - Aaronův skok.mp3' },
 @{ Src='Mark Twain-Jak jsem se protloukal 2016 06 25-11 02 15 D Cermakova VBR-HQ'; Dst='Mark Twain - Jak jsem se protloukal'; File='Mark Twain - Jak jsem se protloukal.mp3' },
 @{ Src='Mark Twain-Kalifornanuv pribeh 2016 06 03 VBR-HQ'; Dst='Mark Twain - Kaliforňanův příběh'; File='Mark Twain - Kaliforňanův příběh.mp3' },
 @{ Src='Mark Twain-Niagara 2016 05 31 VBR-HQ'; Dst='Mark Twain - Niagara'; File='Mark Twain - Niagara.mp3' },
 @{ Src='Mark Twain-Podivny sen 2016 05 30 VBR-HQ'; Dst='Mark Twain - Podivný sen'; File='Mark Twain - Podivný sen.mp3' },
 @{ Src='Mark Twain-Prosluly skakavy zabak z okresu Calaveras 2016 06 02 VBR-HQ'; Dst='Mark Twain - Proslulý skákavý žabák z okresu Calaveras'; File='Mark Twain - Proslulý skákavý žabák z okresu Calaveras.mp3' },
 @{ Src='Michal Laznovsky-Zahradkari 2013 12 05 20 01 VBR-HQ'; Dst='Michal Láznovský - Zahrádkáři'; File='Michal Láznovský - Zahrádkáři.mp3' },
 @{ Src='Michal Sanda'; Dst='Michal Šanda - Cesta k Čapkovi'; File='Michal Šanda - Cesta k Čapkovi.mp3' },
 @{ Src='Milena Strafeldova'; Dst='Milena Štráfeldová - Kryštof z Března'; File='Milena Štráfeldová - Kryštof z Března.mp3' },
 @{ Src='Milos Dolezal'; Dst='Miloš Doležal - Jako bychom dnes zemřít měli'; File='Miloš Doležal - Jako bychom dnes zemřít měli.mp3' },
 @{ Src='Ondrej Abraham'; Dst='Ondřej Abraham - Můj muž Leonardo'; File='Ondřej Abraham - Můj muž Leonardo.mp3' },
 @{ Src='Ota Pavel-Veliky vodni tulak 2015 10 25 23 01 42 Zdenek Rakusan VBR-HQ'; Dst='Ota Pavel - Veliký vodní tulák'; File='Ota Pavel - Veliký vodní tulák.mp3' },
 @{ Src='Petr Pazdera Payne'; Dst='Petr Pazdera Payne - Předběžná ohledání'; File='Petr Pazdera Payne - Předběžná ohledání.mp3' },
 @{ Src='Stanislav Struhar'; Dst='Stanislav Struhar - Opuštěná zahrada'; File='Stanislav Struhar - Opuštěná zahrada.mp3' }
)
foreach($it in $next){
  $src=Join-Path $root $it.Src
  if(-not (Test-Path -LiteralPath $src)){ continue }
  $bd=Join-Path $before (Split-Path -Leaf $src)
  $ad=Join-Path $after $it.Dst
  Copy-Item -LiteralPath $src -Destination $bd -Recurse
  Copy-Item -LiteralPath $src -Destination $ad -Recurse
  $file=Get-ChildItem -LiteralPath $ad -File -Filter *.mp3 | Select-Object -First 1
  if($file){ Rename-Item -LiteralPath $file.FullName -NewName $it.File }
}
(Get-ChildItem -LiteralPath $after -Directory | Measure-Object).Count
