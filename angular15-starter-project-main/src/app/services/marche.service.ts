import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environnement';

@Injectable({
  providedIn: 'root'
})
export class MarcheService {
  private apiUrl = `${environment.apiUrl}/marches`;

  constructor(private http: HttpClient) { }

  /**
   * Récupère tous les marchés
   */
  getAllMarches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`).pipe(
      catchError(this.handleError<any[]>('getAllMarches', []))
    );
  }

  /**
   * Récupère les marchés d'un fournisseur spécifique
   * @param numFournisseur Le numéro du fournisseur
   */
  getMarchesByFournisseur(numFournisseur: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fournisseur/${numFournisseur}`).pipe(
      catchError(this.handleError<any[]>('getMarchesByFournisseur', []))
    );
  }

  /**
   * Récupère un marché par son ID
   * @param id L'ID du marché
   */
  getMarcheById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<any>('getMarcheById'))
    );
  }

  /**
   * Ajoute un nouveau marché
   * @param marche Le marché à ajouter
   */
  addMarche(marche: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, marche).pipe(
      catchError(this.handleError<any>('addMarche'))
    );
  }

  /**
   * Met à jour un marché existant
   * @param id L'ID du marché
   * @param marche Les données mises à jour du marché
   */
  updateMarche(id: string, marche: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, marche).pipe(
      catchError(this.handleError<any>('updateMarche'))
    );
  }

  /**
   * Supprime un marché
   * @param id L'ID du marché à supprimer
   */
  deleteMarche(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<any>('deleteMarche'))
    );
  }

  /**
   * Gestion des erreurs HTTP
   * @param operation Nom de l'opération qui a échoué
   * @param result Valeur optionnelle à retourner comme résultat observable
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Retourne un résultat vide pour continuer l'application
      return of(result as T);
    };
  }
}
