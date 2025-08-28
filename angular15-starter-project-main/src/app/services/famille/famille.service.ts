import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class FamilleService {
  private apiUrl = `${environment.apiUrl}/familles`;
  private secteursSubject = new BehaviorSubject<any[]>([]);
  secteures$ = this.secteursSubject.asObservable();

  constructor(private http: HttpClient) { }

/*   getFamilleByDesignation(designation: string): Observable<number> {
    const params = new HttpParams().set('designation', designation);
    return this.http.get<number>(`${environment.apiUrl}/familles/designation`, { params });
  } */

  getFamilleByDesignation(designation: string, numSectEco: number, numSSectEco: number): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/familles/designation?designation=${designation}&numSectEco=${numSectEco}&numSSectEco=${numSSectEco}`);
  }
}
