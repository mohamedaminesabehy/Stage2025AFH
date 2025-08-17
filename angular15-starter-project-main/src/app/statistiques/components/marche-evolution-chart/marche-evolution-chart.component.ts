import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { EvolutionMensuelle } from 'src/app/model/statistiques';

Chart.register(...registerables);

@Component({
  selector: 'app-marche-evolution-chart',
  template: `
    <div class="chart-wrapper">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styleUrls: ['./marche-evolution-chart.component.scss']
})
export class MarcheEvolutionChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: EvolutionMensuelle[] = [];
  @Input() options: any = {};
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart) {
      this.updateChart();
    }
  }

  private createChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartData = this.prepareChartData();

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Évolution des Montants des Marchés'
          },
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = new Intl.NumberFormat('fr-TN', {
                  style: 'currency',
                  currency: 'TND'
                }).format(context.parsed.y);
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Période'
            },
            grid: {
              display: false
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Montant (TND)'
            },
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('fr-TN', {
                  style: 'currency',
                  currency: 'TND',
                  notation: 'compact'
                }).format(value as number);
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        elements: {
          line: {
            tension: 0.4
          },
          point: {
            radius: 6,
            hoverRadius: 8
          }
        },
        ...this.options
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private prepareChartData(): any {
    const labels = this.data.map(item => item.mois);
    const values = this.data.map(item => item.valeur);
    const variations = this.data.map(item => item.variation);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Montant Total',
          data: values,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 3,
          fill: true,
          pointBackgroundColor: '#1976d2',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#1976d2',
          pointHoverBorderWidth: 3
        },
        {
          label: 'Variation',
          data: variations,
          borderColor: '#ff4081',
          backgroundColor: 'rgba(255, 64, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          pointBackgroundColor: '#ff4081',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    };
  }

  private updateChart(): void {
    if (!this.chart) return;

    const chartData = this.prepareChartData();
    this.chart.data = chartData;
    this.chart.update('active');
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
