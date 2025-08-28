import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatistiquesService } from 'src/app/services/statistiques/statistiques.service';
import {
  StatistiquesGlobales,
  FiltresStatistiques,
  TauxChange,
  DonneesMeteo,
  Alerte
} from 'src/app/model/statistiques';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-statistiques-globales',
  templateUrl: './statistiques-globales.component.html',
  styleUrls: ['./statistiques-globales.component.scss'],
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateY(0%)', opacity: 1 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class StatistiquesGlobalesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Données principales
  statistiques: StatistiquesGlobales | null = null;
  tauxChange: TauxChange[] = [];
  donneesMeteo: DonneesMeteo | null = null;
  alertes: Alerte[] = [];
  
  // État de l'interface
  isLoading = true;
  isRefreshing = false;
  selectedPeriode = '30j';
  selectedView = 'overview';
  filtres: FiltresStatistiques = {};
  
  // Configuration des graphiques
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true
        }
      },
      y: {
        display: true,
        title: {
          display: true
        }
      }
    }
  };

  // Données pour les cartes de métriques
  metriquesCards = [
    {
      title: 'Total Fournisseurs',
      value: 0,
      variation: 0,
      icon: 'business',
      color: 'primary',
      route: '/parametrage/fournisseur'
    },
    {
      title: 'Marchés Actifs',
      value: 0,
      variation: 0,
      icon: 'assignment',
      color: 'accent',
      route: '/pages/marche'
    },
    {
      title: 'Articles Référencés',
      value: 0,
      variation: 0,
      icon: 'inventory',
      color: 'warn',
      route: '/parametrage/article'
    },
    {
      title: 'Montant Total',
      value: 0,
      variation: 0,
      icon: 'monetization_on',
      color: 'primary',
      format: 'currency'
    }
  ];

  // Options de période
  periodeOptions = [
    { value: '7j', label: '7 derniers jours' },
    { value: '30j', label: '30 derniers jours' },
    { value: '3m', label: '3 derniers mois' },
    { value: '6m', label: '6 derniers mois' },
    { value: '1a', label: '1 an' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  // Options de vue
  viewOptions = [
    { value: 'overview', label: 'Vue d\'ensemble', icon: 'dashboard' },
    { value: 'fournisseurs', label: 'Fournisseurs', icon: 'business' },
    { value: 'marches', label: 'Marchés', icon: 'assignment' },
    { value: 'articles', label: 'Articles', icon: 'inventory' },
    { value: 'performance', label: 'Performance', icon: 'trending_up' }
  ];

  constructor(
    private statistiquesService: StatistiquesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.setupAutoRefresh();
    this.loadExternalData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Chargement initial des données
   */
  loadInitialData(): void {
    this.isLoading = true;
    
    this.statistiquesService.getStatistiquesGlobales(this.filtres)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.statistiques = data;
          this.updateMetriquesCards();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des statistiques:', error);
          this.showErrorMessage('Erreur lors du chargement des données');
          this.isLoading = false;
        }
      });
  }

  /**
   * Actualisation des données
   */
  refreshData(): void {
    this.isRefreshing = true;
    
    this.statistiquesService.getStatistiquesGlobales(this.filtres)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.statistiques = data;
          this.updateMetriquesCards();
          this.isRefreshing = false;
          this.showSuccessMessage('Données actualisées avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de l\'actualisation:', error);
          this.showErrorMessage('Erreur lors de l\'actualisation');
          this.isRefreshing = false;
        }
      });
  }

  /**
   * Configuration de l'actualisation automatique
   */
  setupAutoRefresh(): void {
    // Actualisation automatique toutes les 5 minutes
    interval(300000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isLoading && !this.isRefreshing) {
          this.refreshData();
        }
      });
  }

  /**
   * Chargement des données externes
   */
  loadExternalData(): void {
    // Taux de change
    this.statistiquesService.getTauxChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (taux) => {
          this.tauxChange = taux;
        },
        error: (error) => {
          console.error('Erreur taux de change:', error);
        }
      });

    // Données météo
    this.statistiquesService.getDonneesMeteo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (meteo) => {
          this.donneesMeteo = meteo;
        },
        error: (error) => {
          console.error('Erreur données météo:', error);
        }
      });
  }

  /**
   * Mise à jour des cartes de métriques
   */
  updateMetriquesCards(): void {
    if (!this.statistiques) return;

    this.metriquesCards[0].value = this.statistiques.fournisseurs.total;
    this.metriquesCards[0].variation = this.calculateVariation(
      this.statistiques.fournisseurs.total,
      this.statistiques.fournisseurs.nouveaux
    );

    this.metriquesCards[1].value = this.statistiques.marches.enCours;
    this.metriquesCards[1].variation = this.calculateVariation(
      this.statistiques.marches.total,
      this.statistiques.marches.enCours
    );

    this.metriquesCards[2].value = this.statistiques.articles.total;
    this.metriquesCards[2].variation = 5.2; // Exemple de variation

    this.metriquesCards[3].value = this.statistiques.marches.montantTotal;
    this.metriquesCards[3].variation = this.calculateVariation(
      this.statistiques.marches.montantTotal,
      this.statistiques.marches.montantMoyen
    );
  }

  /**
   * Calcul de la variation en pourcentage
   */
  calculateVariation(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Changement de filtres
   */
  onFiltersChange(filtres: FiltresStatistiques): void {
    this.filtres = filtres;
    this.refreshData();
  }

  /**
   * Réinitialisation des filtres
   */
  onResetFilters(): void {
    this.filtres = {};
    this.refreshData();
  }

  /**
   * Changement de vue
   */
  onViewChange(view: string): void {
    this.selectedView = view;
  }

  /**
   * Mise à jour des filtres selon la période
   */
  updateFiltresPeriode(): void {
    const now = new Date();
    const filtres: FiltresStatistiques = {};

    switch (this.selectedPeriode) {
      case '7j':
        filtres.dateDebut = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30j':
        filtres.dateDebut = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        filtres.dateDebut = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        filtres.dateDebut = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1a':
        filtres.dateDebut = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    filtres.dateFin = now;
    this.filtres = filtres;
  }

  /**
   * Export des données
   */
  exportData(format: 'pdf' | 'excel' | 'csv'): void {
    this.statistiquesService.exporterDonnees(format, this.filtres)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `statistiques-${new Date().toISOString().split('T')[0]}.${format}`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.showSuccessMessage(`Export ${format.toUpperCase()} réussi`);
        },
        error: (error) => {
          console.error('Erreur lors de l\'export:', error);
          this.showErrorMessage('Erreur lors de l\'export');
        }
      });
  }

  /**
   * Messages de notification
   */
  showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Formatage des valeurs
   */
  formatValue(value: number, format?: string): string {
    if (format === 'currency') {
      return new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND'
      }).format(value);
    }
    return new Intl.NumberFormat('fr-TN').format(value);
  }

  /**
   * Obtenir la couleur selon la variation
   */
  getVariationColor(variation: number): string {
    if (variation > 0) return 'success';
    if (variation < 0) return 'warn';
    return 'primary';
  }

  /**
   * Obtenir l'icône selon la variation
   */
  getVariationIcon(variation: number): string {
    if (variation > 0) return 'trending_up';
    if (variation < 0) return 'trending_down';
    return 'trending_flat';
  }
}
