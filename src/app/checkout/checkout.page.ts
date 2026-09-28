import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService, StoredDeliveryAddress, StoredMealCartItem } from '../services/local-data.service';
import { Restaurant, RestaurantService } from '../services/restaurant.service';
import { VoucherService } from '../services/voucher.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class CheckoutPage implements OnInit {
  restaurant?: Restaurant;
  cartItems: StoredMealCartItem[] = [];
  selectedAddress: StoredDeliveryAddress | null = null;
  deliveryAddress = '';
  deliveryNote = '';
  selectedPaymentMethod = 'Cash on Delivery';
  selectedVoucherId = '';
  errorMessage = '';
  private restaurantId = '';

  readonly paymentMethods = ['Cash on Delivery', 'GCash', 'Credit/Debit Card'];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly localDataService: LocalDataService,
    private readonly voucherService: VoucherService,
  ) {}

  ngOnInit(): void {
    this.loadCheckoutData();
  }

  ionViewWillEnter(): void {
    this.loadCheckoutData();
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + this.parseCurrency(item.mealPrice) * item.quantity, 0);
  }

  get discountAmount(): number {
    if (!this.selectedVoucherId || !this.restaurant) {
      return 0;
    }

    return this.voucherService.getVoucherState(this.selectedVoucherId, this.restaurant.id, this.subtotal)?.discountAmount ?? 0;
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.discountAmount);
  }

  get selectedVoucherLabel(): string {
    const voucher = this.voucherService.getVoucherById(this.selectedVoucherId);
    return voucher ? `${voucher.code} · ${voucher.title}` : 'No voucher selected';
  }

  get selectedVoucherDescription(): string {
    const voucher = this.voucherService.getVoucherById(this.selectedVoucherId);
    return voucher?.description ?? 'Optional';
  }

  goBack(): void {
    if (!this.restaurant) {
      this.router.navigateByUrl('/home');
      return;
    }

    this.router.navigateByUrl(`/restaurant-cart/${this.restaurant.id}`);
  }

  openVoucherPage(): void {
    if (!this.restaurant) {
      return;
    }

    this.saveDraft();
    this.router.navigateByUrl(`/vouchers/${this.restaurant.id}`, {
      state: {
        subtotal: this.subtotal,
      },
    });
  }

  openAddressPage(): void {
    if (!this.restaurant) {
      return;
    }

    this.saveDraft();
    this.router.navigateByUrl('/address', {
      state: {
        returnRestaurantCartId: this.restaurant.id,
      },
    });
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
    this.saveDraft();
  }

  placeOrder(): void {
    if (!this.restaurant || !this.cartItems.length) {
      return;
    }

    const selectedVoucher = this.voucherService.getVoucherState(this.selectedVoucherId, this.restaurant.id, this.subtotal);

    if (this.selectedVoucherId && !selectedVoucher?.canUse) {
      this.errorMessage = selectedVoucher?.reason ?? 'The selected voucher cannot be used for this order.';
      return;
    }

    this.saveDraft();
    this.localDataService.checkoutMealCartForCurrentUser(this.restaurant.name, this.restaurant.id, 'Preparing');
    this.router.navigateByUrl('/orders', {
      state: {
        recentOrderRestaurantName: this.restaurant.name,
      },
    });
  }

  formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2)}`;
  }

  getItemTotal(item: StoredMealCartItem): string {
    return this.formatCurrency(this.parseCurrency(item.mealPrice) * item.quantity);
  }

  private loadCheckoutData(): void {
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

    this.selectedAddress = this.localDataService.getPrimaryAddressForCurrentUser();
    const draft = this.localDataService.getCheckoutDraftForCurrentUser(restaurant.id);
    const navigationState = (history.state ?? {}) as { selectedVoucherId?: string };

    this.deliveryAddress = draft.address || (this.selectedAddress ? this.formatAddress(this.selectedAddress) : '');
    this.deliveryNote = draft.note ?? '';
    this.selectedPaymentMethod = draft.paymentMethod || 'Cash on Delivery';
    this.selectedVoucherId = navigationState.selectedVoucherId ?? draft.voucherId ?? '';
    this.errorMessage = '';
    this.saveDraft();
  }

  saveDraft(): void {
    if (!this.restaurant) {
      return;
    }

    this.localDataService.saveCheckoutDraftForCurrentUser(this.restaurant.id, {
      address: this.deliveryAddress,
      note: this.deliveryNote,
      paymentMethod: this.selectedPaymentMethod,
      voucherId: this.selectedVoucherId,
    });
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
