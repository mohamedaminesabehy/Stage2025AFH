import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ChatService } from 'src/app/services/Chat/chat.service';
import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-chat-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './chat-dialog.component.html',
  styleUrl: './chat-dialog.component.scss'
})
export class ChatDialogComponent implements OnInit, OnDestroy {
  newMessage: string = '';
  messages: any[] = [];
  matricule!: string;
  receiverMatricule!: string;
  isAdmin: boolean = false;

  countdown: number = 90;
  private countdownInterval: any;
  private messageTimeout: any;
  private inactivityTimeout: number = 90000;
  private messageRefreshInterval: any;

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private _coreService: CoreService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    this.matricule = sessionStorage.getItem('Matricule') || '';
    this.receiverMatricule = this.data.id;
    this.isAdmin = this.authService.getNumStruct() === '03';
   this.chatService.setActiveChatMatricule(this.receiverMatricule)
    // Connexion WebSocket sans callback
    this.chatService.connect(this.matricule);
  
    // Abonnement aux messages destinés à cette conversation
    this.chatService.onMessage((message: any) => {
      if (
        (message.senderMatricule === this.receiverMatricule && message.receiverMatricule === this.matricule) ||
        (message.senderMatricule === this.matricule && message.receiverMatricule === this.receiverMatricule)
      ) {
        this.messages.push(message);
      }
    });
  
    this.loadMessages();
    this.startInactivityTimer();
  
    this.messageRefreshInterval = setInterval(() => {
      this.loadMessages();
    }, 5000);
  }

  ngOnDestroy(): void {
    this.clearInactivityTimer();
    this.chatService.setActiveChatMatricule(null);
    clearInterval(this.messageRefreshInterval);
    //this.chatService.disconnect();
  }

  loadMessages(): void {
    this.chatService.getMessages(this.matricule, this.receiverMatricule).subscribe((messages) => {
      this.messages = messages;
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const chatMessage = {
        senderMatricule: this.matricule,
        receiverMatricule: this.receiverMatricule,
        message: this.newMessage,
      };

      this.chatService.sendMessage(chatMessage).subscribe(() => {
        this.messages.push(chatMessage);
        this.newMessage = '';
        this.resetInactivityTimer();
      });
    }
  }

  clearChat(): void {
    const receiverMatricule = this.receiverMatricule.toString();
    this.chatService.clearMessagesBetweenAdminAndUser(this.matricule, receiverMatricule).subscribe({
      next: () => {
        this.messages = [];
        this._coreService.openSnackBar('Conversation supprimée', 'Ok');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression des messages :', err);
      }
    });
  }

  openConfirmDeleteOperationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de suppression de la discussion',
        message: 'Êtes-vous sûr de vouloir supprimer toute la discussion avec cet utilisateur ?',
        confirmButtonText: 'Soumettre'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clearChat();
      }
    });
  }

  close(): void {
    this.clearInactivityTimer();
    clearInterval(this.messageRefreshInterval);
    this.chatService.setActiveChatMatricule(this.receiverMatricule);
    //this.chatService.disconnect();
    this.dialogRef.close();
  }

  startInactivityTimer(): void {
    this.countdown = 90;

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.close();
      }
    }, 1000);

    this.messageTimeout = setTimeout(() => {
      this.close();
    }, this.inactivityTimeout);
  }

  resetInactivityTimer(): void {
    this.clearInactivityTimer();
    this.startInactivityTimer();
  }

  clearInactivityTimer(): void {
    clearTimeout(this.messageTimeout);
    clearInterval(this.countdownInterval);
  }

  // 🔁 Capture toutes les interactions utilisateur
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:click')
  onUserActivity(): void {
    this.resetInactivityTimer();
  }
}
