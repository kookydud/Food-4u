import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { OrderTrackingService } from './services/order-tracking.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(orderTrackingService: OrderTrackingService) {
    orderTrackingService.start();
  }
}
