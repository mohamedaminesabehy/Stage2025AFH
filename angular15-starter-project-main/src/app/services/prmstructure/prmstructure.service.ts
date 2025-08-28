import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrmStructure } from 'src/app/model/prmStructure';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class PrmstructureService {

  private apiUrl = `${environment.apiUrl}/PrmStructure`;
  private PrmStructureSubject = new BehaviorSubject<any[]>([]);
  PrmStructureSubject$ = this.PrmStructureSubject.asObservable();

  constructor(private http: HttpClient) { }

  getPrmStructures(): Observable<PrmStructure[]> {
    return this.http.get<PrmStructure[]>(this.apiUrl);
  }
}
