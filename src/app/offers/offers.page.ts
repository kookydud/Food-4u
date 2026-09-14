import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
  imports: [CommonModule, IonContent],
})
export class OffersPage {
  offers = [
    { title: '50% OFF', text: 'Use code FOOD4U on your first 3 orders.' },
    { title: 'Free Delivery', text: 'For orders above $25 this week.' },
  ];

  constructor(private readonly router: Router) {}

  goHome(): void {
    this.router.navigateByUrl('/home');
  }
}
