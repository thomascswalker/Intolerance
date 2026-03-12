import baseColors from "./colors";
import { baseGap, basePadding } from "./spacing";

const baseVars = {
  colors: {
    base: { ...baseColors },
    surface: {
      primary: baseColors.white,
      secondary: baseColors.blue,
      neutral: baseColors.gray30,
    },
    border: {
      primary: baseColors.gray30,
    },
    text: {
      primary: baseColors.black,
      secondary: baseColors.white,
      disabled: baseColors.gray60,
      alert: baseColors.red,
    },
    padding: { ...basePadding },
    gap: { ...baseGap },
  },
} as const;

export default baseVars;
