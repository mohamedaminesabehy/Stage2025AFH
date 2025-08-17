import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DecompteAddEditComponent } from '../../decompte-add-edit.component';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import { CoreService } from 'src/app/services/core/core.service';
import { DecompteArticleService } from 'src/app/services/decompteArticle/decompte-article.service';
import { PrmlotService } from 'src/app/services/prmlot/prmlot.service';
import { forkJoin } from 'rxjs';
import { MrclotService } from 'src/app/services/mrclot/mrclot.service';
import { validateurAppro } from 'src/app/services/ApproListe/validateurAppro';
import { validateurTravaux } from 'src/app/services/TravauxListe/validateurTravaux';
import { MarcheService } from 'src/app/services/marche/marche.service';
import { DecMntService } from 'src/app/services/decMnt/dec-mnt.service';
import { DecompteService } from 'src/app/services/decompte/decompte.service';
import { CustomDateAdapter } from 'src/app/services/Dateadaptater/CustomDateAdapter';
import { PenaliteService } from 'src/app/services/penalite/penalite.service';
import { MrcPenaliteService } from 'src/app/services/mrcPenalite/mrc-penalite.service';
import { DecPenaliteService } from 'src/app/services/decPenalite/dec-penalite.service';

@Component({
  selector: 'app-decompte-article-edit',
  standalone: true,
  imports: [
    DecompteAddEditComponent,
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatTableModule,
    MatGridListModule,
    MatRadioModule,
    MatTooltipModule,
    FormsModule],
  templateUrl: './decompte-article-edit.component.html',
  styleUrl: './decompte-article-edit.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ]
})
export class DecompteArticleEditComponent implements OnInit {

  decompteArticleForm: FormGroup;
  selectedIndex = 0;
  loadingError: string | null = null;
  numMarche!: number;
  numEtape!: number;
  typeDecompte!: number;
  numPieceFourn!: number;
  isLoading = false;
  decArticlesTravaux: any[] = [];
  decArticlesAppros: any[] = [];
  lotDesignations: any[] = [];
  selectedLotTravaux: any; // Sélection indépendante pour Travaux
  selectedLotAppro: any;
  isReadOnly: boolean = false;
  isCalculated: boolean = false;
  isApproEmpty: boolean = true;
  isTravauxEmpty: boolean = true;
  isLotApproSelected: boolean = false;
  isLotTravauxSelected: boolean = false;
  isButtonDisabled: boolean = true;
  pctRemise!: number;
  decTravauxHT: number | string = 0;
  decTravauxTVA: number | string = 0;
  decTravauxTTC: number | string = 0;
  decApproHT: number | string = 0;
  decApproTVA: number | string = 0;
  decApproTTC: number | string = 0;
  decAppro: number | string = 0;
  decImposable: number | string = 0;
  decAvance: number | string = 0;
  exonerationType: number = 0;
  prmPenalites: any[] = [];
  detailsExono: any;
  
  currentPageTravaux = 0;
  pageSizeTravaux = 10;
  totalPagesTravaux = 0;
  totalElementsTravaux = 0;
  modifiedTravauxMap: Map<number, any> = new Map(); 

  currentPageAppro = 0;
  pageSizeAppro = 10;
  totalPagesAppro = 0;
  totalElementsAppro = 0;
  modifiedApproMap: Map<number, any> = new Map(); 

  modifiedArticles: any[] = [];


  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private _dialogRef: MatDialogRef<DecompteArticleEditComponent>,
    private dialog: MatDialog,
    public _spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private decArticleService: DecompteArticleService,
    private decompteService: DecompteService,
    private prmLotService: PrmlotService,
    private mrcLotsService: MrclotService,
    private _coreService: CoreService,
    private marcheService: MarcheService,
    private _typePenaliteService: PenaliteService,
    private mrcPenaliteService: MrcPenaliteService,
    private decPenaliteService: DecPenaliteService,
    private decMntService: DecMntService
  ) {
    this.decompteArticleForm = this.fb.group({
      decFraisEnrg: [null],
      decAutreMnt: [null],
      DecArticlesTravaux: this.fb.array([], { asyncValidators: [validateurTravaux()] }),
      DecArticlesAppros: this.fb.array([], { asyncValidators: [validateurAppro()] }),
      exonerationType: [null, Validators.required],
      mntExPen: [null],
      dateExPen: [''],
      designationExPen: [''],
      remarqueDec: ['']
    });

  };

  ngOnInit(): void {
    this.data.selectedDecompteArticle.forEach(decompteArticle => {
      console.log(decompteArticle)
      this.numMarche = decompteArticle.selected.numMarche;
      this.numEtape = decompteArticle.selected.numEtape;
      this.numPieceFourn = decompteArticle.selected.numPieceFourn;
      this.isReadOnly = this.data.isReadOnly;
      console.log("dsqdqsdqsd"+ this.isReadOnly)
      this.typeDecompte = decompteArticle.selected.idTypeDec;
      this.getDecMnts();
      this.loadDecArticleLots();
      this.getDetailsMarcheForpctRemise();
      //this.getDecompteDetails();
      this.getPenalites();
      this.decPenaliteService.getDecPenalite(this.numMarche, 2, this.numPieceFourn).subscribe(
        (decPenalite: any) => {
          this.mapDecPenaliteToForm(decPenalite);
        },
        (error) => {
          console.error('Erreur lors de la récupération de DecPenalite', error);
        }
      );
    });
  }

  getPenalites(): void {
    this._typePenaliteService.getTypePenalitesList().subscribe((res) => {
      this.prmPenalites = res;
      console.log(this.prmPenalites);
    });
  }

  mapDecPenaliteToForm(decPenalite: any): void {
    if (decPenalite) {
      console.log(decPenalite)
      this.decompteArticleForm.patchValue({
        exonerationType: decPenalite.exonerationType,
        mntExPen: decPenalite.montantPenAutre,
        dateExPen: decPenalite.datePen ? new Date(decPenalite.datePen) : null,
        designationExPen: decPenalite.idTypePen.designation,
        remarqueDec: decPenalite.designation
      });
      this.decompteArticleForm.get('designationExPen')?.disable();
      this.decompteArticleForm.get('dateExPen')?.clearValidators();
      this.decompteArticleForm.get('dateExPen')?.updateValueAndValidity();
    }
    else {
      this.decompteArticleForm.patchValue({
        exonerationType: null,
        mntExPen: null,
        dateExPen: null,
        designationExPen: 'خصومات مختلفة',
        remarqueDec: ''
      });
      this.decompteArticleForm.get('designationExPen')?.disable();
    }
  }



  selectedIndexChange(val: number) {
    this.selectedIndex = val;
  }

  onNoClick(): void {
    this._dialogRef.close()
  }

  getDetailsMarcheForpctRemise() {
    this.marcheService.getMarcheById(this.numMarche).subscribe(res => {
      console.log(res)
      this.pctRemise = res.pctRemise ?? 0;
      this.decompteService.getDecompteDetails(this.numMarche, this.numPieceFourn).subscribe(res => {
        if (res.exPen != null) {
          this.decompteArticleForm.get('exonerationType')?.setValue(res.exPen);
        }
      })
    })
  }

  getDecMnts() {
    this.decMntService.getDecMnt(this.numMarche, this.numPieceFourn).subscribe(Mnts => {
      console.log(Mnts);
      if (Mnts == null) {
        this.decTravauxHT = "montant non disponible";
        this.decTravauxTVA = "montant non disponible";
        this.decTravauxTTC = "montant non disponible";
        this.decApproHT = "montant non disponible";
        this.decApproTVA = "montant non disponible";
        this.decApproTTC = "montant non disponible";
        this.decAppro = "montant non disponible";
        this.decImposable = "montant non disponible";
        this.decAvance = "montant non disponible"
        this.decompteArticleForm.patchValue({
          decFraisEnrg: "montant non disponible",
          decAutreMnt: "montant non disponible"
        });
      } else {
        this.decTravauxHT = Mnts.decTravauxHt;
        this.decTravauxTVA = Mnts.decTravauxTva;
        this.decTravauxTTC = Mnts.decTravauxTtc;
        this.decApproHT = Mnts.decAproHt;
        this.decApproTVA = Mnts.decAproTva;
        this.decApproTTC = Mnts.decAproTtc;
        this.decAppro = Mnts.decApro;
        this.decImposable = Mnts.decImposable;
        this.decAvance = Mnts.decAvance;
        this.decompteArticleForm.patchValue({
          decFraisEnrg: Mnts.decFraisEnrg,
          decAutreMnt: Mnts.decAutreMnt
        });
      }
    })
  }

  loadDecArticleLots() {
    this.mrcLotsService.getMrcLotsForMarche(this.numMarche).subscribe((lots) => {
      this.lotDesignations = lots.map(lot => lot.idPrmLot);
      console.log(this.lotDesignations)
    })
  }

  resetSelectionTravaux() {
    this.selectedLotTravaux = null;  // Réinitialise la sélection
    this.decArticlesTravaux = [];
    this.isButtonDisabled = true;
    this.isLotTravauxSelected = false;

  }

  resetSelectionAppro() {
    this.selectedLotAppro = null;  // Réinitialise la sélection
    this.decArticlesAppros = [];
    this.isButtonDisabled = true;
    this.isLotApproSelected = false;

  }






  loadPaginatedTravaux(): void {
    if (!this.selectedLotTravaux) return;
  
    this._spinnerService.show();
  
    this.decArticleService.getDecArticlesTravauxPagin(
      this.numMarche,
      this.selectedLotTravaux,
      this.numPieceFourn,
      this.numEtape,
      this.currentPageTravaux,
      this.pageSizeTravaux
    ).subscribe({
      next: (response: any) => {
        if (response?.content) {
          // Mise à jour des articles avec cache
          this.decArticlesTravaux = response.content.map(article => {
            const cached = this.modifiedTravauxMap.get(article.id.idArticle);
            return cached ? { ...article, ...cached } : article;
          });
  
          // Mise à jour de isTravauxEmpty (si la liste est vide)
          this.isTravauxEmpty = this.decArticlesTravaux.length === 0;
  
          // Autres valeurs de pagination
          this.totalElementsTravaux = response.totalElements;
          this.totalPagesTravaux = response.totalPages;
          this.currentPageTravaux = response.number;
  
          // Récupérer et vider le FormArray
          const array = this.decompteArticleForm.get('DecArticlesTravaux') as FormArray;
          array.clear();
  
          this.decArticlesTravaux.forEach(article => {
            const group = this.fb.group({
              idArticle: [article.id.idArticle],
              codeArticle: [article.codeArticle],
              designationFr: [article.designationFr],
              libUnite: [article.libUnite],
              quantiteMrc: [article.quantiteMrc],
              quantitePrec: [article.quantitePrec],
              prixUnitaire: [article.prixUnitaire],
              tva: [article.tva],
              quantite: [article.quantite],
              pctRea: [article.pctRea],
              travHtRea: [{ value: article.travHtRea, disabled: true }]
            });
  
            // Sauvegarde automatique des modifications
            group.valueChanges.subscribe(value => {
              Object.keys(value).forEach(key => {
                if (group.get(key)) {
                  group.get(key)?.setValue(value[key], { emitEvent: false }); // Important pour ne pas créer de boucle infinie
                }
              });
            
              group.markAsDirty();
              group.markAsTouched();
              this.modifiedTravauxMap.set(value.idArticle, value); // facultatif, si tu veux garder le cache
              this.isTravauxEmpty = false;
              this.modifiedArticles.push(value);
            });
            
  
            array.push(group);
          });
        }
      },
      error: (err) => {
        console.error("Erreur pagination Travaux", err);
      },
      complete: () => this._spinnerService.hide()
    });
  }
  
  onSelectLotTravauxPagin(event: any) {
    if (this.selectedIndex === 0) {
      this.selectedLotTravaux = event.value;
      this.isLotTravauxSelected = !!event.value;
      //this.currentPageTravaux = 0; // Réinitialiser à la première page
      this.loadPaginatedTravaux();
    }
  }

  refreshDecArticlesTravauxPagin(selectedLot: string) {
    this.selectedLotTravaux = selectedLot;
    this.loadPaginatedTravaux();
  }

  refreshDecArticlesTravaux(selectedLot: string) {
    // Récupérer les articles Travaux actualisés après le calcul
    this.decArticleService.getDecArticlesTravaux(this.numMarche, selectedLot, this.numPieceFourn, this.numEtape).subscribe((updatedArticles) => {
      this.decArticlesTravaux = updatedArticles;
      console.log('Articles Travaux mis à jour:', this.decArticlesTravaux);

      // Mettre à jour le FormArray avec les nouveaux articles Travaux
      const articlesTravauxArray = this.decompteArticleForm.get('DecArticlesTravaux') as FormArray;
      articlesTravauxArray.clear(); // Vider les articles existants
      this.decArticlesTravaux.forEach(article => {
        articlesTravauxArray.push(this.fb.group({
          idArticle: [article.id.idArticle],
          codeArticle: [article.codeArticle],
          numArticle: [article.id.numArticle],
          designationFr: [article.designationFr],
          libUnite: [article.libUnite],
          quantiteMrc: [article.quantiteMrc],
          quantitePrec: [article.quantitePrec],
          prixUnitaire: [article.prixUnitaire],
          tva: [article.tva],
          quantite: [article.quantite],  // Champ modifiable
          pctRea: [article.pctRea],  // Champ modifiable
          travHtRea: [{ value: article.travHtRea, disabled: true }]
        }));
      });
    });
  }
  
  updateArticlesTravaux(selectedLot: string, requestBody: any) {
    console.log("Mise à jour des Travaux");

    // Appel API pour mettre à jour les articles Travaux
    this.decArticleService.updateDecArticlesTravaux(this.numMarche, selectedLot, this.numPieceFourn, this.numEtape, requestBody).subscribe(
      response => {
        console.log('Réponse Travaux:', response);

        // Calcul des montants après mise à jour des travaux
        this.calculateMontantsAfterUpdateTravaux(selectedLot);
      },
      error => {
        console.error('Erreur lors de la mise à jour des Travaux:', error);
      }
    );
  }

//--------------------------//

  onSelectLotApproPagin(event: any) {
    if (this.selectedIndex === 1) {
      const idLot = event.value;
      this.selectedLotAppro = idLot; // Mettre à jour la sélection Appro
      this.isLotApproSelected = !!idLot;
      this.loadPaginatedAppro();
    }
  }

  loadPaginatedAppro(): void {
    if (!this.selectedLotAppro) return;
  
    this._spinnerService.show();
  
    this.decArticleService.getDecArticlesApproPagin(
      this.numMarche,
      this.selectedLotAppro,
      this.numPieceFourn,
      this.numEtape,
      this.currentPageAppro,
      this.pageSizeAppro
    ).subscribe({
      next: (response: any) => {
        if (response?.content) {
          // Mise à jour des articles avec cache
          this.decArticlesAppros = response.content.map(article => {
            const cached = this.modifiedApproMap.get(article.id.idArticle);
            return cached ? { ...article, ...cached } : article;
          });
  
          // Mise à jour de isTravauxEmpty (si la liste est vide)
          this.isApproEmpty = this.decArticlesAppros.length === 0;
  
          // Autres valeurs de pagination
          this.totalElementsAppro = response.totalElements;
          this.totalPagesAppro = response.totalPages;
          this.currentPageAppro = response.number;
  
          // Récupérer et vider le FormArray
          const array = this.decompteArticleForm.get('DecArticlesAppros') as FormArray;
          array.clear();
  
          this.decArticlesAppros.forEach(article => {
            const group = this.fb.group({
              idArticle: [article.id.idArticle],
              codeArticle: [article.codeArticle],
              numArticle: [article.id.numArticle],
              designationFr: [article.designationFr],
              libUnite: [article.libUnite],
              quantiteMrc: [article.quantiteMrc],
              quantitePrec: [article.quantitePrec],
              prixUnitaire: [article.prixUnitaire],
              tva: [article.tva],
              quantite: [article.quantite],
            });
  
            // Sauvegarde automatique des modifications
            group.valueChanges.subscribe(value => {
              this.modifiedApproMap.set(value.idArticle, value);
              group.markAsDirty();  // Marque comme modifié
              group.markAsTouched(); // Marque comme touché
              this.isApproEmpty = false; // Réinitialiser si des données sont modifiées
              this.modifiedArticles.push(value);

            });
  
            array.push(group);
          });
        }
      },
      error: (err) => {
        console.error("Erreur pagination Appros", err);
      },
      complete: () => this._spinnerService.hide()
    });
  }

  refreshDecArticlesAppro(selectedLot: string) {
    // Récupérer les articles Travaux actualisés après le calcul
    this.decArticleService.getDecArticlesAppro(this.numMarche, selectedLot, this.numPieceFourn, this.numEtape).subscribe((updatedArticles) => {
      this.decArticlesAppros = updatedArticles;
      console.log('Articles Appros mis à jour:', this.decArticlesAppros);

      // Mettre à jour le FormArray avec les nouveaux articles Travaux
      const articlesApprosArray = this.decompteArticleForm.get('DecArticlesAppros') as FormArray;
      articlesApprosArray.clear(); // Vider les articles existants
      this.decArticlesAppros.forEach(article => {
        articlesApprosArray.push(this.fb.group({
          idArticle: [article.id.idArticle],
          codeArticle: [article.codeArticle],
          numArticle: [article.id.numArticle],
          designationFr: [article.designationFr],
          libUnite: [article.libUnite],
          quantiteMrc: [article.quantiteMrc],
          quantitePrec: [article.quantitePrec],
          prixUnitaire: [article.prixUnitaire],
          tva: [article.tva],
          quantite: [article.quantite]
        }));
      });
    });
  }

  refreshDecArticlesApproPagin(selectedLot: string) {
    this.selectedLotAppro = selectedLot;
    this.loadPaginatedAppro();
  }

  updateArticlesAppro(selectedLot: string, requestBody: any) {
    console.log("Mise à jour des Appro");

    // Appel API pour mettre à jour les articles Appro
    this.decArticleService.updateDecArticlesAppro(this.numMarche, selectedLot, this.numPieceFourn, this.numEtape, requestBody).subscribe(
      response => {
        console.log('Réponse Appro:', response);

        // Calcul des montants après mise à jour des travaux (si nécessaire pour Appro)
        this.calculateMontantsAfterUpdateAppro(selectedLot);
      },
      error => {
        console.error('Erreur lors de la mise à jour des Appro:', error);
      }
    );
  }

//--------------------------//
  submitArticlesAproTrav(formArrayName: string, selectedLot: string) {
    console.log(formArrayName);  // Affiche "Travaux" ou "Appro" selon la sélection
    console.log('Lot sélectionné:', selectedLot);  // Affiche le lot sélectionné

    // Récupérer les articles à mettre à jour à partir du formulaire
    const articlesToUpdate = this.getArticlesToUpdate(formArrayName);
    console.log(articlesToUpdate);  // Affiche les articles à mettre à jour

    // Construire la structure de la requête en fonction du type (Travaux ou Appro)
    const requestBody = this.buildRequestBody(this.modifiedArticles, selectedLot);
    console.log('Request Body:', requestBody);

    // Afficher le spinner pendant que l'appel API est effectué

    // Différer la logique selon le type de décompte : Travaux ou Appro
    if (this.selectedIndex === 0) {
      this.updateArticlesTravaux(selectedLot, requestBody);
    } else if (this.selectedIndex === 1) {
      this.updateArticlesAppro(selectedLot, requestBody);
    }
  }

  onSubmitDecArticles() {
    if (this.selectedIndex === 0) {
      console.log("im Travaux")
      this.submitArticlesAproTrav('DecArticlesTravaux', this.selectedLotTravaux);
    } else if (this.selectedIndex === 1) {
      console.log("im Appro")
      this.submitArticlesAproTrav('DecArticlesAppros', this.selectedLotAppro);
    } else if (this.selectedIndex === 2) {
      console.log("im Penalite")
      this.submitPenaliteRetenue();
      this.updateExPenDecompte();
      this.submitExoneration();
      this._coreService.openSnackBar("Soumission efféctuée avec succées", "OK");
    }
  }

  getArticlesToUpdate(formArrayName: string) {
    const formArray = this.decompteArticleForm.get(formArrayName);
    return formArray?.value;  // Récupérer les articles du FormArray générique
  }
  

  buildRequestBody(articles: any[], selectedLot: string) {
    return articles.map(article => {
      const updatedColumns = {
        quantite: parseFloat(article.quantite),
        tva: parseFloat(article.tva),
      };

      //const selectedLot = this.selectedIndex === 0 ? this.selectedLotTravaux : this.selectedLotAppro;
      if (this.selectedIndex === 0) {
        updatedColumns['pctRea'] = article.pctRea;
      }
      if (this.selectedIndex === 1) {
        delete updatedColumns['pctRea'];
      }
      return {
        idDecArticle: {
          numMarche: this.numMarche,  // Assurez-vous que cette variable est définie quelque part dans votre code
          idLot: selectedLot,
          numArticle: article.numArticle,
          numPieceFourn: this.numPieceFourn,
          idArticle: article.idArticle,
          ap: this.selectedIndex === 0 ? 0 : 1,  // 0 pour Travaux, 1 pour Appro
        },
        updatedColumns: updatedColumns
      };

    });

  }



  onSelectLotTravaux(event: any) {
    if (this.selectedIndex === 0) {
      const idLot = event.value;
      this.selectedLotTravaux = idLot; // Mettre à jour la sélection Travaux
      this.isLotTravauxSelected = !!idLot;
      this._spinnerService.show(); // Afficher le spinner pendant l'appel API
  
      this.decArticleService.getDecArticlesTravaux(this.numMarche, idLot, this.numPieceFourn, this.numEtape).subscribe({
        next: (res) => {
          this.decArticlesTravaux = res;
          this.isTravauxEmpty = this.decArticlesTravaux.length === 0;
  
          // Vider et mettre à jour le FormArray pour les Travaux
          const articlesTravauxArray = this.decompteArticleForm.get('DecArticlesTravaux') as FormArray;
          articlesTravauxArray.clear(); // Vider les articles existants
  
          // Ajouter les nouveaux articles Travaux au FormArray
          this.decArticlesTravaux.forEach(article => {
            articlesTravauxArray.push(this.fb.group({
              idArticle: [article.id.idArticle],
              codeArticle: [article.codeArticle],
              numArticle: [article.id.numArticle],
              designationFr: [article.designationFr],
              libUnite: [article.libUnite],
              quantiteMrc: [article.quantiteMrc],
              quantitePrec: [article.quantitePrec],
              prixUnitaire: [article.prixUnitaire],
              tva: [article.tva],
              quantite: [article.quantite],  // Champ modifiable
              pctRea: [article.pctRea],  // Champ modifiable
              travHtRea: [{ value: article.travHtRea, disabled: true }]
            }));
          });
  
          this._spinnerService.hide(); // Cacher le spinner après la réponse
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des articles Travaux', err);
          this._spinnerService.hide(); // Cacher le spinner en cas d'erreur
        }
      });
    }
  }

  onSelectLotAppro(event: any) {
    if (this.selectedIndex === 1) {
      const idLot = event.value;
      this.selectedLotAppro = idLot; // Mettre à jour la sélection Appro
      this.isLotApproSelected = !!idLot;
      //this._spinnerService.show(); // Afficher le spinner pendant l'appel API
  
      this.decArticleService.getDecArticlesAppro(this.numMarche, idLot, this.numPieceFourn, this.numEtape).subscribe({
        next: (res) => {
          this.decArticlesAppros = res;
          this.isApproEmpty = this.decArticlesAppros.length === 0; // Si la liste est vide
  
          // Vider et mettre à jour le FormArray pour les Appro
          const articlesApproArray = this.decompteArticleForm.get('DecArticlesAppros') as FormArray;
          articlesApproArray.clear(); // Vider les articles existants
  
          // Ajouter les nouveaux articles Appro au FormArray
          this.decArticlesAppros.forEach(article => {
            articlesApproArray.push(this.fb.group({
              idArticle: [article.id.idArticle],
              codeArticle: [article.codeArticle],
              numArticle: [article.id.numArticle],
              designationFr: [article.designationFr],
              libUnite: [article.libUnite],
              quantiteMrc: [article.quantiteMrc],
              quantitePrec: [article.quantitePrec],
              prixUnitaire: [article.prixUnitaire],
              tva: [article.tva],
              quantite: [article.quantite],  // Champ modifiable
            }));
          });
  
          //this._spinnerService.hide(); // Cacher le spinner après la réponse
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des articles Appro', err);
          //this._spinnerService.hide(); // Cacher le spinner en cas d'erreur
        },
        complete: () => {
          this._spinnerService.hide();
        }
      });
    }
  }


  calculateMontantsAfterUpdateTravaux(selectedLot: string) {
    this._spinnerService.show();
    // Calcul des montants après la mise à jour des travaux
    this.decArticleService.calculateMontantsFinalDecArticlesOrd(this.numMarche, this.numPieceFourn, this.numEtape).subscribe(
      result => {
        console.log('Résultat calcul des montants:', result);
        this._coreService.openSnackBar("Calcul des montants effectué avec succès", "OK");

        // Mise à jour du formulaire avec les articles actualisés après le calcul des montants
        this.refreshDecArticlesTravauxPagin(selectedLot);
        this.getDecMnts();
      },
      error => {
        console.error('Erreur lors du calcul des montants:', error);
      },
      () => {
        // Cacher le spinner une fois l'opération terminée
        this._spinnerService.hide();
      }
    );
  }

  calculateMontantsAfterUpdateAppro(selectedLot: string) {
    // Logique pour calculer les montants des articles Appro si nécessaire
    this._spinnerService.show();
    this.decArticleService.calculateMontantsFinalDecArticlesOrd(this.numMarche, this.numPieceFourn, this.numEtape).subscribe(
      result => {
        console.log('Résultat calcul des montants Appro:', result);
        this._coreService.openSnackBar("Calcul des montants effectué avec succès", "OK");
        this.refreshDecArticlesApproPagin(selectedLot)
        this.getDecMnts();
      },
      error => {
        console.error('Erreur lors du calcul des montants Appro:', error);
      },
      () => {
        // Cacher le spinner une fois l'opération terminée
        this._spinnerService.hide();
      }
    );
  }

  nextPageAppro() {
    if ((this.currentPageAppro + 1) < this.totalPagesAppro) {
      this.currentPageAppro++;
      this.loadPaginatedAppro();
    }
  }
  
  prevPageAppro(): void {
    if (this.currentPageAppro > 0) {
      this.currentPageAppro--;
      this.loadPaginatedAppro();
    }
  }
  
  firstPageAppro(): void {
    this.currentPageAppro = 0;
    this.loadPaginatedAppro();
  }
  
  lastPageAppro(): void {
    this.currentPageAppro = this.totalPagesAppro - 1;
    this.loadPaginatedAppro();
  }

  nextPageTravaux() {
    if ((this.currentPageTravaux + 1) < this.totalPagesTravaux) {
      this.currentPageTravaux++;
      this.loadPaginatedTravaux();
    }
  }
  
  prevPageTravaux(): void {
    if (this.currentPageTravaux > 0) {
      this.currentPageTravaux--;
      this.loadPaginatedTravaux();
    }
  }
  
  firstPageTravaux(): void {
    this.currentPageTravaux = 0;
    this.loadPaginatedTravaux();
  }
  
  lastPageTravaux(): void {
    this.currentPageTravaux = this.totalPagesTravaux - 1;
    this.loadPaginatedTravaux();
  }
  

  calculMontantDecAvanceDecompte() {
    this._spinnerService.show();
    // Calcul des montants après la mise à jour des travaux
    this.decompteService.calculMontantDecAvanceDecompte(this.numMarche).subscribe(
      result => {
        console.log('Résultat calcul des montants:', result);
        this._coreService.openSnackBar("Calcul des montants effectué avec succès", "OK");
      },
      error => {
        console.error('Erreur lors du calcul des montants:', error);
      },
      () => {
        // Cacher le spinner une fois l'opération terminée
        this._spinnerService.hide();
      }
    );
  }

  calculMontantDecOrdDecompte() {
    this._spinnerService.show();
    // Calcul des montants après la mise à jour des travaux
    this.decompteService.calculMontantDecOrdDecompte(this.numMarche, this.numPieceFourn, this.numEtape).subscribe(
      result => {
        console.log('Résultat calcul des montants:', result);
        this._coreService.openSnackBar("Calcul des montants effectué avec succès", "OK");
      },
      error => {
        console.error('Erreur lors du calcul des montants:', error);
      },
      () => {
        // Cacher le spinner une fois l'opération terminée
        this._spinnerService.hide();
      }
    );
  }

  sendMntsDatatoParent(){
    this.decMntService.getDecMnt(this.numMarche, this.numPieceFourn).subscribe(Mnts => {
      console.log(this.numPieceFourn)
      //const decMntsData = Mnts; 
       const decMntsData = {
        ...Mnts,
        index: this.numPieceFourn
      }; 
      console.log(decMntsData);
      this.decompteService.sendDecMntsData(decMntsData);
    })
  }
  submitPenaliteRetenue() {
    console.log("im penalite");
    const fraisEnrg = this.decompteArticleForm.get('decFraisEnrg')?.value;
    const autreMnt = this.decompteArticleForm.get('decAutreMnt')?.value;
    console.log(fraisEnrg);
    console.log(autreMnt);
 /*    if (fraisEnrg == null || autreMnt == null) {
      console.error('Les champs de frais d\'enregistrement ou d\'autre montant sont vides');
      return;
    } */
    const requestBody = {
      idDecMnt: {
        numMarche: this.numMarche,
        numPieceFourn: this.numPieceFourn
      },
      updatedDecMntColumns: {
        decFraisEnrg: fraisEnrg,
        decAutreMnt: autreMnt
      }
    };
    console.log(requestBody)
    this.decMntService.updateDecMntOrd(this.numMarche, this.numPieceFourn, requestBody).subscribe(res => {
      console.log(res)
      if (this.typeDecompte === 1) {
        this.calculMontantDecOrdDecompte();
        this.getDecMnts();
      } else if (this.typeDecompte === 3) {
        this.calculMontantDecAvanceDecompte();
        this.getDecMnts();
      }
      this.sendMntsDatatoParent();
    })
  }

  updateExPenDecompte() {
    const exonerationType = this.decompteArticleForm.get('exonerationType')?.value;
    if (exonerationType === 0) {
      this.decompteService.updateExPen(this.numMarche, this.numPieceFourn, 0).subscribe((res => {
        console.log('ExPen updated to 0');
      }))
    }
    else if (exonerationType === 1) {
      this.decompteService.updateExPen(this.numMarche, this.numPieceFourn, 1).subscribe((res => {
        console.log('ExPen updated to 1');
      }))
    }
  }

  submitExoneration() {
    const exonerationType = this.decompteArticleForm.get('exonerationType')?.value;
    if (exonerationType !== null) {
      const exonerationDetails = {
        dateExPen: this.decompteArticleForm.get('dateExPen')?.value,
        mntExPen: this.decompteArticleForm.get('mntExPen')?.value,
        remarqueDec: this.decompteArticleForm.get('remarqueDec')?.value
      };
      const static_Num_Id_Type_Ex = 2;
      console.log("Exoneration Type:", exonerationType);
      console.log("Exoneration Details:", exonerationDetails);
      const requestBody = {
        numMarche: this.numMarche,
        numPieceFourn: this.numPieceFourn,
        idTypePen: {
          id: static_Num_Id_Type_Ex
        },
        numEtape: this.numEtape,
        datePen: exonerationDetails.dateExPen,
        montantPenAutre: exonerationDetails.mntExPen,
        designation: exonerationDetails.remarqueDec
      };

      console.log(requestBody);
      console.log(exonerationDetails)
      if (exonerationDetails.dateExPen && exonerationDetails.mntExPen && exonerationDetails.remarqueDec) {
        this.decPenaliteService.addDecPenalite(requestBody).subscribe(res => {
          console.log(res);
          console.log(exonerationType)
          if (this.typeDecompte === 1) {
            this.calculMontantDecOrdDecompte();
            this.getDecMnts();
          } else if (this.typeDecompte === 3) {
            this.calculMontantDecAvanceDecompte();
            this.getDecMnts();
          }
          this.sendMntsDatatoParent();
          this._dialogRef.close(requestBody)
        })
      }else {
        this._dialogRef.close()
      }

    }
  }


  get isPenaliteAndRetenueVisible() {
    return this.typeDecompte === 3;
  }

  get buttonLabel(): string {
    if (this.isPenaliteAndRetenueVisible) {
      this.selectedIndex = 2;
      return 'Soumettre Pénalité et Retenue';
    } else if (this.selectedIndex === 0) {
      return 'Soumettre Articles Travaux';
    } else if (this.selectedIndex === 1) {
      return 'Soumettre Articles Appro';
    } else {
      return 'Soumettre Pénalité et Retenue';
    }
  }

  get isButtonDecompteDisabled(): boolean {
    return (
      this.isReadOnly ||
      (this.selectedIndex === 0 && (this.isLotTravauxSelected === false || this.isTravauxEmpty)) ||
      (this.selectedIndex === 1 && (this.isLotApproSelected === false || this.isApproEmpty))
    );
  }

  get decFraisEnrgControl(): FormControl {
    return this.decompteArticleForm.get('decFraisEnrg') as FormControl
  }

  get decAutreMntControl(): FormControl {
    return this.decompteArticleForm.get('decAutreMnt') as FormControl
  }

  get ExonerationTypeControl(): FormControl {
    return this.decompteArticleForm.get('exonerationType') as FormControl
  }


  get datePenControl(): FormControl {
    return this.decompteArticleForm.get('datePen') as FormControl
  }

  get ExPenControl(): FormControl {
    return this.decompteArticleForm.get('ExPen') as FormControl
  }

  get mntExPenControl(): FormControl {
    return this.decompteArticleForm.get('mntExPen') as FormControl
  }

  get remarqueControl(): FormControl {
    return this.decompteArticleForm.get('Remarquedesignation') as FormControl
  }

}
