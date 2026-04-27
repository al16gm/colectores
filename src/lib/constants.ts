export const DESIGN_LIMITS = {
  wastewaterMaxFilling: 0.75,
  stormwaterMaxFilling: 0.85,
  educationalMaxFilling: 0.8,
  wastewaterMinVelocityNoSand: 0.3,
  wastewaterMinVelocityWithSand: 0.6,
  combinedMinVelocity: 0.5,
  siphonMinVelocity: 1.0,
  wastewaterMaxVelocityDefault: 3.0,
  wastewaterMaxVelocityNoSand: 6.0,
  stormwaterMaxVelocity: 5.0,
} as const;

export const MANNING_ROUGHNESS = {
  pvcPePrfv: 0.010,
  concreteGood: 0.013,
  concreteNormal: 0.014,
  concreteRough: 0.015,
  masonry: 0.017,
} as const;

/** Thormann and Franke table for circular sections: [y/D, v/vll, Q/Qll, Rh/Rhll, A/All]. */
export const THORMANN_FRANKE_TABLE = [
  [0, 0, 0, 0, 0],
  [0.05, 0.42, 0.012, 0.16, 0.019],
  [0.1, 0.58, 0.038, 0.31, 0.052],
  [0.15, 0.69, 0.075, 0.45, 0.094],
  [0.2, 0.77, 0.121, 0.56, 0.142],
  [0.25, 0.84, 0.176, 0.66, 0.196],
  [0.3, 0.9, 0.238, 0.74, 0.252],
  [0.35, 0.95, 0.306, 0.82, 0.312],
  [0.4, 0.99, 0.38, 0.88, 0.373],
  [0.45, 1.03, 0.458, 0.94, 0.436],
  [0.5, 1.06, 0.54, 0.98, 0.5],
  [0.55, 1.09, 0.623, 1.03, 0.564],
  [0.6, 1.11, 0.707, 1.07, 0.626],
  [0.65, 1.13, 0.791, 1.1, 0.688],
  [0.7, 1.14, 0.871, 1.12, 0.748],
  [0.75, 1.15, 0.946, 1.13, 0.804],
  [0.8, 1.15, 1.011, 1.14, 0.858],
  [0.812, 1.15, 1.025, 1.14, 0.87],
  [0.85, 1.14, 1.061, 1.13, 0.906],
  [0.9, 1.12, 1.085, 1.11, 0.948],
  [0.938, 1.09, 1.09, 1.08, 0.975],
  [0.95, 1.07, 1.085, 1.07, 0.981],
  [1, 1, 1, 1, 1],
] as const;

/** Diameters in m. For sewer design, interpret as internal diameter unless product standard says otherwise. */
export const COMMERCIAL_DIAMETERS = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.5, 1.8, 2] as const;

/** Ovoid commercial sections in cm, with H = 1.5 B. */
export const OVOID_COMMERCIAL_SECTIONS = [
  { width: 60, height: 90 },
  { width: 70, height: 105 },
  { width: 80, height: 120 },
  { width: 90, height: 135 },
  { width: 100, height: 150 },
  { width: 120, height: 180 },
  { width: 140, height: 210 },
] as const;

/** Ovoid table: [y/H, v/vll, Q/Qll]. */
export const OVOID_HYDRAULIC_TABLE = [
  [0, 0, 0],
  [0.05, 0.28, 0.005],
  [0.1, 0.44, 0.021],
  [0.15, 0.58, 0.052],
  [0.2, 0.69, 0.091],
  [0.25, 0.77, 0.145],
  [0.3, 0.84, 0.21],
  [0.35, 0.9, 0.285],
  [0.4, 0.95, 0.37],
  [0.45, 0.99, 0.465],
  [0.5, 1.03, 0.56],
  [0.55, 1.06, 0.66],
  [0.6, 1.09, 0.76],
  [0.65, 1.12, 0.86],
  [0.7, 1.14, 0.95],
  [0.75, 1.155, 1.04],
  [0.8, 1.16, 1.11],
  [0.85, 1.155, 1.16],
  [0.9, 1.13, 1.185],
  [0.93, 1.1, 1.19],
  [0.95, 1.08, 1.17],
  [0.98, 1.04, 1.1],
  [1, 1, 1],
] as const;
