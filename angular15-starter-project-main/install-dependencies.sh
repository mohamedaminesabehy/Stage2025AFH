#!/bin/bash

echo "Installation des dépendances pour le module de statistiques..."

echo ""
echo "Installation de Chart.js et ng2-charts..."
npm install chart.js ng2-charts

echo ""
echo "Installation des modules Angular Material manquants..."
npm install @angular/material @angular/cdk @angular/animations

echo ""
echo "Installation des dépendances pour les formulaires réactifs..."
npm install @angular/forms

echo ""
echo "Vérification des dépendances..."
npm list chart.js ng2-charts @angular/material

echo ""
echo "Installation terminée !"
echo "Vous pouvez maintenant lancer l'application avec: ng serve"
