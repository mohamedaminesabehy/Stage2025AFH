import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExternalApisService } from 'src/app/services/external-apis/external-apis.service';
import { TauxChange, IndicateurEconomique, DonneesMeteo } from 'src/app/model/statistiques';

@Component({
  selector: 'app-external-data-widget',
  templateUrl: './external-data-widget.component.html',
  styleUrls: ['./external-data-widget.component.scss']
})
export class ExternalDataWidgetComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Données externes
  tauxChange: TauxChange[] = [];
  donneesMeteo: DonneesMeteo | null = null;
  indicateursEconomiques: IndicateurEconomique[] = [];
  cryptoData: any[] = [];
  actualites: any[] = [];

  // État de chargement
  isLoadingTaux = false;
  isLoadingMeteo = false;
  isLoadingEconomic = false;
  isLoadingCrypto = false;
  isLoadingNews = false;

  // Configuration d'affichage
  selectedTab = 0;
  autoRefresh = true;
  refreshInterval = 5 * 60 * 1000; // 5 minutes

  constructor(private externalApisService: ExternalApisService) {}

  ngOnInit(): void {
    this.loadAllData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge toutes les données externes
   */
  loadAllData(): void {
    this.loadTauxChange();
    this.loadDonneesMeteo();
    this.loadIndicateursEconomiques();
    this.loadCryptoData();
    this.loadActualites();
  }

  /**
   * Charge les taux de change
   */
  loadTauxChange(): void {
    this.isLoadingTaux = true;
    this.externalApisService.getTauxChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (taux) => {
          this.tauxChange = taux;
          this.isLoadingTaux = false;
        },
        error: (error) => {
          console.error('Erreur chargement taux de change:', error);
          this.isLoadingTaux = false;
        }
      });
  }

  /**
   * Charge les données météo
   */
  loadDonneesMeteo(): void {
    this.isLoadingMeteo = true;
    this.externalApisService.getDonneesMeteo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (meteo) => {
          this.donneesMeteo = meteo;
          this.isLoadingMeteo = false;
        },
        error: (error) => {
          console.error('Erreur chargement météo:', error);
          this.isLoadingMeteo = false;
        }
      });
  }

  /**
   * Charge les indicateurs économiques
   */
  loadIndicateursEconomiques(): void {
    this.isLoadingEconomic = true;
    this.externalApisService.getIndicateursEconomiques()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (indicateurs) => {
          this.indicateursEconomiques = indicateurs;
          this.isLoadingEconomic = false;
        },
        error: (error) => {
          console.error('Erreur chargement indicateurs économiques:', error);
          this.isLoadingEconomic = false;
        }
      });
  }

  /**
   * Charge les données crypto
   */
  loadCryptoData(): void {
    this.isLoadingCrypto = true;
    this.externalApisService.getCryptoData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (crypto) => {
          this.cryptoData = crypto;
          this.isLoadingCrypto = false;
        },
        error: (error) => {
          console.error('Erreur chargement crypto:', error);
          this.isLoadingCrypto = false;
        }
      });
  }

  /**
   * Charge les actualités
   */
  loadActualites(): void {
    this.isLoadingNews = true;
    this.externalApisService.getActualitesEconomiques()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (actualites) => {
          this.actualites = actualites.slice(0, 5); // Limiter à 5 actualités
          this.isLoadingNews = false;
        },
        error: (error) => {
          console.error('Erreur chargement actualités:', error);
          this.isLoadingNews = false;
        }
      });
  }

  /**
   * Configuration de l'actualisation automatique
   */
  setupAutoRefresh(): void {
    if (this.autoRefresh) {
      interval(this.refreshInterval)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadAllData();
        });
    }
  }

  /**
   * Actualisation manuelle
   */
  refreshData(): void {
    this.loadAllData();
  }

  /**
   * Basculer l'actualisation automatique
   */
  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.setupAutoRefresh();
    }
  }

  /**
   * Méthodes utilitaires
   */
  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-TN').format(value);
  }

  getVariationColor(variation: number): string {
    if (variation > 0) return 'success';
    if (variation < 0) return 'danger';
    return 'primary';
  }

  getVariationIcon(variation: number): string {
    if (variation > 0) return 'trending_up';
    if (variation < 0) return 'trending_down';
    return 'trending_flat';
  }

  getTemperatureColor(temp: number): string {
    if (temp >= 30) return 'danger';
    if (temp >= 20) return 'success';
    if (temp >= 10) return 'primary';
    return 'info';
  }

  getCryptoIcon(nom: string): string {
    const icons: { [key: string]: string } = {
      'bitcoin': '₿',
      'ethereum': 'Ξ',
      'binancecoin': 'BNB',
      'cardano': 'ADA',
      'solana': 'SOL'
    };
    return icons[nom] || '₿';
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }

  openNewsLink(url: string): void {
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  }
}
