import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MrcEtape, MrcEtapeRequest } from 'src/app/model/mrcetape';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class EtapeService {
  private apiUrl = `${environment.apiUrl}/MrcEtapes`;
  private etapesSubject = new BehaviorSubject<any[]>([]);
  etapes$ = this.etapesSubject.asObservable();

  constructor(private http: HttpClient) { }

  
  getEtapesForMarche(marcheId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/marche/${marcheId}`);
  }


  saveOrUpdateEtapes(request: MrcEtapeRequest): Observable<MrcEtape[]> {
    return this.http.post<MrcEtape[]>(this.apiUrl, request)
  }

  deleteEtapeMarche(numMarche: number, numEtape: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/marche/${numMarche}/${numEtape}`);
  }
}
