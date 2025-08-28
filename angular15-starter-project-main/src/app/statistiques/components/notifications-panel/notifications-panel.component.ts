import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService, Notification } from 'src/app/services/notifications/notification.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-notifications-panel',
  templateUrl: './notifications-panel.component.html',
  styleUrls: ['./notifications-panel.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('200ms ease-in', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ]
})
export class NotificationsPanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  notifications: Notification[] = [];
  unreadCount = 0;
  isConnected = false;
  isOpen = false;
  selectedFilter = 'all';
  filteredNotifications: Notification[] = [];

  filterOptions = [
    { value: 'all', label: 'Toutes', icon: 'notifications' },
    { value: 'unread', label: 'Non lues', icon: 'notifications_active' },
    { value: 'success', label: 'Succès', icon: 'check_circle' },
    { value: 'warning', label: 'Avertissements', icon: 'warning' },
    { value: 'error', label: 'Erreurs', icon: 'error' },
    { value: 'info', label: 'Informations', icon: 'info' }
  ];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscribeToNotifications();
    this.subscribeToUnreadCount();
    this.subscribeToConnectionStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToNotifications(): void {
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
        this.applyFilter();
      });
  }

  private subscribeToUnreadCount(): void {
    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  private subscribeToConnectionStatus(): void {
    this.notificationService.getConnectionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isConnected = status;
      });
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  closePanel(): void {
    this.isOpen = false;
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  private applyFilter(): void {
    switch (this.selectedFilter) {
      case 'unread':
        this.filteredNotifications = this.notifications.filter(n => !n.read);
        break;
      case 'success':
      case 'warning':
      case 'error':
      case 'info':
        this.filteredNotifications = this.notifications.filter(n => n.type === this.selectedFilter);
        break;
      default:
        this.filteredNotifications = this.notifications;
    }
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  removeNotification(notification: Notification): void {
    this.notificationService.removeNotification(notification.id);
  }

  clearAllNotifications(): void {
    this.notificationService.clearAllNotifications();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'primary';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'priority_high';
      case 'medium': return 'remove';
      case 'low': return 'keyboard_arrow_down';
      default: return 'remove';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      case 'low': return 'primary';
      default: return 'primary';
    }
  }

  formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    return timestamp.toLocaleDateString('fr-FR');
  }

  onNotificationClick(notification: Notification): void {
    this.markAsRead(notification);
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  }

  getSelectedFilterLabel(): string {
    const filter = this.filterOptions.find(f => f.value === this.selectedFilter);
    return filter ? filter.label : 'Toutes';
  }

  getSelectedFilterIcon(): string {
    const filter = this.filterOptions.find(f => f.value === this.selectedFilter);
    return filter ? filter.icon : 'notifications';
  }

  // Méthodes pour les tests et démonstration
  addTestNotification(): void {
    const types: ('success' | 'warning' | 'error' | 'info')[] = ['success', 'warning', 'error', 'info'];
    const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    const categories = ['system', 'marche', 'fournisseur', 'export'];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    this.notificationService.addNotification({
      type: randomType,
      title: 'Notification de test',
      message: `Ceci est une notification de test de type ${randomType}`,
      priority: randomPriority,
      category: randomCategory
    });
  }
}
