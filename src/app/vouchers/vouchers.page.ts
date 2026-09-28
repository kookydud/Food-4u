import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService, StoredMealCartItem } from '../services/local-data.service';
import { Restaurant, RestaurantService } from '../services/restaurant.service';
import { VoucherService, VoucherState } from '../services/voucher.service';

@Component({
  selector: 'app-vouchers',
  templateUrl: './vouchers.page.html',
  styleUrls: ['./vouchers.page.scss'],
  imports: [CommonModule, IonContent],
})
export class VouchersPage implements OnInit {
  restaurant?: Restaurant;
  subtotal = 0;
  voucherStates: VoucherState[] = [];
  selectedVoucherId = '';
  private restaurantId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly localDataService: LocalDataService,
    private readonly voucherService: VoucherService,
  ) {}

  ngOnInit(): void {
    this.loadVoucherData();
  }

  ionViewWillEnter(): void {
    this.loadVoucherData();
  }

  goBack(): void {
    if (!this.restaurant) {
      this.router.navigateByUrl('/home');
      return;
    }

    this.router.navigateByUrl(`/checkout/${this.restaurant.id}`);
  }

  chooseVoucher(voucherId: string): void {
    if (!this.restaurant) {
      return;
    }

    this.selectedVoucherId = voucherId;
    this.saveSelection();
    this.router.navigateByUrl(`/checkout/${this.restaurant.id}`, {
      state: {
        selectedVoucherId: voucherId,
      },
    });
  }

  clearVoucher(): void {
    this.selectedVoucherId = '';
    this.saveSelection();

    if (this.restaurant) {
      this.router.navigateByUrl(`/checkout/${this.restaurant.id}`, {
        state: {
          selectedVoucherId: '',
        },
      });
    }
  }

  get applicableVouchers(): VoucherState[] {
    return this.voucherStates.filter((voucherState) => voucherState.canUse);
  }

  get unavailableVouchers(): VoucherState[] {
    return this.voucherStates.filter((voucherState) => !voucherState.canUse);
  }

  formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2)}`;
  }

  private loadVoucherData(): void {
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
    const cartItems = this.localDataService.getMealCartForCurrentUser(restaurant.id);
    this.subtotal = this.calculateSubtotal(cartItems);

    const draft = this.localDataService.getCheckoutDraftForCurrentUser(restaurant.id);
    const state = (history.state ?? {}) as { selectedVoucherId?: string; subtotal?: number };
    this.selectedVoucherId = state.selectedVoucherId ?? draft.voucherId ?? '';
    this.voucherStates = this.voucherService.getVoucherStatesForRestaurant(restaurant.id, this.subtotal);
    this.saveSelection();
  }

  private saveSelection(): void {
    if (!this.restaurant) {
      return;
    }

    const draft = this.localDataService.getCheckoutDraftForCurrentUser(this.restaurant.id);

    this.localDataService.saveCheckoutDraftForCurrentUser(this.restaurant.id, {
      address: draft.address,
      note: draft.note,
      paymentMethod: draft.paymentMethod,
      voucherId: this.selectedVoucherId,
    });
  }

  private calculateSubtotal(cartItems: StoredMealCartItem[]): number {
    return cartItems.reduce((sum, item) => sum + this.parseCurrency(item.mealPrice) * item.quantity, 0);
  }

  private parseCurrency(amount: string): number {
    const cleaned = amount.replace(/[^\d.]/g, '');
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : 0;
  }
}
