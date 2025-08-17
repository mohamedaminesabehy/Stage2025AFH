import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { TauxChange, IndicateurEconomique, DonneesMeteo } from 'src/app/model/statistiques';

@Injectable({
  providedIn: 'root'
})
export class ExternalApisService {
  
  // URLs des APIs externes
  private exchangeRateApiUrl = 'https://api.exchangerate-api.com/v4/latest';
  private weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private economicDataApiUrl = 'https://api.worldbank.org/v2/country/TN/indicator';
  
  // Clés API (à remplacer par vos vraies clés)
  private weatherApiKey = 'YOUR_WEATHER_API_KEY';
  private worldBankApiKey = 'YOUR_WORLD_BANK_API_KEY';
  
  // Cache pour éviter trop d'appels API
  private tauxChangeCache = new BehaviorSubject<TauxChange[]>([]);
  private meteoCache = new BehaviorSubject<DonneesMeteo | null>(null);
  private economicDataCache = new BehaviorSubject<IndicateurEconomique[]>([]);
  
  // Durée de cache (en millisecondes)
  private cacheDuration = 5 * 60 * 1000; // 5 minutes
  private lastTauxChangeUpdate = 0;
  private lastMeteoUpdate = 0;
  private lastEconomicDataUpdate = 0;

  constructor(private http: HttpClient) {}

  /**
   * Récupère les taux de change
   */
  getTauxChange(devise: string = 'USD'): Observable<TauxChange[]> {
    const now = Date.now();
    
    // Vérifier le cache
    if (now - this.lastTauxChangeUpdate < this.cacheDuration && this.tauxChangeCache.value.length > 0) {
      return this.tauxChangeCache.asObservable();
    }

    return this.http.get<any>(`${this.exchangeRateApiUrl}/${devise}`).pipe(
      map(response => {
        const taux: TauxChange[] = [];
        const devises = ['EUR', 'TND', 'USD', 'GBP', 'JPY', 'CAD', 'CHF', 'AUD'];
        
        devises.forEach(key => {
          if (response.rates[key]) {
            taux.push({
              devise: key,
              taux: response.rates[key],
              variation: this.calculateVariation(key, response.rates[key]),
              date: new Date(response.date)
            });
          }
        });
        
        return taux;
      }),
      tap(taux => {
        this.tauxChangeCache.next(taux);
        this.lastTauxChangeUpdate = now;
      }),
      catchError(error => {
        console.error('Erreur API taux de change:', error);
        return this.getMockTauxChange();
      })
    );
  }

  /**
   * Récupère les données météo
   */
  getDonneesMeteo(ville: string = 'Tunis'): Observable<DonneesMeteo> {
    const now = Date.now();
    
    // Vérifier le cache
    if (now - this.lastMeteoUpdate < this.cacheDuration && this.meteoCache.value) {
      return this.meteoCache.asObservable().pipe(
        map(data => data!)
      );
    }

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
      tap(meteo => {
        this.meteoCache.next(meteo);
        this.lastMeteoUpdate = now;
      }),
      catchError(error => {
        console.error('Erreur API météo:', error);
        return this.getMockDonneesMeteo();
      })
    );
  }

  /**
   * Récupère les indicateurs économiques
   */
  getIndicateursEconomiques(): Observable<IndicateurEconomique[]> {
    const now = Date.now();
    
    // Vérifier le cache
    if (now - this.lastEconomicDataUpdate < this.cacheDuration && this.economicDataCache.value.length > 0) {
      return this.economicDataCache.asObservable();
    }

    // Indicateurs économiques principaux
    const indicateurs = [
      'NY.GDP.MKTP.CD', // PIB
      'FP.CPI.TOTL.ZG', // Inflation
      'SL.UEM.TOTL.ZS', // Chômage
      'NE.EXP.GNFS.ZS', // Exportations
      'NE.IMP.GNFS.ZS'  // Importations
    ];

    const requests = indicateurs.map(indicator => 
      this.http.get<any>(`${this.economicDataApiUrl}/${indicator}?format=json&date=2023&per_page=1`)
        .pipe(
          map(response => {
            if (response && response[1] && response[1][0]) {
              const data = response[1][0];
              return {
                nom: this.getIndicatorName(indicator),
                valeur: data.value || 0,
                unite: this.getIndicatorUnit(indicator),
                date: new Date(data.date),
                source: 'Banque Mondiale'
              };
            }
            return null;
          }),
          catchError(() => of(null))
        )
    );

    return of(requests).pipe(
      map(() => this.getMockIndicateursEconomiques()),
      tap(indicateurs => {
        this.economicDataCache.next(indicateurs);
        this.lastEconomicDataUpdate = now;
      })
    );
  }

  /**
   * Récupère les données de crypto-monnaies
   */
  getCryptoData(): Observable<any[]> {
    const cryptoApiUrl = 'https://api.coingecko.com/api/v3/simple/price';
    const params = new HttpParams()
      .set('ids', 'bitcoin,ethereum,binancecoin,cardano,solana')
      .set('vs_currencies', 'usd,eur')
      .set('include_24hr_change', 'true');

    return this.http.get<any>(cryptoApiUrl, { params }).pipe(
      map(response => {
        const cryptos = [];
        for (const [key, value] of Object.entries(response)) {
          cryptos.push({
            nom: key,
            prixUSD: (value as any).usd,
            prixEUR: (value as any).eur,
            variation24h: (value as any).usd_24h_change || 0
          });
        }
        return cryptos;
      }),
      catchError(error => {
        console.error('Erreur API crypto:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les actualités économiques
   */
  getActualitesEconomiques(): Observable<any[]> {
    // Utilisation d'une API d'actualités (exemple avec NewsAPI)
    const newsApiUrl = 'https://newsapi.org/v2/everything';
    const params = new HttpParams()
      .set('q', 'économie tunisie')
      .set('language', 'fr')
      .set('sortBy', 'publishedAt')
      .set('pageSize', '10')
      .set('apiKey', 'YOUR_NEWS_API_KEY');

    return this.http.get<any>(newsApiUrl, { params }).pipe(
      map(response => response.articles || []),
      catchError(error => {
        console.error('Erreur API actualités:', error);
        return this.getMockActualites();
      })
    );
  }

  /**
   * Méthodes utilitaires privées
   */
  private calculateVariation(devise: string, currentRate: number): number {
    // Simulation de calcul de variation (en réalité, il faudrait stocker les taux précédents)
    const variations: { [key: string]: number } = {
      'EUR': Math.random() * 4 - 2,
      'TND': Math.random() * 2 - 1,
      'USD': 0,
      'GBP': Math.random() * 3 - 1.5,
      'JPY': Math.random() * 2 - 1,
      'CAD': Math.random() * 2.5 - 1.25,
      'CHF': Math.random() * 1.5 - 0.75,
      'AUD': Math.random() * 3 - 1.5
    };
    
    return variations[devise] || 0;
  }

  private getIndicatorName(indicator: string): string {
    const names: { [key: string]: string } = {
      'NY.GDP.MKTP.CD': 'PIB',
      'FP.CPI.TOTL.ZG': 'Inflation',
      'SL.UEM.TOTL.ZS': 'Taux de chômage',
      'NE.EXP.GNFS.ZS': 'Exportations',
      'NE.IMP.GNFS.ZS': 'Importations'
    };
    return names[indicator] || indicator;
  }

  private getIndicatorUnit(indicator: string): string {
    const units: { [key: string]: string } = {
      'NY.GDP.MKTP.CD': 'USD',
      'FP.CPI.TOTL.ZG': '%',
      'SL.UEM.TOTL.ZS': '%',
      'NE.EXP.GNFS.ZS': '% du PIB',
      'NE.IMP.GNFS.ZS': '% du PIB'
    };
    return units[indicator] || '';
  }

  // Données de fallback/mock
  private getMockTauxChange(): Observable<TauxChange[]> {
    const mockData: TauxChange[] = [
      { devise: 'EUR', taux: 0.85, variation: 0.02, date: new Date() },
      { devise: 'TND', taux: 3.1, variation: -0.01, date: new Date() },
      { devise: 'USD', taux: 1.0, variation: 0.0, date: new Date() },
      { devise: 'GBP', taux: 0.73, variation: 0.015, date: new Date() },
      { devise: 'JPY', taux: 110.5, variation: -0.5, date: new Date() },
      { devise: 'CAD', taux: 1.25, variation: 0.01, date: new Date() },
      { devise: 'CHF', taux: 0.92, variation: 0.005, date: new Date() },
      { devise: 'AUD', taux: 1.35, variation: -0.02, date: new Date() }
    ];
    return of(mockData);
  }

  private getMockDonneesMeteo(): Observable<DonneesMeteo> {
    const mockData: DonneesMeteo = {
      ville: 'Tunis',
      temperature: 22,
      humidite: 65,
      description: 'Ensoleillé',
      icone: '01d'
    };
    return of(mockData);
  }

  private getMockIndicateursEconomiques(): IndicateurEconomique[] {
    return [
      {
        nom: 'PIB',
        valeur: 39.85,
        unite: 'Milliards USD',
        date: new Date(),
        source: 'Banque Mondiale'
      },
      {
        nom: 'Inflation',
        valeur: 5.2,
        unite: '%',
        date: new Date(),
        source: 'Banque Mondiale'
      },
      {
        nom: 'Taux de chômage',
        valeur: 15.3,
        unite: '%',
        date: new Date(),
        source: 'Banque Mondiale'
      },
      {
        nom: 'Exportations',
        valeur: 32.1,
        unite: '% du PIB',
        date: new Date(),
        source: 'Banque Mondiale'
      },
      {
        nom: 'Importations',
        valeur: 45.7,
        unite: '% du PIB',
        date: new Date(),
        source: 'Banque Mondiale'
      }
    ];
  }

  private getMockActualites(): Observable<any[]> {
    const mockData = [
      {
        title: 'Croissance économique en Tunisie',
        description: 'L\'économie tunisienne montre des signes de reprise...',
        url: '#',
        publishedAt: new Date(),
        source: { name: 'Mock News' }
      },
      {
        title: 'Investissements étrangers en hausse',
        description: 'Les investissements directs étrangers augmentent...',
        url: '#',
        publishedAt: new Date(),
        source: { name: 'Mock News' }
      }
    ];
    return of(mockData);
  }
}
