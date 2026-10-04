import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService } from '../services/local-data.service';

type FaqItem = {
  question: string;
  answer: string;
};

@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.page.html',
  styleUrls: ['./help-center.page.scss'],
  imports: [CommonModule, IonContent],
})
export class HelpCenterPage implements OnInit {
  faqs: FaqItem[] = [
    {
      question: 'How can I track my order?',
      answer: 'Open Orders from the bottom tab and check your current order updates.',
    },
    {
      question: 'How do I update my delivery address?',
      answer: 'Go to Account, tap Address, then edit or add a new saved address.',
    },
    {
      question: 'Why is my voucher unavailable?',
      answer: 'Most vouchers require a minimum subtotal or are limited to specific restaurants.',
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
