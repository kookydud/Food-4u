import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  imports: [CommonModule, IonContent],
})
export class AccountPage {
  profile = {
    name: 'Foodie User',
    email: 'foodie@food4u.com',
  };

  constructor(private readonly router: Router) {}

  goHome(): void {
    this.router.navigateByUrl('/home');
  }
}
