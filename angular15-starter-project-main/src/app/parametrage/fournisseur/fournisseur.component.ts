import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FournAddEditComponent } from './fourn-add-edit/fourn-add-edit.component';
import { Fournisseur } from 'src/app/model/fournisseur';
import { FournisseurService } from 'src/app/services/fournisseur/fournisseur.service';
import { MatDialog } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CoreService } from 'src/app/services/core/core.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';  // Ajoutez cette ligne
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-fournisseur',
  standalone: true,
  imports: [CommonModule,MatToolbarModule, MatFormFieldModule, MatInputModule, MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatButtonModule,MatMenuModule,ToastModule,FormsModule],
  templateUrl: './fournisseur.component.html',
  styleUrl: './fournisseur.component.scss'
})
export class FournisseurComponent implements OnInit {

  fournisseurDesignation = '';
  designation = '';
  pageIndex = 0;
  pageSize = 10;
  length = 0;
  content?: string;
  fournisseurs!: Fournisseur[];
  //displayedColumns: string[] = [ 'id', 'numFourn', 'numGouv', 'designation', 'designationFr', 'adresse', 'ville', 'codePostal',  'activite', 'rcs', 'matCnss', 'matriculeFisc', 'finFourn', 'actions'];
  displayedColumns: string[] = [ 'id', 'numFourn', 'designation', 'designationFr', 'adresse', 'finFourn', 'actions'];

  dataSource: MatTableDataSource<Fournisseur> = new MatTableDataSource<Fournisseur>();
  isDataEmpty: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  someProperty: number = 0;
  loadingError: string | null = null;

  constructor(
    private _dialog: MatDialog,
     private _fournService: FournisseurService, 
     private _coreService: CoreService, 
     private _liveAnnouncer:LiveAnnouncer, 
     public _spinnerService:SpinnerService,
     private messageService: MessageService) { 
  }

  ngOnInit(): void {
    this.getFournisseurList();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  openAddEditFournForm() {
    const dialogRef = this._dialog.open(FournAddEditComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if(val) {
          this.getFournisseurList();
        }
      }
    });
  }

  getFournisseurList(){
    this._spinnerService.show(); // Masque le spinner
    this._fournService.getFournisseurList(this.pageIndex, this.pageSize, this.fournisseurDesignation, this.designation).subscribe({
      next: (res) => {
        console.log(res)
        this.dataSource.data = res.content;
        this.length = res.totalElements;
        this.updatePaginator();
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
        this.loadingError = null; // Réinitialiser l'erreur 
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des fournisseurs:', err);
        this.loadingError = 'Erreur lors de la récupération des fournisseurs. Veuillez réessayer plus tard.';
      },complete: () => {
        this._spinnerService.hide(); // Cacher le spinner après le chargement des données
      }
    });
  }

  updatePaginator(){
    if (this.paginator) {
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.length;
    }
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteFournisseur(id: number) {
    this._spinnerService.show(); // Masque le spinner
    this._fournService.deleteFournisseur(id).subscribe({
      next: (res) => {
        this._coreService.openSnackBar('Fournisseur Supprimé','Ok')
        this.getFournisseurList();
      },
      error: (err: any) => {
        this._spinnerService.hide(); // Masque le spinner
        console.error('Erreur lors de la suppression du fournisseur:', err);
        this.loadingError = 'Erreur lors de la suppression du fournisseur'; 
        setTimeout(() => {
          this.loadingError = null; // Réinitialise l'erreur
        }, 3000);
      },complete: () => {
        this._spinnerService.hide(); // Cacher le spinner après le chargement des données
      }
    });
  }

  openConfirmDialog(id: number): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de Suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce fournisseur ?',
        confirmButtonText: 'Supprimer',
        isDeleteAction: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteFournisseur(id);
      }
    });
  }

  openEditForm(data: Fournisseur) {
    const dialogRef = this._dialog.open(FournAddEditComponent, {
      data
    });
  
    dialogRef.afterClosed().subscribe({
      next: (result: Fournisseur) => {
        if (result) {
          this.getFournisseurList(); // Recharge la liste des fournisseurs
        }
      }
    });
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  showEmptyDataToast() {
       this.messageService.add({
          key: 'toast',
          severity: 'warn', // 'success', 'info', 'warn', 'error'
          summary: 'Liste des Fournisseurs vide',
          detail: 'Aucun fournisseur n\'est disponible pour le moment.'
        });
      }

  onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getFournisseurList();
  }

  applyFilterSecteurDesignation(event: Event): void {
        this.fournisseurDesignation = (event.target as HTMLInputElement).value.trim();
        this.pageIndex = 0;
        this.getFournisseurList();
  }

  applyFilterDesignation(event: Event): void {
    this.designation = (event.target as HTMLInputElement).value.trim();
    this.pageIndex = 0;
    this.getFournisseurList();
}
}
