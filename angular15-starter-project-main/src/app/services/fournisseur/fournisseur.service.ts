import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, map, Observable, of } from 'rxjs';
import { Fournisseur } from 'src/app/model/fournisseur';
import { Page } from 'src/app/model/page';
import { environment } from 'src/environnement';


@Injectable({
  providedIn: 'root'
})
export class FournisseurService {
private fournisseurs = [
    { designation: 'STE BOUZGUENDA', numero: '0003100RAM000', nombreMarches: 3, montantTotal: 850000, penalites: 0 },
    { designation: 'KBS CONSULTING', numero: '1687260Q', nombreMarches: 1, montantTotal: 120000, penalites: 5000 },
    { designation: 'GEOMED', numero: '1789261P', nombreMarches: 2, montantTotal: 450000, penalites: 2000 },
    { designation: 'MEDIBAT', numero: '1897262R', nombreMarches: 4, montantTotal: 950000, penalites: 0 },
    { designation: 'STT', numero: '1997263S', nombreMarches: 1, montantTotal: 200000, penalites: 1000 }
  ];
  private apiUrl = `${environment.apiUrl}/fournisseur`;
  private fournisseursSubject = new BehaviorSubject<any[]>([]);
  fournisseurs$ = this.fournisseursSubject.asObservable();

  constructor(private _http: HttpClient) { }

  addFournisseur(data: any): Observable<Fournisseur> {
    return this._http.post<Fournisseur>(`${this.apiUrl}/save`,data)
  }

  getFournisseurList(pageIndex: number, pageSize: number, fournisseurDesignation?: string, designation?): Observable<Page<any>> {
    let params = new HttpParams()
    .set('page', pageIndex)
    .set('size', pageSize)
    if(fournisseurDesignation){
      params = params.set('fournisseurDesignation', fournisseurDesignation)
    }
    if(designation){
      params = params.set('designation', designation)
    }
    return this._http.get<Page<any>>(`${this.apiUrl}`, { params })
  }

  getFournisseurListFiltred(filter: string): Observable<Page<any>> {
    let params = new HttpParams()
    .set('filter', filter)
    return this._http.get<Page<any>>(`${this.apiUrl}`, { params })
  }

  deleteFournisseur(id: number): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/delete/${id}`)
  }

  updateFournisseur(id: number, data: Fournisseur): Observable<Fournisseur> {
    return this._http.put<Fournisseur>(`${this.apiUrl}/update/${id}`, data)
  }

  deleteAllFournisseur(): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/deleteAll`)
  }

  getFournisseurById(id: number): Observable<Fournisseur> {
    return this._http.get<Fournisseur>(`${this.apiUrl}/get/${id}`);
  }

  getFournisseursOptions(page: number, filter?: string): Observable<any> {
    let params = new HttpParams();
    if(filter){
      params = params.set('filter', filter)
    }
      return this._http.get(`${this.apiUrl}/getFournisseursForSearch?page=${page}&size=10`, { params });
  }
}
