import baseColors from "./colors";

const baseVars = {
  colors: {
    base: { ...baseColors },
    surface: {
      primary: baseColors.white,
      secondary: baseColors.blue,
    },
    border: {
      primary: baseColors.gray4,
    },
    text: {
      primary: baseColors.black,
      secondary: baseColors.white,
      disabled: baseColors.gray,
      alert: baseColors.red,
    },
  },
} as const;

export default baseVars;
