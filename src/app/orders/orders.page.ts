import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  imports: [CommonModule, IonContent],
})
export class OrdersPage {
  orders = [
    { title: 'Bella Napoli', status: 'On the way', amount: '$18.90' },
    { title: 'The Burger Lab', status: 'Delivered', amount: '$16.20' },
  ];

  constructor(private readonly router: Router) {}

  goHome(): void {
    this.router.navigateByUrl('/home');
  }
}
