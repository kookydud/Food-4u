import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { RestaurantMeal, RestaurantService } from '../services/restaurant.service';

type OfferMeal = RestaurantMeal & {
  restaurantId: string;
  restaurantName: string;
};

type OfferGroup = {
  label: string;
  title: string;
  subtitle: string;
  description: string;
  accentClass: string;
  meals: OfferMeal[];
};

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
  imports: [CommonModule, IonContent],
})
export class OffersPage {
  offerGroups: OfferGroup[] = [
    {
      label: 'Buy 1 Get 1',
      title: 'Buy one, get one special picks',
      subtitle: 'Great for sharing or doubling up.',
      description: 'Select meals from these restaurants are eligible for our buy-one-get-one style promos.',
      accentClass: 'accent-bogo',
      meals: this.buildOfferMeals([
        ['bella-napoli', "Chef's Margherita"],
        ['the-burger-lab', 'Classic Bacon Burger'],
        ['sakura-garden', 'Dragon Maki'],
      ]),
    },
    {
      label: '50% Off',
      title: 'Half-price favorites',
      subtitle: 'Fresh meals with a softer bill.',
      description: 'These dishes are featured under the current half-off selections.',
      accentClass: 'accent-half',
      meals: this.buildOfferMeals([
        ['bella-napoli', 'House Truffle Pasta'],
        ['sakura-garden', 'Signature Salmon Roll'],
        ['spice-route', "Chef's Special Curry"],
      ]),
    },
    {
      label: 'Free Side Dishes',
      title: 'Meals with free sides',
      subtitle: 'Add-ons already included.',
      description: 'Pick from these meals and get selected sides bundled in at no extra charge.',
      accentClass: 'accent-sides',
      meals: this.buildOfferMeals([
        ['the-burger-lab', 'Crunchy Side Salad'],
        ['bella-napoli', 'Garden Side Salad'],
        ['spice-route', 'Side Salad'],
      ]),
    },
  ];

  navigation = [
    { label: 'Home', iconImage: 'assets/icon/home.png', route: '/home' },
    { label: 'Search', iconImage: 'assets/icon/search.png', route: '/search' },
    { label: 'Orders', iconImage: 'assets/icon/order.png', route: '/orders' },
    { label: 'Offers', iconImage: 'assets/icon/offers.png', route: '/offers' },
    { label: 'Account', iconImage: 'assets/icon/account.png', route: '/account' },
  ];

  constructor(
    private readonly router: Router,
    private readonly restaurantService: RestaurantService,
  ) {}

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  openMeal(meal: OfferMeal): void {
    this.router.navigate(['/meal', meal.restaurantId, meal.name]);
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

  private buildOfferMeals(selection: Array<[string, string]>): OfferMeal[] {
    return selection
      .map(([restaurantId, mealName]) => {
        const restaurant = this.restaurantService.getRestaurantById(restaurantId);
        const meal = this.restaurantService
          .getMealsByRestaurant(restaurantId)
          .find((entry) => entry.name.toLowerCase() === mealName.toLowerCase());

        if (!restaurant || !meal) {
          return null;
        }

        return {
          ...meal,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
        } satisfies OfferMeal;
      })
      .filter((meal): meal is OfferMeal => meal !== null);
  }
}
