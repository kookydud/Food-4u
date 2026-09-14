import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput } from '@ionic/angular';
import { PhoneAuthService } from '../services/phone-auth.service';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.page.html',
  styleUrls: ['./get-started.page.scss'],
  imports: [IonContent, IonInput, CommonModule, FormsModule],
})
export class GetStartedPage implements OnInit {
  prefixes = [
    { label: '🇺🇸 +1', value: '+1' },
    { label: '🇬🇧 +44', value: '+44' },
    { label: '🇦🇺 +61', value: '+61' },
    { label: '🇮🇳 +91', value: '+91' },
    { label: '🇵🇭 +63', value: '+63' },
    { label: '🇯🇵 +81', value: '+81' },
    { label: '🇰🇷 +82', value: '+82' },
    { label: '🇨🇦 +1', value: '+1' },
  ];

  selectedPrefix = '+63';
  phoneNumber = '';
  isSendingCode = false;
  errorMessage = '';
  isCaptchaReady = false;

  constructor(
    private readonly router: Router,
    private readonly phoneAuthService: PhoneAuthService,
  ) {}

  ngOnInit(): void {
    this.isCaptchaReady = false;
  }

  private updateCaptchaState(): void {
    const digits = this.phoneNumber.replace(/\D/g, '');
    const isNumberComplete = this.selectedPrefix === '+63'
      ? digits.length >= 9 && digits.length <= 12
      : digits.length >= 7;

    this.isCaptchaReady = isNumberComplete;
    this.errorMessage = isNumberComplete ? '' : this.errorMessage;
  }

  onPhoneNumberChange(): void {
    this.updateCaptchaState();
  }

  private normalizePhoneNumber(): string {
    const digits = this.phoneNumber.replace(/\D/g, '');

    if (!digits) {
      return '';
    }

    if (this.selectedPrefix === '+63') {
      const normalizedDigits = digits.replace(/^63/, '').replace(/^0/, '');
      return `+63${normalizedDigits}`;
    }

    const normalizedDigits = digits.replace(/^0+/, '');
    return `${this.selectedPrefix}${normalizedDigits}`;
  }

  async sendCode(): Promise<void> {
    const phone = this.normalizePhoneNumber();
    const digits = this.phoneNumber.replace(/\D/g, '');

    if (!phone || phone === this.selectedPrefix || digits.length < 7) {
      this.errorMessage = 'Please enter a valid mobile number.';
      return;
    }

    if (this.selectedPrefix === '+63' && digits.length < 9) {
      this.errorMessage = 'Philippines numbers should be at least 9 digits after the country code.';
      return;
    }

    if (!this.isCaptchaReady) {
      this.errorMessage = 'Please finish entering your number to start the verification challenge.';
      return;
    }

    if (!/^\+\d{10,15}$/.test(phone)) {
      this.errorMessage = 'Please enter a valid mobile number in international format.';
      return;
    }

    this.isSendingCode = true;
    this.errorMessage = '';

    try {
      await this.phoneAuthService.sendCode(phone);
      this.router.navigateByUrl('/verification');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send the verification code.';
      this.errorMessage = `We couldn’t send the code. ${message} Please try again.`;
    } finally {
      this.isSendingCode = false;
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/login');
  }
}
