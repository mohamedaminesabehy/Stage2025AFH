import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environnement';
import {
  PenalitesData,
  GarantiesData,
  DecomptesData,
  EtapesData,
  SectoriellesData,
  DashboardWidgetsData,
  DashboardAlert,
  StatWidget
} from '../../model/dashboard-widgets';

@Injectable({
  providedIn: 'root'
})
export class DashboardWidgetsService {
  private apiUrl = `${environment.apiUrl}/dashboard`;
  
  // BehaviorSubjects pour le cache des données
  private penalitesSubject = new BehaviorSubject<PenalitesData | null>(null);
  private garantiesSubject = new BehaviorSubject<GarantiesData | null>(null);
  private decomptesSubject = new BehaviorSubject<DecomptesData | null>(null);
  private etapesSubject = new BehaviorSubject<EtapesData | null>(null);
  private sectoriellesSubject = new BehaviorSubject<SectoriellesData | null>(null);
  private alertesSubject = new BehaviorSubject<DashboardAlert[]>([]);

  // Observables publics
  public penalites$ = this.penalitesSubject.asObservable();
  public garanties$ = this.garantiesSubject.asObservable();
  public decomptes$ = this.decomptesSubject.asObservable();
  public etapes$ = this.etapesSubject.asObservable();
  public sectorielles$ = this.sectoriellesSubject.asObservable();
  public alertes$ = this.alertesSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Récupère les données des pénalités
   */
  getPenalitesData(numStruct?: string): Observable<PenalitesData> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<PenalitesData>(`${this.apiUrl}/penalites`, { params }).pipe(
      tap(data => this.penalitesSubject.next(data)),
      catchError(error => {
        console.error('Erreur lors de la récupération des données de pénalités:', error);
        const defaultData: PenalitesData = {
          penalitesEnCours: 0,
          montantTotalPenalites: 0,
          topMarchesAvecPenalites: [],
          penalitesParType: []
        };
        return of(defaultData);
      })
    );
  }

  /**
   * Récupère les données des garanties
   */
  getGarantiesData(numStruct?: string): Observable<GarantiesData> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<GarantiesData>(`${this.apiUrl}/garanties`, { params }).pipe(
      tap(data => this.garantiesSubject.next(data)),
      catchError(error => {
        console.error('Erreur lors de la récupération des données de garanties:', error);
        const defaultData: GarantiesData = {
          garantiesEcheance: 0,
          montantTotalGaranties: 0,
          repartitionParType: [],
          garantiesEcheanceList: []
        };
        return of(defaultData);
      })
    );
  }

  /**
   * Récupère les données des décomptes
   */
  getDecomptesData(numStruct?: string): Observable<DecomptesData> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<DecomptesData>(`${this.apiUrl}/decomptes`, { params }).pipe(
      tap(data => this.decomptesSubject.next(data)),
      catchError(error => {
        console.error('Erreur lors de la récupération des données de décomptes:', error);
        const defaultData: DecomptesData = {
          decomptesEnAttente: 0,
          evolutionPaiements: [],
          retardsPaiement: 0
        };
        return of(defaultData);
      })
    );
  }

  /**
   * Récupère les données des étapes
   */
  getEtapesData(numStruct?: string): Observable<EtapesData> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<EtapesData>(`${this.apiUrl}/etapes`, { params }).pipe(
      tap(data => this.etapesSubject.next(data)),
      catchError(error => {
        console.error('Erreur lors de la récupération des données d\'étapes:', error);
        const defaultData: EtapesData = {
          etapesEnRetard: 0,
          progressionGlobale: 0,
          alertesDelais: []
        };
        return of(defaultData);
      })
    );
  }

  /**
   * Récupère les données sectorielles
   */
  getSectoriellesData(numStruct?: string): Observable<SectoriellesData> {
    let params = new HttpParams();
    if (numStruct) {
      params = params.set('numStruct', numStruct);
    }

    return this.http.get<SectoriellesData>(`${this.apiUrl}/sectorielles`, { params }).pipe(
      tap(data => this.sectoriellesSubject.next(data)),
      catchError(error => {
        console.error('Erreur lors de la récupération des données sectorielles:', error);
        const defaultData: SectoriellesData = {
          repartitionParSecteur: [],
          performanceParFamille: [],
          evolutionPrix: []
        };
        return of(defaultData);
      })
    );
  }

  /**
   * Récupère toutes les données des widgets en une seule fois
   */
  getAllWidgetsData(numStruct?: string): Observable<DashboardWidgetsData> {
    return forkJoin({
      penalites: this.getPenalitesData(numStruct),
      garanties: this.getGarantiesData(numStruct),
      decomptes: this.getDecomptesData(numStruct),
      etapes: this.getEtapesData(numStruct),
      sectorielles: this.getSectoriellesData(numStruct)
    });
  }

  /**
   * Génère les alertes basées sur les données
   */
  generateAlertes(widgetsData: DashboardWidgetsData): DashboardAlert[] {
    const alertes: DashboardAlert[] = [];

    // Alertes pour les garanties arrivant à échéance
    if (widgetsData.garanties.garantiesEcheance > 0) {
      alertes.push({
        id: 'garanties-echeance',
        type: 'warning',
        title: 'Garanties arrivant à échéance',
        message: `${widgetsData.garanties.garantiesEcheance} garantie(s) arrivent à échéance dans les 30 prochains jours`,
        timestamp: new Date(),
        priority: 'high'
      });
    }

    // Alertes pour les étapes en retard
    if (widgetsData.etapes.etapesEnRetard > 0) {
      alertes.push({
        id: 'etapes-retard',
        type: 'error',
        title: 'Étapes en retard',
        message: `${widgetsData.etapes.etapesEnRetard} étape(s) sont en retard`,
        timestamp: new Date(),
        priority: 'high'
      });
    }

    // Alertes pour les décomptes en attente
    if (widgetsData.decomptes.decomptesEnAttente > 10) {
      alertes.push({
        id: 'decomptes-attente',
        type: 'warning',
        title: 'Décomptes en attente',
        message: `${widgetsData.decomptes.decomptesEnAttente} décompte(s) en attente de validation`,
        timestamp: new Date(),
        priority: 'medium'
      });
    }

    // Alertes pour les retards de paiement
    if (widgetsData.decomptes.retardsPaiement > 0) {
      alertes.push({
        id: 'retards-paiement',
        type: 'error',
        title: 'Retards de paiement',
        message: `${widgetsData.decomptes.retardsPaiement} paiement(s) en retard`,
        timestamp: new Date(),
        priority: 'high'
      });
    }

    this.alertesSubject.next(alertes);
    return alertes;
  }

  /**
   * Génère les widgets de statistiques
   */
  generateStatWidgets(widgetsData: DashboardWidgetsData): StatWidget[] {
    return [
      {
        title: 'Pénalités en cours',
        value: widgetsData.penalites.penalitesEnCours,
        icon: 'fas fa-exclamation-triangle',
        color: '#e74c3c'
      },
      {
        title: 'Garanties à échéance',
        value: widgetsData.garanties.garantiesEcheance,
        icon: 'fas fa-shield-alt',
        color: '#f39c12'
      },
      {
        title: 'Décomptes en attente',
        value: widgetsData.decomptes.decomptesEnAttente,
        icon: 'fas fa-clock',
        color: '#3498db'
      },
      {
        title: 'Étapes en retard',
        value: widgetsData.etapes.etapesEnRetard,
        icon: 'fas fa-tasks',
        color: '#e67e22'
      }
    ];
  }

  /**
   * Actualise toutes les données des widgets
   */
  refreshAllWidgets(numStruct?: string): Observable<DashboardWidgetsData> {
    return this.getAllWidgetsData(numStruct).pipe(
      tap(data => {
        // Générer les alertes automatiquement
        this.generateAlertes(data);
      })
    );
  }
}
