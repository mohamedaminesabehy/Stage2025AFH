import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class SousFamilleService {
  private apiUrl = `${environment.apiUrl}/sous-familles`;
  private sfamillesSubject = new BehaviorSubject<any[]>([]);
  secteures$ = this.sfamillesSubject.asObservable();

  constructor(private http: HttpClient) { }

  getSFamilleByDesignation(designation: string ,nvNumSecteur: number, nvNumSSecteur: number, nvNumFamille: number): Observable<number[]> {
    const params = new HttpParams()
    .set('designation', designation)
    .set('nvNumSecteur', nvNumSecteur)
    .set('nvNumSSecteur', nvNumSSecteur)
    .set('nvNumFamille', nvNumFamille)
    return this.http.get<number[]>(`${environment.apiUrl}/sous-familles/designation`, { params });
  }
}
