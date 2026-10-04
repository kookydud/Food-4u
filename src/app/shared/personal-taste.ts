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

    if (candidate && normalizedMealText.includes(candidate)) {
      return keyword;
    }
  }

  return null;
}

function normalizeSpiceLevel(level: unknown): SpiceLevel {
  return level === 'Mild' || level === 'Spicy' || level === 'Medium' ? level : 'Medium';
}
