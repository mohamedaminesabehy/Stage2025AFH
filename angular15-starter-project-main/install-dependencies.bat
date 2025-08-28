@echo off
echo Installation des dependances pour le module de statistiques...

echo.
echo Installation de Chart.js et ng2-charts...
npm install chart.js ng2-charts

echo.
echo Installation des modules Angular Material manquants...
npm install @angular/material @angular/cdk @angular/animations

echo.
echo Installation des dependances pour les formulaires reactifs...
npm install @angular/forms

echo.
echo Verification des dependances...
npm list chart.js ng2-charts @angular/material

echo.
echo Installation terminee !
echo Vous pouvez maintenant lancer l'application avec: ng serve

pause
