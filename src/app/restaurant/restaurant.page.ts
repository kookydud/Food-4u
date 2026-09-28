import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LocalDataService, StoredMealCartItem, StoredRestaurantReview } from '../services/local-data.service';
import {
  Restaurant,
  RestaurantInfo,
  RestaurantMeal,
  RestaurantReview,
  RestaurantService,
} from '../services/restaurant.service';
import { navigationItems } from '../shared/app-data';

type DisplayReview = {
  author: string;
  rating: number;
  comment: string;
  ownerEmail?: string;
  createdAt?: string;
  isEditing: boolean;
  draftComment: string;
  draftRating: number;
};

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.page.html',
  styleUrls: ['./restaurant.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class RestaurantPage implements OnDestroy, OnInit {
  restaurant?: Restaurant;
  meals: RestaurantMeal[] = [];
  reviews: DisplayReview[] = [];
  info?: RestaurantInfo;
  reviewComment = '';
  selectedReviewRating = 5;
  submittingReview = false;
  readonly reviewStars = [1, 2, 3, 4, 5];

  selectedSection: 'meals' | 'reviews' | 'info' = 'meals';
  navigation = navigationItems;
  highlightedMealName = '';
  mealCartItems: StoredMealCartItem[] = [];
  private highlightTimer: ReturnType<typeof setTimeout> | null = null;
  private mealCartSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
    private readonly localDataService: LocalDataService,
  ) {}

  ngOnInit(): void {
    this.mealCartSubscription = this.localDataService.watchMealCartChanges().subscribe(() => {
      if (this.restaurant) {
        this.mealCartItems = this.localDataService.getMealCartForCurrentUser(this.restaurant.id);
      }
    });

    this.loadRestaurantData();
  }

  ngOnDestroy(): void {
    this.mealCartSubscription?.unsubscribe();

    if (this.highlightTimer) {
      clearTimeout(this.highlightTimer);
      this.highlightTimer = null;
    }
  }

  ionViewWillEnter(): void {
    this.loadRestaurantData();
  }

  ionViewDidEnter(): void {
    if (this.restaurant) {
      this.mealCartItems = this.localDataService.getMealCartForCurrentUser(this.restaurant.id);
    }
  }

  private loadRestaurantData(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const restaurantId = this.route.snapshot.paramMap.get('id');
    if (!restaurantId) {
      this.router.navigateByUrl('/home');
      return;
    }

    const restaurant = this.restaurantService.getRestaurantById(restaurantId);
    if (!restaurant) {
      this.router.navigateByUrl('/home');
      return;
    }

    this.restaurant = restaurant;
    this.meals = this.restaurantService.getMealsByRestaurant(restaurant.id);
    this.mealCartItems = this.getIncomingCartItems(restaurant.id);
    this.hydrateReviews(restaurant.id);
    this.info = this.restaurantService.getInfoByRestaurant(restaurant.id);
    this.applyMealHighlightFromNavigation();
    this.mealCartItems = this.getIncomingCartItems(restaurant.id);
  }

  get cuisineLabel(): string {
    const cuisine = this.restaurant?.cuisine ?? '';
    return cuisine.split('·')[1]?.trim() ?? cuisine;
  }

  get reviewsAverage(): number {
    if (!this.reviews.length) {
      return this.restaurant?.rating ?? 0;
    }

    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / this.reviews.length).toFixed(1));
  }

  goBack(): void {
    this.router.navigateByUrl('/home');
  }

  selectSection(section: 'meals' | 'reviews' | 'info'): void {
    this.selectedSection = section;
  }

  setReviewRating(rating: number): void {
    this.selectedReviewRating = rating;
  }

  addReview(): void {
    if (!this.restaurant || this.submittingReview) {
      return;
    }

    const comment = this.reviewComment.trim();

    if (!comment) {
      return;
    }

    this.submittingReview = true;

    const author = this.localDataService.getCurrentUser()?.fullName || 'Food4U User';
    this.localDataService.addReviewForCurrentUser(this.restaurant.id, {
      author,
      rating: this.selectedReviewRating,
      comment,
    });

    this.reviewComment = '';
    this.selectedReviewRating = 5;
    this.hydrateReviews(this.restaurant.id);
    this.submittingReview = false;
  }

  startEditingReview(review: DisplayReview): void {
    if (!this.canEditReview(review)) {
      return;
    }

    review.isEditing = true;
    review.draftComment = review.comment;
    review.draftRating = review.rating;
  }

  cancelEditingReview(review: DisplayReview): void {
    review.isEditing = false;
    review.draftComment = review.comment;
    review.draftRating = review.rating;
  }

  setEditRating(review: DisplayReview, rating: number): void {
    if (!this.canEditReview(review)) {
      return;
    }

    review.draftRating = rating;
  }

  saveEditedReview(review: DisplayReview): void {
    if (!this.restaurant || !this.canEditReview(review) || !review.createdAt) {
      return;
    }

    const trimmedComment = review.draftComment.trim();

    if (!trimmedComment) {
      return;
    }

    this.localDataService.updateReviewForCurrentUser(this.restaurant.id, review.createdAt, {
      comment: trimmedComment,
      rating: review.draftRating,
    });

    this.hydrateReviews(this.restaurant.id);
  }

  deleteReview(review: DisplayReview): void {
    if (!this.restaurant || !this.canEditReview(review) || !review.createdAt) {
      return;
    }

    this.localDataService.deleteReviewForCurrentUser(this.restaurant.id, review.createdAt);
    this.hydrateReviews(this.restaurant.id);
  }

  addMealToOrder(meal: RestaurantMeal): void {
    if (!this.restaurant) {
      return;
    }

    this.router.navigate(['/meal', this.restaurant.id, meal.name]);
  }

  get mealCartCount(): number {
    return this.mealCartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get mealCartTotal(): string {
    const total = this.mealCartItems.reduce(
      (sum, item) => sum + this.parseCurrency(item.mealPrice) * item.quantity,
      0,
    );

    return `₱${total.toFixed(2)}`;
  }

  removeCartItem(itemToRemove: StoredMealCartItem): void {
    if (!this.restaurant) {
      return;
    }

    this.localDataService.removeMealCartItemForCurrentUser(this.restaurant.id, itemToRemove);
    this.mealCartItems = this.localDataService.getMealCartForCurrentUser(this.restaurant.id);
  }

  openMealFromCart(item: StoredMealCartItem): void {
    if (!this.restaurant) {
      return;
    }

    this.router.navigate(['/meal', this.restaurant.id, item.mealName]);
  }

  proceedToOrders(): void {
    if (!this.restaurant || !this.mealCartItems.length) {
      return;
    }

    this.router.navigateByUrl(`/restaurant-cart/${this.restaurant.id}`);
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
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

  canEditReview(review: DisplayReview): boolean {
    const currentUserEmail = this.localDataService.getCurrentUserEmail();

    if (!currentUserEmail || !review.ownerEmail) {
      return false;
    }

    return review.ownerEmail.toLowerCase() === currentUserEmail.toLowerCase();
  }

  isMealHighlighted(meal: RestaurantMeal): boolean {
    return !!this.highlightedMealName && meal.name.toLowerCase() === this.highlightedMealName;
  }

  private hydrateReviews(restaurantId: string): void {
    const baseReviews = this.restaurantService.getReviewsByRestaurant(restaurantId);
    const userReviews = this.localDataService.getAllReviewsForRestaurant(restaurantId);

    this.reviews = [
      ...userReviews.map((review) => this.mapUserReview(review)),
      ...baseReviews.map((review) => this.mapBaseReview(review)),
    ];
  }

  private mapUserReview(review: StoredRestaurantReview): DisplayReview {
    return {
      author: review.author,
      rating: review.rating,
      comment: review.comment,
      ownerEmail: review.ownerEmail,
      createdAt: review.createdAt,
      isEditing: false,
      draftComment: review.comment,
      draftRating: review.rating,
    };
  }

  private mapBaseReview(review: RestaurantReview): DisplayReview {
    return {
      author: review.author,
      rating: review.rating,
      comment: review.comment,
      isEditing: false,
      draftComment: review.comment,
      draftRating: review.rating,
    };
  }

  private applyMealHighlightFromNavigation(): void {
    const navigationState = (this.router.getCurrentNavigation()?.extras.state ?? history.state ?? {}) as {
      highlightMealName?: string | null;
      forceMealsSection?: boolean;
    };

    if (navigationState.forceMealsSection) {
      this.selectedSection = 'meals';
    }

    const mealName = navigationState.highlightMealName?.trim().toLowerCase() ?? '';

    if (!mealName) {
      this.highlightedMealName = '';
      return;
    }

    this.selectedSection = 'meals';
    this.highlightedMealName = mealName;

    if (this.highlightTimer) {
      clearTimeout(this.highlightTimer);
    }

    this.highlightTimer = setTimeout(() => {
      this.highlightedMealName = '';
      this.highlightTimer = null;
    }, 1000);
  }

  private getIncomingCartItems(restaurantId: string): StoredMealCartItem[] {
    const navigationState = (this.router.getCurrentNavigation()?.extras.state ?? history.state ?? {}) as {
      cartItems?: StoredMealCartItem[];
    };

    if (Array.isArray(navigationState.cartItems)) {
      return navigationState.cartItems.map((item) => ({ ...item }));
    }

    return this.localDataService.getMealCartForCurrentUser(restaurantId);
  }

  private parseCurrency(amount: string): number {
    const cleaned = amount.replace(/[^\d.]/g, '');
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : 0;
  }

}
