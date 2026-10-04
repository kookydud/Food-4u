import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService, StoredMealCartItem } from '../services/local-data.service';
import { Restaurant, RestaurantService } from '../services/restaurant.service';
import { VoucherService } from '../services/voucher.service';

@Component({
  selector: 'app-payment-verification',
  templateUrl: './payment-verification.page.html',
  styleUrls: ['./payment-verification.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class PaymentVerificationPage implements OnInit {
  restaurant?: Restaurant;
  cartItems: StoredMealCartItem[] = [];
  paymentMethod = '';
  verificationCode = '';
  errorMessage = '';
  readonly testCode = '123456';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly localDataService: LocalDataService,
    private readonly voucherService: VoucherService,
  ) {}

  ngOnInit(): void {
    this.loadVerificationContext();
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

    if (this.paymentMethod === 'GCash') {
      this.router.navigateByUrl(`/payment-gcash/${this.restaurant.id}`);
      return;
    }

    this.router.navigateByUrl(`/payment-card/${this.restaurant.id}`);
  }

  verifyAndPlaceOrder(): void {
    if (!this.restaurant || !this.cartItems.length) {
      return;
    }

    if (this.verificationCode.trim() !== this.testCode) {
      this.errorMessage = 'Invalid verification code. For testing, use 123456.';
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

    const groupId = this.localDataService.checkoutMealCartForCurrentUser(this.restaurant.name, this.restaurant.id, 'Order placed', {
      address: draft.address,
      paymentMethod: this.paymentMethod,
      totalAmount: this.total,
      discountAmount: this.discountAmount,
    });
    this.router.navigateByUrl(groupId ? `/track/${groupId}` : '/orders', {
      replaceUrl: true,
      state: {
        recentOrderRestaurantName: this.restaurant.name,
      },
    });
  }

  formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2)}`;
  }

  private loadVerificationContext(): void {
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

    if (!this.cartItems.length) {
      this.router.navigateByUrl(`/restaurant-cart/${restaurant.id}`);
      return;
    }

    const state = (this.router.getCurrentNavigation()?.extras.state ?? history.state ?? {}) as {
      paymentMethod?: string;
    };

    this.paymentMethod = state.paymentMethod ?? this.localDataService.getCheckoutDraftForCurrentUser(restaurant.id).paymentMethod ?? '';

    if (this.paymentMethod !== 'GCash' && this.paymentMethod !== 'Credit/Debit Card') {
      this.router.navigateByUrl(`/checkout/${restaurant.id}`);
      return;
    }

    this.errorMessage = '';
  }

  private parseCurrency(amount: string): number {
    const cleaned = amount.replace(/[^\d.]/g, '');
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : 0;
  }
}
