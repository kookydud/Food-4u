import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
  imports: [CommonModule, IonContent, IonButton],
})
export class AddressPage {
  addresses = [
    { label: 'Home', detail: '123 Main St, San Francisco, CA', primary: true },
    { label: 'Office', detail: '88 Market St, San Francisco, CA', primary: false },
    { label: 'Weekend', detail: '14 Bayview Ave, Oakland, CA', primary: false },
  ];

  constructor(private readonly router: Router) {}

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  addAddress(): void {
    this.addresses.push({
      label: 'New Address',
      detail: 'Add a new delivery location',
      primary: false,
    });
  }

  editAddress(index: number): void {
    const target = this.addresses[index];
    target.label = `${target.label} (Edited)`;
  }

  deleteAddress(index: number): void {
    this.addresses.splice(index, 1);
  }

  setPrimary(index: number): void {
    this.addresses = this.addresses.map((address, addressIndex) => ({
      ...address,
      primary: addressIndex === index,
    }));
  }
}
