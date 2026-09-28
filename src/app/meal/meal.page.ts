import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService, StoredMealCartItem } from '../services/local-data.service';
import { Restaurant, RestaurantMeal, RestaurantService } from '../services/restaurant.service';

@Component({
  selector: 'app-meal',
  templateUrl: './meal.page.html',
  styleUrls: ['./meal.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class MealPage implements OnInit {
  restaurant?: Restaurant;
  meal?: RestaurantMeal;

  selectedSize: 'Small' | 'Regular' | 'Large' = 'Regular';
  spicy = false;
  quantity = 1;
  notes = '';
  private editingOriginalItem: StoredMealCartItem | null = null;
  private returnToCart = false;

  readonly sizeOptions: Array<'Small' | 'Regular' | 'Large'> = ['Small', 'Regular', 'Large'];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly localDataService: LocalDataService,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const restaurantId = this.route.snapshot.paramMap.get('restaurantId');
    const mealNameParam = this.route.snapshot.paramMap.get('mealName');

    if (!restaurantId || !mealNameParam) {
      this.router.navigateByUrl('/home');
      return;
    }

    const restaurant = this.restaurantService.getRestaurantById(restaurantId);

    if (!restaurant) {
      this.router.navigateByUrl('/home');
      return;
    }

    const mealName = decodeURIComponent(mealNameParam);
    const meal = this.restaurantService
      .getMealsByRestaurant(restaurant.id)
      .find((entry) => entry.name.toLowerCase() === mealName.toLowerCase());

    if (!meal) {
      this.router.navigateByUrl(`/restaurant/${restaurant.id}`);
      return;
    }

    this.restaurant = restaurant;
    this.meal = meal;

    const state = (this.router.getCurrentNavigation()?.extras.state ?? history.state ?? {}) as {
      editItem?: StoredMealCartItem;
      returnToCart?: boolean;
    };

    if (state.editItem) {
      this.editingOriginalItem = state.editItem;
      this.selectedSize = state.editItem.size;
      this.spicy = state.editItem.spicy;
      this.quantity = Math.max(1, state.editItem.quantity);
    }

    this.returnToCart = !!state.returnToCart;
  }

  get computedMealPrice(): string {
    if (!this.meal) {
      return '₱0.00';
    }

    const basePrice = this.parseCurrency(this.meal.price);
    const sizeDelta = this.selectedSize === 'Small' ? -20 : this.selectedSize === 'Large' ? 40 : 0;
    const adjusted = Math.max(0, basePrice + sizeDelta);

    return `₱${adjusted.toFixed(2)}`;
  }

  get addToCartTotalLabel(): string {
    const unit = this.parseCurrency(this.computedMealPrice);
    const total = unit * this.quantity;
    return `Add to Cart · ₱${total.toFixed(2)}`;
  }

  increaseQuantity(): void {
    this.quantity += 1;
  }

  decreaseQuantity(): void {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  goBack(): void {
    if (!this.restaurant) {
      this.router.navigateByUrl('/home');
      return;
    }

    this.router.navigateByUrl(`/restaurant/${this.restaurant.id}`);
  }

  addToCart(): void {
    if (!this.restaurant || !this.meal) {
      return;
    }

    this.localDataService.saveRestaurantVisit(this.restaurant.name);

    if (this.editingOriginalItem) {
      this.localDataService.removeMealCartItemForCurrentUser(this.restaurant.id, this.editingOriginalItem);
    }

    this.localDataService.addMealCartItemForCurrentUser(this.restaurant.id, {
      mealName: this.meal.name,
      mealPrice: this.computedMealPrice,
      size: this.selectedSize,
      spicy: this.spicy,
      quantity: this.quantity,
    });

    if (this.returnToCart) {
      this.router.navigateByUrl(`/restaurant-cart/${this.restaurant.id}`);
      return;
    }

    this.router.navigateByUrl(`/restaurant/${this.restaurant.id}`, {
      state: {
        highlightMealName: this.meal.name,
      },
    });
  }

  private parseCurrency(amount: string): number {
    const cleaned = amount.replace(/[^\d.]/g, '');
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : 0;
  }
}
