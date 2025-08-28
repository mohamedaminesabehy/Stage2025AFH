import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environnement';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  constructor(private http: HttpClient, private router: Router) { }

  login(matricule: number, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      {
        matricule,
        password
      },
      httpOptions
    ).pipe(
      tap((response: any)=>{
        console.log(response)
        if (response.authenticated) {
          sessionStorage.setItem('jwtToken', response.jwtToken);
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('Resultat',response.resultat);
          sessionStorage.setItem('Matricule',String(matricule))
          sessionStorage.setItem('NumStruct',response.numStruct)
          sessionStorage.setItem('Designation',response.designation)

        }
      })
    );
  }

  signup(userSignupDTO: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userSignupDTO);
  }

  logout(): void {
    sessionStorage.removeItem('jwtToken'); 
    sessionStorage.removeItem('isAuthenticated'); 
    sessionStorage.removeItem('Resultat');
    sessionStorage.removeItem('Matricule')
    sessionStorage.removeItem('NumStruct'); 
    sessionStorage.removeItem('Designation')
    location.replace('/login'); 
  }

  isAuthenticated() {
    return sessionStorage.getItem('isAuthenticated') === 'true'; 
  }

  isLoggedIn() {
    return sessionStorage.getItem('Matricule'); 
  }

  getNumStruct(){
    return sessionStorage.getItem('NumStruct');
  }

  getDesignationStructure() {
    return sessionStorage.getItem('Designation');
  }
  
}
