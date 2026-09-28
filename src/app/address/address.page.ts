import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService, StoredDeliveryAddress } from '../services/local-data.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class AddressPage implements OnInit {
  addresses: StoredDeliveryAddress[] = [];
  editingAddressId: string | null = null;
  label = '';
  addressLine = '';
  details = '';
  private returnRestaurantCartId: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly localDataService: LocalDataService,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const state = (this.router.getCurrentNavigation()?.extras.state ?? history.state ?? {}) as {
      returnRestaurantCartId?: string;
    };

    this.returnRestaurantCartId = state.returnRestaurantCartId ?? null;
    this.refreshAddresses();
  }

  goHome(): void {
    if (this.returnRestaurantCartId) {
      this.router.navigateByUrl(`/restaurant-cart/${this.returnRestaurantCartId}`);
      return;
    }

    this.router.navigateByUrl('/home');
  }

  saveAddress(): void {
    if (!this.label.trim() || !this.addressLine.trim()) {
      return;
    }

    if (this.editingAddressId) {
      this.localDataService.updateAddressForCurrentUser(this.editingAddressId, {
        label: this.label,
        addressLine: this.addressLine,
        details: this.details,
      });
    } else {
      this.localDataService.addAddressForCurrentUser({
        label: this.label,
        addressLine: this.addressLine,
        details: this.details,
      });
    }

    this.resetForm();
    this.refreshAddresses();
  }

  editAddress(address: StoredDeliveryAddress): void {
    this.editingAddressId = address.id;
    this.label = address.label;
    this.addressLine = address.addressLine;
    this.details = address.details;
  }

  deleteAddress(addressId: string): void {
    this.localDataService.deleteAddressForCurrentUser(addressId);
    if (this.editingAddressId === addressId) {
      this.resetForm();
    }
    this.refreshAddresses();
  }

  setPrimary(addressId: string): void {
    this.localDataService.setPrimaryAddressForCurrentUser(addressId);
    this.refreshAddresses();

    if (this.returnRestaurantCartId) {
      this.router.navigateByUrl(`/restaurant-cart/${this.returnRestaurantCartId}`);
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private refreshAddresses(): void {
    this.addresses = this.localDataService.getAddressesForCurrentUser();
  }

  private resetForm(): void {
    this.editingAddressId = null;
    this.label = '';
    this.addressLine = '';
    this.details = '';
  }
}
