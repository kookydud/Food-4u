import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService } from '../services/local-data.service';

@Component({
  selector: 'app-terms-policies',
  templateUrl: './terms-policies.page.html',
  styleUrls: ['./terms-policies.page.scss'],
  imports: [CommonModule, IonContent],
})
export class TermsPoliciesPage implements OnInit {
  sections = [
    {
      title: 'Platform terms',
      body: 'Using Food4U means you agree to provide accurate account information and lawful order requests.',
    },
    {
      title: 'Privacy',
      body: 'We store account and order details locally on your device for this project build and do not share them externally.',
    },
    {
      title: 'Payments and refunds',
      body: 'Voucher logic and totals are computed in-app. Final refunds remain subject to restaurant approval.',
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly localDataService: LocalDataService,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/account');
  }
}
