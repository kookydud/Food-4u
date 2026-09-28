import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService, StoredDeliveryAddress, StoredMealCartItem } from '../services/local-data.service';
import { Restaurant, RestaurantService } from '../services/restaurant.service';

@Component({
  selector: 'app-restaurant-cart',
  templateUrl: './restaurant-cart.page.html',
  styleUrls: ['./restaurant-cart.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class RestaurantCartPage implements OnInit {
  restaurant?: Restaurant;
  cartItems: StoredMealCartItem[] = [];
  address = '';
  locationNote = '';
  selectedAddress: StoredDeliveryAddress | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly localDataService: LocalDataService,
  ) {}

  ngOnInit(): void {
    this.loadCartPageData();
  }

  ionViewWillEnter(): void {
    this.loadCartPageData();
  }

  get cartCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartTotal(): string {
    const total = this.cartItems.reduce(
      (sum, item) => sum + this.parseCurrency(item.mealPrice) * item.quantity,
      0,
    );

    return `₱${total.toFixed(2)}`;
  }

  goBackToRestaurant(): void {
    if (!this.restaurant) {
      this.router.navigateByUrl('/home');
      return;
    }

    this.router.navigateByUrl(`/restaurant/${this.restaurant.id}`, {
      state: {
        forceMealsSection: true,
        cartRefreshToken: Date.now(),
        cartItems: this.cartItems,
      },
    });
  }

  editCartItem(item: StoredMealCartItem): void {
    if (!this.restaurant) {
      return;
    }

    this.router.navigate(['/meal', this.restaurant.id, item.mealName], {
      state: {
        editItem: item,
        returnToCart: true,
      },
    });
  }

  editInRestaurant(): void {
    this.goBackToRestaurant();
  }

  removeItem(itemToRemove: StoredMealCartItem): void {
    if (!this.restaurant) {
      return;
    }

    this.localDataService.removeMealCartItemForCurrentUser(this.restaurant.id, itemToRemove);
    this.cartItems = this.localDataService.getMealCartForCurrentUser(this.restaurant.id);
  }

  saveDeliveryDraft(): void {
    if (!this.restaurant) {
      return;
    }

    this.localDataService.saveCheckoutDraftForCurrentUser(this.restaurant.id, {
      address: this.selectedAddress ? this.formatAddress(this.selectedAddress) : this.address,
      note: this.locationNote,
    });
  }

  openAddressPage(): void {
    if (!this.restaurant) {
      return;
    }

    this.router.navigateByUrl('/address', {
      state: {
        returnRestaurantCartId: this.restaurant.id,
      },
    });
  }

  placeOrder(): void {
    if (!this.restaurant || !this.cartItems.length) {
      return;
    }

    this.saveDeliveryDraft();
    this.router.navigateByUrl(`/checkout/${this.restaurant.id}`);
  }

  getItemTotal(item: StoredMealCartItem): string {
    const value = this.parseCurrency(item.mealPrice) * item.quantity;
    return `₱${value.toFixed(2)}`;
  }

  private loadCartPageData(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const restaurantId = this.route.snapshot.paramMap.get('id');

    if (!restaurantId) {
      this.router.navigateByUrl('/home');
      return;
    }

    const restaurant = this.restaurantService.getRestaurantById(restaurantId);

    if (!restaurant) {
      this.router.navigateByUrl('/home');
      return;
    }

    this.restaurant = restaurant;
    this.cartItems = this.localDataService.getMealCartForCurrentUser(restaurant.id);

    this.selectedAddress = this.localDataService.getPrimaryAddressForCurrentUser();
    this.address = this.selectedAddress ? this.formatAddress(this.selectedAddress) : '';

    const draft = this.localDataService.getCheckoutDraftForCurrentUser(restaurant.id);
    this.locationNote = draft.note;
  }

  private formatAddress(address: StoredDeliveryAddress): string {
    return [address.label, address.addressLine, address.details].filter(Boolean).join(' · ');
  }

  private parseCurrency(amount: string): number {
    const cleaned = amount.replace(/[^\d.]/g, '');
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : 0;
  }
}
