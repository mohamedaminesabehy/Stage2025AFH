import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class PrmtypelotService {

  private apiUrl = `${environment.apiUrl}/PrmTypeLot`;
  private prmTypeLotSubject = new BehaviorSubject<any[]>([]);
  prmTypeLot$ = this.prmTypeLotSubject.asObservable();

  constructor(private http: HttpClient) { }

  getprmTypeLotDesignation(prmTypeLotId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${prmTypeLotId}/designation`);
  }
}
