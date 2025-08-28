# Polices Requises pour l'Export PDF avec Support Arabe

## Polices Nécessaires

### 1. Police Arabe Principale
- **Fichier** : `Amiri-Regular.ttf`
- **Source** : https://github.com/alif-type/amiri/releases
- **Usage** : Affichage du texte arabe dans les PDF

### 2. Police de Fallback
- **Fichier** : `DejaVuSans.ttf`
- **Source** : https://dejavu-fonts.github.io/
- **Usage** : Texte latin et fallback si la police arabe n'est pas disponible

## Installation

1. Télécharger les fichiers .ttf depuis les sources ci-dessus
2. Placer les fichiers dans ce dossier (`src/main/resources/fonts/`)
3. Redémarrer l'application Spring Boot

## Structure Attendue
```
fonts/
├── Amiri-Regular.ttf      # Police arabe (recommandée)
├── DejaVuSans.ttf         # Police de fallback
└── README.md              # Ce fichier
```

## Test
Après installation, tester l'export PDF depuis la page "Statistiques Périodes" pour vérifier que le texte arabe s'affiche correctement. 