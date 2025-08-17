import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class PrmtypeserieService {
  private apiUrl = `${environment.apiUrl}/PrmTypeSeries`;
  private prmTypeSerieSubject = new BehaviorSubject<any[]>([]);
  prmTypeSerie$ = this.prmTypeSerieSubject.asObservable();

  constructor(private http: HttpClient) { }

  getprmTypeSerie(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }
}
