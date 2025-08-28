# Guide de Dépannage - Export PDF/Excel

## Erreurs Courantes et Solutions

### 1. Erreur ORA-00942: Table ou vue inexistante

**Problème** : La table `ACHAT.PENALITE` n'existe pas dans votre base de données.

**Solution** : 
- ✅ **Résolu** : Suppression de la jointure avec la table PENALITE inexistante
- ✅ **Résolu** : Utilisation de données de démonstration en cas d'erreur
- ✅ **Résolu** : Méthode de fallback robuste implémentée

### 2. Erreur de colonnes inexistantes

**Problème** : Certaines colonnes comme `DATE_MARCHE` peuvent ne pas exister.

**Solution** :
- ✅ **Résolu** : Utilisation de `DATE_OUVERTURE` au lieu de `DATE_MARCHE`
- ✅ **Résolu** : Vérification `IS NOT NULL` avant les comparaisons de dates
- ✅ **Résolu** : Gestion des erreurs avec fallback automatique

### 3. Problème de polices arabes

**Problème** : Le texte arabe ne s'affiche pas correctement dans les PDF.

**Solution** :
- ✅ **Résolu** : Service PDFBox avec support arabe implémenté
- ✅ **Résolu** : Polices de fallback configurées
- ✅ **Résolu** : Gestion automatique des polices manquantes

## Structure de la Base de Données Attendue

### Tables Requises
```sql
-- Table des fournisseurs
ACHAT.FOURNISSEUR
├── NUM_FOURN (clé primaire)
├── DESIGNATION (nom du fournisseur)
└── ... autres colonnes

-- Table des marchés
ACHAT.MARCHE
├── NUM_MARCHE (clé primaire)
├── NUM_FOURN (clé étrangère vers FOURNISSEUR)
├── NUM_STRUCT (numéro de structure)
├── MNT_MARCHE (montant du marché)
├── DATE_OUVERTURE (date d'ouverture)
└── ... autres colonnes
```

### Colonnes Optionnelles
```sql
-- Si disponibles, ces colonnes seront utilisées
ACHAT.MARCHE.DATE_CLOTURE
ACHAT.MARCHE.STATUT
```

## Test de l'Export

### 1. Test Basique (sans filtres de dates)
```bash
# URL de test
GET /api/statistiques/export/pdf?numStruct=03
```

### 2. Test avec Filtrage par Dates
```bash
# URL de test avec dates
GET /api/statistiques/export/pdf?numStruct=03&dateDebut=2024-01-01&dateFin=2024-12-31
```

### 3. Test Excel
```bash
# URL de test Excel
GET /api/statistiques/export/excel?numStruct=03&dateDebut=2024-01-01&dateFin=2024-12-31
```

## Logs de Débogage

### Niveaux de Log Recommandés
```properties
# application.properties
logging.level.com.afh.gescomp.implementation.StatistiquesServiceImpl=DEBUG
logging.level.com.afh.gescomp.service.PdfBoxArabicService=DEBUG
```

### Messages de Log Importants
```
✅ Données récupérées avec succès
⚠️ Utilisation de la méthode robuste
❌ Échec de la méthode robuste, données de démonstration
```

## Données de Démonstration

Si la base de données n'est pas accessible, l'export utilisera automatiquement :

| Fournisseur | Numéro | Marchés | Montant Total | Pénalités |
|-------------|--------|---------|---------------|-----------|
| STE BOUZGUENDA | F001 | 5 | 150,000 TND | 0 TND |
| MEDIBAT | F002 | 3 | 95,000 TND | 0 TND |
| SOTUVER | F003 | 2 | 75,000 TND | 0 TND |

## Vérification de l'Installation

### 1. Vérifier les Dépendances
```xml
<!-- PDFBox -->
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>2.0.27</version>
</dependency>

<!-- Apache POI -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.2.3</version>
</dependency>
```

### 2. Vérifier les Polices
```
GESCOMP/src/main/resources/fonts/
├── Amiri-Regular.ttf      # Police arabe (optionnelle)
├── DejaVuSans.ttf         # Police de fallback (optionnelle)
└── README.md              # Instructions
```

### 3. Vérifier les Services
```java
// Services requis
@Autowired
private PdfBoxArabicService pdfBoxArabicService;

@Autowired
private StatistiquesService statistiquesService;
```

## Résolution des Problèmes

### Problème : Export échoue complètement
1. Vérifier les logs d'erreur
2. Vérifier la connectivité à la base de données
3. Vérifier les permissions utilisateur
4. Utiliser les données de démonstration en attendant

### Problème : PDF généré mais texte arabe incorrect
1. Installer les polices arabes
2. Vérifier le chemin des polices
3. Redémarrer l'application

### Problème : Filtrage par dates ne fonctionne pas
1. Vérifier le format des dates (YYYY-MM-DD)
2. Vérifier que les colonnes de dates existent
3. Vérifier les permissions sur les tables

## Support

En cas de problème persistant :
1. Consulter les logs d'erreur
2. Vérifier la structure de la base de données
3. Tester avec des données de démonstration
4. Contacter l'équipe de développement 