import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators, FormArray, ValidatorFn, AbstractControl, ValidationErrors, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FournisseurService } from 'src/app/services/fournisseur/fournisseur.service';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import { Page } from 'src/app/model/page';
import { Fournisseur } from 'src/app/model/fournisseur';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatTabsModule } from '@angular/material/tabs';
import { catchError, concat, debounceTime, delay, filter, forkJoin, map, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Banque } from 'src/app/model/banque';
import { BanqueService } from 'src/app/services/banque/banque.service';
import { ribValidator } from 'src/app/services/RibValidator/ribValidator';
import { MatTableModule } from '@angular/material/table';
import { PrmtypepaymrcService } from 'src/app/services/prmtypepaymrc/prmtypepaymrc.service';
import { typePFMarche } from 'src/app/model/typePFMarche';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MarcheService } from 'src/app/services/marche/marche.service';
import { Marche } from 'src/app/model/marche';
import { DateComparisonValidator } from 'src/app/services/dateValidator/DateOrderValidator';
import { EtapeService } from 'src/app/services/etape/etape.service';
import { MrcEtape, MrcEtapeRequest } from 'src/app/model/mrcetape';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';
import { validateurEtape } from 'src/app/services/EtapeValidator/validateurEtape';
import { CoreService } from 'src/app/services/core/core.service';
import { PrmStructure } from 'src/app/model/prmStructure';
import { PrmstructureService } from 'src/app/services/prmstructure/prmstructure.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatRadioModule } from '@angular/material/radio';
import { PrmModePen } from 'src/app/model/prmModePen';
import { PrmmodepenService } from 'src/app/services/prmmodepen/prmmodepen.service';
import { PctVdmMaxValidator } from 'src/app/services/pctVdmMaxValidator/pctVdmMaxValidator';
import { MrclotService } from 'src/app/services/mrclot/mrclot.service';
import { PrmtypelotService } from 'src/app/services/prmtypelot/prmtypelot.service';
import { PrmlotService } from 'src/app/services/prmlot/prmlot.service';
import { PrmLot } from 'src/app/model/prmlot';
import { MrcLot, MrcLotDto } from 'src/app/model/mrcLot';
import { validateurMrcLot } from 'src/app/services/MrcLotValidator/validateurMrcLot';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarcheArticleComponent } from '../../../marche-article/marche-article.component';
import { MrcarticleService } from 'src/app/services/mrcarticle/mrcarticle.service';
import { TypeGarantieService } from 'src/app/services/typeGarantie/type-garantie.service';
import { TypeGarantie } from 'src/app/model/typeGarantie';
import { MrcGarantieService } from 'src/app/services/mrcGarantie/mrc-garantie.service';
import { CustomDateAdapter } from 'src/app/services/Dateadaptater/CustomDateAdapter';
import { validateurMrcGarantie } from 'src/app/services/MrcGarantieValidator/mrcGarantieValidator';
import { OrdreServiceComponent } from '../../../ordre-service/ordre-service.component';


@Component({
  selector: 'app-marche-add-edit',
  templateUrl: './marche-add-edit.component.html',
  standalone: true,
  imports: [
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
    FormsModule
  ],
  styleUrls: ['./marche-add-edit.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ]
})
export class MarcheAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  fournisseurs: Fournisseur[] = [];
  filteredFournisseurs: Fournisseur[] = [];  // Liste filtrée qui est utilisée dans le template
  pagesCharges: Set<number> = new Set();
  structures: PrmStructure[] = [];
  banques: Banque[] = [];
  penalites: PrmModePen[] = [];
  pageIndex = 0;
  pageSize = 10;
  totalPages!: number;
  searchTerm: string = '';
  selectedFournisseur?: Fournisseur;
  isLoading = false;
  selectedIndex = 0;
  searching: boolean = false;
  protected _onDestroy = new Subject<void>();
  allFournisseurs: Fournisseur[] = [];
  allowMultipleEtapes: boolean = false;
  typePFMarcheOptions: typePFMarche[] = [];
  isMarcheValid: boolean = false;
  isMarcheAdded: boolean = false;
  isFormValid: boolean = false;
  numMarche: number | null = null;
  selectedBanque: any;
  banquesModifs: Banque[] = [];
  isEditing: boolean = false;
  loadingError: string | null = null;
  prmLots: PrmLot[] = [];
  prmGaranties: TypeGarantie[] = [];
  isDisabledDesignationPrm: boolean = true;
  selectedPrmLots: Set<string> = new Set();
  selectedPrmGaranties: Set<any> = new Set();
  lotSelected: boolean = false;
  isMrcLotSaved: boolean = false;
  isResetButtonDisabled: boolean = false;
  selectedLots: Set<string> = new Set();
  selectedLotNumero: string = '';
  selectedEtapeNumero: string = '';
  searchPrmTermControls: FormControl[] = [];

  constructor(
    public dialogRef: MatDialogRef<MarcheAddEditComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private banqueService: BanqueService,
    private marcheService: MarcheService,
    private PrmTypePayMrcService: PrmtypepaymrcService,
    private _dialogRef: MatDialogRef<MarcheAddEditComponent>,
    private fournisseurService: FournisseurService,
    private etapeService: EtapeService,
    private prmStructureService: PrmstructureService,
    private prmModePenService: PrmmodepenService,
    private prmTypeLotService: PrmtypelotService,
    private prmLotService: PrmlotService,
    private mrcLotsService: MrclotService,
    private mrcArticleService: MrcarticleService,
    public _spinnerService: SpinnerService,
    private prmGarantiesService: TypeGarantieService,
    private mrcGarantieService: MrcGarantieService,
    private _coreService: CoreService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      designation: [''],
      searchTerm: [''],
      searchTermStructure: [''],
      searchPrmTerm: [''],
      allowMultipleEtapes: [false],
      marche: this.fb.group({
        //--------------marche--------------//
        dateMarche: ['', Validators.required],
        dateNotif: ['', Validators.required],
        dateEnreg: ['', Validators.required],
        dateConAdmin: ['', Validators.required],
        dateCm: [''],
        exercice: [{ value: '', disabled: this.isEditing }, [Validators.required, Validators.min(1000), Validators.max(9999)]],
        designation: ['', Validators.required],
        numMin: [{ value: '01', disabled: true }, [Validators.required, Validators.maxLength(2)]],
        typePFMarche: ['', Validators.required],
        numBanque: ['', Validators.required],
        dureeContract: ['', [Validators.min(0)]],
        numAvMarche: ['', [Validators.minLength(0), Validators.maxLength(13)]],
        rib: ['', ribValidator()],
        idFourn: ['', Validators.required],
        //--------------details du marche--------------//
        idStructure: ['', Validators.required],
        //-----------Cooordonnée penalité-------//
        pctMaxPenalite: [{ value: null, disabled: true }, [Validators.min(0), Validators.max(10)]],
        tauxPenJ: [{ value: null, disabled: true }, [Validators.min(0), Validators.max(99.99)]],
        montantPenJ: [{ value: null, disabled: true }],
        exPen: [0],
        idModePen: [3, Validators.required],
        pctRetTva: ['', [Validators.min(0), Validators.max(50)]],
        pctRetGar: ['', [Validators.min(0), Validators.max(10)]],
        pctRetIr: ['', [Validators.min(0), Validators.max(10)]],
        pctVdm: ['', [Validators.min(0), Validators.max(99.99)]],
        pctMaxVdm: ['', [Validators.min(0), Validators.max(99.99)]],
        pctTva: ['', [Validators.min(0), Validators.max(99)]],
        pctRemise: ['', [Validators.min(0), Validators.max(99.99)]],
        pctAvancePay: ['', [Validators.min(0), Validators.max(99.99)]],
        pctRetAv: ['', [Validators.min(0), Validators.max(99.99)]],
        dureeAvance: []
        //mntMarche: [{ value: null, disabled: true },Validators.required],
        //mntMrcApresAvenant: [{ value: null, disabled: true },Validators.required]
      }, {
        validators: [DateComparisonValidator.validateDateComparisons(), PctVdmMaxValidator.validate()]
      }),
      //--------------fournisseur--------------//
      fournisseur: this.fb.group
        ({
          matriculeFisc: [{ value: '', disabled: true }],
          finFourn: [{ value: '', disabled: true }]
        }),
      structure: this.fb.group
        ({
          numStructure: [{ value: '', disabled: true }],
          designation: [{ value: '', disabled: true }]
        }),
      //--------------etape--------------//
      etapes: this.fb.array([], { asyncValidators: [validateurEtape()] }),
      mrclots: this.fb.array([], { asyncValidators: [validateurMrcLot()] }),
      mrcgaranties: this.fb.array([], { asyncValidators: [validateurMrcGarantie()] })
    });

    this.searchStructureTermControl.valueChanges
      .pipe(
        debounceTime(200),
        filter(search => !!search),
        tap(() => this.searching = true),
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        this.searching = false;
      });
  }

  ngOnInit(): void {
    const dateControls = [
      'dateCm',
      'dateConAdmin',
      'dateMarche',
      'dateNotif'
    ];
    dateControls.forEach(controlName => {
      this.marcheGroup.get(controlName)?.valueChanges.subscribe(() => {
        this.marcheGroup.updateValueAndValidity();
      });
    });
    this.etapes.valueChanges.subscribe(() => {
      this.updateAllowMultipleEtapes();
    });
    this.getBanques();
    this.getPrmTypePayMrcs();
    this.loadFournisseurs()
    this.getAllStructures();
    this.initializeStructureFromSessionStorage();
    this.getPenalites();
    this.getPrmLots();
    this.getPrmGaranties();
    if (this.data) {
      console.log(this.data)
      this.numMarche = this.data.marche.id;
      console.log(this.numMarche)
      this.loadMarcheData(this.data.marche.id);
      this.onPenaliteChange(this.data.marche.exPen);
      this.loadMrcGaranties(this.data.marche.id);
    }
  }

  initializeStructureFromSessionStorage() {
    const numStructure = sessionStorage.getItem('NumStruct');
    this.NumStructureControl.setValue(numStructure);
    const designation = sessionStorage.getItem('Designation');
    this.DesigantionStructureControl.setValue(designation);
    this.structureControl.setValue(numStructure);
    this.structureControl.disable();
  }

  updateAllowMultipleEtapes(): void {
    const etapesArray = this.etapes.controls;

    if (etapesArray.length >= 2) {
      this.form.get('allowMultipleEtapes')?.setValue(true);
    } else {
      this.form.get('allowMultipleEtapes')?.setValue(false);
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  onNoClick(): void {
    this._dialogRef.close(true)
  }

  selectedIndexChange(val: number) {
    this.selectedIndex = val;
    console.log(this.selectedIndex)
    if (val == 2) {
      this.isResetButtonDisabled = false;
      this.isMrcLotSaved = false;
    }
  }

  onBanqueSelect(selectedBanque: any): void {
    console.log('Banque sélectionnée:', selectedBanque);
    this.banqueControl.setValue(selectedBanque);
    const selectedbanqueOb = this.banques.find(option => option.id === selectedBanque);
    console.log(selectedbanqueOb)
  }

  resetBanqueSelection(): void {
    this.banques = [];
    this.form.get("marche")?.get("numBanque")?.setValue('');
    this.getBanques();
  }

  onPrmTypePayMrcSelect(selectedPrmTypePayMrc: any): void {
    console.log('PrmTypePayMrc sélectionnée:', selectedPrmTypePayMrc);
  }

  resetPrmTypePayMrcSelection(): void {
    this.typePFMarcheOptions = [];
    this.form.get("marche")?.get("typePFMarche")?.setValue('');
    this.getPrmTypePayMrcs();
  }

  onStructureSelect(selectedStructure: any): void {
    console.log('Structure sélectionnée:', selectedStructure);
    console.log(selectedStructure)
    const selectedStructureOb = this.structures.find(option => option.numStruct === selectedStructure);
    console.log(selectedStructureOb)
    if (selectedStructureOb) {
      this.form.get('structure')?.patchValue({
        numStructure: selectedStructureOb.numStruct ? selectedStructureOb.numStruct : 'Absence de Numero structure',
        designation: selectedStructureOb.designation ? selectedStructureOb.designation : 'Absence Desigantion de la structure',
      });
    }
  }

  resetStructureSelection(): void {
    console.log(this.form)
    this.structureControl.setValue('');
    this.DesigantionStructureControl?.reset();
    this.NumStructureControl?.reset();
    this.structures = [];
    this.pageIndex = 0
    this.getAllStructures();
  }

  getAllStructures() {
    this.isLoading = true;
    this.prmStructureService.getPrmStructures().subscribe({
      next: (res) => {
        this.structures = res;
      },
      error: (err) => console.error(err),
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onScrollStructures(event: any): void {
    const target = event.target;
    const bottom = target.scrollHeight === target.scrollTop + target.clientHeight;

    if (bottom && !this.isLoading) {
      this.pageIndex++;
      this.getAllStructures();
    }
  }

  matchesSearchStructureTerm(structure: any, searchTerm: string): boolean {
    if (!searchTerm) return true;
    const lowerCaseTerm = searchTerm.toLowerCase();
    return structure.numStruct.toString().includes(lowerCaseTerm) ||
      (structure.designation && structure.designation.toLowerCase().includes(lowerCaseTerm));
  }

  matchesSearchPrmTerm(prmLot: any, searchTerm: string): boolean {
    if (!prmLot) return false;
    if (!searchTerm) return true;
    console.log(prmLot)
    const lowerCaseTerm = searchTerm.toLowerCase();
    return prmLot.designation?.toLowerCase().includes(lowerCaseTerm);
  }

  areAllEtapesValid(): boolean {
    return this.etapes.controls.every((etape: AbstractControl) => {
      return (etape as FormGroup).valid;
    });
  }

  openConfirmEtapeDialog(numEtape: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de Suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cette etape ?',
        confirmButtonText: 'Supprimer',
        isDeleteAction: true

      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeEtape(numEtape);
      }
    });
  }

  openConfirmDialogMrcLot(index: number): void {
    const mrcLot = this.data?.mrclots[index];
    const numMarche = mrcLot?.id?.numMarche;
    const idLot = mrcLot?.id?.idLot;
    if (numMarche && idLot) {
      const mrcArticles$ = this.mrcArticleService.getMrcArticles(numMarche, idLot);
      forkJoin([mrcArticles$]).subscribe(
        ([mrcArticles]) => {
          const hasArticles = mrcArticles && mrcArticles.length > 0;
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: 'Confirmation de Suppression',
              message: hasArticles
                ? 'Le lot comporte des articles. Veuillez les supprimer avant de procéder à la suppression du lot.'
                : 'Êtes-vous sûr de vouloir supprimer ce lot ?',
              disableDeleteButton: hasArticles,
              confirmButtonText: 'Supprimer',
              isDeleteAction: true
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result && !hasArticles) {
              this.removeMrcLot(index);
            }
          });
        },
        error => {
          console.error('Erreur lors de la récupération des données:', error);
        }
      );
    } else {
      const mrcLotControl = this.mrclots.at(index);
      const removedMrcLot = mrcLotControl.get('idLot')?.value;
      this.mrclots.removeAt(index);
      this.selectedPrmLots.delete(removedMrcLot!)
    }
  }

  resetDesignationMrclotSelection(index: number): void {
    const mrcLotControl = this.mrclots.at(index);

    // Réinitialiser les valeurs
    if (mrcLotControl.get('isNew')?.value) {
      mrcLotControl.get('idLot')?.setValue(null);
      mrcLotControl.get('idTypeLot')?.setValue(null);
      mrcLotControl.get('selected')?.setValue(false)
      this.selectedPrmLots.delete(mrcLotControl.get('idPrmLot')?.value);
      mrcLotControl.get('idPrmLot')?.setValue(null);
      // Activer les champs pour pouvoir les réutiliser
      mrcLotControl.get('idLot')?.enable();
      mrcLotControl.get('idTypeLot')?.enable();
      console.log(mrcLotControl);
    }
  }

  addEtape(): void {
    const newNumEtape = this.etapes.length > 0
      ? Math.max(...this.etapes.controls.map(control => control.get('numEtape')?.value)) + 1
      : 1; // Commence à 1 si aucune étape n'existe

    const etapeGroup = this.fb.group({
      numEtape: [newNumEtape], // Attribuer le nouveau numEtape
      designation: ['', Validators.required],
      dureePrev: [null, Validators.required],
      pctPaiement: [null,
        [
          Validators.min(0),
          Validators.max(99.99),
          Validators.pattern(/^\d{1,2}([,.]\d{1,2})?$/)
        ]],
      selectedEtape: [false]
    });

    this.etapes.push(etapeGroup);
    this.cdr.detectChanges();
  }

  setEtapes(etapesData: any[]): void {
    const etapesFormArray = this.etapes;
    etapesFormArray.clear();
    etapesData.forEach(etape => {
      const etapeGroup = this.fb.group({
        numEtape: [etape.id.numEtape],
        designation: [etape.designation],
        dureePrev: [etape.dureePrev],
        pctPaiement: [this.convertToValidNumber(etape.pctPaiement),
        [
          Validators.min(0),
          Validators.max(99.99),
          Validators.pattern(/^\d{1,2}([,.]\d{1,2})?$/)
        ]],
        selectedEtape: [false]
      });
      etapesFormArray.push(etapeGroup);
    });
  }

  convertToValidNumber(value: any): any {
    if (typeof value === 'string') {
      // Remplace la virgule par un point
      value = value.replace(',', '.');
    }
    return value;
  }

  onSaveOrUpdateEtape(): void {
    if (this.etapes.valid) {
      if (this.numMarche !== null) {
        const etapesFormatted = this.etapes.value.map((etape: any) => ({
          id: {
            numMarche: this.numMarche,
            numEtape: etape.numEtape,
          },
          designation: etape.designation,
          dureePrev: etape.dureePrev,
          pctPaiement: etape.pctPaiement
        }));
        const request: MrcEtapeRequest = {
          numMarche: this.numMarche,
          etapes: etapesFormatted
        };

        this.etapeService.saveOrUpdateEtapes(request).subscribe(
          (savedEtapes: MrcEtape[]) => {
            console.log('Étapes sauvegardées ou mises à jour:', savedEtapes);
            if (this.isEditing) {
              this._coreService.openSnackBar("Etape Modifié", "OK");
              this.selectedIndex = 3;
            } else {
              this._coreService.openSnackBar("Etape Ajouté", "OK");
              this.selectedIndex = 3;
            }
            this.loadEtapesAndMrcLotsForMarche(request.numMarche);

          },
          error => {
            console.error('Erreur lors de la sauvegarde des étapes:', error);
            this.loadingError = this.isEditing
              ? 'Erreur lors de la modification des étapes.'
              : 'Erreur lors de l\'ajout des étapes.';

          }
        );
      } else {
        console.error('Le numéro de marché est null.');
        this.loadingError = 'Erreur : Le numéro de marché est introuvable.';
      }
    } else {
      console.log('Étapes invalides');
    }
  }

  openConfirmSaveOrUpdateEtapeDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.isEditing ? 'Confirmation de Modification' : 'Confirmation d\'Ajout',
        message: this.isEditing
          ? 'Êtes-vous sûr de vouloir soumettre cette étape ?'
          : 'Êtes-vous sûr de vouloir soumettre cette étape ?',
        confirmButtonText: this.isEditing ? 'Soumettre' : 'Soumettre'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onSaveOrUpdateEtape();
      }
    });
  }

  loadEtapesAndMrcLotsForMarche(marcheId: number): void {
    const etapeObservable = this.etapeService.getEtapesForMarche(marcheId);
    const mrcLotsObservable = this.mrcLotsService.getMrcLotsForMarche(marcheId);

    forkJoin([etapeObservable, mrcLotsObservable]).subscribe(
      ([etapes, mrcLots]) => {
        this.setEtapes(etapes);
        this.setMrclots(mrcLots);
        console.log('MrcLots récupérés:', mrcLots);
        console.log('etapes récupérés:', etapes);
      },
      error => {
        console.error('Erreur lors de la récupération des étapes et des MrcLots:', error);
      }
    );
  }

  removeEtape(index: number): void {
    const etapeControl = this.etapes.at(index);
    const designation = etapeControl.get('designation')?.value;
    const removedEtape = etapeControl.get('numEtape')?.value;
    const numMarche = this.numMarche;

    if (index < this.etapes.length - 1) {
      this._coreService.openSnackBar('Impossible de supprimer cette étape car elle n\'est pas la dernière.', 'Ok');
      return;
    }
    if (designation === '') {
      this.etapes.removeAt(index);
    }
    // Vérifiez que numMarche et removedEtape ne sont pas null
    if (numMarche !== null && removedEtape !== null) {
      // Suppression de l'étape via le service
      if (designation) {
        this.etapeService.deleteEtapeMarche(numMarche, removedEtape).subscribe(() => {
          this.etapes.removeAt(index);
          this._coreService.openSnackBar('Etape Supprimé', 'Ok');
          console.log(`Étape ${removedEtape} supprimée`);
        }, error => {
          console.error('Erreur lors de la suppression de l\'étape:', error);
          this.loadingError = 'Erreur de suppression de l`étape.';
          setTimeout(() => {
            this.loadingError = null; // Réinitialise l'erreur
          }, 3000);
        });
      }
    }
    else {
      console.error('Erreur: numMarche ou removedEtape est null.');
      this.loadingError = 'Erreur: numMarche introuvable.';
    }
  }

  removeMrcLot(index: number): void {
    console.log(index)
    const mrcLotControl = this.mrclots.at(index);
    const removedMrcLot = mrcLotControl.get('idLot')?.value;
    const numMarche = this.numMarche;

    // Vérifiez que numMarche et removedEtape ne sont pas null
    if (numMarche !== null && removedMrcLot !== null && removedMrcLot !== undefined) {
      // Suppression de l'étape via le service
      this.mrcLotsService.deleteMrcLot(numMarche, removedMrcLot).subscribe(() => {
        this.mrclots.removeAt(index);
        this.selectedPrmLots.delete(removedMrcLot);
        this._coreService.openSnackBar('Etape Supprimé', 'Ok');
        console.log(`MrcLot ${removedMrcLot} supprimée`);
        this.dialogRef.close(true)
      }, error => {
        console.error('Erreur lors de la suppression du marche Lot:', error);
        this.loadingError = 'Erreur de suppression du marche lot.';
        setTimeout(() => {
          this.loadingError = null; // Réinitialise l'erreur
        }, 3000);
      });
    }
    else {
      console.error('Erreur: numMarche ou removedEtape est null.');
      this.loadingError = 'Erreur: numMarche introuvable.';
      setTimeout(() => {
        this.loadingError = null; // Réinitialise l'erreur
      }, 3000);
    }
  }

  recalculateEtapeNumbers(): void {
    this.etapes.controls.forEach((etapeControl, index) => {
      etapeControl.get('numEtape')?.setValue(index + 1); // Mettre à jour numEtape avec l'index + 1
    });
  }



  openConfirmSaveMrcLotDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation d\'Ajout',
        message: 'Êtes-vous sûr de vouloir soumettre les lots introduits/modifiés récemment ?',
        confirmButtonText: 'Soumettre'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onSaveMrcLot();
      }
    });
  }

  addMrcLot(): void {
    this.mrclots.controls.forEach(control => {
      control.get('selected')?.setValue(false);
    });
    const newMrcLotGroup = this.fb.group({
      idLot: [{ value: null, disabled: true }], // Désactivé par défaut
      idTypeLot: [{ value: null, disabled: true }], // Désactivé par défaut
      designation: [null],
      idPrmLot: [{ value: null, disabled: !this.isDisabledDesignationPrm }, Validators.required],
      selected: [false],
      isNew: [true]
    });
    this.mrclots.push(newMrcLotGroup);
  }

  setMrclots(mrclotsData: any[]): void {
    const mrcLotsFormArray = this.mrclots;
    mrcLotsFormArray.clear();
    this.selectedPrmLots.clear();
    mrclotsData.forEach(mrclot => {
      console.log(mrclot);
      const mrcLotGroup = this.fb.group({
        idLot: [{ value: mrclot.idPrmLot.idLot, disabled: true }],
        idTypeLot: [{ value: mrclot.idTypeLot.designation, disabled: true }],
        designation: [mrclot.designation],
        idPrmLot: [{ value: mrclot.idPrmLot.idLot, disabled: this.isDisabledDesignationPrm }, Validators.required],
        selected: [false],
        numMarche: [mrclot.numMarche || null],
        idPrmLotDetails: [mrclot.idPrmLot || null],
        idTypeLotDetails: [mrclot.idTypeLot || null],
        isNew: [false]
      });
      console.log(mrcLotGroup)
      this.selectedPrmLots.add(mrclot.idPrmLot.idLot);
      mrcLotsFormArray.push(mrcLotGroup);
    });
  }

  onSaveMrcLot(): void {
    if (this.numMarche !== null) {
      const mrcLotDtos: MrcLotDto[] = this.mrclots.getRawValue().map((lot: any) => ({
        idLot: lot.idLot,
        designation: lot.designation
      }));
      console.log(mrcLotDtos);
      this.mrcLotsService.saveMrcLots(this.numMarche, mrcLotDtos).subscribe(
        (savedMrcLots: MrcLot[]) => {
          console.log('MrcLots sauvegardées:', savedMrcLots);
          this._coreService.openSnackBar("Marché Lot Ajouté", "OK");
          this.isMrcLotSaved = true;
          this.mrclots.controls.forEach(control => {
            control.get('idPrmLot')?.disable(); // Disable the idPrmLot control
          });
          this._dialogRef.close(true)
        },
        error => {
          console.error('Erreur lors de la sauvegarde des MrcLots:', error);
          this.loadingError = 'Erreur lors de l\'ajout des marchés lots.';
        }
      );
    } else {
      console.error('Le numéro de marché est null.');
      this.loadingError = 'Erreur : Le numéro de marché est introuvable.';
    }
  }

  isSubmitDisabled(): boolean {
    return this.mrclots.controls.some(control =>
      control.get('idPrmLot')?.invalid
    );
  }

  isNewMrclot(): boolean {
    return this.mrclots.controls.some(control => control.get('isNew')?.value);
  }

  onSaveMarche(): void {
    console.log(this.fournisseurControl.value)
    console.log(this.typePFMarcheControl.value)
    if (this.form.get('marche')?.valid && this.fournisseurControl.value) {
      this.isMarcheValid = true;
      this.form.get('marche')?.disable();
      this.form.get('fournisseur')?.disable();
      this.selectedIndex = 1;
      const selectedTypePFMarche = this.typePFMarcheOptions.find(option => option.id === this.typePFMarcheControl.value);
      const selectedBanque = this.banques.find(option => option.id === this.banqueControl.value);
      //----------------------------
      const marcheData = {
        dateCm: this.dateCMControl.value,
        dateConAdmin: this.dateConAdminControl.value,
        dateEnreg: this.dateEnregControl.value,
        dateMarche: this.dateMarcheControl.value,
        dateNotif: this.dateNotifControl.value,
        designation: this.designationControl.value,
        dureeContract: this.dureeContractControl.value,
        exercice: this.exerciceControl.value,
        numAvMarche: this.numAvantMarcheControl.value,
        numMin: this.numMinControl.value,
        rib: this.ribControl.value,
        typePFMarche: selectedTypePFMarche,
        idFourn: this.fournisseurControl.value,
        numBanque: selectedBanque,
        idStructure: { numStruct: this.structureControl.value },
        exPen: this.ExPenControl.value,
        pctMaxPenalite: this.pctMaxPenaliteControl.value,
        tauxPenJ: this.tauxPenJControl.value,
        montantPenJ: this.montantPenJControl.value,
        idModePen: { idModePen: this.IdModePenControl.value },
        pctRetTva: this.pctRetTvaControl.value,
        pctRetGar: this.pctRetGarControl.value,
        pctRetIr: this.pctRetIrControl.value,
        pctVdm: this.pctVdmControl.value,
        pctMaxVdm: this.pctMaxVdmControl.value,
        pctTva: this.pctTvaControl.value,
        pctRemise: this.pctRemiseControl.value,
        pctAvancePay: this.pctAvancePayControl.value,
        pctRetAv: this.pctRetenueAvancePayControl.value,
        dureeAvance: this.dureeAvanceControl.value
      };

      console.log('Marche Data:', marcheData);
      this.marcheService.addMarche(marcheData).subscribe(response => {
        this.numMarche = response.id
        console.log('Marche ajouté avec succès:', response);
        this._coreService.openSnackBar("Marché ajouté", "OK");
        this.isMarcheAdded = true;  // Cette variable indique que l'ajout a été effectué avec succès
      }, error => {
        console.error('Erreur lors de l\'ajout du marché:', error);
        this.form.get('marche')?.enable();
        this.form.get('fournisseur')?.enable();
        this.loadingError = 'Erreur lors de la sauvegarde du marché.';
        this.selectedIndex = 0;
      }
      );
    } else {
      this.form.get('marche')?.enable();
      this.form.get('fournisseur')?.enable();
      console.error('Le formulaire de marché n\'est pas valide.');
      this.loadingError = 'Le formulaire de marché n\'est pas valide.';
      this.selectedIndex = 0;
    }
  }

  onUpdateMarche(): void {
    console.log(this.fournisseurControl.value)
    if (this.form.get('marche')?.valid && this.fournisseurControl.value) {
      this.isMarcheValid = true;
      const selectedTypePFMarche = this.typePFMarcheOptions.find(option => option.id === this.typePFMarcheControl.value);
      const selectedBanque = this.banques.find(option => option.id === this.banqueControl.value);

      const marcheData = {
        id: this.numMarche, // Assurez-vous d'inclure l'ID du marché à mettre à jour
        dateCm: this.dateCMControl.value,
        dateConAdmin: this.dateConAdminControl.value,
        dateEnreg: this.dateEnregControl.value,
        dateMarche: this.dateMarcheControl.value,
        dateNotif: this.dateNotifControl.value,
        designation: this.designationControl.value,
        dureeContract: this.dureeContractControl.value,
        exercice: this.exerciceControl.value,
        numAvMarche: this.numAvantMarcheControl.value,
        numMin: this.numMinControl.value,
        rib: this.ribControl.value,
        typePFMarche: selectedTypePFMarche,
        idFourn: this.fournisseurControl.value,
        numBanque: selectedBanque,
        idStructure: { numStruct: this.structureControl.value },
        exPen: this.ExPenControl.value,
        pctMaxPenalite: this.pctMaxPenaliteControl.value,
        tauxPenJ: this.tauxPenJControl.value,
        montantPenJ: this.montantPenJControl.value,
        idModePen: { idModePen: this.IdModePenControl.value },
        pctRetTva: this.pctRetTvaControl.value,
        pctRetGar: this.pctRetGarControl.value,
        pctRetIr: this.pctRetIrControl.value,
        pctVdm: this.pctVdmControl.value,
        pctMaxVdm: this.pctMaxVdmControl.value,
        pctTva: this.pctTvaControl.value,
        pctRemise: this.pctRemiseControl.value,
        pctAvancePay: this.pctAvancePayControl.value,
        pctRetAv: this.pctRetenueAvancePayControl.value,
        dureeAvance: this.dureeAvanceControl.value
      };
      console.log('Marche Data:', marcheData);
      this.marcheService.updateMarche(marcheData).subscribe(response => {
        console.log('Marché mis à jour avec succès:', response);
        this._coreService.openSnackBar("Marché modifié", "OK")
      }, error => {
        console.error('Erreur lors de la mise à jour du marché:', error);
        this.loadingError = 'Erreur lors de la mise à jour du marché.';
        this.selectedIndex = 1;
      });
    } else {
      console.error('Le formulaire de marché n\'est pas valide.');
      this.loadingError = 'Le formulaire de marché n\'est pas valide.';
      this.selectedIndex = 0;
    }
  }

  openConfirmUpdateMarcheDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de modficiation',
        message: 'Êtes-vous sûr de vouloir modifier ce marché ?',
        confirmButtonText: 'Modifier',
        isDeleteAction: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onUpdateMarche();
      }
    });
  }

  openConfirmSaveMarcheDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de soumission du marché',
        message: 'Êtes-vous sûr de vouloir soumettre ce marché ?',
        confirmButtonText: 'Soumettre',
        isDeleteAction: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onSaveMarche();
      }
    });
  }

  getPrmTypePayMrcs() {
    this.isLoading = true;
    this.PrmTypePayMrcService.getPrmTypePayMrcs().subscribe({
      next: (res) => {
        this.typePFMarcheOptions = res;
      },
      error: (err) => console.error(err),
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getBanques() {
    this.isLoading = true;
    this.banqueService.getbanques().subscribe({
      next: (res) => {
        this.banques = res;
      },
      error: (err) => console.error(err),
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /*   getPrmLots() {
      this.prmLotService.getPrmLots().subscribe(data => {
        this.prmLots = data;
        this.initializeSearchControls();
      });
    } */

  getPrmLots() {
    const matriculeStr = sessionStorage.getItem('Matricule');

    if (!matriculeStr) {
      console.error("Matricule introuvable dans sessionStorage");
      return;
    }

    const matricule = Number(matriculeStr); // convertit le string en number

    this.prmLotService.getPrmLotsByMatricule(matricule).subscribe({
      next: (data) => {
        this.prmLots = data;
        this.initializeSearchControls();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des lots', err);
      }
    });
  }

  getPrmGaranties() {
    this.prmGarantiesService.getTypeGarantiesList().subscribe(data => {
      this.prmGaranties = data;
      console.log(this.prmGaranties)
    });
  }

  initializeSearchControls(): void {
    this.searchPrmTermControls = this.prmLots.map(() => new FormControl(''));
  }

  loadMarcheData(marcheId: number): void {
    this.marcheService.getMarcheById(marcheId).subscribe((marcheData: Marche) => {
      const fournisseurId = marcheData.idFourn?.id;  // L'ID du fournisseur sélectionné dans le marché
      this.selectedFournisseur = this.fournisseurs.find(f => f.id === fournisseurId);
      if (!this.selectedFournisseur) {
        this.loadFournisseurById(fournisseurId);
      }
      this.form.get('marche')?.patchValue({
        dateCm: new Date(new Date(marcheData.dateCm).setDate(new Date(marcheData.dateCm).getDate() + 1)),
        dateConAdmin: new Date(new Date(marcheData.dateConAdmin).setDate(new Date(marcheData.dateConAdmin).getDate() + 1)),
        dateEnreg: new Date(new Date(marcheData.dateEnreg).setDate(new Date(marcheData.dateEnreg).getDate() + 1)),
        dateMarche: new Date(new Date(marcheData.dateMarche).setDate(new Date(marcheData.dateMarche).getDate() + 1)),
        dateNotif: new Date(new Date(marcheData.dateNotif).setDate(new Date(marcheData.dateNotif).getDate() + 1)),
        designation: marcheData.designation,
        dureeContract: marcheData.dureeContract,
        exercice: marcheData.exercice,
        numAvMarche: marcheData.numAvMarche,
        numMin: marcheData.numMin,
        rib: marcheData.rib,
        idFourn: this.selectedFournisseur ? this.selectedFournisseur : fournisseurId || null,
        typePFMarche: marcheData.typePFMarche.id,
        numBanque: marcheData.numBanque.id,
        idStructure: marcheData.idStructure.numStruct,
        //-----Coordonnée Penalité--//
        exPen: marcheData.exPen,
        pctMaxPenalite: marcheData.pctMaxPenalite,
        tauxPenJ: marcheData.tauxPenJ,
        montantPenJ: marcheData.montantPenJ,
        idModePen: marcheData.idModePen?.idModePen,
        //----------Pourcentage------//
        pctRetTva: marcheData.pctRetTva,
        pctRetGar: marcheData.pctRetGar,
        pctRetIr: marcheData.pctRetIr,
        pctVdm: marcheData.pctVdm,
        pctMaxVdm: marcheData.pctMaxVdm,
        pctTva: marcheData.pctTva,
        pctRemise: marcheData.pctRemise,
        pctAvancePay: marcheData.pctAvancePay,
        pctRetAv: marcheData.pctRetAv,
        dureeAvance: marcheData.dureeAvance
        //mntMarche: marcheData.mntMarche,
        //mntMrcApresAvenant: marcheData.mntMrcApresAvenant,
      });
      this.form.get('fournisseur')?.patchValue({
        matriculeFisc: this.data.fournisseur?.matriculeFisc || 'Absence Matricule Fiscale',
        finFourn: this.data.fournisseur?.finFourn || 'Absence Numéro Fournisseur Financier'
      });
      this.form.get('structure')?.patchValue({
        numStructure: this.data.structure.numStruct || 'Absence numéro structure',
        designation: this.data.structure.designation || 'Absence Designation structure'
      });
      this.isEditing = true;
      this.exerciceControl.disable();
      this.loadEtapesAndMrcLotsForMarche(marcheId);
    }, error => {
      console.error('Erreur lors de la récupération des données du marché:', error);
    });

  }

  onPenaliteChange(value: number) {
    if (value === 1) {
      this.montantPenJControl.enable();
      this.tauxPenJControl.enable();
      this.pctMaxPenaliteControl.enable();
    } else {
      this.montantPenJControl.disable();
      this.montantPenJControl.setValue('');
      this.tauxPenJControl.disable();
      this.tauxPenJControl.setValue('');
      this.pctMaxPenaliteControl.disable();
      this.pctMaxPenaliteControl.setValue('');

    }
  }

  onPenaliteAppliqueChange(value: number) {
    console.log(value)
  }

  onPrmLotChange(selectedPrmLot: any, index: number): void {
    const mrcLotGroup = this.mrclots.at(index) as FormGroup;
    const selectedPrmLotOb = this.prmLots.find(option => option.idLot === selectedPrmLot);
    console.log(selectedPrmLotOb)
    if (selectedPrmLotOb) {
      // Mettre à jour les valeurs
      mrcLotGroup.get('idLot')?.setValue(selectedPrmLotOb.idLot);
      mrcLotGroup.get('idTypeLot')?.setValue(selectedPrmLotOb.idTypeLot?.designation || null);
      // Activer les champs idLot et idTypeLot
      mrcLotGroup.get('idLot')?.disable();
      mrcLotGroup.get('idTypeLot')?.disable();

      // Ajouter à selectedPrmLots si idLot est défini
      this.selectedPrmLots.add(selectedPrmLotOb.idLot);
    } else {
      // Gérer le cas où aucune option valide n'est sélectionnée
      mrcLotGroup.get('idLot')?.setValue(null);
      mrcLotGroup.get('idTypeLot')?.setValue(null);
      mrcLotGroup.get('idPrmLot')?.setValue(null);
      this.selectedPrmLots.delete(selectedPrmLot);
    }
  }

  getPenalites() {
    this.prmModePenService.getPrmModePens().subscribe(
      (data) => {
        this.penalites = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des pénalités', error);
      }
    );
  }

  resetButtonState() {
    this.isResetButtonDisabled = false;
    this.isMrcLotSaved = false;
  }

  openDialogMarcheArticle(selectedMrclots: any[]): void {
    console.log(selectedMrclots)
    const dialogRef = this.dialog.open(MarcheArticleComponent, {
      width: '99%',
      height: '98%',
      data: {
        selectedMrclots,
        additionalData: this.data
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Logique après la fermeture du dialogue si nécessaire
    });
  }

  gestionDesArticles(): void {
    const selectedMrclots = this.mrclots.controls
      .filter(control => control.get('selected')?.value)
      .map(control => control.value);

    if (selectedMrclots.length > 0) {
      this.openDialogMarcheArticle(selectedMrclots);
    }
  }

  onCheckboxChange(index: number, isChecked: boolean): void {
    // Désélectionner toutes les autres cases
    this.mrclots.controls.forEach((control, i) => {
      control.get('selected')?.setValue(i === index && isChecked);
      if (i === index && isChecked) {
        this.selectedLotNumero = control.get('idPrmLot')?.value; // Mettez à jour avec la désignation
      }
    });
  }

  isAnyChecked(): boolean {
    return this.mrclots.controls.some(control => control.get('selected')?.value);
  }

  resetFournisseurSelection(): void {
    console.log(this.form)
    this.form.get("marche")?.get("idFourn")?.setValue('');
    this.form.get('fournisseur')?.reset();
    this.fournisseurs = [];
    this.pageIndex = 0
    this.loadFournisseurs();
  }

  onSearchClear(): void {
    this.searchTerm = ''; // Réinitialiser le terme de recherche
    this.searchTermControl.setValue('')
    this.pageIndex = 0;  // Réinitialiser la page
    this.fournisseurs = [];  // Réinitialiser la liste des fournisseurs
    this.loadFournisseurs();  // Recharger les fournisseurs sans filtre
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.pageIndex = 0;
    this.fournisseurs = [];
    this.loadFournisseurs();
  }

  onFournisseurSelect(fournisseur: Fournisseur): void {
    console.log('Fournisseur sélectionné:', fournisseur);
    this.form.get('marche.idFourn')?.setValue(fournisseur);
    const fournisseurIndex = this.fournisseurs.findIndex(f => f.id === fournisseur.id);
    if (fournisseurIndex === -1) {
      this.loadFournisseurById(fournisseur.id);
    }
    this.selectedFournisseur = fournisseur;
    this.form.get('fournisseur')?.patchValue({
      matriculeFisc: fournisseur.matriculeFisc,
      finFourn: fournisseur.finFourn
    })
  }

  loadFournisseurs(): void {
    // S'assurer que l'état de chargement est actif
    this.isLoading = true;

    this.fournisseurService.getFournisseursOptions(this.pageIndex, this.searchTerm).subscribe(response => {
      // Ajout des nouveaux fournisseurs sans doublon
      const newFournisseurs = response.content.filter(f =>
        !this.fournisseurs.some(existingFournisseur => existingFournisseur.id === f.id)
      );



      // Mettre à jour la liste des fournisseurs
      this.fournisseurs = [...this.fournisseurs, ...newFournisseurs];
      //this.filteredFournisseurs = this.fournisseurs.filter(f => f.id !== (this.selectedFournisseur?.id));

      this.totalPages = response.totalPages;

      // Désactiver l'état de chargement
      this.isLoading = false;
    });
  }

  onScrollFournisseurs(event: any): void {
    const element = event.target as HTMLElement;

    // Vérifie si l'utilisateur a atteint le bas de la liste et qu'il n'y a pas de requêtes en cours
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 10 && !this.isLoading) {
      // Incrémenter pageIndex pour charger la page suivante
      if (this.pageIndex < this.totalPages - 1) {
        this.pageIndex++;  // Passe à la page suivante
        this.loadFournisseurs();  // Charger les fournisseurs de la page suivante
      }
    }
  }

  loadFournisseurById(fournisseurId: number): void {
    this.fournisseurService.getFournisseurById(fournisseurId).subscribe(fournisseur => {
      // Mettre à jour la valeur du fournisseur sélectionné dans le formulaire
      this.form.get('marche.idFourn')?.setValue(fournisseur);

      // Ajouter ce fournisseur à la liste, si ce n'est pas déjà fait
      const isFournisseurPresent = this.fournisseurs.some(f => f.id === fournisseur.id);
      if (!isFournisseurPresent) {
        this.fournisseurs.unshift(fournisseur);  // Placer le fournisseur sélectionné en premier
      }

      // Mettre à jour le fournisseur sélectionné
      this.selectedFournisseur = fournisseur;

      // Mettre à jour l'affichage pour que le fournisseur sélectionné soit en premier dans la liste
      this.fournisseurs = [fournisseur, ...this.fournisseurs.filter(f => f.id !== fournisseur.id)];
    });
  }

  addMrcGarantie(): void {
    const newNumGarantie = this.mrcgaranties.length > 0
      ? Math.max(...this.mrcgaranties.controls.map(control => control.get('numGarantie')?.value)) + 1
      : 1; // Commence à 1 si aucune étape n'existe
    const newMrcGarantieGroup = this.fb.group({
      numGarantie: [{ value: newNumGarantie, disabled: true }], // Désactivé par défaut
      idPrmGarantie: [null, Validators.required],
      dateDebut: [{ value: '', disabled: false }, Validators.required],
      mntGar: ['', Validators.required],
      isNew: [true]
    });
    this.mrcgaranties.push(newMrcGarantieGroup);
  }

  setMrcGarantie(mrcGarantiesData: any[]): void {
    const mrcGarantiesFormArray = this.mrcgaranties;
    mrcGarantiesFormArray.clear();
    mrcGarantiesData.forEach(garantie => {
      console.log(garantie)
      const mrcGarantie = this.fb.group({
        numGarantie: [{ value: garantie.id.numGarantie, disabled: true }],
        idPrmGarantie: [{ value: garantie.id.idTypeGarantie, disabled: true }],
        dateDebut: [{ value: new Date(new Date(garantie.dateDebut).setDate(new Date(garantie.dateDebut).getDate())), disabled: true }],
        mntGar: [{ value: garantie.mntGar, disabled: true }],
        isNew: [false]
      });
      mrcGarantiesFormArray.push(mrcGarantie);
    });
  }

  resetDesignationMrcGarantieSelection(index: number): void {
    const mrcGarantieControl = this.mrcgaranties.at(index);
    if (mrcGarantieControl.get('isNew')?.value) {
      mrcGarantieControl.get('idPrmGarantie')?.setValue(null);
      mrcGarantieControl.get('idPrmGarantie')?.setValidators([Validators.required])
      mrcGarantieControl.updateValueAndValidity();
    }
  }

  onPrmGarantieChange(selectedPrmGarantie: any, index: number): void {
    const mrcGarantieGroup = this.mrcgaranties.at(index) as FormGroup;
    const selectedPrmGarantieOb = this.prmGaranties.find(option => option.id === selectedPrmGarantie);
    console.log(selectedPrmGarantie)
    console.log(selectedPrmGarantieOb)
    if (selectedPrmGarantie) {
      mrcGarantieGroup.get('idPrmGarantie')?.setValue(selectedPrmGarantieOb?.id);
      this.selectedPrmGaranties.add(selectedPrmGarantieOb?.id);
    } else {
      mrcGarantieGroup.get('idPrmGarantie')?.setValue(null);
      this.selectedPrmLots.delete(selectedPrmGarantie);
    }
  }

  loadMrcGaranties(numMarche: number): void {
    this.mrcGarantieService.getMrcGaranties(numMarche).subscribe(
      (mrcGarantiesData) => {
        this.setMrcGarantie(mrcGarantiesData);
      },
      (error) => {
        console.error('Error fetching MrcGarantie:', error);
      }
    );
  }

  onSaveMrcGarantie(): void {
    const mrcGarantiesToSubmit: any[] = this.mrcgaranties.getRawValue()
      .filter((mrcGarantie: any) => mrcGarantie.isNew)
      .map((mrcGarantie: any) => {
        console.log(mrcGarantie);
        const baseGarantie = {
          numMarche: this.numMarche,
          numGarantie: mrcGarantie.numGarantie,
          idTypeGarantie: mrcGarantie.idPrmGarantie,
          dateDebut: mrcGarantie.dateDebut,
          mntGar: mrcGarantie.mntGar,
        };
        console.log(baseGarantie);
        return baseGarantie;
      });

    console.log('Garanties préparées pour soumission:', mrcGarantiesToSubmit);
    if (mrcGarantiesToSubmit.length > 0) {
      this.mrcGarantieService.addMultipleMrcGaranties(mrcGarantiesToSubmit).subscribe({
        next: (response) => {
          console.log('Garanties enregistrées avec succès:', response);
          this._coreService.openSnackBar('Soumission des garanties avec succès', 'Ok');
          this.selectedIndex = 2;
        },
        error: (err) => {
          console.error('Erreur lors de l\'enregistrement des garanties:', err);
        }
      });
    } else {
      console.log('Aucune garantie à soumettre');
    }
  }

  areAllMrcGarantiesValid(): boolean {
    return this.mrcgaranties.controls.every((mrcgarantie: AbstractControl) => {
      return (mrcgarantie as FormGroup).valid;
    });
  }

  openConfirmSaveMrcGarantieDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de soumission des garanties',
        message: 'Êtes-vous sûr de vouloir soumettre ces garanties ?',
        confirmButtonText: 'Soumettre',
        isDeleteAction: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onSaveMrcGarantie();
      }
    });
  }

  removeMrcGarantie(index: number): void {
    const mrcgarantieControl = this.mrcgaranties.at(index);
    const idPrmGarantie = mrcgarantieControl.get('idPrmGarantie')?.value;
    const numGarantie = mrcgarantieControl.get('numGarantie')?.value;
    const numMarche = this.numMarche;
    if (idPrmGarantie !== null && numGarantie !== null && numMarche !== null) {
      this.mrcGarantieService.deleteGarantie(numMarche, numGarantie, idPrmGarantie).subscribe(() => {
        this.mrcgaranties.removeAt(index);
        this._coreService.openSnackBar('MrcGarantie Supprimé', 'Ok');
        console.log(`MrcGarantie ${numGarantie} supprimée`);
      }, error => {
        console.error('Erreur lors de la suppression du marche Lot:', error);
        this.loadingError = 'Erreur de suppression du marche lot.';
        setTimeout(() => {
          this.loadingError = null; // Réinitialise l'erreur
        }, 3000);
      });
    }
    else {
      console.error('Erreur: numMarche ou numGarantie ou idPrmGarantie est null.');
      this.loadingError = 'Erreur: numMarche introuvable ou numGarantie introuvable ou idPrmGarantie introuvable .';
      setTimeout(() => {
        this.loadingError = null;
      }, 3000);
    }

  }

  openDeleteConfirmDialogMrcGarantie(index: number): void {
    const mrcgarantieControl = this.mrcgaranties.at(index);
    const isNew = mrcgarantieControl.get('isNew')?.value;
    if (isNew === false) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmation de Suppression',
          message: 'Êtes-vous sûr de vouloir supprimer ce garantie ?',
          confirmButtonText: 'Supprimer',
          isDeleteAction: true
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.removeMrcGarantie(index);
        }
      });
    } else {
      this.mrcgaranties.removeAt(index); // Suppression immédiate
      this._coreService.openSnackBar('MrcGarantie supprimé localement.', 'Ok');
      console.log('Suppression immédiate sans appel au service.');
    }

  }

  onCheckboxChangeEtape(index: number, isChecked: boolean): void {
    // Désélectionner toutes les autres cases
    this.etapes.controls.forEach((control, i) => {
      control.get('selectedEtape')?.setValue(i === index && isChecked);
      if (i === index && isChecked) {
        this.selectedEtapeNumero = control.get('numEtape')?.value;
        console.log(this.selectedEtapeNumero);
        console.log(this.numMarche)
      }
    });
  }

  isAnyCheckedEtape(): boolean {
    return this.etapes.controls.some(control => control.get('selectedEtape')?.value);
  }

  gestionDesOrdresServices(): void {
    const selectedEtapes = this.etapes.controls
      .filter(control => control.get('selectedEtape')?.value)
      .map(control => control.value);
    const numMarche = this.numMarche;
    if (selectedEtapes.length > 0) {
      this.openDialogEtapeOrdreService(selectedEtapes, numMarche);
    }
  }

  openDialogEtapeOrdreService(selectedEtapes: any[], numMarche: any): void {
    console.log(selectedEtapes)
    console.log(numMarche)
    const dialogRef = this.dialog.open(OrdreServiceComponent, {
      width: '99%',
      height: '95%',
      data: {
        selectedEtapes,
        numMarche: numMarche,
        additionalData: this.data
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }


  get fournisseurControl(): FormControl {
    return this.marcheGroup.get('idFourn') as FormControl
  }

  get typePFMarcheControl(): FormControl {
    return this.marcheGroup.get('typePFMarche') as FormControl
  }

  get banqueControl(): FormControl {
    return this.marcheGroup.get('numBanque') as FormControl
  }

  get numMinControl(): FormControl {
    return this.marcheGroup.get('numMin') as FormControl
  }

  get dateMarcheControl(): FormControl {
    return this.marcheGroup.get('dateMarche') as FormControl
  }

  get dateCMControl(): FormControl {
    return this.marcheGroup.get('dateCm') as FormControl
  }

  get dateNotifControl(): FormControl {
    return this.marcheGroup.get('dateNotif') as FormControl
  }

  get dateEnregControl(): FormControl {
    return this.marcheGroup.get('dateEnreg') as FormControl
  }

  get dateConAdminControl(): FormControl {
    return this.marcheGroup.get('dateConAdmin') as FormControl
  }

  get exerciceControl(): FormControl {
    return this.marcheGroup.get('exercice') as FormControl
  }

  get dureeContractControl(): FormControl {
    return this.marcheGroup.get('dureeContract') as FormControl
  }

  get designationControl(): FormControl {
    return this.marcheGroup.get('designation') as FormControl
  }

  get numAvantMarcheControl(): FormControl {
    return this.marcheGroup.get('numAvMarche') as FormControl
  }

  get ribControl(): FormControl {
    return this.marcheGroup.get('rib') as FormControl
  }

  get marcheGroup(): FormGroup {
    return this.form.get('marche') as FormGroup;
  }

  get searchTermControl(): FormControl {
    return this.form.get('searchTerm') as FormControl;
  }

  get searchStructureTermControl(): FormControl {
    return this.form.get('searchTermStructure') as FormControl;
  }

  get fournisseurGroup(): FormGroup {
    return this.form.get('fournisseur') as FormGroup;
  }

  get matriculeFiscControl(): FormControl {
    return this.fournisseurGroup.get('matriculeFisc') as FormControl;
  }

  get finFournControl(): FormControl {
    return this.fournisseurGroup.get('finFourn') as FormControl;
  }
  //etapes//
  get etapes(): FormArray {
    return this.form.get('etapes') as FormArray;
  }
  //mrcLots
  get mrclots(): FormArray {
    return this.form.get('mrclots') as FormArray;
  }
  //mrcGaranties
  get mrcgaranties(): FormArray {
    return this.form.get('mrcgaranties') as FormArray;
  }
  //details marche //

  get structureControl(): FormControl {
    return this.marcheGroup.get('idStructure') as FormControl
  }

  get structureGroup(): FormGroup {
    return this.form.get('structure') as FormGroup;
  }

  get DesigantionStructureControl(): FormControl {
    return this.structureGroup.get('designation') as FormControl;
  }

  get NumStructureControl(): FormControl {
    return this.structureGroup.get('numStructure') as FormControl;
  }

  get pctMaxPenaliteControl(): FormControl {
    return this.marcheGroup.get('pctMaxPenalite') as FormControl
  }

  get tauxPenJControl(): FormControl {
    return this.marcheGroup.get('tauxPenJ') as FormControl
  }

  get montantPenJControl(): FormControl {
    return this.marcheGroup.get('montantPenJ') as FormControl
  }

  get montantMarcheControl(): FormControl {
    return this.marcheGroup.get('mntMarche') as FormControl
  }

  get montantMarcheApresAvenantControl(): FormControl {
    return this.marcheGroup.get('mntMrcApresAvenant') as FormControl
  }

  get ExPenControl(): FormControl {
    return this.marcheGroup.get('exPen') as FormControl
  }

  get IdModePenControl(): FormControl {
    return this.marcheGroup.get('idModePen') as FormControl
  }

  get pctRetTvaControl(): FormControl {
    return this.marcheGroup.get('pctRetTva') as FormControl
  }

  get pctRetGarControl(): FormControl {
    return this.marcheGroup.get('pctRetGar') as FormControl
  }

  get pctRetIrControl(): FormControl {
    return this.marcheGroup.get('pctRetIr') as FormControl
  }

  get pctVdmControl(): FormControl {
    return this.marcheGroup.get('pctVdm') as FormControl
  }

  get pctMaxVdmControl(): FormControl {
    return this.marcheGroup.get('pctMaxVdm') as FormControl
  }

  get pctTvaControl(): FormControl {
    return this.marcheGroup.get('pctTva') as FormControl
  }

  get pctRemiseControl(): FormControl {
    return this.marcheGroup.get('pctRemise') as FormControl
  }

  get pctAvancePayControl(): FormControl {
    return this.marcheGroup.get('pctAvancePay') as FormControl
  }

  get pctRetenueAvancePayControl(): FormControl {
    return this.marcheGroup.get('pctRetAv') as FormControl
  }

  get dureeAvanceControl(): FormControl {
    return this.marcheGroup.get('dureeAvance') as FormControl
  }
}




