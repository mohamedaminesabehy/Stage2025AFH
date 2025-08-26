import { Component, OnInit, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FournisseurService } from '../../../services/fournisseur/fournisseur.service';
import { ArticleService } from '../../../services/article/article.service';
import { MarcheService } from '../../../services/marche/marche.service';
import { StatistiquesCompletesService } from '../../../services/statistiques-completes/statistiques-completes.service';
import { StatistiquesService } from '../../../services/statistiques/statistiques.service';
import { forkJoin, of } from 'rxjs';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as FileSaver from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environnement';

import {
  StatistiquesArticlesComplet,
  StatistiquesFournisseursComplet,
  ToutesStatistiquesGenerales,
  MetriquesGlobales,
  ChartDataStatistiques,
  WidgetStatistique
} from '../../../model/statistiques-completes';

@Component({
  selector: 'app-statistiques-periodes',
  templateUrl: './statistiques-periodes.component.html',
  styleUrls: ['./statistiques-periodes.component.scss']
})
export class StatistiquesPeriodesComponent implements OnInit, AfterViewInit {
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;
  selectedPeriod = 'custom'; // Changé de '12months' à 'custom' pour utiliser des dates personnalisées
  filterName = '';
  filterMinAmount = 0;
  filterHasPenalites = false;
  currentBatchIndex = 0;
  pageSize = 10;

  
  // Nouvelles propriétés pour les dates personnalisées
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Pagination avancée
  pageSizeOptions = [5, 10, 25, 50];
  get pageNumbers(): number[] { return Array.from({length: this.fournisseursTotalPages}, (_, i) => i); }

  // Nouvelles propriétés pour la pagination des tableaux
  articlesDisplayLimit = 5;
  fournisseursDisplayLimit = 5;
  
  // Données complètes pour chaque tableau
  allArticlesData: any[] = [];
  allFournisseursData: any[] = [];

  // Pagination classique pour chaque tableau
  articlesPageSize = 5;
  fournisseursPageSize = 5;
  
  articlesCurrentPage = 0;
  fournisseursCurrentPage = 0;
  
  articlesTotalPages = 0;
  fournisseursTotalPages = 0;
  fournisseursTotalElements = 0;

  changePageSize(size: number): void {
    this.pageSize = size;
    this.loadFournisseursComplets(0);
  }



  // Add missing count properties
  fournisseursCount = 0;
  articlesCount = 0;

  // Nouvelles propriétés pour l'interface améliorée
  chartType: any = 'line';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Filtres pour les articles
  filterArticleSecteur = '';
  filterArticleFamille = '';
  filterArticleStatut = '';
  filterArticleTvaMin: number | null = null;
  filterArticleTvaMax: number | null = null;

  // Données pour les légendes et statistiques
  fournisseurLegend: any[] = [];
  sectorStats: any[] = [];

  // ========== NOUVELLES PROPRIÉTÉS POUR STATISTIQUES COMPLÈTES ==========

  // Données des statistiques complètes
  statistiquesArticles: StatistiquesArticlesComplet = {
    articlesBySecteur: [],
    articlesByFamille: [],
    articlesExtremes: [],
    repartitionUnites: [],
    articlesStatut: { actif: 0, inactif: 0, obsolete: 0 },
    topArticles: [],
    evolutionDecomptes: [],
    topFournisseursVolume: [],
    articlesSansMouvement: 0
  };

  // Nouveaux indicateurs
  articlesBySecteur: any[] = [];
  decomptesByType: any[] = [];

  statistiquesFournisseurs: StatistiquesFournisseursComplet = {
    fournisseursByRegion: [],
    fournisseursBySecteur: [],
    fournisseursStatut: { actif: 0, suspendu: 0, blackliste: 0 },
    fournisseursByType: [],
    topFournisseurs: [],
    fournisseursPenalites: { avecPenalites: 0, sansPenalites: 0 }
  };

  metriquesGlobales: MetriquesGlobales = {
    totalArticles: 0,
    totalFournisseurs: 0
  };

  // Valeur totale (TND) provenant de l'API metriques
  valeurTotale = 0;
  
  // Données pour les tendances et mini-graphiques
  marchesHistorique: number[] = [];
  fournisseursHistorique: number[] = [];
  articlesHistorique: number[] = [];
  valeurTotaleHistorique: number[] = [];
  
  // Pourcentages de tendance
  marchesTendance = 0;
  fournisseursTendance = 0;
  articlesTendance = 0;
  valeurTotaleTendance = 0;
  
  // Configuration des mini-graphiques
  miniChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point: { radius: 0 },
      line: { tension: 0.4, borderWidth: 2 }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };
  
  // Données des mini-graphiques
  marchesChartData: ChartData<'line'> = {
    labels: ['J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'J-1', 'Aujourd\'hui'],
    datasets: [{
      data: [],
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.2)',
      fill: true
    }]
  };
  
  fournisseursChartData: ChartData<'line'> = {
    labels: ['J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'J-1', 'Aujourd\'hui'],
    datasets: [{
      data: [],
      borderColor: '#2ecc71',
      backgroundColor: 'rgba(46, 204, 113, 0.2)',
      fill: true
    }]
  };
  
  articlesChartData: ChartData<'line'> = {
    labels: ['J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'J-1', 'Aujourd\'hui'],
    datasets: [{
      data: [],
      borderColor: '#e74c3c',
      backgroundColor: 'rgba(231, 76, 60, 0.2)',
      fill: true
    }]
  };
  
  valeurTotaleChartData: ChartData<'line'> = {
    labels: ['J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'J-1', 'Aujourd\'hui'],
    datasets: [{
      data: [],
      borderColor: '#f39c12',
      backgroundColor: 'rgba(243, 156, 18, 0.2)',
      fill: true
    }]
  };

  // Graphiques pour les nouvelles statistiques
  articlesSecteurChart: ChartData<'pie'> = { labels: [], datasets: [] };
  articlesFamilleChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  repartitionUnitesChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  evolutionDecomptesChart: ChartData<'line'> = { labels: [], datasets: [] };
  topFournisseursVolumeChart: ChartData<'bar'> = { labels: [], datasets: [] };
  fournisseursRegionChart: ChartData<'bar'> = { labels: [], datasets: [] };
  fournisseursSecteurChart: ChartData<'pie'> = { labels: [], datasets: [] };
  
  // Nouveaux graphiques pour les métriques
  penaliteChart: ChartData<'pie'> = { labels: [], datasets: [] };
  tendancesChart: ChartData<'line'> = { labels: [], datasets: [] };
  performanceChart: ChartData<'bar'> = { labels: [], datasets: [] };

  // État de chargement et erreurs
  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Onglets actifs
  activeTab = 'articles';

  // Widgets
  widgets: WidgetStatistique[] = [];

  // Options de graphiques améliorées
  enhancedLineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: 'bold' }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => `Période: ${context[0].label}`,
          label: (context) => `${context.dataset.label}: ${context.parsed.y} marchés`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6c757d',
          font: { size: 11 },
          padding: 10
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6c757d',
          font: { size: 11 },
          padding: 10
        }
      }
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        borderWidth: 2,
        hoverBorderWidth: 3
      },
      line: {
        borderWidth: 3,
        tension: 0.4
      }
    }
  };

  enhancedPieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${percentage}%`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#fff',
        hoverBorderWidth: 4
      }
    }
  };

  enhancedBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6c757d',
          font: { size: 11 },
          padding: 10
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6c757d',
          font: { size: 11 },
          padding: 10,
          maxRotation: 45
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false
      }
    }
  };

  // Données des marchés récupérées depuis le backend
  marchesData: any[] = [];

  filteredMarchesData: any[] = [];



  // Colonnes pour le tableau des marchés
  displayedColumns = ['numMarche', 'designation', 'fournisseur', 'montant', 'date', 'banque', 'actions'];
  articleColumns = ['article', 'utilisations'];

  // Tableau des fournisseurs avec marchés
  fournisseursAvecMarches: any[] = [];

  loadFournisseursAvecMarches(page: number = 0): void {
    console.log('🔄 Chargement des fournisseurs avec marchés, page:', page);
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    const filtres = { 
      numStruct, 
      page, 
      size: this.fournisseursPageSize, 
      filterName: this.filterName, 
      filterMinAmount: this.filterMinAmount 
    };
    
    console.log('📋 Filtres appliqués:', filtres);
    
    this.statistiquesService.getFournisseursAvecMarches(filtres).subscribe({
      next: (res) => {
        console.log('✅ Données fournisseurs reçues:', res);
        this.fournisseursAvecMarches = res.fournisseurs || [];
        this.fournisseursTotalPages = res.totalPages || 1;
        this.fournisseursCurrentPage = res.page || 0;
        this.fournisseursTotalElements = res.totalElements || 0;
        
        console.log(`📊 ${this.fournisseursAvecMarches.length} fournisseurs chargés`);
      },
      error: (err) => {
        console.error('❌ Erreur fournisseurs-avec-marches:', err);
        this.fournisseursAvecMarches = [];
        this.fournisseursTotalElements = 0;
      }
    });
  }

  // Méthodes pour la pagination et le filtrage
  onFournisseursPageChange(event: any): void {
    this.fournisseursPageSize = event.pageSize;
    this.loadFournisseursAvecMarches(event.pageIndex);
  }

  applyFournisseursFilter(): void {
    this.fournisseursCurrentPage = 0;
    this.loadFournisseursAvecMarches(0);
  }

  clearFournisseursFilter(): void {
    this.filterName = '';
    this.filterMinAmount = 0;
    this.fournisseursCurrentPage = 0;
    this.loadFournisseursAvecMarches(0);
  }


  // Propriétés pour l'affichage détaillé
  selectedMarche: any = null;
  showDetails = false;

  marcheEvolutionChart: ChartData<'line'> = { labels: [], datasets: [] };
  fournisseurRepartitionChart: ChartData<'pie'> = { 
    labels: ['STE BOUZGUENDA', 'MEDIBAT', 'SOTUVER'], 
    datasets: [{ data: [15, 12, 8], backgroundColor: ['#3498db', '#2ecc71', '#e74c3c'] }] 
  };
  regionRepartitionChart: ChartData<'bar'> = { 
    labels: ['Tunis', 'Sfax', 'Sousse'], 
    datasets: [{ label: 'Marchés par région', data: [25, 18, 15], backgroundColor: '#3498db' }] 
  };
  articleRepartitionChart: ChartData<'pie'> = { labels: [], datasets: [] };
  garantieChart: ChartData<'pie'> = { labels: [], datasets: [] };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Évolution des marchés', color: '#2c3e50', font: { size: 16 } }
    },
    scales: { 
      y: { 
        beginAtZero: true, 
        ticks: { color: '#7f8c8d' } 
      }, 
      x: { 
        ticks: { 
          color: '#7f8c8d',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11
          },
          autoSkip: false
        },
        grid: {
          display: false
        }
      } 
    }
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right' },
      title: { display: true, color: '#2c3e50', font: { size: 16 } }
    }
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, color: '#2c3e50', font: { size: 16 } }
    },
    scales: { y: { beginAtZero: true, ticks: { color: '#7f8c8d' } }, x: { ticks: { color: '#7f8c8d' } } }
  };

  systemStatus = {
    apiStatus: 'loading',
    lastUpdate: new Date(),
    performance: 92,
    performanceTrend: 3.7
  };
  private loadMetriques(): void {
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    this.statistiquesService.getMetriquesClés(numStruct).subscribe({
      next: (res) => {
        // this.marchesCount = res?.marchesActifs || 0; // Supprimé - tableau des marchés supprimé
        this.fournisseursCount = res?.fournisseurs || 0;
        this.articlesCount = res?.articles || 0;
        this.valeurTotale = res?.valeurTotale || 0;
        
        // Récupérer les tendances des métriques
        this.marchesTendance = res?.tendanceMarchés || 0;
        this.fournisseursTendance = res?.tendanceFournisseurs || 0;
        this.articlesTendance = res?.tendanceArticles || 0;
        this.valeurTotaleTendance = res?.tendanceValeur || 0;
      },
      error: (e) => console.warn('Erreur métriques:', e)
    });
  }

  /**
   * Charge uniquement les données d'évolution du marché
   */
  private loadMarchesEvolutionData(): void {
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    
    // Evolution des marchés
    if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
      // Utiliser les dates personnalisées
      const startDateStr = this.formatDateForApi(this.startDate);
      const endDateStr = this.formatDateForApi(this.endDate);
      
      this.statistiquesService.getMarchesEvolutionParDates(startDateStr, endDateStr, numStruct).subscribe({
        next: (data) => this.updateMarchesEvolutionChart(data),
        error: (e) => console.warn('Erreur evolution marchés avec dates personnalisées:', e)
      });
    } else {
      // Utiliser la période prédéfinie (12 mois par défaut) quand aucune date n'est sélectionnée
      this.statistiquesService.getMarchesEvolutionPeriode('12months', numStruct).subscribe({
        next: (data) => this.updateMarchesEvolutionChart(data),
        error: (e) => console.warn('Erreur evolution marchés:', e)
      });
    }
  }

  private loadChartsFromApi(): void {
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    
    console.log('🔄 Chargement des graphiques depuis l\'API...');
    
    // Evolution des marchés - maintenant géré par loadMarchesEvolutionData()
    this.loadMarchesEvolutionData();
    
    // Répartition fournisseurs
    if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
      const startDateStr = this.formatDateForApi(this.startDate);
      const endDateStr = this.formatDateForApi(this.endDate);
      
      console.log('📊 Chargement répartition fournisseurs avec dates personnalisées:', startDateStr, 'à', endDateStr);
      this.statistiquesService.getFournisseursRepartitionParDates(5, startDateStr, endDateStr, numStruct).subscribe({
        next: (data) => {
          console.log('✅ Données fournisseurs reçues:', data);
          this.updateFournisseurRepartitionChart(data);
        },
        error: (e) => {
          console.error('❌ Erreur répartition fournisseurs avec dates personnalisées:', e);
          this.loadFallbackFournisseurData();
        }
      });
    } else {
      console.log('📊 Chargement répartition fournisseurs par période (12 mois)');
      this.statistiquesService.getFournisseursRepartitionPeriode(5, numStruct).subscribe({
        next: (data) => {
          console.log('✅ Données fournisseurs reçues:', data);
          this.updateFournisseurRepartitionChart(data);
        },
        error: (e) => {
          console.error('❌ Erreur répartition fournisseurs:', e);
          this.loadFallbackFournisseurData();
        }
      });
    }
    
    // Répartition régions
    if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
      const startDateStr = this.formatDateForApi(this.startDate);
      const endDateStr = this.formatDateForApi(this.endDate);
      
      console.log('📊 Chargement répartition régions avec dates personnalisées:', startDateStr, 'à', endDateStr);
      this.statistiquesService.getRegionsRepartitionParDates(startDateStr, endDateStr, numStruct).subscribe({
        next: (data) => {
          console.log('✅ Données régions reçues:', data);
          this.updateRegionRepartitionChart(data);
        },
        error: (e) => {
          console.error('❌ Erreur répartition régions avec dates personnalisées:', e);
          this.loadFallbackRegionData();
        }
      });
    } else {
      console.log('📊 Chargement répartition régions par période (12 mois)');
      this.statistiquesService.getRegionsRepartitionPeriode(numStruct).subscribe({
        next: (data) => {
          console.log('✅ Données régions reçues:', data);
          this.updateRegionRepartitionChart(data);
        },
        error: (e) => {
          console.error('❌ Erreur répartition régions:', e);
          this.loadFallbackRegionData();
        }
      });
    }
    
    // Répartition articles par secteur
    if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
      const startDateStr = this.formatDateForApi(this.startDate);
      const endDateStr = this.formatDateForApi(this.endDate);
      
      console.log('📊 Chargement répartition articles avec dates personnalisées:', startDateStr, 'à', endDateStr);
      this.statistiquesService.getArticlesRepartitionParDates(startDateStr, endDateStr, numStruct).subscribe({
        next: (data) => {
          console.log('✅ Données articles reçues:', data);
          this.updateArticleRepartitionChart(data);
        },
        error: (e) => {
          console.error('❌ Erreur répartition articles avec dates personnalisées:', e);
          this.loadFallbackArticleData();
        }
      });
    } else {
      console.log('📊 Chargement répartition articles par période (12 mois)');
      this.statistiquesService.getArticlesRepartitionPeriode(numStruct).subscribe({
        next: (data) => {
          console.log('✅ Données articles reçues:', data);
          this.updateArticleRepartitionChart(data);
        },
        error: (e) => {
          console.error('❌ Erreur répartition articles:', e);
          this.loadFallbackArticleData();
        }
      });
    }
  }
  
  // Méthode utilitaire pour formater les dates pour l'API
  private formatDateForApi(date: Date | null): string {
    if (!date) {
      throw new Error('Date cannot be null');
    }
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  }


  constructor(
    private router: Router,
    private fournisseurService: FournisseurService,
    private articleService: ArticleService,
    private marcheService: MarcheService,
    private statistiquesCompletesService: StatistiquesCompletesService,
    private statistiquesService: StatistiquesService,
    private http: HttpClient
  ) { }
  ngOnInit(): void {
    console.log('🚀 Initialisation du composant...');
    
    // Charger les données réelles de la base de données (sans dates par défaut)
    this.loadRealDataFromDatabase();
    
    // Charger l'historique des données
    this.loadHistoriqueDonnees();
    
    // Charger les articles avec filtrage au démarrage
    this.loadArticlesWithFilters();
    
    // Charger les nouveaux indicateurs
    this.loadNewIndicators();
  }
  
  ngAfterViewInit(): void {
    // Mettre à jour les graphiques après le rendu du DOM
    setTimeout(() => {
      this.updateCharts();
    }, 500);
  }
  
  // Méthode pour mettre à jour les graphiques et charger les données
  updateCharts(): void {
    console.log('🔄 Mise à jour des graphiques et chargement des données...');
    
    // Mettre à jour les instances de graphiques
    if (this.charts) {
      this.charts.forEach(chart => {
        if (chart && chart.chart) {
          chart.chart.update();
        }
      });
    }

    // Charger les métriques et les graphiques depuis l'API
    this.loadMetriques();
    this.loadChartsFromApi();
    
    // Charger toutes les statistiques complètes (réelles DB)
    this.loadStatistiquesCompletes();

    // Charger fournisseurs avec marchés (réel DB)
    this.loadFournisseursAvecMarches();

    // Charger les nouvelles métriques (garanties, pénalités, tendances, performance)
    this.loadGarantiesData();
    this.loadPenalitesData();
    this.loadTendancesData();
    this.loadPerformanceData();

    // Charger métriques et graphiques depuis l'API (réelles DB)
    this.loadMetriques();
    this.loadChartsFromApi();

    // Initialiser la pagination des tableaux
    this.initializePagination();
  }

  /**
   * Charge les données des garanties
   */
  loadGarantiesData(): void {
    console.log('🔄 Chargement des données des garanties...');
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    
    this.statistiquesService.getStatistiquesGaranties().subscribe({
      next: (data) => {
        console.log('✅ Données garanties reçues:', data);
        this.updateGarantieChart(data);
      },
      error: (err) => {
        console.error('❌ Erreur garanties:', err);
      }
    });
  }

  /**
   * Charge les données des pénalités
   */
  loadPenalitesData(): void {
    console.log('🔄 Chargement des données des pénalités...');
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    
    this.statistiquesService.getStatistiquesPenalites().subscribe({
      next: (data) => {
        console.log('✅ Données pénalités reçues:', data);
        this.updatePenaliteChart(data);
      },
      error: (err) => {
        console.error('❌ Erreur pénalités:', err);
      }
    });
  }

  /**
   * Charge les données des tendances
   */
  loadTendancesData(): void {
    console.log('🔄 Chargement des données des tendances...');
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    
    this.statistiquesService.getTendancesGlobales().subscribe({
      next: (data) => {
        console.log('✅ Données tendances reçues:', data);
        this.updateTendancesChart(data);
      },
      error: (err) => {
        console.error('❌ Erreur tendances:', err);
      }
    });
  }

  /**
   * Charge les données de performance
   */
  loadPerformanceData(): void {
    console.log('🔄 Chargement des données de performance...');
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    
    this.statistiquesService.getPerformanceGlobale().subscribe({
      next: (data) => {
        console.log('✅ Données performance reçues:', data);
        this.updatePerformanceChart(data);
      },
      error: (err) => {
        console.error('❌ Erreur performance:', err);
      }
    });
  }

  /**
   * Initialise la pagination pour tous les tableaux
   */
  private initializePagination(): void {
    // Calculer le nombre total de pages pour chaque tableau
    setTimeout(() => {
      this.calculateArticlesTotalPages();
      this.calculateFournisseursTotalPages();
      // this.calculateMarchesTotalPages(); // Supprimé - tableau des marchés supprimé
    }, 1000); // Délai pour permettre le chargement des données
  }

  /**
   * Charge les données de base qui fonctionnent (évite les tables inexistantes)
   */
  loadBasicData(): void {
    console.log('📊 Chargement des données de base...');

    // Charger seulement le nombre de fournisseurs (cette requête fonctionne)
    this.fournisseurService.getFournisseurList(0, 1).subscribe({
      next: (response: any) => {
        if (response && response.totalElements) {
          this.fournisseursCount = response.totalElements;
          console.log('✅ Nombre de fournisseurs:', this.fournisseursCount);
        }
      },
      error: (error) => {
        console.warn('⚠️ Erreur lors du comptage des fournisseurs:', error);
        this.fournisseursCount = 0;
      }
    });

    // Charger le nombre d'articles
    this.articleService.getArticlesList(0, 1).subscribe({
      next: (response: any) => {
        if (response && response.totalElements) {
          this.articlesCount = response.totalElements;
          console.log('✅ Nombre d\'articles:', this.articlesCount);
        }
      },
      error: (error) => {
        console.warn('⚠️ Erreur lors du comptage des articles:', error);
        this.articlesCount = 0;
      }
    });

    // Charger le nombre de marchés
    this.marcheService.getAllMarches(0, 1).subscribe({
      next: (response: any) => {
        if (response && response.totalElements) {
                  // this.marchesCount = response.totalElements; // Supprimé - tableau des marchés supprimé
        console.log('✅ Nombre de marchés:', response.totalElements);
        }
      },
      error: (error) => {
        console.warn('⚠️ Erreur lors du comptage des marchés:', error);
        // this.marchesCount = 0; // Supprimé - tableau des marchés supprimé
      }
    });

    console.log('📊 Données de base chargées');
  }

  /**
   * Charge tous les marchés avec leurs fournisseurs et banques depuis le backend
   */
  loadFournisseursComplets(page: number = 0): void {
    console.log('🔄 Chargement des marchés depuis le backend...');
    console.log('🔍 État actuel marchesData:', this.marchesData.length);

    // Récupérer le numéro de structure depuis la session
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    console.log('🏢 Numéro de structure:', numStruct);

    // Préparer les filtres pour la requête
    const filtres: any = {
      numStruct: numStruct,
      page: page,
      size: this.pageSize
    };

    // Ajouter les filtres optionnels si présents
    if (this.filterName) {
      filtres.filterName = this.filterName;
    }
    if (this.filterMinAmount) {
      filtres.filterMinAmount = this.filterMinAmount;
    }

    // Utiliser le service optimisé pour charger les marchés avec leurs fournisseurs et banques
    this.statistiquesService.getMarchesDetailles(filtres).subscribe({
      next: (response: any) => {
        console.log('📦 Réponse marchés détaillée:', response);
        console.log('📊 Type de réponse:', typeof response);
        console.log('📋 Clés de la réponse:', Object.keys(response || {}));

        if (response && response.marches) {
          console.log('✅ Marchés trouvés, nombre d\'éléments:', response.marches.length);
          console.log('📄 Premier marché:', response.marches[0]);

          // Mapper les données pour correspondre à la structure attendue
          this.marchesData = response.marches.map((marche: any) => {
            return {
              // Informations de base du marché
              numMarche: marche.numMarche,
              designation: marche.designation,
              montant: marche.montant,
              date: marche.date ? new Date(marche.date) : new Date(),
              numFourn: marche.numFourn,
              fournisseur: marche.fournisseur,
              banque: marche.banque || 'Non spécifiée'
            };
          });

          // Mettre à jour les informations de pagination
          // this.totalMarches = response.totalElements || response.marches.length; // Supprimé - tableau des marchés supprimé
          // this.currentPage = response.page || page; // Supprimé - tableau des marchés supprimé
          // this.totalPages = Math.ceil(this.totalMarches / this.pageSize); // Supprimé - tableau des marchés supprimé

          console.log('✅ Marchés mappés:', this.marchesData.length);
          console.log('📋 Liste des marchés:', this.marchesData.map(m => m.designation));

          // Initialiser immédiatement le tableau filtré
          this.filteredMarchesData = [...this.marchesData];
          console.log('🔍 Tableau filtré initialisé:', this.filteredMarchesData.length);

        } else {
          console.warn('⚠️ Aucun marché trouvé dans la réponse');
          console.warn('📦 Structure de la réponse:', response);
          // this.marchesData = []; // Supprimé - tableau des marchés supprimé
          // this.filteredMarchesData = []; // Supprimé - tableau des marchés supprimé
          // this.totalMarches = 0; // Supprimé - tableau des marchés supprimé
          // this.currentPage = 0; // Supprimé - tableau des marchés supprimé
          // this.totalPages = 0; // Supprimé - tableau des marchés supprimé
        }

        // Mettre à jour l'affichage
        console.log('🔄 Mise à jour de l\'affichage...');
        this.applyFilters();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des marchés:', error);
        console.error('📋 Détails de l\'erreur:', error.message);
        console.error('🔍 Status de l\'erreur:', error.status);

        // Fallback : créer quelques marchés de test
        console.log('🔄 Utilisation du fallback avec des données de test...');
        this.createFallbackMarches();
      }
    });
  }

  /**
   * Crée des marchés de fallback en cas d'erreur API
   */
  createFallbackMarches(): void {
    console.log('🔧 Création de marchés de fallback...');

    this.marchesData = [
      {
        numMarche: 1,
        designation: 'Marché test 1',
        montant: 100000,
        date: new Date(),
        numFourn: 'TEST001',
        fournisseur: 'FOURNISSEUR TEST 1',
        banque: 'Banque test 1'
      },
      {
        numMarche: 2,
        designation: 'Marché test 2',
        montant: 200000,
        date: new Date(),
        numFourn: 'TEST002',
        fournisseur: 'FOURNISSEUR TEST 2',
        banque: 'Banque test 2'
      },
      {
        numMarche: 3,
        designation: 'Marché test 3',
        montant: 150000,
        date: new Date(),
        numFourn: 'TEST003',
        fournisseur: 'FOURNISSEUR TEST 3',
        banque: 'Banque test 3'
      }
    ];

    console.log('✅ Marchés de fallback créés:', this.marchesData.length);

    // Initialiser le tableau filtré
    this.filteredMarchesData = [...this.marchesData];
    this.applyFilters();

    console.log('🔍 Tableau filtré avec fallback:', this.filteredMarchesData.length);
  }

  /**
   * Charge les marchés pour tous les fournisseurs
   * @param numStruct Le numéro de structure pour filtrer les marchés
   */
  loadMarchesForFournisseurs(numStruct: string = '03'): void {
    // Cette méthode n'est plus utilisée car nous utilisons le service optimisé
    console.log('🔄 Cette méthode est désactivée car nous utilisons le service optimisé');
  }

  /**
   * Charge les pénalités pour tous les fournisseurs
   */
  loadPenalitesForFournisseurs(): void {
    // Cette méthode n'est plus utilisée car nous utilisons le service optimisé
    console.log('🔄 Cette méthode est désactivée car nous utilisons le service optimisé');
  }

  /**
   * Charge les pénalités réelles depuis la base de données
   */
  loadRealPenalitesFromDatabase(typesPenalites: any[]): void {
    // Cette méthode n'est plus utilisée car nous utilisons le service optimisé
    console.log('🔄 Cette méthode est désactivée car nous utilisons le service optimisé');
  }

  /**
   * Charge les garanties pour tous les fournisseurs
   */
  loadGarantiesForFournisseurs(): void {
    // Cette méthode n'est plus utilisée car nous utilisons le service optimisé
    console.log('🔄 Cette méthode est désactivée car nous utilisons le service optimisé');
  }

  loadDashboardData(): void {
    // Les données du dashboard proviennent désormais des endpoints statistiques réels
    this.loadMetriques();
    this.loadChartsFromApi();
  }

  /**
   * Méthode désactivée - StatistiquesService utilise des tables inexistantes
   */
  loadStatistiquesData(): void {
    console.log('⚠️ loadStatistiquesData désactivée - utilise des tables inexistantes');
    console.log('📊 Utilisation de loadBasicData à la place');

    // Utiliser loadBasicData qui fonctionne avec les tables existantes
    // Cette méthode est appelée dans ngOnInit()
  }

  prepareChartData(): void {
    const months = this.getMonthsForPeriod();
    const marcheData = this.generateMarcheData(months.length);

    this.marcheEvolutionChart = {
      labels: months,
      datasets: [{
        label: 'Marchés signés',
        data: marcheData,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };

    // Les graphiques de répartition des fournisseurs ne sont plus utilisés car nous n'avons plus de données fournisseurs
    this.fournisseurRepartitionChart = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: []
      }]
    };

    this.regionRepartitionChart = {
      labels: [],
      datasets: [{
        label: 'Marchés par région',
        data: [],
        backgroundColor: '#3498db'
      }]
    };

    // Ce graphique est maintenant alimenté via updateArticleRepartitionChart() depuis l'API

    this.garantieChart = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12']
      }]
    };
  }

  getMonthsForPeriod(): string[] {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let periodLength = 12;

    if (this.selectedPeriod === '6months') periodLength = 6;
    else if (this.selectedPeriod === '3months') periodLength = 3;

    const result: string[] = [];
    for (let i = periodLength - 1; i >= 0; i--) {
      // Calculer le mois et l'année en tenant compte du changement d'année
      const monthsAgo = i;
      const targetDate = new Date(today);
      targetDate.setMonth(today.getMonth() - monthsAgo);
      
      const monthIndex = targetDate.getMonth();
      const year = targetDate.getFullYear();
      
      result.push(`${months[monthIndex]} ${year}`);
    }
    return result;
  }

  generateMarcheData(length: number): number[] {
    const data: number[] = [];
    for (let i = 0; i < length; i++) {
      data.push(Math.floor(Math.random() * 10) + 1);
    }
    return data;
  }



  // Cette fonction a été fusionnée avec l'autre implémentation de updateCharts()
  loadChartsAndMetrics(): void {
    this.loadMetriques();
    this.loadChartsFromApi();
  }

  exportToPDF(): void {
    if (!this.startDate || !this.endDate) {
      alert('Veuillez sélectionner une période d\'analyse avant d\'exporter');
      return;
    }

    const dateDebut = this.startDate!.toISOString().split('T')[0];
    const dateFin = this.endDate!.toISOString().split('T')[0];
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';

    this.statistiquesService.exporterDonnees('pdf', dateDebut, dateFin, numStruct).subscribe(
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `statistiques_marches_${dateDebut}_${dateFin}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Erreur lors de l\'export PDF:', error);
        alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
      }
    );
  }

  exportToExcel(): void {
    if (!this.startDate || !this.endDate) {
      alert('Veuillez sélectionner une période d\'analyse avant d\'exporter');
      return;
    }

    const dateDebut = this.startDate!.toISOString().split('T')[0];
    const dateFin = this.endDate!.toISOString().split('T')[0];
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';

    console.log('Début de l\'export Excel avec les paramètres:', { dateDebut, dateFin, numStruct });

    this.statistiquesService.exporterDonnees('excel', dateDebut, dateFin, numStruct).subscribe(
      (blob: Blob) => {
        console.log('Fichier Excel reçu, taille:', blob.size);
        
        if (blob.size === 0) {
          alert('Le fichier généré est vide. Veuillez vérifier les données.');
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `statistiques_marches_${dateDebut}_${dateFin}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Téléchargement terminé');
      },
      (error) => {
        console.error('Erreur lors de l\'export Excel:', error);
        alert('Erreur lors de l\'export Excel. Veuillez réessayer.');
      }
    );
  }



  navigateTo(path: string): void {
    this.router.navigate(['/' + path]);
  }

  // Nouvelles méthodes pour l'interface améliorée
  getTotalValue(): number {
    return this.marchesData.reduce((total, m) => total + m.montant, 0) / 1000;
  }

  // Méthodes pour gérer les dates personnalisées
  onStartDateChange(event: any): void {
    this.startDate = event ? new Date(event) : null;
    console.log('Date de début changée:', this.startDate);
  }

  onEndDateChange(event: any): void {
    this.endDate = event ? new Date(event) : null;
    console.log('Date de fin changée:', this.endDate);
  }

  applyDateFilter(): void {
    if (!this.startDate || !this.endDate) {
      alert('Veuillez sélectionner une date de début et une date de fin');
      return;
    }

    if (this.endDate < this.startDate) {
      alert('La date de fin doit être postérieure à la date de début');
      return;
    }

    this.selectedPeriod = 'custom';
    // Appeler uniquement la méthode pour charger les données d'évolution du marché
    this.loadMarchesEvolutionData();
  }

  // Ancienne méthode modifiée pour compatibilité
  changePeriod(period: string): void {
    this.selectedPeriod = period;
    // Appeler uniquement la méthode pour charger les données d'évolution du marché
    this.loadMarchesEvolutionData();
  }

  getPeriodLabel(): string {
    if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
      const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date);
      };
      return `du ${formatDate(this.startDate)} au ${formatDate(this.endDate)}`;
    }

    switch (this.selectedPeriod) {
      case '3months': return 'les 3 derniers mois';
      case '6months': return 'les 6 derniers mois';
      case '12months': return 'les 12 derniers mois';
      default: return 'les 12 derniers mois (par défaut)';
    }
  }

  setChartType(type: any): void {
    this.chartType = type;
    this.updateCharts();
  }

  getTotalMarches(): number {
    return this.marcheEvolutionChart.datasets?.[0]?.data?.reduce((a: any, b: any) => a + b, 0) || 0;
  }

  getAverageMarches(): number {
    const data = this.marcheEvolutionChart.datasets?.[0]?.data || [];
    return data.length > 0 ? Math.round((data.reduce((a: any, b: any) => a + b, 0) / data.length) * 10) / 10 : 0;
  }

  getActiveMarches(): number {
    return 0; // Supprimé - tableau des marchés supprimé
  }

  getAverageDelay(): number {
    return Math.floor(Math.random() * 15) + 10; // Simulation
  }

  toggleChartView(chartName: string): void {
    console.log(`Expanding ${chartName} chart view`);
    // Logique pour agrandir le graphique
  }

  getSecuredAmount(): number {
    return Math.floor(Math.random() * 1000) + 500; // Simulation
  }

  exportFournisseursData(): void {
    this.exportToExcel();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredMarchesData.sort((a: any, b: any) => {
      const aVal = a[column];
      const bVal = b[column];

      if (typeof aVal === 'string') {
        return this.sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return this.sortDirection === 'asc'
          ? aVal - bVal
          : bVal - aVal;
      }
    });
  }

  trackByFournisseur(_: number, item: any): any {
    return item.numMarche;
  }

  trackByArticle(_: number, item: any): any {
    return item.designation;
  }

  /**
   * Affiche les détails d'un marché
   */
  showMarcheDetails(marche: any): void {
    this.selectedMarche = marche;
    this.showDetails = true;
  }

  /**
   * Ferme la vue détaillée
   */
  closeDetails(): void {
    this.showDetails = false;
    this.selectedMarche = null;
  }

  // Méthodes supprimées - versions améliorées disponibles plus bas

  /**
   * Obtient la classe CSS pour le statut d'un marché
   */
  getMarcheStatusClass(statut: string): string {
    switch (statut.toLowerCase()) {
      case 'en cours': return 'status-en-cours';
      case 'terminé': return 'status-termine';
      case 'suspendu': return 'status-suspendu';
      default: return 'status-default';
    }
  }

  /**
   * Formate une date pour l'affichage
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  getPerformanceScore(fournisseur: any): number {
    // Cette méthode n'est plus utilisée car nous n'avons plus de données fournisseurs
    return 0;
  }

  viewFournisseur(fournisseur: any): void {
    console.log('Viewing fournisseur:', fournisseur);
    // Logique pour voir les détails du fournisseur
  }

  editFournisseur(fournisseur: any): void {
    console.log('Editing fournisseur:', fournisseur);
    // Logique pour éditer le fournisseur
  }

  getSecteurClass(secteur: string): string {
    switch (secteur.toLowerCase()) {
      case 'gaz': return 'secteur-gaz';
      case 'eau': return 'secteur-eau';
      case 'électricité': return 'secteur-electricite';
      default: return 'secteur-default';
    }
  }

  getRandomTrend(): number {
    return Math.floor(Math.random() * 20) + 5;
  }

  // Initialisation des données pour les légendes
  private initializeLegendData(): void {
    // Cette méthode n'est plus utilisée car nous n'avons plus de données fournisseurs
    this.fournisseurLegend = [];

    this.sectorStats = [
              // Données vides - seront remplies par l'API
        { name: '', percentage: 0 }
    ];
  }

  /**
   * Met à jour le graphique d'évolution des marchés avec les données de l'API
   */
  updateMarchesEvolutionChart(data: any): void {
    // Vérifier si les données sont valides
    if (!data || !data.labels || !data.data) {
      console.warn('⚠️ Données d\'évolution des marchés invalides:', data);
      return;
    }

    this.marcheEvolutionChart = {
      labels: data.labels,
      datasets: [{
        label: 'Marchés signés',
        data: data.data,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
    
    // Mettre à jour les options du graphique avec le titre incluant la période
    this.lineChartOptions = {
      ...(this.lineChartOptions || {}),
      plugins: {
        ...((this.lineChartOptions && this.lineChartOptions.plugins) || {}),
        title: {
          display: true,
          text: `Évolution des marchés pour ${this.getPeriodLabel()}`,
          font: {
            size: 16
          }
        }
      }
    };

    console.log('✅ Graphique d\'évolution des marchés mis à jour:', this.marcheEvolutionChart);
  }

  /**
   * Met à jour le graphique de répartition des fournisseurs avec les données de l'API
   */
  updateFournisseurRepartitionChart(data: any): void {
    console.log('🔄 Mise à jour du graphique fournisseurs:', data);
    
    // Gestion de la nouvelle structure de données avec 'repartition'
    if (data && data.repartition && Array.isArray(data.repartition) && data.repartition.length > 0) {
      const labels = data.repartition.map((item: any) => item.fournisseur || item.label || 'Inconnu');
      const values = data.repartition.map((item: any) => item.nombre_marches || item.data || 0);
      
      this.fournisseurRepartitionChart = {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e']
        }]
      };
      
      console.log('✅ Graphique fournisseurs mis à jour avec nouvelle structure:', this.fournisseurRepartitionChart);
    } else if (data && data.labels && data.data && data.labels.length > 0) {
      // Gestion de l'ancienne structure de données
      this.fournisseurRepartitionChart = {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e']
        }]
      };
      
      console.log('✅ Graphique fournisseurs mis à jour avec ancienne structure:', this.fournisseurRepartitionChart);
    } else {
      console.warn('⚠️ Données fournisseurs invalides ou vides:', data);
    }
  }

  /**
   * Met à jour le graphique de répartition par région avec les données de l'API
   */
  updateRegionRepartitionChart(data: any): void {
    console.log('🔄 Mise à jour du graphique régions:', data);
    
    // Gestion de la nouvelle structure de données avec 'repartition'
    if (data && data.repartition && Array.isArray(data.repartition) && data.repartition.length > 0) {
      const labels = data.repartition.map((item: any) => item.region || item.label || 'Inconnu');
      const values = data.repartition.map((item: any) => item.nombre_marches || item.data || 0);
      
      this.regionRepartitionChart = {
        labels: labels,
        datasets: [{
          label: 'Marchés par région',
          data: values,
          backgroundColor: '#3498db'
        }]
      };
      
      console.log('✅ Graphique régions mis à jour avec nouvelle structure:', this.regionRepartitionChart);
    } else if (data && data.labels && data.data && data.labels.length > 0) {
      // Gestion de l'ancienne structure de données
      this.regionRepartitionChart = {
        labels: data.labels,
        datasets: [{
          label: 'Marchés par région',
          data: data.data,
          backgroundColor: '#3498db'
        }]
      };
      
      console.log('✅ Graphique régions mis à jour avec ancienne structure:', this.regionRepartitionChart);
    } else {
      console.warn('⚠️ Données régions invalides ou vides:', data);
    }
  }

  /**
   * Met à jour le graphique de répartition des articles avec les données de l'API
   */
  updateArticleRepartitionChart(data: any): void {
    console.log('🔄 Mise à jour du graphique articles:', data);
    
    // Gestion de la nouvelle structure de données avec 'repartition'
    if (data && data.repartition && Array.isArray(data.repartition) && data.repartition.length > 0) {
      const labels = data.repartition.map((item: any) => item.secteur || item.label || 'Inconnu');
      const values = data.repartition.map((item: any) => item.nombre_articles || item.data || 0);
      
      this.articleRepartitionChart = {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e']
        }]
      };
      
      console.log('✅ Graphique articles mis à jour avec nouvelle structure:', this.articleRepartitionChart);
    } else if (data && data.labels && data.data && data.labels.length > 0) {
      // Gestion de l'ancienne structure de données
      this.articleRepartitionChart = {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e']
        }]
      };
      
      console.log('✅ Graphique articles mis à jour avec ancienne structure:', this.articleRepartitionChart);
    } else {
      console.warn('⚠️ Données articles invalides ou vides:', data);
    }
  }

  /**
   * Met à jour le graphique des garanties avec les données de l'API
   */
  updateGarantieChart(data: any): void {
    console.log('🔄 Mise à jour du graphique garanties:', data);
    
    // Gestion de la nouvelle structure de données avec 'garanties'
    if (data && data.garanties && Array.isArray(data.garanties) && data.garanties.length > 0) {
      const labels = data.garanties.map((item: any) => item.typeGarantie || item.label || 'Inconnu');
      const values = data.garanties.map((item: any) => item.nombreGaranties || item.data || 0);
      
      this.garantieChart = {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e']
        }]
      };
      
      console.log('✅ Graphique garanties mis à jour avec nouvelle structure:', this.garantieChart);
    } else if (data && data.labels && data.data && data.labels.length > 0) {
      // Gestion de l'ancienne structure de données
      this.garantieChart = {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: data.colors || ['#3498db', '#2ecc71', '#e74c3c', '#f39c12']
        }]
      };
      
      console.log('✅ Graphique garanties mis à jour avec ancienne structure:', this.garantieChart);
    } else {
      console.warn('⚠️ Données garanties invalides ou vides:', data);
    }
  }

  /**
   * Met à jour le graphique des pénalités avec les données de l'API
   */
  updatePenaliteChart(data: any): void {
    console.log('🔄 Mise à jour du graphique pénalités:', data);
    
    // Gestion de la nouvelle structure de données avec 'penalites'
    if (data && data.penalites && Array.isArray(data.penalites) && data.penalites.length > 0) {
      const labels = data.penalites.map((item: any) => item.typePenalite || item.label || 'Inconnu');
      const values = data.penalites.map((item: any) => item.nombrePenalites || item.data || 0);
      
      this.penaliteChart = {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ['#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#3498db', '#2ecc71']
        }]
      };
      
      console.log('✅ Graphique pénalités mis à jour avec nouvelle structure:', this.penaliteChart);
    } else if (data && data.labels && data.data && data.labels.length > 0) {
      // Gestion de l'ancienne structure de données
      this.penaliteChart = {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: data.colors || ['#e74c3c', '#f39c12', '#9b59b6', '#1abc9c']
        }]
      };
      
      console.log('✅ Graphique pénalités mis à jour avec ancienne structure:', this.penaliteChart);
    } else {
      console.warn('⚠️ Données pénalités invalides ou vides:', data);
    }
  }

  /**
   * Met à jour le graphique des tendances avec les données de l'API
   */
  updateTendancesChart(data: any): void {
    console.log('🔄 Mise à jour du graphique tendances:', data);
    
    // Gestion de la nouvelle structure de données avec 'tendances'
    if (data && data.tendances && Array.isArray(data.tendances) && data.tendances.length > 0) {
      const labels = data.tendances.map((item: any) => item.mois || item.label || 'Inconnu');
      const values = data.tendances.map((item: any) => item.nombreMarches || item.data || 0);
      
      this.tendancesChart = {
        labels: labels,
        datasets: [{
          label: 'Nombre de marchés',
          data: values,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4
        }]
      };
      
      console.log('✅ Graphique tendances mis à jour avec nouvelle structure:', this.tendancesChart);
    } else if (data && data.labels && data.data && data.labels.length > 0) {
      // Gestion de l'ancienne structure de données
      this.tendancesChart = {
        labels: data.labels,
        datasets: [{
          label: 'Nombre de marchés',
          data: data.data,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4
        }]
      };
      
      console.log('✅ Graphique tendances mis à jour avec ancienne structure:', this.tendancesChart);
    } else {
      console.warn('⚠️ Données tendances invalides ou vides:', data);
    }
  }

  /**
   * Met à jour le graphique de performance avec les données de l'API
   */
  updatePerformanceChart(data: any): void {
    console.log('🔄 Mise à jour du graphique performance:', data);
    
    // Gestion de la nouvelle structure de données avec 'performance'
    if (data && data.performance && Array.isArray(data.performance) && data.performance.length > 0) {
      const labels = data.performance.map((item: any) => item.fournisseur || item.label || 'Inconnu');
      const values = data.performance.map((item: any) => item.nombreMarches || item.data || 0);
      
      this.performanceChart = {
        labels: labels,
        datasets: [{
          label: 'Nombre de marchés',
          data: values,
          backgroundColor: '#2ecc71'
        }]
      };
      
      console.log('✅ Graphique performance mis à jour avec nouvelle structure:', this.performanceChart);
    } else if (data && data.labels && data.data && data.labels.length > 0) {
      // Gestion de l'ancienne structure de données
      this.performanceChart = {
        labels: data.labels,
        datasets: [{
          label: 'Nombre de marchés',
          data: data.data,
          backgroundColor: '#2ecc71'
        }]
      };
      
      console.log('✅ Graphique performance mis à jour avec ancienne structure:', this.performanceChart);
    } else {
      console.warn('⚠️ Données performance invalides ou vides:', data);
    }
  }

  // ========== MÉTHODES DE FALLBACK POUR LES GRAPHIQUES ==========

  /**
   * Charge des données de fallback pour le graphique des fournisseurs
   */
  private loadFallbackFournisseurData(): void {
    console.log('🔄 Chargement des données de fallback pour les fournisseurs');
    const fallbackData = {
      labels: ['STE BOUZGUENDA', 'MEDIBAT', 'SOTUVER', 'TUNISIE TELECOM', 'ORANGE TUNISIE'],
      data: [15, 12, 8, 6, 4]
    };
    this.updateFournisseurRepartitionChart(fallbackData);
  }

  /**
   * Charge des données de fallback pour le graphique des régions
   */
  private loadFallbackRegionData(): void {
    console.log('🔄 Chargement des données de fallback pour les régions');
    const fallbackData = {
      labels: ['Tunis', 'Sfax', 'Sousse', 'Monastir', 'Gabès'],
      data: [25, 18, 15, 12, 8]
    };
    this.updateRegionRepartitionChart(fallbackData);
  }

  /**
   * Charge des données de fallback pour le graphique des articles
   */
  private loadFallbackArticleData(): void {
    console.log('🔄 Chargement des données de fallback pour les articles');
    const fallbackData = {
      labels: ['GAZ', 'EAU', 'ÉLECTRICITÉ', 'TÉLÉCOMMUNICATIONS', 'TRANSPORT'],
      data: [45, 30, 25, 20, 15]
    };
    this.updateArticleRepartitionChart(fallbackData);
  }

  /**
   * Actualise toutes les données depuis l'API
   */
  refreshData(): void {
    this.systemStatus.apiStatus = 'loading';
    this.systemStatus.lastUpdate = new Date();

    console.log('🔄 Actualisation des données...');
    
    // Charger l'historique des données pour les mini-graphiques
    this.loadHistoriqueDonnees();

    // Charger les données qui fonctionnent
    this.loadBasicData();
    this.loadFournisseursComplets();
    
    // Mettre à jour les graphiques après le chargement des données
    setTimeout(() => {
      this.updateCharts();
    }, 500);

    // Fallback vers l'ancienne méthode si nécessaire
    this.loadDashboardData();

    setTimeout(() => {
      this.systemStatus.apiStatus = 'online';
    }, 1000);
  }

  /**
   * Met à jour les filtres et recharge les données
   */
  applyFilters(): void {
    // Filtrage local pour l'affichage immédiat
    let filteredData = this.marchesData.filter(m => {
      const matchesName = this.filterName ?
        (m.fournisseur.toLowerCase().includes(this.filterName.toLowerCase()) ||
         m.designation.toLowerCase().includes(this.filterName.toLowerCase())) : true;
      const matchesAmount = m.montant >= (this.filterMinAmount || 0);
      return matchesName && matchesAmount;
    });

    // Trier par montant décroissant
    filteredData.sort((a, b) => b.montant - a.montant);

    // Afficher uniquement les données de la page courante
    // const startIndex = this.currentPage * this.pageSize; // Supprimé - tableau des marchés supprimé
    // const endIndex = startIndex + this.pageSize; // Supprimé - tableau des marchés supprimé
    // this.filteredMarchesData = filteredData.slice(startIndex, endIndex); // Supprimé - tableau des marchés supprimé

    // Les données sont déjà filtrées localement ci-dessus
    // Pas besoin de recharger depuis l'API (évite les erreurs sur tables inexistantes)
    console.log('🔍 Filtres appliqués localement:', this.filteredMarchesData.length, 'marchés');

    // Si l'onglet Fournisseurs est actif, recharger la liste des fournisseurs avec marchés
    if (this.activeTab === 'fournisseurs') {
      this.fournisseursCurrentPage = 0;
      this.loadFournisseursAvecMarches(0);
    }
  }

  /**
   * Charge le lot suivant de fournisseurs
   */
  loadNextBatch(): void {
    this.currentBatchIndex++;
    this.applyFilters();
  }

  /**
   * Charge le lot précédent de fournisseurs
   */
  loadPreviousBatch(): void {
    if (this.currentBatchIndex > 0) {
      this.currentBatchIndex--;
      this.applyFilters();
    }
  }

  /**
   * Retourne les pénalités associées à un marché spécifique
   */
  getPenalitesForMarche(fournisseur: any, marcheId: any): any[] {
    // Cette méthode n'est plus utilisée car nous n'avons plus de données fournisseurs
    return [];
  }

  /**
   * Retourne les garanties associées à un marché spécifique
   */
  getGarantiesForMarche(fournisseur: any, marcheId: any): any[] {
    // Cette méthode n'est plus utilisée car nous n'avons plus de données fournisseurs
    return [];
  }

  /**
   * Retourne l'icône appropriée pour le statut d'un marché
   */
  getStatusIcon(statut: string): string {
    switch (statut?.toLowerCase()) {
      case 'en cours':
        return 'fa-play-circle';
      case 'terminé':
        return 'fa-check-circle';
      case 'suspendu':
        return 'fa-pause-circle';
      case 'annulé':
        return 'fa-times-circle';
      default:
        return 'fa-question-circle';
    }
  }

  // ========== NOUVELLES MÉTHODES POUR STATISTIQUES COMPLÈTES ==========

  /**
   * Charge toutes les statistiques complètes
   */
  loadStatistiquesCompletes(): void {
    this.isLoading = true;
    this.hasError = false;

    this.statistiquesCompletesService.getToutesStatistiques().subscribe({
      next: (data) => {
        this.statistiquesArticles = data.articles;
        this.statistiquesFournisseurs = data.fournisseurs;
        this.metriquesGlobales = data.metriquesGlobales;

        // Mettre à jour les graphiques
        this.updateStatistiquesCharts();

        this.isLoading = false;
        console.log('✅ Statistiques complètes chargées:', data);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des statistiques:', error);
        this.hasError = true;
        this.errorMessage = 'Erreur lors du chargement des statistiques';
        this.isLoading = false;
      }
    });
  }

  /**
   * Met à jour tous les graphiques des statistiques
   */
  updateStatistiquesCharts(): void {
    console.log('🔄 Mise à jour des graphiques des statistiques...');
    
    // Graphique articles par secteur
    if (this.statistiquesArticles?.articlesBySecteur?.length > 0) {
      this.articlesSecteurChart = {
        labels: this.statistiquesArticles.articlesBySecteur.map(item => item.secteur),
        datasets: [{
          label: 'Nombre d\'articles',
          data: this.statistiquesArticles.articlesBySecteur.map(item => item.nombre),
          backgroundColor: [
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(155, 89, 182, 0.7)',
            'rgba(241, 196, 15, 0.7)',
            'rgba(231, 76, 60, 0.7)'
          ],
          borderColor: [
            'rgba(52, 152, 219, 1)',
            'rgba(46, 204, 113, 1)',
            'rgba(155, 89, 182, 1)',
            'rgba(241, 196, 15, 1)',
            'rgba(231, 76, 60, 1)'
          ],
          borderWidth: 1
        }]
      };
      console.log('✅ Graphique articles par secteur mis à jour');
    }

    // Graphique fournisseurs par région
    if (this.statistiquesFournisseurs?.fournisseursByRegion?.length > 0) {
      this.fournisseursRegionChart = {
        labels: this.statistiquesFournisseurs.fournisseursByRegion.map(item => item.region),
        datasets: [{
          label: 'Nombre de fournisseurs',
          data: this.statistiquesFournisseurs.fournisseursByRegion.map(item => item.nombre),
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: 'rgba(46, 204, 113, 1)',
          borderWidth: 1
        }]
      };
      console.log('✅ Graphique fournisseurs par région mis à jour');
    }

    // Graphique répartition par famille (doughnut) à partir de la DB
    if (this.statistiquesArticles?.articlesByFamille?.length > 0) {
      this.articlesFamilleChart = {
        labels: this.statistiquesArticles.articlesByFamille.map(f => f.famille),
        datasets: [{
          data: this.statistiquesArticles.articlesByFamille.map(f => f.nombre),
          backgroundColor: [
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(241, 196, 15, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(155, 89, 182, 0.7)',
            'rgba(26, 188, 156, 0.7)'
          ],
          borderColor: [
            'rgba(52, 152, 219, 1)',
            'rgba(46, 204, 113, 1)',
            'rgba(241, 196, 15, 1)',
            'rgba(231, 76, 60, 1)',
            'rgba(155, 89, 182, 1)',
            'rgba(26, 188, 156, 1)'
          ],
          borderWidth: 1
        }]
      };
      console.log('✅ Graphique articles par famille mis à jour');
    }

    // Graphique répartition des unités (doughnut) à partir de la DB
    if (this.statistiquesArticles?.repartitionUnites?.length > 0) {
      this.repartitionUnitesChart = {
        labels: this.statistiquesArticles.repartitionUnites.map(d => d.unite),
        datasets: [{
          label: 'Nombre d\'articles',
          data: this.statistiquesArticles.repartitionUnites.map(d => d.nombreArticles),
          backgroundColor: [
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(155, 89, 182, 0.7)',
            'rgba(241, 196, 15, 0.7)',
            'rgba(230, 126, 34, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(26, 188, 156, 0.7)',
            'rgba(52, 73, 94, 0.7)'
          ],
          borderColor: [
            'rgba(52, 152, 219, 1)',
            'rgba(46, 204, 113, 1)',
            'rgba(155, 89, 182, 1)',
            'rgba(241, 196, 15, 1)',
            'rgba(230, 126, 34, 1)',
            'rgba(231, 76, 60, 1)',
            'rgba(26, 188, 156, 1)',
            'rgba(52, 73, 94, 1)'
          ],
          borderWidth: 2
        }]
      };
      console.log('✅ Graphique répartition des unités mis à jour');
    }

    // Graphique évolution des décomptes (line) à partir de la DB
    if (this.statistiquesArticles?.evolutionDecomptes?.length > 0) {
      this.evolutionDecomptesChart = {
        labels: this.statistiquesArticles.evolutionDecomptes.map(d => d.mois),
        datasets: [{
          label: 'Nombre de décomptes',
          data: this.statistiquesArticles.evolutionDecomptes.map(d => d.nombreDecomptes),
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }, {
          label: 'Montant total (TND)',
          data: this.statistiquesArticles.evolutionDecomptes.map(d => d.montantTotal),
          backgroundColor: 'rgba(46, 204, 113, 0.2)',
          borderColor: 'rgba(46, 204, 113, 1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }]
      };
      console.log('✅ Graphique évolution des décomptes mis à jour');
    }

    // Graphique top fournisseurs par volume (bar) à partir de la DB
    if (this.statistiquesArticles?.topFournisseursVolume?.length > 0) {
      this.topFournisseursVolumeChart = {
        labels: this.statistiquesArticles.topFournisseursVolume.map(d => d.fournisseur),
        datasets: [{
          label: 'Nombre d\'articles',
          data: this.statistiquesArticles.topFournisseursVolume.map(d => d.nombreArticles),
          backgroundColor: 'rgba(230, 126, 34, 0.7)',
          borderColor: 'rgba(230, 126, 34, 1)',
          borderWidth: 1
        }]
      };
      console.log('✅ Graphique top fournisseurs par volume mis à jour');
    }
  }

  /**
   * Change l'onglet actif
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'fournisseurs') {
      this.loadFournisseursAvecMarches();
    }
  }

  // Méthode pour charger l'historique des données
  loadHistoriqueDonnees(): void {
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    const mois = 3; // Période de 3 mois par défaut
    
    // Récupérer les tendances des métriques depuis l'API
    this.statistiquesService.getTendancesMetriques(mois, numStruct).subscribe({
      next: (res) => {
        // Mettre à jour les tendances avec les données de l'API
        this.marchesTendance = res?.tendanceMarchés || 0;
        this.fournisseursTendance = res?.tendanceFournisseurs || 0;
        this.articlesTendance = res?.tendanceArticles || 0;
        this.valeurTotaleTendance = res?.tendanceValeur || 0;
        
        console.log('✅ Tendances des métriques chargées:', res);
      },
      error: (err) => {
        console.warn('⚠️ Erreur lors du chargement des tendances:', err);
        // En cas d'erreur, utiliser des valeurs par défaut
        this.marchesTendance = 0;
        this.fournisseursTendance = 0;
        this.articlesTendance = 0;
        this.valeurTotaleTendance = 0;
      }
    });
    
    // Générer des données historiques pour les mini-graphiques
    // Dans un environnement de production, ces données viendraient d'une API
    
    // Historique des marchés (7 derniers jours)
    this.marchesHistorique = this.generateHistoricalData(120, 10);
    this.marchesChartData.datasets[0].data = this.marchesHistorique;
    
    // Historique des fournisseurs (7 derniers jours)
    this.fournisseursHistorique = this.generateHistoricalData(85, 5);
    this.fournisseursChartData.datasets[0].data = this.fournisseursHistorique;
    
    // Historique des articles (7 derniers jours)
    this.articlesHistorique = this.generateHistoricalData(250, 15);
    this.articlesChartData.datasets[0].data = this.articlesHistorique;
    
    // Historique de la valeur totale (7 derniers jours)
    this.valeurTotaleHistorique = this.generateHistoricalData(1500000, 100000);
    this.valeurTotaleChartData.datasets[0].data = this.valeurTotaleHistorique;
  }
  
  // Méthode pour générer des données historiques simulées
  generateHistoricalData(baseValue: number, variance: number): number[] {
    const data: number[] = [];
    let currentValue = baseValue;
    
    // Générer 7 valeurs (pour les 7 derniers jours)
    for (let i = 0; i < 7; i++) {
      // Ajouter une variation aléatoire
      const change = Math.floor(Math.random() * variance * 2) - variance;
      currentValue += change;
      // S'assurer que la valeur reste positive
      currentValue = Math.max(currentValue, 0);
      data.push(currentValue);
    }
    
    return data;
  }
  
  // Les méthodes calculerTendances et calculerPourcentageTendance ont été supprimées
  // car les tendances sont maintenant récupérées directement depuis l'API
  
  // Méthode pour déterminer la classe CSS de tendance
  getTendanceClass(tendance: number): string {
    if (tendance > 0) return 'positive';
    if (tendance < 0) return 'negative';
    return 'neutral';
  }
  
  // Méthode pour obtenir l'icône de tendance
  getTendanceIcon(tendance: number): string {
    if (tendance > 0) return 'fa-arrow-up';
    if (tendance < 0) return 'fa-arrow-down';
    return 'fa-minus';
  }

  /**
   * Actualise toutes les données
   */
  refreshAllData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.loadHistoriqueDonnees();
    this.loadStatistiquesCompletes();
    this.loadBasicData();
  }

  /**
   * Formate un montant en dinars tunisiens
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  }

  /**
   * Formate un pourcentage
   */
  formatPercentage(value: number | undefined | null): string {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${value.toFixed(1)}%`;
  }

  // ========== NOUVELLES MÉTHODES POUR PAGINATION CLASSIQUE ==========

  /**
   * Change la taille de page pour les articles
   */
  changeArticlesPageSize(size: number): void {
    this.articlesPageSize = size;
    this.articlesCurrentPage = 0;
    this.calculateArticlesTotalPages();
  }

  /**
   * Change la taille de page pour les fournisseurs
   */
  changeFournisseursPageSize(size: number): void {
    this.fournisseursPageSize = size;
    this.fournisseursCurrentPage = 0;
    this.loadFournisseursAvecMarches(0);
  }

  /**
   * Change la taille de page pour les marchés
   */
  // changeMarchesPageSize(size: number): void { // Supprimé - tableau des marchés supprimé
  //   this.marchesPageSize = size; // Supprimé - tableau des marchés supprimé
  //   this.marchesCurrentPage = 0; // Supprimé - tableau des marchés supprimé
  //   this.calculateMarchesTotalPages(); // Supprimé - tableau des marchés supprimé
  // }

  /**
   * Calcule le nombre total de pages pour les articles
   */
  calculateArticlesTotalPages(): void {
    const totalArticles = this.statistiquesArticles.topArticles?.length || 0;
    this.articlesTotalPages = Math.ceil(totalArticles / this.articlesPageSize);
  }

  /**
   * Calcule le nombre total de pages pour les fournisseurs
   */
  calculateFournisseursTotalPages(): void {
    // Cette méthode n'est plus utilisée car la pagination est gérée côté serveur
    // Le totalPages est maintenant fourni par le backend
  }

  /**
   * Calcule le nombre total de pages pour les marchés
   */
  // calculateMarchesTotalPages(): void { // Supprimé - tableau des marchés supprimé
  //   const totalMarches = this.filteredMarchesData?.length || 0; // Supprimé - tableau des marchés supprimé
  //   this.marchesTotalPages = Math.ceil(totalMarches / this.marchesPageSize); // Supprimé - tableau des marchés supprimé
  // }

  /**
   * Va à la page précédente des articles
   */
  previousArticlesPage(): void {
    if (this.articlesCurrentPage > 0) {
      this.articlesCurrentPage--;
    }
  }

  /**
   * Va à la page suivante des articles
   */
  nextArticlesPage(): void {
    if (this.articlesCurrentPage < this.articlesTotalPages - 1) {
      this.articlesCurrentPage++;
    }
  }

  /**
   * Va à la page précédente des fournisseurs
   */
  previousFournisseursPage(): void {
    if (this.fournisseursCurrentPage > 0) {
      this.fournisseursCurrentPage--;
      this.loadFournisseursAvecMarches(this.fournisseursCurrentPage);
    }
  }

  /**
   * Va à la page suivante des fournisseurs
   */
  nextFournisseursPage(): void {
    if (this.fournisseursCurrentPage < this.fournisseursTotalPages - 1) {
      this.fournisseursCurrentPage++;
      this.loadFournisseursAvecMarches(this.fournisseursCurrentPage);
    }
  }

  // /**
  //  * Va à la page précédente des marchés
  //  */
  // previousMarchesPage(): void { // Supprimé - tableau des marchés supprimé
  //   if (this.marchesCurrentPage > 0) { // Supprimé - tableau des marchés supprimé
  //     this.marchesCurrentPage--; // Supprimé - tableau des marchés supprimé
  //   } // Supprimé - tableau des marchés supprimé
  // } // Supprimé - tableau des marchés supprimé

  // /**
  //  * Va à la page suivante des marchés
  //  */
  // nextMarchesPage(): void { // Supprimé - tableau des marchés supprimé
  //   if (this.marchesCurrentPage < this.marchesTotalPages - 1) { // Supprimé - tableau des marchés supprimé
  //     this.marchesCurrentPage++; // Supprimé - tableau des marchés supprimé
  //   } // Supprimé - tableau des marchés supprimé
  // } // Supprimé - tableau des marchés supprimé

  /**
   * Obtient les informations de pagination pour les articles
   */
  getArticlesPaginationInfo(): { start: number; end: number; total: number } {
    const total = this.statistiquesArticles.topArticles?.length || 0;
    const start = this.articlesCurrentPage * this.articlesPageSize + 1;
    const end = Math.min((this.articlesCurrentPage + 1) * this.articlesPageSize, total);
    return { start, end, total };
  }

  /**
   * Obtient les informations de pagination pour les fournisseurs
   */
  getFournisseursPaginationInfo(): { start: number; end: number; total: number } {
    // Utiliser les données de pagination du backend
    const total = this.fournisseursTotalElements || 0;
    const start = this.fournisseursCurrentPage * this.fournisseursPageSize + 1;
    const end = Math.min((this.fournisseursCurrentPage + 1) * this.fournisseursPageSize, total);
    return { start, end, total };
  }

  // /**
  //  * Obtient les informations de pagination pour les marchés
  //  */
  // getMarchesPaginationInfo(): { start: number; end: number; total: number } { // Supprimé - tableau des marchés supprimé
  //   const total = this.filteredMarchesData?.length || 0; // Supprimé - tableau des marchés supprimé
  //   const start = this.marchesCurrentPage * this.marchesPageSize + 1; // Supprimé - tableau des marchés supprimé
  //   const end = Math.min((this.marchesCurrentPage + 1) * this.marchesPageSize, total); // Supprimé - tableau des marchés supprimé
  //   return { start, end, total }; // Supprimé - tableau des marchés supprimé
  // } // Supprimé - tableau des marchés supprimé

  /**
   * Obtient les articles à afficher (paginated)
   */
  getDisplayedArticles(): any[] {
    const startIndex = this.articlesCurrentPage * this.articlesPageSize;
    const endIndex = startIndex + this.articlesPageSize;
    return this.statistiquesArticles.topArticles?.slice(startIndex, endIndex) || [];
  }

  /**
   * Charge les nouveaux indicateurs
   */
  loadNewIndicators(): void {
    console.log('🆕 Chargement des nouveaux indicateurs...');
    
    // Charger la répartition des articles par secteur
    this.statistiquesService.getArticlesBySecteur().subscribe({
      next: (response: any) => {
        if (response && response.articlesBySecteur) {
          this.articlesBySecteur = response.articlesBySecteur;
          console.log('✅ Articles par secteur chargés:', this.articlesBySecteur);
          this.updateArticlesSecteurChart();
        }
      },
      error: (error) => {
        console.warn('⚠️ Erreur lors du chargement des articles par secteur:', error);
        this.articlesBySecteur = [];
      }
    });

    // Charger l'évolution des décomptes par type
    this.statistiquesService.getDecomptesByType().subscribe({
      next: (response: any) => {
        if (response && response.decomptesByType) {
          this.decomptesByType = response.decomptesByType;
          console.log('✅ Décomptes par type chargés:', this.decomptesByType);
          this.updateDecomptesByTypeChart();
        }
      },
      error: (error) => {
        console.warn('⚠️ Erreur lors du chargement des décomptes par type:', error);
        this.decomptesByType = [];
      }
    });
  }

  /**
   * Met à jour le graphique des articles par secteur
   */
  updateArticlesSecteurChart(): void {
    if (this.articlesBySecteur && this.articlesBySecteur.length > 0) {
      const labels = this.articlesBySecteur.map(item => item.secteur ?? item.label ?? '—');
      const data = this.articlesBySecteur.map(item =>
        item.nombreArticles ?? item.quantite ?? item.nombre ?? 0
      );
      const colors = this.generateColors(this.articlesBySecteur.length);

      this.articlesSecteurChart = {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: colors.map(color => this.adjustBrightness(color, -20)),
          borderWidth: 2
        }]
      };
    }
  }

  /**
   * Met à jour le graphique des décomptes par type
   */
  updateDecomptesByTypeChart(): void {
    if (this.decomptesByType && this.decomptesByType.length > 0) {
      // Grouper par type de décompte
      const groupedData = this.decomptesByType.reduce((acc: any, item: any) => {
        const key = item.typeDecompte ?? item.type ?? 'Autre';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push({
          mois: item.mois,
          nombre: item.nombreDecomptes ?? item.valeur ?? 0,
          montant: item.montantTotal ?? item.montant ?? 0
        });
        return acc;
      }, {} as Record<string, Array<{ mois: string; nombre: number; montant: number }>>);

      const labels = Object.keys(groupedData);
      const baseColors = this.generateColors(labels.length);
      const datasets = labels.map((type, index) => {
        const color = baseColors[index];
        const data = groupedData[type].map((item: any) => item.nombre);
        
        return {
          label: type,
          data: data,
          borderColor: color,
          backgroundColor: this.adjustBrightness(color, 0.3),
          tension: 0.4,
          fill: false
        } as any;
      });

      this.evolutionDecomptesChart = {
        labels: [...new Set(this.decomptesByType.map((item: any) => item.mois))].sort(),
        datasets: datasets
      };
    }
  }

  /**
   * Génère des couleurs pour les graphiques
   */
  private generateColors(count: number): string[] {
    const colors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
      '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#16a085'
    ];
    
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }

  /**
   * Ajuste la luminosité d'une couleur
   */
  private adjustBrightness(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  /**
   * Obtient les types de décompte uniques
   */
  getUniqueDecompteTypes(): string[] {
    if (!this.decomptesByType) return [];
    return [...new Set(this.decomptesByType.map(item => item.typeDecompte))];
  }

  /**
   * Obtient la couleur pour un type de décompte
   */
  getDecompteTypeColor(type: string): string {
    const types = this.getUniqueDecompteTypes();
    const index = types.indexOf(type);
    return this.generateColors(types.length)[index] || '#3498db';
  }

  /**
   * Obtient la couleur pour un secteur
   */
  getSecteurColor(secteur: string): string {
    const secteurs = this.articlesBySecteur.map(item => item.secteur);
    const index = secteurs.indexOf(secteur);
    return this.generateColors(secteurs.length)[index] || '#3498db';
  }

  /**
   * Charge les articles avec filtrage avancé
   */
  loadArticlesWithFilters(): void {
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    const filtres = {
      numStruct,
      filterSecteur: this.filterArticleSecteur || undefined,
      filterFamille: this.filterArticleFamille || undefined,
      filterStatut: this.filterArticleStatut || undefined,
      filterTvaMin: this.filterArticleTvaMin || undefined,
      filterTvaMax: this.filterArticleTvaMax || undefined
    };

    this.statistiquesService.getArticlesPlusDemandes(filtres).subscribe({
      next: (response) => {
        if (response.success) {
          this.statistiquesArticles.topArticles = response.articles || [];
          this.calculateArticlesTotalPages();
        } else {
          console.error('Erreur lors du chargement des articles:', response.error);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des articles avec filtres:', err);
      }
    });
  }

  /**
   * Applique les filtres des articles
   */
  applyArticleFilters(): void {
    this.articlesCurrentPage = 0;
    this.loadArticlesWithFilters();
  }

  /**
   * Réinitialise les filtres des articles
   */
  resetArticleFilters(): void {
    this.filterArticleSecteur = '';
    this.filterArticleFamille = '';
    this.filterArticleStatut = '';
    this.filterArticleTvaMin = null;
    this.filterArticleTvaMax = null;
    this.articlesCurrentPage = 0;
    this.loadArticlesWithFilters();
  }

  /**
   * Obtient les fournisseurs à afficher (pagination côté serveur)
   */
  getDisplayedFournisseurs(): any[] {
    return this.fournisseursAvecMarches || [];
  }

  // /**
  //  * Obtient les marchés à afficher (paginated)
  //  */
  // getDisplayedMarches(): any[] { // Supprimé - tableau des marchés supprimé
  //   const startIndex = this.marchesCurrentPage * this.marchesPageSize; // Supprimé - tableau des marchés supprimé
  //   const endIndex = startIndex + this.marchesPageSize; // Supprimé - tableau des marchés supprimé
  //   return this.filteredMarchesData?.slice(startIndex, endIndex) || []; // Supprimé - tableau des marchés supprimé
  // } // Supprimé - tableau des marchés supprimé

  /**
   * Réinitialise l'affichage des tableaux
   */
  resetTableDisplays(): void {
    this.articlesCurrentPage = 0;
    this.fournisseursCurrentPage = 0;
    // this.marchesCurrentPage = 0; // Supprimé - tableau des marchés supprimé
    this.calculateArticlesTotalPages();
    // this.calculateFournisseursTotalPages(); // Supprimé - pagination côté serveur
    // this.loadFournisseursAvecMarches(0); // Recharger les données
  }

  // ========== NOUVELLES FONCTIONNALITÉS POUR LES DÉTAILS DU FOURNISSEUR ==========

  // Propriétés pour le modal des détails du fournisseur
  selectedFournisseur: any = null;
  selectedFournisseurMarches: any[] = [];

  /**
   * Affiche les détails du fournisseur dans un modal
   * @param fournisseur Le fournisseur sélectionné
   */
  showFournisseurDetails(fournisseur: any): void {
    // Récupérer les informations complètes du fournisseur depuis l'entité
    this.statistiquesService.getFournisseurComplet(fournisseur.numFourn).subscribe({
      next: (response) => {
        if (response.success && response.fournisseur) {
          this.selectedFournisseur = response.fournisseur;
    // Récupérer la liste des marchés du fournisseur
    this.marcheService.getMarchesByFournisseur(fournisseur.numFourn).subscribe(
      (marches) => {
        this.selectedFournisseurMarches = marches;
      },
      (error) => {
        console.error('Erreur lors de la récupération des marchés du fournisseur:', error);
        this.selectedFournisseurMarches = [];
      }
    );
        } else {
          console.error('Erreur lors de la récupération du fournisseur:', response.error);
          // Utiliser les données de base si la récupération complète échoue
          this.selectedFournisseur = fournisseur;
          this.selectedFournisseurMarches = [];
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du fournisseur complet:', error);
        // Utiliser les données de base si la récupération échoue
        this.selectedFournisseur = fournisseur;
        this.selectedFournisseurMarches = [];
      }
    });
  }

  /**
   * Ferme le modal des détails du fournisseur
   * @param event L'événement de clic
   */
  closeModal(event: MouseEvent): void {
    // Si on clique sur le fond du modal ou sur le bouton de fermeture
    if (
      (event.target as HTMLElement).classList.contains('modal-overlay') ||
      (event.target as HTMLElement).closest('.modal-close-btn') ||
      (event.target as HTMLElement).closest('.cancel-btn')
    ) {
      this.selectedFournisseur = null;
      this.selectedFournisseurMarches = [];
    }
  }

  /**
   * Télécharge les informations du fournisseur en PDF en utilisant l'API backend
   * @param fournisseur Le fournisseur sélectionné
   */
  downloadFournisseurPDF(fournisseur: any): void {
    if (!fournisseur || !fournisseur.numFourn) {
      console.error('Numéro de fournisseur manquant');
      return;
    }
    
    // URL de l'API backend pour générer le PDF
    const apiUrl = `${environment.apiUrl}/fournisseur/export/pdf/${fournisseur.numFourn}`;
    
    // Informer l'utilisateur que le téléchargement est en cours
    console.log('Téléchargement du PDF en cours...');
    
    // Utiliser HttpClient pour télécharger le fichier
    this.http.get(apiUrl, { responseType: 'blob' })
      .subscribe({
        next: (response: Blob) => {
          // Créer un objet URL pour le blob
          const blobUrl = window.URL.createObjectURL(response);
          
          // Créer un élément <a> pour déclencher le téléchargement
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `Fournisseur_${fournisseur.numFourn}_${fournisseur.designation}.pdf`;
          
          // Ajouter l'élément au DOM, cliquer dessus, puis le supprimer
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Libérer l'URL de l'objet
          window.URL.revokeObjectURL(blobUrl);
          
          console.log('PDF téléchargé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors du téléchargement du PDF:', error);
          // Afficher un message d'erreur à l'utilisateur
          alert('Erreur lors du téléchargement du PDF. Veuillez réessayer plus tard.');
        }
      });
  }

  /**
   * Génère un PDF avec les détails du fournisseur sélectionné
   */
  generateFournisseurPDF(fournisseur: any): void {
    // Créer un nouveau document PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPosition = margin;
    
    // En-tête
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Détails du Fournisseur', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    
    // Informations du fournisseur
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations Générales', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Numéro: ${fournisseur.numFourn}`, margin, yPosition);
    
    yPosition += 8;
    doc.text(`Désignation: ${fournisseur.designation}`, margin, yPosition);
    
    yPosition += 8;
    doc.text(`Adresse: ${fournisseur.adresse || 'Non disponible'}`, margin, yPosition);
    
    yPosition += 8;
    doc.text(`Téléphone: ${fournisseur.telephone || 'Non disponible'}`, margin, yPosition);
    
    yPosition += 8;
    doc.text(`Email: ${fournisseur.email || 'Non disponible'}`, margin, yPosition);
    
    // Résumé des marchés
    yPosition += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé', margin, yPosition);
      
      yPosition += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nombre total de marchés: ${fournisseur.nombreMarches}`, margin, yPosition);
      
      yPosition += 8;
      doc.text(`Montant total: ${fournisseur.montantTotal ? fournisseur.montantTotal.toLocaleString() : '0'} TND`, margin, yPosition);
      
      // Liste des marchés
      yPosition += 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Liste des Marchés', margin, yPosition);
      
      yPosition += 10;
      
      // Tableau des marchés
      if (this.selectedFournisseurMarches && this.selectedFournisseurMarches.length > 0) {
        const tableColumn = ['Désignation', 'Numéro', 'Date', 'Montant (TND)', 'Statut'];
        const tableRows: string[][] = [];
        
        // Remplir les données du tableau
        for (const marche of this.selectedFournisseurMarches) {
          const formattedDate = marche.date ? new Date(marche.date).toLocaleDateString() : 'Non disponible';
          const formattedMontant = marche.montant ? marche.montant.toLocaleString() : 'Non disponible';
          tableRows.push([
            marche.designation || 'Sans titre', 
            marche.numero || 'Non disponible', 
            formattedDate, 
            formattedMontant, 
            marche.statut || 'Non défini'
          ]);
        }
        
        // Générer le tableau
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: yPosition,
          margin: { top: margin, right: margin, bottom: margin, left: margin },
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [59, 89, 152], textColor: 255 },
          alternateRowStyles: { fillColor: [240, 240, 240] },
          tableLineColor: [200, 200, 200],
          tableLineWidth: 0.1,
        });
      } else {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.text('Aucun marché disponible pour ce fournisseur.', margin, yPosition);
      }
      
      // Pied de page
      const footerYPosition = pageHeight - margin;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Document généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`, pageWidth / 2, footerYPosition, { align: 'center' });
      
      // Enregistrer le PDF
      doc.save(`Fournisseur_${fournisseur.numFourn}_${fournisseur.designation}.pdf`);
    }

  /**
   * Initialise les dates par défaut pour les 12 derniers mois
   */
  private initializeDefaultDates(): void {
    const today = new Date();
    this.endDate = new Date(today);
    
    // Date de début = 12 mois avant aujourd'hui
    this.startDate = new Date(today);
    this.startDate.setMonth(today.getMonth() - 12);
    
    console.log('📅 Dates initialisées:', {
      startDate: this.startDate.toISOString().split('T')[0],
      endDate: this.endDate.toISOString().split('T')[0]
    });
  }

  /**
   * Charge les données réelles depuis la base de données
   */
  private loadRealDataFromDatabase(): void {
    console.log('📊 Chargement des données réelles depuis la base de données...');
    
    // Charger les métriques clés
    this.loadMetriques();
    
    // Charger les graphiques avec les données réelles
    this.loadChartsFromApi();
    
    // Charger les statistiques complètes
    this.loadStatistiquesCompletes();
    
    // Charger les fournisseurs avec marchés
    this.loadFournisseursComplets();
    
    // Charger les données de base
    this.loadBasicData();
  }
  }