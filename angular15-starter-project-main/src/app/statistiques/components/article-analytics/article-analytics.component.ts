import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { StatistiquesArticles, CategorieArticle, ArticlePopulaire, RepartitionTVA } from 'src/app/model/statistiques';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-article-analytics',
  templateUrl: './article-analytics.component.html',
  styleUrls: ['./article-analytics.component.scss']
})
export class ArticleAnalyticsComponent implements OnInit, OnChanges {
  @Input() data: StatistiquesArticles | null = null;

  // Données pour les tableaux
  articlesPopulairesDataSource = new MatTableDataSource<ArticlePopulaire>();
  categoriesDataSource = new MatTableDataSource<CategorieArticle>();
  repartitionTVADataSource = new MatTableDataSource<RepartitionTVA>();

  // Colonnes des tableaux
  articlesPopulairesColumns = ['designation', 'utilisations', 'montantTotal', 'prixMoyen', 'actions'];
  categoriesColumns = ['secteur', 'sousSecteur', 'famille', 'nombre', 'pourcentage'];
  repartitionTVAColumns = ['tauxTVA', 'nombre', 'pourcentage', 'montantTotal'];

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
    this.articlesPopulairesDataSource.data = this.data.plusUtilises || [];
    this.categoriesDataSource.data = this.data.categories || [];
    this.repartitionTVADataSource.data = this.data.repartitionTVA || [];

    // Préparation des données pour les graphiques
    this.prepareChartData();
  }

  private prepareChartData(): void {
    if (!this.data) return;

    // Graphique d'évolution des prix
    this.chartData.evolutionPrix = {
      labels: this.data.evolutionPrix?.map(item => item.periode) || [],
      datasets: [
        {
          label: 'Prix Moyen (TND)',
          data: this.data.evolutionPrix?.map(item => item.prixMoyen) || [],
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Variation (%)',
          data: this.data.evolutionPrix?.map(item => item.variation) || [],
          borderColor: '#ff4081',
          backgroundColor: 'rgba(255, 64, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    };

    // Graphique de répartition par secteur
    const secteursData = this.groupByField('secteur');
    this.chartData.repartitionSecteur = {
      labels: Object.keys(secteursData),
      datasets: [
        {
          data: Object.values(secteursData),
          backgroundColor: [
            '#1976d2', '#ff4081', '#4caf50', '#ff9800', '#9c27b0',
            '#f44336', '#2196f3', '#8bc34a', '#ffc107', '#e91e63'
          ],
          borderWidth: 1
        }
      ]
    };

    // Graphique de répartition TVA
    this.chartData.repartitionTVA = {
      labels: this.data.repartitionTVA?.map(tva => `${tva.tauxTVA}%`) || [],
      datasets: [
        {
          label: 'Nombre d\'articles',
          data: this.data.repartitionTVA?.map(tva => tva.nombre) || [],
          backgroundColor: 'rgba(25, 118, 210, 0.6)',
          borderColor: '#1976d2',
          borderWidth: 1
        }
      ]
    };

    // Graphique des articles les plus utilisés
    this.chartData.articlesPopulaires = {
      labels: this.data.plusUtilises?.slice(0, 10).map(article => 
        article.designation.length > 20 ? 
        article.designation.substring(0, 20) + '...' : 
        article.designation
      ) || [],
      datasets: [
        {
          label: 'Utilisations',
          data: this.data.plusUtilises?.slice(0, 10).map(article => article.utilisations) || [],
          backgroundColor: 'rgba(255, 64, 129, 0.6)',
          borderColor: '#ff4081',
          borderWidth: 1
        }
      ]
    };

    // Graphique en radar pour les catégories
    const topCategories = this.data.categories?.slice(0, 5) || [];
    this.chartData.categoriesRadar = {
      labels: topCategories.map(cat => cat.secteur),
      datasets: [
        {
          label: 'Nombre d\'articles',
          data: topCategories.map(cat => cat.nombre),
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

  private groupByField(field: keyof CategorieArticle): { [key: string]: number } {
    const grouped: { [key: string]: number } = {};
    
    this.data?.categories?.forEach(category => {
      const key = category[field] as string;
      if (key) {
        grouped[key] = (grouped[key] || 0) + category.nombre;
      }
    });
    
    return grouped;
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

  getTVAColor(taux: number): string {
    if (taux === 0) return 'success';
    if (taux <= 7) return 'primary';
    if (taux <= 13) return 'accent';
    return 'warn';
  }

  getUsageLevel(utilisations: number): string {
    if (utilisations >= 100) return 'Très élevé';
    if (utilisations >= 50) return 'Élevé';
    if (utilisations >= 20) return 'Moyen';
    if (utilisations >= 5) return 'Faible';
    return 'Très faible';
  }

  getUsageLevelColor(utilisations: number): string {
    if (utilisations >= 100) return 'success';
    if (utilisations >= 50) return 'primary';
    if (utilisations >= 20) return 'accent';
    if (utilisations >= 5) return 'warn';
    return 'danger';
  }

  // Actions
  viewArticleDetails(article: ArticlePopulaire): void {
    console.log('Voir détails article:', article);
  }

  exportArticleData(): void {
    console.log('Export données articles');
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>): void {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
  }
}
