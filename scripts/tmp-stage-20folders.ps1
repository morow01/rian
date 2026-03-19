$ErrorActionPreference='Stop'
function U([string]$s){ [uri]::UnescapeDataString($s) }
$testRoot='\\Synology1621\Hovorene Slovo\-= Manual Check =-\-= Filename Rename Test =-'
$before=Join-Path $testRoot 'Before'
$after=Join-Path $testRoot 'After'
if(Test-Path -LiteralPath $before){ Remove-Item -LiteralPath $before -Recurse -Force }
if(Test-Path -LiteralPath $after){ Remove-Item -LiteralPath $after -Recurse -Force }
New-Item -ItemType Directory -Path $before | Out-Null
New-Item -ItemType Directory -Path $after | Out-Null

$items=@(
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Adriena Simotova-Hlava k listovani-SCH S LIT 2016 08 07 D Cermakova VBR-HQ OK'; Dst=U('Adriena%20%C5%A0imotov%C3%A1%20-%20Hlava%20k%20listov%C3%A1n%C3%AD'); File=U('Adriena%20%C5%A0imotov%C3%A1%20-%20Hlava%20k%20listov%C3%A1n%C3%AD.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Adriena Simotova-Magie casu casu casu-SOUZVUK 2016 08 07 V Babka VBR-HQ OK'; Dst=U('Adriena%20%C5%A0imotov%C3%A1%20-%20Magie%20%C4%8Dasu%2C%20%C4%8Dasu%2C%20%C4%8Dasu'); File=U('Adriena%20%C5%A0imotov%C3%A1%20-%20Magie%20%C4%8Dasu%2C%20%C4%8Dasu%2C%20%C4%8Dasu.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Antonin Pridal-Zpovedi a odposlechy'; Dst=U('Anton%C3%ADn%20P%C5%99idal%20-%20Zpov%C4%9Bdi%20a%20odposlechy'); File=U('Anton%C3%ADn%20P%C5%99idal%20-%20Zpov%C4%9Bdi%20a%20odposlechy.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Drahomira Pithartova'; Dst=U('Drahom%C3%ADra%20Pithartov%C3%A1%20-%20Z%20t%C3%A1borov%C3%A9ho%20den%C3%ADku'); File=U('Drahom%C3%ADra%20Pithartov%C3%A1%20-%20Z%20t%C3%A1borov%C3%A9ho%20den%C3%ADku.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Dvorak_Ladislav'; Dst=U('Ladislav%20Dvo%C5%99%C3%A1k%20-%20Jak%20hromady%20pobit%C3%BDch%20pt%C3%A1k%C5%AF'); File=U('Ladislav%20Dvo%C5%99%C3%A1k%20-%20Jak%20hromady%20pobit%C3%BDch%20pt%C3%A1k%C5%AF.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Edvard Valenta-Nejdrazsi jidlo sveta 2016 08 14 M Ditrichova VBR-HQ'; Dst=U('Edvard%20Valenta%20-%20Nejdra%C5%BE%C5%A1%C3%AD%20j%C3%ADdlo%20sv%C4%9Bta'); File=U('Edvard%20Valenta%20-%20Nejdra%C5%BE%C5%A1%C3%AD%20j%C3%ADdlo%20sv%C4%9Bta.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Ferkova_Ilona'; Dst=U('Ilona%20Ferkov%C3%A1%20-%20P%C5%99%C3%ADb%C4%9Bhy%20z%20Anglie'); File=U('Ilona%20Ferkov%C3%A1%20-%20P%C5%99%C3%ADb%C4%9Bhy%20z%20Anglie.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Galina Voronska'; Dst=U('Galina%20Voronsk%C3%A1%20-%20Serpantinka'); File=U('Galina%20Voronsk%C3%A1%20-%20Serpantinka.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Gundega Repseova'; Dst=U('Gundega%20Rep%C5%A1eov%C3%A1%20-%20P%C5%99ed%20nebeskou%20br%C3%A1nou'); File=U('Gundega%20Rep%C5%A1eov%C3%A1%20-%20P%C5%99ed%20nebeskou%20br%C3%A1nou.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Hannah Arendtova-MEDAILON mp3 256 2016 10 08 VBR-HQ'; Dst=U('Hannah%20Arendtov%C3%A1%20-%20Medailon'); File=U('Hannah%20Arendtov%C3%A1%20-%20Medailon.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Havel_Vaclav'; Dst=U('V%C3%A1clav%20Havel%20-%20Z%20dopis%C5%AF%20Olze%201'); File=U('V%C3%A1clav%20Havel%20-%20Z%20dopis%C5%AF%20Olze%201.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Henry Lawson - Mitchell'; Dst='Henry Lawson - Mitchell'; File='Henry Lawson - Mitchell.mp3' },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Hermann Bahr'; Dst='Hermann Bahr - Austriaca'; File='Hermann Bahr - Austriaca.mp3' },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Hugo von Hofmannsthal'; Dst=U('Hugo%20von%20Hofmannsthal%20-%20Kyrysnick%C3%BD%20p%C5%99%C3%ADb%C4%9Bh'); File=U('Hugo%20von%20Hofmannsthal%20-%20Kyrysnick%C3%BD%20p%C5%99%C3%ADb%C4%9Bh.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Ilse Aichingerova'; Dst=U('Ilse%20Aichingerov%C3%A1%20-%20Herodes'); File=U('Ilse%20Aichingerov%C3%A1%20-%20Herodes.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Jahannes Mario SImmel'; Dst='Johannes Mario Simmel - Docela malé a docela velké tajemství'; File='Johannes Mario Simmel - Docela malé a docela velké tajemství.mp3' },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Jan Kresadlo'; Dst=U('Jan%20K%C5%99esadlo%20-%20Rikitan'); File=U('Jan%20K%C5%99esadlo%20-%20Rikitan.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Jana Krejcarova Cerna'; Dst=U('Jana%20Krejcarov%C3%A1%20%C4%8Cern%C3%A1%20-%20Jak%20jsem%20jednou%20byla%20kr%C3%A1sn%C3%A1'); File=U('Jana%20Krejcarov%C3%A1%20%C4%8Cern%C3%A1%20-%20Jak%20jsem%20jednou%20byla%20kr%C3%A1sn%C3%A1.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Jiri Grusa'; Dst=U('Ji%C5%99%C3%AD%20Gru%C5%A1a%20-%20P%C4%9B%C5%A1%C3%AD%20pt%C3%A1ci'); File=U('Ji%C5%99%C3%AD%20Gru%C5%A1a%20-%20P%C4%9B%C5%A1%C3%AD%20pt%C3%A1ci.mp3') },
 @{ Src='\\Synology1621\Hovorene Slovo\-= Audioknihy =-\Jiri Kratochvil'; Dst=U('Ji%C5%99%C3%AD%20Kratochvil%20-%20Fl%C3%A9tna'); File=U('Ji%C5%99%C3%AD%20Kratochvil%20-%20Fl%C3%A9tna.mp3') }
)
foreach($it in $items){
 if(-not (Test-Path -LiteralPath $it.Src)){ continue }
 $bd=Join-Path $before (Split-Path -Leaf $it.Src)
 $ad=Join-Path $after $it.Dst
 Copy-Item -LiteralPath $it.Src -Destination $bd -Recurse
 Copy-Item -LiteralPath $it.Src -Destination $ad -Recurse
 $file=Get-ChildItem -LiteralPath $ad -File -Filter *.mp3 | Select-Object -First 1
 if($file){ Rename-Item -LiteralPath $file.FullName -NewName $it.File }
}
Get-ChildItem -LiteralPath $after -Directory | Measure-Object | Select-Object -ExpandProperty Count
