import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastModule } from 'primeng/toast';
import { CoreService } from 'src/app/services/core/core.service';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import { MarcheAddEditComponent } from './marche-add-edit/marche-add-edit/marche-add-edit.component';
import { MarcheService } from 'src/app/services/marche/marche.service';
import { Marche } from 'src/app/model/marche';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';
import { EtapeService } from 'src/app/services/etape/etape.service';
import { forkJoin } from 'rxjs';
import { MrclotService } from 'src/app/services/mrclot/mrclot.service';
import { PrmlotService } from 'src/app/services/prmlot/prmlot.service';

@Component({
  selector: 'app-marche',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatToolbarModule, MatFormFieldModule, MatInputModule, MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatButtonModule, MatMenuModule, ToastModule],
  templateUrl: './marche.component.html',
  styleUrl: './marche.component.scss'
})
export class MarcheComponent implements OnInit {

  //displayedColumns: string[] = ['id', 'numBanque', 'numMin', 'numAvMarche', 'designationFourn', 'designation', 'rib', 'dateMarche', 'typePFMarche', 'nant', 'numLot', 'plusMoinsValue', 'actions'];
  // displayedColumns: string[] = ['id', 'numBanque', 'numAvMarche', 'designationFourn', 'designation', 'rib', 'dateMarche', 'typePFMarche', 'mntMarche', 'mntMrcApresAvenant', 'structure', 'actions'];
  displayedColumns: string[] = ['id', 'numBanque', 'numAvMarche', 'designationFourn','matFiscaleFourn', 'designation', 'dateMarche', 'typePFMarche', 'structure', 'actions'];
  dataSource = new MatTableDataSource<Marche>();
  pageIndex = 0;
  pageSize = 10;
  length = 0;
  filterValue = '';
  designation = '';
  fournisseurdesignation = '';
  loadingError: string | null = null;
  numStruct: string ='';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private marcheService: MarcheService,
    private etapeService: EtapeService,
    private mrcLotsService: MrclotService,
    private prmLotService: PrmlotService,
    private dialog: MatDialog,
    private _liveAnnouncer: LiveAnnouncer,
    public _spinnerService: SpinnerService,
    private _coreService: CoreService
  ) { }

  ngOnInit(): void {
    this.numStruct = sessionStorage.getItem('NumStruct') ?? '';
    this.loadMarches();
  }

  loadMarches() {
    this._spinnerService.show(); // Afficher le spinner avant le chargement des données
    this.marcheService.getAllMarches(this.pageIndex, this.pageSize, this.filterValue, this.designation, this.fournisseurdesignation,this.numStruct)
      .subscribe({
        next: data => {
          console.log(data)
          this.dataSource.data = data.content;
          this.length = data.totalElements;
          this.updatePaginator();
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
          this.loadingError = null; // Réinitialiser l'erreur 
        },
        error: (err: any) => {
          console.error('Erreur de chargement des marches:', err);
          this.loadingError = 'Erreur lors du chargement des marches. Veuillez réessayer plus tard.';
          this._spinnerService.hide();
          setTimeout(() => {
            this.loadingError = null;
          }, 3000);
        },
        complete: () => {
          this._spinnerService.hide(); // Cacher le spinner après le chargement des données
        }
      });
  }

  deleteMarche(numMarche: number): void {
    this.marcheService.deleteMarche(numMarche).subscribe({
      next: () => {
        this._coreService.openSnackBar('Marche Supprimé', 'Ok');
        this.loadMarches();
      },
      error: (err: any) => {
        console.error('Erreur de suppression du marche:', err);
        this.loadingError = 'Erreur de suppression du marche.';
        this._spinnerService.hide();
        setTimeout(() => {
          this.loadingError = null;
        }, 3000);
      }
    });
  }


  openConfirmDialog(numMarche: number): void {
    const etapes$ = this.etapeService.getEtapesForMarche(numMarche);
    const mrcLots$ = this.mrcLotsService.getMrcLotsForMarche(numMarche);

    forkJoin([etapes$, mrcLots$]).subscribe(
      ([etapes, mrcLots]) => {
        const hasEtapes = etapes && etapes.length > 0;
        const hasMrcLots = mrcLots && mrcLots.length > 0;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Confirmation de Suppression',
            message: hasEtapes || hasMrcLots
              ? 'Le marché comporte des étapes ou des lots. Veuillez les supprimer avant de procéder à la suppression du marché.'
              : 'Êtes-vous sûr de vouloir supprimer ce marché ?',
            disableDeleteButton: hasEtapes || hasMrcLots,
            confirmButtonText: 'Supprimer',
            isDeleteAction: true
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result && !hasEtapes && !hasMrcLots) {
            this.deleteMarche(numMarche);
          }
        });
      },
      error => {
        console.error('Erreur lors de la récupération des données:', error);
      }
    );
  }

  openEditForm(data: Marche): void {
    this.loadMarcheData(data.id);
  }

  loadMarcheData(marcheId: number): void {
    console.log(marcheId)
    this.marcheService.getMarcheById(marcheId).subscribe(
      (marcheData: Marche) => {
        console.log(marcheData)
        this._coreService.openSnackBar("Récupération des données du marché réussie", "OK");
        this.loadEtapesAndMrcLots(marcheData);
      },
      error => {
        this.handleError('Erreur lors de la récupération des données du marché:', error);
      }
    );
  }

  openAddEditDialog(marche?: any): void {
    const dialogRef = this.dialog.open(MarcheAddEditComponent, {
      data: marche,
      width: '99%',
      height: '98%',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMarches();
      }
    });
  }

   loadEtapesAndMrcLots(marcheData: Marche): void {
    console.log(marcheData)
    const etapeObservable = this.etapeService.getEtapesForMarche(marcheData.id);
    const mrcLotsObservable = this.mrcLotsService.getMrcLotsForMarche(marcheData.id);

    forkJoin([etapeObservable, mrcLotsObservable]).subscribe(
      ([etapes, mrclots]) => {
        const dialogRef = this.dialog.open(MarcheAddEditComponent, {
          data: {
            marche: marcheData,
            structure: marcheData.idStructure,
            fournisseur: marcheData.idFourn,
            etapes: etapes,
            modePen: marcheData.idModePen,
            mrclots: mrclots
          } ,
          width: '95%',
          height: '95%',
        });


        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loadMarches();
          }
        });
        this._coreService.openSnackBar("Récupération des données des étapes et des MrcLots réussie", "OK");

      },
      error => {
        this.handleError('Erreur lors de la récupération des données des étapes et des MrcLots:', error);
      }
    );
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.loadingError = message + ' Veuillez réessayer plus tard.';
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMarches();
  }

  updatePaginator() {
    if (this.paginator) {
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.length;
    }
  }
 
  applyFilterNumMarche(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.filterValue = filterValue;
    this.pageIndex = 0;
    this.loadMarches();
  }

  applyFilterDesignation(event: Event): void {
    const filterDesigantionValue = (event.target as HTMLInputElement).value.trim();
    console.log(filterDesigantionValue)
    this.designation = this.normalizeString(filterDesigantionValue);
    console.log(this.designation)
    this.pageIndex = 0;
    this.loadMarches();
  }

  applyFilterFournisseurDesignation(event: Event): void {
    const filterFournisseurDesigantionValue  = (event.target as HTMLInputElement).value.trim() ;
    this.fournisseurdesignation = filterFournisseurDesigantionValue;
    this.pageIndex = 0;
    this.loadMarches();
  }

  normalizeString(input: string): string {
    if (!input) return '';
    return input.trim().replace(/\s+/g, ' ');
  }
}
