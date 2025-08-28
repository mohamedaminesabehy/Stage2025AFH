# Pagination Classique - Interface Statistiques Périodes

## 🎯 Objectif
Remplacer le bouton "Afficher 8 lignes supplémentaires" par une pagination classique avec :
- Sélecteur d'éléments par page
- Affichage de la plage actuelle (ex: 1 – 10 sur 16 898)
- Boutons de navigation < et >

## ✨ Fonctionnalités Implémentées

### 1. Pagination Classique
- **Sélecteur d'éléments** : 10, 25, 50, 100 par page
- **Affichage de la plage** : "1 – 10 sur 16 898"
- **Boutons de navigation** : < (précédent) et > (suivant)
- **Gestion des états** : Boutons désactivés selon la position

### 2. Tableaux avec Pagination
- ✅ **Articles les plus demandés**
- ✅ **Répartition par famille**
- ✅ **Top 10 articles les plus utilisés**
- ✅ **Répartition par secteur d'activité**
- ✅ **Fournisseurs avec leurs marchés**
- ✅ **Marchés avec leurs fournisseurs**

## 🚀 Utilisation

### Structure HTML de la Pagination
```html
<div class="pagination-section" *ngIf="articlesTotalPages > 0">
  <div class="pagination-info">
    <span class="elements-per-page">
      Éléments par page : 
      <select class="page-size-selector" [ngModel]="articlesPageSize" (ngModelChange)="changeArticlesPageSize($event)">
        <option [value]="10">10</option>
        <option [value]="25">25</option>
        <option [value]="50">50</option>
        <option [value]="100">100</option>
      </select>
    </span>
    <span class="pagination-range">
      {{ getArticlesPaginationInfo().start }} – {{ getArticlesPaginationInfo().end }} sur {{ getArticlesPaginationInfo().total }}
    </span>
  </div>
  <div class="pagination-navigation">
    <button class="pagination-btn prev" 
            [disabled]="articlesCurrentPage === 0"
            (click)="previousArticlesPage()">
      <i class="fas fa-chevron-left"></i>
    </button>
    <button class="pagination-btn next" 
            [disabled]="articlesCurrentPage >= articlesTotalPages - 1"
            (click)="nextArticlesPage()">
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
</div>
```

## 🔧 Méthodes TypeScript

### Gestion de la Pagination
```typescript
// Changer la taille de page
changeArticlesPageSize(size: number): void
changeFournisseursPageSize(size: number): void
changeMarchesPageSize(size: number): void

// Navigation entre pages
previousArticlesPage(): void
nextArticlesPage(): void
previousFournisseursPage(): void
nextFournisseursPage(): void
previousMarchesPage(): void
nextMarchesPage(): void

// Informations de pagination
getArticlesPaginationInfo(): { start: number; end: number; total: number }
getFournisseursPaginationInfo(): { start: number; end: number; total: number }
getMarchesPaginationInfo(): { start: number; end: number; total: number }

// Données paginées
getDisplayedArticles(): any[]
getDisplayedFournisseurs(): any[]
getDisplayedMarches(): any[]
```

## 🎨 Design de la Pagination

### Section de Pagination
- **Arrière-plan** : Gris clair (#f8f9fa)
- **Bordures** : Coins arrondis et séparateur supérieur
- **Layout** : Flexbox avec espacement entre les éléments

### Sélecteur d'Éléments
- **Style** : Input select moderne avec bordures
- **États** : Focus avec bordure bleue et ombre
- **Hover** : Bordure bleue au survol

### Affichage de la Plage
- **Format** : "1 – 10 sur 16 898"
- **Style** : Badge bleu avec bordure et arrière-plan
- **Police** : Gras et couleur bleue

### Boutons de Navigation
- **Taille** : 40x40px (50x50px sur mobile)
- **États** : Normal, hover, disabled
- **Animations** : Translation vers le haut et ombre au hover
- **Icônes** : Chevrons FontAwesome

## 📱 Responsive Design

### Desktop (> 768px)
- Layout horizontal avec espacement entre les éléments
- Boutons de navigation de taille normale (40x40px)
- Affichage complet de toutes les informations

### Mobile (< 768px)
- Layout vertical avec centrage
- Boutons de navigation plus grands (50x50px)
- Espacement réduit entre les éléments

## 🔄 Cycle de Vie

1. **Initialisation** : Calcul automatique du nombre de pages
2. **Sélection** : Choix du nombre d'éléments par page
3. **Navigation** : Utilisation des boutons < et >
4. **Mise à jour** : Affichage des données de la page courante
5. **Affichage** : Mise à jour de la plage et des boutons

## 🎯 Avantages

1. **Familiarité** : Interface de pagination standard et reconnue
2. **Performance** : Chargement uniquement des données nécessaires
3. **Navigation** : Accès direct aux pages précédente/suivante
4. **Flexibilité** : Choix du nombre d'éléments par page
5. **Clarté** : Affichage clair de la position actuelle

## 📋 Exemple d'Utilisation

### Page 1 (10 éléments par page)
```
Éléments par page : [10 ▼]    1 – 10 sur 16 898    [<] [>]
```

### Page 2 (10 éléments par page)
```
Éléments par page : [10 ▼]    11 – 20 sur 16 898   [<] [>]
```

### Page 3 (25 éléments par page)
```
Éléments par page : [25 ▼]    51 – 75 sur 16 898   [<] [>]
```

## 🎉 Résultat Final

Une interface de pagination classique, intuitive et professionnelle qui remplace efficacement le système de chargement progressif tout en conservant toutes les fonctionnalités de navigation et d'affichage des données. 