// ========== INTERFACES POUR LES WIDGETS DASHBOARD ==========

// Interface pour les données des pénalités
export interface PenalitesData {
  penalitesEnCours: number;
  montantTotalPenalites: number;
  topMarchesAvecPenalites: TopMarcheAvecPenalites[];
  penalitesParType?: PenaliteTypeCount[];
}

export interface PenaliteTypeCount {
  designation: string;
  nombre: number;
}

export interface TopMarcheAvecPenalites {
  designation: string;
  nombrePenalites: number;
  montantTotal: number;
}

// Interface pour les données des garanties
export interface GarantiesData {
  garantiesEcheance: number;
  montantTotalGaranties: number;
  repartitionParType: RepartitionTypeGarantie[];
  garantiesEcheanceList?: GarantieEcheanceItem[];
}

export interface GarantieEcheanceItem {
  marcheDesignation: string;
  typeGarantie: string;
  dateFin: string | Date;
  montant: number;
}

export interface RepartitionTypeGarantie {
  designation: string;
  nombre: number;
}

// Interface pour les données des décomptes
export interface DecomptesData {
  decomptesEnAttente: number;
  evolutionPaiements: EvolutionPaiement[];
  retardsPaiement: number;
}

export interface EvolutionPaiement {
  mois: string;
  montant: number;
}

// Interface pour les données des étapes
export interface EtapesData {
  etapesEnRetard: number;
  progressionGlobale: number;
  alertesDelais: AlerteDelai[];
}

export interface AlerteDelai {
  marcheDesignation: string;
  etapeDesignation: string;
  dureePrevue: number;
  dureeReelle?: number;
}

// Interface pour les données sectorielles
export interface SectoriellesData {
  repartitionParSecteur: RepartitionSecteur[];
  performanceParFamille: PerformanceFamille[];
  evolutionPrix: EvolutionPrix[];
}

export interface RepartitionSecteur {
  designation: string;
  nombreMarches: number;
  nombreArticles: number;
}

export interface PerformanceFamille {
  designation: string;
  nombreUtilisations: number;
  prixMoyen: number;
}

export interface EvolutionPrix {
  mois: string;
  prixMoyen: number;
}

// Interface globale pour toutes les données des widgets
export interface DashboardWidgetsData {
  penalites: PenalitesData;
  garanties: GarantiesData;
  decomptes: DecomptesData;
  etapes: EtapesData;
  sectorielles: SectoriellesData;
}

// Interface pour les données de graphiques Chart.js
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface DashboardChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// Interface pour les widgets de statistiques
export interface StatWidget {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
}

// Interface pour les alertes
export interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

// Interface pour les actions rapides
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}
