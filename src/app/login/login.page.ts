import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonContent, IonInput } from '@ionic/angular';
import { LocalDataService } from '../services/local-data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonButton, IonInput, IonCard, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  isSignUp = false;

  signInEmail = '';
  signInPassword = '';

  signUpFullName = '';
  signUpEmail = '';
  signUpPassword = '';
  signUpConfirmPassword = '';

  errorMessage = '';
  infoMessage = '';

  constructor(
    private readonly router: Router,
    private readonly localDataService: LocalDataService,
  ) { }

  ngOnInit() {
    this.prepareSignedOutView();
  }

  ionViewWillEnter(): void {
    this.prepareSignedOutView();
  }

  ionViewDidEnter(): void {
    if (this.localDataService.isSignedIn()) {
      return;
    }

    this.clearRenderedInputs();
  }

  private prepareSignedOutView(): void {
    if (this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/home');
      return;
    }

    this.resetAuthForms();
    this.isSignUp = false;
    this.clearRenderedInputs();
  }

  private resetAuthForms(): void {
    this.signInEmail = '';
    this.signInPassword = '';

    this.signUpFullName = '';
    this.signUpEmail = '';
    this.signUpPassword = '';
    this.signUpConfirmPassword = '';

    this.errorMessage = '';
    this.infoMessage = '';
  }

  private clearRenderedInputs(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const inputs = Array.from(document.querySelectorAll('ion-input')) as Array<{ value: string | null }>;
    inputs.forEach((input) => {
      input.value = '';
    });
  }

  goToSignUp(): void {
    this.isSignUp = true;
    this.errorMessage = '';
    this.infoMessage = '';
  }

  goToSignIn(): void {
    this.isSignUp = false;
    this.errorMessage = '';
    this.infoMessage = '';
  }

  goToGetStarted(): void {
    this.router.navigateByUrl('/get-started');
  }

  goToHome(): void {
    this.router.navigateByUrl('/home');
  }

  async signIn(): Promise<void> {
    this.errorMessage = '';
    this.infoMessage = '';

    if (!this.signInEmail.trim() || !this.signInPassword.trim()) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    const result = await this.localDataService.signIn(this.signInEmail, this.signInPassword);

    if (!result.ok) {
      this.errorMessage = result.message ?? 'Unable to sign in.';
      return;
    }

    this.goToHome();
  }

  async signUp(): Promise<void> {
    this.errorMessage = '';
    this.infoMessage = '';

    if (
      !this.signUpFullName.trim()
      || !this.signUpEmail.trim()
      || !this.signUpPassword.trim()
      || !this.signUpConfirmPassword.trim()
    ) {
      this.errorMessage = 'Please complete all sign up fields.';
      return;
    }

    if (this.signUpPassword !== this.signUpConfirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.signUpPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    const result = await this.localDataService.registerUser(
      this.signUpFullName,
      this.signUpEmail,
      this.signUpPassword,
    );

    if (!result.ok) {
      this.errorMessage = result.message ?? 'Unable to create account.';
      return;
    }

    this.signInEmail = this.signUpEmail;
    this.signInPassword = '';
    this.goToGetStarted();
  }

}
