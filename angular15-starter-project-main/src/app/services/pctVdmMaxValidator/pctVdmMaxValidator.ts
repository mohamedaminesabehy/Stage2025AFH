import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PctVdmMaxValidator {
  static validate(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const pctVdm = formGroup.get('pctVdm')?.value;
      const pctMaxVdm = formGroup.get('pctMaxVdm')?.value;

      const errors: { [key: string]: boolean } = {};

      if (pctVdm !== null && pctMaxVdm !== null) {
        if (pctVdm > pctMaxVdm) {
          errors['pctVdmExceedsMax'] = true;
        } else {
         return null;
        }
      }

      return Object.keys(errors).length ? errors : null; // Retourne les erreurs si présentes, sinon null
    };
  }
}
