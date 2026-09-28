import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'search',
    loadComponent: () => import('./search/search.page').then((m) => m.SearchPage),
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.page').then((m) => m.OrdersPage),
  },
  {
    path: 'offers',
    loadComponent: () => import('./offers/offers.page').then((m) => m.OffersPage),
  },
  {
    path: 'account',
    loadComponent: () => import('./account/account.page').then((m) => m.AccountPage),
  },
  {
    path: 'account-cart',
    loadComponent: () => import('./account-cart/account-cart.page').then((m) => m.AccountCartPage),
  },
  {
    path: 'address',
    loadComponent: () => import('./address/address.page').then((m) => m.AddressPage),
  },
  {
    path: 'checkout/:id',
    loadComponent: () => import('./checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'vouchers/:id',
    loadComponent: () => import('./vouchers/vouchers.page').then((m) => m.VouchersPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'get-started',
    loadComponent: () => import('./get-started/get-started.page').then((m) => m.GetStartedPage),
  },
  {
    path: 'verification',
    loadComponent: () => import('./verification/verification.page').then((m) => m.VerificationPage),
  },
  {
    path: 'restaurant/:id',
    loadComponent: () => import('./restaurant/restaurant.page').then((m) => m.RestaurantPage),
  },
  {
    path: 'meal/:restaurantId/:mealName',
    loadComponent: () => import('./meal/meal.page').then((m) => m.MealPage),
  },
  {
    path: 'restaurant-cart/:id',
    loadComponent: () => import('./restaurant-cart/restaurant-cart.page').then((m) => m.RestaurantCartPage),
  },
];
