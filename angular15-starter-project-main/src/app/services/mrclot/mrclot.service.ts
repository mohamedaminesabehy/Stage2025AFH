import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MrcLot, MrcLotDto } from 'src/app/model/mrcLot';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class MrclotService {

  private apiUrl = `${environment.apiUrl}/MrcLot`;
  private mrclotsSubject = new BehaviorSubject<any[]>([]);
  mrclots$ = this.mrclotsSubject.asObservable();

  constructor(private http: HttpClient) { }

  
  getMrcLotsForMarche(marcheId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${marcheId}`);
  }

  getMrcLotForMarcheAndIdlot(marcheId: number, idLot: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${marcheId}/${idLot}`);
  }

  saveMrcLots(numMarche: number, mrcLotDtos: MrcLotDto[]): Observable<MrcLot[]> {
    return this.http.post<MrcLot[]>(`${this.apiUrl}/${numMarche}`, mrcLotDtos);
  }

  deleteMrcLot(numMarche: number, idLot: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${numMarche}/${idLot}`);
  }
}
