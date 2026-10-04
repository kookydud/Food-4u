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
      image: 'assets/images/restaurants/bella-napoli.jpg',
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
      image: 'assets/images/restaurants/sakura-garden.jpg',
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
      image: 'assets/images/restaurants/the-burger-lab.jpg',
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
      image: 'assets/images/restaurants/spice-route.jpg',
      category: 'Curry',
    },
    {
      id: 'tokyo-ramen-street',
      name: 'Tokyo Ramen Street',
      cuisine: '₱229.00 · Sushi',
      rating: 4.8,
      time: '28–38 min',
      fee: '🚲 ₱39.00',
      badge: 'Hot',
      tone: 'ramen',
      image: 'assets/images/restaurants/tokyo-ramen-street.jpg',
      category: 'Sushi',
    },
    {
      id: 'firegrill-bbq',
      name: 'FireGrill BBQ',
      cuisine: '₱215.00 · Burgers',
      rating: 4.7,
      time: '24–34 min',
      fee: '🚲 ₱45.00',
      badge: 'Top Pick',
      tone: 'grill',
      image: 'assets/images/restaurants/firegrill-bbq.jpg',
      category: 'Burgers',
    },
    {
      id: 'mediterranean-bowl',
      name: 'Mediterranean Bowl',
      cuisine: '₱185.00 · Curry',
      rating: 4.6,
      time: '22–32 min',
      fee: '🚲 Free',
      badge: 'Healthy',
      tone: 'salad',
      image: 'assets/images/restaurants/mediterranean-bowl.jpg',
      category: 'Curry',
    },
    {
      id: 'brick-oven-co',
      name: 'Brick Oven Co.',
      cuisine: '₱279.00 · Pizza',
      rating: 4.9,
      time: '26–36 min',
      fee: '🚲 ₱59.00',
      badge: 'Chef Choice',
      tone: 'pizza',
      image: 'assets/images/restaurants/brick-oven-co.jpg',
      category: 'Pizza',
    },
    {
      id: 'green-wok-kitchen',
      name: 'Green Wok Kitchen',
      cuisine: '₱169.00 · Sushi',
      rating: 4.7,
      time: '20–30 min',
      fee: '🚲 ₱35.00',
      badge: 'New',
      tone: 'wok',
      image: 'assets/images/restaurants/green-wok-kitchen.jpg',
      category: 'Sushi',
    },
  ];

  private readonly mealsByRestaurant: Record<string, RestaurantMeal[]> = {
    'bella-napoli': [
      {
        name: "Chef's Margherita",
        description: 'Fresh basil, mozzarella, tomato sauce',
        price: '₱299.00',
        image: 'assets/images/meals/chefs-margherita.jpg',
        badge: 'Popular',
      },
      {
        name: 'House Truffle Pasta',
        description: 'Creamy truffle sauce with parmesan',
        price: '₱249.00',
        image: 'assets/images/meals/house-truffle-pasta.jpg',
      },
      {
        name: 'Garden Side Salad',
        description: 'Fresh greens with lemon dressing',
        price: '₱119.00',
        image: 'assets/images/meals/garden-side-salad.jpg',
      },
    ],
    'sakura-garden': [
      {
        name: 'Signature Salmon Roll',
        description: 'Salmon, avocado, cucumber',
        price: '₱175.00',
        image: 'assets/images/meals/signature-salmon-roll.jpg',
        badge: 'Best Seller',
      },
      {
        name: 'Dragon Maki',
        description: 'Eel sauce, tempura flakes, crabstick',
        price: '₱209.00',
        image: 'assets/images/meals/dragon-maki.jpg',
      },
      {
        name: 'Seaweed Salad',
        description: 'Sesame, soy vinaigrette',
        price: '₱99.00',
        image: 'assets/images/meals/seaweed-salad.jpg',
      },
    ],
    'the-burger-lab': [
      {
        name: 'Lab Double Cheeseburger',
        description: 'Double patty, cheddar, house sauce',
        price: '₱265.00',
        image: 'assets/images/meals/lab-double-cheeseburger.jpg',
        badge: 'Popular',
      },
      {
        name: 'Classic Bacon Burger',
        description: 'Smoked bacon, lettuce, pickles',
        price: '₱239.00',
        image: 'assets/images/meals/classic-bacon-burger.jpg',
      },
      {
        name: 'Crunchy Side Salad',
        description: 'Romaine, cherry tomatoes, dressing',
        price: '₱109.00',
        image: 'assets/images/meals/crunchy-side-salad.jpg',
      },
    ],
    'spice-route': [
      {
        name: "Chef's Special Curry",
        description: "Today's freshest ingredients",
        price: '₱199.00',
        image: 'assets/images/meals/chefs-special-curry.jpg',
        badge: 'Popular',
      },
      {
        name: 'House Signature Curry',
        description: 'A classic crowd favourite',
        price: '₱189.00',
        image: 'assets/images/meals/house-signature-curry.jpg',
      },
      {
        name: 'Side Salad',
        description: 'Fresh greens, house dressing',
        price: '₱99.00',
        image: 'assets/images/meals/side-salad.jpg',
      },
    ],
    'tokyo-ramen-street': [
      {
        name: 'Shoyu Chashu Ramen',
        description: 'Soy broth, pork chashu, soft egg, scallions',
        price: '₱229.00',
        image: 'assets/images/meals/shoyu-chashu-ramen.jpg',
        badge: 'Popular',
      },
      {
        name: 'Spicy Miso Ramen',
        description: 'Rich miso broth with chili oil and corn',
        price: '₱249.00',
        image: 'assets/images/meals/spicy-miso-ramen.jpg',
      },
      {
        name: 'Gyoza Plate',
        description: 'Pan-fried dumplings with sesame dip',
        price: '₱139.00',
        image: 'assets/images/meals/gyoza-plate.jpg',
      },
    ],
    'firegrill-bbq': [
      {
        name: 'Smoky Angus Burger',
        description: 'Angus patty, smoked cheddar, onion jam',
        price: '₱215.00',
        image: 'assets/images/meals/smoky-angus-burger.jpg',
        badge: 'Best Seller',
      },
      {
        name: 'BBQ Pulled Pork Stack',
        description: 'Slow-cooked pork, pickles, brioche bun',
        price: '₱239.00',
        image: 'assets/images/meals/bbq-pulled-pork-stack.jpg',
      },
      {
        name: 'Loaded Potato Wedges',
        description: 'Cheese sauce, bacon bits, spring onion',
        price: '₱129.00',
        image: 'assets/images/meals/loaded-potato-wedges.jpg',
      },
    ],
    'mediterranean-bowl': [
      {
        name: 'Chicken Shawarma Bowl',
        description: 'Herb rice, grilled chicken, garlic yogurt',
        price: '₱185.00',
        image: 'assets/images/meals/chicken-shawarma-bowl.jpg',
        badge: 'Healthy',
      },
      {
        name: 'Falafel Hummus Plate',
        description: 'Crispy falafel, hummus, cucumber tomato salad',
        price: '₱169.00',
        image: 'assets/images/meals/falafel-hummus-plate.jpg',
      },
      {
        name: 'Lemon Herb Couscous',
        description: 'Light couscous with roasted vegetables',
        price: '₱149.00',
        image: 'assets/images/meals/lemon-herb-couscous.jpg',
      },
    ],
    'brick-oven-co': [
      {
        name: 'Four Cheese Blaze',
        description: 'Mozzarella, parmesan, provolone, cheddar',
        price: '₱279.00',
        image: 'assets/images/meals/four-cheese-blaze.jpg',
        badge: 'Trending',
      },
      {
        name: 'Pepperoni Inferno',
        description: 'Pepperoni, chili flakes, roasted garlic oil',
        price: '₱299.00',
        image: 'assets/images/meals/pepperoni-inferno.jpg',
      },
      {
        name: 'Pesto Mushroom Flatbread',
        description: 'Basil pesto, mushrooms, feta crumble',
        price: '₱219.00',
        image: 'assets/images/meals/pesto-mushroom-flatbread.jpg',
      },
    ],
    'green-wok-kitchen': [
      {
        name: 'Garlic Shrimp Yakisoba',
        description: 'Stir-fried noodles, shrimp, garlic soy glaze',
        price: '₱169.00',
        image: 'assets/images/meals/garlic-shrimp-yakisoba.jpg',
        badge: 'New',
      },
      {
        name: 'Teriyaki Tofu Rice',
        description: 'Crispy tofu, teriyaki sauce, sesame seeds',
        price: '₱159.00',
        image: 'assets/images/meals/teriyaki-tofu-rice.jpg',
      },
      {
        name: 'Chicken Katsu Curry',
        description: 'Breaded chicken, curry sauce, steamed rice',
        price: '₱199.00',
        image: 'assets/images/meals/chicken-katsu-curry.jpg',
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
    'tokyo-ramen-street': [
      { author: 'Yuri', rating: 4.9, comment: 'Broth is deep and flavorful, noodles were perfect.' },
      { author: 'Sam', rating: 4.7, comment: 'Fast delivery and still piping hot on arrival.' },
    ],
    'firegrill-bbq': [
      { author: 'Toni', rating: 4.8, comment: 'Great smoky profile and generous burger portions.' },
      { author: 'Bea', rating: 4.6, comment: 'Wedges were crispy and the sauce was excellent.' },
    ],
    'mediterranean-bowl': [
      { author: 'Hana', rating: 4.7, comment: 'Fresh ingredients and balanced flavors.' },
      { author: 'Jules', rating: 4.5, comment: 'Healthy but still filling and tasty.' },
    ],
    'brick-oven-co': [
      { author: 'Ralph', rating: 5, comment: 'Crust texture is outstanding, cheese blend is great.' },
      { author: 'Ina', rating: 4.8, comment: 'Pepperoni had just the right kick.' },
    ],
    'green-wok-kitchen': [
      { author: 'Cara', rating: 4.7, comment: 'Yakisoba was flavorful and not too oily.' },
      { author: 'Noel', rating: 4.6, comment: 'Good value meals and quick prep time.' },
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
    'tokyo-ramen-street': {
      about: 'Ramen bar focused on rich broths and handmade noodles.',
      address: '3rd Floor, Eastwood Avenue, Quezon City',
      openingHours: '11:00 AM - 11:00 PM',
      contact: '+63 912 345 5555',
    },
    'firegrill-bbq': {
      about: 'Flame-grilled burgers and smoky comfort classics.',
      address: 'Unit 12, Capitol Commons, Pasig',
      openingHours: '10:00 AM - 12:00 AM',
      contact: '+63 912 345 6666',
    },
    'mediterranean-bowl': {
      about: 'Levant-inspired bowls and wraps with fresh daily prep.',
      address: 'Ground Floor, Greenfield District, Mandaluyong',
      openingHours: '9:00 AM - 9:00 PM',
      contact: '+63 912 345 7777',
    },
    'brick-oven-co': {
      about: 'Stone-baked pizza house with premium toppings.',
      address: '2nd Floor, Uptown Parade, Taguig',
      openingHours: '11:00 AM - 10:30 PM',
      contact: '+63 912 345 8888',
    },
    'green-wok-kitchen': {
      about: 'Wok-seared rice and noodle bowls for everyday cravings.',
      address: 'Level 1, Ayala Malls Circuit, Makati',
      openingHours: '10:00 AM - 10:00 PM',
      contact: '+63 912 345 9999',
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
