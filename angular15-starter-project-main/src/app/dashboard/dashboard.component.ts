import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FournisseurService } from '../services/fournisseur/fournisseur.service';
import { ArticleService } from '../services/article/article.service';
import { MarcheService } from '../services/marche/marche.service';
import { DashboardService, DashboardStats, ChartData as DashboardChartData, SystemStatus, Activity } from '../services/dashboard/dashboard.service';
import { HttpClient } from '@angular/common/http';
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
  garantiesChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  penalitesTypeChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  evolutionPaiementsChart: ChartData<'line'> = { labels: [], datasets: [] };
  secteurChart: ChartData<'bar'> = { labels: [], datasets: [] };
  evolutionPrixChart: ChartData<'line'> = { labels: [], datasets: [] };

  // Données et filtres pour Garanties détaillées
  garantiesEcheanceFiltered: { marcheDesignation: string; typeGarantie: string; dateFin: string | Date; montant: number; }[] = [];
  garantiesTypesOptions: string[] = [];
  garantieFilter: { marche: string; type: string; dateMin: string | null; dateMax: string | null } = { marche: '', type: '', dateMin: null, dateMax: null };

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
      y: {
        beginAtZero: true,
        ticks: { color: '#7f8c8d' }
      },
      x: {
        ticks: { color: '#7f8c8d' }
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

  // Données météo (API externe)
  weatherData: any = null;

  // Taux de change (API externe)
  exchangeRates: any = null;

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
    private dashboardWidgetsService: DashboardWidgetsService,
    private http: HttpClient
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

    // Données pour les top fournisseurs (exemple)
    this.topFournisseurs = {
      labels: ['STEG', 'GEOMED', 'MEDIBAT', 'STT', 'EL OUKHOUA'],
      datasets: [{
        label: 'Marchés',
        data: [3, 2, 1, 1, 1],
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

  loadExternalAPIs(): void {
    // Récupérer les données météo (exemple avec OpenWeatherMap)
    this.http.get('https://api.openweathermap.org/data/2.5/weather?q=Tunis&appid=YOUR_API_KEY&units=metric')
      .pipe(catchError(error => {
        console.error('Erreur lors de la récupération des données météo', error);
        // Données de démonstration en cas d'erreur
        return of({
          main: { temp: 28, humidity: 65 },
          weather: [{ description: 'Ensoleillé' }],
          wind: { speed: 12 }
        });
      }))
      .subscribe(data => {
        this.weatherData = data;
      });

    // Récupérer les taux de change (exemple avec ExchangeRate-API)
    this.http.get('https://api.exchangerate-api.com/v4/latest/TND')
      .pipe(catchError(error => {
        console.error('Erreur lors de la récupération des taux de change', error);
        // Données de démonstration en cas d'erreur
        return of({
          rates: { EUR: 0.29, USD: 0.32, GBP: 0.25 }
        });
      }))
      .subscribe(data => {
        this.exchangeRates = data;
      });
  }

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

        // S'abonner aux alertes
        this.dashboardWidgetsService.alertes$.subscribe(alertes => {
          this.dashboardAlertes = alertes;
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des widgets:', error);
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

    // Graphique des secteurs (bar)
    if (this.sectoriellesData.repartitionParSecteur.length > 0) {
      this.secteurChart = {
        labels: this.sectoriellesData.repartitionParSecteur.map(s => s.designation),
        datasets: [
          {
            label: 'Marchés',
            data: this.sectoriellesData.repartitionParSecteur.map(s => s.nombreMarches),
            backgroundColor: 'rgba(52, 152, 219, 0.7)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1
          },
          {
            label: 'Articles',
            data: this.sectoriellesData.repartitionParSecteur.map(s => s.nombreArticles),
            backgroundColor: 'rgba(46, 204, 113, 0.7)',
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 1
          }
        ]
      };
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

  /** Applique les filtres locaux sur la table des garanties */
  applyGarantiesFilter(): void {
    const src = this.garantiesData.garantiesEcheanceList || [];
    const f = this.garantieFilter;

    const toDate = (d: any) => d ? new Date(d as any) : null;
    const min = f.dateMin ? new Date(f.dateMin) : null;
    const max = f.dateMax ? new Date(f.dateMax) : null;

    this.garantiesEcheanceFiltered = src.filter(g => {
      const okMarche = f.marche ? (g.marcheDesignation || '').toLowerCase().includes(f.marche.toLowerCase()) : true;
      const okType = f.type ? g.typeGarantie === f.type : true;
      const df = toDate(g.dateFin);
      const okMin = min ? (!!df && df >= min) : true;
      const okMax = max ? (!!df && df <= max) : true;
      return okMarche && okType && okMin && okMax;
    });
  }

  /**
   * Actualise toutes les données du dashboard y compris les widgets
   */
  refreshAllData(): void {
    this.refreshData();
    this.loadWidgetsData();
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
