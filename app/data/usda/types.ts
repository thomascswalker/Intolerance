export type Unit = "G" | "MG" | "UG" | "KCAL" | "IU";

export interface Nutrient {
    amount: number;
    name: string;
    number: string;
    unitName: Unit;
}

export interface Food {
    dataType: string;
    description: string;
    fdcId: number;
    foodNutrients: Nutrient[];
    publicationDate: string;
}