import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class SousSecteurService {
  private apiUrl = `${environment.apiUrl}/sous-secteurs`;
  private ssecteursSubject = new BehaviorSubject<any[]>([]);
  secteures$ = this.ssecteursSubject.asObservable();

  constructor(private http: HttpClient) { }

  getSSecteurByDesignation(designation: string): Observable<number> {
    const params = new HttpParams().set('designation', designation);
    return this.http.get<number>(`${environment.apiUrl}/sous-secteurs/designation`, { params });
  }
}
