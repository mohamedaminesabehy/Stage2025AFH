import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrmModePen } from 'src/app/model/prmModePen';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class PrmmodepenService {
  private apiUrl = `${environment.apiUrl}/PrmModePen`;
  private PrmModePenSubject = new BehaviorSubject<any[]>([]);
  PrmModePenSubject$ = this.PrmModePenSubject.asObservable();

  constructor(private http: HttpClient) { }

  getPrmModePens(): Observable<PrmModePen[]> {
    return this.http.get<PrmModePen[]>(this.apiUrl);
  }
}
