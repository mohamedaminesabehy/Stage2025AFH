import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { StatistiquesMarches, RepartitionType } from 'src/app/model/statistiques';

@Component({
  selector: 'app-marche-analytics',
  templateUrl: './marche-analytics.component.html',
  styleUrls: ['./marche-analytics.component.scss']
})
export class MarcheAnalyticsComponent implements OnInit, OnChanges {
  @Input() data: StatistiquesMarches | null = null;

  // Données pour les graphiques
  chartData: any = {};
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  };

  // Métriques calculées
  tauxReussite = 0;
  croissanceMensuelle = 0;
  montantMoyenParType: { [key: string]: number } = {};

  ngOnInit(): void {
    this.updateData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateData();
    }
  }

  private updateData(): void {
    if (!this.data) return;

    this.calculateMetrics();
    this.prepareChartData();
  }

  private calculateMetrics(): void {
    if (!this.data) return;

    // Calcul du taux de réussite
    this.tauxReussite = this.data.tauxReussite || 0;

    // Calcul de la croissance mensuelle
    if (this.data.evolutionMontants && this.data.evolutionMontants.length >= 2) {
      const dernierMois = this.data.evolutionMontants[this.data.evolutionMontants.length - 1];
      const avantDernierMois = this.data.evolutionMontants[this.data.evolutionMontants.length - 2];
      this.croissanceMensuelle = ((dernierMois.valeur - avantDernierMois.valeur) / avantDernierMois.valeur) * 100;
    }

    // Calcul du montant moyen par type
    this.data.repartitionParType?.forEach(type => {
      this.montantMoyenParType[type.type] = type.nombre > 0 ? type.montantTotal / type.nombre : 0;
    });
  }

  private prepareChartData(): void {
    if (!this.data) return;

    // Graphique d'évolution des montants
    this.chartData.evolution = {
      labels: this.data.evolutionMontants?.map(item => item.mois) || [],
      datasets: [
        {
          label: 'Montant Total (TND)',
          data: this.data.evolutionMontants?.map(item => item.valeur) || [],
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Variation (%)',
          data: this.data.evolutionMontants?.map(item => item.pourcentageVariation) || [],
          borderColor: '#ff4081',
          backgroundColor: 'rgba(255, 64, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    };

    // Graphique de répartition par type
    this.chartData.repartitionType = {
      labels: this.data.repartitionParType?.map(type => type.type) || [],
      datasets: [
        {
          label: 'Nombre de Marchés',
          data: this.data.repartitionParType?.map(type => type.nombre) || [],
          backgroundColor: [
            '#1976d2', '#ff4081', '#4caf50', '#ff9800', '#9c27b0',
            '#f44336', '#2196f3', '#8bc34a', '#ffc107', '#e91e63'
          ],
          borderWidth: 1
        }
      ]
    };

    // Graphique des montants par type
    this.chartData.montantsType = {
      labels: this.data.repartitionParType?.map(type => type.type) || [],
      datasets: [
        {
          label: 'Montant Total (TND)',
          data: this.data.repartitionParType?.map(type => type.montantTotal) || [],
          backgroundColor: 'rgba(25, 118, 210, 0.6)',
          borderColor: '#1976d2',
          borderWidth: 1
        },
        {
          label: 'Montant Moyen (TND)',
          data: this.data.repartitionParType?.map(type => this.montantMoyenParType[type.type]) || [],
          backgroundColor: 'rgba(255, 64, 129, 0.6)',
          borderColor: '#ff4081',
          borderWidth: 1
        }
      ]
    };

    // Graphique en radar pour les performances
    this.chartData.performance = {
      labels: ['Délais', 'Qualité', 'Budget', 'Satisfaction', 'Innovation'],
      datasets: [
        {
          label: 'Performance Globale',
          data: [
            this.data.delaisMoyens ? Math.max(0, 100 - this.data.delaisMoyens) : 75,
            this.tauxReussite,
            85, // Score budget (exemple)
            80, // Score satisfaction (exemple)
            70  // Score innovation (exemple)
          ],
          backgroundColor: 'rgba(25, 118, 210, 0.2)',
          borderColor: '#1976d2',
          borderWidth: 2,
          pointBackgroundColor: '#1976d2',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#1976d2'
        }
      ]
    };
  }

  // Méthodes utilitaires
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-TN').format(value);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'en cours': return 'primary';
      case 'terminé': return 'success';
      case 'suspendu': return 'warning';
      case 'annulé': return 'danger';
      default: return 'secondary';
    }
  }

  getTrendIcon(value: number): string {
    if (value > 0) return 'trending_up';
    if (value < 0) return 'trending_down';
    return 'trending_flat';
  }

  getTrendColor(value: number): string {
    if (value > 0) return 'success';
    if (value < 0) return 'danger';
    return 'primary';
  }
}
