import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { ArticleService } from 'src/app/services/article/article.service';
import { CoreService } from 'src/app/services/core/core.service';
import { ArticleDTO } from 'src/app/model/articleDTO';
import { SecteurService } from 'src/app/services/secteur/secteur.service';
import { SousSecteurService } from 'src/app/services/sous-secteur/sous-secteur.service';
import { FamilleService } from 'src/app/services/famille/famille.service';
import { SousFamilleService } from 'src/app/services/sous-famille/sous-famille.service';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-article-add-edit',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatRadioModule,
    CommonModule
  ],  
  templateUrl: './article-add-edit.component.html',
  styleUrl: './article-add-edit.component.scss'
})
export class ArticleAddEditComponent {
  articleForm!: FormGroup;
  secteurs: any[] = [];
  sousSecteurs: any[] = [];
  familles: any[] = [];
  sousFamilles: any[] = [];
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private secteurService: SecteurService,
    private soussecteurService: SousSecteurService,
    private familleService: FamilleService,
    private sfamilleService: SousFamilleService,
    private _dialogRef: MatDialogRef<ArticleAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService
  ) {
    this.isEditMode = !!this.data;
    this.buildForm();
  }

  private buildForm(): void {
    // Définir les champs du formulaire en fonction du mode
    if (this.isEditMode) {
      this.articleForm = this.fb.group({
        numArticle: [{ value: '', disabled: true }],
        numSectEco: [{ value: null, disabled: true }],
        numSSectEco: [{ value: null, disabled: true }],
        numFamille: [{ value: null, disabled: true }],
        numSFamille: [{ value: null, disabled: true }],
        libUnite: [''],
        tva: ['',[Validators.min(0),Validators.max(99.99)]],
        designation: [''],
        designationFr: [''],
        historique: [null]
      });
    } else {
      this.articleForm = this.fb.group({
        numSectEco: [null, Validators.required],
        numSSectEco: [null, Validators.required],
        numFamille: [null, Validators.required],
        numSFamille: [null, Validators.required],
        libUnite: [''],
        tva: ['',[Validators.min(0),Validators.max(99.99)]],
        designation: [''],
        designationFr: [''],
        historique: [null]
      });
    }
  }

  ngOnInit(): void {
    this.loadSecteurs();
    if (this.isEditMode && this.data) {
    console.log('Données initiales:', this.data); 
    this.loadAdditionalData(this.data); 
    this.data.historique = String(this.data.historique);
      this.articleForm.patchValue(this.data);
      console.log('Valeurs du formulaire après patch:', this.articleForm.value);
  }
}

loadSecteurs(): void {
  this.articleService.getSecteurs().subscribe(
    secteurs => {
      this.secteurs = secteurs;
      console.log('Secteurs chargés :', secteurs);
    },
    error => this.handleError('secteurs', error)
  );
}

onSecteurChange(event: MatSelectChange): void {
  const numSectEco = +event.value;
  console.log('Secteur sélectionné:', numSectEco);
  this.loadSousSecteurs(numSectEco,this.data);
}

onSousSecteurChange(event: MatSelectChange): void {
  const numSSectEco = +event.value;
  const numSectEco = this.articleForm.value.numSectEco;
  this.loadFamilles(numSectEco, numSSectEco,this.data);
}

onFamilleChange(event: MatSelectChange): void {
  const numFamille = +event.value;
  const numSectEco = this.articleForm.value.numSectEco;
  const numSSectEco = this.articleForm.value.numSSectEco;
  console.log('Famille sélectionnée:', numFamille);
  this.loadSousFamilles(numSectEco, numSSectEco, numFamille,this.data);
}

loadAdditionalData(data: any): void {
  if (data.numSectEco) {
    this.loadSecteurByDesignation(data.numSectEco, data);
  }
}

private loadSecteurByDesignation(numSectEco: number, data: any): void {
  this.secteurService.getSecteurByDesignation(String(numSectEco)).subscribe(nvNumSecteur => {
    this.articleForm.patchValue({ numSectEco: nvNumSecteur });
    this.loadSousSecteurs(nvNumSecteur, data);
  });
}

private loadSousSecteurs(numSectEco: number, data: any): void {
  this.articleService.getSousSecteurs(numSectEco).subscribe(sousSecteurs => {
    this.sousSecteurs = sousSecteurs;
    if (data.numSSectEco) {
      this.loadSSecteurByDesignation(data.numSSectEco, numSectEco, data);
    }
  });
}

private loadSSecteurByDesignation(numSSectEco: number, numSectEco: number, data: any): void {
  this.soussecteurService.getSSecteurByDesignation(String(numSSectEco)).subscribe(nvNumSSecteur => {
    this.articleForm.patchValue({ numSSectEco: nvNumSSecteur });
    this.loadFamilles(numSectEco, nvNumSSecteur, data);
  });
}

private loadFamilles(numSectEco: number, numSSectEco: number, data: any): void {
  this.articleService.getFamilles(numSectEco, numSSectEco).subscribe(familles => {
    this.familles = familles;
    if (data.numFamille) {
      this.loadFamilleByDesignation(data.numFamille, numSectEco, numSSectEco, data);
    }
  });
}

private loadSousFamilles(numSectEco: number, numSSectEco: number, numFamille: number, data: any): void {
  this.articleService.getSousFamilles(numSectEco, numSSectEco, numFamille).subscribe(sousFamilles => {
    this.sousFamilles = sousFamilles;
    if (data.numSFamille) {
      this.loadSFamilleByDesignation(data.numSFamille, numSectEco, numSSectEco, numFamille, data);
    }
  });
}

private loadFamilleByDesignation(numFamille: number, numSectEco: number, numSSectEco: number, data: any): void {
  this.familleService.getFamilleByDesignation(String(numFamille), numSectEco, numSSectEco).subscribe(nvNumFamille => {
    this.articleForm.patchValue({ numFamille: nvNumFamille });
    this.loadSousFamilles(numSectEco, numSSectEco, nvNumFamille, data);
  });
}

private loadSFamilleByDesignation(numSFamille: number, numSectEco: number, numSSectEco: number, numFamille: number, data: any): void {
  this.sfamilleService.getSFamilleByDesignation(String(numSFamille), numSectEco, numSSectEco, numFamille).subscribe(nvNumSfamille => {
    this.articleForm.patchValue({ numSFamille: nvNumSfamille });
  });
}

private handleError(context: string, error: any): void {
  console.error(`Erreur lors du chargement des ${context}:`, error);
}

onFormSubmit(): void {
  const article: ArticleDTO = this.articleForm.value;
  article.historique = Number(article.historique);
  delete article.createdAt;
 
  console.log(article);
  if (this.articleForm.valid) {
    if (this.isEditMode) {
      this.articleService.updateArticle(this.data.numArticle, article).subscribe({
        next: (val: any) => {
          console.log(val);
          this._coreService.openSnackBar('Article Modifié', 'Ok');
          this._dialogRef.close(true);
        },
        error: (err: any) => {
          console.error('Erreur lors de la mise à jour de l\'article:', err);
        }
      });
    } else {
      this.articleService.addArticle(article).subscribe({
        next: (val: any) => {
          console.log(val);
          this._coreService.openSnackBar('Article Ajouté', 'Ok');
          this._dialogRef.close(val);
        },
        error: (err: any) => {
          console.error('Erreur lors de l\'ajout de l\'article:', err);
        }
      });
    }
  }
}
}
