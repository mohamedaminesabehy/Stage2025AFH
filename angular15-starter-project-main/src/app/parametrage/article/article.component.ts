import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ArticleService } from 'src/app/services/article/article.service';
import { ArticleDTO } from 'src/app/model/articleDTO';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ArticleAddEditComponent } from './article-add-edit/article-add-edit/article-add-edit.component';
import { CommonModule, DatePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ToastModule } from 'primeng/toast';
import { CoreService } from 'src/app/services/core/core.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import * as Encoding from 'encoding-japanese';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'src/assets/fonts/vfs_fonts.js';
import { FormsModule } from '@angular/forms';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

// Configuration des polices
(pdfMake as any).fonts = {
  Roboto:{
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
  selector: 'app-article',
  templateUrl: './article.component.html',
  imports: [CommonModule,MatDialogModule, MatToolbarModule, MatFormFieldModule, MatInputModule, MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatButtonModule,MatMenuModule,ToastModule,FormsModule],
  standalone: true,
  styleUrls: ['./article.component.scss'],
  providers: [DatePipe]
})
export class ArticleComponent implements OnInit {
  // displayedColumns: string[] = ['numArticle', 'numSectEco', 'numSSectEco', 'numFamille', 'numSFamille', 'libUnite', 'designation', 'historique', 'tva','designationFr', 'actions'];
  displayedColumns: string[] = ['numArticle', 'numSectEco', 'numSSectEco', 'numFamille', 'numSFamille', 'libUnite', 'designation', 'tva','designationFr', 'actions'];

  dataSource = new MatTableDataSource<ArticleDTO>();
  pageIndex = 0;
  pageSize = 10;
  length = 0;
  filterValue = '';
  secteurDesignation = '';
  ssecteurDesignation = '';
  familleDesignation = '';
  ssFamilleDesignation = '';
  designationFr = '';
  loadingError: string | null = null;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private articleService: ArticleService,
    private dialog: MatDialog,
    private _liveAnnouncer: LiveAnnouncer,
    public _spinnerService: SpinnerService,
    private _coreService: CoreService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  convertData(data: string): string {
    const bytes = Encoding.convert(data, { from: 'windows-1256', to: 'UTF8', type: 'string' });
    return bytes;
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') || '-';
  }

  loadArticles(): void {
    this._spinnerService.show(); // Afficher le spinner avant le chargement des données
    this.articleService.getAllArticles(this.pageIndex, this.pageSize, this.filterValue, this.secteurDesignation, this.ssecteurDesignation, this.familleDesignation, this.ssFamilleDesignation, this.designationFr)
      .subscribe({
        next: data => {
          this.dataSource.data = data.content;
          this.length = data.totalElements;
          this.updatePaginator();
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
          this.loadingError = null; // Réinitialiser l'erreur
        },
        error: (err: any) => {
          console.error('Erreur de chargement des articles:', err);
          this.loadingError = 'Erreur lors du chargement des articles. Veuillez réessayer plus tard.';
          setTimeout(() => {
            this.loadingError = null; // Réinitialise l'erreur
          }, 3000);
        },
        complete: () => {
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

  openAddEditDialog(article?: ArticleDTO): void {
    const dialogRef = this.dialog.open(ArticleAddEditComponent, {
      data: article,
      height: '70%',
      width: '18%',
    },
    
        );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadArticles();
      }
    });
  }

  deleteArticle(numArticle: string): void {
    this.articleService.deleteArticle(numArticle).subscribe({
      next: () => {
        this._coreService.openSnackBar('Article Supprimé', 'Ok');
        this.loadArticles();
      },
      error: (err: any) => {
        console.error('Erreur de suppression de l`article:', err);
        this.loadingError = 'Erreur de suppression de l`article.';
        setTimeout(() => {
          this.loadingError = null; // Réinitialise l'erreur
        }, 3000);
        this._spinnerService.hide();
      }
    });
  }

  openConfirmDialog(numArticle: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de Suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cet article ?',
        confirmButtonText: 'Supprimer',
        isDeleteAction: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteArticle(numArticle);
      }
    });
  }

  openEditForm(data: ArticleDTO): void {
    const dialogRef = this.dialog.open(ArticleAddEditComponent, {
      data,
      height: '70%',
      width: '18%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadArticles();
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadArticles();
  }
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  applyFilterNumArticle(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.filterValue = filterValue;
    this.pageIndex = 0;
    this.loadArticles();
  }

  applyFilterSecteurDesignation(event: Event): void {
    this.secteurDesignation = (event.target as HTMLInputElement).value.trim();
    if (!this.secteurDesignation) {
      this.ssecteurDesignation = '';
      this.familleDesignation = '';
      this.ssFamilleDesignation = '';
    }
    this.pageIndex = 0;
    this.loadArticles();
  }

  applyFilterSousSecteurDesignation(event: Event): void {
    this.ssecteurDesignation = (event.target as HTMLInputElement).value.trim();
    if (!this.ssecteurDesignation) {
      this.familleDesignation = '';
      this.ssFamilleDesignation = '';
    }
    this.pageIndex = 0;
    this.loadArticles();
  }

  applyFilterFamilleDesignation(event: Event): void {
    this.familleDesignation = (event.target as HTMLInputElement).value.trim();
    if (!this.familleDesignation) {
      this.ssFamilleDesignation = '';
    }
    this.pageIndex = 0;
    this.loadArticles();
  }

  applyFilterSousFamilleDesignation(event: Event): void {
    this.ssFamilleDesignation = (event.target as HTMLInputElement).value.trim();
    this.pageIndex = 0;
    this.loadArticles();
  }

  applyFilterDesignationFr(event: Event): void {
    this.designationFr = (event.target as HTMLInputElement).value.trim();
    this.pageIndex = 0;
    this.loadArticles();
  }
  

  generatePDF() {
     const convertedData = this.dataSource.data.map(p => ({
      numArticle: p.numArticle || 'N/A',
      numSectEco: p.numSectEco || 'N/A',
      numSSectEco: p.numSSectEco || 'N/A',
      numFamille: p.numFamille || 'N/A',
      numSFamille: p.numSFamille || 'N/A',
      designation: p.designation || 'N/A',
    }));
    console.log(convertedData)
  
    if (!convertedData || convertedData.length === 0) {
      console.error('No data available for PDF generation.');
      return;
    }
    const logoBase64 = 'data:image/png;base64,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'; 
    const docDefinition = {
      pageSize: 'A1',
      content: [
        {
          image: logoBase64,
          width: 120, // Ajustez la largeur de l'image selon vos besoins
          alignment: 'center', // Alignement à gauche
          margin: [0, 0, 0, 20] // Ajustez la marge autour de l'image (haut, droite, bas, gauche)
        },
        {
          text: "Agence Foncière d'Habitation (AFH)",
          fontSize: 22,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20] // Marge autour du titre : [gauche, haut, droite, bas]
        },
        {
          text: 'Articles',
          fontSize: 16,
          alignment: 'center',
          color: '#047886',
          font: 'Roboto'
        },
        {
          text: 'Tableau Articles',
          fontSize: 15,
          bold: true,
          alignment: 'center',
          decoration: 'underline',
          color: 'skyblue',
          font: 'Roboto'
        },
        {
          columns: [
            [
              {
                text: `Date: ${new Date().toLocaleString()}`,
                alignment: 'right',
                font: 'Roboto'
              }
            ]
          ]
        },
        {
          text: 'Details des articles',
          style: 'sectionHeader',
          font: 'Roboto'
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 100, 200, 300, 450, 400],
            body: [
              [
                { text: 'Numéro Article',fontSize:15, alignment: 'center' },
                { text: 'Secteur',fontSize:15, alignment: 'center' },
                { text: 'Sous Secteur',fontSize:15, alignment: 'center' },
                { text: 'Famille',fontSize:15, alignment: 'center' },
                { text: 'Sous Famille',fontSize:15, alignment: 'center' },
                { text: 'Désignation',fontSize:15, alignment: 'center' },
              ],
              ...convertedData.map(p => [
                { text: p.numArticle, fontSize:15, bold: false},
                { text:  isArabic(p.numSectEco) ? reverseArabicText(p.numSectEco,'  ') : p.numSectEco , fontSize: 12, font: isArabic(p.numSectEco) ? 'Amiri' : 'Roboto', alignment: 'center', direction: isArabic(p.numSectEco) ? 'rtl':'ltr', bold: false},
                { text:   isArabic(p.numSSectEco) ? reverseArabicText(p.numSSectEco,'  ') : p.numSSectEco , fontSize: 12, font: isArabic(p.numSSectEco) ? 'Amiri' : 'Roboto', alignment: 'center', direction: isArabic(p.numSSectEco) ? 'rtl':'ltr', bold: false },                
                { text:  isArabic(p.numFamille) ? reverseArabicText(p.numFamille,'  ') : p.numFamille , fontSize: 12, font: isArabic(p.numFamille) ? 'Amiri' : 'Roboto', alignment: 'center', direction: isArabic(p.numFamille) ? 'rtl':'ltr', bold: false },                
                { text:  isArabic(p.numSFamille) ? reverseArabicText(p.numSFamille,'  ') : p.numSFamille , fontSize: 11, font: isArabic(p.numSFamille) ? 'Amiri' : 'Roboto', alignment: 'center', direction: isArabic(p.numSFamille) ? 'rtl':'ltr', bold: false },                
                { text:  isArabic(p.designation) ? reverseArabicText(p.designation,'  ') : p.designation, fontSize:11, font: isArabic(p.designation) ? 'Amiri' : 'Roboto',alignment: 'center', direction: isArabic(p.designation) ? 'rtl':'ltr', bold: false}
              ])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 20, 0, 20]
        },
        {
          text: 'Conditions et termes',
          style: 'sectionHeader',
          fontSize:13,
          font: 'Roboto'
        },
        {
          ul: [
            "Ces articles sont spécifiques à l'agence foncière d'habitation (AFH)",
          ]
        }
      ],footer: function(currentPage, pageCount) {
        return {
          columns: [
            { text: `Page ${currentPage} sur ${pageCount}`, alignment: 'left' },
            { text: 'Signature', alignment: 'right', italics: true, font: 'Roboto'}
          ],
          margin: [0, 0, 60, 40] 
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
  } 
  
  generatePDFArticle(numArticle: string): void{
     const logoBase64 = 'data:image/png;base64,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'; 
    const article = this.dataSource.data.find(p => p.numArticle === numArticle);
    if (!article) {
      console.error('Article non trouvé.');
      return;
    }
    console.log(article);
    const convertedData = [{
      numArticle: article.numArticle || 'N/A',
      numSectEco: article.numSectEco || 'N/A',
      numSSectEco: article.numSSectEco || 'N/A',
      numFamille: article.numFamille || 'N/A',
      numSFamille: article.numSFamille || 'N/A',
      designation: article.designation || 'N/A',
    }];
    const docDefinition = {
      pageSize: 'A1',
      content: [
         {
          image: logoBase64,
          width: 120, 
          alignment: 'center',
          margin: [0, 0, 0, 20] 
        },
        {
          text: "Agence Foncière d'Habitation (AFH)",
          fontSize: 22,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20] 
        },
        {
          text: [
            "Détails de l'article: ",
            { text: article.numArticle, decoration: 'underline', fontSize: 16 }
          ],
          fontSize: 16,
          alignment: 'left',
          font: 'Roboto',
          margin: [0, 10]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 100, 200, 300, 450, 400],
            body: [
              [
                { text: 'Numéro Article',fontSize:15, alignment: 'center' },
                { text: 'Secteur',fontSize:15, alignment: 'center' },
                { text: 'Sous Secteur',fontSize:15, alignment: 'center' },
                { text: 'Famille',fontSize:15, alignment: 'center' },
                { text: 'Sous Famille',fontSize:15, alignment: 'center' },
                { text: 'Désignation',fontSize:15, alignment: 'center' },
              ],
              ...convertedData.map(p => [
                { text: p.numArticle, fontSize:15, bold: false},
                { text:  isArabic(p.numSectEco) ? reverseArabicText(p.numSectEco,'  ') : p.numSectEco , fontSize: 12, font: isArabic(p.numSectEco) ? 'Amiri' : 'Roboto', alignment: 'center', direction: isArabic(p.numSectEco) ? 'rtl':'ltr', bold: false},
                { text:   isArabic(p.numSSectEco) ? reverseArabicText(p.numSSectEco,'  ') : p.numSSectEco , fontSize: 12, font: isArabic(p.numSSectEco) ? 'Amiri' : 'Roboto', alignment: 'center', direction: isArabic(p.numSSectEco) ? 'rtl':'ltr', bold: false},                
                { text:  isArabic(p.numFamille) ? reverseArabicText(p.numFamille,'  ') : p.numFamille , fontSize: 12, font: isArabic(p.numFamille) ? 'Amiri' : 'Roboto', alignment: 'center', direction: isArabic(p.numFamille) ? 'rtl':'ltr', bold: false },                
                { text:  isArabic(p.numSFamille) ? reverseArabicText(p.numSFamille,'  ') : p.numSFamille , fontSize: 11, font: isArabic(p.numSFamille) ? 'Amiri' : 'Roboto', alignment: 'center', direction: isArabic(p.numSFamille) ? 'rtl':'ltr', bold: false },                
                { text:  isArabic(p.designation) ? reverseArabicText(p.designation,'  ') : p.designation, fontSize:11, font: isArabic(p.designation) ? 'Amiri' : 'Roboto',alignment: 'center', direction: isArabic(p.designation) ? 'rtl':'ltr', bold: false}
              ])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 20, 0, 20]
        },
        {
          text: 'Conditions et termes',
          style: 'sectionHeader',
          fontSize:13,
          font: 'Roboto'
        },
        {
          ul: [
            "Cet article est spécifique à l'agence foncière d'habitation (AFH)",
          ]
        }
      ],
      footer: function(currentPage, pageCount) {
        return {
          columns: [
            { text: `Page ${currentPage} sur ${pageCount}`, alignment: 'left' },
            { text: 'Signature', alignment: 'right', italics: true, font: 'Roboto'}
          ],
          margin: [0, 0, 60, 40] 
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
  
    // Générer et ouvrir le PDF
    pdfMake.createPdf(docDefinition).open();
  }

}
  
  export function isArabic(text: string): boolean {
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicPattern.test(text);
  }
  
 export function reverseArabicText(text, space = '  ') {
    const words = text.split(' ');
    const reversedWords = words.reverse();
    return reversedWords.join(space);
  }