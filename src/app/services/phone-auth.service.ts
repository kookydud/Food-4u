import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PhoneAuthService {
  private pendingPhoneNumber = '';
  private demoCode = '123456';

  initializeRecaptcha(): null {
    return null;
  }

  getPendingPhoneNumber(): string {
    return this.pendingPhoneNumber;
  }

  getDemoCode(): string {
    return this.demoCode;
  }

  async sendCode(phoneNumber: string): Promise<void> {
    const normalizedPhone = phoneNumber.trim();

    if (!normalizedPhone) {
      throw new Error('Phone number is required.');
    }

    this.pendingPhoneNumber = normalizedPhone;
    this.demoCode = '123456';
  }

  async verifyCode(code: string): Promise<void> {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      throw new Error('Please enter the 6-digit verification code.');
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      throw new Error('The verification code must be a 6-digit number.');
    }

    if (normalizedCode !== this.demoCode) {
      throw new Error('The verification code is invalid.');
    }
  }

  async resendCode(): Promise<void> {
    if (!this.pendingPhoneNumber) {
      throw new Error('No phone number is available to resend the code.');
    }

    this.demoCode = '123456';
  }
}
