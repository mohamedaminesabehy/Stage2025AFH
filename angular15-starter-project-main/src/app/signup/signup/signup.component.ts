import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
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
import { CodeAdminComponent } from './code-admin/code-admin.component';
import { PrmstructureService } from 'src/app/services/prmstructure/prmstructure.service';
import { PrmStructure } from 'src/app/model/prmStructure';
import { UserService } from 'src/app/services/User/user.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule,
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
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit, OnDestroy{

  inscriptionForm!: FormGroup;
  StaticCodeAdminInfo: string = '03';
  structures: PrmStructure[] = [];
  message: string = '';
  isSignupFailed = false;

  //
  structureFilterCtrl: FormControl = new FormControl();
  filteredStructures: ReplaySubject<PrmStructure[]> = new ReplaySubject<PrmStructure[]>(1);
  private _onDestroy = new Subject<void>();

  constructor(
    private _dialogRef: MatDialogRef<SignupComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private prmStructureService: PrmstructureService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.inscriptionForm = this.fb.group({
      matricule: [null, Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      structure: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.getAllStructures();
    console.log(this.inscriptionForm.controls);
    this.structureFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterStructures();
    });
  }

  getAllStructures() {
    this.prmStructureService.getPrmStructures().subscribe({
      next: (res) => {
        this.structures = res;
        this.filteredStructures.next(this.structures.slice()); // initialiser
        console.log(this.structures)
      },
      error: (err) => console.error(err),
      complete: () => {
      }
    });
  }

  private filterStructures() {
    if (!this.structures) return;

    let search = this.structureFilterCtrl.value;
    if (!search) {
      this.filteredStructures.next(this.structures.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    const filtered = this.structures.filter(structure =>
      structure.designation?.toLowerCase().includes(search)
    );
    this.filteredStructures.next(filtered);
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  onSignup(): void {
    if (this.inscriptionForm.valid) {
      const formData = this.inscriptionForm.value;
      console.log('Form submitted:', formData);
      const userSignupDTO = {
        id: formData.matricule,
        nom: formData.nom,
        prenom: formData.prenom,
        numStruct: formData.structure,  
        passwordHash: formData.password,  
      };
       this.authService.signup(userSignupDTO).subscribe(
        (response: string) => {
          this.message = response;
          this.isSignupFailed = false;        
          location.replace('/login')
        },
        (error: any) => {
          console.log(error.error)
          this.message = error.error.message;
          this.isSignupFailed = true;
          
        }
      ); 
    }
  }

  onNoClick(): void {
    this._dialogRef.close(true)
  }

  resetStructureSelection(): void {
    const structureControl = this.inscriptionForm.get('structure');
    
    if (structureControl) {
      structureControl.setValue('');
      structureControl.markAsUntouched();
      structureControl.markAsPristine();
    }
    }

    onStructureSelect(event: any): void {
      const selectedStructure = event.value;
      console.log(selectedStructure)
      console.log(this.StaticCodeAdminInfo)
      if (selectedStructure === this.StaticCodeAdminInfo) {
        this.openCodeDialog();
      }
    }

    openCodeDialog(): void {
      const dialogRef = this.dialog .open(CodeAdminComponent, {
        width: '400px',
        data: this.inscriptionForm.get('stucture')?.value
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Code Entré:', result);
          console.log(this.StaticCodeAdminInfo)
          if (result === this.StaticCodeAdminInfo) {
            console.log("im here")
            this.inscriptionForm.get('structure')?.setValue('03');
          } else {
            console.log('Code non validé ou dialog fermé sans sélection.');
            this.inscriptionForm.get('structure')?.setValue(''); 
          }
        }
        else {
          console.log('Dialog fermé sans validation du code');
          this.inscriptionForm.get('structure')?.setValue('');
        }
      });
    }

}
