import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService } from '../services/local-data.service';

type ProPlan = {
  name: string;
  price: string;
  summary: string;
};

@Component({
  selector: 'app-food4u-pro',
  templateUrl: './food4u-pro.page.html',
  styleUrls: ['./food4u-pro.page.scss'],
  imports: [CommonModule, IonContent],
})
export class Food4uProPage implements OnInit {
  plans: ProPlan[] = [
    { name: 'Monthly', price: 'P149/mo', summary: 'Priority support and member-only vouchers.' },
    { name: 'Quarterly', price: 'P399/3 mo', summary: 'Includes occasional free delivery weekends.' },
  ];

  selectedPlan = 'Monthly';
  notice = '';

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

  choosePlan(planName: string): void {
    this.selectedPlan = planName;
    this.notice = `${planName} plan selected. Checkout is coming soon.`;
  }
}
