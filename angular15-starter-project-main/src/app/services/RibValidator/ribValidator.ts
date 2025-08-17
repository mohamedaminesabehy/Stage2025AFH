import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ribValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const ribPattern = /^\d{20}$/;
    const valid = ribPattern.test(control.value);
    return valid ? null : { invalidRib: { value: control.value } };
  };
}