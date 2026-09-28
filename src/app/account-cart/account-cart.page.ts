import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LocalDataService, StoredMealCartItem } from '../services/local-data.service';
import { RestaurantService } from '../services/restaurant.service';
import { navigationItems } from '../shared/app-data';

type CartGroup = {
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  items: StoredMealCartItem[];
  totalAmount: string;
};

@Component({
  selector: 'app-account-cart',
  templateUrl: './account-cart.page.html',
  styleUrls: ['./account-cart.page.scss'],
  imports: [CommonModule, IonContent],
})
export class AccountCartPage implements OnInit, OnDestroy {
  cartGroups: CartGroup[] = [];
  navigation = navigationItems;
  private cartSubscription?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly localDataService: LocalDataService,
    private readonly restaurantService: RestaurantService,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.cartSubscription = this.localDataService.watchMealCartChanges().subscribe(() => {
      this.refreshCartGroups();
    });

    this.refreshCartGroups();
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  ionViewWillEnter(): void {
    if (this.localDataService.isSignedIn()) {
      this.refreshCartGroups();
    }
  }

  goHome(): void {
    this.router.navigateByUrl('/account');
  }

  openCartGroup(restaurantId: string): void {
    this.router.navigateByUrl(`/restaurant-cart/${restaurantId}`);
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

  get totalActiveCarts(): number {
    return this.cartGroups.length;
  }

  getItemLabel(item: StoredMealCartItem): string {
    const spicyText = item.spicy ? ', Spicy' : '';
    return `${item.mealName} (${item.size}${spicyText}) x${item.quantity}`;
  }

  private refreshCartGroups(): void {
    const restaurantIds = this.localDataService.getMealCartRestaurantIdsForCurrentUser();

    this.cartGroups = restaurantIds
      .map((restaurantId) => {
        const restaurant = this.restaurantService.getRestaurantById(restaurantId);
        const items = this.localDataService.getMealCartForCurrentUser(restaurantId);

        if (!restaurant || !items.length) {
          return null;
        }

        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          restaurantImage: restaurant.image,
          items,
          totalAmount: this.formatCurrency(
            items.reduce((sum, item) => sum + this.parseCurrency(item.mealPrice) * item.quantity, 0),
          ),
        } satisfies CartGroup;
      })
      .filter((group): group is CartGroup => group !== null)
      .sort((first, second) => first.restaurantName.localeCompare(second.restaurantName));
  }

  private parseCurrency(amount: string): number {
    const cleaned = amount.replace(/[^\d.]/g, '');
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : 0;
  }

  private formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2)}`;
  }
}