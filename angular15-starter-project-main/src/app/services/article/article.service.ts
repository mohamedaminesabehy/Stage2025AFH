import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { Article } from 'src/app/model/article';
import { Page } from 'src/app/model/page';
import { environment } from 'src/environnement';


@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private apiUrl = `${environment.apiUrl}/articles`;
  private articlesSubject = new BehaviorSubject<any[]>([]);
  articles$ = this.articlesSubject.asObservable();

  constructor(private http: HttpClient) { }

  addArticle(article: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, article);
  }

  getSecteurs(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/secteurs`);
  }

  getSousSecteurs(numSectEco: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/sous-secteurs/secteur/${numSectEco}`);
  }

  getFamilles(numSectEco: number, numSSectEco: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/familles/sous-secteur/${numSectEco}/${numSSectEco}`);
  }

  getSousFamilles(numSectEco: number, numSSectEco: number, numFamille: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/sous-familles/famille/${numSectEco}/${numSSectEco}/${numFamille}`);
  }

  deleteArticle(numArticle: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${numArticle}`);
  }

  updateArticle(numArticle: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${numArticle}`, data)
  }

  getAllArticles(pageIndex: number, pageSize: number, filter?: string, secteurDesignation?: string, ssecteurDesignation?:string, familleDesignation?:string, ssFamilleDesignation?:string, designationFr?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', pageIndex)
      .set('size', pageSize)
      if (filter) {
        params = params.set('filter', filter);
      }
      if (secteurDesignation) {
        params = params.set('secteurDesignation', secteurDesignation);
      }
      if (ssecteurDesignation) {
        params = params.set('ssecteurDesignation', ssecteurDesignation);
      }
      if (familleDesignation) {
        params = params.set('familleDesignation', familleDesignation);
      }
      if (ssFamilleDesignation) {
        params = params.set('ssFamilleDesignation', ssFamilleDesignation);
      }
      if (designationFr) {
        params = params.set('designationFr', designationFr);
      }
    return this.http.get<any>(`${this.apiUrl}/all`, { params });
  }

  getArticlesListFiltred(pageIndex: number, pageSize: number,searchTerm?:string): Observable<Page<any>> {
    let params = new HttpParams()
    .set('page', pageIndex)
    .set('size', pageSize)
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    return this.http.get<Page<any>>(`${this.apiUrl}/all/search`, { params })
  }

  getMoreArticles(offset: number, limit: number): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/scroll/moreArticles?offset=${offset}&limit=${limit}`);
  }

  getArticles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getArticleOptions(page: number, searchTerm?: string): Observable<any> {
    let params = new HttpParams();
    if(searchTerm){
      params = params.set('searchTerm', searchTerm)
    }
      return this.http.get(`${this.apiUrl}/options?page=${page}&size=10`, { params });
  }

  getArticleByNumArticle(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  getArticlesList(pageIndex: number, pageSize: number): Observable<Page<Article>> {
    let params = new HttpParams()
    .set('page', pageIndex)
    .set('size', pageSize)
    return this.http.get<Page<Article>>(`${this.apiUrl}/pagination`, { params })
  }
}
