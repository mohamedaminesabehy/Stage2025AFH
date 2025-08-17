import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TypeGarantie } from 'src/app/model/typeGarantie';
import { CoreService } from 'src/app/services/core/core.service';
import { TypeGarantieService } from 'src/app/services/typeGarantie/type-garantie.service';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-type-garantie-add-edit',
  standalone: true,
  imports: [MatFormFieldModule, MatDialogModule, CommonModule,ReactiveFormsModule,MatFormField,MatLabel,MatInput,MatIcon,MatButton],
  templateUrl: './type-garantie-add-edit.component.html',
  styleUrl: './type-garantie-add-edit.component.scss'
})
export class TypeGarantieAddEditComponent implements OnInit {
  typeGarantieForm: FormGroup
  constructor(private _fb:FormBuilder, private _typeGarantieService: TypeGarantieService, private _dialogRef: MatDialogRef<TypeGarantieAddEditComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private _coreService: CoreService){
    this.typeGarantieForm = this._fb.group({
      designation:[""]
    })
  }
  ngOnInit(): void {
    this.typeGarantieForm.patchValue(this.data); 
   }

   onFormSubmit(){
    const typeGarantie: TypeGarantie = this.typeGarantieForm.value;
    console.log(typeGarantie);

    if(this.typeGarantieForm.valid){
      if(this.data) {
        this._typeGarantieService.updateTypeGarantie(this.data.id, this.typeGarantieForm.value).subscribe({
          next: (val:any) => {
            this._coreService.openSnackBar('Type Garantie Modifier','Ok')
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error('Erreur lors de la mise à jour Type Garantie:', err);
          }
        });
      }else {
        this._typeGarantieService.addTypeGarantie(typeGarantie).subscribe({
          next: (val:any) => {
            this._coreService.openSnackBar('Type Garantie Ajouter','Ok')
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error('Erreur lors de l\'ajout du Type Garantie:', err);
          }
        });
      }
    }
  }
}
