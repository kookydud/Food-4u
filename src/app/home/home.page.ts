import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService } from '../services/local-data.service';
import { Restaurant, RestaurantMeal, RestaurantService } from '../services/restaurant.service';
import { Category, foodCategories, navigationItems } from '../shared/app-data';

type HomeMeal = {
  restaurantId: string;
  restaurantName: string;
  mealName: string;
  mealPrice: string;
  mealImage: string;
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonContent],
})
export class HomePage implements OnInit {
  selectedCategory = 'Offers';
  searchTerm = '';
  orderNotice = '';

  categories: Category[] = foodCategories;

  restaurants: Restaurant[] = this.restaurantService.getRestaurants();

  navigation = navigationItems;

  constructor(
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly localDataService: LocalDataService,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const saved = this.localDataService.getSearchStateForCurrentUser();
    this.searchTerm = '';
    this.selectedCategory = saved.selectedCategory;
  }

  get filteredRestaurants() {
    const categoryFiltered = this.restaurantService.getRestaurantsByCategory(this.selectedCategory);
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return categoryFiltered;
    }

    return categoryFiltered.filter((restaurant) => {
      const haystack = `${restaurant.name} ${restaurant.cuisine} ${restaurant.category}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }

  get homeMeals(): HomeMeal[] {
    const restaurants = this.selectedCategory === 'Offers'
      ? this.restaurantService.getRestaurants()
      : this.restaurantService.getRestaurantsByCategory(this.selectedCategory);

    return restaurants.flatMap((restaurant) => {
      const meals = this.restaurantService.getMealsByRestaurant(restaurant.id).slice(0, 2);

      return meals.map((meal) => ({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        mealName: meal.name,
        mealPrice: meal.price,
        mealImage: meal.image,
      }));
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.localDataService.saveSearchStateForCurrentUser(this.searchTerm, this.selectedCategory);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.localDataService.saveSearchStateForCurrentUser(this.searchTerm, this.selectedCategory);
  }

  orderFromRestaurant(restaurant: Restaurant): void {
    this.localDataService.saveRestaurantVisit(restaurant.name);
    this.router.navigateByUrl(`/restaurant/${restaurant.id}`);
  }

  openMealRestaurant(restaurantId: string): void {
    this.openRestaurant(restaurantId);
  }

  openRestaurant(restaurantId: string): void {
    this.router.navigateByUrl(`/restaurant/${restaurantId}`);
  }

  navigateTo(route: string): void {
    if (route === '/search') {
      this.goToSearch();
      return;
    }

    this.router.navigateByUrl(route);
  }

  goToAddress(): void {
    this.router.navigateByUrl('/address');
  }

  goToSearch(): void {
    this.router.navigateByUrl('/search', {
      state: {
        focusSearch: true,
        searchTerm: this.searchTerm,
      },
    });
  }

  isTabActive(label: string): boolean {
    const routeMap: Record<string, string> = {
      Home: '/home',
      Search: '/search',
      Orders: '/orders',
      Offers: '/offers',
      Account: '/account',
    };

    return this.router.url.startsWith(routeMap[label] ?? '');
  }

  private extractAmountFromCuisine(cuisine: string): string {
    const firstSegment = cuisine.split('·')[0]?.trim();
    return firstSegment || '$0.00';
  }
}
