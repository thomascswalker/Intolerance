import { DataType, Food } from "./types";

const USDA_HOST = "https://api.nal.usda.gov/fdc";
const API_KEY = "xfcbdVgM1lt4MbZxLsHhb78UppWp9BXmGKrk3dfO";

export const fetchUsdaData = async (
  dataType: DataType,
  pageSize: number,
  pageNumber: number,
): Promise<Food[]> => {
  try {
    const url = new URL(`${USDA_HOST}/v1/foods/list`);
    url.search = new URLSearchParams({
      api_key: API_KEY,
      dataType,
      pageSize: pageSize.toString(),
      pageNumber: pageNumber.toString(),
    }).toString();

    const response = await fetch(url);
    const data = (await response.json()) as Food[];
    return data.filter((food) => food.foodNutrients.length > 0);
  } catch (error) {
    console.error("Error fetching USDA data:", error);
    return [];
  }
};
