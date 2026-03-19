$ErrorActionPreference='Stop'
$root='\\Synology1621\Hovorene Slovo\-= Audioknihy =-'
$testRoot='\\Synology1621\Hovorene Slovo\-= Manual Check =-\-= Filename Rename Test Next 2 =-'
$before=Join-Path $testRoot 'Before'
$after=Join-Path $testRoot 'After'
if(Test-Path -LiteralPath $testRoot){ Remove-Item -LiteralPath $testRoot -Recurse -Force }
New-Item -ItemType Directory -Path $before | Out-Null
New-Item -ItemType Directory -Path $after | Out-Null
$next=@(
 @{ Src='Al-Masudi-Ryzoviste zlata a doly drahokamu VBR-HQ'; Dst='Abú l-Hasan Alí ibn al-Husain al-Masúdí - Rýžoviště zlata a doly drahokamů'; Prefix='Abú l-Hasan Alí ibn al-Husain al-Masúdí - Rýžoviště zlata a doly drahokamů '; Multi=$true },
 @{ Src='Alphonse Daudet'; Dst='Alphonse Daudet - Obrana Tarasconu'; File='Alphonse Daudet - Obrana Tarasconu.mp3' },
 @{ Src='Arendt_Hannah'; Dst='Hannah Arendtová - Totalitarismus u moci'; File='Hannah Arendtová - Totalitarismus u moci.mp3' },
 @{ Src='Benni_Stefano'; Dst='Stefano Benni - Velký Pozzi'; File='Stefano Benni - Velký Pozzi.mp3' },
 @{ Src='Bergson_Henri'; Dst='Henri Bergson - O dvojí mravnosti'; Prefix='Henri Bergson - O dvojí mravnosti '; Multi=$true },
 @{ Src='Crescenzo_Luciano_de'; Dst='Luciano de Crescenzo - Heleno, Heleno, má lásko'; Prefix='Luciano de Crescenzo - Heleno, Heleno, má lásko '; Multi=$true },
 @{ Src='Deml_Jakub'; Dst='Jakub Deml - Strašidlo'; File='Jakub Deml - Strašidlo.mp3' },
 @{ Src='Dumas_st_Alexandre'; Dst='Alexandre Dumas st. - Kocour, komorník a kostlivec'; File='Alexandre Dumas st. - Kocour, komorník a kostlivec.mp3' },
 @{ Src='Fichte_Johann_Gottlieb'; Dst='Johann Gottlieb Fichte - O poslání člověka'; Prefix='Johann Gottlieb Fichte - O poslání člověka '; Multi=$true },
 @{ Src='Fromm_Erich'; Dst='Erich Fromm - Láska jako odpověď'; File='Erich Fromm - Láska jako odpověď.mp3' },
 @{ Src='Galsworthy_John'; Dst='John Galsworthy - Co vypravoval učitel'; File='John Galsworthy - Co vypravoval učitel.mp3' },
 @{ Src='Gandhi_Mahatma'; Dst='Mahátma Gándhí - O pravdě'; Prefix='Mahátma Gándhí - O pravdě '; Multi=$true },
 @{ Src='Grygar_Jiri'; Dst='Jiří Grygar - Věda a víra'; File='Jiří Grygar - Věda a víra.mp3' },
 @{ Src='Halas_Jan'; Dst='Jan Halas - Doma'; Prefix='Jan Halas - Doma '; Multi=$true },
 @{ Src='Huelle_Pawel'; Dst='Pawel Huelle - Stůl'; Prefix='Pawel Huelle - Stůl '; Multi=$true },
 @{ Src='Hus_Jan'; Dst='Jan Hus - Řeč o míru'; Prefix='Jan Hus - Řeč o míru '; Multi=$true },
 @{ Src='Irving_Washington'; Dst='Washington Irving - Ženichův duch'; File='Washington Irving - Ženichův duch.mp3' },
 @{ Src='Jaroslav Havlicek'; Dst='Jaroslav Havlíček - Poslední kolo'; File='Jaroslav Havlíček - Poslední kolo.mp3' },
 @{ Src='Becquer Gustavo Adolfo - Zlaty naramek'; Dst='Gustavo Adolfo Bécquer - Zlatý náramek'; File='Gustavo Adolfo Bécquer - Zlatý náramek.mp3' },
 @{ Src='Guy de Maupassant'; Dst='Guy de Maupassant - Zjevení'; File='Guy de Maupassant - Zjevení.mp3' }
)
foreach($it in $next){
  $src=Join-Path $root $it.Src
  if(-not (Test-Path -LiteralPath $src)){ continue }
  $bd=Join-Path $before (Split-Path -Leaf $src)
  $ad=Join-Path $after $it.Dst
  Copy-Item -LiteralPath $src -Destination $bd -Recurse
  Copy-Item -LiteralPath $src -Destination $ad -Recurse
  $mp3s=Get-ChildItem -LiteralPath $ad -File -Filter *.mp3 | Sort-Object Name
  if($it.ContainsKey('Multi')){
    $i=1
    foreach($m in $mp3s){
      $num='{0:00}' -f $i
      Rename-Item -LiteralPath $m.FullName -NewName ($it.Prefix + $num + '.mp3')
      $i++
    }
  } else {
    $f=$mp3s | Select-Object -First 1
    if($f){ Rename-Item -LiteralPath $f.FullName -NewName $it.File }
  }
}
(Get-ChildItem -LiteralPath $after -Directory | Measure-Object).Count
