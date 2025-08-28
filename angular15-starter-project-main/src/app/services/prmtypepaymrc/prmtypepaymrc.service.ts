import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { typePFMarche } from 'src/app/model/typePFMarche';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class PrmtypepaymrcService {

  private apiUrl = `${environment.apiUrl}/PrmTypePayMrc`;
  private PrmTypePayMrcSubject = new BehaviorSubject<any[]>([]);
  PrmTypePayMrc$ = this.PrmTypePayMrcSubject.asObservable();

  constructor(private http: HttpClient) { }

  getPrmTypePayMrcs(): Observable<typePFMarche[]> {
    return this.http.get<typePFMarche[]>(this.apiUrl);
  }
}
