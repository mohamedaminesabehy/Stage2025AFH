import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { StatistiquesFournisseurs, TopFournisseur, RepartitionRegion } from 'src/app/model/statistiques';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-fournisseur-analytics',
  templateUrl: './fournisseur-analytics.component.html',
  styleUrls: ['./fournisseur-analytics.component.scss']
})
export class FournisseurAnalyticsComponent implements OnInit, OnChanges {
  @Input() data: StatistiquesFournisseurs | null = null;

  // Données pour les tableaux
  topFournisseursDataSource = new MatTableDataSource<TopFournisseur>();
  repartitionDataSource = new MatTableDataSource<RepartitionRegion>();

  // Colonnes des tableaux
  topFournisseursColumns = ['designation', 'nombreMarches', 'montantTotal', 'scorePerformance', 'actions'];
  repartitionColumns = ['region', 'nombre', 'pourcentage', 'montantTotal'];

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

    // Mise à jour des sources de données des tableaux
    this.topFournisseursDataSource.data = this.data.topFournisseurs || [];
    this.repartitionDataSource.data = this.data.repartitionParRegion || [];

    // Préparation des données pour les graphiques
    this.prepareChartData();
  }

  private prepareChartData(): void {
    if (!this.data) return;

    // Graphique d'évolution mensuelle
    this.chartData.evolution = {
      labels: this.data.evolutionMensuelle?.map(item => item.mois) || [],
      datasets: [
        {
          label: 'Nouveaux Fournisseurs',
          data: this.data.evolutionMensuelle?.map(item => item.valeur) || [],
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 2,
          fill: true
        }
      ]
    };

    // Graphique de performance
    this.chartData.performance = {
      labels: this.data.topFournisseurs?.slice(0, 10).map(f => f.designation.substring(0, 20)) || [],
      datasets: [
        {
          label: 'Score de Performance',
          data: this.data.topFournisseurs?.slice(0, 10).map(f => f.scorePerformance) || [],
          backgroundColor: [
            '#1976d2', '#ff4081', '#4caf50', '#ff9800', '#9c27b0',
            '#f44336', '#2196f3', '#8bc34a', '#ffc107', '#e91e63'
          ],
          borderWidth: 1
        }
      ]
    };

    // Graphique de répartition par montant
    this.chartData.montants = {
      labels: this.data.repartitionParRegion?.map(r => r.region) || [],
      datasets: [
        {
          label: 'Montant Total (TND)',
          data: this.data.repartitionParRegion?.map(r => r.montantTotal) || [],
          backgroundColor: 'rgba(25, 118, 210, 0.6)',
          borderColor: '#1976d2',
          borderWidth: 1
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

  getPerformanceColor(score: number): string {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  }

  getPerformanceIcon(score: number): string {
    if (score >= 80) return 'trending_up';
    if (score >= 60) return 'trending_flat';
    return 'trending_down';
  }

  // Actions
  viewFournisseurDetails(fournisseur: TopFournisseur): void {
    // Navigation vers les détails du fournisseur
    console.log('Voir détails fournisseur:', fournisseur);
  }

  exportFournisseurData(): void {
    // Export des données des fournisseurs
    console.log('Export données fournisseurs');
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>): void {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
  }
}
