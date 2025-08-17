import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environnement';
import {
  StatistiquesArticlesComplet,
  StatistiquesFournisseursComplet,
  ToutesStatistiquesGenerales,
  MetriquesGlobales,
  ChartDataStatistiques,
  FiltresStatistiques,
  OptionsExport,
  WidgetStatistique,
  AlerteStatistique
} from '../../model/statistiques-completes';

@Injectable({
  providedIn: 'root'
})
export class StatistiquesCompletesService {
  private apiUrl = `${environment.apiUrl}/statistiques`;
  
  // BehaviorSubjects pour le cache des données
  private articlesSubject = new BehaviorSubject<StatistiquesArticlesComplet | null>(null);
  private fournisseursSubject = new BehaviorSubject<StatistiquesFournisseursComplet | null>(null);
  private metriquesSubject = new BehaviorSubject<MetriquesGlobales | null>(null);
  private alertesSubject = new BehaviorSubject<AlerteStatistique[]>([]);

  // Observables publics
  public articles$ = this.articlesSubject.asObservable();
  public fournisseurs$ = this.fournisseursSubject.asObservable();
  public metriques$ = this.metriquesSubject.asObservable();
  public alertes$ = this.alertesSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Récupère les statistiques complètes des articles
   */
  getStatistiquesArticles(numStruct?: string): Observable<StatistiquesArticlesComplet> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<StatistiquesArticlesComplet>(`${this.apiUrl}/articles-complet`, { params }).pipe(
      tap(data => this.articlesSubject.next(data)),
      catchError(error => {
        console.error('Erreur lors de la récupération des statistiques articles:', error);
        return of(this.getDefaultArticlesData());
      })
    );
  }

  /**
   * Récupère les statistiques complètes des fournisseurs
   */
  getStatistiquesFournisseurs(numStruct?: string): Observable<StatistiquesFournisseursComplet> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<StatistiquesFournisseursComplet>(`${this.apiUrl}/fournisseurs-complet`, { params }).pipe(
      tap(data => this.fournisseursSubject.next(data)),
      catchError(error => {
        console.error('Erreur lors de la récupération des statistiques fournisseurs:', error);
        return of(this.getDefaultFournisseursData());
      })
    );
  }



  /**
   * Récupère toutes les statistiques générales en une seule fois
   */
  getToutesStatistiques(numStruct?: string): Observable<ToutesStatistiquesGenerales> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<ToutesStatistiquesGenerales>(`${this.apiUrl}/generales`, { params }).pipe(
      tap(data => {
        this.articlesSubject.next(data.articles);
        this.fournisseursSubject.next(data.fournisseurs);
        this.metriquesSubject.next(data.metriquesGlobales);
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération de toutes les statistiques:', error);
        return of(this.getDefaultToutesStatistiques());
      })
    );
  }

  /**
   * Génère les données pour les graphiques Chart.js
   */
  generateChartData(data: any[], labelKey: string, dataKey: string, label: string): ChartDataStatistiques {
    return {
      labels: data.map(item => item[labelKey]),
      datasets: [{
        label: label,
        data: data.map(item => item[dataKey]),
        backgroundColor: [
          'rgba(52, 152, 219, 0.7)',
          'rgba(46, 204, 113, 0.7)',
          'rgba(155, 89, 182, 0.7)',
          'rgba(241, 196, 15, 0.7)',
          'rgba(231, 76, 60, 0.7)',
          'rgba(26, 188, 156, 0.7)',
          'rgba(230, 126, 34, 0.7)',
          'rgba(149, 165, 166, 0.7)'
        ],
        borderColor: [
          'rgba(52, 152, 219, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(155, 89, 182, 1)',
          'rgba(241, 196, 15, 1)',
          'rgba(231, 76, 60, 1)',
          'rgba(26, 188, 156, 1)',
          'rgba(230, 126, 34, 1)',
          'rgba(149, 165, 166, 1)'
        ],
        borderWidth: 1
      }]
    };
  }

  /**
   * Génère les widgets de statistiques
   */
  generateWidgets(statistiques: ToutesStatistiquesGenerales): WidgetStatistique[] {
    const widgets: WidgetStatistique[] = [];

    // Widget métriques globales
    widgets.push({
      id: 'metriques-globales',
      titre: 'Métriques Globales',
      type: 'metric',
      donnees: statistiques.metriquesGlobales
    });

    // Widget articles par secteur
    widgets.push({
      id: 'articles-secteur',
      titre: 'Articles par Secteur',
      type: 'chart',
      donnees: this.generateChartData(
        statistiques.articles.articlesBySecteur,
        'secteur',
        'nombre',
        'Nombre d\'articles'
      )
    });

    // Widget fournisseurs par région
    widgets.push({
      id: 'fournisseurs-region',
      titre: 'Fournisseurs par Région',
      type: 'chart',
      donnees: this.generateChartData(
        statistiques.fournisseurs.fournisseursByRegion,
        'region',
        'nombre',
        'Nombre de fournisseurs'
      )
    });

    return widgets;
  }

  /**
   * Exporte les données au format spécifié
   */
  exportData(options: OptionsExport, numStruct?: string): Observable<Blob> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }
    params = params.set('type', options.sections.join(','));

    const endpoint = options.format === 'pdf' ? '/export/pdf' : '/export/excel';
    
    return this.http.get(`${this.apiUrl}${endpoint}`, { 
      params, 
      responseType: 'blob' 
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'export:', error);
        return of(new Blob());
      })
    );
  }

  /**
   * Actualise toutes les données
   */
  refreshAllData(numStruct?: string): Observable<ToutesStatistiquesGenerales> {
    return this.getToutesStatistiques(numStruct);
  }

  // ========== MÉTHODES PRIVÉES POUR DONNÉES PAR DÉFAUT ==========

  private getDefaultArticlesData(): StatistiquesArticlesComplet {
    return {
      articlesBySecteur: [],
      articlesByFamille: [],
      articlesExtremes: [],
      distributionPrix: [],
      articlesStatut: { actif: 0, inactif: 0, obsolete: 0 },
      topArticles: [],
      uniteMesure: [],
      articlesSansMouvement: 0
    };
  }

  private getDefaultFournisseursData(): StatistiquesFournisseursComplet {
    return {
      fournisseursByRegion: [],
      fournisseursBySecteur: [],
      fournisseursStatut: { actif: 0, suspendu: 0, blackliste: 0 },
      fournisseursByType: [],
      topFournisseurs: [],
      fournisseursPenalites: { avecPenalites: 0, sansPenalites: 0 }
    };
  }


  private getDefaultToutesStatistiques(): ToutesStatistiquesGenerales {
    return {
      articles: this.getDefaultArticlesData(),
      fournisseurs: this.getDefaultFournisseursData(),
      metriquesGlobales: {
        totalArticles: 0,
        totalFournisseurs: 0
      }
    };
  }
}
