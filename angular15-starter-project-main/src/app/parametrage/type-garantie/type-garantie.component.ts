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
import { TypeGarantie } from 'src/app/model/typeGarantie';
import { CoreService } from 'src/app/services/core/core.service';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import { TypeGarantieService } from 'src/app/services/typeGarantie/type-garantie.service';
import { TypeGarantieAddEditComponent } from './typeGarantie-add-edit/type-garantie-add-edit/type-garantie-add-edit.component';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-type-garantie',
  standalone: true,
  imports: [CommonModule,MatToolbarModule, MatFormFieldModule, MatInputModule, MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatButtonModule,MatMenuModule,ToastModule],
  templateUrl: './type-garantie.component.html',
  styleUrl: './type-garantie.component.scss'
})
export class TypeGarantieComponent implements OnInit {
  content?: string;
  typeGaranties!: TypeGarantie[];
  displayedColumns: string[] = [ 'id', 'designation', 'actions'];
  dataSource: MatTableDataSource<TypeGarantie> = new MatTableDataSource<TypeGarantie>();
  isDataEmpty: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  someProperty: number = 0;
  loadingError: string | null = null;

  constructor(
    private _dialog: MatDialog,
     private _typeGarantieService: TypeGarantieService, 
     private _coreService: CoreService, 
     private _liveAnnouncer:LiveAnnouncer, 
     public _spinnerService:SpinnerService,
     private messageService: MessageService) { 
  }
  ngOnInit(): void {
    this.getTypeGarantiesList();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  openAddEditFournForm() {
    const dialogRef = this._dialog.open(TypeGarantieAddEditComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if(val) {
          this.getTypeGarantiesList();
        }
      }
    });
  }

  getTypeGarantiesList(){
    this._spinnerService.show(); // Masque le spinner
    this._typeGarantieService.getTypeGarantiesList().subscribe({
      next: (res) => {
        if (res.length !== 0) {
          this.dataSource = new MatTableDataSource<TypeGarantie>(res);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.isDataEmpty = false;
        } else {
          this.dataSource = new MatTableDataSource<TypeGarantie>([]);
          this.isDataEmpty = true;
          this.showEmptyDataToast();
        }
      },
      error: (err: any) => {
        this.dataSource = new MatTableDataSource<TypeGarantie>([]);
        this.isDataEmpty = true;
        this._spinnerService.hide(); // Masque le spinner
        console.error('Erreur lors de la récupération des types de garanties:', err);
        this.loadingError = 'Erreur lors de la récupération des types de garanties. Veuillez réessayer plus tard.';
        setTimeout(() => {
          this.loadingError = null; // Réinitialise l'erreur
        }, 3000);
      },
      complete: () => {
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

  deleteTypeGarantie(id: number) {
    this._spinnerService.show(); // Masque le spinner
    this._typeGarantieService.deleteTypeGarantie(id).subscribe({
      next: (res) => {
        this._coreService.openSnackBar('type de garantie Supprimé','Ok')
        this.getTypeGarantiesList();
      },
      error: (err: any) => {
        this._spinnerService.hide(); // Masque le spinner
        console.error('Erreur lors de la suppression du type de garantie:', err);
        this.loadingError = 'Erreur lors de la suppression du type de garantie.'; 
        setTimeout(() => {
          this.loadingError = null; // Réinitialise l'erreur
        }, 3000);
      },complete: () => {
        this._spinnerService.hide(); // Cacher le spinner après le chargement des données
      }
    });
  }

  openEditForm(data: TypeGarantie) {
    const dialogRef = this._dialog.open(TypeGarantieAddEditComponent, {
      data
    });
  
    dialogRef.afterClosed().subscribe({
      next: (result: TypeGarantie) => {
        if (result) {
          this.getTypeGarantiesList(); // Recharge la liste des TypeGarantie
        }
      }
    });
  }

  openConfirmDialog(id: number): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de Suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce type de garantie ?',
        confirmButtonText: 'Supprimer',
        isDeleteAction: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTypeGarantie(id);
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
          summary: 'Liste des types de garantie sont vide',
          detail: 'Aucun type de garantie n\'est disponible pour le moment.'
        });
      }

}
