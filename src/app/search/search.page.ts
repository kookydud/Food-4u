import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService, StoredOrder } from '../services/local-data.service';
import { Restaurant, RestaurantMeal, RestaurantService } from '../services/restaurant.service';
import { Category, foodCategories, navigationItems } from '../shared/app-data';

type RestaurantSearchResult = {
  restaurant: Restaurant;
  matchedMeals: RestaurantMeal[];
};

type SearchMeal = {
  restaurantId: string;
  restaurantName: string;
  mealName: string;
  mealPrice: string;
  mealImage: string;
};

type SearchedMealPreview = {
  restaurantId: string;
  restaurantName: string;
  mealName: string;
  mealPrice: string;
  mealImage: string;
};

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  imports: [CommonModule, IonContent],
})
export class SearchPage implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  searchTerm = '';
  selectedCategory = 'Offers';
  orderNotice = '';
  searchHistory: string[] = [];
  recentOrders: StoredOrder[] = [];
  private searchSaveTimer: ReturnType<typeof setTimeout> | null = null;

  categories: Category[] = foodCategories;
  navigation = navigationItems;

  restaurants: Restaurant[] = this.restaurantService.getRestaurants();

  constructor(
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly localDataService: LocalDataService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { searchTerm?: string; focusSearch?: boolean } | undefined;

    if (state?.searchTerm) {
      this.searchTerm = state.searchTerm;
    }
  }

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const saved = this.localDataService.getSearchStateForCurrentUser();
    this.searchTerm = saved.searchTerm;
    this.selectedCategory = saved.selectedCategory;
    this.searchHistory = this.localDataService.getSearchHistoryForCurrentUser().slice(0, 5);
    this.recentOrders = this.localDataService.getOrdersForCurrentUser().slice(0, 3);
  }

  ngOnDestroy(): void {
    if (this.searchSaveTimer) {
      clearTimeout(this.searchSaveTimer);
      this.searchSaveTimer = null;
    }
  }

  ngAfterViewInit(): void {
    const state = (history.state ?? {}) as { focusSearch?: boolean; searchTerm?: string };

    if (state.searchTerm) {
      this.searchTerm = state.searchTerm;
    }

    window.setTimeout(() => {
      this.searchInput?.nativeElement.focus();
      if (state.focusSearch) {
        this.searchInput?.nativeElement.select();
      }
    }, 0);
  }

  get filteredRestaurantResults(): RestaurantSearchResult[] {
    const categoryFiltered = this.selectedCategory === 'Offers'
      ? this.restaurantService.getRestaurants()
      : this.restaurantService.getRestaurantsByCategory(this.selectedCategory);

    const query = this.searchTerm.trim().toLowerCase();

    if (!query) {
      return categoryFiltered.map((restaurant) => ({
        restaurant,
        matchedMeals: [],
      }));
    }

    return categoryFiltered
      .map((restaurant) => {
        const restaurantHaystack = `${restaurant.name} ${restaurant.cuisine} ${restaurant.category}`.toLowerCase();
        const meals = this.restaurantService.getMealsByRestaurant(restaurant.id);

        if (restaurantHaystack.includes(query)) {
          return {
            restaurant,
            matchedMeals: meals,
          };
        }

        const matchedMeals = meals.filter((meal) => {
          const mealHaystack = `${meal.name} ${meal.description}`.toLowerCase();
          return mealHaystack.includes(query);
        });

        if (!matchedMeals.length) {
          return null;
        }

        return {
          restaurant,
          matchedMeals,
        };
      })
      .filter((result): result is RestaurantSearchResult => result !== null);
  }

  get homeLikeMeals(): SearchMeal[] {
    if (!this.filteredRestaurantResults.length) {
      return [];
    }

    const query = this.searchTerm.trim().toLowerCase();

    return this.filteredRestaurantResults.flatMap((result) => {
      const meals = query
        ? result.matchedMeals
        : this.restaurantService.getMealsByRestaurant(result.restaurant.id).slice(0, 2);

      return meals.map((meal) => ({
        restaurantId: result.restaurant.id,
        restaurantName: result.restaurant.name,
        mealName: meal.name,
        mealPrice: meal.price,
        mealImage: meal.image,
      }));
    });
  }

  get hasActiveSearch(): boolean {
    return this.searchTerm.trim().length > 0;
  }

  get searchedMealsPreview(): SearchedMealPreview[] {
    if (!this.hasActiveSearch) {
      return [];
    }

    const seen = new Set<string>();
    const meals: SearchedMealPreview[] = [];

    this.filteredRestaurantResults.forEach((result) => {
      result.matchedMeals.forEach((meal) => {
        const key = `${result.restaurant.id}::${meal.name}`.toLowerCase();

        if (seen.has(key)) {
          return;
        }

        seen.add(key);
        meals.push({
          restaurantId: result.restaurant.id,
          restaurantName: result.restaurant.name,
          mealName: meal.name,
          mealPrice: meal.price,
          mealImage: meal.image,
        });
      });
    });

    return meals.slice(0, 6);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.localDataService.saveSearchStateForCurrentUser(this.searchTerm, this.selectedCategory);

    if (this.searchSaveTimer) {
      clearTimeout(this.searchSaveTimer);
    }

    this.searchSaveTimer = setTimeout(() => {
      this.persistSearchTerm();
    }, 600);
  }

  onSearchBlur(): void {
    this.persistSearchTerm();
  }

  onSearchEnter(event: Event): void {
    event.preventDefault();
    this.submitSearch();
  }

  useHistorySearch(term: string): void {
    this.searchTerm = term;
    this.localDataService.saveSearchStateForCurrentUser(this.searchTerm, this.selectedCategory);
    this.submitSearch();
    this.searchInput?.nativeElement.focus();
  }

  removeHistorySearch(term: string): void {
    this.localDataService.removeSearchHistoryItemForCurrentUser(term);
    this.searchHistory = this.localDataService.getSearchHistoryForCurrentUser().slice(0, 5);
  }

  clearHistorySearches(): void {
    this.localDataService.clearSearchHistoryForCurrentUser();
    this.searchHistory = [];
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.localDataService.saveSearchStateForCurrentUser(this.searchTerm, this.selectedCategory);
  }

  orderFromRestaurant(restaurant: Restaurant): void {
    this.localDataService.saveRestaurantVisit(restaurant.name);
    this.router.navigateByUrl(`/restaurant/${restaurant.id}`);
  }

  openRestaurant(restaurantId: string): void {
    this.router.navigateByUrl(`/restaurant/${restaurantId}`);
  }

  openMealRestaurant(restaurantId: string, mealName?: string): void {
    this.router.navigateByUrl(`/restaurant/${restaurantId}`, {
      state: {
        highlightMealName: mealName ?? null,
      },
    });
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  goToAddress(): void {
    this.router.navigateByUrl('/home');
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

  private persistSearchTerm(): void {
    this.localDataService.saveSearchHistoryForCurrentUser(this.searchTerm);
    this.searchHistory = this.localDataService.getSearchHistoryForCurrentUser().slice(0, 5);
  }

  private submitSearch(): void {
    if (this.searchSaveTimer) {
      clearTimeout(this.searchSaveTimer);
      this.searchSaveTimer = null;
    }

    this.persistSearchTerm();
    this.searchInput?.nativeElement.blur();
  }
}
