import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LocalDataService } from '../services/local-data.service';
import { Restaurant, RestaurantMeal, RestaurantService } from '../services/restaurant.service';
import { Category, foodCategories, navigationItems } from '../shared/app-data';
import {
  describeTasteReason,
  hasPersonalTaste,
  loadPersonalTasteState,
  scoreMealForTaste,
} from '../shared/personal-taste';

type HomeMeal = {
  restaurantId: string;
  restaurantName: string;
  mealName: string;
  mealPrice: string;
  mealImage: string;
};

type PickedMeal = HomeMeal & { reason: string; score: number };

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonContent],
})
export class HomePage implements OnInit, OnDestroy {
  selectedCategory = 'Offers';
  searchTerm = '';
  orderNotice = '';
  deliveryLocationLabel = 'Current Location';
  unreadNotificationCount = 0;
  hasTaste = false;
  pickedMeals: PickedMeal[] = [];
  private notificationSubscription?: Subscription;

  categories: Category[] = foodCategories;

  restaurants: Restaurant[] = this.restaurantService.getRestaurants();

  navigation = navigationItems;

  constructor(
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly localDataService: LocalDataService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const saved = this.localDataService.getSearchStateForCurrentUser();
    this.searchTerm = '';
    this.selectedCategory = saved.selectedCategory;
    this.notificationSubscription = this.localDataService
      .watchNotificationChanges()
      .subscribe(() => {
        this.refreshHeader();
        this.changeDetector.markForCheck();
      });
    this.refreshHeader();
  }

  ionViewWillEnter(): void {
    if (this.localDataService.isSignedIn()) {
      this.refreshHeader();
      this.changeDetector.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
  }

  openNotifications(): void {
    this.router.navigateByUrl('/notifications');
  }

  openPersonalTaste(): void {
    this.router.navigateByUrl('/personal-taste');
  }

  openPickedMeal(meal: PickedMeal): void {
    this.router.navigateByUrl(`/restaurant/${meal.restaurantId}`, {
      state: { highlightMealName: meal.mealName },
    });
  }

  private refreshHeader(): void {
    const primaryAddress = this.localDataService.getPrimaryAddressForCurrentUser();
    this.deliveryLocationLabel = primaryAddress
      ? `${primaryAddress.label} · ${primaryAddress.addressLine.split(',')[0]}`
      : 'Current Location';
    this.unreadNotificationCount = this.localDataService.getUnreadNotificationCountForCurrentUser();
    this.refreshPicks();
  }

  /** Ranks every meal against the saved Personal Taste; best matches first, at most one per restaurant first pass. */
  private refreshPicks(): void {
    const taste = loadPersonalTasteState();
    this.hasTaste = hasPersonalTaste(taste);

    if (!this.hasTaste) {
      this.pickedMeals = [];
      return;
    }

    const candidates: PickedMeal[] = this.restaurantService.getRestaurants().flatMap((restaurant) =>
      this.restaurantService.getMealsByRestaurant(restaurant.id).flatMap((meal) => {
        const score = scoreMealForTaste(meal, taste);
        return score === null ? [] : [{
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          mealName: meal.name,
          mealPrice: meal.price,
          mealImage: meal.image,
          reason: describeTasteReason(meal, taste),
          score: score + restaurant.rating / 10,
        }];
      }),
    );

    const ranked = candidates.sort((first, second) => second.score - first.score);
    const varied = ranked.filter((meal, index) => ranked.findIndex((other) => other.restaurantId === meal.restaurantId) === index);
    this.pickedMeals = [...varied, ...ranked.filter((meal) => !varied.includes(meal))].slice(0, 8);
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
