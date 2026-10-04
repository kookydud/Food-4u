export type SpiceLevel = 'Mild' | 'Medium' | 'Spicy';

export type PersonalTasteState = {
  diets: string[];
  allergens: string[];
  customAllergies: string[];
  avoidIngredients: string[];
  cookingPreferences: string[];
  spiceLevel: SpiceLevel;
};

export const PERSONAL_TASTE_STORAGE_KEY = 'food4u.personalTaste.v1';

export function getDefaultPersonalTasteState(): PersonalTasteState {
  return {
    diets: [],
    allergens: [],
    customAllergies: [],
    avoidIngredients: [],
    cookingPreferences: [],
    spiceLevel: 'Medium',
  };
}

export function loadPersonalTasteState(): PersonalTasteState {
  const defaultState = getDefaultPersonalTasteState();
  const savedRaw = localStorage.getItem(PERSONAL_TASTE_STORAGE_KEY);

  if (!savedRaw) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(savedRaw) as Partial<PersonalTasteState>;

    return {
      diets: sanitizeStringList(parsed.diets),
      allergens: sanitizeStringList(parsed.allergens),
      customAllergies: sanitizeStringList(parsed.customAllergies),
      avoidIngredients: sanitizeStringList(parsed.avoidIngredients),
      cookingPreferences: sanitizeStringList(parsed.cookingPreferences),
      spiceLevel: normalizeSpiceLevel(parsed.spiceLevel),
    };
  } catch {
    localStorage.removeItem(PERSONAL_TASTE_STORAGE_KEY);
    return defaultState;
  }
}

export function savePersonalTasteState(state: PersonalTasteState): void {
  const normalized: PersonalTasteState = {
    diets: sanitizeStringList(state.diets),
    allergens: sanitizeStringList(state.allergens),
    customAllergies: sanitizeStringList(state.customAllergies),
    avoidIngredients: sanitizeStringList(state.avoidIngredients),
    cookingPreferences: sanitizeStringList(state.cookingPreferences),
    spiceLevel: normalizeSpiceLevel(state.spiceLevel),
  };

  localStorage.setItem(PERSONAL_TASTE_STORAGE_KEY, JSON.stringify(normalized));
}

export function getAllergyKeywords(state: PersonalTasteState): string[] {
  return sanitizeStringList([...state.allergens, ...state.customAllergies]);
}

export function sanitizeStringList(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  const unique = new Set<string>();

  values.forEach((value) => {
    if (typeof value !== 'string') {
      return;
    }

    const cleaned = normalizeKeyword(value);

    if (cleaned) {
      unique.add(cleaned);
    }
  });

  return Array.from(unique);
}

export function normalizeKeyword(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function findMatchedAllergyKeyword(mealText: string, keywords: string[]): string | null {
  const normalizedMealText = mealText.toLowerCase();

  for (const keyword of keywords) {
    const candidate = keyword.toLowerCase();
    // Also match the singular form, so "Onions" catches "spring onion" and "Peanuts" catches "peanut sauce".
    const singular = candidate.length > 3 && candidate.endsWith('s') ? candidate.slice(0, -1) : candidate;

    if (candidate && (normalizedMealText.includes(candidate) || normalizedMealText.includes(singular))) {
      return keyword;
    }
  }

  return null;
}

/** The parts of a meal that personalization looks at. */
export type TasteAwareMeal = {
  name: string;
  description: string;
  tags?: string[];
  allergens?: string[];
};

export type MealTasteMatch = {
  /** Allergy keyword this meal triggers, if any. */
  allergy: string | null;
  /** Avoided ingredient this meal contains, if any. */
  avoid: string | null;
  /** True when the user picked diets and the meal fits every one of them. */
  fitsDiets: boolean;
  spicy: boolean;
};

export function hasPersonalTaste(state: PersonalTasteState): boolean {
  return (
    state.diets.length > 0
    || getAllergyKeywords(state).length > 0
    || state.avoidIngredients.length > 0
    || state.cookingPreferences.length > 0
    || state.spiceLevel !== 'Medium'
  );
}

/** Vegetarian meals also suit pescatarian, no-pork and halal-friendly diets; pescatarian meals suit no-pork and halal-friendly. */
export function expandMealDiets(tags: string[] = []): Set<string> {
  const diets = new Set(tags);

  if (diets.has('Vegetarian')) {
    ['Pescatarian', 'No pork', 'Halal-friendly'].forEach((diet) => diets.add(diet));
  }

  if (diets.has('Pescatarian')) {
    ['No pork', 'Halal-friendly'].forEach((diet) => diets.add(diet));
  }

  return diets;
}

export function matchMealToTaste(meal: TasteAwareMeal, state: PersonalTasteState): MealTasteMatch {
  const mealText = `${meal.name} ${meal.description}`;
  const allergyKeywords = getAllergyKeywords(state);
  const listedAllergen = allergyKeywords.find((keyword) =>
    (meal.allergens ?? []).some((allergen) => allergen.toLowerCase() === keyword.toLowerCase()),
  );
  const diets = expandMealDiets(meal.tags);

  return {
    allergy: listedAllergen ?? findMatchedAllergyKeyword(mealText, allergyKeywords),
    avoid: findMatchedAllergyKeyword(mealText, state.avoidIngredients),
    fitsDiets: state.diets.length > 0 && state.diets.every((diet) => diets.has(diet)),
    spicy: diets.has('Spicy'),
  };
}

/**
 * Ranks a meal for "Picked for you". Returns null when the meal should never be suggested
 * (allergy, avoided ingredient, wrong diet, or too spicy for a mild eater).
 */
export function scoreMealForTaste(meal: TasteAwareMeal, state: PersonalTasteState): number | null {
  const match = matchMealToTaste(meal, state);

  if (match.allergy || match.avoid) {
    return null;
  }

  if (state.diets.length && !match.fitsDiets) {
    return null;
  }

  if (state.spiceLevel === 'Mild' && match.spicy) {
    return null;
  }

  let score = match.fitsDiets ? 3 : 0;

  if (state.spiceLevel === 'Spicy' && match.spicy) {
    score += 2;
  }

  return score;
}

/** Short reason shown under a suggested meal, e.g. "Vegetarian · Halal-friendly". */
export function describeTasteReason(meal: TasteAwareMeal, state: PersonalTasteState): string {
  const match = matchMealToTaste(meal, state);
  const reasons: string[] = [];

  if (match.fitsDiets) {
    reasons.push(state.diets.join(' · '));
  }

  if (state.spiceLevel === 'Spicy' && match.spicy) {
    reasons.push('Spicy');
  }

  if (!reasons.length && getAllergyKeywords(state).length) {
    reasons.push(`Free of ${getAllergyKeywords(state).slice(0, 2).join(' & ').toLowerCase()}`);
  }

  return reasons.join(' · ') || 'Matches your taste';
}

function normalizeSpiceLevel(level: unknown): SpiceLevel {
  return level === 'Mild' || level === 'Spicy' || level === 'Medium' ? level : 'Medium';
}
