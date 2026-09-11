export const ServiceMode = {
  ONLINE: "ONLINE",

  OFFLINE: "OFFLINE",

  BOTH: "BOTH",
} as const;

export type ServiceModeValue =
  (typeof ServiceMode)[keyof typeof ServiceMode];