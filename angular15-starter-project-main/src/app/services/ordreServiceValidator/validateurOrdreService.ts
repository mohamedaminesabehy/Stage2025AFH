import { AbstractControl, ValidationErrors, AsyncValidatorFn, FormArray } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export function validateurOrdreService(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (control instanceof FormArray) {
      return of(control.length > 0 ? null : { 'auMoinsUnOrdreService': true }).pipe(
        catchError(() => of(null)) // En cas d'erreur, retourner null
      );
    }
    return of(null); // Si ce n'est pas un FormArray, retourner null
  };
}
