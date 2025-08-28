import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastModule } from 'primeng/toast';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import { MapComponent } from '../pages/map/map/map.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [MapComponent,
     CommonModule,MatDividerModule,MatToolbarModule, MatFormFieldModule, MatInputModule, MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatButtonModule,MatMenuModule,ToastModule,MatCardModule],
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isModalOpen = false;
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

   openModal() {
    this.isModalOpen = true;
  }


  // Fermer la modale
  closeModal() {
    this.isModalOpen = false;
  } 
}
