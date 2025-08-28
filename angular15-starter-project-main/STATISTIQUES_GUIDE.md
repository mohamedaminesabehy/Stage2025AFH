# 📊 Guide des Statistiques Globales - Application de Gestion des Marchés Publics

## 🎯 Vue d'ensemble

Ce module de statistiques globales fournit un tableau de bord analytique avancé pour l'application de gestion des marchés publics. Il offre des visualisations interactives, des analyses en temps réel et des fonctionnalités d'export pour une prise de décision éclairée.

## ✨ Fonctionnalités Principales

### 📈 Tableau de Bord Global
- **Métriques clés** : Fournisseurs, marchés, articles, montants
- **Graphiques interactifs** : Évolution, répartitions, tendances
- **Indicateurs de performance** : KPIs avec objectifs et alertes
- **Données temps réel** : Actualisation automatique

### 🔍 Analytics Spécialisés
- **Fournisseurs** : Performance, répartition géographique, top performers
- **Marchés** : Évolution des montants, types, délais, taux de réussite
- **Articles** : Utilisation, prix, catégories, TVA
- **Garanties & Pénalités** : Montants, types, évolutions

### 🌐 Données Externes
- **Taux de change** : Devises principales en temps réel
- **Météo** : Conditions locales
- **Indicateurs économiques** : PIB, inflation, chômage
- **Crypto-monnaies** : Prix et variations
- **Actualités** : News économiques

### 🔧 Fonctionnalités Avancées
- **Filtres intelligents** : Multi-critères avec sauvegarde
- **Notifications temps réel** : Alertes et recommandations
- **Export multi-format** : PDF, Excel, CSV
- **Interface responsive** : Mobile, tablette, desktop

## 🚀 Installation et Configuration

### Prérequis
- Node.js 16+ et npm
- Angular CLI 15+
- Serveur backend compatible

### Installation des Dépendances

```bash
# Installer les dépendances principales
npm install

# Installer Chart.js pour les graphiques
npm install chart.js ng2-charts

# Installer Angular Material (si pas déjà fait)
ng add @angular/material
```

### Configuration des APIs Externes

1. **API Météo (OpenWeatherMap)**
```typescript
// src/app/services/external-apis/external-apis.service.ts
private weatherApiKey = 'VOTRE_CLE_OPENWEATHERMAP';
```

2. **API Actualités (NewsAPI)**
```typescript
// src/app/services/external-apis/external-apis.service.ts
private newsApiKey = 'VOTRE_CLE_NEWSAPI';
```

3. **Configuration Backend**
```typescript
// src/environnement.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  websocketUrl: 'http://localhost:8080/GESCOMP/ws'
};
```

## 🎮 Utilisation

### Accès au Module
1. Connectez-vous à l'application
2. Naviguez vers **Statistiques > Tableau de Bord Global**
3. Explorez les différentes sections via les onglets

### Navigation
- **Vue d'ensemble** : Métriques principales et graphiques globaux
- **Fournisseurs** : Analytics détaillés des fournisseurs
- **Marchés** : Analyse des marchés et performance
- **Articles** : Statistiques des articles et prix
- **Performance** : Indicateurs KPI et alertes

### Filtres Avancés
1. Cliquez sur l'icône de développement des filtres
2. Sélectionnez vos critères (période, types, régions, etc.)
3. Les données se mettent à jour automatiquement
4. Sauvegardez vos filtres favoris

### Export de Données
1. Cliquez sur le bouton "Exporter"
2. Choisissez le format (PDF, Excel, CSV)
3. Le fichier se télécharge automatiquement

### Notifications
1. L'icône de notification affiche le nombre d'alertes
2. Cliquez pour ouvrir le panel
3. Filtrez par type ou priorité
4. Marquez comme lu ou supprimez

## 📊 Types de Graphiques

### Graphiques Disponibles
- **Ligne** : Évolutions temporelles
- **Barres** : Comparaisons quantitatives
- **Secteurs/Doughnut** : Répartitions en pourcentage
- **Radar** : Performance multi-critères
- **Aire** : Tendances avec remplissage

### Interactivité
- **Zoom** : Molette de souris
- **Pan** : Glisser-déposer
- **Tooltips** : Survol pour détails
- **Légendes** : Clic pour masquer/afficher
- **Export** : Clic droit pour sauvegarder

## 🔔 Système de Notifications

### Types de Notifications
- **Succès** : Opérations réussies
- **Avertissement** : Situations à surveiller
- **Erreur** : Problèmes critiques
- **Information** : Mises à jour système

### Priorités
- **Haute** : Nécessite action immédiate
- **Moyenne** : À traiter dans la journée
- **Basse** : Information générale

### Gestion
- **Marquer comme lu** : Clic sur la notification
- **Supprimer** : Bouton de suppression
- **Filtrer** : Par type ou priorité
- **Tout marquer** : Action groupée

## 🎨 Personnalisation

### Thèmes et Couleurs
Les couleurs sont définies dans les fichiers SCSS :
```scss
$primary-color: #1976d2;   // Bleu principal
$accent-color: #ff4081;    // Rose accent
$success-color: #4caf50;   // Vert succès
$warning-color: #ff9800;   // Orange avertissement
$error-color: #f44336;     // Rouge erreur
```

### Responsive Design
- **Mobile** : < 768px - Interface simplifiée
- **Tablette** : 768px-1024px - Grilles adaptées
- **Desktop** : > 1024px - Interface complète

## 🔧 Développement

### Structure des Composants
```
src/app/statistiques/
├── statistiques-globales/           # Composant principal
├── components/
│   ├── marche-evolution-chart/      # Graphique évolution
│   ├── fournisseur-repartition-chart/ # Répartition
│   ├── fournisseur-analytics/       # Analytics fournisseurs
│   ├── marche-analytics/           # Analytics marchés
│   ├── article-analytics/          # Analytics articles
│   ├── performance-analytics/      # Performance KPI
│   ├── external-data-widget/       # Données externes
│   ├── advanced-filters/           # Filtres avancés
│   └── notifications-panel/        # Panel notifications
└── README.md
```

### Services
```
src/app/services/
├── statistiques/
│   ├── statistiques.service.ts     # Service principal
│   └── mock-data.service.ts        # Données de test
├── external-apis/
│   └── external-apis.service.ts    # APIs externes
└── notifications/
    └── notification.service.ts     # Notifications
```

### Ajout de Nouveaux Graphiques
1. Créer un nouveau composant
2. Importer Chart.js
3. Définir les données et options
4. Ajouter au module principal

### Ajout de Nouvelles Métriques
1. Étendre les interfaces dans `model/statistiques.ts`
2. Mettre à jour le service de données
3. Ajouter l'affichage dans les composants

## 🐛 Dépannage

### Problèmes Courants

**Graphiques ne s'affichent pas**
- Vérifier l'import de Chart.js
- Contrôler les données fournies
- Vérifier la taille du conteneur

**APIs externes ne fonctionnent pas**
- Vérifier les clés API
- Contrôler les CORS
- Utiliser les données mock en fallback

**Performance lente**
- Réduire la fréquence d'actualisation
- Limiter le nombre de données affichées
- Utiliser la pagination

**Erreurs de compilation**
- Vérifier les imports TypeScript
- Contrôler les versions des dépendances
- Nettoyer le cache npm

### Logs et Debug
```typescript
// Activer les logs détaillés
console.log('Données statistiques:', statistiques);
console.log('Filtres appliqués:', filtres);
```

## 📞 Support

### Ressources
- **Documentation Angular** : https://angular.io/docs
- **Chart.js** : https://www.chartjs.org/docs/
- **Angular Material** : https://material.angular.io/

### Contact
- 📧 **Email** : support@example.com
- 📱 **Téléphone** : +216 XX XXX XXX
- 💬 **Chat** : Support intégré

---

**Développé avec ❤️ pour une gestion optimale des marchés publics**

*Version 1.0 - Dernière mise à jour : Janvier 2024*
