import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class DecLotServiceService {
  private apiUrl = `${environment.apiUrl}/decLot`;
  private decLotSubject = new BehaviorSubject<any[]>([]);
  decLot$ = this.decLotSubject.asObservable();
  constructor(private http: HttpClient) { }

  getDecLot(numMarche: number, numPieceFourn: number, idLot: string) : Observable<any> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('numPieceFourn', numPieceFourn)
    .set('idLot', idLot);
    return this.http.get<any[]>(`${this.apiUrl}`, { params });
  }
}
