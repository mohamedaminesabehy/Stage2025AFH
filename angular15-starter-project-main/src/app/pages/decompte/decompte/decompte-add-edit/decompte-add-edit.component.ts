import { Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DecompteComponent } from '../decompte.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DecompteService } from 'src/app/services/decompte/decompte.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomDateAdapter } from 'src/app/services/Dateadaptater/CustomDateAdapter';
import { CoreService } from 'src/app/services/core/core.service';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';
import { validateurDecompte } from 'src/app/services/DecompteValidator/validateurDecompte';
import { DecompteArticleEditComponent } from './decompte-article-edit/decompte-article-edit/decompte-article-edit.component';
import { DecMntService } from 'src/app/services/decMnt/dec-mnt.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'src/assets/fonts/vfs_fonts.js';
import { forkJoin, Subscription } from 'rxjs';
import { MrclotService } from 'src/app/services/mrclot/mrclot.service';
import { DecompteArticleService } from 'src/app/services/decompteArticle/decompte-article.service';
import { DecLotServiceService } from 'src/app/services/decLotService/dec-lot-service.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/User/user.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { text } from 'stream/consumers';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
(pdfMake as any).fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Bold.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-BoldItalic.ttf'
  },
  Amiri: {
    normal: 'Amiri-Regular.ttf',
    bold: 'Amiri-Bold.ttf',
    italics: 'Amiri-Italic.ttf',
    bolditalics: 'Amiri-BoldItalic.ttf'
  }
};

@Component({
  selector: 'app-decompte-add-edit',
  standalone: true,
  imports: [DecompteComponent,
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatButtonModule,
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
  templateUrl: './decompte-add-edit.component.html',
  styleUrl: './decompte-add-edit.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ]
})
export class DecompteAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  pageIndex = 0;
  pageSize = 10;
  length = 0;
  loadingError: string | null = null;
  numMarche!: number;
  numEtape!: number;
  typeDecompte!: number;
  numPieceFourn!: number;
  numDecompte!: number;
  decImposable: number | string = 0;
  decAvance: number | string = 0;
  isNewDecompteAdded = false;
  selectedDecompteNuméro: string = '';
  decPdf: any[] = [];
  disableAddDecompteTypeAvance: boolean = false;
  decs: any[] = [];
  private decMntsSubscription!: Subscription;
  lotDesignations: any[] = [];
  lotIds: any[] = [];
  decMntGlobal: any;
  statuses: string[] = [];
  statutDecompteFin: any;
  isButtonSendDecToFin: boolean = true;
  message: string = '';
  numPieceFournForFinance!: number;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private _dialogRef: MatDialogRef<DecompteAddEditComponent>,
    private decompteService: DecompteService,
    public _spinnerService: SpinnerService,
    private _coreService: CoreService,
    private decMntService: DecMntService,
    private decArticleService: DecompteArticleService,
    private decLotService: DecLotServiceService,
    private mrcLotsService: MrclotService,
    private authService: AuthService,
    private dialog: MatDialog,
    public datePipe: DatePipe,
    private _snackBar: MatSnackBar) {
    this.form = this.fb.group({
      decomptes: this.fb.array([], { asyncValidators: [validateurDecompte()] }),
    })

  };
  
  formatNombre(val: any): string {
    return val != null
      ? (+val).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : '0.000';
  }

  ngOnInit(): void {
    console.log(this.data)
    this.numMarche = this.data.decompte.id;
    this.numEtape = this.data.decompte.etape;
    this.typeDecompte = this.data.decompte.typeDecompte;
    this.getDecomptes();
    this.loadDecomptes();
    this.checkDisableAddDecompteTypeAvance();


  }

  ngOnDestroy(): void {
    if (this.decMntsSubscription) {
      this.decMntsSubscription.unsubscribe();
    }
  }

  loadDecomptes() {
    this._spinnerService.show(); // Affiche le spinner

    this.decompteService.getAllDecomptesByNumMarche(this.numMarche).subscribe({
      next: (res) => {
        if (res && Array.isArray(res)) {
          this.decs = res;
          this.loadingError = null;

          // Tu peux aussi faire d'autres traitements ici si besoin
          this.checkDisableAddDecompteTypeAvance();
        } else {
          this.loadingError = "Aucun décompte trouvé pour ce marché.";
          this.decs = [];
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des décomptes :', err);
        this.loadingError = "Erreur lors du chargement des décomptes. Veuillez réessayer plus tard.";
      },
      complete: () => {
        this._spinnerService.hide(); // Cacher le spinner dans tous les cas
      }
    });
  }


  checkDisableAddDecompteTypeAvance() {
    if (this.typeDecompte === 3 && this.decs.length > 0) {
      this.disableAddDecompteTypeAvance = true;
      this.isNewDecompteAdded = true;
    } else {
      this.disableAddDecompteTypeAvance = false;
      this.isNewDecompteAdded = false;
    }
  }


  getDecMntsForMontantDecompteTypeDiffer(numPieceFourn: number, index: number) {
    console.log('numPieceFourn:', numPieceFourn);

    this.decMntService.getDecMnt(this.numMarche, numPieceFourn).subscribe(Mnts => {
      //console.log(Mnts);

      const decompteControl = this.decomptes.at(index);
      if (decompteControl) {
        if (this.typeDecompte === 3) {
          if (Mnts == null) {
            decompteControl.get('decAvance')?.setValue("montant non disponible");
          } else {
            decompteControl.get('decAvance')?.setValue(Mnts.decAvance);
          }
        } else {
          if (Mnts == null) {
            decompteControl.get('decImposable')?.setValue("montant non disponible");
          } else {
            decompteControl.get('decImposable')?.setValue(Mnts.decImposable);
          }
        }
      }
    });
  }

  getUpdatedDecompteMnt(index: number) {
    const decompteControl = this.decomptes.at(index);
    if (decompteControl) {
      if (this.decMntsSubscription) {
        this.decMntsSubscription.unsubscribe();
      }
      this.decMntsSubscription = this.decompteService.decomptes$.subscribe((decMntsData) => {
        if (decMntsData) {
          console.log('Données reçues du fils:', decMntsData);
          if (this.typeDecompte != 3) {
            decompteControl.get('decImposable')?.setValue(decMntsData.decImposable);
            this.decImposable = decompteControl.get('decImposable')?.value
          } else {
            decompteControl.get('decAvance')?.setValue(decMntsData.decAvance);
            this.decAvance = decompteControl.get('decAvance')?.value
          }

        }
      });
    }

  }

  addDynamicControlForGetting(decompteGroup: FormGroup): void {
    const controlName = (this.typeDecompte === 3) ? 'decAvance' : 'decImposable';
    const controlValue = (this.typeDecompte === 3) ? this.decAvance : this.decImposable;
    decompteGroup.addControl(controlName, this.fb.control({ value: controlValue, disabled: true }));
  }

  addDynamicControlForAdding(decompteGroup: FormGroup): void {
    const controlName = (this.typeDecompte === 3) ? 'decAvance' : 'decImposable';
    //const controlValue = (this.typeDecompte === 3) ? this.decAvance : this.decImposable;
    decompteGroup.addControl(controlName, this.fb.control({ value: null, disabled: true }));
  }

  getDecomptes() {
    const numMarche = this.data.decompte.id;
    const numEtape = this.data.decompte.etape;
    const idTypeDec = this.data.decompte.typeDecompte; // Récupérer typeDecompte

    this._spinnerService.show(); // Afficher le spinner pendant le chargement

    this.decompteService.getDecomptesByMarcheEtapeTypeDec(numMarche, numEtape, idTypeDec)
      .subscribe({
        next: (data: any) => {
          console.log(data);

          if (data && Array.isArray(data)) {
            // Réinitialiser les décomptes
            this.decomptes.clear();
            this.decPdf = data; // Sauvegarder les décomptes reçus

            // Boucle pour chaque décompte reçu
            data.forEach((decompte, index) => {
              console.log(decompte);

              const decompteGroup = this.fb.group({
                isNew: [false], // FormControl pour isNew
                numPieceFourn: [decompte.id.numPieceFourn], // FormControl pour numPieceFourn
                numDecompte: [decompte.numDecompte],
                datePiece: [decompte.datePiece], // FormControl pour datePiece
                selected: [false], // FormControl pour selected,
                soldeAvance: [decompte.soldeAvance]
              });
              this.addDynamicControlForGetting(decompteGroup); // Appel à la fonction pour ajouter le contrôle dynamique
              if (!decompte.isNew) {
                decompteGroup.get('datePiece')?.disable();
                decompteGroup.get('soldeAvance')?.disable();
                const manipulatedDate = new Date(new Date(decompte.datePiece).setDate(new Date(decompte.datePiece).getDate()));
                decompteGroup.get('datePiece')?.setValue(manipulatedDate);
              }

              this.decomptes.push(decompteGroup); // Ajouter le formulaire du décompte au tableau

              // Appeler des méthodes pour récupérer des montants ou mettre à jour l'affichage
              this.getDecMntsForMontantDecompteTypeDiffer(decompte.id.numPieceFourn, index);
              this.getUpdatedDecompteMnt(index);
              this.decompteService.getDecompteStatus(numMarche, decompte.id.numPieceFourn).subscribe(
                (response: any) => {
                  // Vérifie si la réponse contient un statut valide
                  if (response && response.statut) {
                    this.statuses[index] = response.statut;
                  } else {
                    this.statuses[index] = 'Statut non trouvé';  // Si pas de statut, mettre "Pas de status"
                  }
                  //console.log(this.statuses[index]);
                },
                (error) => {
                  // Si une erreur se produit (par exemple un problème de réseau)
                  this.statuses[index] = 'Statut non trouvé';  // En cas d'erreur, mettre aussi "Pas de status"
                  console.log('Erreur:', error);
                }
              );

              //console.log(this.decomptes.at(index).value);
            });

            this.loadingError = null; // Réinitialiser le message d'erreur si les décomptes sont trouvés
          } else {
            // Gérer le cas où aucun décompte n'est trouvé
            this.loadingError = 'Aucun décompte trouvé pour ces critères.';
          }
        },
        error: (err: any) => {
          console.error('Erreur de chargement des decomptes:', err);
          this.loadingError = 'Erreur lors du chargement des décomptes. Veuillez réessayer plus tard.';
          this._spinnerService.hide(); // Cacher le spinner en cas d'erreur
        },
        complete: () => {
          // Decompte Avance pour le typeDecompte === 3
          if (this.typeDecompte === 3 && this.decomptes.length === 1) {
            this.isNewDecompteAdded = true;
          }
          this._spinnerService.hide(); // Cacher le spinner une fois le chargement terminé
        }
      });
  }

  async addDecompte(): Promise<void> {

    const selectedExisting = this.decomptes.controls.find(control => control.get('selected')?.value && !control.get('isNew')?.value);
    if (selectedExisting) {
      // ✅ 2. Optionnel : désélectionner automatiquement le décompte existant
      selectedExisting.get('selected')?.setValue(null);
      selectedExisting.get('datePiece')?.disable();
      return;
    }
    if (this.typeDecompte === 3 && this.decomptes.length > 0) {
      return;
    }
    const existingNumPieceFourns = this.decomptes.controls.map(control => control.get('numPieceFourn')?.value);
    const newNumPieceFourn = existingNumPieceFourns.length > 0
      ? Math.max(...existingNumPieceFourns) + 1
      : 1;

    const maxNumDecompte = await this.decompteService.getMaxNumDecompte(this.numMarche);
    const newDecompteGroup = this.fb.group({
      isNew: [true],
      numPieceFourn: [{ value: newNumPieceFourn, disabled: false }],
      datePiece: [{ value: null, disabled: false }, Validators.required],
      numMarche: this.numMarche,
      numDecompte: [{ value: maxNumDecompte + 1, disabled: true }],
      numEtape: this.numEtape,
      idTypeDec: this.typeDecompte,
      decImposable: [{ value: null, disabled: true }],  // Ajout du contrôle pour montantDecompte
      selected: [{
        numMarche: this.numMarche,
        numEtape: this.numEtape,
        numPieceFourn: newNumPieceFourn,
        idTypeDec: this.typeDecompte,
        numDecompte: maxNumDecompte + 1
      }],
      soldeAvance:[false]

    });
    this.addDynamicControlForAdding(newDecompteGroup); // Appel à la fonction pour ajouter le contrôle dynamique

    newDecompteGroup.get('datePiece')?.setValidators([
      Validators.required,
      //Validators.min(this.today.getDate()) // Valide la date pour qu'elle soit après ou égale à aujourd'hui
    ]);

    if (!this.isNewDecompteAdded) {
      this.decomptes.push(newDecompteGroup);
      this.isNewDecompteAdded = true;
    }
    //Decompte Avance
    if (this.typeDecompte === 3 && this.decomptes.length === 1) {
      this.isNewDecompteAdded = true;
    }
  }

  onNoClick(): void {
    this._dialogRef.close(true)
  }

  submitDecompte(): void {
    const selectedDecompte = this.decomptes.controls.find(control =>
      control.get('selected')?.value || control.get('isNew')?.value === true
    );

    if (!selectedDecompte) {
      console.log('Aucun décompte sélectionné');
      return;
    }

    const isNew = selectedDecompte.get('isNew')?.value;
    const selectedData = selectedDecompte.get('selected')?.value;
    const datePiece = selectedDecompte.get('datePiece')?.value;
    const soldeAvanceRaw = selectedDecompte.get('soldeAvance')?.value;
    const soldeAvance = soldeAvanceRaw ? 1 : 0;
    if (!datePiece) {
      this._coreService.openSnackBar("Veuillez renseigner la date du décompte", "OK");
      return;
    }

    if (isNew) {
      // ➕ Ajouter le décompte avec validation de la date avant
      this.decompteService.validerDateDecompte(this.numMarche, datePiece).subscribe({
        next: (isValid) => {
          if (!isValid) {
            this._coreService.openSnackBar("⚠️ La date doit être supérieure à la date du marche / date de dernier décompte, veuillez vérifier!", "OK");
            return;
          }

          // Si la date est valide, procéder à l'ajout du décompte
          const decompteData = selectedDecompte.value;
          console.log(decompteData.datePiece)
          this.decompteService.addDecompte(this.numMarche, decompteData.datePiece, this.typeDecompte, this.numEtape, soldeAvance)
            .subscribe({
              next: (response) => {
                console.log(response);
                this._coreService.openSnackBar("Décompte ajouté avec succès", "OK");
                this.handleCalculMontants(response);
                this._dialogRef.close(true);
              },
              error: (err) => {
                console.error('Erreur lors de l\'ajout du décompte', err);
              }
            });
        },
        error: (err) => {
          console.error('Erreur lors de la validation de la date', err);
        }
      });
    } else {
      // ✏️ Mise à jour de la datePiece
      console.log('Mise à jour de la datePiece pour numPieceFourn', selectedData.numPieceFourn);

      // Vérification de la validité de la nouvelle date par rapport au décompte précédent
      this.decompteService.validerDateDecompteForUpdate(this.numMarche, datePiece, selectedData.numPieceFourn).subscribe({
        next: (isValid) => {
          if (!isValid) {
            this._coreService.openSnackBar("⚠️ La date doit être supérieure à la date du marche / date de dernier décompte, veuillez vérifier!", "OK");
            return;
          }
           // Si la date est valide, procéder à la mise à jour du décompte
          this.decompteService.UpdateDatePieceSoldeAvanceDecompte(this.numMarche, selectedData.numPieceFourn, datePiece, soldeAvance)
            .subscribe({
              next: (response) => {
                console.log(response);
                this._coreService.openSnackBar("Décompte modifié avec succès", "OK");
                this.handleCalculMontants(response);
                this._dialogRef.close(true);
              },
              error: (err) => {
                console.error('Erreur lors de la mise à jour du décompte', err);
              }
            }); 
        },
        error: (err) => {
          console.error('Erreur lors de la validation de la date pour update', err);
        }
      });
    }
  }


  handleCalculMontants(response: any): void {
    if (this.typeDecompte === 1 || this.typeDecompte === 2) {
      this.decompteService.calculMontantDecOrdDecompte(this.numMarche, response.numPieceFourn, this.numEtape).subscribe(
        result => {
          console.log('Résultat calcul des montants DecOrdDecompte:', result);
          this._coreService.openSnackBar("Calcul des montants effectué avec succès", "OK");
        },
        error => {
          console.error('Erreur lors du calcul des montants:', error);
        },
        () => {
          this._spinnerService.hide();
        }
      );
    } else if (this.typeDecompte === 3) {
      this.decompteService.calculMontantDecAvanceDecompte(this.numMarche).subscribe(
        result => {
          console.log('Résultat calcul des montants DecAvanceDecompte:', result);
          this._coreService.openSnackBar("Calcul des montants effectué avec succès", "OK");
        },
        error => {
          console.error('Erreur lors du calcul des montants:', error);
        },
        () => {
          this._spinnerService.hide();
        }
      );
    } else if (this.typeDecompte === 4) {
      this.decompteService.calculMontantDecLrgDecompte(this.numMarche, response.numPieceFourn).subscribe(
        result => {
          console.log('Résultat calcul des montants DecLrgDecompte:', result);
          this._coreService.openSnackBar("Calcul des montants effectué avec succès", "OK");
        },
        error => {
          console.error('Erreur lors du calcul des montants:', error);
        },
        () => {
          this._spinnerService.hide();
        }
      );
    }
  }

/*   calculMontantDecAvanceDecompte() {
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
  } */

/*   calculMontantDecOrdDecompte() {
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
  } */


  formatDateToDateObject(date: Date): Date {
    // Extraire jour, mois, année depuis l'objet Date
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Les mois commencent à 0, donc on ajoute 1
    const year = date.getFullYear();

    // Créer une nouvelle Date avec la chaîne formatée
    return new Date(`${year}-${month}-${day}`);
  }

  isNewDecompteDateValid(): boolean {
    const newDecompte = this.decomptes.controls.find(control => control.get('isNew')?.value);
    if (newDecompte) {
      const datePieceControl = newDecompte.get('datePiece');
      // Vérifie si la date est remplie et valide
      return datePieceControl?.valid || false;
    }
    return false;
  }

  openConfirmDeleteDecompteDialog(index: number): void {
    const decompte = this.decomptes.at(index).value;
    const numMarche = this.numMarche;
    const numPieceFourn = decompte.numPieceFourn;

    // Vérifier si la datePiece est vide ou désactivée
    const decompteControl = this.decomptes.at(index);
    let datePiece = decompteControl.value.datePiece;

    if (decompteControl.get('datePiece')?.disabled) {
      datePiece = decompteControl.get('datePiece')?.value;
    }

    // Si la datePiece est vide, supprimer directement sans confirmation
    if (!datePiece) {
      this.decomptes.removeAt(index);  // Suppression locale du décompte
      this.isNewDecompteAdded = false;
      return;
    }

    // Sinon, ouvrir la boîte de dialogue de confirmation
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de Suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce décompte? Vous allez supprimer tous les articles appro et travaux en relation avec ce décompte?',
        confirmButtonText: 'Supprimer',
        isDeleteAction: true,
        numMarche: numMarche,
        numPieceFourn: numPieceFourn,
      }
    });

    // Si l'utilisateur confirme la suppression, appeler la méthode de suppression
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeDecompte(index);
      }
    });
  }

  removeDecompte(index: number): void {
    // Vérifier si ce n'est pas le dernier décompte, on empêche la suppression
    if (index < this.decomptes.length - 1) {
      this._coreService.openSnackBar('Impossible de supprimer ce décompte car il n\'est pas le dernier.', 'Ok');
      return;
    }

    // Récupérer le décompte à supprimer à partir de l'index
    const decompteControl = this.decomptes.at(index);
    console.log(decompteControl.value);

    const numMarche = this.numMarche;
    const numPieceFourn = decompteControl.value.numPieceFourn;
    let datePiece = decompteControl.value.datePiece;

    if (decompteControl.get('datePiece')?.disabled) {
      datePiece = decompteControl.get('datePiece')?.value;
    }

    // Si la datePiece est vide, suppression locale sans appel au backend
    if (!datePiece) {
      this.decomptes.removeAt(index);  // Suppression locale du décompte
      this.isNewDecompteAdded = true;
      return;
    }

    // Appel au service backend pour supprimer le décompte
    this.decompteService.deleteDecompte(numMarche, numPieceFourn).subscribe({
      next: () => {
        this.decomptes.removeAt(index);  // Suppression après succès du backend
        if (this.typeDecompte === 3) {
          this.isNewDecompteAdded = this.decomptes.length > 0;
          this.disableAddDecompteTypeAvance = true;
        }
        this.disableAddDecompteTypeAvance = false;
        this._coreService.openSnackBar('Décompte supprimé avec succès.', 'Ok');
        console.log('Décompte supprimé avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du décompte:', err);
        this.loadingError = 'Erreur de suppression du décompte marche.';
        setTimeout(() => {
          this.loadingError = null;
        }, 3000);
      }
    });
  }

  openConfirmDecompteDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de soumession',
        message: 'Êtes-vous sûr de vouloir soumettre ce décompte ?',
        confirmButtonText: 'Soumettre'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submitDecompte();
      }
    });
  }

  onCheckboxChange(index: number, isChecked: boolean): void {
    const decompteControl = this.decomptes.at(index);
    const numPieceFourn = decompteControl.get('numPieceFourn')?.value;
    const numEtape = this.numEtape;
    const numMarche = this.numMarche;
    const typeDecompte = this.typeDecompte;
    console.log(typeDecompte)
    const hasUnsavedNew = this.decomptes.controls.some((ctrl, i) =>
      ctrl.get('isNew')?.value && i !== index
    );

    if (hasUnsavedNew && !decompteControl.get('isNew')?.value) {
      this._coreService.openSnackBar("Veuillez soumettre ou annuler le nouveau décompte avant de sélectionner un autre.", "OK");

      // ✅ Désélectionner la case cochée
      decompteControl.get('selected')?.setValue(null);
      if (decompteControl.get('datePiece')) {
        decompteControl.get('datePiece')?.disable();
        decompteControl.get('soldeAvance')?.disable();
      }

      return;
    }

    this.decomptes.controls.forEach((control, i) => {
      const datePieceControl = control.get('datePiece');
      const soldeAvanceControl = control.get('soldeAvance');

      if (i === index && isChecked) {
        if (datePieceControl) {
          datePieceControl.enable();
        }
        if(soldeAvanceControl){
          soldeAvanceControl.enable();
        }
        if (typeDecompte === 1 || typeDecompte === 2 || this.typeDecompte === 4) {
          this.decompteService.getNumDecompte(this.numMarche, numPieceFourn).subscribe({
            next: (numDecompte) => {
              console.log(numDecompte);
              // Ajouter numDecompte dans l'objet 'selected'
              control.get('selected')?.setValue({
                numMarche: numMarche,
                numEtape: numEtape,
                numPieceFourn: numPieceFourn,
                idTypeDec: typeDecompte,
                numDecompte: numDecompte // Ajout du numDecompte ici
              });

              console.log('Sélectionné:', control.get('selected')?.value);
              if (control.get('selected')?.value) {
                this.numPieceFournForFinance = control.get('selected')?.value.numPieceFourn;
                console.log('NumPieceFournForFinance:', this.numPieceFournForFinance);
              }

            },
            error: (err) => {
              console.error('Erreur lors de la récupération du numDecompte:', err);
              // Gérer l'erreur si nécessaire (par exemple, affecter une valeur par défaut)
              control.get('selected')?.setValue(null);
            },
            complete: () => {
              this._spinnerService.hide();
            }
          });
        }
        else {
          control.get('selected')?.setValue({
            numMarche: numMarche,
            numEtape: numEtape,
            numPieceFourn: numPieceFourn,
            idTypeDec: typeDecompte,
            numDecompte: null
          });
          this.numPieceFournForFinance = control.get('selected')?.value.numPieceFourn;
        }

        this.statutDecompteFin = this.statuses[index]; // Récupère le statut du décompte à l'index sélectionné
        console.log(`Statut du décompte à l'index ${index}: ${this.statutDecompteFin}`);
        this.updateButtonState(index);
        this._spinnerService.show();
        this.decMntService.getDecMnt(this.numMarche, numPieceFourn).subscribe({
          next: (Mnts) => {
            console.log(Mnts);
            if (Mnts == null) {
              this.decImposable = "Montant non disponible";
            } else {
              this.decImposable = Mnts.decImposable;
              console.log('Montant imposable:', this.decImposable);
            }
          },
          error: (err) => {
            console.error('Erreur lors de la récupération des montants:', err);
            this.decImposable = "Montant non disponible";
          },
          complete: () => {
            this._spinnerService.hide();
          }
        });
      } else {
        control.get('selected')?.setValue(null); // Si pas sélectionné, réinitialiser 'selected'
        if (datePieceControl) {
          datePieceControl.disable();
        }
        if (soldeAvanceControl) {
          soldeAvanceControl.disable();
        }
      }
    });
  }

  updateButtonState(index: number): void {
    const selectedStatus = this.statuses[index];  // Récupère le statut à l'index donné
    console.log('Statut du décompte à l\'index', index, ':', selectedStatus);
    this.isButtonSendDecToFin = !(selectedStatus === 'DVD' || selectedStatus === 'Statut non trouvé');
    console.log('Statut du bouton "Envoyer décompte au financier" :', this.isButtonSendDecToFin ? 'Désactivé' : 'Activé');
  }


  isAnyDecompteNew(): boolean {
    return this.decomptes.controls.some(control => control.get('isNew')?.value && !control.get('datePiece')?.value);
  }

  isAnyChecked(): boolean {
    return this.decomptes.controls.some(control => control.get('selected')?.value);
  }

  isAnyDecompteSelected(): boolean {
    return this.decomptes.controls.some(control =>
      !control.get('isNew')?.value && control.get('selected')?.value
    );
  }

  async GestionArticlesTravauxAppro() {
    const selectedDecompteArticles = this.decomptes.controls
      .filter(control => control.get('selected')?.value)
      .map(control => control.value);

    if (selectedDecompteArticles.length > 0) {
      const isReadOnly = !(await this.isAnySelectedButLast());  // Attendez le résultat de isAnySelectedButLast()
      console.log(isReadOnly);
      this.openDialogMDecompteArticle(selectedDecompteArticles, isReadOnly);
    }
  }

  openDialogMDecompteArticle(selectedDecompteArticle: any, isReadOnly: any): void {
    console.log(selectedDecompteArticle)
    const dialogRef = this.dialog.open(DecompteArticleEditComponent, {
      width: '99%',
      height: '99%',
      data: {
        selectedDecompteArticle,
        isReadOnly
      }
    });
    console.log(selectedDecompteArticle)
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  async isAnySelectedButLast(): Promise<boolean> {
    const maxNumPieceFourn = await this.decompteService.getMaxNumPieceFourn(this.numMarche).toPromise();
    const selectedDecomptes = this.decomptes.controls
      .filter((control, i) => {
        const numPieceFourn = control.value.numPieceFourn;
        return numPieceFourn >= maxNumPieceFourn;
      })
      .map(control => control.value);
    return selectedDecomptes.some(control => control.selected);
  }


  isLastDecompteSelected(): boolean {
    const maxNumPieceFourn = this.decompteService.getMaxNumPieceFourn(this.numMarche);
    const lastDecompte = this.decomptes.controls.find(control => control.value.numPieceFourn === maxNumPieceFourn);
    return lastDecompte ? lastDecompte.get('selected')?.value : false;
  }


  async generateTabEngagement() {
    const logoBase64 = 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8QEBMSEBIQFREVEBIVExUQFRUQFRUSFhUYFxgSExUYHSgiGBolHBYVITEiJTUrLi4uGB8zODMtNygtLisBCgoKDg0OGxAQGislHSUtLS0rLS0tLS0tLSstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBEQACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABAcBBQYDAgj/xABEEAABAwICAwgQBQUBAAMAAAABAAIDBBEFEiExUQYHEyJBc5GxFBYXMjM0NVNUYXFyk7LR0iNCUpKhFSR0gcPwQ0TB/8QAGwEBAAIDAQEAAAAAAAAAAAAAAAEEAgMFBgf/xAAvEQEAAgECBQQBBAIBBQAAAAAAAQIDERIEEyExUQUUMkEzIlJhgRVxBkKxwdHw/9oADAMBAAIRAxEAPwC8UBAQEBAQEHjNUNbr17Aghy1rjq0D+UEcknWgwgICAgICAgICD2jqnt5bj16UEyKsadeg/wAIJKAgICAgICAgICAgICD4kkDRclBAnrC7QNA/lBGQEBAQEBAQEBAQEBAQEHrDO5urVsKDYQVDX+o7EHsgICAgICAgICAg8KioDPWdn1Qa2SQuNyg+UBAQEBAQEBAQEBAQEBAQEGQUE6mq76HdP1QTEBAQEBAQEBBGqqnLoHfdSDXE31oMICAgICAVMRrOg5Yb4OG+ck+G/wCitRweXw182p3QMN84/wCG/wCin2WXwjm1O6BhvnH/AA3/AET2WXwc2p3QMN84/wCG/wCieyy+Dm1O6BhvnH/Df9E9ll8HNqd0DDfOP+G/6J7LL4ObU7oGG+cf8N/0T2WXwc2p3QMN84/4b/onssvg5tW2wTH6asDzTuc4MIDszSzXe2vXqWrLhtj+TOtons2a0MnK7o928VFOYXxSPIY112loHGvo0+xXMXCTkrrq12vo1fdQp/R5v3MW3/HW/cw50eHSbl90LK+N72RvYGPykPIJJsDfR7VVz4JxTpLbW+501JVW4rtXIdi0Mk9AQEBAQEHhVT5B6zq+qDWE31oMICAgICAgw/UfYVnj+UIns/OLDoHsC9FXspSyskCAgICAgILL3oO8qffj6nLleod4WcSw1zW5T2+h5QdzMXUV2+C/GrZe7klcaVp70fi0/Pj5AuT6h84WcPZ3a5zcm0VR+U/6+iCcgICAg+JZA0ElBqZHlxuUHygICAgICAgw/UfYVnj+UIns/OLNQ9gXo69lKWVKHaU29vVSMY8TU4D2NcAeEvZwvp4qo24+kTpo28mXr3Mavz1N0yfao/yFPCeTJ3Mavz1N0yfan+Qp4OTJ3Mavz1N0yfan+Qp4OTJ3Mavz1N0yfan+Qp4OTJ3Mavz1N0yfan+Qp4OTLrtw25uWgbKJXxuL3NI4PNosCNNwNqpcVnjLpMNtK7XTqo2Ke30PKDuZi6iu3wX41bN3ckrjStPej8Wn58fIFyfUPnCzh7O7XObhBs6OfMLHWP8A10EhAQEGtrZsxsNQ60EZAQEBAQEBAQYfqPsKzx/KET2fnFmoewL0deylLJWSH6DwfxeHmIvkC83k+cr0dktYJEBAQEBQCCnt9Dyg7mYuort8F+NWzd3JK40rT3o/Fp+fHyBcn1D5ws4ezu1zm4QfcUhaQQg27XAgEaigyg8aqXK2/LqCDVICAgICAgICAgw/UfYVnT5Qiez84s1D2Bejr2UpZKyQ/QeD+Lw8xF8gXm8nzlejslrWkQEBAQEBBT2+h5QdzMXUV2+C/GrZu7klcaVp70fi0/Pj5AuT6h84WcPZ3a5zcICCdh8utp9oQTUGtr5LutyDrQRkBAQavGd0NLRloqJCwvDi3iudcNtfvQdoW7Hgvk61hha8V7tb2+4Z54/Dk+1bPZ5fDHm1O33DPPH4cv2p7PL4ObU7fcM88fhy/ans8vg5tTt9wzzx+HL9qezy+Dm1O33DPPH4cv2p7PL4ObVh27zDLH8Y6vNyfasqcHl1joc2sqXYNA9gXbjsqslB+gsHP9vDzEXyBeeyVtvnouxMaJl1htt4TqXTbbwal0228GpdNtvBqXUTWfALFIgp7fQ8oO5mLqK7fBfjVs3dySuNK096Pxafnx8gXJ9Q+cLOHs7tc5uEBB9xPykHYUGz7IbtQapxuboMICAgrLfg8JS+5N1sXW9O+NlfP9K+XRaBAQEBAQ1EBBjKNgUbYNWMg2DoTbBqZBsHQm2DUyDYOhNsGpkGwdCbYNWz3NNHZtNoHjEXzhas1Y2SzrPVfq8/K4KBT2+h5QdzMXUV2+C/GrZu7klcaVp70fi0/Pj5AuT6h84WcPZ3a5zcICAgICAgICCs9+DwlL7k3Wxdb07tZXz/AEr1dFobfc5uemr3vZE6NpY0OPCEgWJtosCtObNXFGss60m3Zvu5nW+cp/3P+1V/f42XJsdzOt85T/uf9qe/xnJsdzOt85T/ALn/AGp7/Gcmzyq97usijfI6SnysY5xsX3sBfRxVNeOpadIJxWhx6utQg2bNz9a4AtppyCLghhsQeULVzqeWW2fDPa5XejVH7HKOfTybJ8Ha5XejVH7HJ7ink2T4O1yu9GqP2OTn08myfB2uV3o1R+xyc+nk2T4bDAMBrGVdO51POGtnjJJYQAA4XJWvLmpNJ6sq1nVdS4UrUCJU9voeUHczF1Fdvgvxq2bu5JXGlae9H4tPz4+QLk+ofOFnD2d2uc3CAgICAgICAgrPfg8JS+5N1sXW9O7WV8/0r1dFod9vQ+HqOZZ8y5/qHxhuw907dFu6qqaqlhZHAWscAC4PvpaDps4bV5+2fbbR7XgPQsGfh65LTOs/6/8ATY7j91k9YKkysibwMTXt4MOFyQ/Q67j+kLdgvzJ0UPV/TMfBxGyZ6+XNjfOrLeBpuiT71249PxvNTml2FLij6vCpJ5Gta50E1wy9tGYaLk7FStijHmisNm7dVSwXdlTgKhL9B4Sf7aHmYvkC87f5yvR2e/Ds/U3pCx2zJrBw7P1N6Qk1k1h6WWKXN4/u0pqKbgZWTF2RrrsDSLOvbW4bFZxcLbJXdDC2SKvrc9uxpq6UxRMma4MLryBoFgQORx2pm4a2KuslL7p0a2ffHpGOc0xVN2uc02Edrg20cdc+c9Iejx/8ez3rFomOrf7ncdironSxNkaGyFhEmUG4DTfQTo4wWytotGsOZxvBX4S+y09VZ76HlB3MxdRXd4L8bk5e7klcaVp70fi0/Pj5AuT6h84WcPZ3a5zcICAgICAgICCs9+DwlL7k3Wxdb07tZXz/AEr1dFod9vQ+HqOZZ8yocf8AGG7D3fe6ncfXT1k0sUbSx7mlpL2i4yNGonaCvN5MN5tMw976d6vw2Hh60vPWGz3Ebm6ulbVCZjWmWFrWWc113AP121d8Fv4ak47a2c31zj8PFRXlz2cm3e/xK3g2avOMXofe4fLyc4ru+w3D5abCHxTAB7YJ7gEO15iNI9q5+S8XzxMN1azFeqmQu5KoFBeGIeSn/wCD/wAguBX839rk/FR2QbAu9EKb1pmDOzQO/b1hY3iNspju/Ra83PddVJvm0kr68lkcjhwEelrHOH5uUBdfg7VjH1lXyROr13raWVla4vjkaOAcLva5ovmbouQo460Tj6SnDE7nN19DMZZPwpfCyfkd+o+peWtWdZ6PqvDcTijDWJtHaPtY+9bE5lJIHtc09kuNnAtNuDj02KuYInb1eR/5Bet+Iiazr0chvoeUHczF1Feh4L8by2Xu5JXGpae9H4tPz4+QLk+ofOFnD2d2uc3CAgICAgICAgrPfg8JS+5N1sXW9O7WV8/0r1dFod9vQ+HqOZZ8yocf8YbsPdrd2mM1cdfUMjqJ2sD22a2RzQOI06ADo1rPhsVJxRMwi953S3W91iVRKyt4WaV+WFhbne52U2k0tudGodCq8fSsRGkLPAzuzVifMOObjlZ6TU/Ff9V53m38vp0en8Np8IWVgU75MFe6R7nvMNRdzyXE2LtZK6PCzMzEy8P61jrj4m1axpCnwvUS82yUF34h5Kd/g/8AJcGn5/7XJ+KkF3VN60vhGe+3rCi3xlMd36KOteanuuw4Hdluxq6SqMMIhyCNjvxGucbm99IcFVy5rVtpD1XpXpGDisG++ur03E7raqsqTFMIQ0ROd+G1zTcFoGkuOjSVlhzWvOksPV/ScPC4d9NddWgq98fEGSSNAprNke0XjfewcQL8f1Lv14HFNYl5Gc94+3bbhccmraZ0s+TOJnMHBgtGUNYdRJ08YqjxWKuO0RVux3m0ay4DfQ8oO5mLqK6PBfjV8vdySuNS096Pxafnx8gXJ9Q+cLOHs7tc5uEBAQEBAQEBBWe/B4Sl9ybrYut6d2sr5/pXq6LQ77eh8PUcyz5yuf6h8YbsMdW/xne/hqqiSd08rTI4EtDWkCzQ3Rf2Kvj421KxXRstii06pu53chHRCcMle/hmBpzADLbNpFve/haeI4i2XpMNmCOVeLR9NON7GD0iX9rVzfax5eoj/k2WP+iG9OFtpMNlga4uDYZuM4AE5g46h7VcwV22iHC4/ircVknJMaaqQC9K4sBRK78Q8lO/wf8AkuDT8/8Aa5PxUgu6pvWl8Iz329YWN/jJHd+iivNyvQr/AHabkKurqzLDwWQxsbx35TcXvot61WyYptOsPVelerYeGwbL66vTcRuTq6OpMs3B5DE5vEdmNyWnVYbCpw4ppbWWPq/quDisMUprrq0NZvd175JHDgLOke4Xeb2LiRfi+td+vG44rEPHThs7bcLgk1FTOimyZjM54yHMMpawa7D9JVDissZLaw3Y6zWHA76HlB3MxdRXS4H8bTl7uSVxqWnvR+LT8+PkC5PqHzhZw9ndrnNwgICAgICAgIKz34PCUvuTdbF1vTu1lfP9K9XRaEiir5oCTDLJGSLExuLCRrsSFjalbd4TFpjsl9sVf6XVfFf9VhyMfhO+Ttir/S6r4r/qnIx+DfJ2xV/pdV8V/wBU5GPwb5Ykx+tc0tdVVJaRYgyvIIOsHTqTkU8G+WtW1iFSLvxDyU7/AAf+S4NPz/2uT8VILuqbLSQQRrBuPan1oN3244l6VL0M+1aPbYv2s+ZY7ccS9Kl6GfantcX7TmW8nbhiXpUvQz7U9ri/ajfbyduGJelS9DPtT2uL9pvt5O3DEvSpOhn2p7XF+1PMt5azEK+aofwkzy99gMzrXsNQ0LbSkUjSGEzqjLIWnvR+LT8+PkC5PqHzhZw9ndrnNwgICAgICAgIKz34PCUvuTdbF1vTu1lfP9K9XRaABNTRnKdhUboNJMp2FN0GkmU7Cm6DSTKU3QaSwpAqRd+IeSnf4P8AyXBp+f8Atcn4qQXdUxBjMNqBmG1AzDagZhtQMw2oMoCC096Pxafnx8gXJ9Q+cLOHs7tc5uEBAQEBAQEBBWe/B4Sl9ybrYut6d2sr5/pXq6LQ7zejaDPUXA8CzX7xVDj5mKxo3YoWhwbdg6AuVvnysaQcG3YOgJvnyaQcG3YOgJvnyaQgY6wdiz6B4CTkH6StuK0746sbRGiggvQKbBUC8MQ8lP8A8H/kuDT8/wDa5PxUgu8pvSmF3s99vWFjf4yR3X+cJpvMQfDZ9F56cl9e67FYY/pVN5iD4bPoo5lvKdsH9KpvMQfDZ9E5lvJtg/pVN5iD4bPonMt5NsH9KpvMQfDZ9FMZLeTbCpd8mBkde5rGta3gozZgDRc302C7HB2m2PWVXJGkuXVtrWnvR+LT8+PkC5PqHzhZw9ndrnNwgICAgICAgIK133Y3GSmsCeJNqBPKxdT0+0RFtVfP9K/4B/6H/tK6PMr5adJd5vSRuE9RcEfhM1gj8y5/H2iaxpLfhhZy5TeICCDj3is/MSfKVsxT+uEWjooMQP8A0u6CvQ76+VLSWDA+3eu6Cm+vk0ld1awnC3AAkmisABck8ENAG1cKkxz/AO1ufipj+mVPmJ/hP+i7nMp5hU0nw9KXDqjhGfgT9+3/AOJ+0epRfJTbPWCInXs/QJXnZ7rzCgEBAQVJvk0Uz69xZFK5vAxaWMc4X06LgLs8FesY+squWJ1cv/TKnzE/wn/RW+ZTzDVpPhZu9VTyR08wkY9hM4ID2lhIyDSAQuXx8xN40WcPZ2y57cICAgIParjyvOw6Qg8UBAQZupiZgLlN0mgSmsyMKAQEBNRm6ndPk0LpukYUDN1OoxdNQUAgICAgzdAup1GFAICAgy0XNkE7sEbUH3XRXbflHUg1qAgICApiOo5tm6ZsdGJ5nMle6V0cYpWvs993ZWNDtINmm5Owqz7ebX0hhN9IbDAZax7S+rbCwu0siiuXMbskfmIJ9gCwzUrWdKpidW0WhkjS18THxsc8B8pcIxpOYtFzYjYFnFLTr/CNXLybqKgU08obFmjxHsdvFdYx5mC5GbvuMdOr1K1GCu6I/hhul1GKGYRPMBiEoHFM9+DGkXL7EG1rqtWI3aSzmULAsSMwmc6Sne1kpDTT5iAzKDZ5Ot3sWeXHt00hEW1e7MZpiyKQStLJnhkTrGz3m/FGj1HXsWMYra6aE2aajx6eShfUF1LG9lQ9maXM2IMZJl02dfNb+eRbpwxF9v8ACIt01TMFx6OWGaaSanLI5XceLO1rYtBbnz/m06bepY5cMxaIiCt9X1U7oYX0lRPSSRyGKNzuUgOAJAcNBtoURgtFoi0E26dEfAMcmnqDG8RhooqabihwOeVoLhpceLsH8lZZcUVrrHkraZnR6bo8RqKe7my0UcZjAb2TnzGbOL96dLcl9Wm9ljipFvpNp0QMf3Sz08lQxgiIjw9lQ0ua43kMmXTxhdtuTX61tx4K2iJnyxtaYTMW3ROj4KGCPhauWJr2s71jWnXJI46m3B0LGnDxMzM9oN+jZxVLoYOErJIWkC73MBZGL8gzEk7PXsWm1NbaVhluhqcZ3URiikqaN8chZJEy7g4tu57QQRoOpy20wTv23Y2t01hMwPFJJ5qtjwwNhnDGZQQS0sB41ybm55LLHNjikRomttW4VdmICCVQRXN+QdaDYoCDU1MWV1uTk9iDyQEHPbqat8U1Dle5jX1gbJZ2UObkPFftHtVjBWLRZheXhWbrJmVJp46N8ruMWFk0YzsbreBbQPattOGjTdNtETf60c/R0VSKRtNUYXNK1sz5QROyPjOLthvoDiFvtNN26LsOunWH1hlLVUtS2Wmwyojj4NzZIuHa8PJ711ydFlF5peu21oTGsT0hPqMRxV1RwnYNSIux3RmHho8peSTwp5L2NtSwimKI+UJ1s1mH02IxNoB2BKewzLe0kY4TOCNGni2v61snlfq/V3R16PnsHEHQywGhlHC1/ZOfPGQwFzDkIvp73X60m2OJ13fSNJ8Ot3V0M1U6CnaHdjvlLqlzSB+G0XDDpvZx/wDxVcN611v9/TO0TPRpKDsqgfVxx0DnxS1MjoiySOJoYRla1rT6hdWJ25dszZhGsaxojx07oqXCIX2Era1t23BNhwmnQTo0hTr+u8/Whp0iESagxDsU0woZHFtY6dry+Msd+IXBroydII9ayi2Obbt30iYtppo9oaet4Krilw2RzaqUyWZJGwRmwsBtsQCkzj1iYv2OunZ4UFDiUcFSx9DK+WoibEZGviaA1rMrbt/MdJJPKpvbHMxMW7FYmI00dJuYwyeKpc+SMtb2BSR3NvCMaA5ug8irZr1mmkT9yyrrEtTjmAVNUyunkiLpzIyOkYSDlgbIwl7NOguGb169q2Y8ta7Yjt9kxq86+grap1S91JJEXYc2BjXOY/M9sgdoIOwnoWcWpTSNfvVjMWt9PSvp31GR1Rg873sibGHCoa3itvyD1krGule12XXwjx4LVGlqGCB0UYqaeWCCeVrgWt7+NrybabX0rLfTdGk6yjSdOyDCaqogrYYaN5Etdwji17C2Ite15iI/NYNtcbVnbbWazNvpEazrDuNzlFLFPWukYWtkqQ6Mm3GbkAuP9qlxF4mK6NlI0b5VWwQZaLmwQbaCPK0Dp9qD0QEHjUw52+sakGrIQYQRMUw6CojyVDGPZe9n6gRyg8izpe1Z1qiUbDcAoqRxdDDHG4i2blt+kElbLZMl40lGkQ2RcBouOlatspZBG0KNsmrGYbRb2psnwalxruLbU2ykzC17i226bZ8ASNo1X18ibZQjV1DDMWCVrXFj87LnU+xGYW9RKzpa1expEtfFhWH08sBbExr2sMcLrFwY1uZ2UO1N75+k7SFs3ZbRMI0r3bnMNo9enrWnbPhOsM3G3Qo2yli42jpTbMAHDkKaSGYa7ix1aRp9inbKNWC4DWR0qNsp1ZuNo1X/ANbU0k1RcRoIKlnBzNbIzMDlJ5RqOgrOs3pOsInSWcOoYKePg4GMYwG9mar7T69HKpva151siIiOyUCtcwyZUAgnUEH5j/r6oJqAgICCHW09+MP9/VBAQc/u0ilmgbTxRvfwz8r8hDLRNGZ13nQ25DRp13Vjh9sW1swvr2hz2IRTTNY+rp5X/wBoI2Dgn1DY6tj3CR74gQTmGWz729as12xM7Z+2E6/aNLh9QamnfUwjMKWnaf7V9W1pE0hyhwdxHhpbdxJWcWptnRjpL4pMJxAZ2tbJppavgTYscwvnbmhzHvSQ27ff6Fr4/wDsnqk4rRU7qe1LRTxDhoDIJKd72utmveG95COU8t9axpMxb9Ukw2tfROdg5ijj0ngwGNgdD/8AYaT+ASSBa5tdaq2jnayy06ItRgYp3RCpgbPShsvEo4HNY2dzhZ7oA4kktFs3J6lnGSLfGdJ/k00ajEsJr+DBYyXRRzt4NwMh4B85ywuP62scHAa+KttcmMmJbyKkY2peaqlqJZ3VDHU8rGlzWQ2blaH3Ajy2dcG19Ou602t+n9M9D/bST4bJngL4SQIphx6SSrAcap7gMrSMptpvs9q3VtXSerGYR6jBp7VZdBJx3EsyQufwg7NaXcKB3xDWgtGi7SVMXr06/wD2iNsupp6Q/wBJqI2R2JZOGsjp3UlyRqEJLjf18qrWtHNhsiOj53P4Sx735YJIqTLTObHIDHeqieXOlZGdLR3gO2yZMmn+/wDwiI1aqhp66FpcI3ue6jkihDY3MLHSVNgHuPKLl99GgLbrjnRHVGxDDpzBT08sE39u+qY20RqbMdG0wkZdBsSG3GotvyLKLV3TMT3OqZV4RJLTz8NTuMvD4eQHAyEcWBkuV35tGcE+1YxeK26T5ROuiXHSSmtc40z+wnh1HlI4nAMbxDwesNzh2nVZwUbqxTv17suqLS4NMyClFPE6OY0tdmIaYyJnNaG5z+VxDQBfYE5tZmdf4NOkPOow4Ojf2HS1EIFHO2pD2ObwshaAxoB8K8Oucwv/ACpi0R1tMfwd+zf7i6SoiNSKgEu4SINeQRwjGxBrX3Os2Av67rRxM1nSaprq6ZVGx70sGY6e9Gv6INoAgICAgICCBV01uM3VyjYghoCAgICAgICAgICAgICAgICAgICD2p4C8+rlKDZsaALDUg+kBAQEBAQEEGqpOVv+x9EEJAQEBAQEBAQEBAQEBAQEBAQEHvTUxdp1N/8AakGyYwAWGpB9ICAgICAgICAgj1FKHaRoP/taDXyRFpsQg+EBAQEBAQEBAQEBAQEBBloJ0BBNp6Lld0fVBNAQEBAQEBAQEBAQEBBhzQdBFwghzUP6T/o/VBEfGW6wQg+EBAQEBAQEBAQEGQCdSCTFROPfaB/KCbFC1uofVB6ICAgICAgICAgICAgICAg8qnvSg1KAgICAgICAgICCfh2ooJiAgICAgICAgIP/2Q==';
    this.decPdf.forEach((decompte: any, index: number) => {
      console.log(decompte);
      const designationMarche = decompte.mrcEtape.numMarche.designation;
      const nomFournisseur = decompte.mrcEtape.numMarche.idFourn?.designation || decompte.mrcEtape.numMarche.idFourn?.designationFr;
      const dateMarche = decompte.mrcEtape.numMarche.dateMarche;

      console.log(nomFournisseur)


      const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        header: function () {
          return {
            pageMargins: [15, 15, 15, 30],
            stack: [
              {
                text: isArabic('الجمهورية التونسية') ? reverseArabicText('الجمهورية التونسية') : 'الجمهورية التونسية',
                fontSize: 9,
                font: isArabic('الجمهورية التونسية') ? 'Amiri' : 'Roboto',
                alignment: 'right',
                direction: isArabic('الجمهورية التونسية') ? 'rtl' : 'ltr',
                bold: false,
                margin: [0, 0, 8, -4]
              },
              {
                text: isArabic('وزارة التجهيز و الإسكان') ? reverseArabicText('وزارة التجهيز و الإسكان') : 'وزارة التجهيز و الإسكان',
                fontSize: 9,
                font: isArabic('وزارة التجهيز و الإسكان') ? 'Amiri' : 'Roboto',
                alignment: 'right',
                direction: isArabic('وزارة التجهيز و الإسكان') ? 'rtl' : 'ltr',
                bold: false,
                margin: [0, 0, 8, -4]
              },
              {
                text: isArabic('الوكالة العقارية للسكنى') ? reverseArabicText('الوكالة العقارية للسكنى') : 'الوكالة العقارية للسكنى',
                fontSize: 9,
                font: isArabic('الوكالة العقارية للسكنى') ? 'Amiri' : 'Roboto',
                alignment: 'right',
                direction: isArabic('الوكالة العقارية للسكنى') ? 'rtl' : 'ltr',
                bold: false,
                margin: [0, 0, 8, -3]
              },
            ]
          };
        },
        content: [
          {
            text: isArabic('جدول التعهدات عدد ..............') ? reverseArabicText('جدول التعهدات عدد ..............') : ('جدول التعهدات عدد ..............'),
            fontSize: 18,
            bold: true,
            alignment: 'center',
            font: isArabic('جدول التعهدات عدد ..............') ? 'Amiri' : 'Roboto',
            direction: isArabic('جدول التعهدات عدد ..............') ? 'rtl' : 'ltr',
            margin: [0, 40, 0, 5]
          },
          {
            table: {
              headerRows: 1,
              widths: [34, 70, 90, 200, 300, 34],
              body: [
                [
                  {
                    text: isArabic('عدد الوثائق') ? reverseArabicText('عدد الوثائق') : ('عدد الوثائق'),
                    fontSize: 8,
                    font: isArabic('عدد الوثائق') ? 'Amiri' : 'Roboto',
                    alignment: 'center',
                    direction: isArabic('عدد الوثائق') ? 'rtl' : 'ltr',
                    fillColor: '#D3D3D3',
                  },
                  {
                    text: isArabic('الملاحظات') ? reverseArabicText('الملاحظات') : ('الملاحظات'),
                    fontSize: 8,
                    font: isArabic('الملاحظات') ? 'Amiri' : 'Roboto',
                    alignment: 'center',
                    direction: isArabic('الملاحظات') ? 'rtl' : 'ltr',
                    fillColor: '#D3D3D3',
                  },
                  {
                    text: isArabic('المبلغ الخام') ? reverseArabicText('المبلغ الخام') : ('المبلغ الخام'),
                    fontSize: 8,
                    font: isArabic('المبلغ الخام') ? 'Amiri' : 'Roboto',
                    alignment: 'center',
                    direction: isArabic('المبلغ الخام') ? 'rtl' : 'ltr',
                    fillColor: '#D3D3D3',
                  },
                  {
                    text: isArabic('المستفيد') ? reverseArabicText('المستفيد') : ('المستفيد'),
                    fontSize: 8,
                    font: isArabic('المستفيد') ? 'Amiri' : 'Roboto',
                    alignment: 'center',
                    direction: isArabic('المستفيد') ? 'rtl' : 'ltr',
                    fillColor: '#D3D3D3',
                  },
                  {
                    text: isArabic(' البيانات') ? reverseArabicText('البيانات') : 'البيانات',
                    fontSize: 8,
                    font: isArabic('البيانات') ? 'Amiri' : 'Roboto',
                    alignment: 'center',
                    direction: isArabic('البيانات') ? 'rtl' : 'ltr',
                    fillColor: '#D3D3D3',
                  },
                  {
                    text: isArabic(' العدد الرتبي') ? reverseArabicText(' العدد الرتبي') : ' العدد الرتبي',
                    fontSize: 8,
                    font: isArabic(' العدد الرتبي') ? 'Amiri' : 'Roboto',
                    alignment: 'center',
                    direction: isArabic(' العدد الرتبي') ? 'rtl' : 'ltr',
                    fillColor: '#D3D3D3',
                  }
                ],
                [
                  {
                    text: '',
                    fontSize: 8,
                    font: 'Amiri',
                    alignment: 'center',
                  },
                  {
                    text: '',
                    fontSize: 8,
                    font: 'Amiri',
                    alignment: 'center',
                  },
                  {
                    text: (typeof this.decImposable === 'number'
                      ? this.decImposable
                      : Number(this.decImposable)
                    ).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || 'N/A',
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'center',
                    margin: [0, -80, 0, 0]
                  },
                  {
                    text: (isArabic(nomFournisseur)
                      ? reverseArabicText(nomFournisseur.length > 62 ? nomFournisseur.slice(0, 62) + '...' : nomFournisseur)
                      : isFrench(nomFournisseur) || /^[a-zA-Z.]+$/.test(nomFournisseur)
                        ? nomFournisseur
                        : 'N/A'),
                    fontSize: 8,
                    font: isArabic(nomFournisseur) ? 'Amiri' : (isFrench(nomFournisseur) ? 'Roboto' : 'Roboto'),
                    alignment: 'center',
                    direction: isArabic(nomFournisseur) ? 'rtl' : 'ltr',
                    margin: [0, -80, 0, 0]
                  }
                  ,
                  {
                    text: isArabic(designationMarche)
                      ? reverseArabicText(designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80))
                      : isFrench(designationMarche)
                        ? reverseFrenchText(designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80))
                        : (designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80)),
                    fontSize: 8,
                    font: isArabic(designationMarche) ? 'Amiri' : 'Roboto',
                    alignment: 'center',
                    direction: isArabic(designationMarche) ? 'rtl' : (isFrench(designationMarche) ? 'ltr' : 'ltr'),
                    margin: [3, -80, 0, 0]
                  }
                  ,
                  {
                    text: '',
                    fontSize: 8,
                    font: 'Amiri',
                    alignment: 'center',
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: function (i, node) { return 1; },
              vLineWidth: function (i, node) { return 1; },
              hLineColor: function (i, node) { return '#000000'; },
              vLineColor: function (i, node) { return '#000000'; },
              paddingLeft: function (i, node) { return 5; },
              paddingRight: function (i, node) { return 5; },

              paddingTop: function (i, node) {
                if (i > 0) {
                  return 150;
                }
                return 5;
              },

              paddingBottom: function (i, node) {
                return 10;
              }
            },
            margin: [-10, 0, 80, 0]
          },
          {
            text: [

              {
                text: dateMarche || 'N/A', fontSize: 9, font: 'Roboto'
              },
              isArabic('تاريخ الصفقة : ') ? reverseArabicText('تاريخ الصفقة : ') : 'تاريخ الصفقة : '

            ],
            fontSize: 13,
            style: 'sectionHeader',
            font: 'Amiri',
            alignment: 'right',
            direction: 'rtl',
            margin: [0, 50, 0, -10]
          },
          {
            layout: 'noBorders',
            table: {

              widths: [150, 150, 150],
              body: [
                [
                  {
                    text: isArabic('المصلحة') ? reverseArabicText('المصلحة') : ('المصلحة'),
                    fontSize: 9,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: isArabic('المصلحة') ? 'rtl' : 'ltr',
                    margin: [60, 0, 60, 0],
                    bold: true
                  },
                  {
                    text: isArabic('المدير') ? reverseArabicText('المدير') : ('المدير'),
                    fontSize: 9,
                    font: 'Amiri',
                    alignment: 'left',
                    direction: isArabic('المدير') ? 'rtl' : 'ltr',
                    margin: [70, 0, 0, 0],
                    bold: true
                  },
                  {
                    text: isArabic('مصلحة المحاسبة العامة') ? reverseArabicText('مصلحة المحاسبة العامة') : ('مصلحة المحاسبة العامة'),
                    fontSize: 9,
                    font: 'Amiri',
                    alignment: 'center',
                    direction: isArabic('مصلحة المحاسبة العامة') ? 'rtl' : 'ltr',
                    margin: [10, 0, -2, 0],
                    bold: true
                  }
                ],
                [
                  {
                    text: '---------------------------------',
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'center',
                  },
                  {
                    text: '---------------------------------',
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'center',
                  },
                  {
                    text: '---------------------------------',
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'center',
                  }
                ]
              ]
            },
            margin: [150, 20, 0, 0]
          },
        ],

        footer: function (currentPage, pageCount) {
          var currentDate = new Date();
          var dateString = currentDate.toLocaleDateString('ar-IT');

          return {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*'],
              body: [
                [
                  {
                    text: isArabic(`تاريخ الطباعة: ${dateString}`)
                      ? reverseArabicText(`تاريخ الطباعة: ${dateString}`)
                      : `تاريخ الطباعة: ${dateString}`,
                    fontSize: 9,
                    font: isArabic(`تاريخ الطباعة: ${dateString}`) ? 'Amiri' : 'Roboto',
                    alignment: 'left',
                    direction: isArabic(`تاريخ الطباعة: ${dateString}`) ? 'rtl' : 'ltr',
                    bold: false,
                    border: [false, true, false, false],
                    margin: [0, 0, 0, 0]

                  },
                  {
                    text: isArabic(`الصفحة ${currentPage} / ${pageCount}`)
                      ? reverseArabicText(`الصفحة ${currentPage} / ${pageCount}`)
                      : `الصفحة ${currentPage} / ${pageCount}`,
                    fontSize: 9,
                    font: isArabic(`الصفحة ${currentPage} / ${pageCount}`) ? 'Amiri' : 'Roboto',
                    alignment: 'center',
                    direction: isArabic(`الصفحة ${currentPage} / ${pageCount}`) ? 'rtl' : 'ltr',
                    bold: false,
                    border: [false, true, false, false],
                    margin: [0, 0, 0, 0]

                  },
                  {
                    text: isArabic('منظومة التصرف في الصفقات')
                      ? reverseArabicText('منظومة التصرف في الصفقات')
                      : 'منظومة التصرف في الصفقات',
                    fontSize: 9,
                    font: isArabic('منظومة التصرف في الصفقات') ? 'Amiri' : 'Roboto',
                    alignment: 'right',
                    direction: isArabic('منظومة التصرف في الصفقات') ? 'rtl' : 'ltr',
                    bold: false,
                    border: [false, true, false, false],
                    margin: [0, 0, 0, 0]

                  }
                ]
              ]
            },
            layout: 'Borders',
            margin: [40, -10, 40, 0]
          };
        },
        styles: {
          sectionHeader: {
            bold: true,
            decoration: 'underline',
            fontSize: 14,
            margin: [0, 15, 0, 15],
          }
        }
      };
      pdfMake.createPdf(docDefinition).open();
    })
  }

  async generatePrestaRealise() {
    for (const [index, decompte] of this.decPdf.entries()) {
      console.log(decompte);
      const designationMarche = decompte.mrcEtape.numMarche.designation;
      const selectedData = this.decomptes.at(index).get('selected')?.value;

      if (selectedData) {
        console.log('Données sélectionnées:', selectedData);
        const numPieceFournSelect = selectedData.numPieceFourn;
        const numDecompteSelect = selectedData.numDecompte;

        try {
          // Attente de la réponse des lots
          const lots = await this.mrcLotsService.getMrcLotsForMarche(this.numMarche).toPromise();

          // Vérification si lots est défini
          if (!lots || lots.length === 0) {
            console.error('Aucun lot trouvé.');
            continue;  // Passer à l'itération suivante si 'lots' est vide ou undefined
          }

          this.lotDesignations = lots.map(lot => `${lot.idPrmLot.designation} ${lot.idPrmLot.idLot}`);
          console.log('Lots:', this.lotDesignations);

          const formattedLots = this.lotDesignations.join(' / ');
          console.log(formattedLots);

          const TravauxApprosResults: [any[], any[]][] = [];

          // Vérification de l'initialisation de 'lots' et 'lotDesignations'
          for (const [i, lot] of lots.entries()) {
            try {
              // Attente de la réponse pour les travaux et les appro
              const travaux = await this.decArticleService.getDecArticlesTravaux(this.numMarche, lot.idPrmLot.idLot, numPieceFournSelect, this.numEtape).toPromise();
              const appro = await this.decArticleService.getDecArticlesAppro(this.numMarche, lot.idPrmLot.idLot, numPieceFournSelect, this.numEtape).toPromise();

              // Vérification si 'travaux' et 'appro' sont définis
              if (travaux && appro) {
                TravauxApprosResults.push([travaux, appro]);
              } else {
                console.warn('Travaux ou appro sont undefined pour le lot:', lot);
              }

              const docDefinition = {
                pageSize: 'A4',
                header: function () {
                  return {
                    pageMargins: [15, 15, 15, 30],
                    stack: [
                      { text: isArabic('الجمهورية التونسية') ? reverseArabicText('الجمهورية التونسية') : 'الجمهورية التونسية', fontSize: 8, font: 'Amiri', alignment: 'right', direction: 'rtl', margin: [0, 0, 5, 0] },
                      { text: isArabic('وزارة التجهيز و الإسكان') ? reverseArabicText('وزارة التجهيز و الإسكان') : 'وزارة التجهيز و الإسكان', fontSize: 7, font: 'Amiri', alignment: 'right', direction: 'rtl', margin: [0, 0, 5, 0] },
                      { text: isArabic('الوكالة العقارية للسكنى') ? reverseArabicText('الوكالة العقارية للسكنى') : 'الوكالة العقارية للسكنى', fontSize: 7, font: 'Amiri', alignment: 'right', direction: 'rtl', margin: [0, 0, 5, 0] }
                    ]
                  };
                },
                footer: function (currentPage, pageCount) {
                  var currentDate = new Date();
                  var dateString = currentDate.toLocaleDateString('ar-IT');
                  return {
                    table: {
                      headerRows: 1,
                      widths: ['*', '*', '*'],
                      body: [
                        [
                          { text: isArabic(`تاريخ الطباعة: ${dateString}`) ? reverseArabicText(`تاريخ الطباعة: ${dateString}`) : `تاريخ الطباعة: ${dateString}`, fontSize: 9, font: 'Amiri', alignment: 'left', direction: 'ltr', bold: false, border: [false, true, false, false] },
                          { text: isArabic(`الصفحة ${currentPage} / ${pageCount}`) ? reverseArabicText(`الصفحة ${currentPage} / ${pageCount}`) : `الصفحة ${currentPage} / ${pageCount}`, fontSize: 9, font: 'Amiri', alignment: 'center', direction: 'ltr', bold: false, border: [false, true, false, false] },
                          { text: isArabic('منظومة التصرف في الصفقات') ? reverseArabicText('منظومة التصرف في الصفقات') : 'منظومة التصرف في الصفقات', fontSize: 9, font: 'Amiri', alignment: 'right', direction: 'ltr', bold: false, border: [false, true, false, false] }
                        ]
                      ]
                    },
                    layout: 'Borders',
                    margin: [40, 15, 40, 0]
                  };
                },
                styles: {
                  sectionHeader: {
                    bold: true,
                    decoration: 'underline',
                    fontSize: 14,
                    margin: [0, 15, 0, 15],
                  }
                },
                content: [
                  {
                    text: this.typeDecompte === 1
                      ? numDecompteSelect + (
                        isArabic('تقرير الخدمات المنجزة حسب كشف الحساب عدد ')
                          ? reverseArabicText('تقرير الخدمات المنجزة حسب كشف الحساب عدد ')
                          : 'تقرير الخدمات المنجزة حسب كشف الحساب عدد '
                      )
                      : this.typeDecompte === 2
                        ? reverseArabicText(' و الأخير ') + numDecompteSelect + reverseArabicText(' تقرير الخدمات المنجزة حسب كشف الحساب عدد ')
                        : '',
                    fontSize: 13,
                    bold: true,
                    alignment: 'center',
                    font: 'Amiri',
                    direction: 'rtl',
                  },
                  {
                    text: reverseArabicText("الصفقة: "),
                    alignment: 'right',
                    direction: 'rtl',
                    font: 'Amiri',
                    bold: true,
                    margin: [0, 20, 0, 0]
                  },
                  {
                    text: isArabic(designationMarche)
                      ? reverseArabicText(designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80))
                      : isFrench(designationMarche)
                        ? designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80)
                        : (designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80)),
                    fontSize: 10,
                    alignment: 'center',
                    direction: isArabic(designationMarche) ? 'rtl' : (isFrench(designationMarche) ? 'ltr' : 'rtl'),
                    font: isArabic(designationMarche) ? 'Amiri' : 'Roboto',
                    margin: [
                      // Marge gauche
                      0,

                      // Marge supérieure
                      designationMarche.length > 10 ?
                        (isArabic(designationMarche) ? -19.5 : (isFrench(designationMarche) ? -14.5 : -15.5)) :
                        (isArabic(designationMarche) ? -15 : (isFrench(designationMarche) ? -10 : -12)),

                      // Marge droite
                      designationMarche.length > 10 ?
                        (isArabic(designationMarche) ? 45 : (isFrench(designationMarche) ? 25 : 30)) :
                        (isArabic(designationMarche) ? 35 : (isFrench(designationMarche) ? 10 : 10)),

                      // Marge inférieure
                      designationMarche.length > 10 ?
                        (isArabic(designationMarche) ? 15 : (isFrench(designationMarche) ? 10 : 12)) :
                        (isArabic(designationMarche) ? 10 : (isFrench(designationMarche) ? 5 : 8)),
                    ]
                    ,
                    bold: true
                  },
                  {
                    text: reverseArabicText("التقاسيم: "),
                    alignment: 'right',
                    direction: 'rtl',
                    font: 'Amiri',
                    bold: true,
                    margin: [0, 5, 0, 0]
                  },
                  {
                    text: truncateText(reverseText(formattedLots), 159),
                    fontSize: 8,
                    font: 'Amiri',
                    alignment: 'center',
                    direction: 'rtl',
                    bold: true,
                    margin: [0, -17, 70, 0],
                    noWrap: true
                  },

                  ...this.lotDesignations.map((lot, i) => {
                    const travaux = TravauxApprosResults[i][0];
                    const appro = TravauxApprosResults[i][1];
                    const travauxIsEmpty = !travaux || travaux.length === 0;
                    const approIsEmpty = !appro || appro.length === 0;

                    const resultContent: (
                      | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                      | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                    )[] = [];

                    resultContent.push({
                      text: [
                        { text: isArabic(lot) ? reverseArabicText(lot.replace(/[()]/g, '').trim()) : lot.replace(/[()]/g, '').trim(), fontSize: 12 },
                        isArabic('الأشغال: ') ? reverseArabicText('الأشغال: ') : 'الأشغال: '
                      ],
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                      bold: true,
                      style: 'sectionHeader',
                      margin: [0, 10, 5, -10]
                    });

                    if (!travauxIsEmpty || travauxIsEmpty || !approIsEmpty || approIsEmpty) {
                      resultContent.push({
                        table: {
                          headerRows: 1,
                          widths: [90, 60, 60, 25, 230, 50],
                          body: [
                            [
                              { text: isArabic('المجموع') ? reverseArabicText('المجموع') : 'المجموع', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                              { text: isArabic('الكمية الحالية') ? reverseArabicText('الكمية الحالية') : 'الكمية الحالية', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                              { text: isArabic('الكمية السابقة') ? reverseArabicText('الكمية السابقة') : 'الكمية السابقة', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                              { text: isArabic('الوحدة') ? reverseArabicText('الوحدة') : 'الوحدة', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                              { text: isArabic('بيان الفصل') ? reverseArabicText('بيان الفصل') : 'بيان الفصل', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                              { text: isArabic('رمز العنصر') ? reverseArabicText('رمز العنصر') : 'رمز العنصر', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' }
                            ],
                            ...travaux.map(travail => {
                              return [
                                {
                                  text: (travail?.quantiteRea != null
                                    ? (+travail.quantiteRea).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : '0.000'),
                                  fontSize: 9,
                                  font: 'Amiri',
                                  alignment: 'center'
                                },
                                {
                                  text: (travail?.quantite != null
                                    ? (+travail.quantite).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : '0.000'),
                                  fontSize: 9,
                                  font: 'Amiri',
                                  alignment: 'center'
                                },
                                {
                                  text: (travail?.quantitePrec != null
                                    ? (+travail.quantitePrec).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : '0.000'),
                                  fontSize: 9,
                                  font: 'Amiri',
                                  alignment: 'center'
                                },
                                {
                                  text: travail?.libUnite || 'N/A',
                                  fontSize: 7,
                                  font: 'Amiri',
                                  alignment: 'center'
                                },
                                {
                                  text: truncateTextFrench(travail?.designationFr, 50) || 'N/A',
                                  fontSize: 9.7,
                                  font: 'Amiri',
                                  alignment: 'center'
                                },
                                {
                                  text: travail?.codeArticle || 'N/A',
                                  fontSize: 9,
                                  font: 'Amiri',
                                  alignment: 'center'
                                }
                              ]
                              ;
                            })
                          ]
                        },
                        layout: 'Borders',
                        margin: [-28, 10, 0, 10]
                      });
                    }

                    return resultContent;
                  }),
                  {
                    text: '', pageBreak: 'after'
                  },

                  ...this.lotDesignations.map((lot, i) => {
                    const travaux = TravauxApprosResults[i][0];
                    const appro = TravauxApprosResults[i][1];
                    const travauxIsEmpty = !travaux || travaux.length === 0;
                    const approIsEmpty = !appro || appro.length === 0;
                    const resultContent: (
                      | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                      | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                    )[] = [];

                    resultContent.push({
                      text: [
                        { text: isArabic(lot) ? reverseArabicText(lot.replace(/[()]/g, '').trim()) : lot.replace(/[()]/g, '').trim(), fontSize: 12 },
                        isArabic('التزويد: ') ? reverseArabicText('التزويد: ') : 'التزويد: '
                      ],
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                      bold: true,
                      style: 'sectionHeader',
                      margin: [0, 10, 5, -10]
                    });

                    if (!approIsEmpty || approIsEmpty) {
                      resultContent.push({
                        table: {
                          headerRows: 1,
                          widths: [90, 60, 60, 25, 230, 50],
                          body: [
                            [
                              { text: isArabic('المجموع') ? reverseArabicText('المجموع') : 'المجموع', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                              { text: isArabic('الكمية الحالية') ? reverseArabicText('الكمية الحالية') : 'الكمية الحالية', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                              { text: isArabic('الكمية السابقة') ? reverseArabicText('الكمية السابقة') : 'الكمية السابقة', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                              { text: isArabic('الوحدة') ? reverseArabicText('الوحدة') : 'الوحدة', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                              { text: isArabic('بيان الفصل') ? reverseArabicText('بيان الفصل') : 'بيان الفصل', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                              { text: isArabic('رمز العنصر') ? reverseArabicText('رمز العنصر') : 'رمز العنصر', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' }
                            ],
                            ...appro.map(approData => {
                              return [
                                {
                                  text: (approData?.quantiteRea != null
                                    ? (+approData.quantiteRea).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : '0.000'),
                                  fontSize: 9,
                                  font: 'Amiri',
                                  alignment: 'center'
                                },
                                {
                                  text: (approData?.quantite != null
                                    ? (+approData.quantite).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : '0.000'),
                                  fontSize: 9,
                                  font: 'Amiri',
                                  alignment: 'center'
                                },
                                {
                                  text: (approData?.quantitePrec != null
                                    ? (+approData.quantitePrec).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : '0.000'),
                                  fontSize: 9,
                                  font: 'Amiri',
                                  alignment: 'center'
                                },
                                {
                                  text: approData?.libUnite || 'N/A',
                                  fontSize: 7,
                                  font: 'Amiri',
                                  alignment: 'center'
                                },
                                {
                                  text: approData?.designationFr || 'N/A',
                                  fontSize: 9.7,
                                  font: 'Amiri',
                                  alignment: 'center'
                                },
                                {
                                  text: approData?.codeArticle || 'N/A',
                                  fontSize: 9,
                                  font: 'Amiri',
                                  alignment: 'center'
                                }
                              ]
                              ;
                            })
                          ]
                        },
                        layout: 'Borders',
                        margin: [-28, 10, 0, 10]
                      });
                    }

                    return resultContent;
                  }),
                ]
              };

              pdfMake.createPdf(docDefinition).open();
            } catch (error) {
              console.error('Erreur lors de l\'appel des API travaux/appro pour le lot:', lot, error);
            }
          }
        } catch (error) {
          console.error('Erreur lors de l\'appel de l\'API des lots:', error);
        }
      }
    }
  }


  async generateAttesdePaiement() {
    this.decPdf.forEach((decompte: any, index: number) => {
      console.log(decompte);

      const numMarche = decompte.mrcEtape.numMarche.id;
      const designationMarche = decompte.mrcEtape.numMarche.designation;
      const dateMarche = decompte.mrcEtape.numMarche.dateMarche;
      const exercice = decompte.mrcEtape.numMarche.exercice;
      const selectedData = this.decomptes.at(index).get('selected')?.value;
      const datePiece = new Date(decompte.datePiece);
      const formattedDate = datePiece.toISOString().split('T')[0];
      const fournisseurArb = decompte.mrcEtape.numMarche.idFourn?.designation;
      const fournisseurFranc = decompte.mrcEtape.numMarche.idFourn?.designationFr;
      const numFournisseur = decompte.mrcEtape.numMarche.idFourn?.numFourn;
      const mntMarcheApresAvnt = decompte.mrcEtape.numMarche.mntMrcApresAvenant;
      const Banque = decompte.mrcEtape.numMarche.numBanque?.designation;
      const Rib = decompte.mrcEtape.numMarche.rib;
      const pctRetIr = decompte.pctRetIr;
      const pctRetTva = decompte.pctRetTva;

      if (selectedData) {
        console.log('Données sélectionnées:', selectedData);
        const numPieceFournSelect = selectedData.numPieceFourn;
        const numDecompteSelect = selectedData.numDecompte;

        this.mrcLotsService.getMrcLotsForMarche(this.numMarche).subscribe(async (lots) => {
          this.lotDesignations = lots.map(lot => `${lot.idPrmLot.designation} ${lot.idPrmLot.idLot}`);
          console.log('Lots:', this.lotDesignations);

          const formattedLots = this.lotDesignations.join(' / ');

          const TravauxApprosResults = await Promise.all(lots.map(lot => {
            return Promise.all([
              this.decArticleService.getDecArticlesTravaux(this.numMarche, lot.idPrmLot.idLot, numPieceFournSelect, this.numEtape).toPromise(),
              this.decArticleService.getDecArticlesAppro(this.numMarche, lot.idPrmLot.idLot, numPieceFournSelect, this.numEtape).toPromise()
            ]);
          }));
          console.log(TravauxApprosResults);
          try {
            const decMnt = await this.decMntService.getDecMnt(this.numMarche, numPieceFournSelect).toPromise();
            console.log(decMnt);
            const decImposableNetApresRtn = decMnt?.decImposableNetApresRtn;
            const mntNetChiffre = decMnt?.mntNetChiffre;
            const decTravauxTtc = decMnt?.decTravauxTtc;
            const decAvance = decMnt?.decAvance;
            const afficheCb = decMnt?.afficheCb;
            const decApro = decMnt?.decApro;
            const decRetAv = decMnt?.decRetAv;
            const decTravauxNetAvantRtn = decMnt?.decTravauxNetAvantRtn;
            const decTravauxNetAvantRtnPrecedent = await this.decMntService.getDecTravauxNetAvantRtnPrecedent(this.numMarche, numPieceFournSelect).toPromise();
            console.log("Déc travaux avant retour:", decTravauxNetAvantRtn);
            console.log("Déc travaux avant retour précédent:", decTravauxNetAvantRtnPrecedent);

            const decImposable = decMnt?.decImposable;
            const decRtva = decMnt?.decRtva;
            const decIr = decMnt?.decIr;
            const decFraisEnrg = decMnt?.decFraisEnrg;
            const decPenalite = decMnt?.decPenalite;
            const decAutreMnt = decMnt?.decAutreMnt;

            const docDefinition = {
              pageSize: 'A4',
              header: function () {
                return {
                  pageMargins: [15, 15, 15, 30],
                  stack: [
                    {
                      columns: [
                        {
                          text: "",
                          fontSize: 7,
                          font: 'Roboto',
                          alignment: 'left',
                          direction: 'ltr',
                          margin: [0, 0, 0, 0]
                        },
                        {
                          text: isArabic('الجمهورية التونسية') ? reverseArabicText('الجمهورية التونسية') : 'الجمهورية التونسية',
                          fontSize: 7,
                          font: 'Amiri',
                          alignment: 'right',
                          direction: 'rtl',
                          margin: [0, 0, 10, 0]
                        }
                      ]
                    },
                    {
                      columns: [
                        {
                          text: isArabic('الملحقة بالأمر بالصرف عدد .....................') ? reverseArabicText('الملحقة بالأمر بالصرف عدد .....................') : ('الملحقة بالأمر بالصرف عدد .....................'),
                          fontSize: 7,
                          font: 'Amiri',
                          alignment: 'left',
                          direction: 'rtl',
                          margin: [20, 0, 0, 0]
                        },
                        {
                          text: isArabic('وزارة التجهيز و الإسكان') ? reverseArabicText('وزارة التجهيز و الإسكان') : 'وزارة التجهيز و الإسكان',
                          fontSize: 7,
                          font: 'Amiri',
                          alignment: 'right',
                          direction: 'rtl',
                          margin: [0, 0, 10, 0]
                        }
                      ]
                    },
                    {
                      columns: [
                        {
                          text: "",
                          fontSize: 7,
                          font: 'Roboto',
                          alignment: 'left',
                          direction: 'ltr',
                          margin: [0, 0, 0, 0]
                        },
                        {
                          text: isArabic('الوكالة العقارية للسكنى') ? reverseArabicText('الوكالة العقارية للسكنى') : 'الوكالة العقارية للسكنى',
                          fontSize: 7,
                          font: 'Amiri',
                          alignment: 'right',
                          direction: 'rtl',
                          margin: [0, 0, 10, 0]
                        }
                      ]
                    }
                  ]
                };
              },
              content: this.typeDecompte !== 4 
              ? 
              [
                {
                  text: isArabic('شهادة للدفع') ? reverseArabicText('شهادة للدفع') : ('شهادة للدفع'),
                  fontSize: 14,
                  bold: true,
                  alignment: 'center',
                  font: isArabic('شهادة للدفع') ? 'Amiri' : 'Roboto',
                  direction: isArabic('شهادة للدفع') ? 'rtl' : 'ltr',
                  margin: [0, 0, 0, -40]
                },
                {
                  text: "DECOMPTE :" + numPieceFournSelect + "/" + numMarche,
                  fontSize: 9,
                  bold: true,
                  alignment: 'left',
                  font: 'Roboto',
                  direction: 'ltr',
                  margin: [30, 0, 0, 0]
                },
                {
                  text: "Réf financier",
                  fontSize: 9,
                  bold: true,
                  alignment: 'left',
                  font: 'Roboto',
                  direction: 'ltr',
                  margin: [30, 0, 0, 1]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: exercice || 'N/A', bold: true, fontSize:11
                        }, isArabic('السنة المالية: ') ? reverseArabicText('السنة المالية: ') : 'السنة المالية: ',
                      ],
                      fontSize: 11,
                      bold: true,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 12,
                  font: 'Amiri',
                  bold: true,
                  alignment: 'right',
                  direction: 'rtl',
                  margin: [0, 15, 0, 20]
                },
                {
                  text: [
                    {
                      text: numMarche,
                      fontSize: 10,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                    },
                    {
                      text: [
                        {
                          text: "", bold: true
                        },
                        isArabic('موضوع الصفقة عدد ') ? reverseArabicText('موضوع الصفقة عدد ') : ('موضوع الصفقة عدد '),
                      ],
                      fontSize: 10,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, -10, 0, 0]
                }
                ,
                {
                  text: [
                    {
                      text: [
                        {
                          text: "", bold: true
                        }, isArabic('التقسيم: ') ? reverseArabicText('التقسيم : ') : 'التقسيم : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 15, 0, 0]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "", bold: true
                        }, isArabic('تاريخ الصفقة: ') ? reverseArabicText('تاريخ الصفقة : ') : 'تاريخ الصفقة : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 15, 0, 0]
                },
                {
                  layout: 'noBorders',
                  table: {
                    widths: [100, 100, 100, 250], // Ajuste la largeur des colonnes pour s'adapter au contenu
                    body: [
                      [

                        {
                          text: "0.000", // Valeur dynamique
                          fontSize: 10,
                          alignment: 'left',
                          margin: [-20, 5, 0, 0],
                          color: 'black',
                          bold: true,
                        },
                        {
                          text: reverseArabicText('مبلغ FODEC'), // Étiquette statique
                          fontSize: 9,
                          font: isArabic('مبلغ FODEC') ? 'Amiri' : 'Roboto',
                          direction: isArabic('مبلغ FODEC') ? 'rtl' : 'ltr',
                          alignment: 'left',
                          margin: [-70, 2, 0, 0],
                          bold: true,
                        },
                        {
                          text: mntMarcheApresAvnt != null ? mntMarcheApresAvnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", // Valeur dynamique
                          font: 'Roboto',
                          direction: 'ltr',
                          alignment: 'left',
                          fontSize: 10,
                          margin: [0, 5, 20, 0],
                          color: 'black',
                          bold: true,
                        },
                        {
                          text: reverseArabicText('مبلغ الصفقة باعتبار الملاحق: '), // Étiquette statique
                          fontSize: 11,
                          font: isArabic('مبلغ الصفقة باعتبار الملاحق: ') ? 'Amiri' : 'Roboto',
                          direction: isArabic('مبلغ الصفقة باعتبار الملاحق: ') ? 'rtl' : 'ltr',
                          alignment: 'left',
                          margin: [0, 0, 0, 0],
                          bold: true,
                        }
                      ]
                    ]
                  },
                  margin: [80, 20, 0, 0]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "",
                        }, isArabic('المقاول: ') ? reverseArabicText('المقاول : ') : 'المقاول : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 15, 0, 0]
                },
                {
                  layout: 'noBorders',
                  table: {
                    body: [
                      [{
                        stack: [
                          {
                            canvas: [
                              {
                                type: 'rect',
                                x: -27,
                                y: -180,
                                w: 420,
                                h: 180,
                                lineColor: 'black',
                                lineWidth: 1,
                              }
                            ],
                          },
                          {
                            text: isArabic(designationMarche)
                              ? reverseArabicText(designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80))
                              : isFrench(designationMarche)
                                ? reverseFrenchText(designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80))
                                : (designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80)),
                            fontSize: 10,
                            font: isArabic(designationMarche) ? 'Amiri' : 'Roboto',
                            bold: true,
                            direction: isArabic(designationMarche) ? 'rtl' : (isFrench(designationMarche) ? 'ltr' : 'ltr'),
                            alignment: 'center',
                            color: 'black',
                            margin: [-20, -165, 0, isArabic(designationMarche) ? 20 : (isFrench(designationMarche) ? 25 : 25)]
                          },
                          {
                            text: truncateText(reverseText(formattedLots), 130) || 'N/A',
                            fontSize: 9,
                            font: 'Amiri',
                            bold: true,
                            alignment: 'center',
                            direction: 'rtl',
                            color: 'black',
                            noWrap: true,
                            margin: [-28, 0, 0, 25],
                          },
                          {
                            text: dateMarche || 'N/A',
                            fontSize: 9,
                            font: 'Roboto',
                            bold: true,
                            alignment: 'center',
                            color: 'black',
                            margin: [-20, 0, 0, 30]
                          },
                          {
                            text: "",
                            fontSize: 9,
                            font: 'Roboto',
                            bold: true,
                            alignment: 'center',
                            color: 'black',
                            margin: [-20, -5, 0, 25]
                          },
                          {
                            text: [
                              {
                                text: numFournisseur + "    " || 'N/A',
                                fontSize: 9,
                                font: 'Roboto',
                                alignment: 'center',
                                direction: 'ltr',
                                bold: true,
                                margin: [0, 0, 0, 0]
                              },
                              {
                                text: isArabic(fournisseurArb)
                                  ? reverseArabicText(fournisseurArb)
                                  : isFrench(fournisseurFranc)
                                    ? fournisseurFranc
                                    : 'N/A',
                                fontSize: 9,
                                font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                                alignment: 'center',
                                direction: isArabic(fournisseurArb) ? 'rtl' : (isFrench(fournisseurFranc) ? 'ltr' : 'ltr'),
                                bold: true,
                                color: 'black',
                              }
                            ],
                            margin: [0, 10, 0, 0]
                          }

                        ]
                      }]
                    ]
                  }
                },
                {
                  text: (() => {
                    switch (this.typeDecompte) {
                      case 1:
                        return [
                          {
                            text: [
                              { text: numDecompteSelect || 'N/A', bold: true },
                              ' ',
                              isArabic('كشف حساب عدد ') ? reverseArabicText('كشف حساب عدد ') : 'كشف حساب عدد ',
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            alignment: 'right',
                            direction: 'rtl',
                          },
                        ];

                      case 2:
                        return [
                          {
                            text: isArabic('كشف حساب  عدد') ?
                              `${reverseArabicText('و الأخير')} ${numDecompteSelect} ${reverseArabicText('كشف حساب  عدد')}` :
                              `والأخير ${numDecompteSelect}كشف حساب  عدد`,
                            fontSize: 10,
                            font: 'Amiri',
                            alignment: 'right',
                            direction: 'rtl',
                          },
                        ];

                      case 3:
                        return [
                          {
                            text: [
                              { text: '', bold: true },
                              isArabic('كشف تسبقة') ? reverseArabicText('كشف تسبقة') : 'كشف تسبقة',
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            alignment: 'right',
                            direction: 'rtl',
                          },
                        ];

                      case 4:
                        return [
                          {
                            text: isArabic('كشف تحرير حجز الضمان') ?
                              reverseArabicText('كشف تحرير حجز الضمان') :
                              'كشف تحرير حجز الضمان',
                            fontSize: 11,
                            font: 'Amiri',
                            alignment: 'right',
                            direction: 'rtl',
                          },
                        ];

                      default:
                        return [
                          {
                            text: 'نوع غير معروف',
                            fontSize: 11,
                            font: 'Amiri',
                            alignment: 'right',
                            direction: 'rtl',
                          },
                        ];
                    }
                  })(),
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 6, 0, -33]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "", bold: true
                        }, isArabic('المبلغ المستوجب دفعه :') ? reverseArabicText('المبلغ المستوجب دفعه :') : 'المبلغ المستوجب دفعه :',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  margin: [0, 25, 0, -15]
                },
                {
                  layout: 'noBorders',
                  table: {
                    body: [
                      [{
                        stack: [
                          {
                            canvas: [
                              {
                                type: 'rect',
                                x: -27,
                                y: -28,
                                w: 420,
                                h: 40,
                                lineColor: 'black',
                                lineWidth: 1,
                              }
                            ],
                          },
                          {
                            text: [
                              {
                                text: formattedDate || 'N/A',
                                fontSize: 11,
                                font: 'Roboto',
                                bold: true,
                                alignment: 'center',
                                color: 'black',
                              },
                              {
                                text: isArabic('                  بتاريخ               ') ? reverseArabicText('                  بتاريخ              ') : '                  بتاريخ               ',
                                fontSize: 11,
                                font: 'Amiri',
                                alignment: 'right',
                                direction: 'rtl',
                              },
                              {
                                text: decImposableNetApresRtn != null ? decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                fontSize: 11,
                                font: 'Roboto',
                                bold: true,
                                alignment: 'right',
                                color: 'black',
                              }
                            ],
                            margin: [-20, -30, 0, -20]
                          }
                        ]
                      }]
                    ]
                  }
                },
                {
                  layout: 'noBorders',
                  table: {
                    body: [
                      [{
                        stack: [
                          {
                            canvas: [
                              {
                                type: 'rect',
                                x: 80,
                                y: 17,
                                w: 300,
                                h: 368,
                                lineColor: 'black',
                                lineWidth: 1,
                              },
                              {
                                type: 'line',
                                x1: 230,
                                y1: 18,
                                x2: 230,
                                y2: 383,
                                lineColor: 'black',
                                lineWidth: 1,
                              }
                            ],
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              noBorders: true,
                              body: [
                                [
                                  {
                                    text: decTravauxTtc != null ? decTravauxTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -366, -250, 0]
                                  },
                                  {
                                    text: isArabic('ما تم انجازه') ? reverseArabicText('ما تم انجازه') : 'ما تم انجازه',
                                    font: isArabic('شهادة للدفع') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('ما تم انجازه') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    color: 'black',
                                    margin: [248, -368, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decAvance != null ? decAvance.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -350, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ التسبقة') ? reverseArabicText('مبلغ التسبقة') : ('مبلغ التسبقة'),
                                    font: isArabic('مبلغ التسبقة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ التسبقة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    color: 'black',
                                    margin: [248, -352, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: afficheCb || '0.000',
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -333, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? reverseArabicText('مبلغ الحجز بعنوان الضمان 10%') : ('مبلغ الحجز بعنوان الضمان 10%'),
                                    font: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [230, -336, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decApro != null ? decApro.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -316, -250, 0]
                                  },
                                  {
                                    text: isArabic('التزويدات') ? reverseArabicText('التزويدات') : ('التزويدات'),
                                    font: isArabic('التزويدات') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('التزويدات') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [255, -318, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -299, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ الحجز بعنوان الضمان على التزويدات') ? reverseArabicText('مبلغ الحجز بعنوان الضمان على التزويدات') : ('مبلغ الحجز بعنوان الضمان على التزويدات'),
                                    font: isArabic('مبلغ الحجز بعنوان الضمان على التزويدات') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ الحجز بعنوان الضمان على التزويدات') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [230, -302, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -280, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ مراجعة الاثمان') ? reverseArabicText('مبلغ مراجعة الاثمان') : ('مبلغ مراجعة الاثمان'),
                                    font: isArabic('مبلغ مراجعة الاثمان') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ مراجعة الاثمان') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [255, -283, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decRetAv != null ? decRetAv.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -262, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ استرجاع التسبقة') ? reverseArabicText('مبلغ استرجاع التسبقة') : ('مبلغ استرجاع التسبقة'),
                                    font: isArabic('مبلغ استرجاع التسبقة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع الغير خاضع للضريبة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [255, -265, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -245, -250, 0]
                                  },
                                  {
                                    text: isArabic('المجموع الغير خاضع للضريبة') ? reverseArabicText('المجموع الغير خاضع للضريبة') : ('المجموع الغير خاضع للضريبة'),
                                    font: isArabic('المجموع الغير خاضع للضريبة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع الغير خاضع للضريبة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [255, -250, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxNetAvantRtn != null ? decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -229, -250, 0]
                                  },
                                  {
                                    text: isArabic('المجموع الخاضع للضريبة') ? reverseArabicText('المجموع الخاضع للضريبة') : ('المجموع الخاضع للضريبة'),
                                    font: isArabic('المجموع الخاضع للضريبة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع الخاضع للضريبة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -232, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxNetAvantRtn != null ? decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -210, -250, 0]
                                  },
                                  {
                                    text: isArabic('المجموع العام') ? reverseArabicText('المجموع العام') : ('المجموع العام'),
                                    font: isArabic('المجموع العام') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع العام') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [250, -212, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxNetAvantRtnPrecedent != null ? decTravauxNetAvantRtnPrecedent.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -194, -250, 0]
                                  },
                                  {
                                    text: isArabic('المصاريف السابقة و الواجب خصمها') ? reverseArabicText('المصاريف السابقة و الواجب خصمها') : ('المصاريف السابقة و الواجب خصمها'),
                                    font: isArabic('المصاريف السابقة و الواجب خصمها') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المصاريف السابقة و الواجب خصمها') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [250, -197, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decImposable != null ? decImposable.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -180, -250, 0]
                                  },
                                  {
                                    text: isArabic('الباقي المطلوب دفعه') ? reverseArabicText('الباقي المطلوب دفعه') : ('الباقي المطلوب دفعه'),
                                    font: isArabic('الباقي المطلوب دفعه') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('الباقي المطلوب دفعه') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [265, -182, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decRtva != null ? decRtva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -165, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? reverseArabicText('مبلغ أ ق م  %'+ pctRetTva) : ('مبلغ أ ق م  %'+ pctRetTva),
                                    font: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -166, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decIr != null ? decIr.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -149, -250, 0]
                                  },
                                  {
                                    text: isArabic(' نسبة الخصم على الدخل  %'+ pctRetIr) ? reverseArabicText(' نسبة الخصم على الدخل  %'+ pctRetIr) : (' نسبة الخصم على الدخل  %'+ pctRetIr),
                                    font: isArabic(' نسبة الخصم على الدخل  %'+ pctRetIr) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(' نسبة الخصم على الدخل  %'+ pctRetIr) ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -152, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decPenalite != null ? decPenalite.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -136, -250, 0]
                                  },
                                  {
                                    text: isArabic('خصومات مختلفة ') ? reverseArabicText('خصومات مختلفة ') : ('خصومات مختلفة '),
                                    font: isArabic('خصومات مختلفة ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('خصومات مختلفة ') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -136, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decFraisEnrg != null ? decFraisEnrg.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -122, -250, 0]
                                  },
                                  {
                                    text: isArabic('معلوم التسجيل') ? reverseArabicText('معلوم التسجيل') : ('معلوم التسجيل'),
                                    font: isArabic('معلوم التسجيل') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('معلوم التسجيل') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -122, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decAutreMnt != null ? decAutreMnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -107, -250, 0]
                                  },
                                  {
                                    text: isArabic('مصاريف اخرى') ? reverseArabicText('مصاريف اخرى') : ('مصاريف اخرى'),
                                    font: isArabic('مصاريف اخرى') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مصاريف اخرى') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -107, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decImposableNetApresRtn != null ? decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -92, -250, 0]
                                  },
                                  {
                                    text: isArabic('المبلغ المطلوب دفعه') ? reverseArabicText('المبلغ المطلوب دفعه') : ('المبلغ المطلوب دفعه'),
                                    font: isArabic('المبلغ المطلوب دفعه') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المبلغ المطلوب دفعه') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -92, -100, 0]
                                  }
                                ]
                              ],
                            },
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              widths: [350, 90], // Ajuste la largeur des colonnes pour s'adapter au contenu
                              body: [
                                [
                                  {
                                    text: isArabic(fournisseurArb) ? reverseArabicText(fournisseurArb) : isFrench(fournisseurFranc) ? fournisseurFranc : 'N/A',
                                    font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(fournisseurArb) ? 'rtl' : (isFrench(fournisseurFranc) ? 'ltr' : 'ltr'),
                                    alignment: 'right',
                                    fontSize: 8,
                                    decoration: 'underline',
                                    color: 'black',
                                    margin: [5, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: reverseArabicText('أشهد أنه يمكن دفع إلى'), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('أشهد أنه يمكن دفع إلى') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('أشهد أنه يمكن دفع إلى') ? 'rtl' : 'ltr',
                                    alignment: 'left',
                                    margin: [0, 0, 0, 0],
                                    color: 'black',
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: [100, -69, 0, 0]
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              widths: [90, 60, 350, 90], // Ajuste la largeur des colonnes pour s'adapter au contenu
                              body: [
                                [
                                  {
                                    text: reverseArabicText('باحتساب أ ق م '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('باحتساب أ ق م ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('باحتساب أ ق م ') ? 'rtl' : 'ltr',
                                    alignment: 'center',
                                    margin: [0, -2, -80, 0],
                                    color: 'black',
                                    bold: true,
                                  },
                                  {
                                    text: decImposableNetApresRtn != null ? decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000" , // Valeur dynamique
                                    fontSize: 8,
                                    alignment: 'center',
                                    margin: [0, 0, -80, 0],
                                    color: 'black',
                                    decoration: 'underline',
                                    bold: true,
                                  },
                                  {
                                    text: reversemntChiffre(mntNetChiffre), // Valeur dynamique
                                    font: isArabic(mntNetChiffre) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(mntNetChiffre) ? 'rtl' : 'ltr',
                                    alignment: 'right',
                                    fontSize: 8,
                                    margin: [5, -3, 0, 0],
                                    color: 'black',
                                    bold: true,
                                    decoration: 'underline'
                                  },
                                  {
                                    text: reverseArabicText('ما قدره'), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('ما قدره') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('ما قدره') ? 'rtl' : 'ltr',
                                    alignment: 'left',
                                    color: 'black',
                                    margin: [0, -3, 0, 0],
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: reversemntChiffre(mntNetChiffre) === '0.000' || reversemntChiffre(mntNetChiffre) === '0'
                              ? [-18, 0, 0, 0] :
                              [-23, 0, 0, 0]
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              widths: [100, 200, 100, 100],
                              body: [
                                [
                                  {
                                    text: Rib,
                                    fontSize: 8,
                                    alignment: 'right',
                                    margin: [0, 2, -80, 0],
                                    bold: true,
                                    color: 'black'
                                  },
                                  {
                                    text: reverseArabicText('الحساب البنكي : '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('الحساب البنكي : ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('الحساب البنكي : ') ? 'rtl' : 'ltr',
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                  },
                                  {
                                    text: isArabic(Banque) ? reverseArabicText(Banque) : Banque || 'N/A',
                                    font: isArabic(Banque) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(Banque) ? 'rtl' : 'ltr',
                                    alignment: 'right',
                                    fontSize: 8,
                                    color: 'black',
                                    bold: true,
                                    margin: [0, -1.5, 0, 0]
                                  },
                                  {
                                    text: reverseArabicText('البنك : '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('البنك : ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('البنك : ') ? 'rtl' : 'ltr',
                                    alignment: 'left',
                                    margin: [0, -2, 0, 0],
                                    color: 'black',
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: [85, 0, 0, -10]
                          },
                          {
                            layout: 'noBorders',
                            table: {

                              widths: [150, 150, 150, 150],
                              body: [
                                [
                                  {
                                    text: isArabic('مدير الشؤون المالية') ? reverseArabicText('مدير الشؤون المالية') : ('مدير الشؤون المالية'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('مدير الشؤون المالية') ? 'rtl' : 'ltr',
                                    margin: [45, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('قابل للخلاص المدير العملي') ? reverseArabicText('قابل للخلاص المدير العملي') : ('قابل للخلاص المدير العملي'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('قابل للخلاص المدير العملي') ? 'rtl' : 'ltr',
                                    margin: [30, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('مصلحة المراقبة و التصرف') ? reverseArabicText('مصلحة المراقبة و التصرف') : ('مصلحة المراقبة و التصرف'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('مصلحة المراقبة و التصرف') ? 'rtl' : 'ltr',
                                    margin: [30, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('رئيس المصلحة') ? reverseArabicText('رئيس المصلحة') : ('رئيس المصلحة'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'center',
                                    direction: isArabic('رئيس المصلحة') ? 'rtl' : 'ltr',
                                    margin: [10, 0, 40, 0],
                                    bold: true
                                  }
                                ],
                                [
                                  {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  },
                                  {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  },
                                  {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  }
                                  , {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                    margin: [-40, 0, 0, 0]
                                  }
                                ]
                              ]
                            },
                            margin: [-37, 5, 0, -5]
                          },

                        ]
                      }]
                    ]
                  },
                }
              ]:[
                {
                  text: isArabic('شهادة للدفع') ? reverseArabicText('شهادة للدفع') : ('شهادة للدفع'),
                  fontSize: 14,
                  bold: true,
                  alignment: 'center',
                  font: isArabic('شهادة للدفع') ? 'Amiri' : 'Roboto',
                  direction: isArabic('شهادة للدفع') ? 'rtl' : 'ltr',
                  margin: [0, -1, 0, 0]
  
                },
                {
                  text: isArabic('تحرير حجز الضمان') ? reverseArabicText('تحرير حجز الضمان') : 'تحرير حجز الضمان',
                  fontSize: 12,
                  bold: true,
                  alignment: 'center',
                  font: isArabic('تحرير حجز الضمان') ? 'Amiri' : 'Roboto',
                  direction: isArabic('تحرير حجز الضمان') ? 'rtl' : 'ltr',
                  margin: [0, -9, 0, 0] 
                },
                {
                  text: "DECOMPTE :" + numPieceFournSelect + "/" + numMarche,
                  fontSize: 9,
                  bold: true,
                  alignment: 'left',
                  font: 'Roboto',
                  direction: 'ltr',
                  margin: [30, -50, 0, 0]
                },
                {
                  text: "Réf financier",
                  fontSize: 9,
                  bold: true,
                  alignment: 'left',
                  font: 'Roboto',
                  direction: 'ltr',
                  margin: [30, 0, 0, 1]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: exercice || 'N/A', bold: true, fontSize:11
                        }, isArabic('السنة المالية: ') ? reverseArabicText('السنة المالية: ') : 'السنة المالية: ',
                      ],
                      fontSize: 11,
                      bold: true,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 12,
                  font: 'Amiri',
                  bold: true,
                  alignment: 'right',
                  direction: 'rtl',
                  margin: [0, 15, 0, 20]
                },
                {
                  text: [
                    {
                      text: numMarche,
                      fontSize: 10,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                    },
                    {
                      text: [
                        {
                          text: "", bold: true
                        },
                        isArabic('موضوع الصفقة عدد ') ? reverseArabicText('موضوع الصفقة عدد ') : ('موضوع الصفقة عدد '),
                      ],
                      fontSize: 10,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, -10, 0, 0]
                }
                ,
                {
                  text: [
                    {
                      text: [
                        {
                          text: "", bold: true
                        }, isArabic('التقسيم: ') ? reverseArabicText('التقسيم : ') : 'التقسيم : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 15, 0, 0]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "", bold: true
                        }, isArabic('تاريخ الصفقة: ') ? reverseArabicText('تاريخ الصفقة : ') : 'تاريخ الصفقة : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 15, 0, 0]
                },
                {
                  layout: 'noBorders',
                  table: {
                    widths: [100, 100, 100, 250], // Ajuste la largeur des colonnes pour s'adapter au contenu
                    body: [
                      [

                        {
                          text: "0.000", // Valeur dynamique
                          fontSize: 10,
                          alignment: 'left',
                          margin: [-20, 5, 0, 0],
                          color: 'black',
                          bold: true,
                        },
                        {
                          text: reverseArabicText('مبلغ FODEC'), // Étiquette statique
                          fontSize: 9,
                          font: isArabic('مبلغ FODEC') ? 'Amiri' : 'Roboto',
                          direction: isArabic('مبلغ FODEC') ? 'rtl' : 'ltr',
                          alignment: 'left',
                          margin: [-70, 2, 0, 0],
                          bold: true,
                        },
                        {
                          text: mntMarcheApresAvnt != null ? mntMarcheApresAvnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", // Valeur dynamique
                          font: 'Roboto',
                          direction: 'ltr',
                          alignment: 'left',
                          fontSize: 10,
                          margin: [0, 5, 20, 0],
                          color: 'black',
                          bold: true,
                        },
                        {
                          text: reverseArabicText('مبلغ الصفقة باعتبار الملاحق: '), // Étiquette statique
                          fontSize: 11,
                          font: isArabic('مبلغ الصفقة باعتبار الملاحق: ') ? 'Amiri' : 'Roboto',
                          direction: isArabic('مبلغ الصفقة باعتبار الملاحق: ') ? 'rtl' : 'ltr',
                          alignment: 'left',
                          margin: [0, 0, 0, 0],
                          bold: true,
                        }
                      ]
                    ]
                  },
                  margin: [80, 20, 0, 0]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "",
                        }, isArabic('المقاول: ') ? reverseArabicText('المقاول : ') : 'المقاول : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 15, 0, 0]
                },
                {
                  layout: 'noBorders',
                  table: {
                    body: [
                      [{
                        stack: [
                          {
                            canvas: [
                              {
                                type: 'rect',
                                x: -27,
                                y: -180,
                                w: 420,
                                h: 180,
                                lineColor: 'black',
                                lineWidth: 1,
                              }
                            ],
                          },
                          {
                            text: isArabic(designationMarche)
                              ? reverseArabicText(designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80))
                              : isFrench(designationMarche)
                                ? reverseFrenchText(designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80))
                                : (designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80)),
                            fontSize: 10,
                            font: isArabic(designationMarche) ? 'Amiri' : 'Roboto',
                            bold: true,
                            direction: isArabic(designationMarche) ? 'rtl' : (isFrench(designationMarche) ? 'ltr' : 'ltr'),
                            alignment: 'center',
                            color: 'black',
                            margin: [-20, -165, 0, isArabic(designationMarche) ? 20 : (isFrench(designationMarche) ? 25 : 25)]
                          },
                          {
                            text: truncateText(reverseText(formattedLots), 130) || 'N/A',
                            fontSize: 9,
                            font: 'Amiri',
                            bold: true,
                            alignment: 'center',
                            direction: 'rtl',
                            color: 'black',
                            noWrap: true,
                            margin: [-28, 0, 0, 25],
                          },
                          {
                            text: dateMarche || 'N/A',
                            fontSize: 9,
                            font: 'Roboto',
                            bold: true,
                            alignment: 'center',
                            color: 'black',
                            margin: [-20, 0, 0, 30]
                          },
                          {
                            text: "",
                            fontSize: 9,
                            font: 'Roboto',
                            bold: true,
                            alignment: 'center',
                            color: 'black',
                            margin: [-20, -5, 0, 25]
                          },
                          {
                            text: [
                              {
                                text: numFournisseur + "    " || 'N/A',
                                fontSize: 9,
                                font: 'Roboto',
                                alignment: 'center',
                                direction: 'ltr',
                                bold: true,
                                margin: [0, 0, 0, 0]
                              },
                              {
                                text: isArabic(fournisseurArb)
                                  ? reverseArabicText(fournisseurArb)
                                  : isFrench(fournisseurFranc)
                                    ? fournisseurFranc
                                    : 'N/A',
                                fontSize: 9,
                                font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                                alignment: 'center',
                                direction: isArabic(fournisseurArb) ? 'rtl' : (isFrench(fournisseurFranc) ? 'ltr' : 'ltr'),
                                bold: true,
                                color: 'black',
                              }
                            ],
                            margin: [0, 10, 0, 0]
                          }

                        ]
                      }]
                    ]
                  }
                },
                {
                text: isArabic('كشف تحرير حجز الضمان') ?
                reverseArabicText('كشف تحرير حجز الضمان') :'كشف تحرير حجز الضمان',
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl', 
                margin: [0, 6, 0, -33]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "", bold: true
                        }, isArabic('المبلغ المستوجب دفعه :') ? reverseArabicText('المبلغ المستوجب دفعه :') : 'المبلغ المستوجب دفعه :',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  margin: [0, 25, 0, -15]
                },
                {
                  layout: 'noBorders',
                  table: {
                    body: [
                      [{
                        stack: [
                          {
                            canvas: [
                              {
                                type: 'rect',
                                x: -27,
                                y: -28,
                                w: 420,
                                h: 40,
                                lineColor: 'black',
                                lineWidth: 1,
                              }
                            ],
                          },
                          {
                            text: [
                              {
                                text: formattedDate || 'N/A',
                                fontSize: 11,
                                font: 'Roboto',
                                bold: true,
                                alignment: 'center',
                                color: 'black',
                              },
                              {
                                text: isArabic('                  بتاريخ               ') ? reverseArabicText('                  بتاريخ              ') : '                  بتاريخ               ',
                                fontSize: 11,
                                font: 'Amiri',
                                alignment: 'right',
                                direction: 'rtl',
                              },
                              {
                                text: decImposableNetApresRtn != null ? decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                fontSize: 11,
                                font: 'Roboto',
                                bold: true,
                                alignment: 'right',
                                color: 'black',
                              }
                            ],
                            margin: [-20, -30, 0, -20]
                          }
                        ]
                      }]
                    ]
                  }
                },
                {
                  layout: 'noBorders',
                  table: {
                    body: [
                      [{
                        stack: [
                          {
                            canvas: [
                              {
                                type: 'rect',
                                x: 80,
                                y: 17,
                                w: 300,
                                h: 368,
                                lineColor: 'black',
                                lineWidth: 1,
                              },
                              {
                                type: 'line',
                                x1: 230,
                                y1: 18,
                                x2: 230,
                                y2: 383,
                                lineColor: 'black',
                                lineWidth: 1,
                              }
                            ],
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              noBorders: true,
                              body: [
                                [
                                  {
                                    text: decTravauxTtc != null ? decTravauxTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -366, -250, 0]
                                  },
                                  {
                                    text: isArabic('ما تم انجازه') ? reverseArabicText('ما تم انجازه') : 'ما تم انجازه',
                                    font: isArabic('شهادة للدفع') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('ما تم انجازه') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    color: 'black',
                                    margin: [248, -368, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decAvance != null ? decAvance.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -350, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ التسبقة') ? reverseArabicText('مبلغ التسبقة') : ('مبلغ التسبقة'),
                                    font: isArabic('مبلغ التسبقة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ التسبقة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    color: 'black',
                                    margin: [248, -352, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: afficheCb || '0.000',
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -333, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? reverseArabicText('مبلغ الحجز بعنوان الضمان 10%') : ('مبلغ الحجز بعنوان الضمان 10%'),
                                    font: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [230, -336, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decApro != null ? decApro.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -316, -250, 0]
                                  },
                                  {
                                    text: isArabic('التزويدات') ? reverseArabicText('التزويدات') : ('التزويدات'),
                                    font: isArabic('التزويدات') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('التزويدات') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [255, -318, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -299, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ الحجز بعنوان الضمان على التزويدات') ? reverseArabicText('مبلغ الحجز بعنوان الضمان على التزويدات') : ('مبلغ الحجز بعنوان الضمان على التزويدات'),
                                    font: isArabic('مبلغ الحجز بعنوان الضمان على التزويدات') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ الحجز بعنوان الضمان على التزويدات') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [230, -302, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -280, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ مراجعة الاثمان') ? reverseArabicText('مبلغ مراجعة الاثمان') : ('مبلغ مراجعة الاثمان'),
                                    font: isArabic('مبلغ مراجعة الاثمان') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ مراجعة الاثمان') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [255, -283, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decRetAv != null ? decRetAv.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -262, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ استرجاع التسبقة') ? reverseArabicText('مبلغ استرجاع التسبقة') : ('مبلغ استرجاع التسبقة'),
                                    font: isArabic('مبلغ استرجاع التسبقة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع الغير خاضع للضريبة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [255, -265, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -245, -250, 0]
                                  },
                                  {
                                    text: isArabic('المجموع الغير خاضع للضريبة') ? reverseArabicText('المجموع الغير خاضع للضريبة') : ('المجموع الغير خاضع للضريبة'),
                                    font: isArabic('المجموع الغير خاضع للضريبة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع الغير خاضع للضريبة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [255, -250, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxNetAvantRtn != null ? decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -229, -250, 0]
                                  },
                                  {
                                    text: isArabic('المجموع الخاضع للضريبة') ? reverseArabicText('المجموع الخاضع للضريبة') : ('المجموع الخاضع للضريبة'),
                                    font: isArabic('المجموع الخاضع للضريبة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع الخاضع للضريبة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -232, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxNetAvantRtn != null ? decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -210, -250, 0]
                                  },
                                  {
                                    text: isArabic('المجموع العام') ? reverseArabicText('المجموع العام') : ('المجموع العام'),
                                    font: isArabic('المجموع العام') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع العام') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [250, -212, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxNetAvantRtnPrecedent != null ? decTravauxNetAvantRtnPrecedent.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -194, -250, 0]
                                  },
                                  {
                                    text: isArabic('المصاريف السابقة و الواجب خصمها') ? reverseArabicText('المصاريف السابقة و الواجب خصمها') : ('المصاريف السابقة و الواجب خصمها'),
                                    font: isArabic('المصاريف السابقة و الواجب خصمها') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المصاريف السابقة و الواجب خصمها') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [250, -197, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decImposable != null ? decImposable.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -180, -250, 0]
                                  },
                                  {
                                    text: isArabic('الباقي المطلوب دفعه') ? reverseArabicText('الباقي المطلوب دفعه') : ('الباقي المطلوب دفعه'),
                                    font: isArabic('الباقي المطلوب دفعه') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('الباقي المطلوب دفعه') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [265, -182, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decRtva != null ? decRtva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -165, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? reverseArabicText('مبلغ أ ق م  %'+ pctRetTva) : ('مبلغ أ ق م  %'+ pctRetTva),
                                    font: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -166, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decIr != null ? decIr.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -149, -250, 0]
                                  },
                                  {
                                    text: isArabic(' نسبة الخصم على الدخل  %'+ pctRetIr) ? reverseArabicText(' نسبة الخصم على الدخل  %'+ pctRetIr) : (' نسبة الخصم على الدخل  %'+ pctRetIr),
                                    font: isArabic(' نسبة الخصم على الدخل  %'+ pctRetIr) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(' نسبة الخصم على الدخل  %'+ pctRetIr) ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -152, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decPenalite != null ? decPenalite.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -136, -250, 0]
                                  },
                                  {
                                    text: isArabic('خصومات مختلفة ') ? reverseArabicText('خصومات مختلفة ') : ('خصومات مختلفة '),
                                    font: isArabic('خصومات مختلفة ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('خصومات مختلفة ') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -136, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decFraisEnrg != null ? decFraisEnrg.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -122, -250, 0]
                                  },
                                  {
                                    text: isArabic('معلوم التسجيل') ? reverseArabicText('معلوم التسجيل') : ('معلوم التسجيل'),
                                    font: isArabic('معلوم التسجيل') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('معلوم التسجيل') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -122, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decAutreMnt != null ? decAutreMnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -107, -250, 0]
                                  },
                                  {
                                    text: isArabic('مصاريف اخرى') ? reverseArabicText('مصاريف اخرى') : ('مصاريف اخرى'),
                                    font: isArabic('مصاريف اخرى') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مصاريف اخرى') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -107, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decImposableNetApresRtn != null ? decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -92, -250, 0]
                                  },
                                  {
                                    text: isArabic('المبلغ المطلوب دفعه') ? reverseArabicText('المبلغ المطلوب دفعه') : ('المبلغ المطلوب دفعه'),
                                    font: isArabic('المبلغ المطلوب دفعه') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المبلغ المطلوب دفعه') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -92, -100, 0]
                                  }
                                ]
                              ],
                            },
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              widths: [350, 90], // Ajuste la largeur des colonnes pour s'adapter au contenu
                              body: [
                                [
                                  {
                                    text: isArabic(fournisseurArb) ? reverseArabicText(fournisseurArb) : isFrench(fournisseurFranc) ? fournisseurFranc : 'N/A',
                                    font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(fournisseurArb) ? 'rtl' : (isFrench(fournisseurFranc) ? 'ltr' : 'ltr'),
                                    alignment: 'right',
                                    fontSize: 8,
                                    decoration: 'underline',
                                    color: 'black',
                                    margin: [5, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: reverseArabicText('أشهد أنه يمكن دفع إلى'), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('أشهد أنه يمكن دفع إلى') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('أشهد أنه يمكن دفع إلى') ? 'rtl' : 'ltr',
                                    alignment: 'left',
                                    margin: [0, 0, 0, 0],
                                    color: 'black',
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: [100, -69, 0, 0]
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              widths: [90, 60, 350, 90], // Ajuste la largeur des colonnes pour s'adapter au contenu
                              body: [
                                [
                                  {
                                    text: reverseArabicText('باحتساب أ ق م '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('باحتساب أ ق م ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('باحتساب أ ق م ') ? 'rtl' : 'ltr',
                                    alignment: 'center',
                                    margin: [0, -2, -80, 0],
                                    color: 'black',
                                    bold: true,
                                  },
                                  {
                                    text: decImposableNetApresRtn != null ? decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000" , // Valeur dynamique
                                    fontSize: 8,
                                    alignment: 'center',
                                    margin: [0, 0, -80, 0],
                                    color: 'black',
                                    decoration: 'underline',
                                    bold: true,
                                  },
                                  {
                                    text: reversemntChiffre(mntNetChiffre), // Valeur dynamique
                                    font: isArabic(mntNetChiffre) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(mntNetChiffre) ? 'rtl' : 'ltr',
                                    alignment: 'right',
                                    fontSize: 8,
                                    margin: [5, -3, 0, 0],
                                    color: 'black',
                                    bold: true,
                                    decoration: 'underline'
                                  },
                                  {
                                    text: reverseArabicText('ما قدره'), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('ما قدره') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('ما قدره') ? 'rtl' : 'ltr',
                                    alignment: 'left',
                                    color: 'black',
                                    margin: [0, -3, 0, 0],
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: reversemntChiffre(mntNetChiffre) === '0.000' || reversemntChiffre(mntNetChiffre) === '0'
                              ? [-18, 0, 0, 0] :
                              [-23, 0, 0, 0]
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              widths: [100, 200, 100, 100],
                              body: [
                                [
                                  {
                                    text: Rib,
                                    fontSize: 8,
                                    alignment: 'right',
                                    margin: [0, 2, -80, 0],
                                    bold: true,
                                    color: 'black'
                                  },
                                  {
                                    text: reverseArabicText('الحساب البنكي : '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('الحساب البنكي : ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('الحساب البنكي : ') ? 'rtl' : 'ltr',
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                  },
                                  {
                                    text: isArabic(Banque) ? reverseArabicText(Banque) : Banque || 'N/A',
                                    font: isArabic(Banque) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(Banque) ? 'rtl' : 'ltr',
                                    alignment: 'right',
                                    fontSize: 8,
                                    color: 'black',
                                    bold: true,
                                    margin: [0, -1.5, 0, 0]
                                  },
                                  {
                                    text: reverseArabicText('البنك : '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('البنك : ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('البنك : ') ? 'rtl' : 'ltr',
                                    alignment: 'left',
                                    margin: [0, -2, 0, 0],
                                    color: 'black',
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: [85, 0, 0, -10]
                          },
                          {
                            layout: 'noBorders',
                            table: {

                              widths: [150, 150, 150, 150],
                              body: [
                                [
                                  {
                                    text: isArabic('مدير الشؤون المالية') ? reverseArabicText('مدير الشؤون المالية') : ('مدير الشؤون المالية'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('مدير الشؤون المالية') ? 'rtl' : 'ltr',
                                    margin: [45, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('قابل للخلاص المدير العملي') ? reverseArabicText('قابل للخلاص المدير العملي') : ('قابل للخلاص المدير العملي'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('قابل للخلاص المدير العملي') ? 'rtl' : 'ltr',
                                    margin: [30, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('مصلحة المراقبة و التصرف') ? reverseArabicText('مصلحة المراقبة و التصرف') : ('مصلحة المراقبة و التصرف'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('مصلحة المراقبة و التصرف') ? 'rtl' : 'ltr',
                                    margin: [30, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('رئيس المصلحة') ? reverseArabicText('رئيس المصلحة') : ('رئيس المصلحة'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'center',
                                    direction: isArabic('رئيس المصلحة') ? 'rtl' : 'ltr',
                                    margin: [10, 0, 40, 0],
                                    bold: true
                                  }
                                ],
                                [
                                  {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  },
                                  {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  },
                                  {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  }
                                  , {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                    margin: [-40, 0, 0, 0]
                                  }
                                ]
                              ]
                            },
                            margin: [-37, 5, 0, -5]
                          },

                        ]
                      }]
                    ]
                  },
                } 
              ],
              footer: function (currentPage, pageCount) {
                var currentDate = new Date();
                var dateString = currentDate.toLocaleDateString('ar-IT');
                return {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*', '*'],
                    body: [
                      [
                        { text: isArabic(`تاريخ الطباعة: ${dateString}`) ? reverseArabicText(`تاريخ الطباعة: ${dateString}`) : `تاريخ الطباعة: ${dateString}`, fontSize: 9, font: 'Amiri', alignment: 'left', direction: 'ltr', bold: false, border: [false, true, false, false] },
                        { text: isArabic(`الصفحة ${currentPage} / ${pageCount}`) ? reverseArabicText(`الصفحة ${currentPage} / ${pageCount}`) : `الصفحة ${currentPage} / ${pageCount}`, fontSize: 9, font: 'Amiri', alignment: 'center', direction: 'ltr', bold: false, border: [false, true, false, false] },
                        { text: isArabic('منظومة التصرف في الصفقات') ? reverseArabicText('منظومة التصرف في الصفقات') : 'منظومة التصرف في الصفقات', fontSize: 9, font: 'Amiri', alignment: 'right', direction: 'ltr', bold: false, border: [false, true, false, false] }
                      ]
                    ]
                  },
                  layout: 'Borders',
                  margin: [40, 15, 40, 0]
                };
              },
              styles: {
                sectionHeader: {
                  bold: true,
                  decoration: 'underline',
                  fontSize: 14,
                  margin: [0, 15, 0, 15],
                }
              },

            };
            pdfMake.createPdf(docDefinition).open();

          }
          catch (error) {
            console.error('Error during DecMnt fetching or PDF generation', error);
          }
        }
        );
      }
    });
  }

  async generateDecompteProvisoire() {
    console.log(this.typeDecompte)
    let resultJson: any[] = [];
    let allDecTravauxHtParLot: { [key: string]: number[] } = {};
    let allDecAproHtParLot: { [key: string]: number[] } = {};
    let allDecTravauxHtParLotTva: { [key: string]: number[] } = {};
    let allDecAproHtParLotTva: { [key: string]: number[] } = {};
    let allDecTravauxTvaParLot: { [key: string]: number[] } = {};
    let allDecApproTvaParLot: { [key: string]: number[] } = {};
    let allDecTravauxTTcParLot: { [key: string]: number[] } = {};
    let allDecApproTTcParLot: { [key: string]: number[] } = {};
    let globalDecTravauxNetAvantRtnPrecedent: any;





    let allTravaux: { [key: string]: any[] } = {};
    let allAppros: { [key: string]: any[] } = {};

    for (const [index, decompte] of this.decPdf.entries()) {
      const selectedData = this.decomptes.at(index).get('selected')?.value;

      if (selectedData) {
        console.log(decompte)
        const numDecompteSelect = selectedData.numDecompte;
        const numPieceFournSelect = selectedData.numPieceFourn;
        const designationMarche = decompte.mrcEtape.numMarche.designation;
        const dateMarche = decompte.mrcEtape.numMarche.dateMarche;
        const exercice = decompte.mrcEtape.numMarche.exercice;
        const datePiece = new Date(decompte.datePiece);
        const formattedDate = datePiece.toISOString().split('T')[0];
        const fournisseurArb = decompte.mrcEtape.numMarche.idFourn?.designation;
        const fournisseurFranc = decompte.mrcEtape.numMarche.idFourn?.designationFr;
        const numFournisseur = decompte.mrcEtape.numMarche.idFourn?.numFourn;
        const mntMarcheApresAvnt = decompte.mrcEtape.numMarche.mntMrcApresAvenant;
        const Banque = decompte.mrcEtape.numMarche.numBanque?.designation;
        const Rib = decompte.mrcEtape.numMarche.rib;
        const pctRetIr = decompte.pctRetIr;
        const pctRetTva = decompte.pctRetTva;
       // const PctRETIR = decompte.

        try {
          const lots = await this.mrcLotsService.getMrcLotsForMarche(this.numMarche).toPromise();

          if (!lots || lots.length === 0) {
            console.error('Aucun lot trouvé.');
            continue;
          }

          this.lotDesignations = lots.map(lot => `${lot.idPrmLot.designation} ${lot.idPrmLot.idLot}`);
          const formattedLots = this.lotDesignations.join(' / ');
          this.lotIds = lots.map(lot => `${lot.idPrmLot.idLot}`);

          const lotJson = this.lotIds.map((lot, index) => ({
            idLot: lot,
            designation: this.lotDesignations[index],
          }));




          const lotPromises = lotJson.map((lot) => {
            return new Promise<void>((resolve, reject) => {
              Promise.all([
                this.decArticleService.getDecArticlesTravauxDecompte(this.numMarche, lot.idLot, numPieceFournSelect, numDecompteSelect).toPromise(),
                this.decArticleService.getDecArticlesApproDecompte(this.numMarche, lot.idLot, numPieceFournSelect, numDecompteSelect).toPromise(),
                this.decLotService.getDecLot(this.numMarche, numPieceFournSelect, lot.idLot).toPromise(),
                this.decMntService.getDecTravauxNetAvantRtnPrecedent(this.numMarche, numPieceFournSelect).toPromise()
              ])
                .then(([travaux, appro, decLot, decTravauxNetAvantRtnPrecedent]) => {
                  const decTravauxHtParLot = decLot[0]?.decTravauxHtParLot;
                  const decAproHtParLot = decLot[0]?.decAproHtParLot;
                  const decTravauxHtParLotTva = decLot[0]?.decTravauxHtParLotTva;
                  const decAproHtParLotTva = decLot[0]?.decAproHtParLotTva;
                  const decTravauxTvaParLot = decLot[0]?.decTravauxTvaParLot;
                  const decApproTvaParLot = decLot[0]?.decAproTvaParLot;
                  const decTravauxTTcParLot = decLot[0]?.decTravauxTtcParLot;
                  const decApproTTcParLot = decLot[0]?.decAproTtcParLot;
                  console.log('Valeur de decTravauxNetAvantRtnPrecedent pour le lot', lot.idLot, decTravauxNetAvantRtnPrecedent);
                  globalDecTravauxNetAvantRtnPrecedent = decTravauxNetAvantRtnPrecedent;


                  if (!allTravaux[lot.idLot]) {
                    allTravaux[lot.idLot] = [];
                  }
                  allTravaux[lot.idLot] = [...travaux!];

                  if (!allAppros[lot.idLot]) {
                    allAppros[lot.idLot] = [];
                  }
                  allAppros[lot.idLot] = [...appro!];

                  //----------------------------//
                  if (!allDecTravauxHtParLot[lot.idLot]) {
                    allDecTravauxHtParLot[lot.idLot] = [];
                  }
                  if (typeof decTravauxHtParLot === 'number') {
                    allDecTravauxHtParLot[lot.idLot].push(decTravauxHtParLot);
                  } else {
                    console.error(`decTravauxHtParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecAproHtParLot[lot.idLot]) {
                    allDecAproHtParLot[lot.idLot] = [];
                  }
                  if (typeof decAproHtParLot === 'number') {
                    allDecAproHtParLot[lot.idLot].push(decAproHtParLot);
                  } else {
                    console.error(`decAproHtParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }
                  //----------------------------//
                  if (!allDecTravauxHtParLotTva[lot.idLot]) {
                    allDecTravauxHtParLotTva[lot.idLot] = [];
                  }
                  if (typeof decTravauxHtParLotTva === 'number') {
                    allDecTravauxHtParLotTva[lot.idLot].push(decTravauxHtParLotTva);
                  } else {
                    console.error(`decTravauxHtParLotTva pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecAproHtParLotTva[lot.idLot]) {
                    allDecAproHtParLotTva[lot.idLot] = [];
                  }
                  if (typeof decAproHtParLotTva === 'number') {
                    allDecAproHtParLotTva[lot.idLot].push(decAproHtParLotTva);
                  } else {
                    console.error(`decAproHtParLotTva pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }
                  //----------------------------//
                  if (!allDecTravauxTvaParLot[lot.idLot]) {
                    allDecTravauxTvaParLot[lot.idLot] = [];
                  }
                  if (typeof decTravauxTvaParLot === 'number') {
                    allDecTravauxTvaParLot[lot.idLot].push(decTravauxTvaParLot);
                  } else {
                    console.error(`decTravauxTvaParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecApproTvaParLot[lot.idLot]) {
                    allDecApproTvaParLot[lot.idLot] = [];
                  }
                  if (typeof decApproTvaParLot === 'number') {
                    allDecApproTvaParLot[lot.idLot].push(decApproTvaParLot);
                  } else {
                    console.error(`decApproTvaParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }
                  //----------------------------//
                  if (!allDecTravauxTTcParLot[lot.idLot]) {
                    allDecTravauxTTcParLot[lot.idLot] = [];
                  }
                  if (typeof decTravauxTTcParLot === 'number') {
                    allDecTravauxTTcParLot[lot.idLot].push(decTravauxTTcParLot);
                  } else {
                    console.error(`decTravauxTTcParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecApproTTcParLot[lot.idLot]) {
                    allDecApproTTcParLot[lot.idLot] = [];
                  }
                  if (typeof decApproTTcParLot === 'number') {
                    allDecApproTTcParLot[lot.idLot].push(decApproTTcParLot);
                  } else {
                    console.error(`decApproTTcParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }


                  //----------------------------//
                  resolve();
                })
                .catch((error) => {
                  console.error(`Erreur lors des appels pour le lot ${lot.idLot}:`, error);
                  reject(error);
                });
            });
          });

          await Promise.all(lotPromises);

          console.log('Tous les travaux regroupés:', allTravaux);
          console.log('Tous les approvisionnements regroupés:', allAppros);
          console.log('Tous les travaux HT regroupés:', allDecTravauxHtParLot);
          console.log('Tous les approvisionnements HT regroupés:', allDecAproHtParLot);
          console.log('Valeur de decTravauxNetAvantRtnPrecedent stockée globalement:', globalDecTravauxNetAvantRtnPrecedent);

          try {
            const decMntPromise = this.decMntService.getDecMnt(this.numMarche, numPieceFournSelect).toPromise();
            const results = await Promise.all([decMntPromise]);
            const decMnt = results[0];

            if (!decMnt || decMnt.length === 0) {
              console.log('Aucun résultat trouvé pour DecMnt.');
              this.decMntGlobal = [];
            } else {
              console.log('Résultat de DecMnt:', decMnt);
              this.decMntGlobal = decMnt;
            }
          } catch (error) {
            console.error('Erreur lors de l\'appel de getDecMnt:', error);
          }

          const docDefinition: any = {
            pageSize: 'A4',
            header: function () {
              return {
                pageMargins: [15, 15, 15, 30],
                stack: [
                  {
                    columns: [
                      {
                        text: "",
                        fontSize: 7,
                        font: 'Roboto',
                        alignment: 'left',
                        direction: 'ltr',
                        margin: [0, 0, 0, 0]
                      },
                      {
                        text: isArabic('الجمهورية التونسية') ? reverseArabicText('الجمهورية التونسية') : 'الجمهورية التونسية',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: isArabic('الملحقة بالأمر بالصرف عدد .....................') ? reverseArabicText('الملحقة بالأمر بالصرف عدد .....................') : ('الملحقة بالأمر بالصرف عدد .....................'),
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'left',
                        direction: 'rtl',
                        margin: [20, 0, 0, 0]
                      },
                      {
                        text: isArabic('وزارة التجهيز و الإسكان') ? reverseArabicText('وزارة التجهيز و الإسكان') : 'وزارة التجهيز و الإسكان',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: "",
                        fontSize: 7,
                        font: 'Roboto',
                        alignment: 'left',
                        direction: 'ltr',
                        margin: [0, 0, 0, 0]
                      },
                      {
                        text: isArabic('الوكالة العقارية للسكنى') ? reverseArabicText('الوكالة العقارية للسكنى') : 'الوكالة العقارية للسكنى',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  }
                ]
              };
            },
            footer: function (currentPage, pageCount) {
              var currentDate = new Date();
              var dateString = currentDate.toLocaleDateString('ar-IT');
              return {
                table: {
                  headerRows: 1,
                  widths: ['*', '*', '*'],
                  body: [
                    [
                      { text: isArabic(`تاريخ الطباعة: ${dateString}`) ? reverseArabicText(`تاريخ الطباعة: ${dateString}`) : `تاريخ الطباعة: ${dateString}`, fontSize: 9, font: 'Amiri', alignment: 'left', direction: 'ltr', bold: false, border: [false, true, false, false] },
                      { text: isArabic(`الصفحة ${currentPage} / ${pageCount}`) ? reverseArabicText(`الصفحة ${currentPage} / ${pageCount}`) : `الصفحة ${currentPage} / ${pageCount}`, fontSize: 9, font: 'Amiri', alignment: 'center', direction: 'ltr', bold: false, border: [false, true, false, false] },
                      { text: isArabic('منظومة التصرف في الصفقات') ? reverseArabicText('منظومة التصرف في الصفقات') : 'منظومة التصرف في الصفقات', fontSize: 9, font: 'Amiri', alignment: 'right', direction: 'ltr', bold: false, border: [false, true, false, false] }
                    ]
                  ]
                },
                layout: 'Borders',
                margin: [40, 15, 40, 0]
              };
            },
            styles: {
              sectionHeader: {
                bold: true,
                decoration: 'underline',
                fontSize: 14,
                margin: [0, 15, 0, 15],
              }
            },
            content: [
              {
                text: isArabic(' كشف حساب وقتي عدد ') ? numDecompteSelect + reverseArabicText(' كشف حساب وقتي عدد ') : numDecompteSelect + (' كشف حساب وقتي عدد '),
                fontSize: 13,
                bold: true,
                alignment: 'center',
                font: isArabic(' كشف حساب وقتي عدد ') ? 'Amiri' : 'Roboto',
                direction: isArabic(' كشف حساب وقتي عدد ') ? 'rtl' : 'ltr',
                margin: [0, 0, 0, 0]
              },
              {
                text: isArabic('للاشغال المنجزة و النفقات المقدمة') ? reverseArabicText('للاشغال المنجزة و النفقات المقدمة') : ('للاشغال المنجزة و النفقات المقدمة'),
                fontSize: 12,
                bold: true,
                alignment: 'center',
                font: isArabic('للاشغال المنجزة و النفقات المقدمة') ? 'Amiri' : 'Roboto',
                direction: isArabic('للاشغال المنجزة و النفقات المقدمة') ? 'rtl' : 'ltr',
                margin: [0, 0, 0, 5]
              },
              {
                text: isArabic('الى غاية تاريخ') ? reverseArabicText('الى غاية تاريخ') : ('الى غاية تاريخ'),
                fontSize: 12,
                bold: true,
                alignment: 'center',
                font: isArabic('الى غاية تاريخ') ? 'Amiri' : 'Roboto',
                direction: isArabic('الى غاية تاريخ') ? 'rtl' : 'ltr',
                margin: [80, 0, 0, -17]
              },
              {
                text: formattedDate || 'N/A',
                fontSize: 11,
                font: 'Roboto',
                bold: true,
                alignment: 'center',
                color: 'black',
                margin: [-71, 0, 0, 30]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: exercice || 'N/A', bold: false
                      }, isArabic('السنة المالية : ') ? reverseArabicText('السنة المالية : ') : ('السنة المالية : '),
                    ]
                  }
                ],
                fontSize: 12,
                font: 'Amiri',
                bold: true,
                color: 'black',
                alignment: 'right',
                direction: 'rtl',
                margin: [0, 15, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: mntMarcheApresAvnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false
                      },
                      isArabic('مبلغ الصفقة باعتبار الملاحق  : ') ? reverseArabicText('مبلغ الصفقة باعتبار الملاحق  : ') : ('مبلغ الصفقة باعتبار الملاحق  : '),
                    ],
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                margin: [0, -10, 0, 13]
              }
              ,
              {
                text: [
                  {
                    text: [
                      {
                        text:
                          isArabic(designationMarche) ? reverseArabicText(designationMarche.length > 60 ? designationMarche.slice(0, 100) + "..." : designationMarche.slice(0, 100)) :
                            isFrench(designationMarche) ? reverseFrenchText(designationMarche.length > 60 ? designationMarche.slice(0, 80) + "..." : designationMarche.slice(0, 80) + "...") :
                              designationMarche.length > 60 ? designationMarche.slice(0, 80) + "..." : designationMarche.slice(0, 80) + "...",
                        fontSize: 9,
                        font: isArabic(designationMarche) ? 'Amiri' : 'Roboto',
                        direction: isArabic(designationMarche) ? 'rtl' : (isFrench(designationMarche) ? 'ltr' : 'ltr'),
                        alignment: 'right',
                        bold: false
                      },
                      isArabic('موضوع الصفقة  : ') ? reverseArabicText('موضوع الصفقة  : ') : ('موضوع الصفقة  : '),
                    ],
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: truncateText(reverseText(formattedLots), 120) || 'N/A',
                        fontSize: 9,
                        font: 'Amiri',
                        bold: true,
                        alignment: 'right',
                        direction: 'rtl',
                        color: 'black',
                        noWrap: true,
                      }, isArabic('التقاسيم : ') ? reverseArabicText('التقاسيم  : ') : 'التقاسيم  : ',
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                    color: 'black',
                    bold: true,
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                margin: [0, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: numFournisseur + "    " || 'N/A',
                        fontSize: 9,
                        font: 'Roboto',
                        alignment: 'right',
                        direction: 'ltr',
                        bold: false,
                      }, isArabic(' المعرف الجبائى : ') ? reverseArabicText(' المعرف الجبائى : ') : (' المعرف الجبائى : '),
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                color: 'black',
                bold: true,
                margin: [20, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: isArabic(fournisseurArb)
                          ? reverseArabicText(fournisseurArb)
                          : isFrench(fournisseurFranc)
                            ? fournisseurFranc
                            : 'N/A',
                        fontSize: 9,
                        font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                        alignment: 'right',
                        direction: isArabic(fournisseurArb) ? 'rtl' : (isFrench(fournisseurFranc) ? 'ltr' : 'ltr'),
                        bold: false
                      }, isArabic('المقاول : ') ? reverseArabicText('المقاول : ') : ('المقاول : '),
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',

                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: dateMarche || 'N/A',
                        fontSize: 10,
                        font: 'Roboto',
                        bold: false,
                        alignment: 'right'
                      }, isArabic('الصفقة المصادق عليها بتاريخ : ') ? reverseArabicText('الصفقة المصادق عليها بتاريخ : ') : ('الصفقة المصادق عليها بتاريخ : '),
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',

                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 13]
              },
              ...lotJson.map((lot, i) => {
                const travauxForLot = allTravaux[lot.idLot] || [];
                const TravauxHtParLot = allDecTravauxHtParLot[lot.idLot] || [];
                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                )[] = [];
                resultContent.push({
                  text: [
                    //{ text: isArabic(lot) ? reverseArabicText(lot.replace(/[()]/g, '').trim()) : lot.replace(/[()]/g, '').trim(), fontSize: 12 },
                    isArabic('الأشغال ') ? reverseArabicText('الأشغال ') : 'الأشغال '
                  ],
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  style: '',
                  margin: [0, 10, -13, -10]
                });
                resultContent.push({
                  table: {
                    headerRows: 1,
                    widths: [80, 15, 16, 50, 20, 50, 210, 40],
                    body: [
                      [
                        { text: isArabic('الثمن الجملي د.ت') ? reverseArabicText('الثمن الجملي د.ت') : ('الثمن الجملي د.ت'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('تفاصيل الاثمان') ? reverseArabicText('تفاصيل الاثمان') : ('تفاصيل الاثمان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3', colSpan: 5 },
                        '', '', '', '',
                        { text: isArabic('البيان') ? reverseArabicText('البيان') : ('البيان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('رمز العنصر') ? reverseArabicText('رمز العنصر') : 'رمز العنصر', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                      ],

                      [
                        { text: '', fillColor: '#D3D3D3' },
                        { text: '%', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('ا ق م') ? reverseArabicText('ا ق م') : ('ا ق م'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الثمن الفردي') ? reverseArabicText('الثمن الفردي') : ('الثمن الفردي'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الوحدة') ? reverseArabicText('الوحدة') : 'الوحدة', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الكمية') ? reverseArabicText('الكمية') : ('الكمية'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' }
                      ],
                      [
                        {
                          text: isArabic(lot.designation)
                            ? reverseArabicText(
                                lot.designation
                                  .replace(/[()]/g, '')
                                  .trim()
                                  .replace(/\d+/g, match => '\u200F' + match) // 🔥 Ajout du RLM pour gérer les chiffres dans l'arabe
                              )
                            : lot.designation.replace(/[()]/g, '').trim(),
                          fontSize: 11,
                          font: 'Amiri',
                          alignment: 'right',
                          colSpan: 8,
                          bold: true,
                          color: 'black',
                          noWrap: true, // 🔥 Empêche le retour à la ligne
                          direction: isArabic(lot.designation) ? 'rtl' : 'ltr' // 🔥 Gère la direction selon la langue
                        },
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 2
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 3
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 4
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 5
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6

                      ],
                      ...travauxForLot
                        .map((travail, index) => {
                          return [
                            { text: (travail?.travHtRea != null ? (+travail.travHtRea).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.pctRea != null ? travail.pctRea : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.tva != null ? travail.tva : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.prixUnitaire != null ? (+travail.prixUnitaire).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: travail?.libUnite ?? 'N/A', fontSize: 8, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.quantiteRea != null ? (+travail.quantiteRea).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: truncateTextFrench(travail?.designationFr, 50) || 'N/A', fontSize: 9.7, font: 'Amiri', alignment: 'center' },
                            { text: travail?.codeArticle ?? 'N/A', fontSize: 9, font: 'Amiri', alignment: 'center' }                            

                          ];
                        }),
                      ...TravauxHtParLot
                        .map((total, index) => {
                          return [
                            { text: (total != null ? (+total).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center', fillColor: '#D3D3D3' },
                            { text: '', fontSize: 7, font: 'Amiri', alignment: 'center', colSpan: 6 },  // Cette cellule couvre 6 colonnes vides
                            '', '', '', '', '',  // Ajoutez les cellules vides restantes pour maintenir la structure du tableau
                            { text: isArabic('المجموع') ? reverseArabicText('المجموع') : ('المجموع'), fontSize: 7, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' }
                          ]
                        })
                    ]
                  },
                  layout: 'Borders',
                  margin: [-26, 10, 0, 10]
                });
                return resultContent;
              }),

              ...lotJson.map((lot, i) => {
                const dectravauxHtParLot = allDecTravauxHtParLot[lot.idLot] || [];
                const dectravauxHtParLotTva = allDecTravauxHtParLotTva[lot.idLot] || [];
                const dectravauxTvaParLot = allDecTravauxTvaParLot[lot.idLot] || [];
                const dectravauxTTcParLot = allDecTravauxTTcParLot[lot.idLot] || [];
                const getFormattedValue = (valueArray) => {
                  return valueArray.length > 0 ? valueArray[0].toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000";
                };

                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                )[] = [];

                resultContent.push(
                  {
                    text: [
                      {
                        text: isArabic(lot.designation)
                          ? reverseArabicText(
                              lot.designation
                                .replace(/[()]/g, '')
                                .trim()
                                .replace(/\d+/g, match => '\u200F' + match) // Ajout de RLM pour bien positionner les chiffres
                            )
                          : lot.designation.replace(/[()]/g, '').trim(),
                        fontSize: 13,
                        color: 'black',
                        bold: true,
                        noWrap: true // 🔥 Empêche le retour à la ligne
                      }
                    ],
                    font: 'Amiri',
                    alignment: 'right',
                    direction: isArabic(lot.designation) ? 'rtl' : 'ltr', // 🔥 Direction dynamique
                    bold: true,
                    style: 'sectionHeader',
                    margin: [0, 10, -8, -10]
                  }
                    ,                  
                  {
                    table: {
                      headerRows: 1, // Nombre de lignes d'en-tête
                      widths: [150, '*'], // Largeurs des colonnes : la première est fixe, la deuxième est flexible
                      body: [
                        [
                          {
                            text: isArabic('مجموع الأشغال دون إحتساب الأداءات:') ? reverseArabicText('مجموع الأشغال دون إحتساب الأداءات:') : 'مجموع الأشغال دون إحتساب الأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأشغال دون إحتساب الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأشغال دون إحتساب الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(dectravauxHtParLot),//dectravauxHtParLot à corriger
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع الأداءات:') ? reverseArabicText('مجموع الأداءات:') : 'مجموع الأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(dectravauxTvaParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع الأشغال باحتساب لاأداءات:') ? reverseArabicText('مجموع الأشغال باحتساب لاأداءات:') : 'مجموع الأشغال باحتساب لاأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأشغال باحتساب لاأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأشغال باحتساب لاأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(dectravauxTTcParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ]
                      ]
                    },
                    layout: 'noBorders', // Spécifiez un layout (par exemple, 'noBorders' pour un tableau sans bordures)
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                    margin: [-10, 10, 0, 10]
                  }
                );
                return resultContent;
              }),
              {
                table: {
                  headerRows: 1, // Nombre de lignes d'en-tête
                  widths: [150, '*'], // Largeurs des colonnes : la première est fixe, la deuxième est flexible
                  body: [
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxHt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false, fontSize: 11
                              }, isArabic('مجموع مبالغ الأشغال دون إحتساب الأداءات : ') ? reverseArabicText('مجموع مبالغ الأشغال دون إحتساب الأداءات : ') : ('مجموع مبالغ الأشغال دون إحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: '0.000', bold: false
                              },
                              {
                                text: '  : Fodec', bold: true
                              }
                            ],
                            fontSize: 11,
                          }
                        ],
                        fontSize: 10,
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false, fontSize: 11
                              }, isArabic('مبلغ التخفيض : ') ? reverseArabicText('مبلغ التخفيض : ') : ('مبلغ التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxHtApresRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false, fontSize: 11
                              }, isArabic('مجموع مبالغ الأشغال دون إحتساب الأداءات باعتبار التخفيض : ') ? reverseArabicText('مجموع مبالغ الأشغال دون إحتساب الأداءات باعتبار التخفيض : ') : ('مجموع مبالغ الأشغال دون إحتساب الأداءات باعتبار التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxTva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false, fontSize: 11
                              }, isArabic('مجموع الأداءات : ') ? reverseArabicText('مجموع الأداءات : ') : ('مجموع الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false, fontSize: 11
                              }, isArabic(' مجموع الأشغال باحتساب الأداءات : ') ? reverseArabicText(' مجموع الأشغال باحتساب الأداءات : ') : (' مجموع الأشغال باحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                  ]
                },
                layout: 'noBorders',
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                margin: [-30, 0, 0, 0]
              },
              {
                text: '', pageBreak: 'after'
              },
              ...lotJson.map((lot, i) => {
                const approsForLot = allAppros[lot.idLot] || [];
                const ApproHtParLot = allDecAproHtParLot[lot.idLot] || [];
                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                  | { text: any[]; pageBreak: string }
                )[] = [];
                resultContent.push({
                  text: [
                    isArabic('التزويد ') ? reverseArabicText('التزويد ') : 'التزويد '
                  ],
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  style: '',
                  margin: [0, 10, -13, -10]
                });
                resultContent.push({
                  table: {
                    headerRows: 1,
                    widths: [90, 20, 60, 20, 60, 210, 40],
                    body: [
                      [
                        { text: isArabic('الثمن الجملي د.ت') ? reverseArabicText('الثمن الجملي د.ت') : ('الثمن الجملي د.ت'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('تفاصيل الاثمان') ? reverseArabicText('تفاصيل الاثمان') : ('تفاصيل الاثمان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3', colSpan: 4 },
                        '', '', '',
                        { text: isArabic('البيان') ? reverseArabicText('البيان') : ('البيان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('رمز العنصر') ? reverseArabicText('رمز العنصر') : 'رمز العنصر', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                      ],

                      [
                        { text: '', fillColor: '#D3D3D3' },
                        { text: isArabic('ا ق م') ? reverseArabicText('ا ق م') : ('ا ق م'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الثمن الفردي د.ت') ? reverseArabicText('الثمن الفردي د.ت') : ('الثمن الفردي د.ت'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الوحدة') ? reverseArabicText('الوحدة') : 'الوحدة', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الكمية') ? reverseArabicText('الكمية') : ('الكمية'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' }
                      ],
                      [
                        { text: isArabic(lot.designation)
                          ? reverseArabicText(
                              lot.designation
                                .replace(/[()]/g, '')
                                .trim()
                                .replace(/\d+/g, match => '\u200F' + match) // 🔥 Ajout du RLM pour gérer les chiffres dans l'arabe
                            )
                          : lot.designation.replace(/[()]/g, '').trim(), fontSize: 11, font: 'Amiri', alignment: 'right', colSpan: 7, bold: true, color: 'black',noWrap: true, direction: isArabic(lot.designation) ? 'rtl' : 'ltr'  },  // Cellule 1
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 2
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 3
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 4
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 5
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6

                      ],

                      ...approsForLot.map(approData => {
                        return [
                          {
                            text: (approData?.aprMntHt != null
                              ? (+approData.aprMntHt).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              : 'N/A'),
                            fontSize: 9,
                            font: 'Amiri',
                            alignment: 'center'
                          },
                          {
                            text: (approData?.tva != null
                              ? (+approData.tva)
                              : 'N/A'),
                            fontSize: 9,
                            font: 'Amiri',
                            alignment: 'center'
                          },
                          {
                            text: (approData?.prixUnitaire != null
                              ? (+approData.prixUnitaire).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              : 'N/A'),
                            fontSize: 9,
                            font: 'Amiri',
                            alignment: 'center'
                          },
                          {
                            text: approData?.libUnite || 'N/A',
                            fontSize: 8,
                            font: 'Amiri',
                            alignment: 'center'
                          },
                          {
                            text: (approData?.quantite != null
                              ? (+approData.quantite).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              : 'N/A'),
                            fontSize: 9,
                            font: 'Amiri',
                            alignment: 'center'
                          },
                          {
                            text: truncateTextFrench(approData?.designationFr, 50) || 'N/A',
                            fontSize: 9.7,
                            font: 'Amiri',
                            alignment: 'center'
                          },
                          {
                            text: approData?.codeArticle || 'N/A',
                            fontSize: 9,
                            font: 'Amiri',
                            alignment: 'center'
                          }
                        ]
                        ;
                      }),
                      ...ApproHtParLot
                        .map((total, index) => {
                          return [
                            { text: (total != null ? (+total).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center', fillColor: '#D3D3D3' },
                            { text: '', fontSize: 7, font: 'Amiri', alignment: 'center', colSpan: 5 },  // Cette cellule couvre 6 colonnes vides
                            '', '', '', '', // Ajoutez les cellules vides restantes pour maintenir la structure du tableau
                            { text: isArabic('المجموع') ? reverseArabicText('المجموع') : ('المجموع'), fontSize: 7, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' }
                          ]
                        })

                    ]
                  },
                  layout: 'Borders',
                  margin: [-26, 10, 0, 10]
                })
                return resultContent;
              }),

              ...lotJson.map((lot, i) => {
                const decapproHtParLot = allDecAproHtParLot[lot.idLot] || [];
                const decapproHtParLotTva = allDecAproHtParLotTva[lot.idLot] || [];
                const decapproTvaParLot = allDecApproTvaParLot[lot.idLot] || [];
                const decapproTTcParLot = allDecApproTTcParLot[lot.idLot] || [];

                const getFormattedValue = (valueArray) => {
                  return valueArray.length > 0 ? valueArray[0].toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000";
                };
                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                )[] = [];
                resultContent.push(
                  {
                    text: [
                      {
                        text: isArabic(lot.designation)
                          ? reverseArabicText(
                              lot.designation
                                .replace(/[()]/g, '')
                                .trim()
                                .replace(/\d+/g, match => '\u200F' + match) // Ajout de RLM pour bien positionner les chiffres
                            )
                          : lot.designation.replace(/[()]/g, '').trim(),
                        fontSize: 13,
                        color: 'black',
                        bold: true,
                        noWrap: true // 🔥 Empêche le retour à la ligne
                      }
                    ],
                    font: 'Amiri',
                    alignment: 'right',
                    direction: isArabic(lot.designation) ? 'rtl' : 'ltr', // 🔥 Direction dynamique
                    bold: true,
                    style: 'sectionHeader',
                    margin: [0, 10, -8, -10]
                  },
                  {
                    table: {
                      headerRows: 1, // Nombre de lignes d'en-tête
                      widths: [150, '*'], // Largeurs des colonnes : la première est fixe, la deuxième est flexible
                      body: [
                        [
                          {
                            text: isArabic('مجموع التزويدات دون إحتساب الأداءات:') ? reverseArabicText('مجموع التزويدات دون إحتساب الأداءات:') : 'مجموع التزويدات دون إحتساب الأداءات:',
                            fontSize: 9, font: isArabic('مجموع التزويدات دون إحتساب الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع التزويدات دون إحتساب الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(decapproHtParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع الأداءات:') ? reverseArabicText('مجموع الأداءات:') : 'مجموع الأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(decapproTvaParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع التزويدات باحتساب لاأداءات:') ? reverseArabicText('مجموع التزويدات باحتساب لاأداءات:') : 'مجموع التزويدات باحتساب لاأداءات:',
                            fontSize: 9, font: isArabic('مجموع التزويدات باحتساب لاأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع التزويدات باحتساب لاأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(decapproTTcParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ]
                      ]
                    },
                    layout: 'noBorders', // Spécifiez un layout (par exemple, 'noBorders' pour un tableau sans bordures)
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                    margin: [-10, 10, 0, 10]
                  }
                );
                return resultContent;
              }),
              {
                table: {
                  headerRows: 1,
                  widths: [150, '*'],
                  body: [
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproHt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false, fontSize: 11
                              }, isArabic('مجموع مبالغ التزويدات دون إحتساب الأداءات : ') ? reverseArabicText('مجموع مبالغ التزويدات دون إحتساب الأداءات : ') : ('مجموع مبالغ التزويدات دون إحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false, fontSize: 11
                              }, isArabic('مبلغ التخفيض : ') ? reverseArabicText('مبلغ التخفيض : ') : ('مبلغ التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproHtApresRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false, fontSize: 11
                              }, isArabic('مجموع مبالغ التزويدات دون إحتساب الأداءات باعتبار التخفيض : ') ? reverseArabicText('مجموع مبالغ التزويدات دون إحتساب الأداءات باعتبار التخفيض : ') : ('مجموع مبالغ التزويدات دون إحتساب الأداءات باعتبار التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproTva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false, fontSize: 11
                              }, isArabic('مجموع الأداءات : ') ? reverseArabicText('مجموع الأداءات : ') : ('مجموع الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false, fontSize: 11
                              }, isArabic(' مجموع التزويدات باحتساب الأداءات : ') ? reverseArabicText(' مجموع التزويدات باحتساب الأداءات : ') : (' مجموع التزويدات باحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decApro.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.000", bold: false, fontSize: 11
                              }, isArabic('مبلغ التزويدات %80 : ') ? reverseArabicText('مبلغ التزويدات %80 : ') : ('مبلغ التزويدات %80 : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                  ]
                },
                layout: 'noBorders',
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                margin: [-30, 0, 0, 0]
              },
              {
                text: '', pageBreak: 'after'
              },
              {
                table: {
                  headerRows: 2,
                  widths: [79, 79, 79, 79, 79, 130],
                  body: [
                    [
                      {
                        text: isArabic('الباقي المطلوب دفعه') ? reverseArabicText('الباقي المطلوب دفعه') : 'الباقي المطلوب دفعه',
                        fontSize: 7,
                        font: isArabic('الباقي المطلوب دفعه') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('الباقي المطلوب دفعه') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                        colSpan: 2
                      },
                      {
                      },
                      {
                        text: isArabic('الحجز بعنوان الضمان') ? reverseArabicText('الحجز بعنوان الضمان') : 'الحجز بعنوان الضمان',
                        fontSize: 7,
                        font: isArabic('الحجز بعنوان الضمان') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('الحجز بعنوان الضمان') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('المصاريف المقدمة') ? reverseArabicText('المصاريف المقدمة') : 'المصاريف المقدمة',
                        fontSize: 7,
                        font: isArabic('المصاريف المقدمة') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('المصاريف المقدمة') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                        colSpan: 2
                      },
                      {
                      },
                      {
                        text: isArabic('حوصلة الكشف') ? reverseArabicText('حوصلة الكشف') : ('حوصلة الكشف'),
                        fontSize: 7,
                        font: isArabic('حوصلة الكشف') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('حوصلة الكشف') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                    ],
                    [
                      {
                        text: isArabic('غير خاضعة') ? reverseArabicText('غير خاضعة') : 'غير خاضعة',
                        fontSize: 7,
                        font: isArabic('غير خاضعة') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('غير خاضعة') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('خاضعة للضرائب') ? reverseArabicText('خاضعة للضرائب') : 'خاضعة للضرائب',
                        fontSize: 7,
                        font: isArabic('خاضعة للضرائب') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('خاضعة للضرائب') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: '',
                        fontSize: 7,
                        font: '',
                        alignment: 'center',
                        direction: '',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('غير خاضعة') ? reverseArabicText('غير خاضعة') : 'غير خاضعة',
                        fontSize: 7,
                        font: isArabic('غير خاضعة') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('غير خاضعة') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('خاضعة للضرائب') ? reverseArabicText('خاضعة للضرائب') : 'خاضعة للضرائب',
                        fontSize: 7,
                        font: isArabic('خاضعة للضرائب') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('خاضعة للضرائب') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: '',
                        fontSize: 7,
                        font: '',
                        alignment: 'center',
                        direction: '',
                        fillColor: '#D3D3D3',
                      },
                    ],
                    //ligne 1
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('جملة مصاريف الأشهر الفارطة'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 2 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مصاريف الشهر'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 3 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('الأشغال غير المنجزة'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 4 
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decTvAprGar != null ? this.decMntGlobal.decTvAprGar.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.afficheCb || '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decTravauxTtc != null ? this.decMntGlobal.decTravauxTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مجموع الاشغال باحتساب كل الاداءات'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 5
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decApro != null ? this.decMntGlobal.decApro.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.0000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decApro != null ? this.decMntGlobal.decApro.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' من مجموع التزويدات باحتساب كل الاداءات ') + '80%',
                        fontSize: 7.1,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 6 
                    [
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مبلغ مراجعة الأثمان'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 7 
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decTtAv != null 
                        ? this.decMntGlobal.decTtAv.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.afficheCb || '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decTrvApro != null ? this.decMntGlobal.decTrvApro.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المجموع'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 8 
                    [
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decAvPay != null 
                        ? this.decMntGlobal.decAvPay.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.decRetAv != null 
                        ? this.decMntGlobal.decRetAv.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") 
                        : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decAvance != null ? this.decMntGlobal.decAvance.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") :"0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مبلغ التسبقة'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 9 
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decTravauxNetAvantRtn != null ? this.decMntGlobal.decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.decRetTt != null ? this.decMntGlobal.decRetTt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decDepTt != null ? this.decMntGlobal.decDepTt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المجموع'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 10 
                    [
                      {
                        text: this.decMntGlobal.decTravauxNetAvantRtn != null ? this.decMntGlobal.decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                        rowSpan: 9,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المجموع العام'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 11
                    [
                      {
                        text: globalDecTravauxNetAvantRtnPrecedent != null ? globalDecTravauxNetAvantRtnPrecedent.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المصاريف السابقة و الواجب خصمها'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 12
                    [
                      {
                        text: this.decMntGlobal.decImposable != null ? this.decMntGlobal.decImposable.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('الباقي المطلوب دفعه'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 13
                    [
                      {
                        text: this.decMntGlobal.decRtva != null ? this.decMntGlobal.decRtva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' مبلغ الخصم على أ ق م  %' + pctRetTva),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 14 
                    [
                      {
                        text: this.decMntGlobal.decIr != null ? this.decMntGlobal.decIr.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' مبلغ الخصم على الدخل   %' + pctRetIr),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 15
                    [
                      {
                        text: this.decMntGlobal.decPenalite != null ? this.decMntGlobal.decPenalite.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('خصومات مختلفة'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 16
                    [
                      {
                        text: this.decMntGlobal.decFraisEnrg != null ? this.decMntGlobal.decFraisEnrg.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('معلوم التسجيل'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 17
                    [
                      {
                        text: this.decMntGlobal.decAutreMnt != null ? this.decMntGlobal.decAutreMnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مصاريف اخرى '),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 18
                    [
                      {
                        text: this.decMntGlobal.decImposableNetApresRtn!= null ? this.decMntGlobal.decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مبلغ الحساب الوقتي المطلوب دفعه'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ]
                  ]
                },
                margin: [-35, 30, 0, 10]
              },
              {
                table: {
                  headerRows: 1,
                  widths: ['*', '*'],
                  body: [
                    [
                      {
                        text: reverseArabicText(' أعد هذا الكشف و سجل بالدفتر اليومي'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 8,
                        margin: [70, 0, 0, -6]
                      },
                      {
                        text: reverseArabicText('إطلع عليه و تثبت من صحته'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 8,
                        margin: [150, 0, 0, -3]
                      },

                    ],
                    [
                      {
                        text: reverseArabicText(' تحت عدد...........................................................من قبل الممضي'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' ليرفق بشهادة الدفع عدد .....................بتاريخ...........................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [70, 0, -150, 0]
                      },

                    ],
                    [
                      {
                        text: reverseArabicText(' أسفله..................................................................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' ب......................................في......................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [70, 0, -150, -6]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText('ب.......................................في............................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [3, 0, 0, 0]
                      },
                      {
                        text: reverseArabicText('المسؤول'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        alignment: 'right',
                        margin: [70, 0, -20, 0]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText(' الإمضاء'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [100, 0, 0, 0]
                      },
                      {
                        text: reverseArabicText(''),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        alignment: 'right',
                        margin: [70, 0, -20, 0]
                      }
                    ],
                  ]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 30]
              },
              {
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: reverseArabicText('وافق عليه صاحب الخدمة'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 10,
                        margin: [420, -20, 0, -8]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText('الإمضاء'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [447, -5, -150, 0]
                      },
                    ],
                  ]
                },
                layout: 'noBorders',
              },
            ]
          };
          pdfMake.createPdf(docDefinition).open();
        } catch (error) {
          console.error('Erreur lors de l\'appel de l\'API des lots:', error);
        }
      }
    }

    return resultJson;
  }

  async generateAvanceDecompte() {
    console.log(this.typeDecompte)

    for (const [index, decompte] of this.decPdf.entries()) {
      const selectedData = this.decomptes.at(index).get('selected')?.value;
      if (selectedData) {
        const numDecompteSelect = selectedData.numDecompte;
        const numPieceFournSelect = selectedData.numPieceFourn;
        const designationMarche = decompte.mrcEtape.numMarche.designation;
        const dateMarche = decompte.mrcEtape.numMarche.dateMarche;
        const exercice = decompte.mrcEtape.numMarche.exercice;
        const datePiece = new Date(decompte.datePiece);
        const formattedDate = datePiece.toISOString().split('T')[0];
        const fournisseurArb = decompte.mrcEtape.numMarche.idFourn?.designation;
        const fournisseurFranc = decompte.mrcEtape.numMarche.idFourn?.designationFr;
        const numFournisseur = decompte.mrcEtape.numMarche.idFourn?.numFourn;
        const mntMarcheApresAvnt = decompte.mrcEtape.numMarche.mntMrcApresAvenant;
        const Banque = decompte.mrcEtape.numMarche.numBanque?.designation;
        const Rib = decompte.mrcEtape.numMarche.rib;
        const pctRetIr = decompte.pctRetIr;
        const pctRetTva = decompte.pctRetTva;
        try {
          const lots = await this.mrcLotsService.getMrcLotsForMarche(this.numMarche).toPromise();
          if (!lots || lots.length === 0) {
            console.error('Aucun lot trouvé.');
            continue;
          }

          this.lotDesignations = lots.map(lot => `${lot.idPrmLot.designation} ${lot.idPrmLot.idLot}`);
          const formattedLots = this.lotDesignations.join(' / ');

          const decMntPromise = this.decMntService.getDecMnt(this.numMarche, numPieceFournSelect).toPromise();
          const results = await Promise.all([decMntPromise]);
          const decMnt = results[0];

          if (!decMnt || decMnt.length === 0) {
            console.log('Aucun résultat trouvé pour DecMnt.');
            this.decMntGlobal = [];
          } else {
            console.log('Résultat de DecMnt:', decMnt);
            this.decMntGlobal = decMnt;
          }

          const docDefinition: any = {
            pageSize: 'A4',
            header: function () {
              return {
                pageMargins: [15, 15, 15, 30],
                stack: [
                  {
                    columns: [
                      {
                        text: "",
                        fontSize: 7,
                        font: 'Roboto',
                        alignment: 'left',
                        direction: 'ltr',
                        margin: [0, 0, 0, 0]
                      },
                      {
                        text: isArabic('الجمهورية التونسية') ? reverseArabicText('الجمهورية التونسية') : 'الجمهورية التونسية',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: isArabic('الملحقة بالأمر بالصرف عدد .....................') ? reverseArabicText('الملحقة بالأمر بالصرف عدد .....................') : ('الملحقة بالأمر بالصرف عدد .....................'),
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'left',
                        direction: 'rtl',
                        margin: [20, 0, 0, 0]
                      },
                      {
                        text: isArabic('وزارة التجهيز و الإسكان') ? reverseArabicText('وزارة التجهيز و الإسكان') : 'وزارة التجهيز و الإسكان',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: "",
                        fontSize: 7,
                        font: 'Roboto',
                        alignment: 'left',
                        direction: 'ltr',
                        margin: [0, 0, 0, 0]
                      },
                      {
                        text: isArabic('الوكالة العقارية للسكنى') ? reverseArabicText('الوكالة العقارية للسكنى') : 'الوكالة العقارية للسكنى',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  }
                ]
              };
            },
            footer: function (currentPage, pageCount) {
              var currentDate = new Date();
              var dateString = currentDate.toLocaleDateString('ar-IT');
              return {
                table: {
                  headerRows: 1,
                  widths: ['*', '*', '*'],
                  body: [
                    [
                      { text: isArabic(`تاريخ الطباعة: ${dateString}`) ? reverseArabicText(`تاريخ الطباعة: ${dateString}`) : `تاريخ الطباعة: ${dateString}`, fontSize: 9, font: 'Amiri', alignment: 'left', direction: 'ltr', bold: false, border: [false, true, false, false] },
                      { text: isArabic(`الصفحة ${currentPage} / ${pageCount}`) ? reverseArabicText(`الصفحة ${currentPage} / ${pageCount}`) : `الصفحة ${currentPage} / ${pageCount}`, fontSize: 9, font: 'Amiri', alignment: 'center', direction: 'ltr', bold: false, border: [false, true, false, false] },
                      { text: isArabic('منظومة التصرف في الصفقات') ? reverseArabicText('منظومة التصرف في الصفقات') : 'منظومة التصرف في الصفقات', fontSize: 9, font: 'Amiri', alignment: 'right', direction: 'ltr', bold: false, border: [false, true, false, false] }
                    ]
                  ]
                },
                layout: 'Borders',
                margin: [40, 15, 40, 0]
              };
            },
            styles: {
              sectionHeader: {
                bold: true,
                decoration: 'underline',
                fontSize: 14,
                margin: [0, 15, 0, 15],
              }
            },
            content: [
              {
                text: isArabic(' كشف حساب وقتي : تسبقة على الصفقة ') ? reverseArabicText(' كشف حساب وقتي : تسبقة على الصفقة ') : (' كشف حساب وقتي : تسبقة على الصفقة '),
                fontSize: 13,
                bold: true,
                alignment: 'center',
                font: isArabic(' كشف حساب وقتي : تسبقة على الصفقة ') ? 'Amiri' : 'Roboto',
                direction: isArabic(' كشف حساب وقتي : تسبقة على الصفقة ') ? 'rtl' : 'ltr',
                margin: [0, 0, 0, 0]
              },
              {
                text: isArabic('للاشغال المنجزة و النفقات المقدمة') ? reverseArabicText('للاشغال المنجزة و النفقات المقدمة') : ('للاشغال المنجزة و النفقات المقدمة'),
                fontSize: 12,
                bold: true,
                alignment: 'center',
                font: isArabic('للاشغال المنجزة و النفقات المقدمة') ? 'Amiri' : 'Roboto',
                direction: isArabic('للاشغال المنجزة و النفقات المقدمة') ? 'rtl' : 'ltr',
                margin: [0, 0, 0, 3]
              },
              {
                text: isArabic('الى غاية تاريخ') ? reverseArabicText('الى غاية تاريخ') : ('الى غاية تاريخ'),
                fontSize: 12,
                bold: true,
                alignment: 'center',
                font: isArabic('الى غاية تاريخ') ? 'Amiri' : 'Roboto',
                direction: isArabic('الى غاية تاريخ') ? 'rtl' : 'ltr',
                margin: [80, 0, 0, -15]
              },
              {
                text: formattedDate || 'N/A',
                fontSize: 11,
                font: 'Roboto',
                bold: true,
                alignment: 'center',
                color: 'black',
                margin: [-71, 0, 0, -5]
              },
              {
                table: {
                  widths: ['*', '*','*'],
                  body: [[
                    {
                      text: [
                        {
                          text: dateMarche || 'N/A',
                          fontSize: 9,
                          font: 'Roboto',
                          bold: false,
                          alignment: 'right',
                          direction: 'ltr'
                        },
                        isArabic('الصفقة المصادق عليها بتاريخ : ') 
                          ? reverseArabicText('الصفقة المصادق عليها بتاريخ : ')  
                          : ('الصفقة المصادق عليها بتاريخ : ') 
                      ],
                      fontSize: 10,
                      font: 'Amiri',
                      alignment: 'left',
                      direction: 'rtl',
                      bold: true,
                      color: 'black',
                      margin: [0, 16, 6, 0]
                    },
                    {
                      text: [
                        {
                          text: mntMarcheApresAvnt
                            ? mntMarcheApresAvnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            : "0.000",
                          bold: false,
                          fontSize:10.4
                        },
                        isArabic('مبلغ الصفقة باعتبار الملاحق : ') 
                          ? reverseArabicText('مبلغ الصفقة باعتبار الملاحق : ') 
                          : ('مبلغ الصفقة باعتبار الملاحق : ') 
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                      bold: true,
                      margin: [0, 15, -25, 0]
                    },
                    {
                      text: [
                        {
                          text: exercice || 'N/A',
                          bold: false
                        },
                        isArabic('السنة المالية : ') ? reverseArabicText('السنة المالية : ') : ('السنة المالية : ')
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      bold: true,
                      color: 'black',
                      alignment: 'right',
                      direction: 'rtl',
                      margin: [0, 15, 0, 0]
                    }                    
                  ]]
                },
                margin:[0,0,0,10],
                layout: 'noBorders'
              },
              {
                text: [
                  {
                    text: [
                      {
                        text:
                          isArabic(designationMarche) ? reverseArabicText(designationMarche.length > 60 ? designationMarche.slice(0, 100) + "..." : designationMarche.slice(0, 100)) :
                            isFrench(designationMarche) ? reverseFrenchText(designationMarche.length > 60 ? designationMarche.slice(0, 80) + "..." : designationMarche.slice(0, 80) + "...") :
                              designationMarche.length > 60 ? designationMarche.slice(0, 80) + "..." : designationMarche.slice(0, 80) + "...",
                        fontSize: 9,
                        font: isArabic(designationMarche) ? 'Amiri' : 'Roboto',
                        direction: isArabic(designationMarche) ? 'rtl' : (isFrench(designationMarche) ? 'ltr' : 'ltr'),
                        alignment: 'right',
                        bold: false
                      },
                      isArabic('موضوع الصفقة  : ') ? reverseArabicText('موضوع الصفقة  : ') : ('موضوع الصفقة  : '),
                    ],
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: truncateText(reverseText(formattedLots), 120) || 'N/A',
                        fontSize: 9,
                        font: 'Amiri',
                        bold: true,
                        alignment: 'right',
                        direction: 'rtl',
                        color: 'black',
                        noWrap: true,
                      }, isArabic('التقاسيم : ') ? reverseArabicText('التقاسيم  : ') : 'التقاسيم  : ',
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                    color: 'black',
                    bold: true,
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                margin: [0, -10, 0, 13]
              },
              {
                table: {
                  widths: ['*', '*'], // 3 colonnes de largeur égale
                  body: [[
                                        {
                      text: [
                        {
                          text: isArabic(fournisseurArb)
                            ? reverseArabicText(fournisseurArb)
                            : isFrench(fournisseurFranc)
                              ? fournisseurFranc
                              : 'N/A',
                          fontSize: 9,
                          font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                          alignment: 'right',
                          direction: isArabic(fournisseurArb) ? 'rtl' : 'ltr',
                          bold: false
                        },
                        isArabic('المقاول : ') ? reverseArabicText('المقاول : ') : ('المقاول : ')
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                      color: 'black',
                      bold: true,
                      margin: [0, 0, 0, 0]
                    },
                     {
                      text: [
                        {
                          text: numFournisseur ? numFournisseur + ' ' : 'N/A',
                          fontSize: 9,
                          font: 'Roboto',
                          alignment: 'right',
                          direction: 'ltr',
                          bold: false,
                        },
                        isArabic('المعرف الجبائى : ') ? reverseArabicText('المعرف الجبائى : ') : ('المعرف الجبائى : ')
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                      color: 'black',
                      bold: true,
                      margin: [0, 0, 0, 0]
                    },
              
                    // 3e texte (dateMarche)
                   
                  ]]
                },
                layout: 'noBorders',
                margin: [0, -10, 0, 9]
              },              
             /*  {
                text: [
                  {
                    text: [
                      {
                        text: numFournisseur + "    " || 'N/A',
                        fontSize: 9,
                        font: 'Roboto',
                        alignment: 'right',
                        direction: 'ltr',
                        bold: false,
                      }, isArabic(' المعرف الجبائى : ') ? reverseArabicText(' المعرف الجبائى : ') : (' المعرف الجبائى : '),
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                color: 'black',
                bold: true,
                margin: [20, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: isArabic(fournisseurArb)
                          ? reverseArabicText(fournisseurArb)
                          : isFrench(fournisseurFranc)
                            ? fournisseurFranc
                            : 'N/A',
                        fontSize: 9,
                        font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                        alignment: 'right',
                        direction: isArabic(fournisseurArb) ? 'rtl' : (isFrench(fournisseurFranc) ? 'ltr' : 'ltr'),
                        bold: true
                      }, isArabic('المقاول : ') ? reverseArabicText('المقاول : ') : ('المقاول : '),
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',

                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 13]
              }, */
              /* {
                text: [
                  {
                    text: [
                      {
                        text: dateMarche || 'N/A',
                        fontSize: 9,
                        font: 'Roboto',
                        bold: false,
                        alignment: 'right'
                      }, isArabic('الصفقة المصادق عليها بتاريخ : ') ? reverseArabicText('الصفقة المصادق عليها بتاريخ : ') : ('الصفقة المصادق عليها بتاريخ : '),
                    ],
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',

                  }
                ],
                fontSize: 10,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 5]
              }, */
              {
                table: {
                  headerRows: 1,
                  widths: [90, 90, 90, 240],
                  body: [
                    //Header de tableau
                    [
                      {
                        text: isArabic(' الباقي المطلوب دفعه') ? reverseArabicText(' الباقي المطلوب دفعه') : (' الباقي المطلوب دفعه'),
                        fontSize: 8,
                        font: isArabic(' الباقي المطلوب دفعه') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic(' الباقي المطلوب دفعه') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('الحجز بعنوان الضمان') ? reverseArabicText('الحجز بعنوان الضمان') : ('الحجز بعنوان الضمان'),
                        fontSize: 8,
                        font: isArabic('الحجز بعنوان الضمان') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('الحجز بعنوان الضمان') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic(' المصاريف المقدمة ') ? reverseArabicText('المصاريف المقدمة ') : 'المصاريف المقدمة ',
                        fontSize: 8,
                        font: isArabic('المصاريف المقدمة ') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('المصاريف المقدمة ') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('حوصلة الكشف') ? reverseArabicText('حوصلة الكشف') : ('حوصلة الكشف'),
                        fontSize: 8,
                        font: isArabic('حوصلة الكشف') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('حوصلة الكشف') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      }
                    ],
                    //ligne 1 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: reverseArabicText('جملة مصاريف الأشهر الفارطة'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 2 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: reverseArabicText('مصاريف الشهر'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 3 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: reverseArabicText('الأشغال غير المنجزة'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 4 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: reverseArabicText('مجموع الاشغال باحتساب كل الاداءات'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 5
                    [
                      {
                        text: '0.000',
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: reverseArabicText(' من مجموع التزويدات باحتساب كل الاداءات ') + '80%',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 6 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: reverseArabicText('مبلغ مراجعة الأثمان'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 7 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: reverseArabicText('المجموع'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 8 
                    [
                      {
                        text: this.decMntGlobal.decImposable != null ? this.decMntGlobal.decImposable.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.decAvance != null ? this.decMntGlobal.decAvance.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: reverseArabicText('مبلغ التسبقة'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 9 
                    [
                      {
                        text: this.decMntGlobal.decImposable != null ? this.decMntGlobal.decImposable.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.decAvance != null ? this.decMntGlobal.decAvance.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: reverseArabicText('المجموع العام'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 10 
                    [
                      {
                        text: '0.000',
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 2,
                        rowSpan: 9,
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المصاريف السابقة و الواجب خصمها'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 11
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 2,
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('الباقي دفعه بعنوان السنة المالية الحالية'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 12
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 2,
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' مبلغ التسبقات المدفوعة بعنوان تصرف السنة الجارية الواجب خصمه'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 13
                    [
                      {
                        text: this.decMntGlobal.decRtva != null ? this.decMntGlobal.decRtva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 2,
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' مبلغ الخصم على أ ق م  %' + pctRetTva),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 14 
                    [
                      {
                        text: this.decMntGlobal.decIr != null ? this.decMntGlobal.decIr.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.000',
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 2,
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' مبلغ الخصم على الدخل %' + pctRetIr),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 15
                    [
                      {
                        text: this.decMntGlobal.decPenalite !=null ? this.decMntGlobal.decPenalite.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 2,
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('خصومات مختلفة'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 16
                    [
                      {
                        text: this.decMntGlobal.decFraisEnrg != null ? this.decMntGlobal.decFraisEnrg.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.000',
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 2,
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('معاليم التسجيل'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 17
                    [
                      {
                        text: this.decMntGlobal.decAutreMnt != null ? this.decMntGlobal.decAutreMnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 2,
                        rowSpan: 8,
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مصاريف اخرى'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 18
                    [
                      {
                        text: this.decMntGlobal.decAvanceNet != null ? this.decMntGlobal.decAvanceNet.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.000',
                        fontSize: 9,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 2,
                        rowSpan: 9,
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' مبلغ الحساب الوقتي المطلوب دفعه'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ]


                  ]
                },
                layout: {
                  hLineWidth: function (i, node) { return 1; },
                  vLineWidth: function (i, node) { return 1; },
                  hLineColor: function (i, node) { return '#000000'; },
                  vLineColor: function (i, node) { return '#000000'; },
                  paddingLeft: function (i, node) { return 5; },
                  paddingRight: function (i, node) { return 5; },

                  paddingTop: function (i, node) {
                    if (i > 0) {
                      return 3;
                    }
                    return 3;
                  },

                  paddingBottom: function (i, node) {
                    return 3;
                  }
                },
                margin: [-31, -8, 80, 6]
              },
              {
                table: {
                  headerRows: 1,
                  widths: ['*', '*'],
                  body: [
                    [
                      {
                        text: reverseArabicText(' أعد هذا الكشف و سجل بالدفتر اليومي'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 8,
                        margin: [70, 5, 0, -10]
                      },
                      {
                        text: reverseArabicText('إطلع عليه و تثبت من صحته'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 8,
                        margin: [150, 5, 0, -6]
                      },

                    ],
                    [
                      {
                        text: reverseArabicText(' تحت عدد...........................................................من قبل الممضي'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' ليرفق بشهادة الدفع عدد .....................بتاريخ...........................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [70, 0, -150, 0]
                      },

                    ],
                    [
                      {
                        text: reverseArabicText(' أسفله..................................................................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' ب......................................في......................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [70, 0, -150, -6]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText('ب.......................................في............................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [3, 0, 0, 0]
                      },
                      {
                        text: reverseArabicText('المسؤول'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        alignment: 'right',
                        margin: [70, 0, -20, 0]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText(' الإمضاء'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [100, 0, 0, 0]
                      },
                      {
                        text: reverseArabicText(''),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        alignment: 'right',
                        margin: [70, 0, -20, 0]
                      }
                    ],
                  ]
                },
                layout: 'noBorders',
              },
              {
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: reverseArabicText('وافق عليه صاحب الخدمة'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 9,
                        margin: [420, -20, 0, -8]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText('الإمضاء'),
                        fontSize: 9,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [447, -5, -150, 0]
                      },
                    ],
                  ]
                },
                layout: 'noBorders',
              },
            ]
          };
          pdfMake.createPdf(docDefinition).open();
        } catch (error) {
          console.error('Erreur lors de l\'appel de l\'API des lots:', error);
        }
      }
    }


  }

  async generateLrgDecompte() {
    console.log(this.typeDecompte)

    let resultJson: any[] = [];
    let allDecTravauxHtParLot: { [key: string]: number[] } = {};
    let allDecAproHtParLot: { [key: string]: number[] } = {};
    let allDecTravauxHtParLotTva: { [key: string]: number[] } = {};
    let allDecAproHtParLotTva: { [key: string]: number[] } = {};
    let allDecTravauxTvaParLot: { [key: string]: number[] } = {};
    let allDecApproTvaParLot: { [key: string]: number[] } = {};
    let allDecTravauxTTcParLot: { [key: string]: number[] } = {};
    let allDecApproTTcParLot: { [key: string]: number[] } = {};
    let globalDecTravauxNetAvantRtnPrecedent: any;





    let allTravaux: { [key: string]: any[] } = {};
    let allAppros: { [key: string]: any[] } = {};

    for (const [index, decompte] of this.decPdf.entries()) {
      const selectedData = this.decomptes.at(index).get('selected')?.value;

      if (selectedData) {
        const numDecompteSelect = selectedData.numDecompte;
        const numPieceFournSelect = selectedData.numPieceFourn;
        const designationMarche = decompte.mrcEtape.numMarche.designation;
        const dateMarche = decompte.mrcEtape.numMarche.dateMarche;
        const exercice = decompte.mrcEtape.numMarche.exercice;
        const datePiece = new Date(decompte.datePiece);
        const formattedDate = datePiece.toISOString().split('T')[0];
        const fournisseurArb = decompte.mrcEtape.numMarche.idFourn?.designation;
        const fournisseurFranc = decompte.mrcEtape.numMarche.idFourn?.designationFr;
        const numFournisseur = decompte.mrcEtape.numMarche.idFourn?.numFourn;
        const mntMarcheApresAvnt = decompte.mrcEtape.numMarche.mntMrcApresAvenant;
        const Banque = decompte.mrcEtape.numMarche.numBanque?.designation;
        const Rib = decompte.mrcEtape.numMarche.rib;
        const pctRetIr = decompte.pctRetIr;
        const pctRetTva = decompte.pctRetTva;
        try {
          const lots = await this.mrcLotsService.getMrcLotsForMarche(this.numMarche).toPromise();
          const numPieceFournNetDern = await this.decompteService.getNumPieceFournForDecompteNetDer(this.numMarche).toPromise();
          console.log('im netdern' + numPieceFournNetDern)
          if (!lots || lots.length === 0) {
            console.error('Aucun lot trouvé.');
            continue;
          }

          this.lotDesignations = lots.map(lot => `${lot.idPrmLot.designation} ${lot.idPrmLot.idLot}`);
          const formattedLots = this.lotDesignations.join(' / ');
          this.lotIds = lots.map(lot => `${lot.idPrmLot.idLot}`);

          const lotJson = this.lotIds.map((lot, index) => ({
            idLot: lot,
            designation: this.lotDesignations[index],
          }));




          const lotPromises = lotJson.map((lot) => {
            return new Promise<void>((resolve, reject) => {
              Promise.all([
                this.decArticleService.getDecArticlesTravauxDecompteLRGfromNetDern(this.numMarche, lot.idLot, numPieceFournNetDern).toPromise(),
                this.decArticleService.getDecArticlesApproDecompteLRGfromNetDern(this.numMarche, lot.idLot, numPieceFournNetDern).toPromise(),
                this.decLotService.getDecLot(this.numMarche, numPieceFournSelect, lot.idLot).toPromise(),
                this.decMntService.getDecTravauxNetAvantRtnPrecedent(this.numMarche, numPieceFournSelect).toPromise()
              ])
                .then(([travaux, appro, decLot, decTravauxNetAvantRtnPrecedent]) => {
                  const decTravauxHtParLot = decLot[0]?.decTravauxHtParLot;
                  const decAproHtParLot = decLot[0]?.decAproHtParLot;
                  const decTravauxHtParLotTva = decLot[0]?.decTravauxHtParLotTva;
                  const decAproHtParLotTva = decLot[0]?.decAproHtParLotTva;
                  const decTravauxTvaParLot = decLot[0]?.decTravauxTvaParLot;
                  const decApproTvaParLot = decLot[0]?.decAproTvaParLot;
                  const decTravauxTTcParLot = decLot[0]?.decTravauxTtcParLot;
                  const decApproTTcParLot = decLot[0]?.decAproTtcParLot;
                  console.log('Valeur de decTravauxNetAvantRtnPrecedent pour le lot', lot.idLot, decTravauxNetAvantRtnPrecedent);
                  globalDecTravauxNetAvantRtnPrecedent = decTravauxNetAvantRtnPrecedent;


                  if (!allTravaux[lot.idLot]) {
                    allTravaux[lot.idLot] = [];
                  }
                  allTravaux[lot.idLot] = [...travaux!];

                  if (!allAppros[lot.idLot]) {
                    allAppros[lot.idLot] = [];
                  }
                  allAppros[lot.idLot] = [...appro!];

                  //----------------------------//
                  if (!allDecTravauxHtParLot[lot.idLot]) {
                    allDecTravauxHtParLot[lot.idLot] = [];
                  }
                  if (typeof decTravauxHtParLot === 'number') {
                    allDecTravauxHtParLot[lot.idLot].push(decTravauxHtParLot);
                  } else {
                    console.error(`decTravauxHtParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecAproHtParLot[lot.idLot]) {
                    allDecAproHtParLot[lot.idLot] = [];
                  }
                  if (typeof decAproHtParLot === 'number') {
                    allDecAproHtParLot[lot.idLot].push(decAproHtParLot);
                  } else {
                    console.error(`decAproHtParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }
                  //----------------------------//
                  if (!allDecTravauxHtParLotTva[lot.idLot]) {
                    allDecTravauxHtParLotTva[lot.idLot] = [];
                  }
                  if (typeof decTravauxHtParLotTva === 'number') {
                    allDecTravauxHtParLotTva[lot.idLot].push(decTravauxHtParLotTva);
                  } else {
                    console.error(`decTravauxHtParLotTva pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecAproHtParLotTva[lot.idLot]) {
                    allDecAproHtParLotTva[lot.idLot] = [];
                  }
                  if (typeof decAproHtParLotTva === 'number') {
                    allDecAproHtParLotTva[lot.idLot].push(decAproHtParLotTva);
                  } else {
                    console.error(`decAproHtParLotTva pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }
                  //----------------------------//
                  if (!allDecTravauxTvaParLot[lot.idLot]) {
                    allDecTravauxTvaParLot[lot.idLot] = [];
                  }
                  if (typeof decTravauxTvaParLot === 'number') {
                    allDecTravauxTvaParLot[lot.idLot].push(decTravauxTvaParLot);
                  } else {
                    console.error(`decTravauxTvaParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecApproTvaParLot[lot.idLot]) {
                    allDecApproTvaParLot[lot.idLot] = [];
                  }
                  if (typeof decApproTvaParLot === 'number') {
                    allDecApproTvaParLot[lot.idLot].push(decApproTvaParLot);
                  } else {
                    console.error(`decApproTvaParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }
                  //----------------------------//
                  if (!allDecTravauxTTcParLot[lot.idLot]) {
                    allDecTravauxTTcParLot[lot.idLot] = [];
                  }
                  if (typeof decTravauxTTcParLot === 'number') {
                    allDecTravauxTTcParLot[lot.idLot].push(decTravauxTTcParLot);
                  } else {
                    console.error(`decTravauxTTcParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecApproTTcParLot[lot.idLot]) {
                    allDecApproTTcParLot[lot.idLot] = [];
                  }
                  if (typeof decApproTTcParLot === 'number') {
                    allDecApproTTcParLot[lot.idLot].push(decApproTTcParLot);
                  } else {
                    console.error(`decApproTTcParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }


                  //----------------------------//
                  resolve();
                })
                .catch((error) => {
                  console.error(`Erreur lors des appels pour le lot ${lot.idLot}:`, error);
                  reject(error);
                });
            });
          });

          await Promise.all(lotPromises);

          console.log('Tous les travaux regroupés:', allTravaux);
          console.log('Tous les approvisionnements regroupés:', allAppros);
          console.log('Tous les travaux HT regroupés:', allDecTravauxHtParLot);
          console.log('Tous les approvisionnements HT regroupés:', allDecAproHtParLot);
          console.log('Valeur de decTravauxNetAvantRtnPrecedent stockée globalement:', globalDecTravauxNetAvantRtnPrecedent);

          try {
            const decMntPromise = this.decMntService.getDecMnt(this.numMarche, numPieceFournSelect).toPromise();
            const results = await Promise.all([decMntPromise]);
            const decMnt = results[0];

            if (!decMnt || decMnt.length === 0) {
              console.log('Aucun résultat trouvé pour DecMnt.');
              this.decMntGlobal = [];
            } else {
              console.log('Résultat de DecMnt:', decMnt);
              this.decMntGlobal = decMnt;
            }
          } catch (error) {
            console.error('Erreur lors de l\'appel de getDecMnt:', error);
          }

          const docDefinition: any = {
            pageSize: 'A4',
            header: function () {
              return {
                pageMargins: [15, 15, 15, 30],
                stack: [
                  {
                    columns: [
                      {
                        text: "",
                        fontSize: 7,
                        font: 'Roboto',
                        alignment: 'left',
                        direction: 'ltr',
                        margin: [0, 0, 0, 0]
                      },
                      {
                        text: isArabic('الجمهورية التونسية') ? reverseArabicText('الجمهورية التونسية') : 'الجمهورية التونسية',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: isArabic('الملحقة بالأمر بالصرف عدد .....................') ? reverseArabicText('الملحقة بالأمر بالصرف عدد .....................') : ('الملحقة بالأمر بالصرف عدد .....................'),
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'left',
                        direction: 'rtl',
                        margin: [20, 0, 0, 0]
                      },
                      {
                        text: isArabic('وزارة التجهيز و الإسكان') ? reverseArabicText('وزارة التجهيز و الإسكان') : 'وزارة التجهيز و الإسكان',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: "",
                        fontSize: 7,
                        font: 'Roboto',
                        alignment: 'left',
                        direction: 'ltr',
                        margin: [0, 0, 0, 0]
                      },
                      {
                        text: isArabic('الوكالة العقارية للسكنى') ? reverseArabicText('الوكالة العقارية للسكنى') : 'الوكالة العقارية للسكنى',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  }
                ]
              };
            },
            footer: function (currentPage, pageCount) {
              var currentDate = new Date();
              var dateString = currentDate.toLocaleDateString('ar-IT');
              return {
                table: {
                  headerRows: 1,
                  widths: ['*', '*', '*'],
                  body: [
                    [
                      { text: isArabic(`تاريخ الطباعة: ${dateString}`) ? reverseArabicText(`تاريخ الطباعة: ${dateString}`) : `تاريخ الطباعة: ${dateString}`, fontSize: 9, font: 'Amiri', alignment: 'left', direction: 'ltr', bold: false, border: [false, true, false, false] },
                      { text: isArabic(`الصفحة ${currentPage} / ${pageCount}`) ? reverseArabicText(`الصفحة ${currentPage} / ${pageCount}`) : `الصفحة ${currentPage} / ${pageCount}`, fontSize: 9, font: 'Amiri', alignment: 'center', direction: 'ltr', bold: false, border: [false, true, false, false] },
                      { text: isArabic('منظومة التصرف في الصفقات') ? reverseArabicText('منظومة التصرف في الصفقات') : 'منظومة التصرف في الصفقات', fontSize: 9, font: 'Amiri', alignment: 'right', direction: 'ltr', bold: false, border: [false, true, false, false] }
                    ]
                  ]
                },
                layout: 'Borders',
                margin: [40, 15, 40, 0]
              };
            },
            styles: {
              sectionHeader: {
                bold: true,
                decoration: 'underline',
                fontSize: 14,
                margin: [0, 15, 0, 15],
              }
            },
            content: [
              {
                text: reverseArabicText('كشف تحرير حجز الضمان'),
                fontSize: 13,
                bold: true,
                alignment: 'center',
                font: 'Amiri',
                direction: 'rtl',
                margin: [0, 0, 0, 0]
              },
              {
                text: isArabic('للاشغال المنجزة و النفقات المقدمة') ? reverseArabicText('للاشغال المنجزة و النفقات المقدمة') : ('للاشغال المنجزة و النفقات المقدمة'),
                fontSize: 12,
                bold: true,
                alignment: 'center',
                font: isArabic('للاشغال المنجزة و النفقات المقدمة') ? 'Amiri' : 'Roboto',
                direction: isArabic('للاشغال المنجزة و النفقات المقدمة') ? 'rtl' : 'ltr',
                margin: [0, 0, 0, 5]
              },
              {
                text: isArabic('الى غاية تاريخ') ? reverseArabicText('الى غاية تاريخ') : ('الى غاية تاريخ'),
                fontSize: 12,
                bold: true,
                alignment: 'center',
                font: isArabic('الى غاية تاريخ') ? 'Amiri' : 'Roboto',
                direction: isArabic('الى غاية تاريخ') ? 'rtl' : 'ltr',
                margin: [80, 0, 0, -17]
              },
              {
                text: formattedDate || 'N/A',
                fontSize: 11,
                font: 'Roboto',
                bold: true,
                alignment: 'center',
                color: 'black',
                margin: [-71, 0, 0, 30]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: exercice || 'N/A', bold: false
                      }, isArabic('السنة المالية : ') ? reverseArabicText('السنة المالية : ') : ('السنة المالية : '),
                    ]
                  }
                ],
                fontSize: 12,
                font: 'Amiri',
                bold: true,
                color: 'black',
                alignment: 'right',
                direction: 'rtl',
                margin: [0, 15, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: mntMarcheApresAvnt || "0.000", bold: false
                      },
                      isArabic('مبلغ الصفقة باعتبار الملاحق  : ') ? reverseArabicText('مبلغ الصفقة باعتبار الملاحق  : ') : ('مبلغ الصفقة باعتبار الملاحق  : '),
                    ],
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                margin: [0, -10, 0, 13]
              }
              ,
              {
                text: [
                  {
                    text: [
                      {
                        text:
                          isArabic(designationMarche) ? reverseArabicText(designationMarche.length > 60 ? designationMarche.slice(0, 100) + "..." : designationMarche.slice(0, 100)) :
                            isFrench(designationMarche) ? reverseFrenchText(designationMarche.length > 60 ? designationMarche.slice(0, 80) + "..." : designationMarche.slice(0, 80) + "...") :
                              designationMarche.length > 60 ? designationMarche.slice(0, 80) + "..." : designationMarche.slice(0, 80) + "...",
                        fontSize: 9,
                        font: isArabic(designationMarche) ? 'Amiri' : 'Roboto',
                        direction: isArabic(designationMarche) ? 'rtl' : (isFrench(designationMarche) ? 'ltr' : 'ltr'),
                        alignment: 'right',
                        bold: false
                      },
                      isArabic('موضوع الصفقة  : ') ? reverseArabicText('موضوع الصفقة  : ') : ('موضوع الصفقة  : '),
                    ],
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: truncateText(reverseText(formattedLots), 120) || 'N/A',
                        fontSize: 9,
                        font: 'Amiri',
                        bold: true,
                        alignment: 'right',
                        direction: 'rtl',
                        color: 'black',
                        noWrap: true,
                      }, isArabic('التقاسيم : ') ? reverseArabicText('التقاسيم  : ') : 'التقاسيم  : ',
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                    color: 'black',
                    bold: true,
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                margin: [0, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: numFournisseur + "    " || 'N/A',
                        fontSize: 9,
                        font: 'Roboto',
                        alignment: 'right',
                        direction: 'ltr',
                        bold: false,
                      }, isArabic(' المعرف الجبائى : ') ? reverseArabicText(' المعرف الجبائى : ') : (' المعرف الجبائى : '),
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                color: 'black',
                bold: true,
                margin: [20, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: isArabic(fournisseurArb)
                          ? reverseArabicText(fournisseurArb)
                          : isFrench(fournisseurFranc)
                            ? fournisseurFranc
                            : 'N/A',
                        fontSize: 9,
                        font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                        alignment: 'right',
                        direction: isArabic(fournisseurArb) ? 'rtl' : (isFrench(fournisseurFranc) ? 'ltr' : 'ltr'),
                        bold: false
                      }, isArabic('المقاول : ') ? reverseArabicText('المقاول : ') : ('المقاول : '),
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',

                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: dateMarche || 'N/A',
                        fontSize: 10,
                        font: 'Roboto',
                        bold: false,
                        alignment: 'right'
                      }, isArabic('الصفقة المصادق عليها بتاريخ : ') ? reverseArabicText('الصفقة المصادق عليها بتاريخ : ') : ('الصفقة المصادق عليها بتاريخ : '),
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',

                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 13]
              },
              ...lotJson.map((lot, i) => {
                const travauxForLot = allTravaux[lot.idLot] || [];
                const TravauxHtParLot = allDecTravauxHtParLot[lot.idLot] || [];
                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                )[] = [];
                resultContent.push({
                  text: [
                    //{ text: isArabic(lot) ? reverseArabicText(lot.replace(/[()]/g, '').trim()) : lot.replace(/[()]/g, '').trim(), fontSize: 12 },
                    isArabic('الأشغال ') ? reverseArabicText('الأشغال ') : 'الأشغال '
                  ],
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  style: '',
                  margin: [0, 10, -13, -10]
                });
                resultContent.push({
                  table: {
                    headerRows: 1,
                    widths: [80, 15, 16, 50, 20, 50, 210, 40],
                    body: [
                      [
                        { text: isArabic('الثمن الجملي د.ت') ? reverseArabicText('الثمن الجملي د.ت') : ('الثمن الجملي د.ت'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('تفاصيل الاثمان') ? reverseArabicText('تفاصيل الاثمان') : ('تفاصيل الاثمان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3', colSpan: 5 },
                        '', '', '', '',
                        { text: isArabic('البيان') ? reverseArabicText('البيان') : ('البيان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('رمز العنصر') ? reverseArabicText('رمز العنصر') : 'رمز العنصر', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                      ],

                      [
                        { text: '', fillColor: '#D3D3D3' },
                        { text: '%', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('ا ق م') ? reverseArabicText('ا ق م') : ('ا ق م'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الثمن الفردي') ? reverseArabicText('الثمن الفردي') : ('الثمن الفردي'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الوحدة') ? reverseArabicText('الوحدة') : 'الوحدة', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الكمية') ? reverseArabicText('الكمية') : ('الكمية'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' }
                      ],
                      [
                        {
                          text: isArabic(lot.designation)
                            ? reverseArabicText(
                                lot.designation
                                  .replace(/[()]/g, '')
                                  .trim()
                                  .replace(/\d+/g, match => '\u200F' + match) // 🔥 Ajout du RLM pour gérer les chiffres dans l'arabe
                              )
                            : lot.designation.replace(/[()]/g, '').trim(),
                          fontSize: 11,
                          font: 'Amiri',
                          alignment: 'right',
                          colSpan: 8,
                          bold: true,
                          color: 'black',
                          noWrap: true, // 🔥 Empêche le retour à la ligne
                          direction: isArabic(lot.designation) ? 'rtl' : 'ltr' // 🔥 Gère la direction selon la langue
                        },
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 2
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 3
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 4
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 5
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6

                      ],
                      ...travauxForLot
                        .map((travail, index) => {
                          return [
                            { text: (travail?.travHtRea != null ? (+travail.travHtRea).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.pctRea != null ? travail.pctRea : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.tva != null ? travail.tva : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.prixUnitaire != null ? (+travail.prixUnitaire).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: travail?.libUnite ?? 'N/A', fontSize: 8, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.quantiteRea != null ? (+travail.quantiteRea).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: truncateTextFrench(travail?.designationFr, 50) || 'N/A', fontSize: 9.7, font: 'Amiri', alignment: 'center' },
                            { text: travail?.codeArticle ?? 'N/A', fontSize: 9, font: 'Amiri', alignment: 'center' }
                          ];
                        }),
                      ...TravauxHtParLot
                        .map((total, index) => {
                          return [
                            {
                              text: (total != null ? (+total).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center', fillColor: '#D3D3D3'
                            },
                            { text: '', fontSize: 7, font: 'Amiri', alignment: 'center', colSpan: 6 },  // Cette cellule couvre 6 colonnes vides
                            '', '', '', '', '',  // Ajoutez les cellules vides restantes pour maintenir la structure du tableau
                            { text: isArabic('المجموع') ? reverseArabicText('المجموع') : ('المجموع'), fontSize: 7, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' }
                          ]
                        })
                    ]
                  },
                  layout: 'Borders',
                  margin: [-26, 10, 0, 10]
                });
                return resultContent;
              }),
              ...lotJson.map((lot, i) => {
                const dectravauxHtParLot = allDecTravauxHtParLot[lot.idLot] || [];
                const dectravauxHtParLotTva = allDecTravauxHtParLotTva[lot.idLot] || [];
                const dectravauxTvaParLot = allDecTravauxTvaParLot[lot.idLot] || [];
                const dectravauxTTcParLot = allDecTravauxTTcParLot[lot.idLot] || [];
                const getFormattedValue = (valueArray) => {
                  return valueArray.length > 0 ? valueArray[0].toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000";
                };

                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                )[] = [];

                resultContent.push(
                  {
                    text: [
                      {
                        text: isArabic(lot.designation)
                          ? reverseArabicText(
                              lot.designation
                                .replace(/[()]/g, '')
                                .trim()
                                .replace(/\d+/g, match => '\u200F' + match) // Ajout de RLM pour bien positionner les chiffres
                            )
                          : lot.designation.replace(/[()]/g, '').trim(),
                        fontSize: 13,
                        color: 'black',
                        bold: true,
                        noWrap: true // 🔥 Empêche le retour à la ligne
                      }
                    ],
                    font: 'Amiri',
                    alignment: 'right',
                    direction: isArabic(lot.designation) ? 'rtl' : 'ltr', // 🔥 Direction dynamique
                    bold: true,
                    style: 'sectionHeader',
                    margin: [0, 10, -8, -10]
                  },
                  {
                    table: {
                      headerRows: 1, // Nombre de lignes d'en-tête
                      widths: [150, '*'], // Largeurs des colonnes : la première est fixe, la deuxième est flexible
                      body: [
                        [
                          {
                            text: isArabic('مجموع الأشغال دون إحتساب الأداءات:') ? reverseArabicText('مجموع الأشغال دون إحتساب الأداءات:') : 'مجموع الأشغال دون إحتساب الأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأشغال دون إحتساب الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأشغال دون إحتساب الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(dectravauxHtParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع الأداءات:') ? reverseArabicText('مجموع الأداءات:') : 'مجموع الأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(dectravauxTvaParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع الأشغال باحتساب لاأداءات:') ? reverseArabicText('مجموع الأشغال باحتساب لاأداءات:') : 'مجموع الأشغال باحتساب لاأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأشغال باحتساب لاأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأشغال باحتساب لاأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(dectravauxTTcParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ]
                      ]
                    },
                    layout: 'noBorders', // Spécifiez un layout (par exemple, 'noBorders' pour un tableau sans bordures)
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                    margin: [-10, 10, 0, 10]
                  }
                );
                return resultContent;
              }),
              {
                table: {
                  headerRows: 1, // Nombre de lignes d'en-tête
                  widths: [150, '*'], // Largeurs des colonnes : la première est fixe, la deuxième est flexible
                  body: [
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxHt != null ?  this.decMntGlobal.decTravauxHt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize:11
                              }, isArabic('مجموع مبالغ الأشغال دون إحتساب الأداءات : ') ? reverseArabicText('مجموع مبالغ الأشغال دون إحتساب الأداءات : ') : ('مجموع مبالغ الأشغال دون إحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: '0.000', bold: false
                              },
                              {
                                text: '  : Fodec', bold: true
                              }
                            ],
                            fontSize: 11,
                          }
                        ],
                        fontSize: 10,
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxRemise != null ? this.decMntGlobal.decTravauxRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false,fontSize:11
                              }, isArabic('مبلغ التخفيض : ') ? reverseArabicText('مبلغ التخفيض : ') : ('مبلغ التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxHtApresRemise != null ? this.decMntGlobal.decTravauxHtApresRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")  : "0.000", bold: false,fontSize:11
                              }, isArabic('مجموع مبالغ الأشغال دون إحتساب الأداءات باعتبار التخفيض : ') ? reverseArabicText('مجموع مبالغ الأشغال دون إحتساب الأداءات باعتبار التخفيض : ') : ('مجموع مبالغ الأشغال دون إحتساب الأداءات باعتبار التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxTva != null ? this.decMntGlobal.decTravauxTva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false,fontSize:11
                              }, isArabic('مجموع الأداءات : ') ? reverseArabicText('مجموع الأداءات : ') : ('مجموع الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxTtc != null ? this.decMntGlobal.decTravauxTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false,fontSize:11
                              }, isArabic(' مجموع الأشغال باحتساب الأداءات : ') ? reverseArabicText(' مجموع الأشغال باحتساب الأداءات : ') : (' مجموع الأشغال باحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                  ]
                },
                layout: 'noBorders',
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                margin: [-30, 0, 0, 0]
               },
              {
                text: '', pageBreak: 'after'
              },
              ...lotJson.map((lot, i) => {
                const approsForLot = allAppros[lot.idLot] || [];
                const ApproHtParLot = allDecAproHtParLot[lot.idLot] || [];
                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                  | { text: any[]; pageBreak: string }
                )[] = [];
                resultContent.push({
                  text: [
                    isArabic('التزويد ') ? reverseArabicText('التزويد ') : 'التزويد '
                  ],
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  style: '',
                  margin: [0, 10, -13, -10]
                });
                resultContent.push({
                  table: {
                    headerRows: 1,
                    widths: [90, 20, 60, 20, 60, 210, 40],
                    body: [
                      [
                        { text: isArabic('الثمن الجملي د.ت') ? reverseArabicText('الثمن الجملي د.ت') : ('الثمن الجملي د.ت'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('تفاصيل الاثمان') ? reverseArabicText('تفاصيل الاثمان') : ('تفاصيل الاثمان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3', colSpan: 4 },
                        '', '', '',
                        { text: isArabic('البيان') ? reverseArabicText('البيان') : ('البيان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('رمز العنصر') ? reverseArabicText('رمز العنصر') : 'رمز العنصر', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                      ],

                      [
                        { text: '', fillColor: '#D3D3D3' },
                        { text: isArabic('ا ق م') ? reverseArabicText('ا ق م') : ('ا ق م'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الثمن الفردي د.ت') ? reverseArabicText('الثمن الفردي د.ت') : ('الثمن الفردي د.ت'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الوحدة') ? reverseArabicText('الوحدة') : 'الوحدة', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الكمية') ? reverseArabicText('الكمية') : ('الكمية'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' }
                      ],
                      [
                        { text: isArabic(lot.designation)
                          ? reverseArabicText(
                              lot.designation
                                .replace(/[()]/g, '')
                                .trim()
                                .replace(/\d+/g, match => '\u200F' + match) // 🔥 Ajout du RLM pour gérer les chiffres dans l'arabe
                            )
                          : lot.designation.replace(/[()]/g, '').trim(), fontSize: 11, font: 'Amiri', alignment: 'right', colSpan: 7, bold: true, color: 'black',noWrap: true, direction: isArabic(lot.designation) ? 'rtl' : 'ltr'  },
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 2
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 3
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 4
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 5
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6

                      ],

                      ...approsForLot.map(approData => {
                        return [
                          {
                            text: (approData?.aprMntHt != null ? (+approData.aprMntHt).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'),
                            fontSize: 9, font: 'Amiri', alignment: 'center'
                          },
                          {
                            text: approData?.tva ?? 'N/A',
                            fontSize: 9, font: 'Amiri', alignment: 'center'
                          },
                          {
                            text: (approData?.prixUnitaire != null ? (+approData.prixUnitaire).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'),
                            fontSize: 9, font: 'Amiri', alignment: 'center'
                          },
                          {
                            text: approData?.libUnite ?? 'N/A',
                            fontSize: 8, font: 'Amiri', alignment: 'center'
                          },
                          {
                            text: (approData?.quantite != null ? (+approData.quantite).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'),
                            fontSize: 9, font: 'Amiri', alignment: 'center'
                          },
                          {
                            text: truncateTextFrench(approData?.designationFr, 50) || 'N/A',
                            fontSize: 9.7, font: 'Amiri', alignment: 'center'
                          },
                          {
                            text: approData?.codeArticle ?? 'N/A',
                            fontSize: 9, font: 'Amiri', alignment: 'center'
                          }

                        ];
                      }),
                      ...ApproHtParLot
                        .map((total, index) => {
                          return [
                            {
                              text: (total != null ? (+total).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'),
                              fontSize: 9,
                              font: 'Amiri',
                              alignment: 'center',
                              fillColor: '#D3D3D3'
                            },
                            { text: '', fontSize: 7, font: 'Amiri', alignment: 'center', colSpan: 5 },  // Cette cellule couvre 6 colonnes vides
                            '', '', '', '', // Ajoutez les cellules vides restantes pour maintenir la structure du tableau
                            { text: isArabic('المجموع') ? reverseArabicText('المجموع') : ('المجموع'), fontSize: 7, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' }
                          ]
                        })

                    ]
                  },
                  layout: 'Borders',
                  margin: [-26, 10, 0, 10]
                })
                return resultContent;
              }),
              ...lotJson.map((lot, i) => {
                const decapproHtParLot = allDecAproHtParLot[lot.idLot] || [];
                const decapproHtParLotTva = allDecAproHtParLotTva[lot.idLot] || [];
                const decapproTvaParLot = allDecApproTvaParLot[lot.idLot] || [];
                const decapproTTcParLot = allDecApproTTcParLot[lot.idLot] || [];

                const getFormattedValue = (valueArray) => {
                  return valueArray.length > 0 ? valueArray[0].toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000";
                };
                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                )[] = [];
                resultContent.push(
                  {
                    text: [
                      {
                        text: isArabic(lot.designation)
                          ? reverseArabicText(
                              lot.designation
                                .replace(/[()]/g, '')
                                .trim()
                                .replace(/\d+/g, match => '\u200F' + match) // Ajout de RLM pour bien positionner les chiffres
                            )
                          : lot.designation.replace(/[()]/g, '').trim(),
                        fontSize: 13,
                        color: 'black',
                        bold: true,
                        noWrap: true // 🔥 Empêche le retour à la ligne
                      }
                    ],
                    font: 'Amiri',
                    alignment: 'right',
                    direction: isArabic(lot.designation) ? 'rtl' : 'ltr', // 🔥 Direction dynamique
                    bold: true,
                    style: 'sectionHeader',
                    margin: [0, 10, -8, -10]
                  },
                  {
                    table: {
                      headerRows: 1, // Nombre de lignes d'en-tête
                      widths: [150, '*'], // Largeurs des colonnes : la première est fixe, la deuxième est flexible
                      body: [
                        [
                          {
                            text: isArabic('مجموع التزويدات دون إحتساب الأداءات:') ? reverseArabicText('مجموع التزويدات دون إحتساب الأداءات:') : 'مجموع التزويدات دون إحتساب الأداءات:',
                            fontSize: 9, font: isArabic('مجموع التزويدات دون إحتساب الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع التزويدات دون إحتساب الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(decapproHtParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع الأداءات:') ? reverseArabicText('مجموع الأداءات:') : 'مجموع الأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(decapproTvaParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع التزويدات باحتساب لاأداءات:') ? reverseArabicText('مجموع التزويدات باحتساب لاأداءات:') : ('مجموع التزويدات باحتساب لاأداءات:'),
                            fontSize: 9, font: isArabic('مجموع التزويدات باحتساب لاأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع التزويدات باحتساب لاأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(decapproTTcParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ]
                      ]
                    },
                    layout: 'noBorders', // Spécifiez un layout (par exemple, 'noBorders' pour un tableau sans bordures)
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                    margin: [-10, 10, 0, 10]
                  }
                );
                return resultContent;
              }),
              {
                table: {
                  headerRows: 1,
                  widths: [150, '*'],
                  body: [
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproHt != null ? this.decMntGlobal.decAproHt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize:11
                              }, isArabic('مجموع مبالغ التزويدات دون إحتساب الأداءات : ') ? reverseArabicText('مجموع مبالغ التزويدات دون إحتساب الأداءات : ') : ('مجموع مبالغ التزويدات دون إحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproRemise != null ? this.decMntGlobal.decAproRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize:11
                              }, isArabic('مبلغ التخفيض : ') ? reverseArabicText('مبلغ التخفيض : ') : ('مبلغ التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproHtApresRemise != null ? this.decMntGlobal.decAproHtApresRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize:11
                              }, isArabic('مجموع مبالغ التزويدات دون إحتساب الأداءات باعتبار التخفيض : ') ? reverseArabicText('مجموع مبالغ التزويدات دون إحتساب الأداءات باعتبار التخفيض : ') : ('مجموع مبالغ التزويدات دون إحتساب الأداءات باعتبار التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproTva != null ? this.decMntGlobal.decAproTva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize:11
                              }, isArabic('مجموع الأداءات : ') ? reverseArabicText('مجموع الأداءات : ') : ('مجموع الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproTtc != null ? this.decMntGlobal.decAproTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize:11
                              }, isArabic(' مجموع التزويدات باحتساب الأداءات : ') ? reverseArabicText(' مجموع التزويدات باحتساب الأداءات : ') : (' مجموع التزويدات باحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decApro != null ? this.decMntGlobal.decApro.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")  : "0.000", bold: false, fontSize:11
                              }, isArabic('مبلغ التزويدات %80 : ') ? reverseArabicText('مبلغ التزويدات %80 : ') : ('مبلغ التزويدات %80 : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                  ]
                },
                layout: 'noBorders',
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                margin: [-30, 0, 0, 0]
              },
              {
                text: '', pageBreak: 'after'
              },
              {
                table: {
                  headerRows: 2,
                  widths: [79, 79, 79, 79, 79, 130],
                  body: [
                    [
                      {
                        text: isArabic('الباقي المطلوب دفعه') ? reverseArabicText('الباقي المطلوب دفعه') : 'الباقي المطلوب دفعه',
                        fontSize: 7,
                        font: isArabic('الباقي المطلوب دفعه') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('الباقي المطلوب دفعه') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                        colSpan: 2
                      },
                      {},
                      {
                        text: isArabic('الحجز بعنوان الضمان') ? reverseArabicText('الحجز بعنوان الضمان') : 'الحجز بعنوان الضمان',
                        fontSize: 7,
                        font: isArabic('الحجز بعنوان الضمان') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('الحجز بعنوان الضمان') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('المصاريف المقدمة') ? reverseArabicText('المصاريف المقدمة') : 'المصاريف المقدمة',
                        fontSize: 7,
                        font: isArabic('المصاريف المقدمة') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('المصاريف المقدمة') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                        colSpan: 2
                      },
                      {},
                      {
                        text: isArabic('حوصلة الكشف') ? reverseArabicText('حوصلة الكشف') : ('حوصلة الكشف'),
                        fontSize: 7,
                        font: isArabic('حوصلة الكشف') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('حوصلة الكشف') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                    ],
                    [
                      {
                        text: isArabic('غير خاضعة') ? reverseArabicText('غير خاضعة') : 'غير خاضعة',
                        fontSize: 7,
                        font: isArabic('غير خاضعة') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('غير خاضعة') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('خاضعة للضرائب') ? reverseArabicText('خاضعة للضرائب') : 'خاضعة للضرائب',
                        fontSize: 7,
                        font: isArabic('خاضعة للضرائب') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('خاضعة للضرائب') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: '',
                        fontSize: 7,
                        font: '',
                        alignment: 'center',
                        direction: '',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('غير خاضعة') ? reverseArabicText('غير خاضعة') : 'غير خاضعة',
                        fontSize: 7,
                        font: isArabic('غير خاضعة') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('غير خاضعة') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('خاضعة للضرائب') ? reverseArabicText('خاضعة للضرائب') : 'خاضعة للضرائب',
                        fontSize: 7,
                        font: isArabic('خاضعة للضرائب') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('خاضعة للضرائب') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: '',
                        fontSize: 7,
                        font: '',
                        alignment: 'center',
                        direction: '',
                        fillColor: '#D3D3D3',
                      },
                    ],
                    //ligne 1
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('جملة مصاريف الأشهر الفارطة'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 2 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مصاريف الشهر'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 3 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('الأشغال غير المنجزة'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 4 
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: formatNombre(this.decMntGlobal.decTravauxNetAvantRtn),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.afficheCb || '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: formatNombre(this.decMntGlobal.decTravauxTtc),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مجموع الاشغال باحتساب كل الاداءات'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 5
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: formatNombre(this.decMntGlobal.decApro),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.0000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: formatNombre(this.decMntGlobal.decApro),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' من مجموع التزويدات باحتساب كل الاداءات ') + '80%',
                        fontSize: 7.1,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 6 
                    [
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مبلغ مراجعة الأثمان'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 7 
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: formatNombre(this.decMntGlobal.decTravauxNetAvantRtn),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.afficheCb || '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: formatNombre(this.decMntGlobal.decTravauxNetAvantRtn),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المجموع'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 8 
                    [
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مبلغ التسبقة'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 9 
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: formatNombre(this.decMntGlobal.decTravauxNetAvantRtn),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.afficheCb || '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: formatNombre(this.decMntGlobal.decTravauxNetAvantRtn),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المجموع'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 10 
                    [
                      {
                        text: formatNombre(this.decMntGlobal.decTravauxNetAvantRtn),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                        rowSpan: 9,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المجموع العام'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 11
                    [
                      {
                        text: formatNombre(globalDecTravauxNetAvantRtnPrecedent),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المصاريف السابقة و الواجب خصمها'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 12
                    [
                      {
                        text: formatNombre(this.decMntGlobal.decImposable),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('الباقي المطلوب دفعه'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 13
                    [
                      {
                        text: formatNombre(this.decMntGlobal.decRtva),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' مبلغ الخصم على أ ق م  %' + pctRetTva),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 14 
                    [
                      {
                        text: formatNombre(this.decMntGlobal.decIr),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' مبلغ الخصم على الدخل %' + pctRetIr),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 15
                    [
                      {
                        text: formatNombre(this.decMntGlobal.decPenalite),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('خصومات مختلفة'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 16
                    [
                      {
                        text: formatNombre(this.decMntGlobal.decFraisEnrg),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('معلوم التسجيل'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 17
                    [
                      {
                        text: formatNombre(this.decMntGlobal.decAutreMnt),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مصاريف اخرى '),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 18
                    [
                      {
                        text: formatNombre(this.decMntGlobal.decImposableNetApresRtn),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مبلغ الحساب الوقتي المطلوب دفعه'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ]
                  ]
                },
                margin: [-35, 30, 0, 10]
              },
              {
                table: {
                  headerRows: 1,
                  widths: ['*', '*'],
                  body: [
                    [
                      {
                        text: reverseArabicText(' أعد هذا الكشف و سجل بالدفتر اليومي'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 8,
                        margin: [70, 0, 0, -6]
                      },
                      {
                        text: reverseArabicText('إطلع عليه و تثبت من صحته'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 8,
                        margin: [150, 0, 0, -3]
                      },

                    ],
                    [
                      {
                        text: reverseArabicText(' تحت عدد...........................................................من قبل الممضي'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' ليرفق بشهادة الدفع عدد .....................بتاريخ...........................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [70, 0, -150, 0]
                      },

                    ],
                    [
                      {
                        text: reverseArabicText(' أسفله..................................................................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' ب......................................في......................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [70, 0, -150, -6]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText('ب.......................................في............................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [3, 0, 0, 0]
                      },
                      {
                        text: reverseArabicText('المسؤول'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        alignment: 'right',
                        margin: [70, 0, -20, 0]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText(' الإمضاء'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [100, 0, 0, 0]
                      },
                      {
                        text: reverseArabicText(''),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        alignment: 'right',
                        margin: [70, 0, -20, 0]
                      }
                    ],
                  ]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 30]
              },
              {
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: reverseArabicText('وافق عليه صاحب الخدمة'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 10,
                        margin: [420, -20, 0, -8]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText('الإمضاء'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [447, -5, -150, 0]
                      },
                    ],
                  ]
                },
                layout: 'noBorders',
              },
            ]
          };
          pdfMake.createPdf(docDefinition).open();
        } catch (error) {
          console.error('Erreur lors de l\'appel de l\'API des lots:', error);
        }
      }
    }

    return resultJson;
  }

  async generateNetDernDecompte() {
    console.log(this.typeDecompte)

    let resultJson: any[] = [];
    let allDecTravauxHtParLot: { [key: string]: number[] } = {};
    let allDecAproHtParLot: { [key: string]: number[] } = {};
    let allDecTravauxHtParLotTva: { [key: string]: number[] } = {};
    let allDecAproHtParLotTva: { [key: string]: number[] } = {};
    let allDecTravauxTvaParLot: { [key: string]: number[] } = {};
    let allDecApproTvaParLot: { [key: string]: number[] } = {};
    let allDecTravauxTTcParLot: { [key: string]: number[] } = {};
    let allDecApproTTcParLot: { [key: string]: number[] } = {};
    let globalDecTravauxNetAvantRtnPrecedent: any;





    let allTravaux: { [key: string]: any[] } = {};
    let allAppros: { [key: string]: any[] } = {};

    for (const [index, decompte] of this.decPdf.entries()) {
      const selectedData = this.decomptes.at(index).get('selected')?.value;

      if (selectedData) {
        const numDecompteSelect = selectedData.numDecompte;
        const numPieceFournSelect = selectedData.numPieceFourn;
        const designationMarche = decompte.mrcEtape.numMarche.designation;
        const dateMarche = decompte.mrcEtape.numMarche.dateMarche;
        const exercice = decompte.mrcEtape.numMarche.exercice;
        const datePiece = new Date(decompte.datePiece);
        const formattedDate = datePiece.toISOString().split('T')[0];
        const fournisseurArb = decompte.mrcEtape.numMarche.idFourn?.designation;
        const fournisseurFranc = decompte.mrcEtape.numMarche.idFourn?.designationFr;
        const numFournisseur = decompte.mrcEtape.numMarche.idFourn?.numFourn;
        const mntMarcheApresAvnt = decompte.mrcEtape.numMarche.mntMrcApresAvenant;
        const Banque = decompte.mrcEtape.numMarche.numBanque?.designation;
        const Rib = decompte.mrcEtape.numMarche.rib;
        const pctRetIr = decompte.pctRetIr;
        const pctRetTva = decompte.pctRetTva;
        try {
          const lots = await this.mrcLotsService.getMrcLotsForMarche(this.numMarche).toPromise();

          if (!lots || lots.length === 0) {
            console.error('Aucun lot trouvé.');
            continue;
          }

          this.lotDesignations = lots.map(lot => `${lot.idPrmLot.designation} ${lot.idPrmLot.idLot}`);
          const formattedLots = this.lotDesignations.join(' / ');
          this.lotIds = lots.map(lot => `${lot.idPrmLot.idLot}`);

          const lotJson = this.lotIds.map((lot, index) => ({
            idLot: lot,
            designation: this.lotDesignations[index],
          }));




          const lotPromises = lotJson.map((lot) => {
            return new Promise<void>((resolve, reject) => {
              Promise.all([
                this.decArticleService.getDecArticlesTravauxDecompte(this.numMarche, lot.idLot, numPieceFournSelect, numDecompteSelect).toPromise(),
                this.decArticleService.getDecArticlesApproDecompte(this.numMarche, lot.idLot, numPieceFournSelect, numDecompteSelect).toPromise(),
                this.decLotService.getDecLot(this.numMarche, numPieceFournSelect, lot.idLot).toPromise(),
                this.decMntService.getDecTravauxNetAvantRtnPrecedent(this.numMarche, numPieceFournSelect).toPromise()
              ])
                .then(([travaux, appro, decLot, decTravauxNetAvantRtnPrecedent]) => {
                  const decTravauxHtParLot = decLot[0]?.decTravauxHtParLot;
                  const decAproHtParLot = decLot[0]?.decAproHtParLot;
                  const decTravauxHtParLotTva = decLot[0]?.decTravauxHtParLotTva;
                  const decAproHtParLotTva = decLot[0]?.decAproHtParLotTva;
                  const decTravauxTvaParLot = decLot[0]?.decTravauxTvaParLot;
                  const decApproTvaParLot = decLot[0]?.decAproTvaParLot;
                  const decTravauxTTcParLot = decLot[0]?.decTravauxTtcParLot;
                  const decApproTTcParLot = decLot[0]?.decAproTtcParLot;
                  console.log('Valeur de decTravauxNetAvantRtnPrecedent pour le lot', lot.idLot, decTravauxNetAvantRtnPrecedent);
                  globalDecTravauxNetAvantRtnPrecedent = decTravauxNetAvantRtnPrecedent;


                  if (!allTravaux[lot.idLot]) {
                    allTravaux[lot.idLot] = [];
                  }
                  allTravaux[lot.idLot] = [...travaux!];

                  if (!allAppros[lot.idLot]) {
                    allAppros[lot.idLot] = [];
                  }
                  allAppros[lot.idLot] = [...appro!];

                  //----------------------------//
                  if (!allDecTravauxHtParLot[lot.idLot]) {
                    allDecTravauxHtParLot[lot.idLot] = [];
                  }
                  if (typeof decTravauxHtParLot === 'number') {
                    allDecTravauxHtParLot[lot.idLot].push(decTravauxHtParLot);
                  } else {
                    console.error(`decTravauxHtParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecAproHtParLot[lot.idLot]) {
                    allDecAproHtParLot[lot.idLot] = [];
                  }
                  if (typeof decAproHtParLot === 'number') {
                    allDecAproHtParLot[lot.idLot].push(decAproHtParLot);
                  } else {
                    console.error(`decAproHtParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }
                  //----------------------------//
                  if (!allDecTravauxHtParLotTva[lot.idLot]) {
                    allDecTravauxHtParLotTva[lot.idLot] = [];
                  }
                  if (typeof decTravauxHtParLotTva === 'number') {
                    allDecTravauxHtParLotTva[lot.idLot].push(decTravauxHtParLotTva);
                  } else {
                    console.error(`decTravauxHtParLotTva pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecAproHtParLotTva[lot.idLot]) {
                    allDecAproHtParLotTva[lot.idLot] = [];
                  }
                  if (typeof decAproHtParLotTva === 'number') {
                    allDecAproHtParLotTva[lot.idLot].push(decAproHtParLotTva);
                  } else {
                    console.error(`decAproHtParLotTva pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }
                  //----------------------------//
                  if (!allDecTravauxTvaParLot[lot.idLot]) {
                    allDecTravauxTvaParLot[lot.idLot] = [];
                  }
                  if (typeof decTravauxTvaParLot === 'number') {
                    allDecTravauxTvaParLot[lot.idLot].push(decTravauxTvaParLot);
                  } else {
                    console.error(`decTravauxTvaParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecApproTvaParLot[lot.idLot]) {
                    allDecApproTvaParLot[lot.idLot] = [];
                  }
                  if (typeof decApproTvaParLot === 'number') {
                    allDecApproTvaParLot[lot.idLot].push(decApproTvaParLot);
                  } else {
                    console.error(`decApproTvaParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }
                  //----------------------------//
                  if (!allDecTravauxTTcParLot[lot.idLot]) {
                    allDecTravauxTTcParLot[lot.idLot] = [];
                  }
                  if (typeof decTravauxTTcParLot === 'number') {
                    allDecTravauxTTcParLot[lot.idLot].push(decTravauxTTcParLot);
                  } else {
                    console.error(`decTravauxTTcParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }

                  if (!allDecApproTTcParLot[lot.idLot]) {
                    allDecApproTTcParLot[lot.idLot] = [];
                  }
                  if (typeof decApproTTcParLot === 'number') {
                    allDecApproTTcParLot[lot.idLot].push(decApproTTcParLot);
                  } else {
                    console.error(`decApproTTcParLot pour le lot ${lot.idLot} n'est pas un nombre valide`);
                  }


                  //----------------------------//
                  resolve();
                })
                .catch((error) => {
                  console.error(`Erreur lors des appels pour le lot ${lot.idLot}:`, error);
                  reject(error);
                });
            });
          });

          await Promise.all(lotPromises);

          console.log('Tous les travaux regroupés:', allTravaux);
          console.log('Tous les approvisionnements regroupés:', allAppros);
          console.log('Tous les travaux HT regroupés:', allDecTravauxHtParLot);
          console.log('Tous les approvisionnements HT regroupés:', allDecAproHtParLot);
          console.log('Valeur de decTravauxNetAvantRtnPrecedent stockée globalement:', globalDecTravauxNetAvantRtnPrecedent);

          try {
            const decMntPromise = this.decMntService.getDecMnt(this.numMarche, numPieceFournSelect).toPromise();
            const results = await Promise.all([decMntPromise]);
            const decMnt = results[0];

            if (!decMnt || decMnt.length === 0) {
              console.log('Aucun résultat trouvé pour DecMnt.');
              this.decMntGlobal = [];
            } else {
              console.log('Résultat de DecMnt:', decMnt);
              this.decMntGlobal = decMnt;
            }
          } catch (error) {
            console.error('Erreur lors de l\'appel de getDecMnt:', error);
          }

          const docDefinition: any = {
            pageSize: 'A4',
            header: function () {
              return {
                pageMargins: [15, 15, 15, 30],
                stack: [
                  {
                    columns: [
                      {
                        text: "",
                        fontSize: 7,
                        font: 'Roboto',
                        alignment: 'left',
                        direction: 'ltr',
                        margin: [0, 0, 0, 0]
                      },
                      {
                        text: isArabic('الجمهورية التونسية') ? reverseArabicText('الجمهورية التونسية') : 'الجمهورية التونسية',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: isArabic('الملحقة بالأمر بالصرف عدد .....................') ? reverseArabicText('الملحقة بالأمر بالصرف عدد .....................') : ('الملحقة بالأمر بالصرف عدد .....................'),
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'left',
                        direction: 'rtl',
                        margin: [20, 0, 0, 0]
                      },
                      {
                        text: isArabic('وزارة التجهيز و الإسكان') ? reverseArabicText('وزارة التجهيز و الإسكان') : 'وزارة التجهيز و الإسكان',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  },
                  {
                    columns: [
                      {
                        text: "",
                        fontSize: 7,
                        font: 'Roboto',
                        alignment: 'left',
                        direction: 'ltr',
                        margin: [0, 0, 0, 0]
                      },
                      {
                        text: isArabic('الوكالة العقارية للسكنى') ? reverseArabicText('الوكالة العقارية للسكنى') : 'الوكالة العقارية للسكنى',
                        fontSize: 7,
                        font: 'Amiri',
                        alignment: 'right',
                        direction: 'rtl',
                        margin: [0, 0, 10, 0]
                      }
                    ]
                  }
                ]
              };
            },
            footer: function (currentPage, pageCount) {
              var currentDate = new Date();
              var dateString = currentDate.toLocaleDateString('ar-IT');
              return {
                table: {
                  headerRows: 1,
                  widths: ['*', '*', '*'],
                  body: [
                    [
                      { text: isArabic(`تاريخ الطباعة: ${dateString}`) ? reverseArabicText(`تاريخ الطباعة: ${dateString}`) : `تاريخ الطباعة: ${dateString}`, fontSize: 9, font: 'Amiri', alignment: 'left', direction: 'ltr', bold: false, border: [false, true, false, false] },
                      { text: isArabic(`الصفحة ${currentPage} / ${pageCount}`) ? reverseArabicText(`الصفحة ${currentPage} / ${pageCount}`) : `الصفحة ${currentPage} / ${pageCount}`, fontSize: 9, font: 'Amiri', alignment: 'center', direction: 'ltr', bold: false, border: [false, true, false, false] },
                      { text: isArabic('منظومة التصرف في الصفقات') ? reverseArabicText('منظومة التصرف في الصفقات') : 'منظومة التصرف في الصفقات', fontSize: 9, font: 'Amiri', alignment: 'right', direction: 'ltr', bold: false, border: [false, true, false, false] }
                    ]
                  ]
                },
                layout: 'Borders',
                margin: [40, 15, 40, 0]
              };
            },
            styles: {
              sectionHeader: {
                bold: true,
                decoration: 'underline',
                fontSize: 14,
                margin: [0, 15, 0, 15],
              }
            },
            content: [
              {
                text: reverseArabicText(' و الأخير ') + numDecompteSelect + reverseArabicText(' كشف حساب وقتي عدد '),
                fontSize: 13,
                bold: true,
                alignment: 'center',
                font: isArabic(' كشف حساب وقتي عدد ') ? 'Amiri' : 'Roboto',
                direction: isArabic(' كشف حساب وقتي عدد ') ? 'rtl' : 'ltr',
                margin: [0, 0, 0, 0]
              },
              {
                text: isArabic('للاشغال المنجزة و النفقات المقدمة') ? reverseArabicText('للاشغال المنجزة و النفقات المقدمة') : ('للاشغال المنجزة و النفقات المقدمة'),
                fontSize: 12,
                bold: true,
                alignment: 'center',
                font: isArabic('للاشغال المنجزة و النفقات المقدمة') ? 'Amiri' : 'Roboto',
                direction: isArabic('للاشغال المنجزة و النفقات المقدمة') ? 'rtl' : 'ltr',
                margin: [0, 0, 0, 5]
              },
              {
                text: isArabic('الى غاية تاريخ') ? reverseArabicText('الى غاية تاريخ') : ('الى غاية تاريخ'),
                fontSize: 12,
                bold: true,
                alignment: 'center',
                font: isArabic('الى غاية تاريخ') ? 'Amiri' : 'Roboto',
                direction: isArabic('الى غاية تاريخ') ? 'rtl' : 'ltr',
                margin: [80, 0, 0, -17]
              },
              {
                text: formattedDate || 'N/A',
                fontSize: 11,
                font: 'Roboto',
                bold: true,
                alignment: 'center',
                color: 'black',
                margin: [-71, 0, 0, 30]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: exercice || 'N/A', bold: false
                      }, isArabic('السنة المالية : ') ? reverseArabicText('السنة المالية : ') : ('السنة المالية : '),
                    ]
                  }
                ],
                fontSize: 12,
                font: 'Amiri',
                bold: true,
                color: 'black',
                alignment: 'right',
                direction: 'rtl',
                margin: [0, 15, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: mntMarcheApresAvnt || "0.000", bold: false
                      },
                      isArabic('مبلغ الصفقة باعتبار الملاحق  : ') ? reverseArabicText('مبلغ الصفقة باعتبار الملاحق  : ') : ('مبلغ الصفقة باعتبار الملاحق  : '),
                    ],
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                margin: [0, -10, 0, 13]
              }
              ,
              {
                text: [
                  {
                    text: [
                      {
                        text:
                          isArabic(designationMarche) ? reverseArabicText(designationMarche.length > 60 ? designationMarche.slice(0, 100) + "..." : designationMarche.slice(0, 100)) :
                            isFrench(designationMarche) ? reverseFrenchText(designationMarche.length > 60 ? designationMarche.slice(0, 80) + "..." : designationMarche.slice(0, 80) + "...") :
                              designationMarche.length > 60 ? designationMarche.slice(0, 80) + "..." : designationMarche.slice(0, 80) + "...",
                        fontSize: 9,
                        font: isArabic(designationMarche) ? 'Amiri' : 'Roboto',
                        direction: isArabic(designationMarche) ? 'rtl' : (isFrench(designationMarche) ? 'ltr' : 'ltr'),
                        alignment: 'right',
                        bold: false
                      },
                      isArabic('موضوع الصفقة  : ') ? reverseArabicText('موضوع الصفقة  : ') : ('موضوع الصفقة  : '),
                    ],
                    fontSize: 10,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: truncateText(reverseText(formattedLots), 120) || 'N/A',
                        fontSize: 9,
                        font: 'Amiri',
                        bold: true,
                        alignment: 'right',
                        direction: 'rtl',
                        color: 'black',
                        noWrap: true,
                      }, isArabic('التقاسيم : ') ? reverseArabicText('التقاسيم  : ') : 'التقاسيم  : ',
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                    color: 'black',
                    bold: true,
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                margin: [0, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: numFournisseur + "    " || 'N/A',
                        fontSize: 9,
                        font: 'Roboto',
                        alignment: 'right',
                        direction: 'ltr',
                        bold: false,
                      }, isArabic(' المعرف الجبائى : ') ? reverseArabicText(' المعرف الجبائى : ') : (' المعرف الجبائى : '),
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                color: 'black',
                bold: true,
                margin: [20, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: isArabic(fournisseurArb)
                          ? reverseArabicText(fournisseurArb)
                          : isFrench(fournisseurFranc)
                            ? fournisseurFranc
                            : 'N/A',
                        fontSize: 9,
                        font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                        alignment: 'right',
                        direction: isArabic(fournisseurArb) ? 'rtl' : (isFrench(fournisseurFranc) ? 'ltr' : 'ltr'),
                        bold: false
                      }, isArabic('المقاول : ') ? reverseArabicText('المقاول : ') : ('المقاول : '),
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',

                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 13]
              },
              {
                text: [
                  {
                    text: [
                      {
                        text: dateMarche || 'N/A',
                        fontSize: 10,
                        font: 'Roboto',
                        bold: false,
                        alignment: 'right'
                      }, isArabic('الصفقة المصادق عليها بتاريخ : ') ? reverseArabicText('الصفقة المصادق عليها بتاريخ : ') : ('الصفقة المصادق عليها بتاريخ : '),
                    ],
                    fontSize: 11,
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',

                  }
                ],
                fontSize: 11,
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                bold: true,
                color: 'black',
                margin: [0, -10, 0, 13]
              },
              ...lotJson.map((lot, i) => {
                const travauxForLot = allTravaux[lot.idLot] || [];
                const TravauxHtParLot = allDecTravauxHtParLot[lot.idLot] || [];
                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                )[] = [];
                resultContent.push({
                  text: [
                    //{ text: isArabic(lot) ? reverseArabicText(lot.replace(/[()]/g, '').trim()) : lot.replace(/[()]/g, '').trim(), fontSize: 12 },
                    isArabic('الأشغال ') ? reverseArabicText('الأشغال ') : 'الأشغال '
                  ],
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  style: '',
                  margin: [0, 10, -13, -10]
                });
                resultContent.push({
                  table: {
                    headerRows: 1,
                    widths: [80, 15, 16, 50, 20, 50, 210, 40],
                    body: [
                      [
                        { text: isArabic('الثمن الجملي د.ت') ? reverseArabicText('الثمن الجملي د.ت') : ('الثمن الجملي د.ت'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('تفاصيل الاثمان') ? reverseArabicText('تفاصيل الاثمان') : ('تفاصيل الاثمان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3', colSpan: 5 },
                        '', '', '', '',
                        { text: isArabic('البيان') ? reverseArabicText('البيان') : ('البيان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('رمز العنصر') ? reverseArabicText('رمز العنصر') : 'رمز العنصر', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                      ],

                      [
                        { text: '', fillColor: '#D3D3D3' },
                        { text: '%', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('ا ق م') ? reverseArabicText('ا ق م') : ('ا ق م'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الثمن الفردي') ? reverseArabicText('الثمن الفردي') : ('الثمن الفردي'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الوحدة') ? reverseArabicText('الوحدة') : 'الوحدة', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الكمية') ? reverseArabicText('الكمية') : ('الكمية'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' }
                      ],
                      [
                        {
                          text: isArabic(lot.designation)
                            ? reverseArabicText(
                                lot.designation
                                  .replace(/[()]/g, '')
                                  .trim()
                                  .replace(/\d+/g, match => '\u200F' + match) // 🔥 Ajout du RLM pour gérer les chiffres dans l'arabe
                              )
                            : lot.designation.replace(/[()]/g, '').trim(),
                          fontSize: 11,
                          font: 'Amiri',
                          alignment: 'right',
                          colSpan: 8,
                          bold: true,
                          color: 'black',
                          noWrap: true, // 🔥 Empêche le retour à la ligne
                          direction: isArabic(lot.designation) ? 'rtl' : 'ltr' // 🔥 Gère la direction selon la langue
                        },
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 2
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 3
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 4
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 5
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6

                      ],
                      ...travauxForLot
                        .map((travail, index) => {
                          return [
                            { text: (travail?.travHtRea != null ? (+travail.travHtRea).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.pctRea != null ? travail.pctRea : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.tva != null ? travail.tva : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.prixUnitaire != null ? (+travail.prixUnitaire).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.libUnite || 'N/A'), fontSize: 8, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.quantiteRea != null ? (+travail.quantiteRea).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                            { text: (truncateTextFrench(travail?.designationFr, 50) || 'N/A'), fontSize: 9.7, font: 'Amiri', alignment: 'center' },
                            { text: (travail?.codeArticle || 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' }
                            

                          ];
                        }),
                      ...TravauxHtParLot
                        .map((total, index) => {
                          return [
                            { 
                              text: (total != null ? (+total).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), 
                              fontSize: 9, 
                              font: 'Amiri', 
                              alignment: 'center', 
                              fillColor: '#D3D3D3' 
                            }
                            ,{ text: '', fontSize: 7, font: 'Amiri', alignment: 'center', colSpan: 6 },  // Cette cellule couvre 6 colonnes vides
                            '', '', '', '', '',  // Ajoutez les cellules vides restantes pour maintenir la structure du tableau
                            { text: isArabic('المجموع') ? reverseArabicText('المجموع') : ('المجموع'), fontSize: 7, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' }
                          ]
                        })
                    ]
                  },
                  layout: 'Borders',
                  margin: [-26, 10, 0, 10]
                });
                return resultContent;
              }),
              ...lotJson.map((lot, i) => {
                const dectravauxHtParLot = allDecTravauxHtParLot[lot.idLot] || [];
                const dectravauxHtParLotTva = allDecTravauxHtParLotTva[lot.idLot] || [];
                const dectravauxTvaParLot = allDecTravauxTvaParLot[lot.idLot] || [];
                const dectravauxTTcParLot = allDecTravauxTTcParLot[lot.idLot] || [];
                const getFormattedValue = (valueArray) => {
                  return valueArray.length > 0 ? valueArray[0].toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000";
                };

                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                )[] = [];

                resultContent.push(
                  {
                    text: [
                      {
                        text: isArabic(lot.designation)
                          ? reverseArabicText(
                              lot.designation
                                .replace(/[()]/g, '')
                                .trim()
                                .replace(/\d+/g, match => '\u200F' + match) // Ajout de RLM pour bien positionner les chiffres
                            )
                          : lot.designation.replace(/[()]/g, '').trim(),
                        fontSize: 13,
                        color: 'black',
                        bold: true,
                        noWrap: true // 🔥 Empêche le retour à la ligne
                      }
                    ],
                    font: 'Amiri',
                    alignment: 'right',
                    direction: isArabic(lot.designation) ? 'rtl' : 'ltr', // 🔥 Direction dynamique
                    bold: true,
                    style: 'sectionHeader',
                    margin: [0, 10, -8, -10]
                  },
                  {
                    table: {
                      headerRows: 1, // Nombre de lignes d'en-tête
                      widths: [150, '*'], // Largeurs des colonnes : la première est fixe, la deuxième est flexible
                      body: [
                        [
                          {
                            text: isArabic('مجموع الأشغال دون إحتساب الأداءات:') ? reverseArabicText('مجموع الأشغال دون إحتساب الأداءات:') : 'مجموع الأشغال دون إحتساب الأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأشغال دون إحتساب الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأشغال دون إحتساب الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(dectravauxHtParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع الأداءات:') ? reverseArabicText('مجموع الأداءات:') : 'مجموع الأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(dectravauxTvaParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع الأشغال باحتساب لاأداءات:') ? reverseArabicText('مجموع الأشغال باحتساب لاأداءات:') : 'مجموع الأشغال باحتساب لاأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأشغال باحتساب لاأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأشغال باحتساب لاأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(dectravauxTTcParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ]
                      ]
                    },
                    layout: 'noBorders', // Spécifiez un layout (par exemple, 'noBorders' pour un tableau sans bordures)
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                    margin: [-10, 10, 0, 10]
                  }
                );
                return resultContent;
              }),
              {
                table: {
                  headerRows: 1, // Nombre de lignes d'en-tête
                  widths: [150, '*'], // Largeurs des colonnes : la première est fixe, la deuxième est flexible
                  body: [
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxHt != null ? this.decMntGlobal.decTravauxHt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")  : "0.000", bold: false, fontSize: 11
                              }, isArabic('مجموع مبالغ الأشغال دون إحتساب الأداءات : ') ? reverseArabicText('مجموع مبالغ الأشغال دون إحتساب الأداءات : ') : ('مجموع مبالغ الأشغال دون إحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: '0.000', bold: false
                              },
                              {
                                text: '  : Fodec', bold: true
                              }
                            ],
                            fontSize: 11,
                          }
                        ],
                        fontSize: 10,
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxRemise != null ? this.decMntGlobal.decTravauxRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false,fontSize: 11
                              }, isArabic('مبلغ التخفيض : ') ? reverseArabicText('مبلغ التخفيض : ') : ('مبلغ التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxHtApresRemise != null ? this.decMntGlobal.decTravauxHtApresRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize: 11
                              }, isArabic('مجموع مبالغ الأشغال دون إحتساب الأداءات باعتبار التخفيض : ') ? reverseArabicText('مجموع مبالغ الأشغال دون إحتساب الأداءات باعتبار التخفيض : ') : ('مجموع مبالغ الأشغال دون إحتساب الأداءات باعتبار التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxTva != null ? this.decMntGlobal.decTravauxTva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize: 11
                              }, isArabic('مجموع الأداءات : ') ? reverseArabicText('مجموع الأداءات : ') : ('مجموع الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decTravauxTtc != null ? this.decMntGlobal.decTravauxTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize: 11
                              }, isArabic(' مجموع الأشغال باحتساب الأداءات : ') ? reverseArabicText(' مجموع الأشغال باحتساب الأداءات : ') : (' مجموع الأشغال باحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                  ]
                },
                layout: 'noBorders',
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                margin: [-30, 0, 0, 0]
              },
              {
                text: '', pageBreak: 'after'
              },
              ...lotJson.map((lot, i) => {
                const approsForLot = allAppros[lot.idLot] || [];
                const ApproHtParLot = allDecAproHtParLot[lot.idLot] || [];
                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                  | { text: any[]; pageBreak: string }
                )[] = [];
                resultContent.push({
                  text: [
                    isArabic('التزويد ') ? reverseArabicText('التزويد ') : 'التزويد '
                  ],
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  style: '',
                  margin: [0, 10, -13, -10]
                });
                resultContent.push({
                  table: {
                    headerRows: 1,
                    widths: [90, 20, 60, 20, 60, 210, 40],
                    body: [
                      [
                        { text: isArabic('الثمن الجملي د.ت') ? reverseArabicText('الثمن الجملي د.ت') : ('الثمن الجملي د.ت'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('تفاصيل الاثمان') ? reverseArabicText('تفاصيل الاثمان') : ('تفاصيل الاثمان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3', colSpan: 4 },
                        '', '', '',
                        { text: isArabic('البيان') ? reverseArabicText('البيان') : ('البيان'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('رمز العنصر') ? reverseArabicText('رمز العنصر') : 'رمز العنصر', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                      ],

                      [
                        { text: '', fillColor: '#D3D3D3' },
                        { text: isArabic('ا ق م') ? reverseArabicText('ا ق م') : ('ا ق م'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الثمن الفردي د.ت') ? reverseArabicText('الثمن الفردي د.ت') : ('الثمن الفردي د.ت'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الوحدة') ? reverseArabicText('الوحدة') : 'الوحدة', fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: isArabic('الكمية') ? reverseArabicText('الكمية') : ('الكمية'), fontSize: 6, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' },
                        { text: '', fillColor: '#D3D3D3' }
                      ],
                      [
                        { text: isArabic(lot.designation)
                          ? reverseArabicText(
                              lot.designation
                                .replace(/[()]/g, '')
                                .trim()
                                .replace(/\d+/g, match => '\u200F' + match) // 🔥 Ajout du RLM pour gérer les chiffres dans l'arabe
                            )
                          : lot.designation.replace(/[()]/g, '').trim(), fontSize: 11, font: 'Amiri', alignment: 'right', colSpan: 7, bold: true, color: 'black',noWrap: true, direction: isArabic(lot.designation) ? 'rtl' : 'ltr'  },
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 2
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 3
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 4
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 5
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6
                        { text: '', fontSize: 7, font: 'Amiri', alignment: 'center' },  // Cellule 6

                      ],

                      ...approsForLot.map(approData => {
                        return [
                          { text: (approData?.aprMntHt != null ? (+approData.aprMntHt).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                          { text: approData?.tva || 'N/A', fontSize: 9, font: 'Amiri', alignment: 'center' },
                          { text: (approData?.prixUnitaire != null ? (+approData.prixUnitaire).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                          { text: approData?.libUnite || 'N/A', fontSize: 8, font: 'Amiri', alignment: 'center' },
                          { text: (approData?.quantite != null ? (+approData.quantite).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'), fontSize: 9, font: 'Amiri', alignment: 'center' },
                          { text: truncateTextFrench(approData?.designationFr, 50) || 'N/A', fontSize: 9.7, font: 'Amiri', alignment: 'center' },
                          { text: approData?.codeArticle || 'N/A', fontSize: 9, font: 'Amiri', alignment: 'center' }
                          
                        ];
                      }),
                      ...ApproHtParLot
                        .map((total, index) => {
                          return [
                            {
                              text: (total != null ? (+total).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A'),
                              fontSize: 9,
                              font: 'Amiri',
                              alignment: 'center',
                              fillColor: '#D3D3D3'
                            }
                             , { text: '', fontSize: 7, font: 'Amiri', alignment: 'center', colSpan: 5 },  // Cette cellule couvre 6 colonnes vides
                            '', '', '', '', // Ajoutez les cellules vides restantes pour maintenir la structure du tableau
                            { text: isArabic('المجموع') ? reverseArabicText('المجموع') : ('المجموع'), fontSize: 7, font: 'Amiri', alignment: 'center', direction: 'ltr', fillColor: '#D3D3D3' }
                          ]
                        })

                    ]
                  },
                  layout: 'Borders',
                  margin: [-26, 10, 0, 10]
                })
                return resultContent;
              }),
              ...lotJson.map((lot, i) => {
                const decapproHtParLot = allDecAproHtParLot[lot.idLot] || [];
                const decapproHtParLotTva = allDecAproHtParLotTva[lot.idLot] || [];
                const decapproTvaParLot = allDecApproTvaParLot[lot.idLot] || [];
                const decapproTTcParLot = allDecApproTTcParLot[lot.idLot] || [];

                const getFormattedValue = (valueArray) => {
                  return valueArray.length > 0 ? valueArray[0].toFixed(3) : "0.000";
                };
                const resultContent: (
                  | { text: any[]; font: string; alignment: string; direction: string; bold: boolean; style: string; margin: number[] }
                  | { table: { headerRows: number; widths: any[]; body: any[][] }; layout: string; margin: number[] }
                )[] = [];
                resultContent.push(
                  {
                    text: [
                      {
                        text: isArabic(lot.designation)
                          ? reverseArabicText(
                              lot.designation
                                .replace(/[()]/g, '')
                                .trim()
                                .replace(/\d+/g, match => '\u200F' + match) // Ajout de RLM pour bien positionner les chiffres
                            )
                          : lot.designation.replace(/[()]/g, '').trim(),
                        fontSize: 13,
                        color: 'black',
                        bold: true,
                        noWrap: true // 🔥 Empêche le retour à la ligne
                      }
                    ],
                    font: 'Amiri',
                    alignment: 'right',
                    direction: isArabic(lot.designation) ? 'rtl' : 'ltr', // 🔥 Direction dynamique
                    bold: true,
                    style: 'sectionHeader',
                    margin: [0, 10, -8, -10]
                  },
                  {
                    table: {
                      headerRows: 1, // Nombre de lignes d'en-tête
                      widths: [150, '*'], // Largeurs des colonnes : la première est fixe, la deuxième est flexible
                      body: [
                        [
                          {
                            text: isArabic('مجموع التزويدات دون إحتساب الأداءات:') ? reverseArabicText('مجموع التزويدات دون إحتساب الأداءات:') : ('مجموع التزويدات دون إحتساب الأداءات:'),
                            fontSize: 9, font: isArabic('مجموع التزويدات دون إحتساب الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع التزويدات دون إحتساب الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(decapproHtParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع الأداءات:') ? reverseArabicText('مجموع الأداءات:') : 'مجموع الأداءات:',
                            fontSize: 9, font: isArabic('مجموع الأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع الأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(decapproTvaParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ],
                        [
                          {
                            text: isArabic('مجموع التزويدات باحتساب لاأداءات:') ? reverseArabicText('مجموع التزويدات باحتساب لاأداءات:') : ('مجموع التزويدات باحتساب لاأداءات:'),
                            fontSize: 9, font: isArabic('مجموع التزويدات باحتساب لاأداءات:') ? 'Amiri' : 'Roboto', direction: isArabic('مجموع التزويدات باحتساب لاأداءات:') ? 'rtl' : 'ltr',
                            bold: true,
                            color: 'black',
                            margin: [0, 0, -380, 0]
                          },
                          {
                            text: getFormattedValue(decapproTTcParLot),
                            alignment: 'center',
                            font: 'Amiri',
                            direction: 'rtl',
                            bold: true,
                            margin: [-100, -2, 0, 0]
                          }
                        ]
                      ]
                    },
                    layout: 'noBorders', // Spécifiez un layout (par exemple, 'noBorders' pour un tableau sans bordures)
                    font: 'Amiri',
                    alignment: 'right',
                    direction: 'rtl',
                    margin: [-10, 10, 0, 10]
                  }
                );
                return resultContent;
              }),
              {
                table: {
                  headerRows: 1,
                  widths: [150, '*'],
                  body: [
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproHt != null ? this.decMntGlobal.decAproHt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize: 11
                              }, isArabic('مجموع مبالغ التزويدات دون إحتساب الأداءات : ') ? reverseArabicText('مجموع مبالغ التزويدات دون إحتساب الأداءات : ') : ('مجموع مبالغ التزويدات دون إحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text:  this.decMntGlobal.decAproRemise != null ? this.decMntGlobal.decAproRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize: 11
                              }, isArabic('مبلغ التخفيض : ') ? reverseArabicText('مبلغ التخفيض : ') : ('مبلغ التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproHtApresRemise != null ? this.decMntGlobal.decAproHtApresRemise.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize: 11
                              }, isArabic('مجموع مبالغ التزويدات دون إحتساب الأداءات باعتبار التخفيض : ') ? reverseArabicText('مجموع مبالغ التزويدات دون إحتساب الأداءات باعتبار التخفيض : ') : ('مجموع مبالغ التزويدات دون إحتساب الأداءات باعتبار التخفيض : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproTva != null ? this.decMntGlobal.decAproTva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize:11
                              }, isArabic('مجموع الأداءات : ') ? reverseArabicText('مجموع الأداءات : ') : ('مجموع الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decAproTtc != null ? this.decMntGlobal.decAproTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize:11
                              }, isArabic(' مجموع التزويدات باحتساب الأداءات : ') ? reverseArabicText(' مجموع التزويدات باحتساب الأداءات : ') : (' مجموع التزويدات باحتساب الأداءات : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                    [
                      {
                        text: [
                          {
                            text: [
                              {
                                text: this.decMntGlobal.decApro != null ? this.decMntGlobal.decApro.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize:11
                              }, isArabic('مبلغ التزويدات %80 : ') ? reverseArabicText('مبلغ التزويدات %80 : ') : ('مبلغ التزويدات %80 : '),
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            direction: 'rtl',
                          }
                        ],
                        fontSize: 10,
                        font: 'Amiri',
                        bold: true,
                        margin: [0, 0, -400, 0]
                      }
                    ],
                  ]
                },
                layout: 'noBorders',
                font: 'Amiri',
                alignment: 'right',
                direction: 'rtl',
                margin: [-30, 0, 0, 0]
              },
              {
                text: '', pageBreak: 'after'
              },
              {
                table: {
                  headerRows: 2,
                  widths: [79, 79, 79, 79, 79, 130],
                  body: [
                    [
                      {
                        text: isArabic('الباقي المطلوب دفعه') ? reverseArabicText('الباقي المطلوب دفعه') : 'الباقي المطلوب دفعه',
                        fontSize: 7,
                        font: isArabic('الباقي المطلوب دفعه') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('الباقي المطلوب دفعه') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                        colSpan: 2
                      },
                      {},
                      {
                        text: isArabic('الحجز بعنوان الضمان') ? reverseArabicText('الحجز بعنوان الضمان') : 'الحجز بعنوان الضمان',
                        fontSize: 7,
                        font: isArabic('الحجز بعنوان الضمان') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('الحجز بعنوان الضمان') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('المصاريف المقدمة') ? reverseArabicText('المصاريف المقدمة') : 'المصاريف المقدمة',
                        fontSize: 7,
                        font: isArabic('المصاريف المقدمة') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('المصاريف المقدمة') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                        colSpan: 2
                      },
                      {},
                      {
                        text: isArabic('حوصلة الكشف') ? reverseArabicText('حوصلة الكشف') : ('حوصلة الكشف'),
                        fontSize: 7,
                        font: isArabic('حوصلة الكشف') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('حوصلة الكشف') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                    ],
                    [
                      {
                        text: isArabic('غير خاضعة') ? reverseArabicText('غير خاضعة') : 'غير خاضعة',
                        fontSize: 7,
                        font: isArabic('غير خاضعة') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('غير خاضعة') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('خاضعة للضرائب') ? reverseArabicText('خاضعة للضرائب') : 'خاضعة للضرائب',
                        fontSize: 7,
                        font: isArabic('خاضعة للضرائب') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('خاضعة للضرائب') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: '',
                        fontSize: 7,
                        font: '',
                        alignment: 'center',
                        direction: '',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('غير خاضعة') ? reverseArabicText('غير خاضعة') : 'غير خاضعة',
                        fontSize: 7,
                        font: isArabic('غير خاضعة') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('غير خاضعة') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: isArabic('خاضعة للضرائب') ? reverseArabicText('خاضعة للضرائب') : 'خاضعة للضرائب',
                        fontSize: 7,
                        font: isArabic('خاضعة للضرائب') ? 'Amiri' : 'Roboto',
                        alignment: 'center',
                        direction: isArabic('خاضعة للضرائب') ? 'rtl' : 'ltr',
                        fillColor: '#D3D3D3',
                      },
                      {
                        text: '',
                        fontSize: 7,
                        font: '',
                        alignment: 'center',
                        direction: '',
                        fillColor: '#D3D3D3',
                      },
                    ],
                    //ligne 1
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('جملة مصاريف الأشهر الفارطة'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 2 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مصاريف الشهر'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 3 
                    [
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('الأشغال غير المنجزة'),
                        fontSize: 8,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 4 
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decTravauxNetAvantRtn != null ? this.decMntGlobal.decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.afficheCb || '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decTravauxTtc != null ? this.decMntGlobal.decTravauxTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مجموع الاشغال باحتساب كل الاداءات'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 5
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decApro != null ? this.decMntGlobal.decApro.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.0000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decApro != null ? this.decMntGlobal.decApro.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' من مجموع التزويدات باحتساب كل الاداءات ') + '80%',
                        fontSize: 7.1,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 6 
                    [
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مبلغ مراجعة الأثمان'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 7 
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decTravauxNetAvantRtn != null ? this.decMntGlobal.decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")  : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.afficheCb || '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decTravauxNetAvantRtn != null ? this.decMntGlobal.decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المجموع'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 8 
                    [
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decAvPay != null ? this.decMntGlobal.decAvPay.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.decRetAv != null ? this.decMntGlobal.decRetAv.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decAvance != null ? this.decMntGlobal.decAvance.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") :'0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مبلغ التسبقة'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 9 
                    [
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decTravauxNetAvantRtn != null ? this.decMntGlobal.decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: this.decMntGlobal.decRetTt != null ? this.decMntGlobal.decRetTt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      }
                      ,
                      {
                        text: '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: this.decMntGlobal.decDepTt != null ? this.decMntGlobal.decDepTt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المجموع'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 10 
                    [
                      {
                        text: this.decMntGlobal.decTravauxNetAvantRtn != null ? this.decMntGlobal.decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                        rowSpan: 9,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المجموع العام'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 11
                    [
                      {
                        text: globalDecTravauxNetAvantRtnPrecedent != null ? globalDecTravauxNetAvantRtnPrecedent.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('المصاريف السابقة و الواجب خصمها'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 12
                    [
                      {
                        text: this.decMntGlobal.decImposable != null ? this.decMntGlobal.decImposable.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.000',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('الباقي المطلوب دفعه'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 13
                    [
                      {
                        text: this.decMntGlobal.decRtva != null ? this.decMntGlobal.decRtva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' مبلغ الخصم على أ ق م  %' + pctRetTva),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 14 
                    [
                      {
                        text: this.decMntGlobal.decIr != null ? this.decMntGlobal.decIr.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' مبلغ الخصم على الدخل %' + pctRetIr),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 15
                    [
                      {
                        text: this.decMntGlobal.decPenalite != null ? this.decMntGlobal.decPenalite.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('خصومات مختلفة'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 16
                    [
                      {
                        text: this.decMntGlobal.decFraisEnrg != null ? this.decMntGlobal.decFraisEnrg.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('معلوم التسجيل'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 17
                    [
                      {
                        text: this.decMntGlobal.decAutreMnt != null ? this.decMntGlobal.decAutreMnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مصاريف اخرى '),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ],
                    //ligne 18
                    [
                      {
                        text: this.decMntGlobal.decImposableNetApresRtn != null ? this.decMntGlobal.decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")  : "0.000",
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                        colSpan: 4,
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: '',
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'center',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText('مبلغ الحساب الوقتي المطلوب دفعه'),
                        fontSize: 8.5,
                        font: 'Amiri',
                        alignment: 'right',
                      }
                    ]
                  ]
                },
                margin: [-35, 30, 0, 10]
              },
              {
                table: {
                  headerRows: 1,
                  widths: ['*', '*'],
                  body: [
                    [
                      {
                        text: reverseArabicText(' أعد هذا الكشف و سجل بالدفتر اليومي'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 8,
                        margin: [70, 0, 0, -6]
                      },
                      {
                        text: reverseArabicText('إطلع عليه و تثبت من صحته'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 8,
                        margin: [150, 0, 0, -3]
                      },

                    ],
                    [
                      {
                        text: reverseArabicText(' تحت عدد...........................................................من قبل الممضي'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' ليرفق بشهادة الدفع عدد .....................بتاريخ...........................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [70, 0, -150, 0]
                      },

                    ],
                    [
                      {
                        text: reverseArabicText(' أسفله..................................................................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                      },
                      {
                        text: reverseArabicText(' ب......................................في......................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [70, 0, -150, -6]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText('ب.......................................في............................................'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [3, 0, 0, 0]
                      },
                      {
                        text: reverseArabicText('المسؤول'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        alignment: 'right',
                        margin: [70, 0, -20, 0]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText(' الإمضاء'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [100, 0, 0, 0]
                      },
                      {
                        text: reverseArabicText(''),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        alignment: 'right',
                        margin: [70, 0, -20, 0]
                      }
                    ],
                  ]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 30]
              },
              {
                table: {
                  headerRows: 1,
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: reverseArabicText('وافق عليه صاحب الخدمة'),
                        font: 'Amiri',
                        direction: 'rtl',
                        fontSize: 10,
                        margin: [420, -20, 0, -8]
                      }
                    ],
                    [
                      {
                        text: reverseArabicText('الإمضاء'),
                        fontSize: 8,
                        font: 'Amiri',
                        direction: 'rtl',
                        margin: [447, -5, -150, 0]
                      },
                    ],
                  ]
                },
                layout: 'noBorders',
              },
            ]
          };
          pdfMake.createPdf(docDefinition).open();
        } catch (error) {
          console.error('Erreur lors de l\'appel de l\'API des lots:', error);
        }
      }
    }

    return resultJson;
  }

  async generateProcesVerbaux (){
    this.decPdf.forEach((decompte: any, index: number) => {
      console.log(decompte);

      const numMarche = decompte.mrcEtape.numMarche.id;
      const designationMarche = decompte.mrcEtape.numMarche.designation;
      const dateMarche = decompte.mrcEtape.numMarche.dateMarche;
      const exercice = decompte.mrcEtape.numMarche.exercice;
      const selectedData = this.decomptes.at(index).get('selected')?.value;
      const datePiece = new Date(decompte.datePiece);
      const formattedDate = datePiece.toISOString().split('T')[0];
      const fournisseurArb = decompte.mrcEtape.numMarche.idFourn?.designation;
      const fournisseurFranc = decompte.mrcEtape.numMarche.idFourn?.designationFr;
      const numFournisseur = decompte.mrcEtape.numMarche.idFourn?.numFourn;
      const mntMarcheApresAvnt = decompte.mrcEtape.numMarche.mntMrcApresAvenant;
      const Banque = decompte.mrcEtape.numMarche.numBanque?.designation;
      const Rib = decompte.mrcEtape.numMarche.rib;
      const pctRetIr = decompte.pctRetIr;
      const pctRetTva = decompte.pctRetTva;
      const structure = this.authService.getDesignationStructure();
      if (selectedData) {
        console.log('Données sélectionnées:', selectedData);
        const numPieceFournSelect = selectedData.numPieceFourn;
        const numDecompteSelect = selectedData.numDecompte;

        this.mrcLotsService.getMrcLotsForMarche(this.numMarche).subscribe(async (lots) => {
          this.lotDesignations = lots.map(lot => `${lot.idPrmLot.designation} ${lot.idPrmLot.idLot}`);
          console.log('Lots:', this.lotDesignations);

          const formattedLots = this.lotDesignations.join(' / ');

          const TravauxApprosResults = await Promise.all(lots.map(lot => {
            return Promise.all([
              this.decArticleService.getDecArticlesTravaux(this.numMarche, lot.idPrmLot.idLot, numPieceFournSelect, this.numEtape).toPromise(),
              this.decArticleService.getDecArticlesAppro(this.numMarche, lot.idPrmLot.idLot, numPieceFournSelect, this.numEtape).toPromise()
            ]);
          }));
          console.log(TravauxApprosResults);
          try {
            const decMnt = await this.decMntService.getDecMnt(this.numMarche, numPieceFournSelect).toPromise();
            console.log(decMnt);
            const decImposableNetApresRtn = decMnt?.decImposableNetApresRtn;
            const mntNetChiffre = decMnt?.mntNetChiffre;
            const decTravauxTtc = decMnt?.decTravauxTtc;
            const decAvance = decMnt?.decAvance;
            const afficheCb = decMnt?.afficheCb;
            const decApro = decMnt?.decApro;
            const decRetAv = decMnt?.decRetAv;
            const decTravauxNetAvantRtn = decMnt?.decTravauxNetAvantRtn;
            const decTravauxNetAvantRtnPrecedent = await this.decMntService.getDecTravauxNetAvantRtnPrecedent(this.numMarche, numPieceFournSelect).toPromise();
            console.log("Déc travaux avant retour:", decTravauxNetAvantRtn);
            console.log("Déc travaux avant retour précédent:", decTravauxNetAvantRtnPrecedent);

            const decImposable = decMnt?.decImposable;
            const decRtva = decMnt?.decRtva;
            const decIr = decMnt?.decIr;
            const decFraisEnrg = decMnt?.decFraisEnrg;
            const decPenalite = decMnt?.decPenalite;
            const decAutreMnt = decMnt?.decAutreMnt;

            const docDefinition = {
              pageSize: 'A4',
              header: function () {
                return {
                  margin: [0, 0, 0, 60], // ↑ top et bottom augmentés
                  stack: [
                    {
                      text: [
                        reverseArabicText('وزارة التجهيز والاسكان و البنية التحتية'),
                        '\n',
                        reverseArabicText('الوكالة العقارية للسكنى'),
                        '\n',
                        reverseArabicText(structure) // petite variation
                      ],
                      fontSize: 8, // ↑ taille augmentée
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                      margin: [0, 0, 8, 0],
                      lineHeight: 0.9 // ↑ espacement entre les lignes
                    }
                  ]
                };
              },            
              
               content: [
                {
                  text: isArabic('محضر الخدمات المنجزة') ? reverseArabicText('محضر الخدمات المنجزة') : ('محضر الخدمات المنجزة'),
                  fontSize: 17,
                  bold: true,
                  alignment: 'center',
                  font: isArabic('محضر الخدمات المنجزة') ? 'Amiri' : 'Roboto',
                  direction: isArabic('محضر الخدمات المنجزة') ? 'rtl' : 'ltr',
                  margin: [0, 0, 0, -7]
                },
                {text:''},
                {
                  text: isArabic('الامر المؤرخ في 03 ديسمبر 1936 و المتعلق بالرهن الخاص بالصفقات العمومية و النصوص التي تلته') ? reverseArabicText('الامر المؤرخ في 03 ديسمبر 1936 و المتعلق بالرهن الخاص بالصفقات العمومية و النصوص التي تلته') : ('الامر المؤرخ في 03 ديسمبر 1936 و المتعلق بالرهن الخاص بالصفقات العمومية و النصوص التي تلته'),
                  fontSize: 10,
                  bold: false,
                  alignment: 'center',
                  font: isArabic('الامر المؤرخ في 03 ديسمبر 1936 و المتعلق بالرهن الخاص بالصفقات العمومية و النصوص التي تلته') ? 'Amiri' : 'Roboto',
                  direction: isArabic('الامر المؤرخ في 03 ديسمبر 1936 و المتعلق بالرهن الخاص بالصفقات العمومية و النصوص التي تلته') ? 'rtl' : 'ltr',
                  margin: [0, 0, 0, 30]
                }, 
                {
                  text: [
                    {
                      text: [
                        {
                          text:
                            isArabic(designationMarche) ? reverseArabicText(designationMarche.length > 60 ? designationMarche.slice(0, 100) + "..." : designationMarche.slice(0, 100)) :
                              isFrench(designationMarche) ? reverseFrenchText(designationMarche.length > 60 ? designationMarche.slice(0, 80) + "..." : designationMarche.slice(0, 80) + "...") :
                                designationMarche.length > 60 ? designationMarche.slice(0, 80) + "..." : designationMarche.slice(0, 80) + "...",
                          fontSize: 10,
                          font: isArabic(designationMarche) ? 'Amiri' : 'Roboto',
                          direction: isArabic(designationMarche) ? 'rtl' : (isFrench(designationMarche) ? 'ltr' : 'ltr'),
                          alignment: 'right',
                          bold: false
                        },
                        isArabic('موضوع الصفقة  : ') ? reverseArabicText('موضوع الصفقة  : ') : ('موضوع الصفقة  : '),
                      ],
                      fontSize: 10,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  color: 'black',
                  margin: [0, -5, 0, 13]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: truncateText(reverseText(formattedLots), 120) || 'N/A',
                          fontSize: 9,
                          font: 'Amiri',
                          bold: true,
                          alignment: 'right',
                          direction: 'rtl',
                          color: 'black',
                          noWrap: true,
                        }, isArabic('التقاسيم : ') ? reverseArabicText('التقاسيم  : ') : 'التقاسيم  : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                      color: 'black',
                      bold: true,
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, -10, 0, 13]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: isArabic(fournisseurArb)
                            ? reverseArabicText(fournisseurArb)
                            : isFrench(fournisseurFranc)
                              ? fournisseurFranc
                              : 'N/A',
                          fontSize: 9,
                          font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                          alignment: 'right',
                          direction: isArabic(fournisseurArb) ? 'rtl' : (isFrench(fournisseurFranc) ? 'ltr' : 'ltr'),
                          bold: false
                        }, isArabic('صاحب الصفقة : ') ? reverseArabicText('صاحب الصفقة : ') : ('صاحب الصفقة : '),
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
  
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  color: 'black',
                  margin: [0, -10, 0, 13]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: dateMarche || 'N/A',
                          fontSize: 10,
                          font: 'Roboto',
                          bold: false,
                          alignment: 'right'
                        }, isArabic('تاريخ الصفقة : ') ? reverseArabicText('تاريخ الصفقة : ') : ('تاريخ الصفقة : '),
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      bold: false,
                      direction: 'rtl',
  
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  color: 'black',
                  margin: [0, -10, 0, 13]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: mntMarcheApresAvnt != null ? mntMarcheApresAvnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize:11
                        },
                        isArabic('مبلغ الصفقة   : ') ? reverseArabicText('مبلغ الصفقة   : ') : ('مبلغ الصفقة   : '),
                      ],
                      fontSize: 10,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, -10, 0, 13]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: decTravauxTtc != null ? decTravauxTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000", bold: false, fontSize:11
                        },
                        isArabic('مبلغ الاشغال المنجزة  : ') ? reverseArabicText('مبلغ الاشغال المنجزة  : ') : ('مبلغ الاشغال المنجزة  : '),
                      ],
                      fontSize: 10,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, -10, 0, 13]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text:  reverseArabicText(structure) || 'N/A',
                          fontSize: 10,
                          font: 'Amiri',
                          bold: false,
                          alignment: 'right'
                        }, isArabic('اني المدير العملي ل: ') ? reverseArabicText('اني المدير العملي ل: ') : ('اني المدير العملي ل: '),
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
  
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  color: 'black',
                  margin: [0, -10, 0, 13]
                },
                {
                  text: isArabic('اعتمادا على المعاينات التي تم القيام بها يشهد ان وضعية الاشغال المنجزة و التزويدات الحاصلة على المكان و التي تخول لصاحب الصفقة الحصول على ') ? reverseArabicText('اعتمادا على المعاينات التي تم القيام بها يشهد ان وضعية الاشغال المنجزة و التزويدات الحاصلة على المكان و التي تخول لصاحب الصفقة الحصول على ') : ('اعتمادا على المعاينات التي تم القيام بها يشهد ان وضعية الاشغال المنجزة و التزويدات الحاصلة على المكان و التي تخول لصاحب الصفقة الحصول على '),
                  fontSize: 9,
                  bold: true,
                  alignment: 'center',
                  font: isArabic('اعتمادا على المعاينات التي تم القيام بها يشهد ان وضعية الاشغال المنجزة و التزويدات الحاصلة على المكان و التي تخول لصاحب الصفقة الحصول على ') ? 'Amiri' : 'Roboto',
                  direction: isArabic('اعتمادا على المعاينات التي تم القيام بها يشهد ان وضعية الاشغال المنجزة و التزويدات الحاصلة على المكان و التي تخول لصاحب الصفقة الحصول على ') ? 'rtl' : 'ltr',
                  margin: [30, 0, -11, 10]
                },
                {
                  text: (() => {
                    let baseText = '';
                    if (this.typeDecompte === 1) {
                      baseText = 'الحساب الوقتي عدد' + '  ' + numDecompteSelect + '  ' + 'المؤرخ في ' + '  ' + formattedDate + '  ' + 'متضمنا المبالغ التالية:';
                    } else if (this.typeDecompte === 3) {
                      baseText = 'الحساب تسبقة' + '  ' + 'المؤرخ في ' + '  ' + formattedDate + '  ' + 'متضمنا المبالغ التالية:';
                    } else {
                      baseText = ''; // Valeur par défaut si typeDecompte est autre chose
                    }
                    return isArabic(baseText) ? reverseArabicText(baseText) : baseText;
                  })(),
                  fontSize: 9.2,
                  bold: true,
                  alignment: 'center',
                  font: (() => {
                    const baseText = this.typeDecompte === 1
                      ? 'الحساب الوقتي عدد' + '  ' + numDecompteSelect + '  ' + 'المؤرخ في ' + '  ' + formattedDate + '  ' + 'متضمنا المبالغ التالية:'
                      : this.typeDecompte === 3
                      ? 'الحساب تسبقة' + '  ' + 'المؤرخ في ' + '  ' + formattedDate + '  ' + 'متضمنا المبالغ التالية:'
                      : '';
                    return isArabic(baseText) ? 'Amiri' : 'Roboto';
                  })(),
                  direction: (() => {
                    const baseText = this.typeDecompte === 1
                      ? 'الحساب الوقتي عدد' + '  ' + numDecompteSelect + '  ' + 'المؤرخ في ' + '  ' + formattedDate + '  ' + 'متضمنا المبالغ التالية:'
                      : this.typeDecompte === 3
                      ? 'الحساب تسبقة' + '  ' + 'المؤرخ في ' + '  ' + formattedDate + '  ' + 'متضمنا المبالغ التالية:'
                      : '';
                    return isArabic(baseText) ? 'rtl' : 'ltr';
                  })(),
                  margin: (() => {
                    if (this.typeDecompte === 1) return [0, 0, -270, 10];
                    if (this.typeDecompte === 3) return [0, 0, -300, 10];
                    return [0, 0, -260, 10]; // valeur par défaut
                  })()
                },
                {
                  text: '',
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  margin: [0, 10, 0, 0]
                }, 
                {
                  layout: 'noBorders',
                  table: {
                    body: [
                      [{
                        stack: [
                          {
                            layout: 'noBorders',
                            table: {
                              noBorders: true,
                              body: [
                                [
                                  {
                                    text: '0.000',
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -366, -250, 0]
                                  },
                                  {
                                    text: isArabic('الاشغال الغير المنجزة') ? reverseArabicText('الاشغال الغير المنجزة') : ('الاشغال الغير المنجزة'),
                                    font: isArabic('الاشغال الغير المنجزة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('الاشغال الغير المنجزة') ? 'rtl' : 'ltr',
                                    fontSize: 9,
                                    alignment: 'center',
                                    bold: true,
                                    color: 'black',
                                    margin: [248, -368, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxTtc != null ? decTravauxTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -336, -250, 0]
                                  },
                                  {
                                    text: isArabic('ما تم انجازه') ? reverseArabicText('ما تم انجازه') : 'ما تم انجازه',
                                    font: isArabic('شهادة للدفع') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('ما تم انجازه') ? 'rtl' : 'ltr',
                                    fontSize: 9,
                                    alignment: 'center',
                                    bold: true,
                                    color: 'black',
                                    margin: [248, -337, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: afficheCb || '0.000',
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -305, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? reverseArabicText('مبلغ الحجز بعنوان الضمان 10%') : ('مبلغ الحجز بعنوان الضمان 10%'),
                                    font: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? 'rtl' : 'ltr',
                                    fontSize: 9,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [230, -307, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxNetAvantRtn != null ? decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -269, -250, 0]
                                  },
                                  {
                                    text: isArabic('الباقي المطلوب دفعه') ? reverseArabicText('الباقي المطلوب دفعه') : ('الباقي المطلوب دفعه'),
                                    font: isArabic('الباقي المطلوب دفعه') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('الباقي المطلوب دفعه') ? 'rtl' : 'ltr',
                                    fontSize: 9,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [250, -273, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxNetAvantRtnPrecedent != null ? decTravauxNetAvantRtnPrecedent.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -238, -250, 0]
                                  },
                                  {
                                    text: isArabic('مجموع مبالغ السنوات المالية') ? reverseArabicText('مجموع مبالغ السنوات المالية') : ('مجموع مبالغ السنوات المالية'),
                                    font: isArabic('مجموع مبالغ السنوات المالية') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مجموع مبالغ السنوات المالية') ? 'rtl' : 'ltr',
                                    fontSize: 9,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [250, -242, -100, 0]
                                  }
                                ],
                      
                                [
                                  {
                                    text: decRtva != null ? decRtva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -198, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? reverseArabicText('مبلغ أ ق م  %'+ pctRetTva) : ('مبلغ أ ق م  %'+ pctRetTva),
                                    font: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? 'rtl' : 'ltr',
                                    fontSize: 9,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -202, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decIr != null ? decIr.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -166, -250, 0]
                                  },
                                  {
                                    text: isArabic(' نسبة الخصم على الدخل  %'+ pctRetIr) ? reverseArabicText(' نسبة الخصم على الدخل  %'+ pctRetIr) : (' نسبة الخصم على الدخل  %'+ pctRetIr),
                                    font: isArabic(' نسبة الخصم على الدخل  %'+ pctRetIr) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(' نسبة الخصم على الدخل  %'+ pctRetIr) ? 'rtl' : 'ltr',
                                    fontSize: 9,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -169, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decPenalite != null ? decPenalite.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -136, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ العقوبة ') ? reverseArabicText('مبلغ العقوبة ') : ('مبلغ العقوبة '),
                                    font: isArabic('مبلغ العقوبة ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ العقوبة ') ? 'rtl' : 'ltr',
                                    fontSize: 9,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -139, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decImposableNetApresRtn != null ? decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -106, -250, 0]
                                  },
                                  {
                                    text: isArabic('المبلغ المطلوب دفعه') ? reverseArabicText('المبلغ المطلوب دفعه') : ('المبلغ المطلوب دفعه'),
                                    font: isArabic('المبلغ المطلوب دفعه') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المبلغ المطلوب دفعه') ? 'rtl' : 'ltr',
                                    fontSize: 9,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -109, -100, 0]
                                  }
                                ]
                              ],
                            },
                            margin:[0,400,0,0]
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              widths: [350, 90], // Ajuste la largeur des colonnes pour s'adapter au contenu
                              body: [
                                [
                                  {
                                    text: reversemntChiffre(mntNetChiffre), // Valeur dynamique
                                    font: isArabic(mntNetChiffre) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(mntNetChiffre) ? 'rtl' : 'ltr',
                                    alignment: 'right',
                                    fontSize: 9,
                                    //margin: [0, 0, 0, 0],
                                    color: 'black',
                                    bold: true,
                                    decoration: 'underline'
                                  },
                                  {
                                    text: reverseArabicText('اقفل هذا المحضر على مبلغ :'), // Étiquette statique
                                    fontSize: 9,
                                    font: isArabic('اقفل هذا المحضر على مبلغ :') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('اقفل هذا المحضر على مبلغ :') ? 'rtl' : 'ltr',
                                    alignment: 'right',
                                    margin: [0, 0, -54, 0],
                                    color: 'black',
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: reversemntChiffre(mntNetChiffre) === '0.000' || reversemntChiffre(mntNetChiffre) === '0'
                            ? [0, -55, -15, 0] :
                            [0, -55, -30, 0]
                          },
/*                           {
                            layout: 'noBorders',
                            table: {
                              widths: [90, 60, 350, 90], // Ajuste la largeur des colonnes pour s'adapter au contenu
                              body: [
                                [
                                  {
                                    text: reverseArabicText('باحتساب أ ق م '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('باحتساب أ ق م ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('باحتساب أ ق م ') ? 'rtl' : 'ltr',
                                    alignment: 'right',
                                    margin: [0, -2, -80, 0],
                                    color: 'black',
                                    bold: true,
                                  },
                                  {
                                    text: decImposableNetApresRtn, // Valeur dynamique
                                    fontSize: 8,
                                    alignment: 'right',
                                    margin: [0, 0, -80, 0],
                                    color: 'black',
                                    decoration: 'underline',
                                    bold: true,
                                  },
                                  {
                                    text: reversemntChiffre(mntNetChiffre), // Valeur dynamique
                                    font: isArabic(mntNetChiffre) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(mntNetChiffre) ? 'rtl' : 'ltr',
                                    alignment: 'right',
                                    fontSize: 8,
                                    margin: [5, -3, 0, 0],
                                    color: 'black',
                                    bold: true,
                                    decoration: 'underline'
                                  },
                                  {
                                    text: reverseArabicText('ما قدره'), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('ما قدره') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('ما قدره') ? 'rtl' : 'ltr',
                                    alignment: 'left',
                                    color: 'black',
                                    margin: [0, -3, 0, 0],
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: reversemntChiffre(mntNetChiffre) === '0.000' || reversemntChiffre(mntNetChiffre) === '0'
                              ? [-18, 0, 0, 0] :
                              [-23, 0, 0, 0]
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              widths: [100, 200, 100, 100],
                              body: [
                                [
                                  {
                                    text: Rib,
                                    fontSize: 8,
                                    alignment: 'right',
                                    margin: [0, 2, -80, 0],
                                    bold: true,
                                    color: 'black'
                                  },
                                  {
                                    text: reverseArabicText('الحساب البنكي : '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('الحساب البنكي : ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('الحساب البنكي : ') ? 'rtl' : 'ltr',
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                  },
                                  {
                                    text: isArabic(Banque) ? reverseArabicText(Banque) : Banque || 'N/A',
                                    font: isArabic(Banque) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(Banque) ? 'rtl' : 'ltr',
                                    alignment: 'right',
                                    fontSize: 8,
                                    color: 'black',
                                    bold: true,
                                    margin: [0, -1.5, 0, 0]
                                  },
                                  {
                                    text: reverseArabicText('البنك : '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('البنك : ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('البنك : ') ? 'rtl' : 'ltr',
                                    alignment: 'left',
                                    margin: [0, -2, 0, 0],
                                    color: 'black',
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: [85, 0, 0, -10]
                          },
                          {
                            layout: 'noBorders',
                            table: {

                              widths: [150, 150, 150, 150],
                              body: [
                                [
                                  {
                                    text: isArabic('مدير الشؤون المالية') ? reverseArabicText('مدير الشؤون المالية') : ('مدير الشؤون المالية'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('مدير الشؤون المالية') ? 'rtl' : 'ltr',
                                    margin: [45, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('قابل للخلاص المدير العملي') ? reverseArabicText('قابل للخلاص المدير العملي') : ('قابل للخلاص المدير العملي'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('قابل للخلاص المدير العملي') ? 'rtl' : 'ltr',
                                    margin: [30, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('مصلحة المراقبة و التصرف') ? reverseArabicText('مصلحة المراقبة و التصرف') : ('مصلحة المراقبة و التصرف'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('مصلحة المراقبة و التصرف') ? 'rtl' : 'ltr',
                                    margin: [30, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('رئيس المصلحة') ? reverseArabicText('رئيس المصلحة') : ('رئيس المصلحة'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'center',
                                    direction: isArabic('رئيس المصلحة') ? 'rtl' : 'ltr',
                                    margin: [10, 0, 40, 0],
                                    bold: true
                                  }
                                ],
                                [
                                  {
                                    text: '---------------------------------',
                                    fontSize: 5,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  },
                                  {
                                    text: '---------------------------------',
                                    fontSize: 5,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  },
                                  {
                                    text: '---------------------------------',
                                    fontSize: 5,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  }
                                  , {
                                    text: '---------------------------------',
                                    fontSize: 5,
                                    font: 'Amiri',
                                    alignment: 'center',
                                    margin: [-40, 0, 0, 0]
                                  }
                                ]
                              ]
                            },
                            margin: [-37, 5, 0, -5]
                          }, */

                        ]
                      }]
                    ]
                  },
                } 
              ], 
              footer: function (currentPage, pageCount) {
                var currentDate = new Date();
                var dateString = currentDate.toLocaleDateString('ar-IT');
                return {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*', '*'],
                    body: [
                      [
                        { text: isArabic(`تاريخ الطباعة: ${dateString}`) ? reverseArabicText(`تاريخ الطباعة: ${dateString}`) : `تاريخ الطباعة: ${dateString}`, fontSize: 9, font: 'Amiri', alignment: 'left', direction: 'ltr', bold: false, border: [false, true, false, false] },
                        { text: isArabic(`الصفحة ${currentPage} / ${pageCount}`) ? reverseArabicText(`الصفحة ${currentPage} / ${pageCount}`) : `الصفحة ${currentPage} / ${pageCount}`, fontSize: 9, font: 'Amiri', alignment: 'center', direction: 'ltr', bold: false, border: [false, true, false, false] },
                        { text: isArabic('منظومة التصرف في الصفقات') ? reverseArabicText('منظومة التصرف في الصفقات') : 'منظومة التصرف في الصفقات', fontSize: 9, font: 'Amiri', alignment: 'right', direction: 'ltr', bold: false, border: [false, true, false, false] }
                      ]
                    ]
                  },
                  layout: 'Borders',
                  margin: [40, 15, 40, 0]
                };
              },
              styles: {
                sectionHeader: {
                  bold: true,
                  decoration: 'underline',
                  fontSize: 14,
                  margin: [0, 15, 0, 15],
                }
              },

            };
            pdfMake.createPdf(docDefinition).open();

          }
          catch (error) {
            console.error('Error during DecMnt fetching or PDF generation', error);
          }
        }
        );
      }
    });
  }

  envoyerDecompteAuFin(): void {
    const numStruct = sessionStorage.getItem('NumStruct') ?? '';
    const nomUser = sessionStorage.getItem('Matricule') ?? '';
    console.log('NumStruct:', numStruct);
    console.log('NomUser:', nomUser);
    console.log('NumMarche:', this.numMarche);
    console.log('NumPieceFournForFinance:', this.numPieceFournForFinance);

    this.decompteService.envoyerDecompteAuFinancier(this.numMarche, this.numPieceFournForFinance, numStruct, nomUser)
      .subscribe({
        next: (response: any) => {
          const message = response.message;
          console.log('Réponse du serveur:', response.message);
          this.afficherNotification(message);
          this.getDecomptes();
        }
      });
  }

  afficherNotification(message: string): void {
    this._snackBar.open(message, 'Fermer', {
      duration: 7000,  // La notification disparaît après 3 secondes
      panelClass: ['success-snackbar'],  // Optionnel : appliquer une classe CSS personnalisée
    });
  }

  openConfirmEnvoieDecompteAuFin(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Êtes-vous sûr de vouloir envoyer ce décompte au financier ?',
        confirmButtonText: 'Envoyer'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.envoyerDecompteAuFin();
      }
    });
  }

  isSubmitDisabled(): boolean {
    const hasFormError = this.decomptes.errors?.['auMoinsUnDecompte'];

    const hasSelectedExisting = this.decomptes.controls.some(control =>
      control.get('selected')?.value && !control.get('isNew')?.value
    );

    const hasValidNewDecompte = this.decomptes.controls.some(control =>
      control.get('isNew')?.value && !!control.get('datePiece')?.value
    );

    // Le bouton est désactivé s’il y a une erreur OU aucun cas valide
    return hasFormError || !(hasSelectedExisting || hasValidNewDecompte);
  }

 /*  async generateAttesdePaiementDirectAffaire() {
    this.decPdf.forEach((decompte: any, index: number) => {
      console.log(decompte);

      const designationMarche = decompte.mrcEtape.numMarche.designation;
      const dateMarche = decompte.mrcEtape.numMarche.dateMarche;
      const exercice = decompte.mrcEtape.numMarche.exercice;
      const selectedData = this.decomptes.at(index).get('selected')?.value;
      const datePiece = new Date(decompte.datePiece);
      const formattedDate = datePiece.toISOString().split('T')[0];
      const fournisseurArb = decompte.mrcEtape.numMarche.idFourn?.designation;
      const fournisseurFranc = decompte.mrcEtape.numMarche.idFourn?.designationFr;
      const numFournisseur = decompte.mrcEtape.numMarche.idFourn?.numFourn;
      const mntMarcheApresAvnt = decompte.mrcEtape.numMarche.mntMrcApresAvenant;
      const Banque = decompte.mrcEtape.numMarche.numBanque?.designation;
      const Rib = decompte.mrcEtape.numMarche.rib;


      if (selectedData) {
        console.log('Données sélectionnées:', selectedData);
        const numPieceFournSelect = selectedData.numPieceFourn;
        const numDecompteSelect = selectedData.numDecompte;
        const pctRetIr = decompte.pctRetIr;
        const pctRetTva = decompte.pctRetTva;
        this.mrcLotsService.getMrcLotsForMarche(this.numMarche).subscribe(async (lots) => {
          this.lotDesignations = lots.map(lot => `${lot.idPrmLot.designation} ${lot.idPrmLot.idLot}`);
          console.log('Lots:', this.lotDesignations);

          const formattedLots = this.lotDesignations.join(' / ');

          const TravauxApprosResults = await Promise.all(lots.map(lot => {
            return Promise.all([
              this.decArticleService.getDecArticlesTravaux(this.numMarche, lot.idPrmLot.idLot, numPieceFournSelect, this.numEtape).toPromise(),
              this.decArticleService.getDecArticlesAppro(this.numMarche, lot.idPrmLot.idLot, numPieceFournSelect, this.numEtape).toPromise()
            ]);
          }));
          console.log(TravauxApprosResults);
          try {
            const decMnt = await this.decMntService.getDecMnt(this.numMarche, numPieceFournSelect).toPromise();
            console.log(decMnt);
            const decImposableNetApresRtn = decMnt?.decImposableNetApresRtn;
            const mntNetChiffre = decMnt?.mntNetChiffre;
            const decTravauxTtc = decMnt?.decTravauxTtc;
            const decAvance = decMnt?.decAvance;
            const afficheCb = decMnt?.afficheCb;
            const decApro = decMnt?.decApro;
            const decRetAv = decMnt?.decRetAv;
            const decTravauxNetAvantRtn = decMnt?.decTravauxNetAvantRtn;
            const decTravauxNetAvantRtnPrecedent = await this.decMntService.getDecTravauxNetAvantRtnPrecedent(this.numMarche, numPieceFournSelect).toPromise();
            console.log("Déc travaux avant retour:", decTravauxNetAvantRtn);
            console.log("Déc travaux avant retour précédent:", decTravauxNetAvantRtnPrecedent);

            const decImposable = decMnt?.decImposable;
            const decRtva = decMnt?.decRtva;
            const decIr = decMnt?.decIr;
            const decFraisEnrg = decMnt?.decFraisEnrg;
            const decPenalite = decMnt?.decPenalite;
            const decAutreMnt = decMnt?.decAutreMnt;
            const docDefinition = {
              pageSize: 'A4',
              header: function () {
                return {
                  pageMargins: [15, 15, 15, 30],
                  stack: [
                    {
                      columns: [
                        {
                          text: "",
                          fontSize: 7,
                          font: 'Roboto',
                          alignment: 'left',
                          direction: 'ltr',
                          margin: [0, 0, 0, 0]
                        },
                        {
                          text: isArabic('الجمهورية التونسية') ? reverseArabicText('الجمهورية التونسية') : 'الجمهورية التونسية',
                          fontSize: 7,
                          font: 'Amiri',
                          alignment: 'right',
                          direction: 'rtl',
                          margin: [0, 0, 10, 0]
                        }
                      ]
                    },
                    {
                      columns: [
                        {
                          text: isArabic('الملحقة بالأمر بالصرف عدد .....................') ? reverseArabicText('الملحقة بالأمر بالصرف عدد .....................') : ('الملحقة بالأمر بالصرف عدد .....................'),
                          fontSize: 7,
                          font: 'Amiri',
                          alignment: 'left',
                          direction: 'rtl',
                          margin: [20, 0, 0, 0]
                        },
                        {
                          text: isArabic('وزارة التجهيز و الإسكان') ? reverseArabicText('وزارة التجهيز و الإسكان') : 'وزارة التجهيز و الإسكان',
                          fontSize: 7,
                          font: 'Amiri',
                          alignment: 'right',
                          direction: 'rtl',
                          margin: [0, 0, 10, 0]
                        }
                      ]
                    },
                    {
                      columns: [
                        {
                          text: "",
                          fontSize: 7,
                          font: 'Roboto',
                          alignment: 'left',
                          direction: 'ltr',
                          margin: [0, 0, 0, 0]
                        },
                        {
                          text: isArabic('الوكالة العقارية للسكنى') ? reverseArabicText('الوكالة العقارية للسكنى') : 'الوكالة العقارية للسكنى',
                          fontSize: 7,
                          font: 'Amiri',
                          alignment: 'right',
                          direction: 'rtl',
                          margin: [0, 0, 10, 0]
                        }
                      ]
                    }
                  ]
                };
              },
              content: [
                {
                  text: isArabic('شهادة للدفع') ? reverseArabicText('شهادة للدفع') : ('شهادة للدفع'),
                  fontSize: 15,
                  bold: true,
                  alignment: 'center',
                  font: isArabic('شهادة للدفع') ? 'Amiri' : 'Roboto',
                  direction: isArabic('شهادة للدفع') ? 'rtl' : 'ltr',
                  margi: [0, 0, 0, -10]
                },

                ...(this.typeDecompte === 4 ? [
                  {
                    text: isArabic('تحرير حجز الضمان') ? reverseArabicText('تحرير حجز الضمان') : 'تحرير حجز الضمان',
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    font: isArabic('تحرير حجز الضمان') ? 'Amiri' : 'Roboto',
                    direction: isArabic('تحرير حجز الضمان') ? 'rtl' : 'ltr',
                    margin: [0, -10, 0, 0]
                  }
                ] : []),
                {
                  text: [
                    {
                      text: [
                        {
                          text: exercice || 'N/A', bold: true
                        }, isArabic('السنة المالية: ') ? reverseArabicText('السنة المالية: ') : 'السنة المالية: ',
                      ],
                      fontSize: 15,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 13,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  margin: [0, 15, 0, 20]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "", bold: true
                        }, isArabic('موضوع الصفقة: ') ? reverseArabicText('موضوع الصفقة : ') : 'موضوع الصفقة : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 0, 0, 0]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "", bold: true
                        }, isArabic('التقسيم: ') ? reverseArabicText('التقسيم : ') : 'التقسيم : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 15, 0, 0]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "", bold: true
                        }, isArabic('تاريخ الصفقة: ') ? reverseArabicText('تاريخ الصفقة : ') : 'تاريخ الصفقة : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 15, 0, 0]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "", bold: true
                        }, isArabic('مبلغ الصفقة باعتبار الملاحق: ') ? reverseArabicText('مبلغ الصفقة باعتبار الملاحق : ') : 'مبلغ الصفقة باعتبار الملاحق : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                      margin: [0, 15, 0, 0]

                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 20, 0, 0]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "",
                        }, isArabic('المقاول: ') ? reverseArabicText('المقاول : ') : 'المقاول : ',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',
                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 15, 0, 0]
                },
                {
                  layout: 'noBorders',
                  table: {
                    //widths: [400,'*','*','*','*'],
                    //heights: ['*','*','*','*','*'],
                    body: [
                      [{
                        stack: [
                          {
                            canvas: [
                              {
                                type: 'rect',
                                x: -27,
                                y: -180,
                                w: 420,
                                h: 180,
                                lineColor: 'black',
                                lineWidth: 1,
                              }
                            ],
                          },
                          {
                            text: isArabic(designationMarche)
                              ? reverseArabicText(designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80))
                              : isFrench(designationMarche)
                                ? reverseFrenchText(designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80))
                                : (designationMarche.length > 60 ? designationMarche.slice(0, 80) : designationMarche.slice(0, 80)),
                            fontSize: 10,
                            font: isArabic(designationMarche) ? 'Amiri' : 'Roboto',
                            bold: true,
                            direction: isArabic(designationMarche) ? 'rtl' : (isFrench(designationMarche) ? 'ltr' : 'ltr'),
                            alignment: 'center',
                            color: 'black',
                            margin: [-20, -160, 0, isArabic(designationMarche) ? 20 : (isFrench(designationMarche) ? 25 : 25)]
                          },
                          {
                            text: truncateText(reverseText(formattedLots), 130) || 'N/A',
                            fontSize: 9,
                            font: 'Amiri',
                            bold: true,
                            alignment: 'center',
                            direction: 'rtl',
                            color: 'black',
                            noWrap: true,
                            margin: [-25, 0, 0, 19],
                          },
                          {
                            text: dateMarche || 'N/A',
                            fontSize: 10,
                            font: 'Roboto',
                            bold: true,
                            alignment: 'center',
                            color: 'black',
                            margin: [-20, 0, 0, 30]
                          },
                          {
                            text: mntMarcheApresAvnt != null ? mntMarcheApresAvnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                            fontSize: 10,
                            font: 'Roboto',
                            bold: true,
                            alignment: 'center',
                            color: 'black',
                            margin: [-20, -5, 0, 25]
                          },
                          {
                            text: [
                              {
                                text: numFournisseur + "    " || 'N/A',
                                fontSize: 9,
                                font: 'Roboto',
                                alignment: 'center',
                                direction: 'ltr',
                                bold: true,
                                margin: [0, 0, 0, 0]
                              },
                              {
                                text: isArabic(fournisseurArb)
                                  ? reverseArabicText(fournisseurArb)
                                  : isFrench(fournisseurFranc)
                                    ? fournisseurFranc
                                    : 'N/A',
                                fontSize: 9,
                                font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                                alignment: 'center',
                                direction: isArabic(fournisseurArb) ? 'rtl' : (isFrench(fournisseurFranc) ? 'ltr' : 'ltr'),
                                bold: true,
                                color: 'black',
                              }
                            ]
                          }

                        ]
                      }]
                    ]
                  }
                },
                {
                  text: (() => {
                    switch (this.typeDecompte) {
                      case 1:
                        return [
                          {
                            text: [
                              { text: numDecompteSelect || 'N/A', bold: true },
                              ' ',
                              isArabic('كشف حساب عدد ') ? reverseArabicText('كشف حساب عدد ') : 'كشف حساب عدد ',
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            alignment: 'right',
                            direction: 'rtl',
                          },
                        ];

                      case 2:
                        return [
                          {
                            text: isArabic('كشف حساب  عدد') ?
                              `${reverseArabicText('و الأخير')} ${numDecompteSelect} ${reverseArabicText('كشف حساب  عدد')}` :
                              `والأخير ${numDecompteSelect}كشف حساب  عدد`,
                            fontSize: 10,
                            font: 'Amiri',
                            alignment: 'right',
                            direction: 'rtl',
                          },
                        ];

                      case 3:
                        return [
                          {
                            text: [
                              { text: '', bold: true },
                              isArabic('كشف تسبقة') ? reverseArabicText('كشف تسبقة') : 'كشف تسبقة',
                            ],
                            fontSize: 11,
                            font: 'Amiri',
                            alignment: 'right',
                            direction: 'rtl',
                          },
                        ];

                      case 4:
                        return [
                          {
                            text: isArabic('كشف تحرير حجز الضمان') ?
                              reverseArabicText('كشف تحرير حجز الضمان') :
                              'كشف تحرير حجز الضمان',
                            fontSize: 11,
                            font: 'Amiri',
                            alignment: 'right',
                            direction: 'rtl',
                          },
                        ];

                      default:
                        return [
                          {
                            text: 'نوع غير معروف',
                            fontSize: 11,
                            font: 'Amiri',
                            alignment: 'right',
                            direction: 'rtl',
                          },
                        ];
                    }
                  })(),
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  bold: true,
                  margin: [0, 6, 0, -33]
                },
                {
                  text: [
                    {
                      text: [
                        {
                          text: "", bold: true
                        }, isArabic('المبلغ المستوجب دفعه :') ? reverseArabicText('المبلغ المستوجب دفعه :') : 'المبلغ المستوجب دفعه :',
                      ],
                      fontSize: 11,
                      font: 'Amiri',
                      alignment: 'right',
                      direction: 'rtl',

                    }
                  ],
                  fontSize: 11,
                  font: 'Amiri',
                  alignment: 'right',
                  direction: 'rtl',
                  margin: [0, 25, 0, -15]
                },
                {
                  layout: 'noBorders',
                  table: {
                    body: [
                      [{
                        stack: [
                          {
                            canvas: [
                              {
                                type: 'rect',
                                x: -27,
                                y: -28,
                                w: 420,
                                h: 40,
                                lineColor: 'black',
                                lineWidth: 1,
                              }
                            ],
                          },
                          {
                            text: [
                              {
                                text: formattedDate || 'N/A',
                                fontSize: 11,
                                font: 'Roboto',
                                bold: true,
                                alignment: 'center',
                                color: 'black',
                              },
                              {
                                text: isArabic('                  بتاريخ               ') ? reverseArabicText('                  بتاريخ              ') : '                  بتاريخ               ',
                                fontSize: 11,
                                font: 'Amiri',
                                alignment: 'right',
                                direction: 'rtl',
                              },
                              {
                                text: decImposableNetApresRtn != null ? decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                fontSize: 11,
                                font: 'Roboto',
                                bold: true,
                                alignment: 'right',
                                color: 'black',
                              }
                            ],
                            margin: [-20, -30, 0, -20]
                          }
                        ]
                      }]
                    ]
                  }
                },
                {
                  layout: 'noBorders',
                  table: {
                    body: [
                      [{
                        stack: [
                          {
                            canvas: [
                              {
                                type: 'rect',
                                x: 80,
                                y: 17,
                                w: 300,
                                h: 368,
                                lineColor: 'black',
                                lineWidth: 1,
                              },
                              {
                                type: 'line',
                                x1: 230,
                                y1: 18,
                                x2: 230,
                                y2: 383,
                                lineColor: 'black',
                                lineWidth: 1,
                              }
                            ],
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              noBorders: true,
                              body: [
                                [
                                  {
                                    text: decTravauxTtc != null ? decTravauxTtc.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -366, -250, 0]
                                  },
                                  {
                                    text: isArabic('ما تم انجازه') ? reverseArabicText('ما تم انجازه') : 'ما تم انجازه',
                                    font: isArabic('شهادة للدفع') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('ما تم انجازه') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    color: 'black',
                                    margin: [248, -368, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decAvance != null ? decAvance.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -350, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ التسبقة') ? reverseArabicText('مبلغ التسبقة') : ('مبلغ التسبقة'),
                                    font: isArabic('مبلغ التسبقة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ التسبقة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    color: 'black',
                                    margin: [248, -352, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: afficheCb || "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -333, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? reverseArabicText('مبلغ الحجز بعنوان الضمان 10%') : ('مبلغ الحجز بعنوان الضمان 10%'),
                                    font: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ الحجز بعنوان الضمان 10%') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [230, -336, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decApro != null ? decApro.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -316, -250, 0]
                                  },
                                  {
                                    text: isArabic('التزويدات') ? reverseArabicText('التزويدات') : ('التزويدات'),
                                    font: isArabic('التزويدات') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('التزويدات') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [255, -318, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -299, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ الحجز بعنوان الضمان على التزويدات') ? reverseArabicText('مبلغ الحجز بعنوان الضمان على التزويدات') : ('مبلغ الحجز بعنوان الضمان على التزويدات'),
                                    font: isArabic('مبلغ الحجز بعنوان الضمان على التزويدات') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ الحجز بعنوان الضمان على التزويدات') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [230, -302, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -280, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ مراجعة الاثمان') ? reverseArabicText('مبلغ مراجعة الاثمان') : ('مبلغ مراجعة الاثمان'),
                                    font: isArabic('مبلغ مراجعة الاثمان') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ مراجعة الاثمان') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [255, -283, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decRetAv != null ? decRetAv.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -262, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ استرجاع التسبقة') ? reverseArabicText('مبلغ استرجاع التسبقة') : ('مبلغ استرجاع التسبقة'),
                                    font: isArabic('مبلغ استرجاع التسبقة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع الغير خاضع للضريبة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                    margin: [255, -265, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -245, -250, 0]
                                  },
                                  {
                                    text: isArabic('المجموع الغير خاضع للضريبة') ? reverseArabicText('المجموع الغير خاضع للضريبة') : ('المجموع الغير خاضع للضريبة'),
                                    font: isArabic('المجموع الغير خاضع للضريبة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع الغير خاضع للضريبة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [255, -250, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxNetAvantRtn != null ? decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -229, -250, 0]
                                  },
                                  {
                                    text: isArabic('المجموع الخاضع للضريبة') ? reverseArabicText('المجموع الخاضع للضريبة') : ('المجموع الخاضع للضريبة'),
                                    font: isArabic('المجموع الخاضع للضريبة') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع الخاضع للضريبة') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -232, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxNetAvantRtn != null ? decTravauxNetAvantRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -210, -250, 0]
                                  },
                                  {
                                    text: isArabic('المجموع العام') ? reverseArabicText('المجموع العام') : ('المجموع العام'),
                                    font: isArabic('المجموع العام') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المجموع العام') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [250, -212, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decTravauxNetAvantRtnPrecedent != null ? decTravauxNetAvantRtnPrecedent.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -194, -250, 0]
                                  },
                                  {
                                    text: isArabic('المصاريف السابقة و الواجب خصمها') ? reverseArabicText('المصاريف السابقة و الواجب خصمها') : ('المصاريف السابقة و الواجب خصمها'),
                                    font: isArabic('المصاريف السابقة و الواجب خصمها') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المصاريف السابقة و الواجب خصمها') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [250, -197, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decImposable != null ? decImposable.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -180, -250, 0]
                                  },
                                  {
                                    text: isArabic('الباقي المطلوب دفعه') ? reverseArabicText('الباقي المطلوب دفعه') : ('الباقي المطلوب دفعه'),
                                    font: isArabic('الباقي المطلوب دفعه') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('الباقي المطلوب دفعه') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [265, -182, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decRtva != null ? decRtva.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -165, -250, 0]
                                  },
                                  {
                                    text: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? reverseArabicText('مبلغ أ ق م  %'+ pctRetTva) : ('مبلغ أ ق م  %'+ pctRetTva),
                                    font: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مبلغ أ ق م  %'+ pctRetTva) ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -166, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decIr != null ? decIr.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -149, -250, 0]
                                  },
                                  {
                                    text: isArabic(' نسبة الخصم على الدخل %' + pctRetIr) ? reverseArabicText(' نسبة الخصم على الدخل  %'+ pctRetIr) : (' نسبة الخصم على الدخل  %'+ pctRetIr),
                                    font: isArabic(' نسبة الخصم على الدخل  %'+ pctRetIr) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(' نسبة الخصم على الدخل  %'+ pctRetIr) ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -152, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decPenalite != null ? decPenalite.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -136, -250, 0]
                                  },
                                  {
                                    text: isArabic('خصومات مختلفة ') ? reverseArabicText('خصومات مختلفة ') : ('خصومات مختلفة '),
                                    font: isArabic('خصومات مختلفة ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('خصومات مختلفة ') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -136, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decFraisEnrg != null ? decFraisEnrg.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")  : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -122, -250, 0]
                                  },
                                  {
                                    text: isArabic('معلوم التسجيل') ? reverseArabicText('معلوم التسجيل') : ('معلوم التسجيل'),
                                    font: isArabic('معلوم التسجيل') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('معلوم التسجيل') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -122, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decAutreMnt != null ? decAutreMnt.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -107, -250, 0]
                                  },
                                  {
                                    text: isArabic('مصاريف اخرى') ? reverseArabicText('مصاريف اخرى') : ('مصاريف اخرى'),
                                    font: isArabic('مصاريف اخرى') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('مصاريف اخرى') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -107, -100, 0]
                                  }
                                ],
                                [
                                  {
                                    text: decImposableNetApresRtn != null ? decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000",
                                    fontSize: 9,
                                    font: 'Roboto',
                                    alignment: 'center',
                                    margin: [50, -92, -250, 0]
                                  },
                                  {
                                    text: isArabic('المبلغ المطلوب دفعه') ? reverseArabicText('المبلغ المطلوب دفعه') : ('المبلغ المطلوب دفعه'),
                                    font: isArabic('المبلغ المطلوب دفعه') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('المبلغ المطلوب دفعه') ? 'rtl' : 'ltr',
                                    fontSize: 8,
                                    alignment: 'center',
                                    bold: true,
                                    margin: [260, -92, -100, 0]
                                  }
                                ]
                              ],
                            },
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              widths: [350, 90], // Ajuste la largeur des colonnes pour s'adapter au contenu
                              body: [
                                [
                                  {
                                    text: isArabic(fournisseurArb) ? reverseArabicText(fournisseurArb) : isFrench(fournisseurFranc) ? fournisseurFranc : 'N/A',
                                    font: isArabic(fournisseurArb) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(fournisseurArb) ? 'rtl' : (isFrench(fournisseurFranc) ? 'ltr' : 'ltr'),
                                    alignment: 'right',
                                    fontSize: 8,
                                    decoration: 'underline',
                                    color: 'black',
                                    margin: [5, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: reverseArabicText('أشهد أنه يمكن دفع إلى'), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('أشهد أنه يمكن دفع إلى') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('أشهد أنه يمكن دفع إلى') ? 'rtl' : 'ltr',
                                    alignment: 'left',
                                    margin: [0, 0, 0, 0],
                                    color: 'black',
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: [100, -71, 0, 0]
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              widths: [90, 60, 350, 90], // Ajuste la largeur des colonnes pour s'adapter au contenu
                              body: [
                                [
                                  {
                                    text: reverseArabicText('باحتساب أ ق م '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('باحتساب أ ق م ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('باحتساب أ ق م ') ? 'rtl' : 'ltr',
                                    alignment: 'center',
                                    margin: [0, -2, -80, 0],
                                    color: 'black',
                                    bold: true,
                                  },
                                  {
                                    text: decImposableNetApresRtn != null ? decImposableNetApresRtn.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0.000" , // Valeur dynamique
                                    fontSize: 8,
                                    alignment: 'center',
                                    margin: [0, 0, -80, 0],
                                    color: 'black',
                                    decoration: 'underline',
                                    bold: true,
                                  },
                                  {
                                    text: reversemntChiffre(mntNetChiffre), // Valeur dynamique
                                    font: isArabic(mntNetChiffre) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(mntNetChiffre) ? 'rtl' : 'ltr',
                                    alignment: 'right',
                                    fontSize: 8,
                                    margin: [5, -3, 0, 0],
                                    color: 'black',
                                    bold: true,
                                    decoration: 'underline'
                                  },
                                  {
                                    text: reverseArabicText('ما قدره'), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('ما قدره') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('ما قدره') ? 'rtl' : 'ltr',
                                    alignment: 'left',
                                    color: 'black',
                                    margin: [0, -3, 0, 0],
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: reversemntChiffre(mntNetChiffre) === '0.000' || reversemntChiffre(mntNetChiffre) === '0'
                              ? [-18, 0, 0, 0] :
                              [-23, 0, 0, 0]
                          },
                          {
                            layout: 'noBorders',
                            table: {
                              widths: [100, 200, 100, 100],
                              body: [
                                [
                                  {
                                    text: Rib,
                                    fontSize: 8,
                                    alignment: 'right',
                                    margin: [0, 2, -80, 0],
                                    bold: true,
                                    color: 'black'
                                  },
                                  {
                                    text: reverseArabicText('الحساب البنكي : '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('الحساب البنكي : ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('الحساب البنكي : ') ? 'rtl' : 'ltr',
                                    alignment: 'center',
                                    color: 'black',
                                    bold: true,
                                  },
                                  {
                                    text: isArabic(Banque) ? reverseArabicText(Banque) : Banque || 'N/A',
                                    font: isArabic(Banque) ? 'Amiri' : 'Roboto',
                                    direction: isArabic(Banque) ? 'rtl' : 'ltr',
                                    alignment: 'right',
                                    fontSize: 8,
                                    color: 'black',
                                    bold: true,
                                    margin: [0, -1.5, 0, 0]
                                  },
                                  {
                                    text: reverseArabicText('البنك : '), // Étiquette statique
                                    fontSize: 8,
                                    font: isArabic('البنك : ') ? 'Amiri' : 'Roboto',
                                    direction: isArabic('البنك : ') ? 'rtl' : 'ltr',
                                    alignment: 'left',
                                    margin: [0, -2, 0, 0],
                                    color: 'black',
                                    bold: true,
                                  }
                                ]
                              ]
                            },
                            margin: [85, 0, 0, -10]
                          },
                          {
                            layout: 'noBorders',
                            table: {

                              widths: [150, 150, 150, 150],
                              body: [
                                [
                                  {
                                    text: isArabic('مدير الشؤون المالية') ? reverseArabicText('مدير الشؤون المالية') : ('مدير الشؤون المالية'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('مدير الشؤون المالية') ? 'rtl' : 'ltr',
                                    margin: [45, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('قابل للخلاص المدير العملي') ? reverseArabicText('قابل للخلاص المدير العملي') : ('قابل للخلاص المدير العملي'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('قابل للخلاص المدير العملي') ? 'rtl' : 'ltr',
                                    margin: [30, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('مصلحة المراقبة و التصرف') ? reverseArabicText('مصلحة المراقبة و التصرف') : ('مصلحة المراقبة و التصرف'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'left',
                                    direction: isArabic('مصلحة المراقبة و التصرف') ? 'rtl' : 'ltr',
                                    margin: [30, 0, 0, 0],
                                    bold: true
                                  },
                                  {
                                    text: isArabic('رئيس المصلحة') ? reverseArabicText('رئيس المصلحة') : ('رئيس المصلحة'),
                                    fontSize: 9,
                                    font: 'Amiri',
                                    alignment: 'center',
                                    direction: isArabic('رئيس المصلحة') ? 'rtl' : 'ltr',
                                    margin: [10, 0, 40, 0],
                                    bold: true
                                  }
                                ],
                                [
                                  {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  },
                                  {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  },
                                  {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                  }
                                  , {
                                    text: '---------------------------------',
                                    fontSize: 3,
                                    font: 'Amiri',
                                    alignment: 'center',
                                    margin: [-40, 0, 0, 0]
                                  }
                                ]
                              ]
                            },
                            margin: [-37, 5, 0, 0]
                          },

                        ]
                      }]
                    ]
                  },
                }
              ],
              footer: function (currentPage, pageCount) {
                var currentDate = new Date();
                var dateString = currentDate.toLocaleDateString('ar-IT');
                return {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*', '*'],
                    body: [
                      [
                        { text: isArabic(`تاريخ الطباعة: ${dateString}`) ? reverseArabicText(`تاريخ الطباعة: ${dateString}`) : `تاريخ الطباعة: ${dateString}`, fontSize: 9, font: 'Amiri', alignment: 'left', direction: 'ltr', bold: false, border: [false, true, false, false] },
                        { text: isArabic(`الصفحة ${currentPage} / ${pageCount}`) ? reverseArabicText(`الصفحة ${currentPage} / ${pageCount}`) : `الصفحة ${currentPage} / ${pageCount}`, fontSize: 9, font: 'Amiri', alignment: 'center', direction: 'ltr', bold: false, border: [false, true, false, false] },
                        { text: isArabic('منظومة التصرف في الصفقات') ? reverseArabicText('منظومة التصرف في الصفقات') : 'منظومة التصرف في الصفقات', fontSize: 9, font: 'Amiri', alignment: 'right', direction: 'ltr', bold: false, border: [false, true, false, false] }
                      ]
                    ]
                  },
                  layout: 'Borders',
                  margin: [40, 15, 40, 0]
                };
              },
              styles: {
                sectionHeader: {
                  bold: true,
                  decoration: 'underline',
                  fontSize: 14,
                  margin: [0, 15, 0, 15],
                }
              },

            };
            pdfMake.createPdf(docDefinition).open();

          }
          catch (error) {
            console.error('Error during DecMnt fetching or PDF generation', error);
          }
        }
        );
      }
    });
  } */



  get decomptes(): FormArray {
    return this.form.get('decomptes') as FormArray;
  }

  get datePieceControl(): FormControl {
    return this.decomptes.get('datePiece') as FormControl
  }

  get today(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

}

export function isArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicPattern.test(text);
}

export function isFrench(text: string): boolean {
  const frenchRegex = /^[A-Za-zÀ-ÿ\s]*$/;
  return frenchRegex.test(text);
}


export function reverseArabicText(text, space = '  ') {
  const words = text.split(' ');
  const reversedWords = words.reverse();
  return reversedWords.join(space);
}

export function reverseFrenchText(text, space = '  ') {
  const words = text.split(' ');
  const reversedWords = words.reverse();
  return reversedWords.join(space);
}

export function reversemntChiffre(text, space = '  ') {
  if (!text) {
    // Si le texte est null ou vide, renvoyer '0'
    return '0.000';
  }
  const words = text.split(' ');
  const reversedWords = words.reverse();
  return reversedWords.join(space);
}

export function reverseMntParsRet(text, space = '  ') {
  const words = text.split(' ');  // Diviser le texte en mots

  // Traiter les mots séparément en vérifiant s'ils contiennent des chiffres ou non
  const reversedWords = words.map(word => {
    // Si le mot contient un nombre (en arabe ou en chiffres), ne pas l'inverser
    if (/\d/.test(word)) {
      return word;
    } else {
      return word.split('').reverse().join('');  // Inverser les mots arabes
    }
  });

  // Rejoindre les mots après avoir inversé seulement le texte arabe
  return reversedWords.join(space);
}


export function reverseText(text) {
  let parts = text.split(' / ');

  // Inverser l'ordre des parties et les recomposer dans le bon ordre
  let reversed = parts.reverse().map(part => {
    // Supprimer les parenthèses sans toucher au contenu à l'intérieur
    part = part.replace(/[()]/g, '').trim(); // Retirer uniquement les parenthèses

    // Diviser la partie en sous-parties
    let subParts = part.split(' ');

    // Réorganiser chaque sous-partie dans le bon ordre
    return subParts.reverse().join('  ');
  });

  // Joindre les parties inversées avec ' / '
  return reversed.join('  /  ');
}

export function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return '...' + text.slice(0, maxLength);
  }
  return text;
}

export function truncateTextFrench(text, maxLength) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

export function formatNombre(val: any): string {
  return val != null
    ? (+val).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : "0.000";
}





