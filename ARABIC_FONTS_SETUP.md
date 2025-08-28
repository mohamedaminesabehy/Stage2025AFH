# Configuration des Polices Arabes pour l'Export PDF

## Vue d'ensemble
Ce projet utilise PDFBox pour générer des PDF avec support de l'arabe. Pour que le texte arabe s'affiche correctement, vous devez installer des polices arabes.

## Polices Recommandées

### 1. Amiri (Recommandée)
- **Téléchargement** : https://github.com/alif-type/amiri/releases
- **Fichier** : `Amiri-Regular.ttf`
- **Placement** : `src/main/resources/fonts/Amiri-Regular.ttf`

### 2. Noto Sans Arabic (Alternative)
- **Téléchargement** : https://fonts.google.com/noto/specimen/Noto+Sans+Arabic
- **Fichier** : `NotoSansArabic-Regular.ttf`
- **Placement** : `src/main/resources/fonts/NotoSansArabic-Regular.ttf`

### 3. DejaVu Sans (Fallback)
- **Téléchargement** : https://dejavu-fonts.github.io/
- **Fichier** : `DejaVuSans.ttf`
- **Placement** : `src/main/resources/fonts/DejaVuSans.ttf`

## Installation

1. **Télécharger** les fichiers de police (.ttf)
2. **Placer** les fichiers dans le dossier `src/main/resources/fonts/`
3. **Redémarrer** l'application Spring Boot

## Structure des Dossiers
```
GESCOMP/
├── src/
│   └── main/
│       └── resources/
│           └── fonts/
│               ├── Amiri-Regular.ttf      # Police arabe principale
│               ├── NotoSansArabic-Regular.ttf  # Alternative
│               └── DejaVuSans.ttf         # Police de fallback
```

## Configuration du Code

Le service `PdfBoxArabicService` tentera de charger les polices dans cet ordre :
1. `Amiri-Regular.ttf` (recommandée)
2. `DejaVuSans.ttf` (fallback)

## Test

Après l'installation :
1. Aller sur la page "Statistiques Périodes"
2. Sélectionner une période d'analyse
3. Cliquer sur "Export PDF"
4. Vérifier que le texte arabe s'affiche correctement

## Dépannage

### Problème : Texte arabe non affiché
- Vérifier que les polices sont dans le bon dossier
- Vérifier les permissions des fichiers
- Redémarrer l'application

### Problème : Police non trouvée
- Vérifier le chemin dans `ARABIC_FONT_PATH`
- Vérifier que le fichier .ttf est valide
- Utiliser une police de fallback

## Notes Techniques

- **PDFBox** : Support natif des polices TTF
- **Encodage** : UTF-8 pour le support des caractères arabes
- **Fallback** : Utilisation automatique de polices alternatives si la police arabe n'est pas disponible 