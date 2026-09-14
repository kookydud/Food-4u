import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonContent, IonInput } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [IonContent, IonButton, IonInput, IonCard, CommonModule, FormsModule],
})
export class SignupPage {
  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
