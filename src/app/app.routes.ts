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
    path: 'personal-taste',
    loadComponent: () => import('./personal-taste/personal-taste.page').then((m) => m.PersonalTastePage),
  },
  {
    path: 'food4u-pro',
    loadComponent: () => import('./food4u-pro/food4u-pro.page').then((m) => m.Food4uProPage),
  },
  {
    path: 'account-vouchers',
    loadComponent: () => import('./account-vouchers/account-vouchers.page').then((m) => m.AccountVouchersPage),
  },
  {
    path: 'invite-friends',
    loadComponent: () => import('./invite-friends/invite-friends.page').then((m) => m.InviteFriendsPage),
  },
  {
    path: 'help-center',
    loadComponent: () => import('./help-center/help-center.page').then((m) => m.HelpCenterPage),
  },
  {
    path: 'terms-policies',
    loadComponent: () => import('./terms-policies/terms-policies.page').then((m) => m.TermsPoliciesPage),
  },
  {
    path: 'checkout/:id',
    loadComponent: () => import('./checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'payment-gcash/:id',
    loadComponent: () => import('./payment-gcash/payment-gcash.page').then((m) => m.PaymentGcashPage),
  },
  {
    path: 'payment-card/:id',
    loadComponent: () => import('./payment-card/payment-card.page').then((m) => m.PaymentCardPage),
  },
  {
    path: 'payment-verification/:id',
    loadComponent: () => import('./payment-verification/payment-verification.page').then((m) => m.PaymentVerificationPage),
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
    path: 'track/:groupId',
    loadComponent: () => import('./track-order/track-order.page').then((m) => m.TrackOrderPage),
  },
  {
    path: 'notifications',
    loadComponent: () => import('./notifications/notifications.page').then((m) => m.NotificationsPage),
  },
  {
    path: 'restaurant-cart/:id',
    loadComponent: () => import('./restaurant-cart/restaurant-cart.page').then((m) => m.RestaurantCartPage),
  },
];
