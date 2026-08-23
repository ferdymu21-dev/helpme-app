export const AD_POSITIONS = {
  HOME_DESKTOP: "home_desktop",
  HOME_MOBILE: "home_mobile",
} as const;

export type AdPosition =
  (typeof AD_POSITIONS)[keyof typeof AD_POSITIONS];