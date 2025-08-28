import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CoreService } from 'src/app/services/core/core.service';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { PenaliteService } from 'src/app/services/penalite/penalite.service';
import { TypePenalite } from 'src/app/model/typePenalite';
@Component({
  selector: 'app-type-penalite-add-edit',
  standalone: true,
  imports: [MatFormFieldModule, MatDialogModule, CommonModule,ReactiveFormsModule,MatFormField,MatLabel,MatInput,MatIcon,MatButton],
  templateUrl: './type-penalite-add-edit.component.html',
  styleUrl: './type-penalite-add-edit.component.scss'
})
export class TypePenaliteAddEditComponent implements OnInit {
  typePenaliteForm: FormGroup;

  constructor(private _fb:FormBuilder, private _typePenaliteService: PenaliteService, private _dialogRef: MatDialogRef<TypePenaliteAddEditComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private _coreService: CoreService){
    this.typePenaliteForm = this._fb.group({
      designation:[""]
    })
  }

  ngOnInit(): void {
    this.typePenaliteForm.patchValue(this.data); 
   }

   onFormSubmit(){
    const typePenalite: TypePenalite = this.typePenaliteForm.value;
    console.log(typePenalite);

    if(this.typePenaliteForm.valid){
      if(this.data) {
        this._typePenaliteService.updateTypePenalite(this.data.id, this.typePenaliteForm.value).subscribe({
          next: (val:any) => {
            this._coreService.openSnackBar('Type Penalite Modifier','Ok')
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error('Erreur lors de la mise à jour Type Penalite:', err);
          }
        });
      }else {
        this._typePenaliteService.addTypePenalite(typePenalite).subscribe({
          next: (val:any) => {
            this._coreService.openSnackBar('Type Penalite Ajouter','Ok')
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error('Erreur lors de l\'ajout du Type Penalite:', err);
          }
        });
      }
    }
  }

}
