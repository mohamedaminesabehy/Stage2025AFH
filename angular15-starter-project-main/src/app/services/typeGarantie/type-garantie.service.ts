import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TypeGarantie } from 'src/app/model/typeGarantie';
import { environment } from 'src/environnement';


@Injectable({
  providedIn: 'root'
})
export class TypeGarantieService {

  private apiUrl = `${environment.apiUrl}/typegarantie`;
  private typeGarantiesSubject = new BehaviorSubject<any[]>([]);
  typeGaranties$ = this.typeGarantiesSubject.asObservable();

  constructor(private _http: HttpClient) { }
  addTypeGarantie(data: any): Observable<TypeGarantie> {
    return this._http.post<TypeGarantie>(`${this.apiUrl}/save`,data)
  }

  getTypeGarantiesList(): Observable<any> {
    return this._http.get<any>(`${this.apiUrl}`)
  }

  deleteTypeGarantie(id: number): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/delete/${id}`)
  }

  updateTypeGarantie(id: number, data: TypeGarantie): Observable<TypeGarantie> {
    return this._http.put<TypeGarantie>(`${this.apiUrl}/update/${id}`, data)
  }

  deleteAllTypeGaranties(): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}/deleteAll`)
  }
}
