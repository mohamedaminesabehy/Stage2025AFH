import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MrcArticle } from 'src/app/model/mrcArticle';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class MrcarticleService {
  private apiUrl = `${environment.apiUrl}/MrcArticles`;
  private mrcArticleSubject = new BehaviorSubject<any[]>([]);
  mrcArticle$ = this.mrcArticleSubject.asObservable();

  constructor(private http: HttpClient) { }

  getMrcArticles(numMarche: number, idLot: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?numMarche=${numMarche}&idLot=${idLot}`);
  }

  getMrcArticlesForProd(numMarche: number, idLot: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('numMarche', numMarche)
      .set('idLot', idLot)
      .set('page', page)
      .set('size', size);
  
    return this.http.get(`${this.apiUrl}/getArticlesForProd`, { params });
  }

  deleteMrcArticle(numArticle: string, numMarche: number, ap: number, idLot: string, idArticle: number): Observable<void> {
    const url = `${this.apiUrl}/${numArticle}/${numMarche}/${ap}/${idLot}/${idArticle}`;
    return this.http.delete<void>(url);
  }

  saveOrUpdateMrcArticles(mrcArticles: MrcArticle[]): Observable<MrcArticle[]> {
    return this.http.post<MrcArticle[]>(this.apiUrl, mrcArticles);
  }

  getMrcArticle(numMarche: number, idLot: string, numArticle: string, idArticle: number) : Observable<MrcArticle> {
    return this.http.get<MrcArticle>(`${this.apiUrl}/getArticlebyNumArticle?numMarche=${numMarche}&idLot=${idLot}&numArticle=${numArticle}&idArticle=${idArticle}`)
  }

  getMrcArticleForExpansion(numMarche: number, idLot: string, idArticle: number) : Observable<MrcArticle> {
    return this.http.get<MrcArticle>(`${this.apiUrl}/getArticleForExpansion?numMarche=${numMarche}&idLot=${idLot}&idArticle=${idArticle}`)
  }

  getMaxIdArticle(numMarche: number, idLot: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/maxIdArticle/${numMarche}/${idLot}`);
  }

}

