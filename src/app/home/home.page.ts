import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';

type Category = {
  label: string;
  iconImage: string;
};

type Restaurant = {
  name: string;
  cuisine: string;
  rating: number;
  time: string;
  fee: string;
  badge: string;
  tone: string;
  image: string;
  category: string;
};

const createPlaceholderImage = (label: string, width = 220, height = 150) =>
  `https://placehold.co/${width}x${height}/F3E8FF/6D28D9?text=${encodeURIComponent(label)}`;

const createCategoryIcon = (label: string) =>
  `https://placehold.co/64x64/F3E8FF/6D28D9?text=${encodeURIComponent(label.slice(0, 3).toUpperCase())}`;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonContent],
})
export class HomePage {
  selectedCategory = 'Offers';
  searchTerm = '';

  categories: Category[] = [
    { label: 'Offers', iconImage: createCategoryIcon('Offers') },
    { label: 'Pizza', iconImage: createCategoryIcon('Pizza') },
    { label: 'Burgers', iconImage: createCategoryIcon('Burgers') },
    { label: 'Sushi', iconImage: createCategoryIcon('Sushi') },
  ];

  restaurants: Restaurant[] = [
    {
      name: 'Bella Napoli',
      cuisine: 'Italian · Pizza',
      rating: 4.8,
      time: '25–35 min',
      fee: '$1.99',
      badge: 'Popular',
      tone: 'pasta',
      image: createPlaceholderImage('Bella Napoli'),
      category: 'Pizza',
    },
    {
      name: 'Sakura Garden',
      cuisine: 'Japanese · Sushi',
      rating: 4.9,
      time: '30–40 min',
      fee: 'Free',
      badge: 'New',
      tone: 'sushi',
      image: createPlaceholderImage('Sakura Garden'),
      category: 'Sushi',
    },
    {
      name: 'The Burger Lab',
      cuisine: 'American · Burgers',
      rating: 4.7,
      time: '20–30 min',
      fee: '$0.99',
      badge: 'Top Rated',
      tone: 'burger',
      image: createPlaceholderImage('Burger Lab'),
      category: 'Burgers',
    },
    {
      name: 'Spice Route',
      cuisine: 'Indian · Curry',
      rating: 4.6,
      time: '25–35 min',
      fee: '$2.99',
      badge: 'Trending',
      tone: 'curry',
      image: createPlaceholderImage('Spice Route'),
      category: 'Pizza',
    },
  ];

  navigation = [
    { label: 'Home', iconImage: createCategoryIcon('Home'), route: '/home' },
    { label: 'Search', iconImage: createCategoryIcon('Search'), route: '/search' },
    { label: 'Orders', iconImage: createCategoryIcon('Orders'), route: '/orders' },
    { label: 'Offers', iconImage: createCategoryIcon('Offers'), route: '/offers' },
    { label: 'Account', iconImage: createCategoryIcon('Account'), route: '/account' },
  ];

  currentTab = 'Home';

  constructor(private readonly router: Router) {}

  get filteredRestaurants() {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    const categoryFiltered = this.selectedCategory === 'Offers'
      ? this.restaurants
      : this.restaurants.filter(
          (restaurant) => restaurant.category.toLowerCase() === this.selectedCategory.toLowerCase(),
        );

    if (!normalizedSearch) {
      return categoryFiltered;
    }

    return categoryFiltered.filter((restaurant) => {
      const haystack = `${restaurant.name} ${restaurant.cuisine} ${restaurant.category}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  navigateTo(route: string, label: string): void {
    this.currentTab = label;
    this.router.navigateByUrl(route);
  }

  goToAddress(): void {
    this.router.navigateByUrl('/address');
  }

  isTabActive(label: string): boolean {
    return this.currentTab === label;
  }
}
