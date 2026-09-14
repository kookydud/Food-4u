import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  imports: [CommonModule, IonContent],
})
export class SearchPage {
  constructor(private readonly router: Router) {}

  goHome(): void {
    this.router.navigateByUrl('/home');
  }
}
