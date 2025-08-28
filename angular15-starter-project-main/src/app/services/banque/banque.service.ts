import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Banque } from 'src/app/model/banque';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class BanqueService {

  private apiUrl = `${environment.apiUrl}/banques`;
  private banquesSubject = new BehaviorSubject<any[]>([]);
  banques$ = this.banquesSubject.asObservable();

  constructor(private http: HttpClient) { }

  getbanques(): Observable<Banque[]> {
    return this.http.get<Banque[]>(this.apiUrl);
  }

  getBanqueByNumBanque(numBanque: number) {
    return this.http.get(`${this.apiUrl}/${numBanque}`)
  }
}
