import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environnement';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class MrcGarantieService {
  private apiUrl = `${environment.apiUrl}/MrcGarantie`;
  private mrcGarantieSubject = new BehaviorSubject<any[]>([]);
  mrcGarantie$ = this.mrcGarantieSubject.asObservable();
  constructor(private http: HttpClient) { }

  getMrcGaranties(numMarche: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/garantie/${numMarche}`);
  }

  addMultipleMrcGaranties(mrcGaranties: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addGaranties`, mrcGaranties);
  }

  deleteGarantie(numMarche: number, numGarantie: number, idTypeGarantie: number): Observable<any> {
    const url = `${this.apiUrl}/garantie/${numMarche}/${numGarantie}/${idTypeGarantie}`;
    return this.http.delete<any>(url);
  }

}
