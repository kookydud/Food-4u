import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService } from '../services/local-data.service';
import { Voucher, VoucherService } from '../services/voucher.service';

@Component({
  selector: 'app-account-vouchers',
  templateUrl: './account-vouchers.page.html',
  styleUrls: ['./account-vouchers.page.scss'],
  imports: [CommonModule, IonContent],
})
export class AccountVouchersPage implements OnInit {
  vouchers: Voucher[] = [];

  constructor(
    private readonly router: Router,
    private readonly localDataService: LocalDataService,
    private readonly voucherService: VoucherService,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.vouchers = this.voucherService.getVouchers();
  }

  goBack(): void {
    this.router.navigateByUrl('/account');
  }

  openOffers(): void {
    this.router.navigateByUrl('/offers');
  }

  get globalVouchers(): Voucher[] {
    return this.vouchers.filter((voucher) => !voucher.restaurantIds?.length);
  }

  get restaurantVouchers(): Voucher[] {
    return this.vouchers.filter((voucher) => !!voucher.restaurantIds?.length);
  }

  formatMinimumOrder(minimumSubtotal: number): string {
    return `Min. order P${minimumSubtotal.toFixed(2)}`;
  }
}
