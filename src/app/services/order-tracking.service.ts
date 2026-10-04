import { Injectable, OnDestroy } from '@angular/core';
import { LocalDataService, StoredOrderTracking } from './local-data.service';

export type TrackingStage = {
  status: string;
  title: string;
  description: string;
  icon: string;
  /** Seconds after the order was placed when this stage starts. */
  startsAfter: number;
};

/**
 * Demo timeline: a whole delivery plays out in about 3 minutes so it can be shown live.
 * The order status is derived from the time it was placed, so tracking keeps
 * progressing even while the app is closed.
 */
export const TRACKING_STAGES: TrackingStage[] = [
  { status: 'Order placed', title: 'Order placed', description: 'The restaurant received your order.', icon: '🧾', startsAfter: 0 },
  { status: 'Preparing', title: 'Preparing your food', description: 'The kitchen is cooking your meal.', icon: '👨‍🍳', startsAfter: 20 },
  { status: 'Rider picked up', title: 'Rider picked up', description: 'Your rider has your order.', icon: '🛍️', startsAfter: 75 },
  { status: 'On the way', title: 'On the way', description: 'Your rider is heading to you.', icon: '🛵', startsAfter: 95 },
  { status: 'Delivered', title: 'Delivered', description: 'Enjoy your meal!', icon: '✅', startsAfter: 180 },
];

const DELIVERED_STAGE = TRACKING_STAGES.length - 1;
const PICKUP_STAGE = 2;

const NOTIFICATION_COPY: Record<number, (tracking: StoredOrderTracking) => { title: string; body: string }> = {
  1: (tracking) => ({ title: 'Preparing your food', body: `${tracking.restaurantName} started cooking your order.` }),
  2: (tracking) => ({ title: 'Rider picked up your order', body: `${tracking.rider.name} has your food from ${tracking.restaurantName}.` }),
  3: (tracking) => ({ title: 'Your rider is on the way', body: `${tracking.rider.name} is heading to you on a ${tracking.rider.vehicle}.` }),
  4: (tracking) => ({ title: 'Order delivered', body: `Enjoy your meal from ${tracking.restaurantName}! Tap to rate it.` }),
};

@Injectable({
  providedIn: 'root',
})
export class OrderTrackingService implements OnDestroy {
  private timerId?: ReturnType<typeof setInterval>;

  constructor(private readonly localDataService: LocalDataService) {}

  /** Starts the background ticker that moves active orders through their stages. */
  start(): void {
    if (this.timerId) {
      return;
    }

    this.sync();
    this.timerId = setInterval(() => this.sync(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  getStageIndex(tracking: StoredOrderTracking, now = Date.now()): number {
    const elapsed = this.getElapsedSeconds(tracking, now);
    let stageIndex = 0;

    TRACKING_STAGES.forEach((stage, index) => {
      if (elapsed >= stage.startsAfter) {
        stageIndex = index;
      }
    });

    return stageIndex;
  }

  getStageStartTime(tracking: StoredOrderTracking, stageIndex: number): Date {
    return new Date(new Date(tracking.placedAt).getTime() + TRACKING_STAGES[stageIndex].startsAfter * 1000);
  }

  getRemainingSeconds(tracking: StoredOrderTracking, now = Date.now()): number {
    return Math.max(0, Math.ceil(TRACKING_STAGES[DELIVERED_STAGE].startsAfter - this.getElapsedSeconds(tracking, now)));
  }

  /** 0 while the rider waits at the restaurant, rising to 1 at your door. */
  getRouteProgress(tracking: StoredOrderTracking, now = Date.now()): number {
    const elapsed = this.getElapsedSeconds(tracking, now);
    const start = TRACKING_STAGES[PICKUP_STAGE].startsAfter;
    const end = TRACKING_STAGES[DELIVERED_STAGE].startsAfter;
    return Math.min(1, Math.max(0, (elapsed - start) / (end - start)));
  }

  isDelivered(tracking: StoredOrderTracking, now = Date.now()): boolean {
    return this.getStageIndex(tracking, now) === DELIVERED_STAGE;
  }

  sync(): void {
    if (!this.localDataService.isSignedIn()) {
      return;
    }

    this.adoptUntrackedActiveOrders();

    this.localDataService.getOrderTrackingsForCurrentUser().forEach((tracking) => {
      if (tracking.lastNotifiedStage >= DELIVERED_STAGE) {
        return;
      }

      const stageIndex = this.getStageIndex(tracking);

      if (stageIndex <= tracking.lastNotifiedStage) {
        return;
      }

      this.localDataService.setOrderGroupStatusForCurrentUser(tracking.groupId, TRACKING_STAGES[stageIndex].status);
      this.localDataService.updateOrderTrackingForCurrentUser(tracking.groupId, { lastNotifiedStage: stageIndex });

      // Only announce the latest stage, so reopening the app later does not flood the list.
      const copy = NOTIFICATION_COPY[stageIndex]?.(tracking);

      if (copy) {
        this.localDataService.addNotificationForCurrentUser({ ...copy, groupId: tracking.groupId });
      }
    });
  }

  private adoptUntrackedActiveOrders(): void {
    const activeGroups = new Map<string, ReturnType<LocalDataService['getOrdersForCurrentUser']>>();

    this.localDataService
      .getOrdersForCurrentUser()
      .filter((order) => order.status !== 'Delivered' && order.orderGroupId)
      .forEach((order) => {
        const groupId = order.orderGroupId as string;
        activeGroups.set(groupId, [...(activeGroups.get(groupId) ?? []), order]);
      });

    activeGroups.forEach((orders, groupId) => {
      this.localDataService.ensureOrderTrackingForCurrentUser(groupId, orders);
    });
  }

  private getElapsedSeconds(tracking: StoredOrderTracking, now: number): number {
    return (now - new Date(tracking.placedAt).getTime()) / 1000;
  }
}
