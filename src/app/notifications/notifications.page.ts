import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AppNotification, LocalDataService } from '../services/local-data.service';
import { navigationItems } from '../shared/app-data';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['../orders/orders.page.scss', './notifications.page.scss'],
  imports: [CommonModule, IonContent],
})
export class NotificationsPage implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  navigation = navigationItems;
  private subscription?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly localDataService: LocalDataService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.subscription = this.localDataService.watchNotificationChanges().subscribe(() => {
      this.refresh();
      this.changeDetector.markForCheck();
    });
    this.refresh();
  }

  ionViewWillEnter(): void {
    this.refresh();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.read).length;
  }

  openNotification(notification: AppNotification): void {
    this.localDataService.markNotificationReadForCurrentUser(notification.id);

    if (notification.groupId && this.localDataService.getOrderTrackingForCurrentUser(notification.groupId)) {
      this.router.navigateByUrl(`/track/${notification.groupId}`);
    }
  }

  markAllRead(): void {
    this.localDataService.markAllNotificationsReadForCurrentUser();
  }

  clearAll(): void {
    this.localDataService.clearNotificationsForCurrentUser();
  }

  formatWhen(createdAt: string): string {
    const seconds = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 1000);

    if (seconds < 60) {
      return 'Just now';
    }

    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} min ago`;
    }

    if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)} hr ago`;
    }

    return new Date(createdAt).toLocaleDateString();
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  isTabActive(label: string): boolean {
    return label === 'Home';
  }

  trackNotification(_: number, notification: AppNotification): string {
    return notification.id;
  }

  private refresh(): void {
    this.notifications = this.localDataService.getNotificationsForCurrentUser();
  }
}
