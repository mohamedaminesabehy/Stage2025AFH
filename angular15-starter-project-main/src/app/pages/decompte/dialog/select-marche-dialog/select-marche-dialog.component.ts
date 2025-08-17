import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Marche } from 'src/app/model/marche';

@Component({
  selector: 'app-select-marche-dialog',
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
    MatListModule,
    FormsModule
  ],
  templateUrl: './select-marche-dialog.component.html',
  styleUrl: './select-marche-dialog.component.scss'
})
export class SelectMarcheDialogComponent implements OnInit{



  marches: Marche[] = [];
  allMarches: Marche[] = [];
  searchTerm = '';
  searchControl = new FormControl('');
  currentPage = 0;
  pageSize = 10;

  constructor(
      public dialogRef: MatDialogRef<SelectMarcheDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit(): void {
      console.log(this.data)
      if (this.data?.marches) {
        this.allMarches = this.data.marches;
        this.marches = [...this.data.marches];
      }
  
      this.searchControl.valueChanges.subscribe((value: any) => {
        this.searchTerm = value || '';
        this.applySearchFilter();
      });
    }

    get paginatedMarches(): Marche[] {
      const start = this.currentPage * this.pageSize;
      return this.marches.slice(start, start + this.pageSize);
    }
  
    get totalPages(): number {
      return Math.ceil(this.marches.length / this.pageSize);
    }
  
    nextPage(): void {
      if ((this.currentPage + 1) * this.pageSize < this.marches.length) {
        this.currentPage++;
      }
    }
  
    prevPage(): void {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
    }
  
    firstPage(): void {
      this.currentPage = 0;
    }
    
    lastPage(): void {
      this.currentPage = this.totalPages - 1;
    }
  
    applySearchFilter(): void {
      const term = this.searchTerm.toLowerCase().trim();
      this.marches = this.allMarches.filter(marche =>
        marche.id.toString().toLowerCase().includes(term) ||
        (marche.designation?.toLowerCase().includes(term))
      );
      this.currentPage = 0;
    }
  
    selectMarche(marche: Marche): void {
      this.dialogRef.close(marche);
    }
  
    close(): void {
      this.dialogRef.close();
    }
  
    clearSearch(): void {
      this.searchControl.setValue('');
    }
    
}
