# Script pour télécharger les dépendances iText
$libDir = "lib"

# Créer le dossier lib s'il n'existe pas
if (!(Test-Path $libDir)) {
    New-Item -ItemType Directory -Path $libDir
}

Write-Host "Téléchargement des dépendances iText..." -ForegroundColor Green

# Télécharger itextpdf
$itextUrl = "https://repo1.maven.org/maven2/com/itextpdf/itextpdf/5.5.13.3/itextpdf-5.5.13.3.jar"
$itextFile = "lib\itextpdf-5.5.13.3.jar"
Write-Host "Téléchargement de itextpdf..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $itextUrl -OutFile $itextFile

# Télécharger itext-pdfa
$pdfaUrl = "https://repo1.maven.org/maven2/com/itextpdf/itext-pdfa/5.5.13.3/itext-pdfa-5.5.13.3.jar"
$pdfaFile = "lib\itext-pdfa-5.5.13.3.jar"
Write-Host "Téléchargement de itext-pdfa..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $pdfaUrl -OutFile $pdfaFile

Write-Host "Téléchargement termine!" -ForegroundColor Green 