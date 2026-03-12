import { Food, Nutrient } from "./types";

export const visibleNutrients = (nutrients: Nutrient[], selectedNutrients: string[]) =>
  nutrients
    .filter(
      (nutrient) =>
        selectedNutrients.includes(nutrient.name) && nutrient.amount > 0,
    )
    .sort((n1, n2) => n1.name.localeCompare(n2.name));

export const hasVisibleNutrient = (food: Food, selectedNutrients: string[]) =>
  food.foodNutrients.some(
    (nutrient) =>
      selectedNutrients.includes(nutrient.name) && nutrient.amount > 0,
  );