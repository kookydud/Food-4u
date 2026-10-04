import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService } from '../services/local-data.service';

@Component({
  selector: 'app-invite-friends',
  templateUrl: './invite-friends.page.html',
  styleUrls: ['./invite-friends.page.scss'],
  imports: [CommonModule, IonContent],
})
export class InviteFriendsPage implements OnInit {
  referralCode = 'FOOD4U-START';
  shareMessage = '';

  constructor(
    private readonly router: Router,
    private readonly localDataService: LocalDataService,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const email = this.localDataService.getCurrentUserEmail();

    if (email) {
      const codePrefix = email.split('@')[0]?.replace(/[^A-Za-z0-9]/g, '').toUpperCase() ?? 'FOOD4U';
      this.referralCode = `${codePrefix.slice(0, 8)}-F4U`;
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/account');
  }

  async copyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.referralCode);
      this.shareMessage = 'Code copied. Share it with your friends.';
    } catch {
      this.shareMessage = 'Copy not supported on this device. Use the code manually.';
    }
  }
}
