import vars from "../theme/vars";

export const DEFAULT_VISIBLE_NUTRIENTS = ["Energy", "Sucrose", "Fructose", "Lactose"];
export const PAGE_SIZE = 200;
export const EXPANDER_COLUMN_WIDTH = 44;
export const NUTRIENT_COLOR_MAP: Record<string, string> = {
  Energy: vars.colors.base.red,
  Sucrose: vars.colors.base.orange,
  Fructose: vars.colors.base.blue,
  Lactose: vars.colors.base.green,
};
export const DESCRIPTION_CHIP_COLOR = vars.colors.base.gray;
