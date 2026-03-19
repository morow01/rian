$ErrorActionPreference='Stop'
$root='\\Synology1621\Hovorene Slovo\-= Audioknihy =-'
$apply=@(
 @{ Src='Tatjana Tolstaja'; Dst='Tatjana Tolstaja - Noc'; File='Tatjana Tolstaja - Noc.mp3' },
 @{ Src='Villiers de Isle Adam'; Dst='Villiers de l''Isle-Adam - Mučení nadějí'; File='Villiers de l''Isle-Adam - Mučení nadějí.mp3' },
 @{ Src='Zinaida Gippiusova'; Dst='Zinaida Gippiusová - Vyměněné dveře'; File='Zinaida Gippiusová - Vyměněné dveře.mp3' },
 @{ Src='Pianino na rance Lomito'; Dst='Rudolf Sloboda - Pianino a ranč Lomito'; File='Rudolf Sloboda - Pianino a ranč Lomito.mp3' },
 @{ Src='Robert Musil'; Dst='Robert Musil - Tonka'; File='Robert Musil - Tonka.mp3' },
 @{ Src='Seneca-Na kus řeči se Senekou etc mp3 256 2018 04 25-19 59 VBR-HQ'; Dst='Seneca - Na kus řeči se Senekou'; File='Seneca - Na kus řeči se Senekou.mp3' },
 @{ Src='Shakespeare-Zimní pohádka-1960 mp3 2016 12 25-09 58 VBR-HQ'; Dst='William Shakespeare - Zimní pohádka'; File='William Shakespeare - Zimní pohádka.mp3' },
 @{ Src='Sny-Karel IV 2016 05 14-23 58 04 VBR-HQ OK'; Dst='Karel IV. - Sny'; File='Karel IV. - Sny.mp3' },
 @{ Src='Stephen Clarke - Merde!\Stephen Clarke - 03 Celkem jde o Merde'; Dst='Stephen Clarke - Celkem jde o Merde'; File='Stephen Clarke - Celkem jde o Merde.mp3' },
 @{ Src='Betty MacDonaldova\Betty MacDonaldova - Vejce a ja CD 3'; Dst='Betty MacDonaldová - Vejce a já CD 3'; File='Betty MacDonaldová - Vejce a já CD 3.mp3' },
 @{ Src='Betty MacDonaldova\Betty MacDonaldova - Vejce a ja CD 5'; Dst='Betty MacDonaldová - Vejce a já CD 5'; File='Betty MacDonaldová - Vejce a já CD 5.mp3' },
 @{ Src='Bohumil Hrabal\Legenda o krasne Julince'; Dst='Bohumil Hrabal - Legenda o krásné Julince'; File='Bohumil Hrabal - Legenda o krásné Julince.mp3' },
 @{ Src='James Joyce\Mracek'; Dst='James Joyce - Mraček'; File='James Joyce - Mraček.mp3' },
 @{ Src='Mark Twain\Tajemny cizinec (Mark Twain)'; Dst='Mark Twain - Tajemný cizinec'; File='Mark Twain - Tajemný cizinec.mp3' },
 @{ Src='O Henry\Policajt a choral'; Dst='O. Henry - Policajt a chorál'; File='O. Henry - Policajt a chorál.mp3' },
 @{ Src='Jaroslav Hasek\Jaroslav Hašek - Osudy dobrého vojáka Švejka (2008)\CD 7'; Dst='Jaroslav Hašek - Osudy dobrého vojáka Švejka CD 7'; File='Jaroslav Hašek - Osudy dobrého vojáka Švejka CD 7.mp3' },
 @{ Src='Jaroslav Hasek\Jaroslav Hašek - Osudy dobrého vojáka Švejka (2008)\CD 8'; Dst='Jaroslav Hašek - Osudy dobrého vojáka Švejka CD 8'; File='Jaroslav Hašek - Osudy dobrého vojáka Švejka CD 8.mp3' },
 @{ Src='Dominik Landsman\Dominik Landsman, Zuzana Hubeňáková - Deníček moderního páru'; Dst='Dominik Landsman, Zuzana Hubeňáková - Deníček moderního páru'; File='Dominik Landsman, Zuzana Hubeňáková - Deníček moderního páru.mp3' }
)
foreach($op in $apply){
  $src=Join-Path $root $op.Src
  if(-not (Test-Path -LiteralPath $src)){ continue }
  $f=Get-ChildItem -LiteralPath $src -File -Filter *.mp3 | Select-Object -First 1
  if($f){ Rename-Item -LiteralPath $f.FullName -NewName $op.File }
  $parent=Split-Path -Parent $src
  $target=Join-Path $parent $op.Dst
  if(-not (Test-Path -LiteralPath $target)){ Rename-Item -LiteralPath $src -NewName $op.Dst }
}

# Stage fresh 20-folder preview
$testRoot='\\Synology1621\Hovorene Slovo\-= Manual Check =-\-= Filename Rename Test Next 2 =-'
$before=Join-Path $testRoot 'Before'
$after=Join-Path $testRoot 'After'
if(Test-Path -LiteralPath $testRoot){ Remove-Item -LiteralPath $testRoot -Recurse -Force }
New-Item -ItemType Directory -Path $before | Out-Null
New-Item -ItemType Directory -Path $after | Out-Null

$next=@(
 @{ Src='Drahomira Pithartova'; Dst='Drahomíra Pithartová - Z táborového deníku'; File='Drahomíra Pithartová - Z táborového deníku.mp3' },
 @{ Src='Edvard Valenta-Nejdrazsi jidlo sveta 2016 08 14 M Ditrichova VBR-HQ'; Dst='Edvard Valenta - Nejdražší jídlo světa'; File='Edvard Valenta - Nejdražší jídlo světa.mp3' },
 @{ Src='Ferkova_Ilona'; Dst='Ilona Ferková - Příběhy z Anglie'; File='Ilona Ferková - Příběhy z Anglie.mp3' },
 @{ Src='Galina Voronska'; Dst='Galina Voronská - Serpantinka'; File='Galina Voronská - Serpantinka.mp3' },
 @{ Src='Gundega Repseova'; Dst='Gundega Repšeová - Před nebeskou bránou'; File='Gundega Repšeová - Před nebeskou bránou.mp3' },
 @{ Src='Hannah Arendtova-MEDAILON mp3 256 2016 10 08 VBR-HQ'; Dst='Hannah Arendtová - Medailon'; File='Hannah Arendtová - Medailon.mp3' },
 @{ Src='Henry Lawson - Mitchell'; Dst='Henry Lawson - Mitchell'; File='Henry Lawson - Mitchell.mp3' },
 @{ Src='Hermann Bahr'; Dst='Hermann Bahr - Austriaca'; File='Hermann Bahr - Austriaca.mp3' },
 @{ Src='Hugo von Hofmannsthal'; Dst='Hugo von Hofmannsthal - Kyrysnický příběh'; File='Hugo von Hofmannsthal - Kyrysnický příběh.mp3' },
 @{ Src='Ilse Aichingerova'; Dst='Ilse Aichingerová - Herodes'; File='Ilse Aichingerová - Herodes.mp3' },
 @{ Src='Jahannes Mario SImmel'; Dst='Johannes Mario Simmel - Docela malé a docela velké tajemství'; File='Johannes Mario Simmel - Docela malé a docela velké tajemství.mp3' },
 @{ Src='Jan Kresadlo'; Dst='Jan Křesadlo - Rikitan'; File='Jan Křesadlo - Rikitan.mp3' },
 @{ Src='Jana Krejcarova Cerna'; Dst='Jana Krejcarová Černá - Jak jsem jednou byla krásná'; File='Jana Krejcarová Černá - Jak jsem jednou byla krásná.mp3' },
 @{ Src='Jiri Grusa'; Dst='Jiří Gruša - Pěší ptáci'; File='Jiří Gruša - Pěší ptáci.mp3' },
 @{ Src='Jiri Kratochvil'; Dst='Jiří Kratochvil - Flétna'; File='Jiří Kratochvil - Flétna.mp3' },
 @{ Src='Havel_Vaclav'; Dst='Václav Havel - Z dopisů Olze'; Multi=$true },
 @{ Src='Dvorak_Ladislav'; Dst='Ladislav Dvořák - Jak hromady pobitých ptáků'; Multi=$true },
 @{ Src='Lennon John-Vyroci'; Dst='John Lennon - Výročí'; Multi=$true },
 @{ Src='Machacek Karel-Utek do Anglie'; Dst='Karel Macháček - Útěk do Anglie'; Multi=$true },
 @{ Src='Koskova Sarka-Porazeny Vitez-VBR-HQ'; Dst='Šárka Košková - Poražený vítěz'; Multi=$true }
)
$staged=0
foreach($it in $next){
  if($staged -ge 20){ break }
  $src=Join-Path $root $it.Src
  if(-not (Test-Path -LiteralPath $src)){ continue }
  $bd=Join-Path $before (Split-Path -Leaf $src)
  $ad=Join-Path $after $it.Dst
  Copy-Item -LiteralPath $src -Destination $bd -Recurse
  Copy-Item -LiteralPath $src -Destination $ad -Recurse
  if(-not $it.ContainsKey('Multi')){
    $f=Get-ChildItem -LiteralPath $ad -File -Filter *.mp3 | Select-Object -First 1
    if($f){ Rename-Item -LiteralPath $f.FullName -NewName $it.File }
  }
  $staged++
}
(Get-ChildItem -LiteralPath $after -Directory | Measure-Object).Count
