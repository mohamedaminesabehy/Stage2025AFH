export interface StatistiquesGlobales {
  fournisseurs: StatistiquesFournisseurs;
  marches: StatistiquesMarches;
  articles: StatistiquesArticles;
  tendances: TendancesGlobales;
  performance: PerformanceGlobale;
}

export interface TopFournisseur {
  id: number;
  designation: string;
  designationFr: string;
  nombreMarches: number;
  montantTotal: number;
  scorePerformance: number;
  adresse: string;
  matriculeFisc: string;
}

export interface StatistiquesFournisseurs {
  total: number;
  actifs: number;
  nouveaux: number;
  topFournisseurs: TopFournisseur[];
  repartitionParRegion: RepartitionRegion[];
  evolutionMensuelle: EvolutionMensuelle[];
  scorePerformance: number;
}

export interface TopFournisseur {
  id: number;
  designation: string;
  designationFr: string;
  nombreMarches: number;
  montantTotal: number;
  scorePerformance: number;
  adresse: string;
  matriculeFisc: string;
}

export interface RepartitionRegion {
  region: string;
  nombre: number;
  pourcentage: number;
  montantTotal: number;
}

export interface StatistiquesMarches {
  total: number;
  enCours: number;
  termines: number;
  montantTotal: number;
  montantMoyen: number;
  repartitionParType: RepartitionType[];
  evolutionMontants: EvolutionMensuelle[];
  delaisMoyens: number;
  tauxReussite: number;
}

export interface RepartitionType {
  type: string;
  nombre: number;
  pourcentage: number;
  montantTotal: number;
}

export interface ArticlePopulaire {
  numArticle: string;
  designation: string;
  designationFr: string;
  utilisations: number;
  montantTotal: number;
  prixMoyen: number;
}

export interface EvolutionPrix {
  periode: string;
  prixMoyen: number;
  variation: number;
}

export interface StatistiquesArticles {
  total: number;
  categories: CategorieArticle[];
  plusUtilises: ArticlePopulaire[];
  evolutionPrix: EvolutionPrix[];
  repartitionTVA: RepartitionTVA[];
}

export interface CategorieArticle {
  secteur: string;
  sousSecteur: string;
  famille: string;
  sousFamille: string;
  nombre: number;
  pourcentage: number;
}

export interface ArticlePopulaire {
  numArticle: string;
  designation: string;
  designationFr: string;
  utilisations: number;
  montantTotal: number;
  prixMoyen: number;
}

export interface EvolutionPrix {
  periode: string;
  prixMoyen: number;
  variation: number;
}

export interface RepartitionTVA {
  tauxTVA: number;
  nombre: number;
  pourcentage: number;
  montantTotal: number;
}

export interface StatistiquesGaranties {
  total: number;
  repartitionParType: TypeGarantieStats[];
  montantTotal: number;
  montantMoyen: number;
  evolutionMensuelle: EvolutionMensuelle[];
}

export interface TypeGarantieStats {
  id: number;
  designation: string;
  nombre: number;
  pourcentage: number;
  montantTotal: number;
  montantMoyen: number;
}

export interface StatistiquesPenalites {
  total: number;
  montantTotal: number;
  repartitionParType: TypePenaliteStats[];
  evolutionMensuelle: EvolutionMensuelle[];
  tauxPenalite: number;
}

export interface TypePenaliteStats {
  id: number;
  designation: string;
  nombre: number;
  pourcentage: number;
  montantTotal: number;
  montantMoyen: number;
}

export interface EvolutionMensuelle {
  mois: string;
  valeur: number;
  variation: number;
  pourcentageVariation: number;
}

export interface TendancesGlobales {
  croissanceMarches: number;
  croissanceFournisseurs: number;
  efficaciteOperationnelle: number;
  satisfactionClient: number;
  predictions: Prediction[];
}

export interface Prediction {
  periode: string;
  type: string;
  valeurPredite: number;
  confiance: number;
}

export interface PerformanceGlobale {
  scoreGlobal: number;
  indicateurs: IndicateurPerformance[];
  alertes: Alerte[];
  recommandations: Recommandation[];
}

export interface IndicateurPerformance {
  nom: string;
  valeur: number;
  objectif: number;
  unite: string;
  tendance: 'up' | 'down' | 'stable';
  couleur: string;
}

export interface Alerte {
  id: string;
  type: 'warning' | 'error' | 'info';
  titre: string;
  message: string;
  date: Date;
  priorite: 'haute' | 'moyenne' | 'basse';
}

export interface Recommandation {
  id: string;
  titre: string;
  description: string;
  impact: 'haute' | 'moyenne' | 'basse';
  effort: 'faible' | 'moyen' | 'eleve';
  categorie: string;
}

// Interfaces pour les APIs externes
export interface TauxChange {
  devise: string;
  taux: number;
  variation: number;
  date: Date;
}

export interface IndicateurEconomique {
  nom: string;
  valeur: number;
  unite: string;
  date: Date;
  source: string;
}

export interface DonneesMeteo {
  ville: string;
  temperature: number;
  humidite: number;
  description: string;
  icone: string;
}

// Interfaces pour les filtres et paramètres
export interface FiltresStatistiques {
  dateDebut?: Date;
  dateFin?: Date;
  fournisseurs?: number[];
  typesMarche?: number[];
  structures?: string[];
  regions?: string[];
  montantMin?: number;
  montantMax?: number;
}

// Interfaces pour les alertes et recommandations
export interface Alerte {
  id: string;
  type: 'error' | 'warning' | 'info';
  titre: string;
  message: string;
  date: Date;
  priorite: 'haute' | 'moyenne' | 'basse';
}

export interface Recommandation {
  id: string;
  titre: string;
  description: string;
  impact: 'haute' | 'moyenne' | 'basse';
  effort: 'eleve' | 'moyen' | 'faible';
  categorie: string;
}

// Interface pour les indicateurs de performance
export interface IndicateurPerformance {
  nom: string;
  valeur: number;
  objectif: number;
  unite: string;
  tendance: 'up' | 'down' | 'stable';
  couleur: string;
}

// Interface pour la performance globale
export interface PerformanceGlobale {
  scoreGlobal: number;
  indicateurs: IndicateurPerformance[];
  alertes: Alerte[];
  recommandations: Recommandation[];
}

export interface ParametresExport {
  format: 'pdf' | 'excel' | 'csv';
  sections: string[];
  includeGraphiques: boolean;
  periode: string;
}
