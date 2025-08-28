import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DecMntService {
  private apiUrl = `${environment.apiUrl}/decMnt`;
  private decMntSubject = new BehaviorSubject<any[]>([]);
  decMnt$ = this.decMntSubject.asObservable();
  constructor(private http: HttpClient) { }

  getDecMnt(numMarche: number, numPieceFourn: number) : Observable<any> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('numPieceFourn', numPieceFourn);
    return this.http.get<any[]>(`${this.apiUrl}`, { params });
  }

  updateDecMntOrd(numMarche: number, numPieceFourn: number, DecMntToUpdate: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updateDecMntOrd`,  DecMntToUpdate, {
      params: { numMarche: numMarche, numPieceFourn: numPieceFourn },
   });
  }

 getDecTravauxNetAvantRtnPrecedent(numMarche: number, numPieceFourn: number): Observable<any> {
  const params = new HttpParams()
  .set('numMarche', numMarche)
  .set('numPieceFourn', numPieceFourn);
  return this.http.get<any[]>(`${this.apiUrl}/getPreviousDecTravauxNetAvantRtn`, { params });
}
}
