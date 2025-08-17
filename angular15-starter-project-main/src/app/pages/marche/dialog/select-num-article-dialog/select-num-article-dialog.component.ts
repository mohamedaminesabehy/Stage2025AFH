import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Article } from 'src/app/model/article';
import { ArticleService } from 'src/app/services/article/article.service';
import { MatListModule } from '@angular/material/list';


@Component({
  selector: 'app-select-num-article-dialog',
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
  templateUrl: './select-num-article-dialog.component.html',
  styleUrl: './select-num-article-dialog.component.scss'
})
export class SelectNumArticleDialogComponent implements OnInit {

  articles: Article[] = [];
  allArticles: Article[] = [];
  searchTerm = '';
  searchControl = new FormControl('');
  currentPage = 0;
  pageSize = 10;

  constructor(
    private dialogRef: MatDialogRef<SelectNumArticleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { articles: Article[] }
  ) {}

  ngOnInit(): void {
    if (this.data?.articles) {
      this.allArticles = this.data.articles;
      this.articles = [...this.allArticles];
    }

    this.searchControl.valueChanges.subscribe((value: any) => {
      this.searchTerm = value || '';
      this.applySearchFilter();
    });
  }

  get paginatedArticles(): Article[] {
    const start = this.currentPage * this.pageSize;
    return this.articles.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.articles.length / this.pageSize);
  }

  nextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.articles.length) {
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
    this.articles = this.allArticles.filter(article =>
      article.numArticle.toLowerCase().includes(term) ||
      (article.designationFr?.toLowerCase().includes(term)) ||
      (article.designation?.toLowerCase().includes(term)) || 
      (article.numArticle.includes(term))
    );
    this.currentPage = 0;
  }

  selectArticle(article: Article): void {
    this.dialogRef.close(article);
  }

  close(): void {
    this.dialogRef.close();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

}
