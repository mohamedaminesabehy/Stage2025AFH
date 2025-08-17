import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, forkJoin, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environnement';
import { MockDataService } from './mock-data.service';
import {
  StatistiquesGlobales,
  StatistiquesFournisseurs,
  StatistiquesMarches,
  StatistiquesArticles,
  StatistiquesGaranties,
  StatistiquesPenalites,
  FiltresStatistiques,
  TauxChange,
  IndicateurEconomique,
  DonneesMeteo
} from 'src/app/model/statistiques';

@Injectable({
  providedIn: 'root'
})
export class StatistiquesService {
  private apiUrl = environment.apiUrl;
  private statistiquesSubject = new BehaviorSubject<StatistiquesGlobales | null>(null);
  public statistiques$ = this.statistiquesSubject.asObservable();

  // APIs externes
  private exchangeRateApiUrl = 'https://api.exchangerate-api.com/v4/latest';
  private weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private weatherApiKey = 'YOUR_WEATHER_API_KEY'; // À remplacer par votre clé API

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) {}

  /**
   * Récupère toutes les statistiques globales
   */
  getStatistiquesGlobales(filtres?: FiltresStatistiques): Observable<StatistiquesGlobales> {
    const params = this.buildHttpParams(filtres);

    return forkJoin({
      fournisseurs: this.getStatistiquesFournisseurs(params),
      marches: this.getStatistiquesMarches(params),
      articles: this.getStatistiquesArticles(params),
      tendances: this.getTendancesGlobales(params),
      performance: this.getPerformanceGlobale(params)
    }).pipe(
      map(data => ({
        fournisseurs: data.fournisseurs,
        marches: data.marches,
        articles: data.articles,
        tendances: data.tendances,
        performance: data.performance
      })),
      tap(statistiques => this.statistiquesSubject.next(statistiques)),
      catchError(error => {
        console.error('Erreur lors du chargement des statistiques:', error);
        // En cas d'erreur, utiliser les données de démonstration
        return this.mockDataService.getMockStatistiquesGlobales();
      })
    );
  }

  /**
   * Récupère les données détaillées des fournisseurs pour le composant statistiques-periodes
   */
  getFournisseursDetailles(filtres?: any): Observable<any> {
    let params = new HttpParams();
    if (filtres) {
      if (filtres.numStruct) params = params.set('numStruct', filtres.numStruct);
      if (filtres.page !== undefined) params = params.set('page', filtres.page.toString());
      if (filtres.size !== undefined) params = params.set('size', filtres.size.toString());
      if (filtres.filterName) params = params.set('filterName', filtres.filterName);
      if (filtres.filterMinAmount) params = params.set('filterMinAmount', filtres.filterMinAmount.toString());
      if (filtres.filterHasPenalites !== undefined) params = params.set('filterHasPenalites', filtres.filterHasPenalites.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/statistiques/fournisseurs`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des fournisseurs détaillés:', error);
        return of({
          fournisseurs: [
            { designation: 'STE BOUZGUENDA', numero: '0003100RAM000', nombreMarches: 3, montantTotal: 850000, penalites: 0 },
            { designation: 'KBS CONSULTING', numero: '1687260Q', nombreMarches: 1, montantTotal: 120000, penalites: 5000 }
          ],
          totalElements: 2
        });
      })
    );
 }

 /**
  * Récupère les données détaillées des marchés pour le composant statistiques-periodes
  */
 getMarchesDetailles(filtres?: any): Observable<any> {
   let params = new HttpParams();
   if (filtres) {
     if (filtres.numStruct) params = params.set('numStruct', filtres.numStruct);
     if (filtres.page !== undefined) params = params.set('page', filtres.page.toString());
     if (filtres.size !== undefined) params = params.set('size', filtres.size.toString());
     if (filtres.filterName) params = params.set('filterName', filtres.filterName);
     if (filtres.filterMinAmount) params = params.set('filterMinAmount', filtres.filterMinAmount.toString());
   }

   return this.http.get<any>(`${this.apiUrl}/statistiques/marches-detailles`, { params }).pipe(
     catchError(error => {
       console.error('Erreur lors de la récupération des marchés détaillés:', error);
       return of({
         marches: [
           { numMarche: 1, designation: 'Marché test 1', montant: 100000, date: new Date(), numFourn: 'TEST001', fournisseur: 'FOURNISSEUR TEST 1', banque: 'Banque test 1' },
           { numMarche: 2, designation: 'Marché test 2', montant: 200000, date: new Date(), numFourn: 'TEST002', fournisseur: 'FOURNISSEUR TEST 2', banque: 'Banque test 2' }
         ],
         totalElements: 2
       });
     })
   );
 }

  /**
   * Récupère les fournisseurs qui ont des marchés
   */
  getFournisseursAvecMarches(filtres?: { numStruct?: string; page?: number; size?: number; filterName?: string }): Observable<any> {
    let params = new HttpParams();
    if (filtres) {
      if (filtres.numStruct) params = params.set('numStruct', filtres.numStruct);
      if (filtres.page !== undefined) params = params.set('page', filtres.page.toString());
      if (filtres.size !== undefined) params = params.set('size', filtres.size.toString());
      if (filtres.filterName) params = params.set('filterName', filtres.filterName);
    }

    return this.http.get<any>(`${this.apiUrl}/statistiques/fournisseurs-avec-marches`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des fournisseurs avec marchés:', error);
        return of({ fournisseurs: [], totalElements: 0 });
      })
    );
  }


 /**
  * Récupère les données détaillées des articles pour le composant statistiques-periodes
  */
  getArticlesDetailles(filtres?: any): Observable<any> {
    let params = new HttpParams();
    if (filtres) {
      if (filtres.numStruct) params = params.set('numStruct', filtres.numStruct);
      if (filtres.page !== undefined) params = params.set('page', filtres.page.toString());
      if (filtres.size !== undefined) params = params.set('size', filtres.size.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/statistiques/articles`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des articles détaillés:', error);
        return of({
          articles: [
            { designation: 'Travaux chambres à vanne béton', secteur: 'GAZ', quantite: 24, montant: 100000 },
            { designation: 'Tuyaux PEHD', secteur: 'EAU', quantite: 150, montant: 75000 }
          ],
          totalElements: 2
        });
      })
    );
  }

  /**
   * Récupère l'évolution des marchés par période pour le composant statistiques-periodes
   */
  getMarchesEvolutionPeriode(period: string = '12months', numStruct?: string): Observable<any> {
    let params = new HttpParams().set('period', period);
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<any>(`${this.apiUrl}/statistiques/marches-evolution`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de l\'évolution des marchés:', error);
        const months = period === '3months' ? 3 : period === '6months' ? 6 : 12;
        const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].slice(0, months);
        const data = Array.from({length: months}, () => Math.floor(Math.random() * 10) + 1);
        return of({ labels, data, period });
      })
    );
  }

  /**
   * Récupère la répartition des fournisseurs pour le composant statistiques-periodes
   */
  getFournisseursRepartitionPeriode(limit: number = 5, numStruct?: string): Observable<any> {
    let params = new HttpParams().set('limit', limit.toString());
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<any>(`${this.apiUrl}/statistiques/fournisseurs-repartition`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de la répartition des fournisseurs:', error);
        return of({
          labels: ['STE BOUZGUENDA', 'KBS CONSULTING', 'GEOMED', 'MEDIBAT', 'STT'],
          data: [3, 1, 2, 4, 1],
          colors: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6']
        });
      })
    );
  }

  /**
   * Récupère la répartition par région pour le composant statistiques-periodes
   */
  getRegionsRepartitionPeriode(numStruct?: string): Observable<any> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<any>(`${this.apiUrl}/statistiques/regions-repartition`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de la répartition par région:', error);
        return of({
          labels: ['Tunis', 'Sfax', 'Sousse', 'Gabès', 'Bizerte'],
          data: [5, 3, 2, 1, 2]
        });
      })
    );
  }

  /**
   * Récupère la répartition des articles par secteur pour le composant statistiques-periodes
   */
  getArticlesRepartitionPeriode(numStruct?: string): Observable<any> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<any>(`${this.apiUrl}/statistiques/articles-repartition`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de la répartition des articles:', error);
        return of({
          labels: ['GAZ', 'EAU', 'ÉLECTRICITÉ', 'TRAVAUX', 'SERVICES'],
          data: [45, 30, 15, 8, 2]
        });
      })
    );
  }

  /**
   * Récupère les statistiques des garanties pour le composant statistiques-periodes
   */
  getGarantiesStatistiquesPeriode(numStruct?: string): Observable<any> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<any>(`${this.apiUrl}/statistiques/garanties`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des statistiques de garanties:', error);
        return of({
          labels: ['Garantie bancaire', 'Chèque certifié', 'Cautions', 'Aucune'],
          data: [40, 30, 20, 10],
          colors: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12']
        });
      })
    );
  }

  /**
   * Récupère les métriques clés pour le composant statistiques-periodes
   */
  getMetriquesClés(numStruct?: string): Observable<any> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<any>(`${this.apiUrl}/statistiques/metriques`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des métriques clés:', error);
        return of({
          marchesActifs: 45,
          fournisseurs: 12,
          articles: 58,
          valeurTotale: 2500,
          tendanceMarchés: 12.5,
          tendanceFournisseurs: 8.3,
          tendanceArticles: 0.0,
          tendanceValeur: 15.7
        });
      })
    );
  }

  /**
   * Statistiques des fournisseurs
   */
  getStatistiquesFournisseurs(params?: HttpParams): Observable<StatistiquesFournisseurs> {
    return this.http.get<StatistiquesFournisseurs>(`${this.apiUrl}/statistiques/fournisseurs`, { params });
  }

  /**
   * Statistiques des marchés
   */
  getStatistiquesMarches(params?: HttpParams): Observable<StatistiquesMarches> {
    return this.http.get<StatistiquesMarches>(`${this.apiUrl}/statistiques/marches`, { params });
  }

  /**
   * Statistiques des articles
   */
  getStatistiquesArticles(params?: HttpParams): Observable<StatistiquesArticles> {
    return this.http.get<StatistiquesArticles>(`${this.apiUrl}/statistiques/articles`, { params });
  }

  /**
   * Statistiques des garanties
   */
  getStatistiquesGaranties(params?: HttpParams): Observable<StatistiquesGaranties> {
    return this.http.get<StatistiquesGaranties>(`${this.apiUrl}/statistiques/garanties`, { params });
  }

  /**
   * Statistiques des pénalités
   */
  getStatistiquesPenalites(params?: HttpParams): Observable<StatistiquesPenalites> {
    return this.http.get<StatistiquesPenalites>(`${this.apiUrl}/statistiques/penalites`, { params });
  }

  /**
   * Tendances globales
   */
  getTendancesGlobales(params?: HttpParams): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistiques/tendances`, { params });
  }

  /**
   * Performance globale
   */
  getPerformanceGlobale(params?: HttpParams): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistiques/performance`, { params });
  }

  /**
   * APIs externes - Taux de change
   */
  getTauxChange(devise: string = 'USD'): Observable<TauxChange[]> {
    return this.http.get<any>(`${this.exchangeRateApiUrl}/${devise}`).pipe(
      map(response => {
        const taux: TauxChange[] = [];
        Object.keys(response.rates).forEach(key => {
          if (['EUR', 'TND', 'USD', 'GBP'].includes(key)) {
            taux.push({
              devise: key,
              taux: response.rates[key],
              variation: Math.random() * 2 - 1, // Simulation de variation
              date: new Date(response.date)
            });
          }
        });
        return taux;
      }),
      catchError(error => {
        console.error('Erreur API taux de change:', error);
        return this.getMockTauxChange();
      })
    );
  }

  /**
   * APIs externes - Données météo
   */
  getDonneesMeteo(ville: string = 'Tunis'): Observable<DonneesMeteo> {
    const params = new HttpParams()
      .set('q', ville)
      .set('appid', this.weatherApiKey)
      .set('units', 'metric')
      .set('lang', 'fr');

    return this.http.get<any>(`${this.weatherApiUrl}`, { params }).pipe(
      map(response => ({
        ville: response.name,
        temperature: Math.round(response.main.temp),
        humidite: response.main.humidity,
        description: response.weather[0].description,
        icone: response.weather[0].icon
      })),
      catchError(error => {
        console.error('Erreur API météo:', error);
        return this.getMockDonneesMeteo();
      })
    );
  }

  /**
   * Export des données
   */
  exporterDonnees(format: 'pdf' | 'excel' | 'csv', filtres?: FiltresStatistiques): Observable<Blob> {
    const params = this.buildHttpParams(filtres);
    params.set('format', format);

    return this.http.get(`${this.apiUrl}/statistiques/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Notifications en temps réel
   */
  getNotificationsTempsReel(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistiques/notifications`);
  }

  /**
   * Utilitaires privées
   */
  private buildHttpParams(filtres?: FiltresStatistiques): HttpParams {
    let params = new HttpParams();

    if (filtres) {
      if (filtres.dateDebut) {
        params = params.set('dateDebut', filtres.dateDebut.toISOString());
      }
      if (filtres.dateFin) {
        params = params.set('dateFin', filtres.dateFin.toISOString());
      }
      if (filtres.fournisseurs && filtres.fournisseurs.length > 0) {
        params = params.set('fournisseurs', filtres.fournisseurs.join(','));
      }
      if (filtres.typesMarche && filtres.typesMarche.length > 0) {
        params = params.set('typesMarche', filtres.typesMarche.join(','));
      }
      if (filtres.structures && filtres.structures.length > 0) {
        params = params.set('structures', filtres.structures.join(','));
      }
      if (filtres.montantMin !== undefined) {
        params = params.set('montantMin', filtres.montantMin.toString());
      }
      if (filtres.montantMax !== undefined) {
        params = params.set('montantMax', filtres.montantMax.toString());
      }
    }

    return params;
  }

  private getMockTauxChange(): Observable<TauxChange[]> {
    const mockData: TauxChange[] = [
      { devise: 'EUR', taux: 0.85, variation: 0.02, date: new Date() },
      { devise: 'TND', taux: 3.1, variation: -0.01, date: new Date() },
      { devise: 'USD', taux: 1.0, variation: 0.0, date: new Date() },
      { devise: 'GBP', taux: 0.73, variation: 0.015, date: new Date() }
    ];
    return new Observable(observer => {
      observer.next(mockData);
      observer.complete();
    });
  }

  private getMockDonneesMeteo(): Observable<DonneesMeteo> {
    const mockData: DonneesMeteo = {
      ville: 'Tunis',
      temperature: 22,
      humidite: 65,
      description: 'Ensoleillé',
      icone: '01d'
    };
    return new Observable(observer => {
      observer.next(mockData);
      observer.complete();
    });
  }
}
