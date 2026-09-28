import { Injectable } from '@angular/core';

export type Restaurant = {
  id: string;
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

export type RestaurantMeal = {
  name: string;
  description: string;
  price: string;
  image: string;
  badge?: string;
};

export type RestaurantReview = {
  author: string;
  rating: number;
  comment: string;
};

export type RestaurantInfo = {
  about: string;
  address: string;
  openingHours: string;
  contact: string;
};

const createPlaceholderImage = (label: string, width = 220, height = 150) =>
  `https://placehold.co/${width}x${height}/F3E8FF/6D28D9?text=${encodeURIComponent(label)}`;

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private readonly restaurants: Restaurant[] = [
    {
      id: 'bella-napoli',
      name: 'Bella Napoli',
      cuisine: '₱299.00 · Pizza',
      rating: 4.8,
      time: '25–35 min',
      fee: '🚲 ₱49.00',
      badge: 'Popular',
      tone: 'pasta',
      image: 'assets/icon/Foods/restau_pizza.jpg',
      category: 'Pizza',
    },
    {
      id: 'sakura-garden',
      name: 'Sakura Garden',
      cuisine: '₱175.00 · Sushi',
      rating: 4.9,
      time: '30–40 min',
      fee: '🚲 Free',
      badge: 'New',
      tone: 'sushi',
      image: 'assets/icon/Foods/restau_sushis.jpg',
      category: 'Sushi',
    },
    {
      id: 'the-burger-lab',
      name: 'The Burger Lab',
      cuisine: '₱65.00 · Burgers',
      rating: 4.7,
      time: '20–30 min',
      fee: '🚲 ₱79.00',
      badge: 'Top Rated',
      tone: 'burger',
      image: 'assets/icon/Foods/restau_burgers.jpg',
      category: 'Burgers',
    },
    {
      id: 'spice-route',
      name: 'Spice Route',
      cuisine: '₱199.00 · Curry',
      rating: 4.6,
      time: '25–35 min',
      fee: '🚲 ₱49.00',
      badge: 'Trending',
      tone: 'curry',
      image: 'assets/icon/Foods/restau_curry.jpg',
      category: 'Curry',
    },
  ];

  private readonly mealsByRestaurant: Record<string, RestaurantMeal[]> = {
    'bella-napoli': [
      {
        name: "Chef's Margherita",
        description: 'Fresh basil, mozzarella, tomato sauce',
        price: '₱299.00',
        image: 'assets/icon/Foods/pizza.jpg',
        badge: 'Popular',
      },
      {
        name: 'House Truffle Pasta',
        description: 'Creamy truffle sauce with parmesan',
        price: '₱249.00',
        image: 'assets/icon/Foods/restau_pizza.jpg',
      },
      {
        name: 'Garden Side Salad',
        description: 'Fresh greens with lemon dressing',
        price: '₱119.00',
        image: 'assets/icon/salad.jpg',
      },
    ],
    'sakura-garden': [
      {
        name: 'Signature Salmon Roll',
        description: 'Salmon, avocado, cucumber',
        price: '₱175.00',
        image: 'assets/icon/Foods/sushis.jpg',
        badge: 'Best Seller',
      },
      {
        name: 'Dragon Maki',
        description: 'Eel sauce, tempura flakes, crabstick',
        price: '₱209.00',
        image: 'assets/icon/Foods/restau_sushis.jpg',
      },
      {
        name: 'Seaweed Salad',
        description: 'Sesame, soy vinaigrette',
        price: '₱99.00',
        image: 'assets/icon/salad.jpg',
      },
    ],
    'the-burger-lab': [
      {
        name: 'Lab Double Cheeseburger',
        description: 'Double patty, cheddar, house sauce',
        price: '₱265.00',
        image: 'assets/icon/Foods/burgers.jpg',
        badge: 'Popular',
      },
      {
        name: 'Classic Bacon Burger',
        description: 'Smoked bacon, lettuce, pickles',
        price: '₱239.00',
        image: 'assets/icon/Foods/restau_burgers.jpg',
      },
      {
        name: 'Crunchy Side Salad',
        description: 'Romaine, cherry tomatoes, dressing',
        price: '₱109.00',
        image: 'assets/icon/salad.jpg',
      },
    ],
    'spice-route': [
      {
        name: "Chef's Special Curry",
        description: "Today's freshest ingredients",
        price: '₱199.00',
        image: 'assets/icon/Foods/restau_curry.jpg',
        badge: 'Popular',
      },
      {
        name: 'House Signature Curry',
        description: 'A classic crowd favourite',
        price: '₱189.00',
        image: 'assets/icon/Foods/restau_curry.jpg',
      },
      {
        name: 'Side Salad',
        description: 'Fresh greens, house dressing',
        price: '₱99.00',
        image: 'assets/icon/salad.jpg',
      },
    ],
  };

  private readonly reviewsByRestaurant: Record<string, RestaurantReview[]> = {
    'bella-napoli': [
      { author: 'Marco', rating: 5, comment: 'Amazing crust and very fresh toppings.' },
      { author: 'Rina', rating: 4.7, comment: 'Fast delivery and the pasta was creamy.' },
    ],
    'sakura-garden': [
      { author: 'Ken', rating: 5, comment: 'Fresh sushi and very clean presentation.' },
      { author: 'Aya', rating: 4.8, comment: 'Loved the maki rolls and portions.' },
    ],
    'the-burger-lab': [
      { author: 'Niko', rating: 4.8, comment: 'Juicy patties and great value.' },
      { author: 'Elle', rating: 4.6, comment: 'Bacon burger is my favorite here.' },
    ],
    'spice-route': [
      { author: 'Luis', rating: 4.7, comment: 'Rich curry flavor and generous serving.' },
      { author: 'Mia', rating: 4.5, comment: 'Comfort food, nicely packed and warm.' },
    ],
  };

  private readonly infoByRestaurant: Record<string, RestaurantInfo> = {
    'bella-napoli': {
      about: 'Italian comfort food with handcrafted pizzas and pasta.',
      address: 'Level 2, Food4U Center, Makati',
      openingHours: '10:00 AM - 10:00 PM',
      contact: '+63 912 345 1111',
    },
    'sakura-garden': {
      about: 'Japanese favorites prepared fresh every day.',
      address: 'Ground Floor, Sakura Square, BGC',
      openingHours: '11:00 AM - 9:30 PM',
      contact: '+63 912 345 2222',
    },
    'the-burger-lab': {
      about: 'Loaded burgers, fries, and house-made sauces.',
      address: 'Unit 5, Burger Lane, Ortigas',
      openingHours: '9:00 AM - 11:00 PM',
      contact: '+63 912 345 3333',
    },
    'spice-route': {
      about: 'Classic curry and spice-forward comfort meals.',
      address: '2nd Floor, Curry Plaza, Quezon City',
      openingHours: '10:30 AM - 10:30 PM',
      contact: '+63 912 345 4444',
    },
  };

  getRestaurants(): Restaurant[] {
    return this.restaurants;
  }

  getRestaurantById(restaurantId: string): Restaurant | undefined {
    return this.restaurants.find((restaurant) => restaurant.id === restaurantId);
  }

  getRestaurantsByCategory(category: string): Restaurant[] {
    if (!category || category.toLowerCase() === 'offers') {
      return this.restaurants;
    }

    return this.restaurants.filter(
      (restaurant) => restaurant.category.toLowerCase() === category.toLowerCase(),
    );
  }

  searchRestaurants(query: string): Restaurant[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return this.restaurants;
    }

    return this.restaurants.filter((restaurant) => {
      const haystack = `${restaurant.name} ${restaurant.cuisine} ${restaurant.category}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }

  getMealsByRestaurant(restaurantId: string): RestaurantMeal[] {
    return this.mealsByRestaurant[restaurantId] ?? [];
  }

  getReviewsByRestaurant(restaurantId: string): RestaurantReview[] {
    return this.reviewsByRestaurant[restaurantId] ?? [];
  }

  getInfoByRestaurant(restaurantId: string): RestaurantInfo | undefined {
    return this.infoByRestaurant[restaurantId];
  }
}
