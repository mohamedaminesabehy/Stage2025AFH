import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';
import { CoreService } from 'src/app/services/core/core.service';
import { CustomDateAdapter } from 'src/app/services/Dateadaptater/CustomDateAdapter';
import { OrdreServService } from 'src/app/services/ordreServ/ordre-serv.service';
import { validateurOrdreService } from 'src/app/services/ordreServiceValidator/validateurOrdreService';
import { PrmTypeordreServService } from 'src/app/services/prmTypeordreServ/prm-typeordre-serv.service';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-ordre-service',
  standalone: true,
  imports: [
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
  templateUrl: './ordre-service.component.html',
  styleUrl: './ordre-service.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ]
})
export class OrdreServiceComponent implements OnInit {
  ordreServiceForm: FormGroup;
  numMarche!: number;
  numEtape!: number;
  isLoading = false;
  loadingError: string | null = null;
  selectedIndex = 0;
  prm_type_ordre_services: any[] = [];
  isIdType1Selected: boolean = false;
  selectedPrmTypeOrdreService: Set<number> = new Set();
  private _snackBar = inject(MatSnackBar);
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';


  constructor(@Inject(MAT_DIALOG_DATA) public data: { selectedEtapes: any[], numMarche: any, additionalData: any },
    private _dialogRef: MatDialogRef<OrdreServiceComponent>,
    private dialog: MatDialog,
    public _spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private ordreServService: OrdreServService,
    private prmTypeOrdreService: PrmTypeordreServService,
    private _coreService: CoreService
  ) {
    this.ordreServiceForm = this.fb.group({
      ordreservices: this.fb.array([], { asyncValidators: [validateurOrdreService()] })
    });
    this.data.selectedEtapes.forEach(ordreService => {
      this.numEtape = ordreService.numEtape;
      this.numMarche = data.numMarche;
      console.log(this.numEtape)
      console.log(this.numMarche)
    });
  };

  get ordreservices() {
    return this.ordreServiceForm.get('ordreservices') as FormArray;
  }

  ngOnInit(): void {
    this.loadPrmTypeOrdresService();
    this.loadInitialOrdresServices();
  }

  selectedIndexChange(val: number) {
    this.selectedIndex = val;
  }

  loadInitialOrdresServices() {
    this.ordreServService.getOrdreServices(this.numMarche, this.numEtape).subscribe(existingOrdreService => {
      existingOrdreService.forEach((ordreService) => {
        console.log(ordreService)
        this.addExistingOrdreService(ordreService);
      });
    })
  }

  addExistingOrdreService(ordreService): void {
    console.log(ordreService)
    const ordreServiceGroup = this.fb.group({
      id: this.fb.group({
        numMarche: [this.numMarche],
        numEtape: [this.numEtape],
        numOs: [ordreService.id?.numOs],
      }),
      idTypeOrdreService: [ordreService.idTypeOrdreService?.id, Validators.required],
      dateDebut: [new Date(new Date(ordreService.dateDebut).setDate(new Date(ordreService.dateDebut).getDate())), Validators.required],
      dateFin: [new Date(new Date(ordreService.dateFin).setDate(new Date(ordreService.dateFin).getDate()))],
      dateEditOs: [new Date(new Date(ordreService.dateEditOs).setDate(new Date(ordreService.dateEditOs).getDate()))],
      dateNotifOs: [new Date(new Date(ordreService.dateNotifOs).setDate(new Date(ordreService.dateNotifOs).getDate()))],
      designation: [ordreService.designation],
      codeOrd: [ordreService.codeOrd],
      dureeOs: [ordreService.dureeOs, Validators.required],
      isNew: [false]
    });
    ordreServiceGroup.get('idTypeOrdreService')?.valueChanges.subscribe(value => {
      console.log(value)
      this.toggleDureeOs();
    });
    ordreServiceGroup.get('dateFin')?.valueChanges.subscribe(value => {
      if (!value) {
        ordreServiceGroup.get('dateFin')?.setValue(null); // Définit null si vide
      }
    });
  
    ordreServiceGroup.get('dateEditOs')?.valueChanges.subscribe(value => {
      if (!value) {
        ordreServiceGroup.get('dateEditOs')?.setValue(null); // Définit null si vide
      }
    });
  
    ordreServiceGroup.get('dateNotifOs')?.valueChanges.subscribe(value => {
      if (!value) {
        ordreServiceGroup.get('dateNotifOs')?.setValue(null); // Définit null si vide
      }
    });
    console.log(ordreServiceGroup);
    this.ordreservices.push(ordreServiceGroup);
    this.toggleDureeOs();
  }

  addOrdreService(): void {
    const existingIds = this.ordreservices.controls.map(control => control.get('id')?.get('numOs')?.value);
    const newIdnumOS = existingIds.length > 0
      ? Math.max(...existingIds) + 1
      : 1;
    console.log(existingIds);
    console.log(newIdnumOS);

    const ordreServiceGroup = this.fb.group({
      id: this.fb.group({
        numOs: [newIdnumOS],
        numMarche: [this.numMarche],
        numEtape: [this.numEtape],
      }),
      idTypeOrdreService: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: [''],
      dateEditOs: [''],
      dateNotifOs: [''],
      designation: [''],
      codeOrd: [''],
      dureeOs: [null, Validators.required],
      isNew: [true]
    });
    ordreServiceGroup.get('idTypeOrdreService')?.valueChanges.subscribe(value => {
      console.log(value)
      this.toggleDureeOs(); // Met à jour le champ dureeOs pour tous les éléments
    });

    ordreServiceGroup.get('dateFin')?.valueChanges.subscribe(value => {
      if (!value) {
        ordreServiceGroup.get('dateFin')?.setValue(null); // Définit null si vide
      }
    });
  
    ordreServiceGroup.get('dateEditOs')?.valueChanges.subscribe(value => {
      if (!value) {
        ordreServiceGroup.get('dateEditOs')?.setValue(null); // Définit null si vide
      }
    });
  
    ordreServiceGroup.get('dateNotifOs')?.valueChanges.subscribe(value => {
      if (!value) {
        ordreServiceGroup.get('dateNotifOs')?.setValue(null); // Définit null si vide
      }
    });
    this.ordreservices.push(ordreServiceGroup);
    console.log(ordreServiceGroup)
    this.toggleDureeOs();
  }

  toggleDureeOs(): void {
    this.ordreservices.controls.forEach((control: AbstractControl, i: number) => {
      if (control instanceof FormGroup) {
        const idTypeOrdreService = control.get('idTypeOrdreService')?.value;
        const dureeOsControl = control.get('dureeOs');
        console.log(idTypeOrdreService)
        if (idTypeOrdreService === 3) {
          dureeOsControl?.enable();
        } else {
          //dureeOsControl?.setValue(null)
          dureeOsControl?.disable();
        }
      }
    });
  }


  loadPrmTypeOrdresService(): void {
    this._spinnerService.show();
    this.isLoading = true;
    this.prmTypeOrdreService.getPrmTypeOrdresService().subscribe({
      next: (response: any[]) => {
        this.prm_type_ordre_services = response;
      },
      error: (err) => {
        console.error('Error loading articles', err);
      },
      complete: () => {
        this.isLoading = false;
        this._spinnerService.hide();
      },
    });
  }

  resetPrmTypeOrdreServiceSelection(index: number): void {
    const selectedValue = this.ordreservices.at(index).get('idTypeOrdreService')?.value;
    if (selectedValue) {
      console.log('Removing from Set:', selectedValue);
      this.selectedPrmTypeOrdreService.delete(selectedValue);
    }
    this.ordreservices.at(index).get('idTypeOrdreService')?.setValue(null);
    this.cdr.detectChanges();
  }



  submitOrdreService() {
    const ordreServicesWithType1 = this.ordreservices.controls.filter(control =>
      control.get('idTypeOrdreService')?.value === 1
    );

    if (ordreServicesWithType1.length > 1) {
      this._snackBar.open("La liste des ordres service peuvent avoir au maximum un seul ordre-service de type أشغال", 'OK', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
      });
      return;
    }

    const ordreServicesToSend = this.ordreservices.controls.map(control => {
      const ordreService = control.value;
      if (ordreService.idTypeOrdreService === 1 || ordreService.idTypeOrdreService === 2) {
        ordreService.dureeOs = 0;
      }
      if (ordreService.dureeOs === "") {
        ordreService.dureeOs = 0;
      }
      const requestBody = {
        id: {
          numMarche: this.numMarche,
          numEtape: this.numEtape,
          numOs: ordreService.id.numOs
        },
        idTypeOrdreService: {
          id: ordreService.idTypeOrdreService
        },
        dateDebut: ordreService.dateDebut,
        dateFin: ordreService.dateFin,
        dateEditOs: ordreService.dateEditOs,
        dateNotifOs: ordreService.dateNotifOs,
        designation: ordreService.designation,
        codeOrd: ordreService.codeOrd,
        dureeOs: ordreService.dureeOs  // On envoie la valeur ajustée de dureeOs
      };
      console.log('Ordre Service transformé:', requestBody);
      return requestBody;
    });

    this._spinnerService.show();
    this.ordreServService.saveOrUpdateOrdreService(ordreServicesToSend).subscribe({
      next: (response) => {
        console.log('Ordres de service sauvegardés/ mis à jour avec succès:', response);
        this._coreService.openSnackBar("Ordre Service soumis", "OK");
        this._spinnerService.hide();
        this._dialogRef.close(true);
      },
      error: (err) => {
        console.error('Erreur lors de la soumission des ordres de service:', err);
        this._spinnerService.show();
        this.loadingError = "Erreur lors de la soumission des ordres de service";
      }
    });
  }


  removeOrdreService(index: number): void {
    const ordreServiceControl = this.ordreservices.at(index);
    const numOs = ordreServiceControl.get('id')?.get('numOs')?.value;
    const numEtape = this.numEtape;
    const numMarche = this.numMarche;
    console.log(numOs)
    this.ordreServService.deleteOrdreService(numMarche, numEtape, numOs).subscribe(() => {
      this.ordreservices.removeAt(index);
      this._coreService.openSnackBar('Ordre Service Supprimé', 'Ok');
      console.log(`OrdreService ${numOs} supprimée`);
    }, error => {
      console.error('Erreur lors de la suppression ordre service:', error);
      this.loadingError = 'Erreur de suppression ordre service.';
      setTimeout(() => {
        this.loadingError = null; // Réinitialise l'erreur
      }, 3000);
    });
  }

  openDeleteConfirmDialogOrdreService(index: number): void {
    const ordreServiceControl = this.ordreservices.at(index);
    const isNew = ordreServiceControl.get('isNew')?.value;
    if (isNew === false) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmation de Suppression',
          message: 'Êtes-vous sûr de vouloir supprimer cette ordre service ?',
          confirmButtonText: 'Supprimer',
          isDeleteAction: true
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.removeOrdreService(index);
        }
      });
    } else {
      this.ordreservices.removeAt(index); // Suppression immédiate
      this._coreService.openSnackBar('Ordre Service supprimé localement.', 'Ok');
      console.log('Suppression immédiate sans appel au service.');
    }

  }

  onIdTypeOrdreServiceChange(selectedValue: any, index: number): void {
  }

  onNoClick(): void {
    this._dialogRef.close(true)
  }











}
