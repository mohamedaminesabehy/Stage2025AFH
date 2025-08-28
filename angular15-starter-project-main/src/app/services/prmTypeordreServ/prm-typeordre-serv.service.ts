import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class PrmTypeordreServService {
  private apiUrl = `${environment.apiUrl}/PrmTypeOrdreService`;
  private prmTypeordreServiceSubject = new BehaviorSubject<any[]>([]);
  prmTypeordreService$ = this.prmTypeordreServiceSubject.asObservable();

  constructor(private http: HttpClient) { }

  getPrmTypeOrdresService(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }
}
