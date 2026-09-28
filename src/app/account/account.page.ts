import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LocalDataService } from '../services/local-data.service';
import { PhoneAuthService } from '../services/phone-auth.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  imports: [CommonModule, IonContent],
})
export class AccountPage implements OnInit, OnDestroy {
  profile = {
    name: 'Foodie User',
    email: 'foodie@food4u.com',
  };

  orderCount = 0;
  activeCartRestaurantId = '';
  private orderSubscription?: Subscription;

  perks = [
    {
      title: 'Personal taste',
      description: 'Set allergies, spice level, and food preferences for a more tailored app experience.',
      icon: '✨',
      route: '/personal-taste',
    },
    {
      title: 'Food4U Pro',
      description: 'Unlock premium perks, faster access, and special member-only features.',
      icon: 'PRO',
      route: '/food4u-pro',
    },
    {
      title: 'Vouchers',
      description: 'Check available vouchers and offers you can use on your next order.',
      icon: '%',
      route: '/account-vouchers',
    },
    {
      title: 'Invite friends',
      description: 'Share Food4U with friends and grow your rewards together.',
      icon: '↗',
      route: '/invite-friends',
    },
  ];

  generalItems = [
    {
      title: 'Help center',
      description: 'Get support, find answers, and contact the team.',
      route: '/help-center',
    },
    {
      title: 'Terms and policies',
      description: 'Review the rules, privacy details, and app policies.',
      route: '/terms-policies',
    },
  ];

  navigation = [
    { label: 'Home', iconImage: 'assets/icon/home.png', route: '/home' },
    { label: 'Search', iconImage:'assets/icon/search.png', route: '/search' },
    { label: 'Orders', iconImage: 'assets/icon/order.png', route: '/orders' },
    { label: 'Offers', iconImage: 'assets/icon/offers.png', route: '/offers' },
    { label: 'Account', iconImage: 'assets/icon/account.png', route: '/account' },
  ];

  constructor(
    private readonly router: Router,
    private readonly localDataService: LocalDataService,
    private readonly phoneAuthService: PhoneAuthService,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.orderSubscription = this.localDataService.watchOrderChanges().subscribe(() => {
      this.refreshAccountData();
    });

    this.refreshAccountData();
  }

  ngOnDestroy(): void {
    this.orderSubscription?.unsubscribe();
  }

  private refreshAccountData(): void {
    const currentUser = this.localDataService.getCurrentUser();

    if (currentUser) {
      this.profile = {
        name: currentUser.fullName,
        email: currentUser.email,
      };
    }

    this.orderCount = this.localDataService.getActiveOrderGroupCountForCurrentUser();
    this.activeCartRestaurantId = this.localDataService.getMealCartRestaurantIdsForCurrentUser()[0] ?? '';
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  openOrders(): void {
    this.router.navigateByUrl('/orders');
  }

  openAddress(): void {
    this.router.navigateByUrl('/address');
  }

  openCart(): void {
    this.router.navigateByUrl('/account-cart');
  }

  openSection(route: string): void {
    this.router.navigateByUrl(route);
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  isTabActive(label: string): boolean {
    const routeMap: Record<string, string> = {
      Home: '/home',
      Search: '/search',
      Orders: '/orders',
      Offers: '/offers',
      Account: '/account',
    };

    return this.router.url.startsWith(routeMap[label] ?? '');
  }

  logOut(): void {
    this.localDataService.signOut();
    this.phoneAuthService.resetFlow();
    this.router.navigateByUrl('/login', {
      replaceUrl: true,
      state: { resetForms: true },
    });
  }
}
