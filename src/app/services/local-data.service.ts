import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type AppUser = {
  fullName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type StoredOrder = {
  id: string;
  title: string;
  status: string;
  amount: string;
  createdAt: string;
  restaurantId?: string;
  restaurantName?: string;
  orderGroupId?: string;
  mealName?: string;
  quantity?: number;
  size?: 'Small' | 'Regular' | 'Large';
  spicy?: boolean;
};

export type StoredMealCartItem = {
  mealName: string;
  mealPrice: string;
  quantity: number;
  size: 'Small' | 'Regular' | 'Large';
  spicy: boolean;
};

export type StoredDeliveryAddress = {
  id: string;
  label: string;
  addressLine: string;
  details: string;
  primary: boolean;
};

export type StoredRestaurantCheckoutDraft = {
  address: string;
  note: string;
  paymentMethod?: string;
  voucherId?: string;
};

type SearchState = {
  searchTerm: string;
  selectedCategory: string;
};

export type StoredRestaurantReview = {
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
  ownerEmail?: string;
};

export type StoredRestaurantReviewUpdate = {
  rating: number;
  comment: string;
};

type PersistedState = {
  users: AppUser[];
  currentUserEmail: string | null;
  ordersByUser: Record<string, StoredOrder[]>;
  orderHistoryCustomizedByUser: Record<string, boolean>;
  mealCartByUserByRestaurant: Record<string, Record<string, StoredMealCartItem[]>>;
  addressesByUser: Record<string, StoredDeliveryAddress[]>;
  checkoutDraftByUserByRestaurant: Record<string, Record<string, StoredRestaurantCheckoutDraft>>;
  recentRestaurantsByUser: Record<string, string[]>;
  searchStateByUser: Record<string, SearchState>;
  searchHistoryByUser: Record<string, string[]>;
  reviewsByUserByRestaurant: Record<string, Record<string, StoredRestaurantReview[]>>;
};

const STORAGE_KEY = 'food4u.localData.v1';

@Injectable({
  providedIn: 'root',
})
export class LocalDataService {
  private state: PersistedState = this.readState();
  private readonly mealCartChangedSubject = new Subject<void>();
  private readonly ordersChangedSubject = new Subject<void>();

  watchMealCartChanges(): Observable<void> {
    return this.mealCartChangedSubject.asObservable();
  }

  watchOrderChanges(): Observable<void> {
    return this.ordersChangedSubject.asObservable();
  }

  async registerUser(fullName: string, email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    const normalizedEmail = this.normalizeEmail(email);
    const existingUser = this.state.users.find((user) => this.normalizeEmail(user.email) === normalizedEmail);

    if (existingUser) {
      return { ok: false, message: 'An account already exists for this email.' };
    }

    const passwordHash = await this.hashPassword(password);

    this.state.users.push({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    this.state.currentUserEmail = normalizedEmail;
    this.ensureUserDefaults(normalizedEmail);
    this.persist();

    return { ok: true };
  }

  async signIn(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    const normalizedEmail = this.normalizeEmail(email);
    const user = this.state.users.find((storedUser) => this.normalizeEmail(storedUser.email) === normalizedEmail);

    if (!user) {
      return { ok: false, message: 'No account found for this email.' };
    }

    const passwordHash = await this.hashPassword(password);

    if (passwordHash !== user.passwordHash) {
      return { ok: false, message: 'Incorrect password.' };
    }

    this.state.currentUserEmail = normalizedEmail;
    this.ensureUserDefaults(normalizedEmail);
    this.persist();

    return { ok: true };
  }

  signOut(): void {
    this.state.currentUserEmail = null;
    this.persist();
  }

  isSignedIn(): boolean {
    return !!this.state.currentUserEmail;
  }

  getCurrentUser(): AppUser | null {
    if (!this.state.currentUserEmail) {
      return null;
    }

    return (
      this.state.users.find(
        (user) => this.normalizeEmail(user.email) === this.state.currentUserEmail,
      ) ?? null
    );
  }

  getCurrentUserEmail(): string | null {
    return this.state.currentUserEmail;
  }

  addOrderForCurrentUser(order: Omit<StoredOrder, 'id' | 'createdAt'>): StoredOrder | null {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return null;
    }

    this.ensureUserDefaults(userEmail);

    const newOrder: StoredOrder = {
      id: this.createOrderId(),
      title: order.title,
      status: order.status,
      amount: order.amount,
      createdAt: new Date().toISOString(),
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      orderGroupId: order.orderGroupId,
      mealName: order.mealName,
      quantity: order.quantity,
      size: order.size,
      spicy: order.spicy,
    };

    this.state.ordersByUser[userEmail] = [newOrder, ...this.state.ordersByUser[userEmail]].slice(0, 30);
    this.persist();
    this.notifyOrdersChanged();

    return newOrder;
  }

  removeOrderGroupForCurrentUser(groupId: string): boolean {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !groupId.trim()) {
      return false;
    }

    this.ensureUserDefaults(userEmail);

    const currentOrders = this.state.ordersByUser[userEmail] ?? [];
    const nextOrders = currentOrders.filter((order) => (order.orderGroupId ?? `legacy-${order.id}`) !== groupId);

    if (nextOrders.length === currentOrders.length) {
      return false;
    }

    this.state.ordersByUser[userEmail] = nextOrders;
    this.state.orderHistoryCustomizedByUser[userEmail] = true;
    this.persist();
    this.notifyOrdersChanged();

    return true;
  }

  getOrdersForCurrentUser(): StoredOrder[] {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return [];
    }

    this.ensureUserDefaults(userEmail);
    this.migrateLegacySampleOrders(userEmail);
    this.normalizeStoredOrders(userEmail);
    this.ensureFourRestaurantTestOrders(userEmail);

    return this.state.ordersByUser[userEmail];
  }

  getActiveOrderGroupCountForCurrentUser(): number {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return 0;
    }

    this.ensureUserDefaults(userEmail);
    this.migrateLegacySampleOrders(userEmail);
    this.normalizeStoredOrders(userEmail);
    this.ensureFourRestaurantTestOrders(userEmail);

    const currentOrders = this.state.ordersByUser[userEmail] ?? [];
    const activeGroupIds = new Set(
      currentOrders
        .filter((order) => order.status !== 'Delivered')
        .map((order) => order.orderGroupId ?? `legacy-${order.id}`),
    );

    return activeGroupIds.size;
  }

  getAddressesForCurrentUser(): StoredDeliveryAddress[] {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return [];
    }

    this.ensureUserDefaults(userEmail);
    return (this.state.addressesByUser[userEmail] ?? []).map((address) => ({ ...address }));
  }

  getPrimaryAddressForCurrentUser(): StoredDeliveryAddress | null {
    return this.getAddressesForCurrentUser().find((address) => address.primary) ?? null;
  }

  addAddressForCurrentUser(address: Omit<StoredDeliveryAddress, 'id' | 'primary'>): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !address.label.trim() || !address.addressLine.trim()) {
      return;
    }

    this.ensureUserDefaults(userEmail);
    const hasPrimary = (this.state.addressesByUser[userEmail] ?? []).some((entry) => entry.primary);

    this.state.addressesByUser[userEmail].push({
      id: this.createAddressId(),
      label: address.label.trim(),
      addressLine: address.addressLine.trim(),
      details: address.details.trim(),
      primary: !hasPrimary,
    });

    this.persist();
  }

  updateAddressForCurrentUser(addressId: string, updates: Omit<StoredDeliveryAddress, 'id' | 'primary'>): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !addressId.trim()) {
      return;
    }

    this.ensureUserDefaults(userEmail);
    const target = (this.state.addressesByUser[userEmail] ?? []).find((address) => address.id === addressId);

    if (!target) {
      return;
    }

    target.label = updates.label.trim() || target.label;
    target.addressLine = updates.addressLine.trim() || target.addressLine;
    target.details = updates.details.trim();
    this.persist();
  }

  deleteAddressForCurrentUser(addressId: string): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !addressId.trim()) {
      return;
    }

    this.ensureUserDefaults(userEmail);
    const current = this.state.addressesByUser[userEmail] ?? [];
    const next = current.filter((address) => address.id !== addressId);

    if (current.length === next.length) {
      return;
    }

    if (next.length && !next.some((address) => address.primary)) {
      next[0].primary = true;
    }

    this.state.addressesByUser[userEmail] = next;
    this.persist();
  }

  setPrimaryAddressForCurrentUser(addressId: string): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !addressId.trim()) {
      return;
    }

    this.ensureUserDefaults(userEmail);
    this.state.addressesByUser[userEmail] = (this.state.addressesByUser[userEmail] ?? []).map((address) => ({
      ...address,
      primary: address.id === addressId,
    }));
    this.persist();
  }

  getMealCartForCurrentUser(restaurantId: string): StoredMealCartItem[] {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim()) {
      return [];
    }

    this.ensureUserDefaults(userEmail);
    const items = this.state.mealCartByUserByRestaurant[userEmail][restaurantId] ?? [];
    return items.map((item) => ({ ...item }));
  }

  getMealCartRestaurantIdsForCurrentUser(): string[] {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return [];
    }

    this.ensureUserDefaults(userEmail);

    return Object.entries(this.state.mealCartByUserByRestaurant[userEmail] ?? {})
      .filter(([, items]) => (items ?? []).length > 0)
      .map(([restaurantId]) => restaurantId);
  }

  addMealCartItemForCurrentUser(restaurantId: string, item: Omit<StoredMealCartItem, 'quantity'> & { quantity?: number }): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim() || !item.mealName.trim()) {
      return;
    }

    this.ensureUserDefaults(userEmail);

    if (!this.state.mealCartByUserByRestaurant[userEmail][restaurantId]) {
      this.state.mealCartByUserByRestaurant[userEmail][restaurantId] = [];
    }

    const quantityToAdd = Math.max(1, item.quantity ?? 1);
    const cart = this.state.mealCartByUserByRestaurant[userEmail][restaurantId];
    const existing = cart.find(
      (entry) => entry.mealName === item.mealName && entry.size === item.size && entry.spicy === item.spicy,
    );

    if (existing) {
      existing.quantity += quantityToAdd;
      this.persist();
      this.notifyMealCartChanged();
      return;
    }

    cart.push({
      mealName: item.mealName,
      mealPrice: item.mealPrice,
      quantity: quantityToAdd,
      size: item.size,
      spicy: item.spicy,
    });

    this.persist();
    this.notifyMealCartChanged();
  }

  removeMealCartItemForCurrentUser(restaurantId: string, item: StoredMealCartItem): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim()) {
      return;
    }

    this.ensureUserDefaults(userEmail);
    const cart = this.state.mealCartByUserByRestaurant[userEmail][restaurantId] ?? [];

    this.state.mealCartByUserByRestaurant[userEmail][restaurantId] = cart.filter(
      (entry) => !(entry.mealName === item.mealName && entry.size === item.size && entry.spicy === item.spicy),
    );

    this.persist();
    this.notifyMealCartChanged();
  }

  clearMealCartForCurrentUser(restaurantId: string): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim()) {
      return;
    }

    this.ensureUserDefaults(userEmail);
    this.state.mealCartByUserByRestaurant[userEmail][restaurantId] = [];
    this.persist();
    this.notifyMealCartChanged();
  }

  getCheckoutDraftForCurrentUser(restaurantId: string): StoredRestaurantCheckoutDraft {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim()) {
      return { address: '', note: '' };
    }

    this.ensureUserDefaults(userEmail);

    return this.state.checkoutDraftByUserByRestaurant[userEmail][restaurantId] ?? {
      address: '',
      note: '',
      paymentMethod: 'Cash on Delivery',
      voucherId: '',
    };
  }

  saveCheckoutDraftForCurrentUser(restaurantId: string, draft: StoredRestaurantCheckoutDraft): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim()) {
      return;
    }

    this.ensureUserDefaults(userEmail);
    this.state.checkoutDraftByUserByRestaurant[userEmail][restaurantId] = {
      address: draft.address,
      note: draft.note,
      paymentMethod: draft.paymentMethod ?? 'Cash on Delivery',
      voucherId: draft.voucherId ?? '',
    };
    this.persist();
  }

  clearCheckoutDraftForCurrentUser(restaurantId: string): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim()) {
      return;
    }

    this.ensureUserDefaults(userEmail);
    this.state.checkoutDraftByUserByRestaurant[userEmail][restaurantId] = {
      address: '',
      note: '',
      paymentMethod: 'Cash on Delivery',
      voucherId: '',
    };
    this.persist();
  }

  checkoutMealCartForCurrentUser(restaurantName: string, restaurantId: string, orderStatus: string = 'Delivered'): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim()) {
      return;
    }

    this.ensureUserDefaults(userEmail);

    const cartItems = this.state.mealCartByUserByRestaurant[userEmail][restaurantId] ?? [];
    const orderGroupId = this.createOrderGroupId();

    cartItems.forEach((item) => {
      this.addOrderForCurrentUser({
        title: `${restaurantName} - ${item.mealName} (${item.size}${item.spicy ? ', Spicy' : ''}) x${item.quantity}`,
        status: orderStatus,
        amount: `₱${(this.parseCurrency(item.mealPrice) * item.quantity).toFixed(2)}`,
        restaurantId,
        restaurantName,
        orderGroupId,
        mealName: item.mealName,
        quantity: item.quantity,
        size: item.size,
        spicy: item.spicy,
      });
    });

    this.state.mealCartByUserByRestaurant[userEmail][restaurantId] = [];
    this.state.checkoutDraftByUserByRestaurant[userEmail][restaurantId] = {
      address: '',
      note: '',
      paymentMethod: 'Cash on Delivery',
      voucherId: '',
    };
    this.persist();
    this.notifyMealCartChanged();
  }

  reorderPastOrderGroupToCart(restaurantId: string, orders: StoredOrder[]): boolean {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim() || !orders.length) {
      return false;
    }

    this.ensureUserDefaults(userEmail);

    const rebuiltCart = orders
      .map((order) => this.buildCartItemFromOrder(order))
      .filter((item): item is StoredMealCartItem => item !== null);

    if (!rebuiltCart.length) {
      return false;
    }

    this.state.mealCartByUserByRestaurant[userEmail][restaurantId] = rebuiltCart;
    this.persist();
    this.notifyMealCartChanged();

    return true;
  }

  saveRestaurantVisit(restaurantName: string): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantName.trim()) {
      return;
    }

    this.ensureUserDefaults(userEmail);

    const current = this.state.recentRestaurantsByUser[userEmail];
    const normalizedName = restaurantName.trim();
    const withoutDuplicate = current.filter((name) => name !== normalizedName);
    this.state.recentRestaurantsByUser[userEmail] = [normalizedName, ...withoutDuplicate].slice(0, 8);
    this.persist();
  }

  getRecentRestaurantsForCurrentUser(): string[] {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return [];
    }

    this.ensureUserDefaults(userEmail);

    return this.state.recentRestaurantsByUser[userEmail];
  }

  saveSearchStateForCurrentUser(searchTerm: string, selectedCategory: string): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return;
    }

    this.ensureUserDefaults(userEmail);

    this.state.searchStateByUser[userEmail] = {
      searchTerm,
      selectedCategory,
    };

    this.persist();
  }

  saveSearchHistoryForCurrentUser(searchTerm: string): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return;
    }

    const normalizedTerm = searchTerm.trim();

    if (!normalizedTerm) {
      return;
    }

    this.ensureUserDefaults(userEmail);

    const current = this.state.searchHistoryByUser[userEmail] ?? [];
    const withoutDuplicate = current.filter(
      (term) => term.toLowerCase() !== normalizedTerm.toLowerCase(),
    );

    this.state.searchHistoryByUser[userEmail] = [normalizedTerm, ...withoutDuplicate].slice(0, 12);
    this.persist();
  }

  getSearchHistoryForCurrentUser(): string[] {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return [];
    }

    this.ensureUserDefaults(userEmail);
    return this.state.searchHistoryByUser[userEmail] ?? [];
  }

  removeSearchHistoryItemForCurrentUser(searchTerm: string): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return;
    }

    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return;
    }

    this.ensureUserDefaults(userEmail);

    this.state.searchHistoryByUser[userEmail] = (this.state.searchHistoryByUser[userEmail] ?? []).filter(
      (term) => term.trim().toLowerCase() !== normalizedTerm,
    );

    this.persist();
  }

  clearSearchHistoryForCurrentUser(): void {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return;
    }

    this.ensureUserDefaults(userEmail);
    this.state.searchHistoryByUser[userEmail] = [];
    this.persist();
  }

  getSearchStateForCurrentUser(): SearchState {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail) {
      return { searchTerm: '', selectedCategory: 'Offers' };
    }

    this.ensureUserDefaults(userEmail);

    return this.state.searchStateByUser[userEmail];
  }

  getReviewsForCurrentUser(restaurantId: string): StoredRestaurantReview[] {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim()) {
      return [];
    }

    this.ensureUserDefaults(userEmail);

    return this.state.reviewsByUserByRestaurant[userEmail][restaurantId] ?? [];
  }

  getAllReviewsForRestaurant(restaurantId: string): StoredRestaurantReview[] {
    if (!restaurantId.trim()) {
      return [];
    }

    return Object.entries(this.state.reviewsByUserByRestaurant)
      .flatMap(([userEmail, reviewsByRestaurant]) => {
        const normalizedOwner = this.normalizeEmail(userEmail);
        const reviews = reviewsByRestaurant?.[restaurantId] ?? [];

        return reviews.map((review) => ({
          ...review,
          ownerEmail: review.ownerEmail ?? normalizedOwner,
        }));
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
  }

  addReviewForCurrentUser(
    restaurantId: string,
    review: Omit<StoredRestaurantReview, 'createdAt'>,
  ): StoredRestaurantReview | null {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim() || !review.comment.trim()) {
      return null;
    }

    this.ensureUserDefaults(userEmail);

    if (!this.state.reviewsByUserByRestaurant[userEmail][restaurantId]) {
      this.state.reviewsByUserByRestaurant[userEmail][restaurantId] = [];
    }

    const newReview: StoredRestaurantReview = {
      author: review.author.trim() || 'Food4U User',
      rating: Math.max(1, Math.min(5, review.rating)),
      comment: review.comment.trim(),
      createdAt: new Date().toISOString(),
      ownerEmail: userEmail,
    };

    this.state.reviewsByUserByRestaurant[userEmail][restaurantId] = [
      newReview,
      ...this.state.reviewsByUserByRestaurant[userEmail][restaurantId],
    ].slice(0, 40);

    this.persist();
    return newReview;
  }

  updateReviewForCurrentUser(
    restaurantId: string,
    createdAt: string,
    updates: StoredRestaurantReviewUpdate,
  ): boolean {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim() || !createdAt.trim() || !updates.comment.trim()) {
      return false;
    }

    this.ensureUserDefaults(userEmail);

    const reviews = this.state.reviewsByUserByRestaurant[userEmail][restaurantId] ?? [];
    const target = reviews.find((review) => review.createdAt === createdAt);

    if (!target) {
      return false;
    }

    if (!target.ownerEmail) {
      target.ownerEmail = this.normalizeEmail(userEmail);
    }

    if (this.normalizeEmail(target.ownerEmail) !== this.normalizeEmail(userEmail)) {
      return false;
    }

    target.rating = Math.max(1, Math.min(5, updates.rating));
    target.comment = updates.comment.trim();
    this.persist();

    return true;
  }

  deleteReviewForCurrentUser(restaurantId: string, createdAt: string): boolean {
    const userEmail = this.state.currentUserEmail;

    if (!userEmail || !restaurantId.trim() || !createdAt.trim()) {
      return false;
    }

    this.ensureUserDefaults(userEmail);

    const reviews = this.state.reviewsByUserByRestaurant[userEmail][restaurantId] ?? [];
    const target = reviews.find((review) => review.createdAt === createdAt);

    if (!target) {
      return false;
    }

    if (!target.ownerEmail) {
      target.ownerEmail = this.normalizeEmail(userEmail);
    }

    if (this.normalizeEmail(target.ownerEmail) !== this.normalizeEmail(userEmail)) {
      return false;
    }

    const nextReviews = reviews.filter((review) => review.createdAt !== createdAt);

    this.state.reviewsByUserByRestaurant[userEmail][restaurantId] = nextReviews;
    this.persist();

    return true;
  }

  private ensureUserDefaults(userEmail: string): void {
    if (!this.state.ordersByUser[userEmail]) {
      this.state.ordersByUser[userEmail] = this.createSamplePastOrders();
    }

    if (!this.state.recentRestaurantsByUser[userEmail]) {
      this.state.recentRestaurantsByUser[userEmail] = [];
    }

    if (!this.state.addressesByUser[userEmail]) {
      this.state.addressesByUser[userEmail] = [
        {
          id: this.createAddressId(),
          label: 'Home',
          addressLine: '123 Main St, San Francisco, CA',
          details: 'Apartment 4B, blue gate',
          primary: true,
        },
        {
          id: this.createAddressId(),
          label: 'Office',
          addressLine: '88 Market St, San Francisco, CA',
          details: 'Reception desk, 8th floor',
          primary: false,
        },
      ];
    }

    if (!this.state.mealCartByUserByRestaurant[userEmail]) {
      this.state.mealCartByUserByRestaurant[userEmail] = {};
    }

    if (!this.state.checkoutDraftByUserByRestaurant[userEmail]) {
      this.state.checkoutDraftByUserByRestaurant[userEmail] = {};
    }

    if (!this.state.searchStateByUser[userEmail]) {
      this.state.searchStateByUser[userEmail] = {
        searchTerm: '',
        selectedCategory: 'Offers',
      };
    }

    if (!this.state.searchHistoryByUser[userEmail]) {
      this.state.searchHistoryByUser[userEmail] = [];
    }

    if (!this.state.reviewsByUserByRestaurant[userEmail]) {
      this.state.reviewsByUserByRestaurant[userEmail] = {};
    }

    if (typeof this.state.orderHistoryCustomizedByUser[userEmail] !== 'boolean') {
      this.state.orderHistoryCustomizedByUser[userEmail] = false;
    }
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  private readState(): PersistedState {
    if (typeof localStorage === 'undefined') {
      return this.createDefaultState();
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return this.createDefaultState();
      }

      const parsed = JSON.parse(raw) as Partial<PersistedState>;

      return {
        users: parsed.users ?? [],
        currentUserEmail: parsed.currentUserEmail ?? null,
        ordersByUser: parsed.ordersByUser ?? {},
        orderHistoryCustomizedByUser: parsed.orderHistoryCustomizedByUser ?? {},
        mealCartByUserByRestaurant: parsed.mealCartByUserByRestaurant ?? {},
        addressesByUser: parsed.addressesByUser ?? {},
        checkoutDraftByUserByRestaurant: parsed.checkoutDraftByUserByRestaurant ?? {},
        recentRestaurantsByUser: parsed.recentRestaurantsByUser ?? {},
        searchStateByUser: parsed.searchStateByUser ?? {},
        searchHistoryByUser: parsed.searchHistoryByUser ?? {},
        reviewsByUserByRestaurant: parsed.reviewsByUserByRestaurant ?? {},
      };
    } catch {
      return this.createDefaultState();
    }
  }

  private createDefaultState(): PersistedState {
    return {
      users: [],
      currentUserEmail: null,
      ordersByUser: {},
      orderHistoryCustomizedByUser: {},
      mealCartByUserByRestaurant: {},
      addressesByUser: {},
      checkoutDraftByUserByRestaurant: {},
      recentRestaurantsByUser: {},
      searchStateByUser: {},
      searchHistoryByUser: {},
      reviewsByUserByRestaurant: {},
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private createOrderId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private createOrderGroupId(): string {
    return `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private createAddressId(): string {
    return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private parseCurrency(amount: string): number {
    const cleaned = amount.replace(/[^\d.]/g, '');
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : 0;
  }

  private migrateLegacySampleOrders(userEmail: string): void {
    const currentOrders = this.state.ordersByUser[userEmail] ?? [];

    if (currentOrders.length !== 2) {
      return;
    }

    const hasLegacyBella = currentOrders.some(
      (order) => order.title === 'Bella Napoli' && order.status === 'On the way',
    );
    const hasLegacyBurger = currentOrders.some(
      (order) => order.title === 'The Burger Lab' && order.status === 'Delivered',
    );

    if (!hasLegacyBella || !hasLegacyBurger) {
      return;
    }

    this.state.ordersByUser[userEmail] = this.createSamplePastOrders();

    this.persist();
  }

  private normalizeStoredOrders(userEmail: string): void {
    const currentOrders = this.state.ordersByUser[userEmail] ?? [];

    if (!currentOrders.length) {
      return;
    }

    let hasChanges = false;

    this.state.ordersByUser[userEmail] = currentOrders.map((order) => {
      const normalizedRestaurantName = order.restaurantName ?? this.extractRestaurantName(order.title);
      const normalizedRestaurantId = order.restaurantId ?? this.getRestaurantIdByName(normalizedRestaurantName);
      const existingMeal = order.mealName ?? this.parseLegacyOrderTitle(order.title)?.mealName;
      const fallbackMeal = existingMeal ?? this.getDefaultMealNameForRestaurant(normalizedRestaurantName);
      const parsedLegacyOrder = this.parseLegacyOrderTitle(order.title);
      const normalizedOrder: StoredOrder = {
        ...order,
        restaurantName: normalizedRestaurantName,
        restaurantId: normalizedRestaurantId,
        orderGroupId: order.orderGroupId ?? this.createOrderGroupId(),
        mealName: fallbackMeal,
        quantity: order.quantity ?? parsedLegacyOrder?.quantity ?? 1,
        size: order.size ?? parsedLegacyOrder?.size ?? 'Regular',
        spicy: order.spicy ?? parsedLegacyOrder?.spicy ?? false,
      };

      if (
        normalizedOrder.status !== order.status
        || normalizedOrder.restaurantName !== order.restaurantName
        || normalizedOrder.restaurantId !== order.restaurantId
        || normalizedOrder.orderGroupId !== order.orderGroupId
        || normalizedOrder.mealName !== order.mealName
        || normalizedOrder.quantity !== order.quantity
        || normalizedOrder.size !== order.size
        || normalizedOrder.spicy !== order.spicy
      ) {
        hasChanges = true;
      }

      return normalizedOrder;
    });

    if (hasChanges) {
      this.persist();
    }
  }

  private createSeedOrder(
    restaurantId: string,
    restaurantName: string,
    mealName: string,
    amount: string,
    overrides?: Partial<Pick<StoredOrder, 'quantity' | 'size' | 'spicy' | 'orderGroupId' | 'createdAt'>>,
  ): StoredOrder {
    return {
      id: this.createOrderId(),
      title: `${restaurantName} - ${mealName} x${overrides?.quantity ?? 1}`,
      status: 'Delivered',
      amount,
      createdAt: overrides?.createdAt ?? new Date().toISOString(),
      restaurantId,
      restaurantName,
      orderGroupId: overrides?.orderGroupId ?? this.createOrderGroupId(),
      mealName,
      quantity: overrides?.quantity ?? 1,
      size: overrides?.size ?? 'Regular',
      spicy: overrides?.spicy ?? false,
    };
  }

  private createSamplePastOrders(): StoredOrder[] {
    const now = Date.now();
    const bellaGroup = this.createOrderGroupId();
    const sakuraGroup = this.createOrderGroupId();
    const burgerGroup = this.createOrderGroupId();
    const spiceGroup = this.createOrderGroupId();

    return [
      this.createSeedOrder('bella-napoli', 'Bella Napoli', "Chef's Margherita", '₱299.00', {
        orderGroupId: bellaGroup,
        createdAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
      }),
      this.createSeedOrder('bella-napoli', 'Bella Napoli', 'House Truffle Pasta', '₱249.00', {
        orderGroupId: bellaGroup,
        createdAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
      }),
      this.createSeedOrder('sakura-garden', 'Sakura Garden', 'Signature Salmon Roll', '₱350.00', {
        orderGroupId: sakuraGroup,
        quantity: 2,
        createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      }),
      this.createSeedOrder('sakura-garden', 'Sakura Garden', 'Dragon Maki', '₱209.00', {
        orderGroupId: sakuraGroup,
        createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      }),
      this.createSeedOrder('the-burger-lab', 'The Burger Lab', 'Classic Bacon Burger', '₱239.00', {
        orderGroupId: burgerGroup,
        createdAt: new Date(now - 14 * 60 * 60 * 1000).toISOString(),
      }),
      this.createSeedOrder('the-burger-lab', 'The Burger Lab', 'Crunchy Side Salad', '₱109.00', {
        orderGroupId: burgerGroup,
        createdAt: new Date(now - 14 * 60 * 60 * 1000).toISOString(),
      }),
      this.createSeedOrder('spice-route', 'Spice Route', "Chef's Special Curry", '₱199.00', {
        orderGroupId: spiceGroup,
        spicy: true,
        createdAt: new Date(now - 30 * 60 * 60 * 1000).toISOString(),
      }),
      this.createSeedOrder('spice-route', 'Spice Route', 'Side Salad', '₱99.00', {
        orderGroupId: spiceGroup,
        createdAt: new Date(now - 30 * 60 * 60 * 1000).toISOString(),
      }),
    ];
  }

  private ensureFourRestaurantTestOrders(userEmail: string): void {
    if (this.state.orderHistoryCustomizedByUser[userEmail]) {
      return;
    }

    const currentOrders = this.state.ordersByUser[userEmail] ?? [];

    if (currentOrders.some((order) => order.status !== 'Delivered')) {
      return;
    }

    if (this.matchesCurrentFourRestaurantSample(currentOrders)) {
      return;
    }

    if (!currentOrders.length || this.shouldReplaceLegacyHistory(currentOrders)) {
      this.state.ordersByUser[userEmail] = this.createSamplePastOrders();
      this.persist();
    }
  }

  private shouldReplaceLegacyHistory(orders: StoredOrder[]): boolean {
    if (!orders.length || orders.length > 8) {
      return false;
    }

    const restaurantIds = new Set(
      orders.map((order) => order.restaurantId ?? this.getRestaurantIdByName(order.restaurantName ?? this.extractRestaurantName(order.title)) ?? ''),
    );

    const knownRestaurants = new Set(['bella-napoli', 'sakura-garden', 'the-burger-lab', 'spice-route']);

    if (Array.from(restaurantIds).some((restaurantId) => restaurantId && !knownRestaurants.has(restaurantId))) {
      return false;
    }

    return orders.every((order) => order.status === 'Delivered');
  }

  private matchesCurrentFourRestaurantSample(orders: StoredOrder[]): boolean {
    if (orders.length !== 8) {
      return false;
    }

    const normalizedSignatures = orders
      .map((order) => {
        const restaurantName = order.restaurantName ?? this.extractRestaurantName(order.title);
        const restaurantId = order.restaurantId ?? this.getRestaurantIdByName(restaurantName) ?? '';
        const parsedLegacyOrder = this.parseLegacyOrderTitle(order.title);
        const mealName = order.mealName ?? parsedLegacyOrder?.mealName ?? '';
        const quantity = order.quantity ?? parsedLegacyOrder?.quantity ?? 1;

        return `${restaurantId}|${mealName}|${quantity}|${order.amount}|${order.status}`;
      })
      .sort();

    const sampleSignatures = [
      "bella-napoli|Chef's Margherita|1|₱299.00|Delivered",
      'bella-napoli|House Truffle Pasta|1|₱249.00|Delivered',
      'sakura-garden|Signature Salmon Roll|2|₱350.00|Delivered',
      'sakura-garden|Dragon Maki|1|₱209.00|Delivered',
      'the-burger-lab|Classic Bacon Burger|1|₱239.00|Delivered',
      'the-burger-lab|Crunchy Side Salad|1|₱109.00|Delivered',
      "spice-route|Chef's Special Curry|1|₱199.00|Delivered",
      'spice-route|Side Salad|1|₱99.00|Delivered',
    ].sort();

    return normalizedSignatures.every((signature, index) => signature === sampleSignatures[index]);
  }

  private groupOrdersByGroupId(orders: StoredOrder[]): Array<{ groupId: string; orders: StoredOrder[] }> {
    const groups = orders.reduce<Map<string, StoredOrder[]>>((map, order) => {
      const groupId = order.orderGroupId ?? order.id;
      const current = map.get(groupId) ?? [];
      map.set(groupId, [...current, order]);
      return map;
    }, new Map<string, StoredOrder[]>());

    return Array.from(groups.entries()).map(([groupId, groupedOrders]) => ({
      groupId,
      orders: groupedOrders,
    }));
  }

  private getRestaurantIdByName(restaurantName: string): string | undefined {
    const normalizedName = restaurantName.trim().toLowerCase();
    const restaurantMap: Record<string, string> = {
      'bella napoli': 'bella-napoli',
      'sakura garden': 'sakura-garden',
      'the burger lab': 'the-burger-lab',
      'spice route': 'spice-route',
    };

    return restaurantMap[normalizedName];
  }

  private getDefaultMealNameForRestaurant(restaurantName: string): string {
    const normalizedName = restaurantName.trim().toLowerCase();
    const mealMap: Record<string, string> = {
      'bella napoli': "Chef's Margherita",
      'sakura garden': 'Signature Salmon Roll',
      'the burger lab': 'Classic Bacon Burger',
      'spice route': "Chef's Special Curry",
    };

    return mealMap[normalizedName] ?? 'House Special';
  }

  private extractRestaurantName(title: string): string {
    return title.split(' - ')[0]?.trim() || title.trim();
  }

  private buildCartItemFromOrder(order: StoredOrder): StoredMealCartItem | null {
    if (order.mealName && order.size && typeof order.quantity === 'number') {
      return {
        mealName: order.mealName,
        mealPrice: this.formatCurrency(this.parseCurrency(order.amount) / Math.max(order.quantity, 1)),
        quantity: Math.max(order.quantity, 1),
        size: order.size,
        spicy: !!order.spicy,
      };
    }

    const parsedLegacyOrder = this.parseLegacyOrderTitle(order.title);

    if (!parsedLegacyOrder) {
      return null;
    }

    return {
      mealName: parsedLegacyOrder.mealName,
      mealPrice: this.formatCurrency(this.parseCurrency(order.amount) / Math.max(parsedLegacyOrder.quantity, 1)),
      quantity: parsedLegacyOrder.quantity,
      size: parsedLegacyOrder.size,
      spicy: parsedLegacyOrder.spicy,
    };
  }

  private parseLegacyOrderTitle(title: string): { mealName: string; quantity: number; size: 'Small' | 'Regular' | 'Large'; spicy: boolean } | null {
    const [, details = ''] = title.split(' - ');

    if (!details.trim()) {
      return null;
    }

    const match = details.match(/^(.*?)(?:\s*\((Small|Regular|Large)(,\s*Spicy)?\))?\s*x(\d+)$/);

    if (!match) {
      return {
        mealName: details.trim(),
        quantity: 1,
        size: 'Regular',
        spicy: false,
      };
    }

    return {
      mealName: match[1].trim(),
      quantity: Math.max(1, Number(match[4]) || 1),
      size: (match[2] as 'Small' | 'Regular' | 'Large' | undefined) ?? 'Regular',
      spicy: !!match[3],
    };
  }

  private formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2)}`;
  }

  private notifyMealCartChanged(): void {
    this.mealCartChangedSubject.next();
  }

  private notifyOrdersChanged(): void {
    this.ordersChangedSubject.next();
  }

  private async hashPassword(password: string): Promise<string> {
    const trimmed = password.trim();

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(trimmed);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    }

    return btoa(trimmed);
  }
}
