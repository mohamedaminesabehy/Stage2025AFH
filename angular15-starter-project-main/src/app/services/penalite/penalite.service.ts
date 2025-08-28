import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TypePenalite } from 'src/app/model/typePenalite';
import { environment } from 'src/environnement';



@Injectable({
  providedIn: 'root'
})
export class PenaliteService {
  private apiUrl = `${environment.apiUrl}/typepenalite`;
  private typePenalitesSubject = new BehaviorSubject<any[]>([]);
  typePenalites$ = this.typePenalitesSubject.asObservable();

  constructor(private _http: HttpClient) { }

  addTypePenalite(data: any): Observable<TypePenalite> {
    return this._http.post<TypePenalite>(`${this.apiUrl}/save`,data)
  }

  getTypePenalitesList(): Observable<any> {
    return this._http.get<any>(`${this.apiUrl}`)
  }

  deleteTypePenalite(id: number): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/delete/${id}`)
  }

  updateTypePenalite(id: number, data: TypePenalite): Observable<TypePenalite> {
    return this._http.put<TypePenalite>(`${this.apiUrl}/update/${id}`, data)
  }

  deleteAllTypePenalites(): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/deleteAll`)
  }
}
