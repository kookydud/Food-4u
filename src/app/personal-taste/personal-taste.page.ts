import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LocalDataService } from '../services/local-data.service';
import {
  getAllergyKeywords,
  loadPersonalTasteState,
  normalizeKeyword,
  PersonalTasteState,
  savePersonalTasteState,
} from '../shared/personal-taste';

type PreferenceOption = {
  label: string;
  selected: boolean;
};

@Component({
  selector: 'app-personal-taste',
  templateUrl: './personal-taste.page.html',
  styleUrls: ['./personal-taste.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class PersonalTastePage implements OnInit {
  dietOptions: PreferenceOption[] = [
    { label: 'No pork', selected: false },
    { label: 'Vegetarian', selected: false },
    { label: 'Low carb', selected: false },
    { label: 'Halal-friendly', selected: false },
    { label: 'Pescatarian', selected: false },
    { label: 'Keto-friendly', selected: false },
  ];

  allergenOptions: PreferenceOption[] = [
    { label: 'Peanuts', selected: false },
    { label: 'Seafood', selected: false },
    { label: 'Dairy', selected: false },
    { label: 'Egg', selected: false },
    { label: 'Soy', selected: false },
    { label: 'Gluten', selected: false },
    { label: 'Sesame', selected: false },
    { label: 'Shellfish', selected: false },
  ];

  avoidIngredientOptions: PreferenceOption[] = [
    { label: 'Onions', selected: false },
    { label: 'Garlic', selected: false },
    { label: 'Mushrooms', selected: false },
    { label: 'Cilantro', selected: false },
  ];

  cookingPreferenceOptions: PreferenceOption[] = [
    { label: 'Less salt', selected: false },
    { label: 'Less oil', selected: false },
    { label: 'Extra sauce on side', selected: false },
    { label: 'No MSG', selected: false },
  ];

  spiceLevel: 'Mild' | 'Medium' | 'Spicy' = 'Medium';
  customAllergyInput = '';
  customAllergies: string[] = [];
  saveMessage = '';

  constructor(
    private readonly router: Router,
    private readonly localDataService: LocalDataService,
  ) {}

  ngOnInit(): void {
    if (!this.localDataService.isSignedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const saved = loadPersonalTasteState();
    this.applySavedSelection(this.dietOptions, saved.diets);
    this.applySavedSelection(this.allergenOptions, saved.allergens);
    this.applySavedSelection(this.avoidIngredientOptions, saved.avoidIngredients);
    this.applySavedSelection(this.cookingPreferenceOptions, saved.cookingPreferences);
    this.customAllergies = saved.customAllergies;
    this.spiceLevel = saved.spiceLevel;
  }

  goBack(): void {
    this.router.navigateByUrl('/account');
  }

  toggleOption(options: PreferenceOption[], label: string): void {
    options.forEach((option) => {
      if (option.label === label) {
        option.selected = !option.selected;
      }
    });

    this.saveMessage = '';
  }

  addCustomAllergy(): void {
    const normalized = normalizeKeyword(this.customAllergyInput);

    if (!normalized) {
      return;
    }

    if (!this.customAllergies.some((allergy) => allergy.toLowerCase() === normalized.toLowerCase())) {
      this.customAllergies = [...this.customAllergies, normalized];
    }

    this.customAllergyInput = '';
    this.saveMessage = '';
  }

  removeCustomAllergy(allergyToRemove: string): void {
    this.customAllergies = this.customAllergies.filter((allergy) => allergy !== allergyToRemove);
    this.saveMessage = '';
  }

  savePreferences(): void {
    const state: PersonalTasteState = {
      diets: this.dietOptions.filter((option) => option.selected).map((option) => option.label),
      allergens: this.allergenOptions.filter((option) => option.selected).map((option) => option.label),
      customAllergies: this.customAllergies,
      avoidIngredients: this.avoidIngredientOptions.filter((option) => option.selected).map((option) => option.label),
      cookingPreferences: this.cookingPreferenceOptions.filter((option) => option.selected).map((option) => option.label),
      spiceLevel: this.spiceLevel,
    };

    savePersonalTasteState(state);
    const allergyCount = getAllergyKeywords(state).length;
    this.saveMessage = allergyCount
      ? `Preferences saved. ${allergyCount} allergy warning keyword(s) active.`
      : 'Preferences saved.';
  }

  private applySavedSelection(options: PreferenceOption[], selectedLabels: string[]): void {
    options.forEach((option) => {
      option.selected = selectedLabels.includes(option.label);
    });
  }
}
