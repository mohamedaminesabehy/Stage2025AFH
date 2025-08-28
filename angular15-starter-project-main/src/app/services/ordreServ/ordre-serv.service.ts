import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class OrdreServService {
  private apiUrl = `${environment.apiUrl}/OrdreService`;
  private ordreServiceSubject = new BehaviorSubject<any[]>([]);
  ordreService$ = this.ordreServiceSubject.asObservable();

  constructor(private http: HttpClient) { }

  getOrdreServices(numMarche: number, numEtape: number) : Observable<any>{
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('numEtape', numEtape);
    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  saveOrUpdateOrdreService(ordreServices: any[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}`, ordreServices);
  }

  deleteOrdreService(numMarche: number, numEtape: number, numOs: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${numMarche}/${numEtape}/${numOs}`);
  }


}
