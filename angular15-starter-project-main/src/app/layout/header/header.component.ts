import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatSnackBarRef, MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from 'src/app/services/auth/auth.service';
import { SidebarService } from 'src/app/services/sidebar/sidebar.service';
import { UserService } from 'src/app/services/User/user.service';
import { ChatService } from 'src/app/services/Chat/chat.service';
import { ChatDialogComponent } from 'src/app/chat/chat-dialog/chat-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface ChatMessage {
  senderMatricule: string;
  receiverMatricule: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  matricule!: number;
  nom = '';
  prenom = '';

  hasNewMessage = false;
  activeChatMatricule: string | null = null;

  // Map matricule => nombre de messages non lus
  notificationsMap = new Map<string, number>();
/*   notificationsList = [
    { matricule: '123', count: 2, displayName: 'Jean Dupont' },
    { matricule: '456', count: 1, displayName: 'Marie Curie' }
  ]; */
  // Cache utilisateurs
  private userCache = new Map<string, { nom: string; prenom: string }>();
  notificationsList: Array<{ matricule: string; count: number; displayName: string }> = [];

  private subscriptions = new Subscription();

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const matriculeFromStorage = this.authService.isLoggedIn();
    this.isAuthenticated = matriculeFromStorage !== null;
    this.matricule = matriculeFromStorage ? parseInt(matriculeFromStorage, 10) : NaN;

    if (this.matricule) {
      this.loadUserDetails(this.matricule);

      this.chatService.connect(this.matricule.toString()).then(() => {
        // Écoute du chat actif (conversation ouverte)
        this.subscriptions.add(
          this.chatService.activeChatMatricule$.subscribe((matricule) => {
            this.activeChatMatricule = matricule;
            if (matricule !== null) {
              // Suppression de la notification pour cet expéditeur
              this.notificationsMap.delete(matricule);
              this.updateHasNewMessage();
              this.updateNotificationsList();
              this.cdr.detectChanges();
            }
          })
        );

        this.chatService.onGlobalMessage((message: ChatMessage) => {
          if (message.receiverMatricule === this.matricule.toString()) {
            if (
              this.activeChatMatricule === null ||
              message.senderMatricule !== this.activeChatMatricule
            ) {
              const currentCount = this.notificationsMap.get(message.senderMatricule) || 0;
              this.notificationsMap.set(message.senderMatricule, currentCount + 1);
              this.updateHasNewMessage();
              this.cdr.detectChanges();
              if (!this.userCache.has(message.senderMatricule)) {
                this.userService.getUserById(parseInt(message.senderMatricule)).subscribe({
                  next: (user) => {
                    this.userCache.set(message.senderMatricule, { nom: user.nom, prenom: user.prenom });
                    this.updateNotificationsList(); // mettre à jour la liste après ajout dans cache
                    this.cdr.detectChanges();
                  },
                  error: (err) => console.error('Erreur cache user notif:', err),
                });
              }else {
                this.updateNotificationsList();
                this.cdr.detectChanges();
              }
            }
          }
        });
        
      });
    }
  }

  ngOnDestroy(): void {
    this.chatService.setActiveChatMatricule(null);
    this.subscriptions.unsubscribe();
  }

  private loadUserDetails(matricule: number) {
    this.userService.getUserById(matricule).subscribe({
      next: (user) => {
        this.nom = user.nom;
        this.prenom = user.prenom;
      },
      error: (err) => console.error('Erreur récupération user:', err),
    });
  }

  private updateHasNewMessage() {
    this.hasNewMessage = this.notificationsMap.size > 0;
  }

  // Liste des notifications à afficher dans le menu (matricule + nombre messages)
  updateNotificationsList() {
    this.notificationsList = Array.from(this.notificationsMap.entries()).map(([matricule, count]) => {
      const user = this.userCache.get(matricule);
      const displayName = user ? `${user.prenom} ${user.nom}` : `Utilisateur #${matricule}`;
      return { matricule, count, displayName };
    });
  }

    onNotificationClick(matricule: string) {
      console.log('Notification clicked:', matricule);
      this.chatService.setActiveChatMatricule(matricule);
      this.notificationsMap.delete(matricule);
      this.updateHasNewMessage();
      this.updateNotificationsList();
      this.cdr.detectChanges();
      this.dialog.open(ChatDialogComponent, {
        width: '1200px', 
        height: '800px',
        data : {id : matricule}
      });
    }
  
  

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  getUserDetails(): void {
    this.userService.getUserById(this.matricule).subscribe({
      next: () => {
        this.router.navigate(['/profile'], {
          queryParams: { matricule: this.matricule },
        });
      },
      error: (err) => console.error('Erreur récupération user:', err),
    });
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
  }
}
