import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/UserAuth`;
  constructor(private http: HttpClient) { }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

     // Nouvelle fonction pour récupérer tous les admins
     getAllAdmins(): Observable<any> {
      return this.http.get(`${this.apiUrl}/admins`);
    }
  
    // Nouvelle fonction pour récupérer tous les utilisateurs simples
    getAllSimpleUsers(): Observable<any> {
      return this.http.get(`${this.apiUrl}/users`);
    }

}
