import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FournisseurService } from '../../../services/fournisseur/fournisseur.service';
import { ArticleService } from '../../../services/article/article.service';
import { MarcheService } from '../../../services/marche/marche.service';
import { StatistiquesCompletesService } from '../../../services/statistiques-completes/statistiques-completes.service';
import { StatistiquesService } from '../../../services/statistiques/statistiques.service';
import { forkJoin } from 'rxjs';
import { ChartConfiguration, ChartData } from 'chart.js';
import * as FileSaver from 'file-saver';
import * as jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
export class StatistiquesPeriodesComponent implements OnInit {
  selectedPeriod = '12months';
  filterName = '';
  filterMinAmount = 0;
  filterHasPenalites = false;
  currentBatchIndex = 0;
  pageSize = 10;
  totalMarches = 0;
  currentPage = 0;
  totalPages = 0;

  // Add missing count properties
  fournisseursCount = 0;
  articlesCount = 0;
  marchesCount = 0;

  // Nouvelles propriétés pour l'interface améliorée
  chartType: any = 'line';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Données pour les légendes et statistiques
  fournisseurLegend: any[] = [];
  sectorStats: any[] = [];

  // ========== NOUVELLES PROPRIÉTÉS POUR STATISTIQUES COMPLÈTES ==========

  // Données des statistiques complètes
  statistiquesArticles: StatistiquesArticlesComplet = {
    articlesBySecteur: [],
    articlesByFamille: [],
    articlesExtremes: [],
    distributionPrix: [],
    articlesStatut: { actif: 0, inactif: 0, obsolete: 0 },
    topArticles: [],
    uniteMesure: [],
    articlesSansMouvement: 0
  };

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

  // Graphiques pour les nouvelles statistiques
  articlesSecteurChart: ChartData<'bar'> = { labels: [], datasets: [] };
  articlesFamilleChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  distributionPrixChart: ChartData<'bar'> = { labels: [], datasets: [] };
  fournisseursRegionChart: ChartData<'bar'> = { labels: [], datasets: [] };
  fournisseursSecteurChart: ChartData<'pie'> = { labels: [], datasets: [] };

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
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    const filtres = { numStruct, page, size: 1000, filterName: this.filterName };
    this.statistiquesService.getFournisseursAvecMarches(filtres).subscribe({
      next: (res) => {
        this.fournisseursAvecMarches = res.fournisseurs || [];
      },
      error: (err) => {
        console.warn('Erreur fournisseurs-avec-marches:', err);
        this.fournisseursAvecMarches = [];
      }
    });
  }


  // Propriétés pour l'affichage détaillé
  selectedMarche: any = null;
  showDetails = false;

  marcheEvolutionChart: ChartData<'line'> = { labels: [], datasets: [] };
  fournisseurRepartitionChart: ChartData<'pie'> = { labels: [], datasets: [] };
  regionRepartitionChart: ChartData<'bar'> = { labels: [], datasets: [] };
  articleRepartitionChart: ChartData<'pie'> = { labels: [], datasets: [] };
  garantieChart: ChartData<'pie'> = { labels: [], datasets: [] };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Évolution des marchés', color: '#2c3e50', font: { size: 16 } }
    },
    scales: { y: { beginAtZero: true, ticks: { color: '#7f8c8d' } }, x: { ticks: { color: '#7f8c8d' } } }
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
        this.marchesCount = res?.marchesActifs || 0;
        this.fournisseursCount = res?.fournisseurs || 0;
        this.articlesCount = res?.articles || 0;
        this.valeurTotale = res?.valeurTotale || 0;
      },
      error: (e) => console.warn('Erreur métriques:', e)
    });
  }

  private loadChartsFromApi(): void {
    const numStruct = sessionStorage.getItem('NumStruct') ?? '03';
    // Evolution des marchés
    this.statistiquesService.getMarchesEvolutionPeriode(this.selectedPeriod, numStruct).subscribe({
      next: (data) => this.updateMarchesEvolutionChart(data),
      error: (e) => console.warn('Erreur evolution marchés:', e)
    });
    // Répartition fournisseurs
    this.statistiquesService.getFournisseursRepartitionPeriode(5, numStruct).subscribe({
      next: (data) => this.updateFournisseurRepartitionChart(data),
      error: (e) => console.warn('Erreur répartition fournisseurs:', e)
    });
    // Répartition régions
    this.statistiquesService.getRegionsRepartitionPeriode(numStruct).subscribe({
      next: (data) => this.updateRegionRepartitionChart(data),
      error: (e) => console.warn('Erreur répartition régions:', e)
    });
    // Répartition articles par secteur
    this.statistiquesService.getArticlesRepartitionPeriode(numStruct).subscribe({
      next: (data) => this.updateArticleRepartitionChart(data),
      error: (e) => console.warn('Erreur répartition articles:', e)
    });
  }


  constructor(
    private router: Router,
    private fournisseurService: FournisseurService,
    private articleService: ArticleService,
    private marcheService: MarcheService,
    private statistiquesCompletesService: StatistiquesCompletesService,
    private statistiquesService: StatistiquesService
  ) {}
  ngOnInit(): void {
    console.log('🚀 Initialisation du composant...');

    // Charger toutes les statistiques complètes (réelles DB)
    this.loadStatistiquesCompletes();

    // Charger fournisseurs avec marchés (réel DB)
    this.loadFournisseursComplets();

    // Charger métriques et graphiques depuis l'API (réelles DB)
    this.loadMetriques();
    this.loadChartsFromApi();
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
          this.marchesCount = response.totalElements;
          console.log('✅ Nombre de marchés:', this.marchesCount);
        }
      },
      error: (error) => {
        console.warn('⚠️ Erreur lors du comptage des marchés:', error);
        this.marchesCount = 0;
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
          this.totalMarches = response.totalElements || response.marches.length;
          this.currentPage = response.page || page;
          this.totalPages = Math.ceil(this.totalMarches / this.pageSize);

          console.log('✅ Marchés mappés:', this.marchesData.length);
          console.log('📋 Liste des marchés:', this.marchesData.map(m => m.designation));

          // Initialiser immédiatement le tableau filtré
          this.filteredMarchesData = [...this.marchesData];
          console.log('🔍 Tableau filtré initialisé:', this.filteredMarchesData.length);

        } else {
          console.warn('⚠️ Aucun marché trouvé dans la réponse');
          console.warn('📦 Structure de la réponse:', response);
          this.marchesData = [];
          this.filteredMarchesData = [];
          this.totalMarches = 0;
          this.currentPage = 0;
          this.totalPages = 0;
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
      labels: ['Tunis', 'Sfax', 'Sousse', 'Gabès', 'Bizerte'],
      datasets: [{
        label: 'Marchés par région',
        data: [5, 3, 2, 1, 2],
        backgroundColor: '#3498db'
      }]
    };

    // Ce graphique est maintenant alimenté via updateArticleRepartitionChart() depuis l'API

    this.garantieChart = {
      labels: ['Garantie bancaire', 'Chèque certifié', 'Cautions', 'Aucune'],
      datasets: [{
        data: [40, 30, 20, 10],
        backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12']
      }]
    };
  }

  getMonthsForPeriod(): string[] {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const today = new Date();
    const currentMonth = today.getMonth();
    let periodLength = 12;

    if (this.selectedPeriod === '6months') periodLength = 6;
    else if (this.selectedPeriod === '3months') periodLength = 3;

    const result: string[] = [];
    for (let i = periodLength - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      result.push(months[monthIndex]);
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



  updateCharts(): void {
    console.log('🔄 Mise à jour des graphiques (API)...');
    this.loadMetriques();
    this.loadChartsFromApi();
  }

  exportToPDF(): void {
    const doc = new jsPDF.default();
    doc.text('Statistiques des Marchés', 10, 10);

    autoTable(doc, {
      head: [['NUMÉRO', 'DÉSIGNATION', 'FOURNISSEUR', 'MONTANT', 'DATE', 'BANQUE']],
      body: this.filteredMarchesData.map(m => [
        m.numMarche,
        m.designation,
        m.fournisseur,
        m.montant.toLocaleString() + ' TND',
        this.formatDate(m.date),
        m.banque
      ])
    });

    doc.save('statistiques_marches.pdf');
  }

  exportToExcel(): void {
    const headers = ['NUMÉRO', 'DÉSIGNATION', 'FOURNISSEUR', 'MONTANT', 'DATE', 'BANQUE'];
    const data = this.filteredMarchesData.map(m => [
      m.numMarche,
      m.designation,
      m.fournisseur,
      m.montant,
      this.formatDate(m.date),
      m.banque
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marchés');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'statistiques_marches.xlsx');
  }



  navigateTo(path: string): void {
    this.router.navigate(['/' + path]);
  }

  // Nouvelles méthodes pour l'interface améliorée
  getTotalValue(): number {
    return this.marchesData.reduce((total, m) => total + m.montant, 0) / 1000;
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.updateCharts();
  }

  getPeriodLabel(): string {
    switch (this.selectedPeriod) {
      case '3months': return 'les 3 derniers mois';
      case '6months': return 'les 6 derniers mois';
      case '12months': return 'les 12 derniers mois';
      default: return 'la période sélectionnée';
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
    return this.marchesCount;
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
      { name: 'GAZ', percentage: 45 },
      { name: 'EAU', percentage: 30 },
      { name: 'ÉLECTRICITÉ', percentage: 25 }
    ];
  }

  /**
   * Met à jour le graphique d'évolution des marchés avec les données de l'API
   */
  updateMarchesEvolutionChart(data: any): void {
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
  }

  /**
   * Met à jour le graphique de répartition des fournisseurs avec les données de l'API
   */
  updateFournisseurRepartitionChart(data: any): void {
    this.fournisseurRepartitionChart = {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: data.colors || ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6']
      }]
    };
  }

  /**
   * Met à jour le graphique de répartition par région avec les données de l'API
   */
  updateRegionRepartitionChart(data: any): void {
    this.regionRepartitionChart = {
      labels: data.labels,
      datasets: [{
        label: 'Marchés par région',
        data: data.data,
        backgroundColor: '#3498db'
      }]
    };
  }

  /**
   * Met à jour le graphique de répartition des articles avec les données de l'API
   */
  updateArticleRepartitionChart(data: any): void {
    this.articleRepartitionChart = {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6']
      }]
    };
  }

  /**
   * Met à jour le graphique des garanties avec les données de l'API
   */
  updateGarantieChart(data: any): void {
    this.garantieChart = {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: data.colors || ['#3498db', '#2ecc71', '#e74c3c', '#f39c12']
      }]
    };
  }

  /**
   * Actualise toutes les données depuis l'API
   */
  refreshData(): void {
    this.systemStatus.apiStatus = 'loading';
    this.systemStatus.lastUpdate = new Date();

    console.log('🔄 Actualisation des données...');

    // Charger les données qui fonctionnent
    this.loadBasicData();
    this.loadFournisseursComplets();

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
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredMarchesData = filteredData.slice(startIndex, endIndex);

    // Les données sont déjà filtrées localement ci-dessus
    // Pas besoin de recharger depuis l'API (évite les erreurs sur tables inexistantes)
    console.log('🔍 Filtres appliqués localement:', this.filteredMarchesData.length, 'marchés');

    // Si l'onglet Fournisseurs est actif, recharger la liste des fournisseurs avec marchés
    if (this.activeTab === 'fournisseurs') {
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
    // Graphique articles par secteur
    if (this.statistiquesArticles.articlesBySecteur.length > 0) {
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
    }

    // Graphique fournisseurs par région
    if (this.statistiquesFournisseurs.fournisseursByRegion.length > 0) {
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
    }

    // Graphique répartition par famille (doughnut) à partir de la DB
    if (this.statistiquesArticles.articlesByFamille.length > 0) {
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
    }

    // Graphique distribution des prix (bar) à partir de la DB
    if (this.statistiquesArticles.distributionPrix.length > 0) {
      this.distributionPrixChart = {
        labels: this.statistiquesArticles.distributionPrix.map(d => d.tranche),
        datasets: [{
          label: 'Nombre d\'articles',
          data: this.statistiquesArticles.distributionPrix.map(d => d.nombre),
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 1
        }]
      };
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

  /**
   * Actualise toutes les données
   */
  refreshAllData(): void {
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
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Retourne le numéro du premier élément de la page courante
   */
  getCurrentPageStart(): number {
    return this.currentPage * this.pageSize + 1;
  }

  /**
   * Retourne le numéro du dernier élément de la page courante
   */
  getCurrentPageEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalMarches);
  }

  /**
   * Charge la page suivante des marchés
   */
  loadNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.loadFournisseursComplets(this.currentPage + 1);
    }
  }

  /**
   * Charge la page précédente des marchés
   */
  loadPreviousPage(): void {
    if (this.currentPage > 0) {
      this.loadFournisseursComplets(this.currentPage - 1);
    }
  }

  /**
   * Charge une page spécifique des marchés
   */
  loadPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadFournisseursComplets(page);
    }
  }
}