import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService, StoredMealCartItem } from '../services/local-data.service';
import { Restaurant, RestaurantService } from '../services/restaurant.service';
import { VoucherService } from '../services/voucher.service';

@Component({
  selector: 'app-payment-gcash',
  templateUrl: './payment-gcash.page.html',
  styleUrls: ['./payment-gcash.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class PaymentGcashPage implements OnInit {
  restaurant?: Restaurant;
  cartItems: StoredMealCartItem[] = [];
  gcashName = '';
  gcashNumber = '';
  errorMessage = '';
  private restaurantId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly localDataService: LocalDataService,
    private readonly voucherService: VoucherService,
  ) {}

  ngOnInit(): void {
    this.loadPaymentContext();
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + this.parseCurrency(item.mealPrice) * item.quantity, 0);
  }

  get discountAmount(): number {
    if (!this.restaurant) {
      return 0;
    }

    const draft = this.localDataService.getCheckoutDraftForCurrentUser(this.restaurant.id);

    if (!draft.voucherId) {
      return 0;
    }

    return this.voucherService.getVoucherState(draft.voucherId, this.restaurant.id, this.subtotal)?.discountAmount ?? 0;
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.discountAmount);
  }

  goBack(): void {
    if (!this.restaurant) {
      this.router.navigateByUrl('/home');
      return;
    }

    this.router.navigateByUrl(`/checkout/${this.restaurant.id}`);
  }

  continueToVerification(): void {
    if (!this.restaurant || !this.cartItems.length) {
      return;
    }

    const normalizedNumber = this.gcashNumber.replace(/\D/g, '');

    if (!this.gcashName.trim()) {
      this.errorMessage = 'Please enter the GCash account name.';
      return;
    }

    if (!/^09\d{9}$/.test(normalizedNumber)) {
      this.errorMessage = 'Please enter a valid GCash number (09XXXXXXXXX).';
      return;
    }

    const draft = this.localDataService.getCheckoutDraftForCurrentUser(this.restaurant.id);

    if (draft.voucherId) {
      const voucherState = this.voucherService.getVoucherState(draft.voucherId, this.restaurant.id, this.subtotal);

      if (!voucherState?.canUse) {
        this.errorMessage = voucherState?.reason ?? 'The selected voucher cannot be used for this order.';
        return;
      }
    }

    this.localDataService.saveCheckoutDraftForCurrentUser(this.restaurant.id, {
      address: draft.address,
      note: draft.note,
      paymentMethod: 'GCash',
      voucherId: draft.voucherId,
    });

    this.router.navigateByUrl(`/payment-verification/${this.restaurant.id}`, {
      state: {
        paymentMethod: 'GCash',
      },
    });
  }

  formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2)}`;
  }

  private loadPaymentContext(): void {
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
    this.restaurantId = restaurant.id;
    this.cartItems = this.localDataService.getMealCartForCurrentUser(restaurant.id);

    if (!this.cartItems.length) {
      this.router.navigateByUrl(`/restaurant-cart/${restaurant.id}`);
      return;
    }

    const draft = this.localDataService.getCheckoutDraftForCurrentUser(restaurant.id);
    if (draft.paymentMethod !== 'GCash') {
      this.localDataService.saveCheckoutDraftForCurrentUser(restaurant.id, {
        address: draft.address,
        note: draft.note,
        paymentMethod: 'GCash',
        voucherId: draft.voucherId,
      });
    }

    this.errorMessage = '';
  }

  private parseCurrency(amount: string): number {
    const cleaned = amount.replace(/[^\d.]/g, '');
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : 0;
  }
}
