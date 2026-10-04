import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService, StoredOrder, StoredOrderTracking } from '../services/local-data.service';
import { OrderTrackingService, TRACKING_STAGES, TrackingStage } from '../services/order-tracking.service';
import { Restaurant, RestaurantService } from '../services/restaurant.service';
import { navigationItems } from '../shared/app-data';

type Point = { x: number; y: number };

type TimelineStep = TrackingStage & {
  state: 'done' | 'current' | 'upcoming';
  time: string;
};

/** Simulated street route on the mini map, from the restaurant to your door. */
const ROUTE: Point[] = [
  { x: 46, y: 150 },
  { x: 46, y: 98 },
  { x: 152, y: 98 },
  { x: 152, y: 46 },
  { x: 276, y: 46 },
];

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.page.html',
  styleUrls: ['../orders/orders.page.scss', './track-order.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class TrackOrderPage implements OnInit, OnDestroy {
  tracking: StoredOrderTracking | null = null;
  restaurant?: Restaurant;
  items: StoredOrder[] = [];
  navigation = navigationItems;
  readonly now = signal(Date.now());
  orderNotice = '';

  readonly reviewStars = [1, 2, 3, 4, 5];
  reviewRating = 5;
  reviewComment = '';
  reviewSubmitted = false;

  readonly routePoints = ROUTE.map((point) => `${point.x},${point.y}`).join(' ');
  readonly restaurantPin = ROUTE[0];
  readonly homePin = ROUTE[ROUTE.length - 1];

  private groupId = '';
  private timerId?: ReturnType<typeof setInterval>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly localDataService: LocalDataService,
    private readonly orderTrackingService: OrderTrackingService,
    private readonly restaurantService: RestaurantService,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.groupId = this.route.snapshot.paramMap.get('groupId') ?? '';
    this.load();
    this.startTicker();

    const navigationState = history.state as { recentOrderRestaurantName?: string } | undefined;

    if (navigationState?.recentOrderRestaurantName) {
      this.orderNotice = `Order placed! ${navigationState.recentOrderRestaurantName} is getting it ready.`;
    }
  }

  ionViewWillEnter(): void {
    this.load();
    this.startTicker();
  }

  ionViewWillLeave(): void {
    this.stopTicker();
  }

  ngOnDestroy(): void {
    this.stopTicker();
  }

  get stageIndex(): number {
    return this.tracking ? this.orderTrackingService.getStageIndex(this.tracking, this.now()) : 0;
  }

  get currentStage(): TrackingStage {
    return TRACKING_STAGES[this.stageIndex];
  }

  get isDelivered(): boolean {
    return this.stageIndex === TRACKING_STAGES.length - 1;
  }

  get etaLabel(): string {
    if (!this.tracking) {
      return '';
    }

    if (this.isDelivered) {
      return `Delivered at ${this.formatTime(this.orderTrackingService.getStageStartTime(this.tracking, this.stageIndex))}`;
    }

    const remaining = this.orderTrackingService.getRemainingSeconds(this.tracking, this.now());
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `Arriving in ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get timeline(): TimelineStep[] {
    const tracking = this.tracking;

    if (!tracking) {
      return [];
    }

    return TRACKING_STAGES.map((stage, index) => ({
      ...stage,
      state: index < this.stageIndex || this.isDelivered ? 'done' : index === this.stageIndex ? 'current' : 'upcoming',
      time: index <= this.stageIndex ? this.formatTime(this.orderTrackingService.getStageStartTime(tracking, index)) : '',
    }));
  }

  get riderPosition(): Point {
    const progress = this.tracking ? this.orderTrackingService.getRouteProgress(this.tracking, this.now()) : 0;
    return this.pointAlongRoute(progress);
  }

  get travelledPoints(): string {
    const progress = this.tracking ? this.orderTrackingService.getRouteProgress(this.tracking, this.now()) : 0;
    const total = this.routeLength();
    let remaining = progress * total;
    const points: Point[] = [ROUTE[0]];

    for (let index = 1; index < ROUTE.length && remaining > 0; index += 1) {
      const segment = this.distance(ROUTE[index - 1], ROUTE[index]);
      points.push(remaining >= segment ? ROUTE[index] : this.lerp(ROUTE[index - 1], ROUTE[index], remaining / segment));
      remaining -= segment;
    }

    return points.map((point) => `${point.x},${point.y}`).join(' ');
  }

  get riderHeadline(): string {
    if (this.stageIndex < 2) {
      return 'Rider assigned';
    }

    return this.isDelivered ? 'Delivered by' : 'Your rider';
  }

  get canRate(): boolean {
    return this.isDelivered && !!this.tracking && !this.tracking.rated && !!this.restaurant;
  }

  getItemLabel(order: StoredOrder): string {
    const size = order.size ?? 'Regular';
    return `${order.mealName ?? order.title} (${size}${order.spicy ? ', Spicy' : ''}) x${order.quantity ?? 1}`;
  }

  setReviewRating(star: number): void {
    this.reviewRating = star;
  }

  submitReview(): void {
    if (!this.tracking || !this.restaurant || !this.reviewComment.trim()) {
      return;
    }

    const author = this.localDataService.getCurrentUser()?.fullName || 'Food4U User';
    const review = this.localDataService.addReviewForCurrentUser(this.restaurant.id, {
      author,
      rating: this.reviewRating,
      comment: this.reviewComment,
    });

    if (!review) {
      return;
    }

    this.localDataService.updateOrderTrackingForCurrentUser(this.tracking.groupId, { rated: true });
    this.reviewSubmitted = true;
    this.load();
  }

  skipReview(): void {
    if (!this.tracking) {
      return;
    }

    this.localDataService.updateOrderTrackingForCurrentUser(this.tracking.groupId, { rated: true });
    this.load();
  }

  openRestaurant(): void {
    if (this.restaurant) {
      this.router.navigateByUrl(`/restaurant/${this.restaurant.id}`);
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/orders');
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  isTabActive(label: string): boolean {
    return label === 'Orders';
  }

  trackStep(_: number, step: TimelineStep): string {
    return step.status;
  }

  private load(): void {
    this.tracking = this.localDataService.getOrderTrackingForCurrentUser(this.groupId);

    if (!this.tracking) {
      return;
    }

    this.restaurant = this.restaurantService.getRestaurantById(this.tracking.restaurantId);
    this.items = this.localDataService
      .getOrdersForCurrentUser()
      .filter((order) => order.orderGroupId === this.groupId);
    this.now.set(Date.now());
  }

  private startTicker(): void {
    if (this.timerId) {
      return;
    }

    this.timerId = setInterval(() => this.now.set(Date.now()), 1000);
  }

  private stopTicker(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  private pointAlongRoute(progress: number): Point {
    let remaining = progress * this.routeLength();

    for (let index = 1; index < ROUTE.length; index += 1) {
      const segment = this.distance(ROUTE[index - 1], ROUTE[index]);

      if (remaining <= segment) {
        return this.lerp(ROUTE[index - 1], ROUTE[index], segment ? remaining / segment : 0);
      }

      remaining -= segment;
    }

    return ROUTE[ROUTE.length - 1];
  }

  private routeLength(): number {
    return ROUTE.slice(1).reduce((sum, point, index) => sum + this.distance(ROUTE[index], point), 0);
  }

  private distance(a: Point, b: Point): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  private lerp(a: Point, b: Point, t: number): Point {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
}
