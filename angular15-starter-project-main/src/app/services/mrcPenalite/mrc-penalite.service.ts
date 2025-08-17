import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class MrcPenaliteService {
  private apiUrl = `${environment.apiUrl}/MrcPenalite`;
  private mrcPenalitesSubject = new BehaviorSubject<any[]>([]);
  mrcPenalites$ = this.mrcPenalitesSubject.asObservable();

  constructor(private http: HttpClient) { }

  addMrcPenalite(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`,data)
  }

  getMrcPenalite(numMarche: number, numPen: number, numPieceFourn: number) : Observable<any> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('numPen', numPen)
    .set('numPieceFourn', numPieceFourn);
  return this.http.get<any>(this.apiUrl, { params });
  }

  getNumPen(numMarche: number): Observable <any> {
    const url = `${this.apiUrl}/numPen/${numMarche}`;
    return this.http.get<any>(url);
  }
}
