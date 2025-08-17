import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Marche } from 'src/app/model/marche';
import { MontantResponse } from 'src/app/model/montantResponse';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class MarcheService {
 
  private apiUrl = `${environment.apiUrl}/marches`;
  private marchesSubject = new BehaviorSubject<any[]>([]);
  marches$ = this.marchesSubject.asObservable();

  constructor(private http: HttpClient) { }

  getAllMarches(pageIndex: number, pageSize: number, filter?: string, designation?: string, fournisseurdesignation?: string, numStruct?: string, numFourn?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', pageIndex)
      .set('size', pageSize);
      
      if (filter) {
        params = params.set('filter', filter);
      }
      if (designation) {
        params = params.set('designation', designation);
      }
      if (fournisseurdesignation) {
        params = params.set('fournisseurdesignation', fournisseurdesignation);
      }
      if (numStruct) {
        params = params.set('numStruct', numStruct);
      }
      if (numFourn) {
        params = params.set('numFourn', numFourn);
      }
      
    return this.http.get<any>(`${this.apiUrl}/all`, { params });
  }

  addMarche(marcheData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, marcheData);
  }

  updateMarche(marcheData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${marcheData.id}`, marcheData);
}

  deleteMarche(numMarche: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${numMarche}`);
  }

  getMarcheById(marcheId: number): Observable<Marche> {
    return this.http.get<Marche>(`${this.apiUrl}/${marcheId}`);
  }

  calculateMontants(numMarche: number): Observable<MontantResponse>  {
    return this.http.get<MontantResponse>(`${this.apiUrl}/calculateMontants/${numMarche}`);
  }

  getMarches(searchTerm: string, page: number = 0, size: number = 10, numStruct: string): Observable<any> {
    let params = new HttpParams()
    .set('searchTerm', searchTerm)
    .set('page', page)
    .set('size', size)
    .set('numStruct', numStruct)
    
      return this.http.get(`${this.apiUrl}/options`, { params });
  }

  getMarchesNoFilterAndPagi(numStruct: string) : Observable<any[]>{
    let params = new HttpParams()
    .set('numStruct', numStruct);
    return this.http.get<any[]>(`${this.apiUrl}/allMarches`, { params });
  }

}
