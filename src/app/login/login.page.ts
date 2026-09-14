import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonContent, IonInput } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonButton, IonInput, IonCard, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  isSignUp = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToSignUp(): void {
    this.isSignUp = true;
  }

  goToSignIn(): void {
    this.isSignUp = false;
  }

  goToGetStarted(): void {
    this.router.navigateByUrl('/get-started');
  }

  goToHome(): void {
    this.router.navigateByUrl('/home');
  }

}
