import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class DecompteArticleService {

  private apiUrl = `${environment.apiUrl}/decArticles`;
  private decompteArticlesSubject = new BehaviorSubject<any[]>([]);
  decompteArticles$ = this.decompteArticlesSubject.asObservable();

  constructor(private http: HttpClient) { }

  getDecArticlesTravaux(numMarche: number, idLot: string, numPieceFourn: number, numEtape: number): Observable<any[]> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('idLot', idLot)
    .set('numPieceFourn', numPieceFourn)
    .set('numEtape', numEtape);
    return this.http.get<any[]>(`${this.apiUrl}/travaux`, { params });
  }

  getDecArticlesTravauxPagin(numMarche: number, idLot: string, numPieceFourn: number, numEtape: number, page: number, size: number): Observable<any[]> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('idLot', idLot)
    .set('numPieceFourn', numPieceFourn)
    .set('numEtape', numEtape)
    .set('page', page)
    .set('size', size);
    return this.http.get<any[]>(`${this.apiUrl}/travauxPagin`, { params });
  }

  getDecArticlesAppro(numMarche: number, idLot: string, numPieceFourn: number, numEtape: number): Observable<any[]> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('idLot', idLot)
    .set('numPieceFourn', numPieceFourn)
    .set('numEtape', numEtape);
    return this.http.get<any[]>(`${this.apiUrl}/appro`, { params });
  }

  getDecArticlesApproPagin(numMarche: number, idLot: string, numPieceFourn: number, numEtape: number, page: number, size: number): Observable<any[]> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('idLot', idLot)
    .set('numPieceFourn', numPieceFourn)
    .set('numEtape', numEtape)
    .set('page', page)
    .set('size', size);
    return this.http.get<any[]>(`${this.apiUrl}/approPagin`, { params });
  }

  updateDecArticlesTravaux(numMarche: number, idLot: string, numPieceFourn: number, numEtape: number,  articlesToUpdate: any[]) {
    return this.http.patch(`${this.apiUrl}/updateTravaux`, articlesToUpdate, {
      params: { numMarche: numMarche, idLot: idLot, numPieceFourn: numPieceFourn, numEtape: numEtape },
    });
  }
  
  updateDecArticlesAppro(numMarche: number, idLot: string, numPieceFourn: number, numEtape: number, articlesToUpdate: any[]) {
    return this.http.patch(`${this.apiUrl}/updateAppro`,  articlesToUpdate, {
       params: { numMarche: numMarche, idLot: idLot, numPieceFourn: numPieceFourn, numEtape: numEtape },
    });
  }

  calculateMontantsFinalDecArticlesOrd(numMarche: number, numPieceFourn: number, numEtape: number): Observable<any> {
    const url = `${this.apiUrl}/calculateMontantsFinalDecArticlesOrd/${numMarche}/${numPieceFourn}/${numEtape}`;
    return this.http.get<any>(url);
  }

  getDecArticlesTravauxDecompte(numMarche: number, idLot: string, numPieceFourn: number, numDecompte: number): Observable<any[]> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('idLot', idLot)
    .set('numPieceFourn', numPieceFourn)
    .set('numDecompte', numDecompte);
    return this.http.get<any[]>(`${this.apiUrl}/travauxDecompte`, { params });
  }

  getDecArticlesApproDecompte(numMarche: number, idLot: string, numPieceFourn: number, numDecompte: number): Observable<any[]> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('idLot', idLot)
    .set('numPieceFourn', numPieceFourn)
    .set('numDecompte', numDecompte);
    return this.http.get<any[]>(`${this.apiUrl}/approDecompte`, { params });
  }

  getDecArticlesTravauxDecompteLRGfromNetDern(numMarche: number, idLot: string, numPieceFourn: number): Observable<any[]> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('idLot', idLot)
    .set('numPieceFourn', numPieceFourn);
    return this.http.get<any[]>(`${this.apiUrl}/travauxDecompteLRG`, { params });
  }

  getDecArticlesApproDecompteLRGfromNetDern(numMarche: number, idLot: string, numPieceFourn: number): Observable<any[]> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('idLot', idLot)
    .set('numPieceFourn', numPieceFourn);
    return this.http.get<any[]>(`${this.apiUrl}/approDecompteLRG`, { params });
  }
}
