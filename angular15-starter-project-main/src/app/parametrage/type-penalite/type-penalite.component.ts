import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TypePenalite } from 'src/app/model/typePenalite';
import { CoreService } from 'src/app/services/core/core.service';
import { PenaliteService } from 'src/app/services/penalite/penalite.service';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import { TypePenaliteAddEditComponent } from './typePenalite-add-edit/type-penalite-add-edit/type-penalite-add-edit.component';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-type-penalite',
  standalone: true,
  imports: [CommonModule,MatToolbarModule, MatFormFieldModule, MatInputModule, MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatButtonModule,MatMenuModule,ToastModule],
  templateUrl: './type-penalite.component.html',
  styleUrl: './type-penalite.component.scss'
})
export class TypePenaliteComponent implements OnInit {
  content?: string;
  typePenalites!: TypePenalite[];
  displayedColumns: string[] = [ 'id', 'designation', 'actions'];
  dataSource: MatTableDataSource<TypePenalite> = new MatTableDataSource<TypePenalite>();
  isDataEmpty: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  someProperty: number = 0;
  loadingError: string | null = null;

  constructor(
    private _dialog: MatDialog,
     private _typePenaliteService: PenaliteService, 
     private _coreService: CoreService, 
     private _liveAnnouncer:LiveAnnouncer, 
     public _spinnerService:SpinnerService,
     private messageService: MessageService) { 
  }
  ngOnInit(): void {
    this.getTypePenalitesList();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  openAddEditFournForm() {
    const dialogRef = this._dialog.open(TypePenaliteAddEditComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if(val) {
          this.getTypePenalitesList();
        }
      }
    });
  }

  getTypePenalitesList(){
    this._spinnerService.show(); // Masque le spinner
    this._typePenaliteService.getTypePenalitesList().subscribe({
      next: (res) => {
        if (res.length !== 0) {
          this.dataSource = new MatTableDataSource<TypePenalite>(res);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.isDataEmpty = false;
        } else {
          this.dataSource = new MatTableDataSource<TypePenalite>([]);
          this.isDataEmpty = true;
          this.showEmptyDataToast();
        }
      },
      error: (err: any) => {
        this.dataSource = new MatTableDataSource<TypePenalite>([]);
        this.isDataEmpty = true;
        this._spinnerService.hide(); // Masque le spinner
        console.error('Erreur lors de la récupération des types de penalites:', err);
        this.loadingError = 'Erreur lors de la récupération des types de penalites. Veuillez réessayer plus tard.';
        setTimeout(() => {
          this.loadingError = null; // Réinitialise l'erreur
        }, 3000);
      },complete: () => {
        this._spinnerService.hide(); // Cacher le spinner après le chargement des données
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteTypePenalite(id: number) {
    this._spinnerService.show(); // Masque le spinner
    this._typePenaliteService.deleteTypePenalite(id).subscribe({
      next: (res) => {
        this._coreService.openSnackBar('Type de Penalite Supprimé','Ok')
        this.getTypePenalitesList();
      },
      error: (err: any) => {
        this._spinnerService.hide(); // Masque le spinner
        console.error('Erreur lors de la suppression du type de Penalite:', err);
        this.loadingError = 'Erreur lors de la suppression du type de Penalite.';
        setTimeout(() => {
          this.loadingError = null; // Réinitialise l'erreur
        }, 3000);
      },complete: () => {
        this._spinnerService.hide(); // Cacher le spinner après le chargement des données
      }
    });
  }

  openEditForm(data: TypePenalite) {
    const dialogRef = this._dialog.open(TypePenaliteAddEditComponent, {
      data
    });
  
    dialogRef.afterClosed().subscribe({
      next: (result: TypePenalite) => {
        if (result) {
          this.getTypePenalitesList(); 
        }
      }
    });
  }

  openConfirmDialog(id: number): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de Suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce type de penalite ?',
        confirmButtonText: 'Supprimer',
        isDeleteAction: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTypePenalite(id);
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
          summary: 'Liste des types de penalite sont vide',
          detail: 'Aucun type de penalite n\'est disponible pour le moment.'
        });
      }


}
