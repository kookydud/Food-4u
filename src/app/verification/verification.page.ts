import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput } from '@ionic/angular';
import { PhoneAuthService } from '../services/phone-auth.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
  imports: [IonContent, IonInput, CommonModule, FormsModule],
})
export class VerificationPage {
  verificationCode = '';
  isVerifying = false;
  isResending = false;
  errorMessage = '';

  constructor(
    private readonly router: Router,
    private readonly phoneAuthService: PhoneAuthService,
  ) {}

  get phoneNumberLabel(): string {
    const phoneNumber = this.phoneAuthService.getPendingPhoneNumber();
    return phoneNumber ? phoneNumber : '+63 912 345 6789';
  }

  get demoCode(): string {
    return this.phoneAuthService.getDemoCode();
  }

  async verifyCode(): Promise<void> {
    if (!this.verificationCode.trim()) {
      this.errorMessage = 'Please enter the 6-digit verification code.';
      return;
    }

    this.isVerifying = true;
    this.errorMessage = '';

    try {
      await this.phoneAuthService.verifyCode(this.verificationCode);
      this.router.navigateByUrl('/home');
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'The verification code is invalid.';
    } finally {
      this.isVerifying = false;
    }
  }

  async resendCode(): Promise<void> {
    this.isResending = true;
    this.errorMessage = '';

    try {
      await this.phoneAuthService.resendCode();
      this.errorMessage = `Demo mode: use the code ${this.phoneAuthService.getDemoCode()} when verifying.`;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to resend the verification code.';
    } finally {
      this.isResending = false;
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/get-started');
  }
}
