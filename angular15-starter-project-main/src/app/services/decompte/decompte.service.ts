import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environnement';
@Injectable({
  providedIn: 'root'
})
export class DecompteService {

  private apiUrl = `${environment.apiUrl}/decomptes`;
  private decomptesSubject = new BehaviorSubject<any>(null);
  decomptes$ = this.decomptesSubject.asObservable();

  constructor(private http: HttpClient) { }

  sendDecMntsData(decMnts: any): void {
    this.decomptesSubject.next(decMnts);
  }

  getDecomptesByMarcheEtapeTypeDec(numMarche: number, numEtape: number, idTypeDec: number): Observable<any[]> {
    const params = new HttpParams()
      .set('numMarche', numMarche)
      .set('numEtape', numEtape)
      .set('idTypeDec', idTypeDec);

    return this.http.get<any[]>(this.apiUrl, { params });
  }
  
  addDecompte(numMarche: number, datePiece: Date, idTypeDec: number, numEtape: number, soldeAvance:number): Observable<any> {
    const formattedDate = this.formatDateToString(datePiece);
    const url = `${this.apiUrl}/ajouter?numMarche=${numMarche}&datePiece=${formattedDate}&idTypeDec=${idTypeDec}&numEtape=${numEtape}&soldeAvance=${soldeAvance}`;
    return this.http.post<any>(url, {});
  }

  deleteDecompte(numMarche: number, numPieceFourn: number): Observable<void> {
    const url = `${this.apiUrl}/supprimer?numMarche=${numMarche}&numPieceFourn=${numPieceFourn}`;
    return this.http.post<void>(url, {});
  }
  
  // Fonction pour formater la date en chaîne 'yyyy-MM-dd'
  private formatDateToString(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;  // Format 'yyyy-MM-dd'
  }

  calculMontantDecAvanceDecompte(numMarche: number): Observable<any> {
    const url = `${this.apiUrl}/calculateMontantDecAvanceDecompte/${numMarche}`;
    return this.http.get<any>(url);
  }

  calculMontantDecOrdDecompte(numMarche: number, numPieceFourn: number, numEtape: number): Observable<any> {
    const url = `${this.apiUrl}/calculateMontantDecOrdDecompte/${numMarche}/${numPieceFourn}/${numEtape}`;
    return this.http.get<any>(url);
  }

  calculMontantDecLrgDecompte(numMarche: number, numPieceFourn: number): Observable<any> {
    const url = `${this.apiUrl}/calculateMontantDecLrgDecompte/${numMarche}/${numPieceFourn}`;
    return this.http.get<any>(url);
  }

  getAllDecomptesByNumMarche(numMarche: number): Observable<any[]> {
    const params = new HttpParams()
      .set('numMarche', numMarche);
    return this.http.get<any[]>(`${this.apiUrl}/getAllByNumMarche`, { params });
  }


  updateExPen(numMarche: number, numPieceFourn: number, exPenValue: number): Observable<any> {
    const url = `${this.apiUrl}/updateExPen?numMarche=${numMarche}&numPieceFourn=${numPieceFourn}&exPenValue=${exPenValue}`;
    return this.http.patch<void>(url, {});

  }

  getDecompteDetails(numMarche: number, numPieceFourn: number): Observable<any> {
    const params = new HttpParams()
    .set('numMarche', numMarche)
    .set('numPieceFourn', numPieceFourn);
  return this.http.get<any>(`${this.apiUrl}/getDetailsDecompte`, { params });
  }

  getNumDecompte(numMarche: number, numPieceFourn: number): Observable<any> {
    const url = `${this.apiUrl}/getNumDecompte/${numMarche}/${numPieceFourn}`;
    return this.http.get<void>(url, {});
  }

  getDecompteStatus(numMarche: number, numPieceFourn: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/status?numMarche=${numMarche}&numPieceFourn=${numPieceFourn}`);
  }

  getMaxNumDecompte(numMarche: number): Promise<any> {
    return this.http.get<number>(`${this.apiUrl}/getMaxNumDecompte?numMarche=${numMarche}`).toPromise();
  }

  getMaxNumPieceFourn(numMarche: number):Observable<any> {
    return this.http.get<number>(`${this.apiUrl}/getMaxNumPieceFourn?numMarche=${numMarche}`);
  }

  getDecompteCountGroupedByIdTypeDecAndNumMarche(numMarche: number, numEtape:number):Observable<any> {
    return this.http.get<number>(`${this.apiUrl}/countByTypeDec?numMarche=${numMarche}&numEtape=${numEtape}`);
  }

  envoyerDecompteAuFinancier(numMarche: number, numPieceFourn: number, numStruct: string, nomUser: string): Observable<string> {
    const url = `${this.apiUrl}/envoyerDecFin`;
    const params = new HttpParams()
      .set('numMarche', numMarche)
      .set('numPieceFourn', numPieceFourn)
      .set('numStruct', numStruct)
      .set('nomUser', nomUser);
    return this.http.post<string>(url, {}, { params });
  }

  getNumPieceFournForDecompteNetDer(numMarche: number):Observable<any> {
    return this.http.get<number>(`${this.apiUrl}/numPieceFournNetDer?numMarche=${numMarche}`);
  }


  UpdateDatePieceSoldeAvanceDecompte(numMarche: number, numPieceFourn: number, datePiece: Date, soldeAvance:number): Observable<any> {
    const url = `${this.apiUrl}/UpdateDatePieceSoldeAvanceDecompte?numMarche=${numMarche}&numPieceFourn=${numPieceFourn}&datePiece=${datePiece}&soldeAvance=${soldeAvance}`;
    return this.http.patch<void>(url, {});
  }

  validerDateDecompte(numMarche: number, datePiece: Date): Observable<boolean> {
    // Formater la date au format 'yyyy-MM-dd'
    const formattedDate = this.formatDateToString(datePiece);

    // Configurer les paramètres de la requête GET
    const params = new HttpParams()
      .set('numMarche', numMarche.toString())
      .set('datePiece', formattedDate);

    // Appeler l'API avec les paramètres
    return this.http.get<boolean>(`${this.apiUrl}/validerDatePieceDecompte`, { params });
  }

  validerDateDecompteForUpdate(numMarche: number, datePiece: Date, numPieceFourn: number): Observable<boolean> {
    // Formater la date au format 'yyyy-MM-dd'
    const formattedDate = this.formatDateToString(datePiece);

    // Configurer les paramètres de la requête GET
    const params = new HttpParams()
      .set('numMarche', numMarche.toString())
      .set('datePiece', formattedDate)
      .set('numPieceFourn', numPieceFourn);

    // Appeler l'API avec les paramètres
    return this.http.get<boolean>(`${this.apiUrl}/validerDateDecompteForUpdate`, { params });
  }

  

  
}
