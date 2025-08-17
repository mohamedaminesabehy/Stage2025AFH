import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { UserService } from '../services/User/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { SpinnerService } from '../services/spinner/spinner.service';
import {  MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ChatDialogComponent } from './chat-dialog/chat-dialog.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  isAdmin: boolean = false;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['prenom', 'nom', 'structure', 'actions'];
  loadingError = '';
  pageSize = 10;
  length = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private userAuthService: UserService,
    public _spinnerService: SpinnerService,
    private dialog: MatDialog

  ) {}

  ngOnInit(): void {
    const numStruct = this.authService.getNumStruct();
    this.isAdmin = (numStruct === '03');
  

  
    // Charger les données
    if (this.isAdmin) {
      this.userAuthService.getAllSimpleUsers().subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.length = data.length;
          this.initTable();
        },
        error: () => {
          this.loadingError = 'Erreur lors du chargement des utilisateurs.';
        }
      });
    } else {
      this.userAuthService.getAllAdmins().subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.length = data.length;
          this.initTable();
        },
        error: () => {
          this.loadingError = 'Erreur lors du chargement des admins.';
        }
      });
    }
  }
  

  initTable() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyUserFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    // Tu peux ajouter ici un appel backend si tu veux paginer côté serveur
  }

  startChatWith(user: any) {
    console.log('Démarrer une discussion avec :', user);
    this.dialog.open(ChatDialogComponent, {
      width: '1200px', 
      height: '800px',
      data: user 
    });
  }
}
