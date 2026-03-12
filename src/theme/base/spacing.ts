export type Padding =
  | "none"
  | "x-small"
  | "small"
  | "medium"
  | "large"
  | "x-large";

export const basePadding = {
  none: 0,
  "x-small": 4,
  small: 8,
  medium: 16,
  large: 24,
  "x-large": 32,
} as const;

export type Gap = "none" | "small" | "medium" | "large";

export const baseGap = {
  none: 0,
  small: 8,
  medium: 16,
  large: 32,
} as const;
