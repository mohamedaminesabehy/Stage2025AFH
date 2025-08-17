import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrmLot } from 'src/app/model/prmlot';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class PrmlotService {
  private apiUrl = `${environment.apiUrl}/PrmLot`;
  private prmLotSubject = new BehaviorSubject<any[]>([]);
  prmLot$ = this.prmLotSubject.asObservable();

  constructor(private http: HttpClient) { }

  getPrmLots(): Observable<PrmLot[]> {
    return this.http.get<PrmLot[]>(`${this.apiUrl}`);
  }

  getPrmLotsByMatricule(matricule: number): Observable<PrmLot[]> {
    const params = new HttpParams().set('matricule', matricule);
    return this.http.get<PrmLot[]>(`${this.apiUrl}`, { params });
  }
}
