import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import moment from 'moment';

export class DateComparisonValidator {
  static validateDateComparisons(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const dateCm = formGroup.get('dateCm')?.value;
      const dateConAdmin = formGroup.get('dateConAdmin')?.value;
      const dateMarche = formGroup.get('dateMarche')?.value;
      const dateNotif = formGroup.get('dateNotif')?.value;

      const errors: { [key: string]: boolean } = {};

      // Validate date_con_admin >= date_cm
      if (moment(dateConAdmin).isValid() && moment(dateCm).isValid() &&
          moment(dateConAdmin).isBefore(dateCm)) {
            errors['dateConAdminInvalid'] = true;
      }

      // Validate date_marche >= date_con_admin
      if (moment(dateMarche).isValid() && moment(dateConAdmin).isValid() &&
          moment(dateMarche).isBefore(dateConAdmin)) {
            errors['dateMarcheInvalid'] = true; 
      }

      // Validate date_notif >= date_marche
      if (moment(dateNotif).isValid() && moment(dateMarche).isValid() &&
          moment(dateNotif).isBefore(dateMarche)) {
            errors['dateNotifInvalid'] = true;
      }

      return Object.keys(errors).length ? errors : null; // Return errors if any, otherwise null
    };
  }
}
