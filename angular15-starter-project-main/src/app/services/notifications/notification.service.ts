import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environnement';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionUrl?: string;
  actionLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private isConnected$ = new BehaviorSubject<boolean>(false);

  // Configuration
  private maxNotifications = 50;
  private pollInterval = 30000; // 30 secondes
  private apiUrl = environment.apiUrl;

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.initializeNotifications();
    this.startPolling();
  }

  /**
   * Obtenir toutes les notifications
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  /**
   * Obtenir le statut de connexion
   */
  getConnectionStatus(): Observable<boolean> {
    return this.isConnected$.asObservable();
  }

  /**
   * Ajouter une nouvelle notification
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notifications$.value;
    const updatedNotifications = [newNotification, ...currentNotifications]
      .slice(0, this.maxNotifications);

    this.notifications$.next(updatedNotifications);
    this.updateUnreadCount();

    // Afficher la notification dans la snackbar
    this.showSnackbarNotification(newNotification);
  }

  /**
   * Marquer une notification comme lue
   */
  markAsRead(notificationId: string): void {
    const notifications = this.notifications$.value.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );

    this.notifications$.next(notifications);
    this.updateUnreadCount();

    // Synchroniser avec le serveur
    this.syncReadStatus(notificationId);
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead(): void {
    const notifications = this.notifications$.value.map(notification => ({
      ...notification,
      read: true
    }));

    this.notifications$.next(notifications);
    this.updateUnreadCount();

    // Synchroniser avec le serveur
    this.syncAllReadStatus();
  }

  /**
   * Supprimer une notification
   */
  removeNotification(notificationId: string): void {
    const notifications = this.notifications$.value.filter(
      notification => notification.id !== notificationId
    );

    this.notifications$.next(notifications);
    this.updateUnreadCount();

    // Synchroniser avec le serveur
    this.deleteNotification(notificationId);
  }

  /**
   * Supprimer toutes les notifications
   */
  clearAllNotifications(): void {
    this.notifications$.next([]);
    this.updateUnreadCount();

    // Synchroniser avec le serveur
    this.clearAllOnServer();
  }

  /**
   * Filtrer les notifications par type
   */
  getNotificationsByType(type: string): Observable<Notification[]> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const filtered = notifications.filter(n => n.type === type);
        observer.next(filtered);
      });
    });
  }

  /**
   * Filtrer les notifications par catégorie
   */
  getNotificationsByCategory(category: string): Observable<Notification[]> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const filtered = notifications.filter(n => n.category === category);
        observer.next(filtered);
      });
    });
  }

  /**
   * Notifications système prédéfinies
   */
  notifyDataUpdate(entity: string, count: number): void {
    this.addNotification({
      type: 'info',
      title: 'Données mises à jour',
      message: `${count} ${entity} ont été mis à jour`,
      priority: 'low',
      category: 'system'
    });
  }

  notifyError(title: string, message: string): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      priority: 'high',
      category: 'error'
    });
  }

  notifySuccess(title: string, message: string): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      priority: 'medium',
      category: 'success'
    });
  }

  notifyWarning(title: string, message: string): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      priority: 'medium',
      category: 'warning'
    });
  }

  /**
   * Méthodes privées
   */
  private initializeNotifications(): void {
    // Charger les notifications depuis le serveur
    this.loadNotificationsFromServer();
  }

  private startPolling(): void {
    interval(this.pollInterval).subscribe(() => {
      this.pollForNewNotifications();
    });
  }

  private loadNotificationsFromServer(): void {
    this.http.get<Notification[]>(`${this.apiUrl}/notifications`)
      .subscribe({
        next: (notifications) => {
          this.notifications$.next(notifications);
          this.updateUnreadCount();
          this.isConnected$.next(true);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des notifications:', error);
          this.isConnected$.next(false);
          this.loadMockNotifications();
        }
      });
  }

  private pollForNewNotifications(): void {
    const lastNotificationTime = this.getLastNotificationTime();
    
    this.http.get<Notification[]>(`${this.apiUrl}/notifications/since/${lastNotificationTime}`)
      .subscribe({
        next: (newNotifications) => {
          if (newNotifications.length > 0) {
            const currentNotifications = this.notifications$.value;
            const updatedNotifications = [...newNotifications, ...currentNotifications]
              .slice(0, this.maxNotifications);
            
            this.notifications$.next(updatedNotifications);
            this.updateUnreadCount();

            // Afficher les nouvelles notifications
            newNotifications.forEach(notification => {
              this.showSnackbarNotification(notification);
            });
          }
          this.isConnected$.next(true);
        },
        error: (error) => {
          console.error('Erreur lors du polling des notifications:', error);
          this.isConnected$.next(false);
        }
      });
  }

  private syncReadStatus(notificationId: string): void {
    this.http.patch(`${this.apiUrl}/notifications/${notificationId}/read`, {})
      .subscribe({
        error: (error) => {
          console.error('Erreur lors de la synchronisation:', error);
        }
      });
  }

  private syncAllReadStatus(): void {
    this.http.patch(`${this.apiUrl}/notifications/read-all`, {})
      .subscribe({
        error: (error) => {
          console.error('Erreur lors de la synchronisation:', error);
        }
      });
  }

  private deleteNotification(notificationId: string): void {
    this.http.delete(`${this.apiUrl}/notifications/${notificationId}`)
      .subscribe({
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
  }

  private clearAllOnServer(): void {
    this.http.delete(`${this.apiUrl}/notifications`)
      .subscribe({
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notifications$.value.filter(n => !n.read).length;
    this.unreadCount$.next(unreadCount);
  }

  private showSnackbarNotification(notification: Notification): void {
    const config = {
      duration: this.getSnackbarDuration(notification.priority),
      panelClass: [`${notification.type}-snackbar`],
      horizontalPosition: 'right' as const,
      verticalPosition: 'top' as const
    };

    const snackBarRef = this.snackBar.open(
      `${notification.title}: ${notification.message}`,
      'Voir',
      config
    );

    snackBarRef.onAction().subscribe(() => {
      this.markAsRead(notification.id);
      if (notification.actionUrl) {
        // Navigation vers l'URL d'action
        window.location.href = notification.actionUrl;
      }
    });
  }

  private getSnackbarDuration(priority: string): number {
    switch (priority) {
      case 'high': return 8000;
      case 'medium': return 5000;
      case 'low': return 3000;
      default: return 5000;
    }
  }

  private getLastNotificationTime(): string {
    const notifications = this.notifications$.value;
    if (notifications.length > 0) {
      return notifications[0].timestamp.toISOString();
    }
    return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24h ago
  }

  private generateId(): string {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private loadMockNotifications(): void {
    const mockNotifications: Notification[] = [
      {
        id: 'mock_1',
        type: 'info',
        title: 'Nouveau marché',
        message: 'Un nouveau marché a été ajouté au système',
        timestamp: new Date(Date.now() - 60000),
        read: false,
        priority: 'medium',
        category: 'marche'
      },
      {
        id: 'mock_2',
        type: 'warning',
        title: 'Délai dépassé',
        message: 'Le marché #2025019 a dépassé son délai de livraison',
        timestamp: new Date(Date.now() - 300000),
        read: false,
        priority: 'high',
        category: 'delai'
      },
      {
        id: 'mock_3',
        type: 'success',
        title: 'Export terminé',
        message: 'L\'export des statistiques a été généré avec succès',
        timestamp: new Date(Date.now() - 600000),
        read: true,
        priority: 'low',
        category: 'export'
      }
    ];

    this.notifications$.next(mockNotifications);
    this.updateUnreadCount();
  }
}
