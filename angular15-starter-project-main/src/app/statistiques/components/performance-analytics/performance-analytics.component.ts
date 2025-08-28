import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PerformanceGlobale, IndicateurPerformance, Alerte, Recommandation } from 'src/app/model/statistiques';

@Component({
  selector: 'app-performance-analytics',
  templateUrl: './performance-analytics.component.html',
  styleUrls: ['./performance-analytics.component.scss']
})
export class PerformanceAnalyticsComponent implements OnInit, OnChanges {
  @Input() data: PerformanceGlobale | null = null;

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

  // Filtres pour les alertes
  selectedAlertType: string = 'all';
  selectedPriority: string = 'all';
  alertTypes = ['all', 'error', 'warning', 'info'];
  priorities = ['all', 'haute', 'moyenne', 'basse'];

  // Filtres pour les recommandations
  selectedImpact: string = 'all';
  selectedEffort: string = 'all';
  impacts = ['all', 'haute', 'moyenne', 'basse'];
  efforts = ['all', 'eleve', 'moyen', 'faible'];

  // Données filtrées
  filteredAlertes: Alerte[] = [];
  filteredRecommandations: Recommandation[] = [];

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

    this.prepareChartData();
    this.applyFilters();
  }

  private prepareChartData(): void {
    if (!this.data) return;

    // Graphique radar des indicateurs de performance
    this.chartData.performanceRadar = {
      labels: this.data.indicateurs?.map(ind => ind.nom) || [],
      datasets: [
        {
          label: 'Performance Actuelle',
          data: this.data.indicateurs?.map(ind => (ind.valeur / ind.objectif) * 100) || [],
          backgroundColor: 'rgba(25, 118, 210, 0.2)',
          borderColor: '#1976d2',
          borderWidth: 2,
          pointBackgroundColor: '#1976d2',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#1976d2'
        },
        {
          label: 'Objectif',
          data: this.data.indicateurs?.map(() => 100) || [],
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderColor: '#4caf50',
          borderWidth: 1,
          pointBackgroundColor: '#4caf50',
          pointBorderColor: '#fff'
        }
      ]
    };

    // Graphique en barres des indicateurs
    this.chartData.indicateursBar = {
      labels: this.data.indicateurs?.map(ind => ind.nom) || [],
      datasets: [
        {
          label: 'Valeur Actuelle',
          data: this.data.indicateurs?.map(ind => ind.valeur) || [],
          backgroundColor: 'rgba(25, 118, 210, 0.6)',
          borderColor: '#1976d2',
          borderWidth: 1
        },
        {
          label: 'Objectif',
          data: this.data.indicateurs?.map(ind => ind.objectif) || [],
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: '#4caf50',
          borderWidth: 1
        }
      ]
    };

    // Graphique de répartition des alertes
    const alertesByType = this.groupAlertsByType();
    this.chartData.alertesRepartition = {
      labels: Object.keys(alertesByType),
      datasets: [
        {
          data: Object.values(alertesByType),
          backgroundColor: ['#f44336', '#ff9800', '#2196f3'],
          borderWidth: 1
        }
      ]
    };

    // Graphique de répartition des recommandations par impact
    const recsByImpact = this.groupRecommendationsByImpact();
    this.chartData.recommendationsImpact = {
      labels: Object.keys(recsByImpact),
      datasets: [
        {
          data: Object.values(recsByImpact),
          backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
          borderWidth: 1
        }
      ]
    };
  }

  private groupAlertsByType(): { [key: string]: number } {
    const grouped: { [key: string]: number } = { error: 0, warning: 0, info: 0 };
    
    this.data?.alertes?.forEach(alerte => {
      grouped[alerte.type] = (grouped[alerte.type] || 0) + 1;
    });
    
    return grouped;
  }

  private groupRecommendationsByImpact(): { [key: string]: number } {
    const grouped: { [key: string]: number } = { haute: 0, moyenne: 0, basse: 0 };
    
    this.data?.recommandations?.forEach(rec => {
      grouped[rec.impact] = (grouped[rec.impact] || 0) + 1;
    });
    
    return grouped;
  }

  // Filtrage des données
  applyFilters(): void {
    if (!this.data) return;

    // Filtrer les alertes
    this.filteredAlertes = this.data.alertes?.filter(alerte => {
      const typeMatch = this.selectedAlertType === 'all' || alerte.type === this.selectedAlertType;
      const priorityMatch = this.selectedPriority === 'all' || alerte.priorite === this.selectedPriority;
      return typeMatch && priorityMatch;
    }) || [];

    // Filtrer les recommandations
    this.filteredRecommandations = this.data.recommandations?.filter(rec => {
      const impactMatch = this.selectedImpact === 'all' || rec.impact === this.selectedImpact;
      const effortMatch = this.selectedEffort === 'all' || rec.effort === this.selectedEffort;
      return impactMatch && effortMatch;
    }) || [];
  }

  onAlertFilterChange(): void {
    this.applyFilters();
  }

  onRecommendationFilterChange(): void {
    this.applyFilters();
  }

  // Méthodes utilitaires
  getScoreColor(score: number): string {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  }

  getScoreIcon(score: number): string {
    if (score >= 80) return 'sentiment_very_satisfied';
    if (score >= 60) return 'sentiment_satisfied';
    return 'sentiment_dissatisfied';
  }

  getIndicatorProgress(indicateur: IndicateurPerformance): number {
    return Math.min(100, (indicateur.valeur / indicateur.objectif) * 100);
  }

  getIndicatorColor(indicateur: IndicateurPerformance): string {
    const progress = this.getIndicatorProgress(indicateur);
    if (progress >= 90) return 'success';
    if (progress >= 70) return 'primary';
    if (progress >= 50) return 'accent';
    return 'warn';
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  getAlertColor(type: string): string {
    switch (type) {
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'primary';
    }
  }

  getPriorityColor(priorite: string): string {
    switch (priorite) {
      case 'haute': return 'danger';
      case 'moyenne': return 'warning';
      case 'basse': return 'success';
      default: return 'primary';
    }
  }

  getImpactColor(impact: string): string {
    switch (impact) {
      case 'haute': return 'success';
      case 'moyenne': return 'warning';
      case 'basse': return 'info';
      default: return 'primary';
    }
  }

  getEffortColor(effort: string): string {
    switch (effort) {
      case 'faible': return 'success';
      case 'moyen': return 'warning';
      case 'eleve': return 'danger';
      default: return 'primary';
    }
  }

  getTrendIcon(tendance: string): string {
    switch (tendance) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      case 'stable': return 'trending_flat';
      default: return 'trending_flat';
    }
  }

  getTrendColor(tendance: string): string {
    switch (tendance) {
      case 'up': return 'success';
      case 'down': return 'danger';
      case 'stable': return 'primary';
      default: return 'primary';
    }
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

  // Actions
  dismissAlert(alerte: Alerte): void {
    console.log('Ignorer alerte:', alerte);
    // Implémentation pour ignorer l'alerte
  }

  implementRecommendation(recommandation: Recommandation): void {
    console.log('Implémenter recommandation:', recommandation);
    // Implémentation pour marquer la recommandation comme implémentée
  }

  exportPerformanceReport(): void {
    console.log('Export rapport de performance');
    // Implémentation pour exporter le rapport
  }
}
