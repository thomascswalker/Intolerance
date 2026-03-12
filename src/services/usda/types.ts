// https://fdc.nal.usda.gov/data-documentation
// https://app.swaggerhub.com/apis/fdcnal/food-data_central_api/1.0.1

export type DataType =
    | "Branded"
    | "Foundation"
    | "Survey (FNDDS)"
    | "SR Legacy";

export type Unit = "G" | "MG" | "UG" | "KCAL" | "IU" | "kJ";

export interface Nutrient {
    amount: number;
    name: string;
    number: string;
    unitName: Unit;
}

export interface Food {
    dataType: DataType;
    description: string;
    fdcId: number;
    foodNutrients: Nutrient[];
    publicationDate: string;
}
