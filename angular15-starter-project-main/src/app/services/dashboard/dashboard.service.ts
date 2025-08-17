import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environnement';

export interface DashboardStats {
  fournisseursCount: number;
  articlesCount: number;
  marchesCount: number;
  lastUpdate: string;
  apiStatus: string;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface SystemStatus {
  apiStatus: string;
  lastUpdate: string;
  performance: number;
  performanceTrend: number;
}

export interface Activity {
  message: string;
  type: string;
  time: string;
  user: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;
  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Récupère les statistiques globales du dashboard
   */
  getDashboardStats(numStruct?: string): Observable<DashboardStats> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { params }).pipe(
      tap(stats => this.statsSubject.next(stats)),
      catchError(error => {
        console.error('Erreur lors de la récupération des statistiques:', error);
        // Données par défaut en cas d'erreur
        const defaultStats: DashboardStats = {
          fournisseursCount: 12,
          articlesCount: 58,
          marchesCount: 9,
          lastUpdate: new Date().toISOString(),
          apiStatus: 'error'
        };
        return of(defaultStats);
      })
    );
  }

  /**
   * Récupère les données d'évolution des marchés
   */
  getMarchesEvolution(numStruct?: string, months: number = 12): Observable<ChartData> {
    let params = new HttpParams().set('months', months.toString());
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<ChartData>(`${this.apiUrl}/marches-evolution`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de l\'évolution des marchés:', error);
        // Données par défaut
        return of({
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
          data: [2, 3, 1, 4, 2, 5]
        });
      })
    );
  }

  /**
   * Récupère les top fournisseurs
   */
  getTopFournisseurs(numStruct?: string, limit: number = 5): Observable<ChartData> {
    let params = new HttpParams().set('limit', limit.toString());
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<ChartData>(`${this.apiUrl}/top-fournisseurs`, { params }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des top fournisseurs:', error);
        // Données par défaut
        return of({
          labels: ['STEG', 'GEOMED', 'MEDIBAT', 'STT', 'EL OUKHOUA'],
          data: [3, 2, 1, 1, 1]
        });
      })
    );
  }

  /**
   * Récupère les activités récentes
   */
  getRecentActivities(numStruct?: string, limit: number = 10): Observable<Activity[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<{activities: Activity[]}>(`${this.apiUrl}/recent-activities`, { params }).pipe(
      map(response => response.activities),
      catchError(error => {
        console.error('Erreur lors de la récupération des activités récentes:', error);
        // Données par défaut
        return of([
          { time: '10:15', message: 'Marché "M123" ajouté', type: 'add', user: 'Ahmed' },
          { time: '09:45', message: 'Article "A58" modifié', type: 'edit', user: 'Sonia' },
          { time: 'Hier', message: 'Fournisseur "ABC" enregistré', type: 'add', user: 'Mohamed' },
          { time: 'Hier', message: 'Pénalité appliquée à "M122"', type: 'alert', user: 'Leila' },
          { time: '22/05', message: 'Décompte validé pour "M120"', type: 'success', user: 'Karim' }
        ]);
      })
    );
  }

  /**
   * Récupère le statut du système
   */
  getSystemStatus(): Observable<SystemStatus> {
    return this.http.get<SystemStatus>(`${this.apiUrl}/system-status`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération du statut système:', error);
        // Données par défaut
        return of({
          apiStatus: 'error',
          lastUpdate: new Date().toISOString(),
          performance: 92,
          performanceTrend: 3.7
        });
      })
    );
  }

  /**
   * Actualise toutes les données du dashboard
   */
  refreshAllData(numStruct?: string): Observable<any> {
    return forkJoin({
      stats: this.getDashboardStats(numStruct),
      evolution: this.getMarchesEvolution(numStruct),
      topFournisseurs: this.getTopFournisseurs(numStruct),
      activities: this.getRecentActivities(numStruct),
      systemStatus: this.getSystemStatus()
    });
  }
}
