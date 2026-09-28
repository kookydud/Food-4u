import { Injectable } from '@angular/core';

export type VoucherDiscountType = 'fixed' | 'percent';

export type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minimumSubtotal: number;
  restaurantIds?: string[];
};

export type VoucherState = {
  voucher: Voucher;
  canUse: boolean;
  reason?: string;
  discountAmount: number;
};

@Injectable({
  providedIn: 'root',
})
export class VoucherService {
  private readonly vouchers: Voucher[] = [
    {
      id: 'save25',
      code: 'SAVE25',
      title: 'Save ₱25',
      description: 'Use on any restaurant order of ₱250 or more.',
      discountType: 'fixed',
      discountValue: 25,
      minimumSubtotal: 250,
    },
    {
      id: 'bella10',
      code: 'BELLA10',
      title: 'Bella Napoli 10% Off',
      description: 'For Bella Napoli orders of ₱300 or more.',
      discountType: 'percent',
      discountValue: 10,
      minimumSubtotal: 300,
      restaurantIds: ['bella-napoli'],
    },
    {
      id: 'sakura30',
      code: 'SAKURA30',
      title: 'Sakura Garden ₱30 Off',
      description: 'Applicable to Sakura Garden orders of ₱300 or more.',
      discountType: 'fixed',
      discountValue: 30,
      minimumSubtotal: 300,
      restaurantIds: ['sakura-garden'],
    },
    {
      id: 'burger15',
      code: 'BURGER15',
      title: 'Burger Lab 15% Off',
      description: 'For Burger Lab orders of ₱250 or more.',
      discountType: 'percent',
      discountValue: 15,
      minimumSubtotal: 250,
      restaurantIds: ['the-burger-lab'],
    },
    {
      id: 'spice40',
      code: 'SPICE40',
      title: 'Spice Route ₱40 Off',
      description: 'For Spice Route orders of ₱250 or more.',
      discountType: 'fixed',
      discountValue: 40,
      minimumSubtotal: 250,
      restaurantIds: ['spice-route'],
    },
  ];

  getVouchers(): Voucher[] {
    return this.vouchers.map((voucher) => ({ ...voucher }));
  }

  getVoucherById(voucherId: string): Voucher | undefined {
    return this.vouchers.find((voucher) => voucher.id === voucherId);
  }

  getVoucherState(voucherId: string, restaurantId: string, subtotal: number): VoucherState | null {
    const voucher = this.getVoucherById(voucherId);

    if (!voucher) {
      return null;
    }

    const canUse = this.canUseVoucher(voucher, restaurantId, subtotal);

    return {
      voucher,
      canUse,
      reason: canUse ? undefined : this.getVoucherReason(voucher, restaurantId, subtotal),
      discountAmount: canUse ? this.calculateDiscount(voucher, subtotal) : 0,
    };
  }

  getVoucherStatesForRestaurant(restaurantId: string, subtotal: number): VoucherState[] {
    return this.vouchers.map((voucher) => ({
      voucher,
      canUse: this.canUseVoucher(voucher, restaurantId, subtotal),
      reason: this.getVoucherReason(voucher, restaurantId, subtotal),
      discountAmount: this.calculateDiscount(voucher, subtotal),
    }));
  }

  canUseVoucher(voucher: Voucher, restaurantId: string, subtotal: number): boolean {
    if (subtotal < voucher.minimumSubtotal) {
      return false;
    }

    if (voucher.restaurantIds && voucher.restaurantIds.length && !voucher.restaurantIds.includes(restaurantId)) {
      return false;
    }

    return true;
  }

  getVoucherReason(voucher: Voucher, restaurantId: string, subtotal: number): string {
    if (subtotal < voucher.minimumSubtotal) {
      return `Needs a minimum order of ₱${voucher.minimumSubtotal.toFixed(2)}.`;
    }

    if (voucher.restaurantIds && voucher.restaurantIds.length && !voucher.restaurantIds.includes(restaurantId)) {
      return 'Not valid for this restaurant.';
    }

    return 'Unavailable for this order.';
  }

  calculateDiscount(voucher: Voucher, subtotal: number): number {
    if (subtotal <= 0) {
      return 0;
    }

    if (voucher.discountType === 'percent') {
      return Math.min(subtotal, (subtotal * voucher.discountValue) / 100);
    }

    return Math.min(subtotal, voucher.discountValue);
  }
}
