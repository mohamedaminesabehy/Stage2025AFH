// ========== INTERFACES POUR LES STATISTIQUES COMPLÈTES ==========

// Interface pour les statistiques des articles complètes
export interface StatistiquesArticlesComplet {
  articlesBySecteur: ArticleBySecteur[];
  articlesByFamille: ArticleByFamille[];
  articlesExtremes: ArticleExtreme[];
  repartitionUnites: RepartitionUnite[];
  articlesStatut: ArticlesStatut;
  topArticles: TopArticle[];
  evolutionDecomptes: EvolutionDecompte[];
  topFournisseursVolume: TopFournisseurVolume[];
  articlesSansMouvement: number;
}

export interface ArticleBySecteur {
  secteur: string;
  nombre: number;
}

export interface ArticleByFamille {
  famille: string;
  nombre: number;
  pourcentage: number;
}

export interface ArticleExtreme {
  designation: string;
  prix: number;
  type: 'plus_cher' | 'moins_cher';
}

export interface RepartitionUnite {
  unite: string;
  nombreArticles: number;
  pourcentage: number;
}

export interface EvolutionDecompte {
  mois: string;
  nombreDecomptes: number;
  montantTotal: number;
}

export interface TopFournisseurVolume {
  fournisseur: string;
  nombreArticles: number;
  volumeTotal: number;
  montantTotal: number;
  rang: number;
}

export interface ArticlesStatut {
  actif: number;
  inactif: number;
  obsolete: number;
}

export interface TopArticle {
  designation: string;
  secteur?: string;      // Nouveau: secteur économique de l'article
  utilisations: number;  // Volume (nombre d'utilisations dans les marchés)
  quantite?: number;     // Nouveau: somme des quantités utilisées (si dispo)
  montant?: number;      // Nouveau: somme des montants TTC (si dispo)
  rang: number;
}

export interface UniteMesure {
  unite: string;
  nombre: number;
}

// Interface pour les statistiques des fournisseurs complètes
export interface StatistiquesFournisseursComplet {
  fournisseursByRegion: FournisseurByRegion[];
  fournisseursBySecteur: FournisseurBySecteur[];
  fournisseursStatut: FournisseursStatut;
  fournisseursByType: FournisseurByType[];
  topFournisseurs: TopFournisseur[];
  fournisseursPenalites: FournisseursPenalites;
}

export interface FournisseurByRegion {
  region: string;
  nombre: number;
}

export interface FournisseurBySecteur {
  secteur: string;
  nombre: number;
  pourcentage: number;
}

export interface FournisseursStatut {
  actif: number;
  suspendu: number;
  blackliste: number;
}

export interface FournisseurByType {
  type: string;
  nombre: number;
}

export interface TopFournisseur {
  designation: string;
  nombreMarches: number;
  rang: number;
}

export interface FournisseursPenalites {
  avecPenalites: number;
  sansPenalites: number;
}

// Interface pour les statistiques des garanties complètes
/** Supprimé: StatistiquesGarantiesComplet */

export interface GarantieByType {
  type: string;
  nombre: number;
  pourcentage: number;
}

export interface RepartitionMontant {
  tranche: string;
  nombre: number;
}

export interface GarantiesStatut {
  active: number;
  expiree: number;
  utilisee: number;
}

export interface Organisme {
  organisme: string;
  nombre: number;
}

export interface TopFournisseurGarantie {
  designation: string;
  nombreGaranties: number;
  montantTotal: number;
}

export interface MontantMoyen {
  type: string;
  montantMoyen: number;
}

// Interface pour les statistiques des pénalités complètes
/** Supprimé: StatistiquesPenalitesComplet */

export interface PenaliteByType {
  type: string;
  nombre: number;
  pourcentage: number;
}

export interface TopFournisseurPenalite {
  designation: string;
  nombrePenalites: number;
  montantTotal: number;
}

export interface PenaliteByMarche {
  typeMarche: string;
  nombrePenalites: number;
}

// Interface pour les métriques globales
export interface MetriquesGlobales {
  totalArticles: number;
  totalFournisseurs: number;
}

// Interface pour toutes les statistiques générales complètes
export interface ToutesStatistiquesGenerales {
  articles: StatistiquesArticlesComplet;
  fournisseurs: StatistiquesFournisseursComplet;
  metriquesGlobales: MetriquesGlobales;
}

// Interface pour les données de graphiques Chart.js
export interface ChartDataStatistiques {
  labels: string[];
  datasets: ChartDatasetStatistiques[];
}

export interface ChartDatasetStatistiques {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

// Interface pour les filtres
export interface FiltresStatistiques {
  secteur?: string;
  region?: string;
  statut?: string;
  dateDebut?: Date;
  dateFin?: Date;
}

// Interface pour les options d'export
export interface OptionsExport {
  format: 'pdf' | 'excel' | 'csv';
  sections: string[];
  includeGraphiques: boolean;
}

// Interface pour les widgets de statistiques
export interface WidgetStatistique {
  id: string;
  titre: string;
  type: 'chart' | 'table' | 'metric';
  donnees: any;
  options?: any;
}

// Interface pour les alertes statistiques
export interface AlerteStatistique {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  titre: string;
  message: string;
  timestamp: Date;
  priorite: 'high' | 'medium' | 'low';
}
