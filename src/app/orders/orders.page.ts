import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LocalDataService, StoredOrder } from '../services/local-data.service';
import { Restaurant, RestaurantService } from '../services/restaurant.service';
import { navigationItems } from '../shared/app-data';

type OrderGroup = {
  groupId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  orders: StoredOrder[];
  totalAmount: string;
  status: string;
  createdAt: string;
};

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  imports: [CommonModule, IonContent],
})
export class OrdersPage implements OnInit, OnDestroy {
  orders: StoredOrder[] = [];
  orderNotice = '';
  navigation = navigationItems;
  private orderSubscription?: Subscription;

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

    this.orderSubscription = this.localDataService.watchOrderChanges().subscribe(() => {
      this.refreshOrders();
    });

    this.refreshOrders();
  }

  ngOnDestroy(): void {
    this.orderSubscription?.unsubscribe();
  }

  ionViewWillEnter(): void {
    if (this.localDataService.isSignedIn()) {
      this.refreshOrders();
    }
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  get currentOrderGroups(): OrderGroup[] {
    return this.buildOrderGroups(this.orders.filter((order) => order.status !== 'Delivered')).slice(0, 5);
  }

  get pastOrderGroups(): OrderGroup[] {
    return this.buildOrderGroups(this.orders.filter((order) => order.status === 'Delivered')).slice(0, 5);
  }

  browseRestaurants(): void {
    this.goHome();
  }

  cancelCurrentOrder(group: OrderGroup): void {
    if (!this.localDataService.removeOrderGroupForCurrentUser(group.groupId)) {
      this.orderNotice = 'Unable to cancel that current order.';
    }
  }

  removePastOrder(group: OrderGroup): void {
    if (!this.localDataService.removeOrderGroupForCurrentUser(group.groupId)) {
      this.orderNotice = 'Unable to remove that past order.';
    }
  }

  orderAgain(group: OrderGroup): void {
    if (!group.restaurantId) {
      this.orderNotice = 'Unable to find that restaurant for reorder.';
      return;
    }

    const reordered = this.localDataService.reorderPastOrderGroupToCart(group.restaurantId, group.orders);

    if (!reordered) {
      this.orderNotice = 'Unable to rebuild that order in your cart.';
      return;
    }

    this.orderNotice = `${group.restaurantName} was copied back to your cart.`;
    this.router.navigateByUrl(`/restaurant/${group.restaurantId}`, {
      state: {
        forceMealsSection: true,
        cartRefreshToken: Date.now(),
        cartItems: this.localDataService.getMealCartForCurrentUser(group.restaurantId),
      },
    });
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

  private refreshOrders(): void {
    this.orders = this.localDataService.getOrdersForCurrentUser();
    this.orderNotice = '';

    const navigationState = history.state as { recentOrderRestaurantName?: string; [key: string]: unknown } | undefined;

    if (navigationState?.recentOrderRestaurantName) {
      this.orderNotice = `${navigationState.recentOrderRestaurantName} is now in Current Orders.`;
      const { recentOrderRestaurantName: _ignored, ...rest } = navigationState;
      history.replaceState(rest, '');
    }
  }

  getOrderItemLabel(order: StoredOrder): string {
    if (order.mealName) {
      const orderSize = order.size ?? 'Regular';
      const quantity = order.quantity ?? 1;
      return `${order.mealName} (${orderSize}${order.spicy ? ', Spicy' : ''}) x${quantity}`;
    }

    const restaurantName = order.restaurantName ?? this.extractRestaurantName(order.title);
    return order.title.startsWith(`${restaurantName} - `)
      ? order.title.slice(`${restaurantName} - `.length)
      : order.title;
  }

  trackOrderGroup(_: number, group: OrderGroup): string {
    return group.groupId;
  }

  private extractRestaurantName(title: string): string {
    return title.split(' - ')[0]?.trim() || title;
  }

  private buildOrderGroups(orders: StoredOrder[]): OrderGroup[] {
    const groups = orders.reduce<Map<string, StoredOrder[]>>((map, order) => {
      const groupId = order.orderGroupId ?? `legacy-${order.id}`;
      const current = map.get(groupId) ?? [];
      map.set(groupId, [...current, order]);
      return map;
    }, new Map<string, StoredOrder[]>());

    return Array.from(groups.entries())
      .map(([groupId, groupOrders]) => {
        const primaryOrder = groupOrders[0];
        const restaurantName = primaryOrder.restaurantName ?? this.extractRestaurantName(primaryOrder.title);
        const restaurant = this.getRestaurant(restaurantName, primaryOrder.restaurantId);
        const createdAt = groupOrders
          .map((order) => order.createdAt)
          .sort((first, second) => new Date(second).getTime() - new Date(first).getTime())[0] ?? primaryOrder.createdAt;

        return {
          groupId,
          restaurantId: restaurant?.id ?? primaryOrder.restaurantId ?? '',
          restaurantName,
          restaurantImage: restaurant?.image ?? 'assets/icon/salad.jpg',
          orders: groupOrders,
          totalAmount: this.formatCurrency(groupOrders.reduce((sum, order) => sum + this.parseCurrency(order.amount), 0)),
          status: groupOrders.some((order) => order.status !== 'Delivered')
            ? groupOrders.find((order) => order.status !== 'Delivered')?.status ?? 'Preparing'
            : 'Delivered',
          createdAt,
        } satisfies OrderGroup;
      })
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  }

  private getRestaurant(restaurantName: string, restaurantId?: string): Restaurant | undefined {
    if (restaurantId) {
      const exactRestaurant = this.restaurantService.getRestaurantById(restaurantId);

      if (exactRestaurant) {
        return exactRestaurant;
      }
    }

    return this.restaurantService.getRestaurants().find((restaurant) => restaurant.name === restaurantName);
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
