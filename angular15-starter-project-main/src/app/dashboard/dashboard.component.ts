import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FournisseurService } from '../services/fournisseur/fournisseur.service';
import { ArticleService } from '../services/article/article.service';
import { MarcheService } from '../services/marche/marche.service';
import { DashboardService, DashboardStats, ChartData as DashboardChartData, SystemStatus, Activity } from '../services/dashboard/dashboard.service';
// import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { environment } from 'src/environnement';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardWidgetsService } from '../services/dashboard-widgets/dashboard-widgets.service';
import {
  PenalitesData,
  GarantiesData,
  DecomptesData,
  EtapesData,
  SectoriellesData,
  DashboardWidgetsData,
  DashboardAlert,
  StatWidget
} from '../model/dashboard-widgets';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Compteurs
  fournisseursCount = 0;
  articlesCount = 0;
  marchesCount = 0;

  // Données pour les graphiques
  marchesByMonth: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  topFournisseurs: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  // ========== NOUVELLES PROPRIÉTÉS POUR LES WIDGETS ==========

  // Données des widgets
  penalitesData: PenalitesData = {
    penalitesEnCours: 0,
    montantTotalPenalites: 0,
    topMarchesAvecPenalites: []
  };

  garantiesData: GarantiesData = {
    garantiesEcheance: 0,
    montantTotalGaranties: 0,
    repartitionParType: []
  };

  decomptesData: DecomptesData = {
    decomptesEnAttente: 0,
    evolutionPaiements: [],
    retardsPaiement: 0
  };

  etapesData: EtapesData = {
    etapesEnRetard: 0,
    progressionGlobale: 0,
    alertesDelais: []
  };

  sectoriellesData: SectoriellesData = {
    repartitionParSecteur: [],
    performanceParFamille: [],
    evolutionPrix: []
  };

  // Widgets de statistiques
  statWidgets: StatWidget[] = [];

  // Alertes
  dashboardAlertes: DashboardAlert[] = [];

  // Graphiques pour les nouveaux widgets
  // UI state
  isGarantiesLoading = false;

  garantiesChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  penalitesTypeChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  evolutionPaiementsChart: ChartData<'line'> = { labels: [], datasets: [] };
  garantiesTopMarchesChart: ChartData<'bar'> = { labels: [], datasets: [] };

  topFournisseurs6Chart: ChartData<'doughnut'> = { labels: [], datasets: [] };

  secteurChart: ChartData<'bar'> = { labels: [], datasets: [] };
  evolutionPrixChart: ChartData<'line'> = { labels: [], datasets: [] };
  secteurSynthese: ChartData<'doughnut'> = { labels: [], datasets: [] };

  secteurLegend: Array<{ label: string; value: number; percent: number; color: string }> = [];
  secteurDoughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || '';
            const value = ctx.parsed || 0;
            const total = (ctx.chart.data.datasets?.[0]?.data as number[]).reduce((a,b)=>a+(b||0),0) || 1;
            const pct = (value / total) * 100;
            return `${label}: ${value} (${pct.toFixed(1)}%)`;
          }
        }
      },
      legend: { display: false }
    },
    cutout: '55%'
  };


  // Données et filtres pour Garanties détaillées (+ pagination)
  garantiesEcheanceFiltered: { marcheDesignation: string; typeGarantie: string; montant: number; }[] = [];
  garantiesTypesOptions: string[] = [];
  garantieFilter: { marche: string; type: string } = { marche: '', type: '' };
  // Pagination
  garantiesPageIndex = 0;
  garantiesPageSize = 10;
  // Analyse sectorielle détaillée (front-only à partir de sectoriellesData.repartitionParSecteur)
  sectorFilter = '';
  sectorRows: { designation: string; marches: number; articles: number; part: number; }[] = [];
  sectorFiltered: { designation: string; marches: number; articles: number; part: number; }[] = [];
  sectorPageIndex = 0;
  sectorPageSize = 10;
  sectorPageSizeOptions = [10, 25, 50];
  get sectorPage() { const s = this.sectorPageIndex * this.sectorPageSize; return this.sectorFiltered.slice(s, s + this.sectorPageSize); }
  get sectorTotal() { return this.sectorFiltered.length; }
  get sectorRangeLabel() {
    if (this.sectorTotal === 0) return `Lignes 0-0 sur 0 (Page 0/0)`;
    const start = this.sectorPageIndex * this.sectorPageSize + 1;
    const end = Math.min((this.sectorPageIndex + 1) * this.sectorPageSize, this.sectorTotal);
    const page = this.sectorPageIndex + 1;
    const totalPages = Math.max(1, Math.ceil(this.sectorTotal / this.sectorPageSize));
    return `Lignes ${start}-${end} sur ${this.sectorTotal} (Page ${page}/${totalPages})`;
  }

  prepareSectorRows(): void {
    const list = this.sectoriellesData?.repartitionParSecteur || [];
    const totalMarches = list.reduce((sum, x) => sum + (x.nombreMarches || 0), 0) || 1;
    this.sectorRows = list.map(x => ({
      designation: x.designation,
      marches: x.nombreMarches || 0,
      articles: x.nombreArticles || 0,
      part: ((x.nombreMarches || 0) / totalMarches) * 100,
    }));
    this.applySectorFilter();
  }
  applySectorFilter(): void {
    const q = (this.sectorFilter || '').toLowerCase();
    this.sectorFiltered = this.sectorRows.filter(r => q ? (r.designation || '').toLowerCase().includes(q) : true);
    this.sectorPageIndex = 0;
  }
  sectorChangePageSize(size: number | string) { const n = typeof size === 'string' ? parseInt(size, 10) : size; this.sectorPageSize = isNaN(n as number) ? 10 : (n as number); this.sectorPageIndex = 0; }
  sectorFirst() { this.sectorPageIndex = 0; }
  sectorPrev() { if (this.sectorPageIndex > 0) this.sectorPageIndex--; }
  sectorNext() { const totalPages = Math.ceil(this.sectorTotal / this.sectorPageSize); if (this.sectorPageIndex + 1 < totalPages) this.sectorPageIndex++; }
  sectorLast() { const totalPages = Math.ceil(this.sectorTotal / this.sectorPageSize); this.sectorPageIndex = Math.max(0, totalPages - 1); }

  garantiesPageSizeOptions: number[] = [10, 25, 50];
  get garantiesPage(): { marcheDesignation: string; typeGarantie: string; montant: number; }[] {
    const start = this.garantiesPageIndex * this.garantiesPageSize;
    return this.garantiesEcheanceFiltered.slice(start, start + this.garantiesPageSize);
  }
  get garantiesTotal(): number { return this.garantiesEcheanceFiltered.length; }
  get garantiesRangeLabel(): string {
    if (this.garantiesTotal === 0) {
      return `Lignes 0-0 sur 0 (Page 0/0)`;
    }
    const start = this.garantiesPageIndex * this.garantiesPageSize + 1;
    const end = Math.min((this.garantiesPageIndex + 1) * this.garantiesPageSize, this.garantiesTotal);
    const page = this.garantiesPageIndex + 1;
    const totalPages = Math.max(1, Math.ceil(this.garantiesTotal / this.garantiesPageSize));
    return `Lignes ${start}-${end} sur ${this.garantiesTotal} (Page ${page}/${totalPages})`;
  }
  garantiesChangePageSize(size: number | string): void {
    const n = typeof size === 'string' ? parseInt(size, 10) : size;
    this.garantiesPageSize = isNaN(n as number) ? 10 : (n as number);
    this.garantiesPageIndex = 0;
  }
  garantiesFirst(): void { this.garantiesPageIndex = 0; }
  garantiesLast(): void {
    const totalPages = Math.ceil(this.garantiesTotal / this.garantiesPageSize);
    this.garantiesPageIndex = Math.max(0, totalPages - 1);
  }

  garantiesNext(): void {
    const totalPages = Math.ceil(this.garantiesTotal / this.garantiesPageSize);
    if (this.garantiesPageIndex + 1 < totalPages) {
      this.garantiesPageIndex++;
    }
  }
  garantiesPrev(): void {
    if (this.garantiesPageIndex > 0) {
      this.garantiesPageIndex--;
    }
  }

  // Options des graphiques
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: {
        display: true,
        text: 'Évolution des marchés',
        color: '#2c3e50',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#7f8c8d' }
      },
      x: {
        ticks: { color: '#7f8c8d' }
      }
    }
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Top fournisseurs',
        color: '#2c3e50',
        font: { size: 16 }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#7f8c8d' } },
      x: { ticks: { color: '#7f8c8d' } }
    }
  };

  secteurBarOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#2c3e50' } },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#7f8c8d', stepSize: 1 },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        ticks: { color: '#7f8c8d', autoSkip: false, maxRotation: 30, minRotation: 0 },
        grid: { display: false }
      }
    }
  };

  // Activités récentes
  recentActivities = [
    { time: '10:15', message: 'Marché "M123" ajouté', type: 'add', user: 'Ahmed' },
    { time: '09:45', message: 'Article "A58" modifié', type: 'edit', user: 'Sonia' },

    { time: 'Hier', message: 'Fournisseur "ABC" enregistré', type: 'add', user: 'Mohamed' },
    { time: 'Hier', message: 'Pénalité appliquée à "M122"', type: 'alert', user: 'Leila' },
    { time: '22/05', message: 'Décompte validé pour "M120"', type: 'success', user: 'Karim' }
  ];

  // Statut du système
  systemStatus = {
    apiStatus: 'loading',
    lastUpdate: new Date(),
    performance: 92,
    performanceTrend: 3.7
  };

  // Widgets externes supprimés (météo, taux de change) pour respecter la règle "données depuis la BD"
  // weatherData: any = null;
  // exchangeRates: any = null;

  // Accès rapides
  quickAccess = [
    { icon: 'fa-truck', label: 'Fournisseurs', route: 'fournisseur', color: '#3498db' },
    { icon: 'fa-box', label: 'Articles', route: 'article', color: '#2ecc71' },
    { icon: 'fa-file-contract', label: 'Marchés', route: 'marche', color: '#e74c3c' },
    { icon: 'fa-calculator', label: 'Décomptes', route: 'decompte', color: '#f39c12' },
    { icon: 'fa-cog', label: 'Paramètres', route: 'typegarantie', color: '#9b59b6' },
    { icon: 'fa-chart-bar', label: 'Statistiques', route: 'statistiques/fournisseurs', color: '#1abc9c' }
  ];

  constructor(
    private router: Router,
    private fournisseurService: FournisseurService,
    private articleService: ArticleService,
    private marcheService: MarcheService,
    private dashboardService: DashboardService,
    private dashboardWidgetsService: DashboardWidgetsService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadExternalAPIs();
    this.loadDashboardDataFromAPI();
    this.loadWidgetsData();
  }

  loadDashboardData(): void {
    // Récupérer le nombre de fournisseurs
    this.fournisseurService.getFournisseurList(0, 1).subscribe(data => {
      this.fournisseursCount = data.totalElements || 12;
    });

    // Récupérer le nombre d'articles
    this.articleService.getArticlesList(0, 1).subscribe(data => {
      this.articlesCount = data.totalElements || 58;
    });

    // Récupérer le nombre de marchés
    this.marcheService.getAllMarches(0, 1).subscribe(data => {
      this.marchesCount = data.totalElements || 9;
      this.systemStatus.apiStatus = 'online';
    });
  }

  prepareChartData(): void {
    // Données pour l'évolution des marchés (exemple)
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const values = [2, 3, 1, 4, 2, 5];

    this.marchesByMonth = {
      labels: months,
      datasets: [{
        label: 'Marchés',
        data: values,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };

    // Supprimé: données mock pour top fournisseurs. Sera alimenté via l'API.
    this.dashboardService.getTopFournisseurs().subscribe({
      next: (chart) => this.updateFournisseursChart(chart),
      error: () => this.updateFournisseursChart({ labels: [], data: [] })
    });
  }

  // Widgets externes supprimés
  private loadExternalAPIs(): void { /* supprimé */ }

  navigateToPath(path: string): void {
    this.router.navigate(['/' + path]);
  }

  refreshData(): void {
    this.systemStatus.apiStatus = 'loading';
    this.systemStatus.lastUpdate = new Date();

    // Utiliser le nouveau service dashboard
    this.dashboardService.refreshAllData().subscribe({
      next: (data) => {
        this.fournisseursCount = data.stats.fournisseursCount;
        this.articlesCount = data.stats.articlesCount;
        this.marchesCount = data.stats.marchesCount;
        this.systemStatus.apiStatus = data.stats.apiStatus;
        this.systemStatus.lastUpdate = new Date();

        // Mettre à jour les graphiques
        this.updateChartsFromAPI(data.evolution, data.topFournisseurs);

        // Mettre à jour les activités récentes
        this.recentActivities = data.activities;

        // Recharger les données externes
        this.loadExternalAPIs();
      },
      error: (error) => {
        console.error('Erreur lors de l\'actualisation:', error);
        this.systemStatus.apiStatus = 'error';
        // Fallback vers l'ancienne méthode
        this.loadDashboardData();
        this.prepareChartData();
      }
    });
  }

  /**
   * Charge les données du dashboard via la nouvelle API
   */
  loadDashboardDataFromAPI(): void {
    // Charger les statistiques
    this.dashboardService.getDashboardStats().subscribe(stats => {
      this.fournisseursCount = stats.fournisseursCount;
      this.articlesCount = stats.articlesCount;
      this.marchesCount = stats.marchesCount;
      this.systemStatus.apiStatus = stats.apiStatus;
    });

    // Charger l'évolution des marchés
    this.dashboardService.getMarchesEvolution().subscribe(evolution => {
      this.updateMarchesChart(evolution);
    });

    // Charger les top fournisseurs
    this.dashboardService.getTopFournisseurs().subscribe(topFournisseurs => {
      this.updateFournisseursChart(topFournisseurs);
    });

    // Charger les activités récentes
    this.dashboardService.getRecentActivities().subscribe(activities => {
      this.recentActivities = activities;
    });
  }

  /**
   * Met à jour le graphique d'évolution des marchés
   */
  updateMarchesChart(data: DashboardChartData): void {
    this.marchesByMonth = {
      labels: data.labels,
      datasets: [{
        label: 'Marchés',
        data: data.data,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
  }

  /**
   * Met à jour le graphique des top fournisseurs
   */
  updateFournisseursChart(data: DashboardChartData): void {
    this.topFournisseurs = {
      labels: data.labels,
      datasets: [{
        label: 'Marchés',
        data: data.data,
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
    // Met à jour le doughnut Top 5 + Autres
    this.topFournisseurs6Chart = this.buildTopFournisseurs6Chart(data);

  }


  /**
   * Calcule un doughnut: Top 5 fournisseurs + Autres
   */
  private buildTopFournisseurs6Chart(data: DashboardChartData): ChartData<'doughnut'> {
    const labels = [...data.labels];
    const values = [...data.data];
    if (labels.length <= 6) {
      return {
        labels,
        datasets: [{
          label: 'Fournisseurs',
          data: values,
          backgroundColor: [
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(155, 89, 182, 0.7)',
            'rgba(241, 196, 15, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(127, 140, 141, 0.7)'
          ],
          borderColor: [
            'rgba(52, 152, 219, 1)',
            'rgba(46, 204, 113, 1)',
            'rgba(155, 89, 182, 1)',
            'rgba(241, 196, 15, 1)',
            'rgba(231, 76, 60, 1)',
            'rgba(127, 140, 141, 1)'
          ],
          borderWidth: 1
        }]
      };
    }
    const top5Labels = labels.slice(0, 5);
    const top5Values = values.slice(0, 5);
    const others = values.slice(5).reduce((a, b) => a + b, 0);
    return {
      labels: [...top5Labels, 'Autres'],
      datasets: [{
        label: 'Fournisseurs',
        data: [...top5Values, others],
        backgroundColor: [
          'rgba(52, 152, 219, 0.7)',
          'rgba(46, 204, 113, 0.7)',
          'rgba(155, 89, 182, 0.7)',
          'rgba(241, 196, 15, 0.7)',
          'rgba(231, 76, 60, 0.7)',
          'rgba(127, 140, 141, 0.7)'
        ],
        borderColor: [
          'rgba(52, 152, 219, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(155, 89, 182, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(231, 76, 60, 1)',
          'rgba(127, 140, 141, 1)'
        ],
        borderWidth: 1
      }]
    };
  }

  /**
   * Met à jour les graphiques à partir des données API
   */
  updateChartsFromAPI(evolution: DashboardChartData, topFournisseurs: DashboardChartData): void {
    this.updateMarchesChart(evolution);
    this.updateFournisseursChart(topFournisseurs);
  }

  // ========== NOUVELLES MÉTHODES POUR LES WIDGETS ==========

  /**
   * Charge toutes les données des widgets
   */
  loadWidgetsData(): void {
    this.isGarantiesLoading = true;
    this.dashboardWidgetsService.refreshAllWidgets().subscribe({
      next: (data) => {
        this.penalitesData = data.penalites;
        this.garantiesData = data.garanties;
        this.decomptesData = data.decomptes;
        this.etapesData = data.etapes;
        this.sectoriellesData = data.sectorielles;

        // Générer les widgets de statistiques
        this.statWidgets = this.dashboardWidgetsService.generateStatWidgets(data);

        // Mettre à jour les graphiques
        this.updateWidgetCharts();
        // Préparer Garanties détaillées + filtres
        this.prepareGarantiesTable();
        this.applyGarantiesFilter();
        // Calculer la synthèse sectorielle (Top 5 + Autres) + légende
        this.buildSecteurSynthese();
        this.rebuildSecteurLegend();

        // S'abonner aux alertes
        this.dashboardWidgetsService.alertes$.subscribe(alertes => {
          this.dashboardAlertes = alertes;
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des widgets:', error);
      },
      complete: () => {
        this.isGarantiesLoading = false;
      }
    });
  }

  /**
   * Met à jour les graphiques des widgets
   */
  updateWidgetCharts(): void {
    // Graphique des garanties par type (doughnut)
    if (this.garantiesData.repartitionParType.length > 0) {
      this.garantiesChart = {
        labels: this.garantiesData.repartitionParType.map(g => g.designation),
        datasets: [{
          label: 'Garanties',
          data: this.garantiesData.repartitionParType.map(g => g.nombre),
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
    // Graphique Top marchés par montant de garanties (bar)
    if (this.garantiesData.garantiesEcheanceList && this.garantiesData.garantiesEcheanceList.length > 0) {
      const agg = new Map<string, number>();
      for (const g of this.garantiesData.garantiesEcheanceList) {
        const key = g.marcheDesignation || 'Marché';
        agg.set(key, (agg.get(key) || 0) + (g.montant || 0));
      }
      const entries = Array.from(agg.entries()).sort((a,b)=> b[1]-a[1]).slice(0, 10);
      this.garantiesTopMarchesChart = {
        labels: entries.map(e => e[0]),
        datasets: [{
          label: 'Montant des garanties',
          data: entries.map(e => e[1]),
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 1
        }]
      };
    }


    // Synthèse sectorielle: Top 5 + Autres (doughnut)
    if (this.sectoriellesData.repartitionParSecteur && this.sectoriellesData.repartitionParSecteur.length > 0) {
      const rows = this.sectoriellesData.repartitionParSecteur.map(s => ({ label: s.designation || 'Non spécifié', value: s.nombreMarches || 0 }))
        .sort((a,b)=> b.value - a.value);
      const top5 = rows.slice(0,5);
      const others = rows.slice(5).reduce((sum, r)=> sum + r.value, 0);
      const labels = others > 0 ? [...top5.map(r=>r.label), 'Autres'] : top5.map(r=>r.label);
      const data = others > 0 ? [...top5.map(r=>r.value), others] : top5.map(r=>r.value);
      this.secteurSynthese = {
        labels,
        datasets: [{
          label: 'Marchés',
          data,
          backgroundColor: [
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(155, 89, 182, 0.7)',
            'rgba(241, 196, 15, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(127, 140, 141, 0.7)'
          ],
          borderColor: [
            'rgba(52, 152, 219, 1)',
            'rgba(46, 204, 113, 1)',
            'rgba(155, 89, 182, 1)',
            'rgba(241, 196, 15, 1)',
            'rgba(231, 76, 60, 1)',
            'rgba(127, 140, 141, 1)'
          ],
          borderWidth: 1
        }]
      };
    }

    }

    // Graphique des pénalités par type (doughnut)
    if (this.penalitesData.penalitesParType && this.penalitesData.penalitesParType.length > 0) {
      this.penalitesTypeChart = {
        labels: this.penalitesData.penalitesParType.map(p => p.designation || 'Non spécifié'),
        datasets: [{
          label: 'Pénalités',
          data: this.penalitesData.penalitesParType.map(p => p.nombre),
          backgroundColor: [
            'rgba(231, 76, 60, 0.7)',
            'rgba(241, 196, 15, 0.7)',
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(155, 89, 182, 0.7)'
          ],
          borderColor: [
            'rgba(231, 76, 60, 1)',
            'rgba(241, 196, 15, 1)',
            'rgba(52, 152, 219, 1)',
            'rgba(46, 204, 113, 1)',
            'rgba(155, 89, 182, 1)'
          ],
          borderWidth: 1
        }]
      };
    }

    // Graphique de l'évolution des paiements (line)
    if (this.decomptesData.evolutionPaiements.length > 0) {
      this.evolutionPaiementsChart = {
        labels: this.decomptesData.evolutionPaiements.map(p => p.mois),
        datasets: [{
          label: 'Montant des paiements',
          data: this.decomptesData.evolutionPaiements.map(p => p.montant),
          borderColor: 'rgba(52, 152, 219, 1)',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          fill: true,
          tension: 0.4
        }]
      };
    }

    // Graphique des secteurs (bar horizontal trié)
    if (this.sectoriellesData.repartitionParSecteur.length > 0) {
      const rows = [...this.sectoriellesData.repartitionParSecteur]
        .sort((a, b) => (b.nombreMarches || 0) - (a.nombreMarches || 0));
      this.secteurChart = {
        labels: rows.map(s => s.designation),
        datasets: [
          {
            label: 'Marchés',
            data: rows.map(s => s.nombreMarches),
            backgroundColor: 'rgba(52, 152, 219, 0.7)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1
          },
          {
            label: 'Articles',
            data: rows.map(s => s.nombreArticles),
            backgroundColor: 'rgba(46, 204, 113, 0.7)',
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 1
          }
        ]
      };
      // Basculer l'axe en horizontal
      this.secteurBarOptions = { ...(this.secteurBarOptions || {}), indexAxis: 'y' } as any;
    }

    // Graphique de l'évolution des prix (line)
    if (this.sectoriellesData.evolutionPrix.length > 0) {
      this.evolutionPrixChart = {
        labels: this.sectoriellesData.evolutionPrix.map(p => p.mois),
        datasets: [{
          label: 'Prix moyen',
          data: this.sectoriellesData.evolutionPrix.map(p => p.prixMoyen),
          borderColor: 'rgba(155, 89, 182, 1)',
          backgroundColor: 'rgba(155, 89, 182, 0.1)',
          fill: true,
          tension: 0.4
        }]
      };
    }

  }

  /** Prépare la table Garanties détaillées et remplit les options de type */
  prepareGarantiesTable(): void {
    const list = this.garantiesData.garantiesEcheanceList || [];
    this.garantiesEcheanceFiltered = [...list];
    const types = Array.from(new Set(list.map(i => i.typeGarantie).filter(Boolean))) as string[];
    this.garantiesTypesOptions = types.sort((a, b) => a.localeCompare(b));
  }

  /** Applique les filtres locaux sur la table des garanties (sans dates) */
  applyGarantiesFilter(): void {
    const src = this.garantiesData.garantiesEcheanceList || [];
    const f = this.garantieFilter;

    this.garantiesEcheanceFiltered = src.filter(g => {
      const okMarche = f.marche ? (g.marcheDesignation || '').toLowerCase().includes(f.marche.toLowerCase()) : true;
      const okType = f.type ? g.typeGarantie === f.type : true;
      return okMarche && okType;
    });
    // Réinitialiser la pagination à la première page après filtrage
    this.garantiesPageIndex = 0;
  }

  /**
   * Actualise toutes les données du dashboard y compris les widgets
   */
  refreshAllData(): void {
    this.refreshData();
    this.loadWidgetsData();
  }

  /** Calcule la synthèse sectorielle Top 5 + Autres (doughnut) */
  private buildSecteurSynthese(): void {
    const list = this.sectoriellesData?.repartitionParSecteur || [];
    if (!list || list.length === 0) { this.secteurSynthese = { labels: [], datasets: [] }; return; }
    const rows = list.map(s => ({ label: s.designation || 'Non spécifié', value: s.nombreMarches || 0 }))
                     .sort((a,b)=> b.value - a.value);
    const top5 = rows.slice(0,5);
    const others = rows.slice(5).reduce((sum, r)=> sum + r.value, 0);
    const labels = others > 0 ? [...top5.map(r=>r.label), 'Autres'] : top5.map(r=>r.label);
    const data = others > 0 ? [...top5.map(r=>r.value), others] : top5.map(r=>r.value);
    const backgroundColor = [
      'rgba(52, 152, 219, 0.7)',
      'rgba(46, 204, 113, 0.7)',
      'rgba(155, 89, 182, 0.7)',
      'rgba(241, 196, 15, 0.7)',
      'rgba(231, 76, 60, 0.7)',
      'rgba(127, 140, 141, 0.7)'
    ];
    const borderColor = [
      'rgba(52, 152, 219, 1)',
      'rgba(46, 204, 113, 1)',
      'rgba(155, 89, 182, 1)',
      'rgba(241, 196, 15, 1)',
      'rgba(231, 76, 60, 1)',
      'rgba(127, 140, 141, 1)'
    ];
    this.secteurSynthese = {
      labels,
      datasets: [{ label: 'Marchés', data, backgroundColor, borderColor, borderWidth: 1 }]
    };
    // reconstruire la légende en cohérence avec les couleurs
    this.rebuildSecteurLegend();
  }
  /** Reconstruit la légende affichée à droite du doughnut */
  private rebuildSecteurLegend(): void {
    const ds = this.secteurSynthese?.datasets?.[0];
    const labels = this.secteurSynthese?.labels as string[] || [];
    const data = (ds?.data as number[]) || [];
    const colors = (ds as any)?.backgroundColor as string[] || [];
    const total = data.reduce((a,b)=>a+(b||0),0) || 1;
    this.secteurLegend = labels.map((label, idx) => ({
      label,
      value: data[idx] || 0,
      percent: total ? ((data[idx] || 0) / total) * 100 : 0,
      color: colors[idx] || '#bdc3c7'
    }));
  }


  /**
   * Ferme une alerte
   */
  dismissAlert(alertId: string): void {
    this.dashboardAlertes = this.dashboardAlertes.filter(alert => alert.id !== alertId);
  }

  /**
   * Navigue vers une route spécifique
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
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
}
