import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { SpinnerService } from '../services/spinner/spinner.service';


@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  constructor(private _spinnerService: SpinnerService){

}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //let authReq = req;
    //const token = sessionStorage.getItem('auth-token'); // Assurez-vous que le token est bien stocké dans sessionStorage
    this._spinnerService.show();
    // à integerer lorsqu'il va y avoir une authentification
   /*  if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } */
    
    return next.handle(req).pipe(
      finalize(()=>{
        this._spinnerService.hide();
      })
    );
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];