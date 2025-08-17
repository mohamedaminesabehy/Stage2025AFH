import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Fournisseur } from 'src/app/model/fournisseur';
import { CoreService } from 'src/app/services/core/core.service';
import { FournisseurService } from 'src/app/services/fournisseur/fournisseur.service';

@Component({
  selector: 'app-fourn-add-edit',
  standalone: true,
  imports: [MatFormFieldModule, MatDialogModule, CommonModule,ReactiveFormsModule,MatFormField,MatLabel,MatInput,MatIcon,MatButton],
  templateUrl: './fourn-add-edit.component.html',
  styleUrl: './fourn-add-edit.component.scss'
})
export class FournAddEditComponent implements OnInit {
  fournForm: FormGroup
  constructor(private _fb:FormBuilder, private _fournService: FournisseurService, private _dialogRef: MatDialogRef<FournAddEditComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private _coreService: CoreService){
    this.fournForm = this._fb.group({
      numFourn:[""] ,
      codePays:[""] ,
      numGouv:[""],
      designation:[""],
      contact:[""],
      adresse:[""],
       ville:[""],
      codePostal:[""],
      tel:[""],
      fax:[""],
      email:[""],
      web:[""],
      structCap:[""],
      activite:[""],
      rcs:[""],
      matCnss:[""],
      designationFr:[""],
      matriculeFisc:[""],
      finFourn:[{value:"",disabled: true}], 
    })
  }

  ngOnInit(): void {
    this.fournForm.patchValue(this.data);
  }
  onFormSubmit(){
    const fournisseur: Fournisseur = this.fournForm.value;
    console.log(fournisseur);

    if(this.fournForm.valid){
      if(this.data) {
        this._fournService.updateFournisseur(this.data.id, this.fournForm.value).subscribe({
          next: (val:any) => {
            this._coreService.openSnackBar('Fournisseur Modifier','Ok')
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error('Erreur lors de la mise à jour du fournisseur:', err);
          }
        });
      }else {
        this._fournService.addFournisseur(fournisseur).subscribe({
          next: (val:any) => {
            this._coreService.openSnackBar('Fournisseur Ajouter','Ok')
            this._dialogRef.close(true);
          },
          error: (err: any) => {
            console.error('Erreur lors de l\'ajout du fournisseur:', err);
          }
        });
      }
    }
  }

}
