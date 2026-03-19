$ErrorActionPreference='Stop'
$root='\\Synology1621\Hovorene Slovo\-= Audioknihy =-'
$testRoot='\\Synology1621\Hovorene Slovo\-= Manual Check =-\-= Filename Rename Test Next =-'
$before=Join-Path $testRoot 'Before'
$after=Join-Path $testRoot 'After'
if(Test-Path -LiteralPath $testRoot){ Remove-Item -LiteralPath $testRoot -Recurse -Force }
New-Item -ItemType Directory -Path $before | Out-Null
New-Item -ItemType Directory -Path $after | Out-Null
$next=@(
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
 @{ Src='Dominik Landsman\Dominik Landsman, Zuzana Hubeňáková - Deníček moderního páru'; Dst='Dominik Landsman, Zuzana Hubeňáková - Deníček moderního páru'; File='Dominik Landsman, Zuzana Hubeňáková - Deníček moderního páru.mp3' },
 @{ Src='Mark Twain - Tajemný cizinec'; Dst='Mark Twain - Tajemný cizinec (dupe check)'; File='Mark Twain - Tajemný cizinec.mp3' },
 @{ Src='Henry Lawson - Mitchell'; Dst='Henry Lawson - Mitchell (dupe check)'; File='Henry Lawson - Mitchell.mp3' }
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
  $f=Get-ChildItem -LiteralPath $ad -File -Filter *.mp3 | Select-Object -First 1
  if($f){ Rename-Item -LiteralPath $f.FullName -NewName $it.File }
  $staged++
}
(Get-ChildItem -LiteralPath $after -Directory | Measure-Object).Count
