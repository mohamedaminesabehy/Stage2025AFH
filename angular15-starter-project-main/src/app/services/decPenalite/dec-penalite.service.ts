import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class DecPenaliteService {

  private apiUrl = `${environment.apiUrl}/DecPenalite`;
  private decPenalitesSubject = new BehaviorSubject<any[]>([]);
  decPenalites$ = this.decPenalitesSubject.asObservable();

  constructor(private http: HttpClient) { }

  getDecPenalite(numMarche: number, idTypePen: number, numPieceFourn: number) : Observable<any> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('idTypePen', idTypePen)
    .set('numPieceFourn', numPieceFourn);
  return this.http.get<any>(this.apiUrl, { params });
  }

  addDecPenalite(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`,data)
  }
}
