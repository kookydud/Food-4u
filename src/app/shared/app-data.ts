export type NavItem = {
  label: string;
  iconImage: string;
  route: string;
};

export type Category = {
  label: string;
  iconImage: string;
};

export type TopBarConfig = {
  title?: string;
  locationLabel?: string;
  locationValue?: string;
};

export const navigationItems: NavItem[] = [
  { label: 'Home', iconImage: 'assets/icon/home.png', route: '/home' },
  { label: 'Search', iconImage: 'assets/icon/search.png', route: '/search' },
  { label: 'Orders', iconImage: 'assets/icon/order.png', route: '/orders' },
  { label: 'Offers', iconImage: 'assets/icon/offers.png', route: '/offers' },
  { label: 'Account', iconImage: 'assets/icon/account.png', route: '/account' },
];

export const foodCategories: Category[] = [
  { label: 'Offers', iconImage: 'assets/icon/salad.jpg' },
  { label: 'Pizza', iconImage: 'assets/icon/Foods/pizza.jpg' },
  { label: 'Burgers', iconImage: 'assets/icon/Foods/burgers.jpg' },
  { label: 'Sushi', iconImage: 'assets/icon/Foods/sushis.jpg' },
];

export const topBarConfig: Record<string, TopBarConfig> = {
  home: {
    title: 'Food 4U',
    locationLabel: 'Deliver to',
    locationValue: 'Current Location',
  },
  search: {
    title: 'Search',
  },
};
