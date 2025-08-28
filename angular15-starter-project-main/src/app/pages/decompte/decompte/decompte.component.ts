import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MrcEtape } from 'src/app/model/mrcetape';
import { CoreService } from 'src/app/services/core/core.service';
import { EtapeService } from 'src/app/services/etape/etape.service';
import { MarcheService } from 'src/app/services/marche/marche.service';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import { DecompteAddEditComponent } from './decompte-add-edit/decompte-add-edit.component';
import { DecompteService } from 'src/app/services/decompte/decompte.service';
import { SelectMarcheDialogComponent } from '../dialog/select-marche-dialog/select-marche-dialog.component';
import { Marche } from 'src/app/model/marche';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-decompte',
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
    MatToolbarModule,
    FormsModule],
  templateUrl: './decompte.component.html',
  styleUrl: './decompte.component.scss'
})
export class DecompteComponent implements OnInit, OnDestroy{

  loadingError: string | null = null;
  form: FormGroup;
  selectedIndex = 0;
  isLoading = false;
  marches: any = [];
  isMarcheSelected: boolean = false;
  pageIndex = 0;
  pageSize = 10;
  totalResults: number = 0;
  ObjectMarche: any;
  etapes: any[]= [];
  searchTerm: string = '';
  searchTermControl: FormControl;
  numStruct: string ='';
  showDetails: boolean = false;
  decompteResults: any = {};
  tooltipText: string = '';
  selectedMarche: any;
  allMarches: Marche[] = [];

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    public _spinnerService: SpinnerService,
    private _coreService: CoreService,
    private marcheService: MarcheService,
    private etapeService: EtapeService,
    private decompteService: DecompteService,
    private cdr: ChangeDetectorRef,
  ) {
    this.searchTermControl = new FormControl('');
    this.form = this.fb.group({
    id: ['',Validators.required],
    mntMarche: [{ value: '', disabled: true }],
    mntMrcApresAvenant: [{ value: '', disabled: true }],
    designation: [{ value: '', disabled: true }],
    typeDecompte: [{ value: '', disabled: true },Validators.required],
    //dateDecompte:[''],
    numFourn: [{ value: '', disabled: true }],
    designationFourn: [{ value: '', disabled: true }],
    designationFrFourn: [{ value: '', disabled: true }],
    etape: [{ value: '', disabled: true },Validators.required],
    })
  }

  formatNombre(val: any): string {
    const num = +val;
    return !isNaN(num)
      ? num.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : '0.000';
  }
  

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.numStruct = sessionStorage.getItem('NumStruct') ?? '';
    this.loadMarches();
  }


  loadMarches() {
    this.isLoading = true;
    this.marcheService.getMarches(this.searchTerm, this.pageIndex, this.pageSize, this.numStruct)
      .subscribe(response => {
        console.log(response)
        if (this.pageIndex === 0) {
          this.marches = response.content;  // Si c'est la première page, remplacer tout
        } else {
          this.marches = [...this.marches, ...response.content];  // Sinon ajouter à la liste existante
        }
        this.totalResults = response.totalElements;  // Total des résultats pour gérer l'arrêt du défilement
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        console.error('Erreur lors de la récupération des marchés:', error);
      });
  }

  onSearchTermChange(event: any): void {
    this.searchTerm = this.searchTermControl.value;
    this.pageIndex = 0; 
    this.marches = []; 
    this.loadMarches(); 
  }

  onScroll(event: any): void {
    const element = event.target as HTMLElement;
  
    // Vérifie si l'utilisateur a atteint le bas du conteneur de la liste
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 20 && !this.isLoading) {
      if (this.marches.length < this.totalResults) {
        this.isLoading = true; 
        this.pageIndex++;  
        this.loadMarches();  
      }
    }
  }

  selectedIndexChange(val: number) {
    this.selectedIndex = val;
  }

  onSelectMarche(marche: number | Marche): void {
    const selectedMarche = typeof marche === 'number'
    ? this.marches.find(m => m.id === marche)
    : marche;
    console.log(selectedMarche)
     if (selectedMarche) {
      console.log('Marché sélectionné', selectedMarche);
      // Mise à jour des champs associés au marché
      this.form.patchValue({
        id: selectedMarche.id,
        mntMarche: selectedMarche.mntMarche || 'Absence du montant marche',
        mntMrcApresAvenant: selectedMarche.mntMrcApresAvenant || 'Absence du montant marche aprés les avenants',
        designation: selectedMarche.designation || 'Absence du designation mrche',
      });
  
      // Mise à jour des champs associés au fournisseur
      this.form.patchValue({
        numFourn: selectedMarche.idFourn?.numFourn || 'Absence du numéro fournisseur',
        designationFourn: selectedMarche.idFourn?.designation || 'Absence désignation fournisseur',
        designationFrFourn: selectedMarche.idFourn?.designationFr || 'Absence désignation francaise du fournisseur',
      });
      this.form.get('typeDecompte')?.enable();
      this.form.get('etape')?.enable();
      this.loadEtapes(selectedMarche.id);
    } 
    this.selectedMarche= selectedMarche;
    this.isMarcheSelected = !!this.form.value.id;
  }

  loadEtapes(numMarche: number): void {
    this.etapeService.getEtapesForMarche(numMarche).subscribe(
      (res) => {
        console.log(res);  
        if (Array.isArray(res)) {
          this.etapes = res;
        } else {
          console.error('Les données des étapes ne sont pas un tableau', res);
          this.etapes = [];
        }
      },
      (error) => {
        console.error('Erreur lors du chargement des étapes:', error);
        this.etapes = [];
      }
    );
  }

  loadNumberOfDecGroupByType(numMarche: number, numEtape: number){
    this.decompteService.getDecompteCountGroupedByIdTypeDecAndNumMarche(numMarche, numEtape).subscribe({
      next: (data: any) => {
        this.decompteResults = data;
        console.log(this.decompteResults);
        this.updateTooltip();
      },
      error: (error) => {
        console.error('Error fetching data', error); 
      }
    });
  }

  getDecompteTooltip(): string {
    if (this.decompteResults && Object.keys(this.decompteResults).length > 0) {
      // Construire un message avec les résultats de décompte
      let tooltipText = "";

      // Ajouter chaque type de décompte et son count, y compris ceux égaux à zéro
      for (let key in this.decompteResults) {
        if (this.decompteResults.hasOwnProperty(key)) {
          const count = this.decompteResults[key];

          // Ne pas inclure les résultats qui ont un count égal à 0
          if (count !== 0) {
            tooltipText += `${key}: ${count} \n`;  // Retour à la ligne après chaque entrée
          }
        }
      }

      // Si aucun résultat n'est ajouté, retourner un message alternatif
      if (tooltipText === "") {
        return "Aucun décompte présent dans ce marche pour l'instant";
      }

      return tooltipText;
    }

    // Retourner un message par défaut si les données ne sont pas disponibles
    return 'Aucun décompte disponible';
  }

  onSelectEtapes(selectedEtape: number): void {
    console.log('Etape sélectionnée:', selectedEtape);
    this.form.get('etapes')?.setValue(selectedEtape);
    this.loadNumberOfDecGroupByType(this.form.get('id')?.value, selectedEtape);
  }

  resetMarcheSelection(): void {
    this.form.reset();
    const numeroMarcheControl = this.form.get('id');
    numeroMarcheControl?.setValue(null);  // Utiliser null plutôt que '' pour un select
    this.form.patchValue({
      mntMarche: '',
      mntMrcApresAvenant: '',
      designation: '',
      numFourn: '',
      designationFourn: '',
      designationFrFourn: '',
      typeDecompte: '',
      etape:''
    });
    this.form.get('typeDecompte')?.disable();
    this.form.get('etape')?.disable();
    numeroMarcheControl?.markAsPristine();
    numeroMarcheControl?.markAsUntouched();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.searchTerm = '';
    this.searchTermControl.setValue('');
    this.selectedMarche = null;
    this.loadMarches();
    this.resetTooltip();
  }

  resetTooltip(): void {
    this.tooltipText = ''; 
  }

  resetEtapeSelection(): void {
    const etapeControl = this.form.get('etape');
    etapeControl?.reset();
    etapeControl?.markAsPristine();
    etapeControl?.markAsUntouched();
    this.resetTooltip();
  }

  updateTooltip(): void {
    this.tooltipText = this.getDecompteTooltip();
  }

  onClearSearchClick(): void {
    this.searchTerm = '';
    this.searchTermControl.setValue('');
    this.marches = []; 
    this.pageIndex = 0;
    this.loadMarches();
  }

  onRadioSelectionChange(event: any): void {
    const selectedValue = event.value;
    const selectedTypeDecompte = Number(selectedValue); // Convertir en nombre
    console.log(selectedTypeDecompte);  // Affichera la valeur en tant que nombre
  }

  openDialogMarcheArticle(decompte?: any): void {
    console.log(decompte)
    const dialogRef = this.dialog.open(DecompteAddEditComponent, {
      width: '80%',
      height: '80%',
      data: {
        decompte:this.form.value
      }
    });
    console.log(decompte)

    dialogRef.afterClosed().subscribe(result => {
      // Logique après la fermeture du dialogue si nécessaire
    });
  }

  openMarchesSelectionDialog(): void {
    if (!this.allMarches || this.allMarches.length === 0) {
      this.loadMarchesNoPaginandFilt().subscribe((marches: Marche[]) => {
        this.openDialogWithMarches(marches);
      });
    } else {
      this.openDialogWithMarches(this.allMarches);
    }
  }
  
  openDialogWithMarches(marches: Marche[]): void {
    const dialogRef = this.dialog.open(SelectMarcheDialogComponent, {
      width: '1500px',
      height: '800px',
      data: { marches }
    });
  
    dialogRef.afterClosed().subscribe((selectedMarche: Marche) => {
      if (selectedMarche) {
       console.log(selectedMarche)
       this.onSelectMarche(selectedMarche)
      }
    });
  }
  
  loadMarchesNoPaginandFilt(): Observable<Marche[]> {
    return this.marcheService.getMarchesNoFilterAndPagi(this.numStruct).pipe(
      tap((res: Marche[]) => this.allMarches = res)
    );
  }



}
