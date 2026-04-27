import { OVOID_HYDRAULIC_TABLE, THORMANN_FRANKE_TABLE } from './constants';

export interface ManningParams {
  /** Manning roughness coefficient, e.g. 0.013-0.015 */
  n: number;
  /** Hydraulic slope in m/m */
  j: number;
  /** Internal diameter in m */
  d: number;
}

export interface FullSectionResult {
  qFull: number;
  vFull: number;
  areaFull: number;
  radiusHydraulicFull: number;
}

export interface InterpolationResult {
  yRatio: number;
  vRatio: number;
  qRatio: number;
  isOutsideTable: boolean;
  message?: string;
}

const EPS = 1e-12;

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive finite number. Received: ${value}`);
  }
}

export function calculateCircularManning({ n, j, d }: ManningParams): FullSectionResult {
  assertPositive(n, 'Manning n');
  assertPositive(j, 'Slope j');
  assertPositive(d, 'Diameter d');

  const areaFull = (Math.PI * d ** 2) / 4;
  const radiusHydraulicFull = d / 4;
  const vFull = (1 / n) * radiusHydraulicFull ** (2 / 3) * Math.sqrt(j);
  const qFull = vFull * areaFull;

  return { qFull, vFull, areaFull, radiusHydraulicFull };
}

function interpolateTableByQ(table: readonly (readonly number[])[], qRatio: number): InterpolationResult {
  if (!Number.isFinite(qRatio) || qRatio < 0) {
    return { yRatio: 0, vRatio: 0, qRatio: 0, isOutsideTable: true, message: 'Invalid Q/Qll ratio.' };
  }

  // Hydraulic tables are not strictly monotonic near full flow. Use the first ascending branch
  // for design flows because sewer design normally limits filling before the descending branch.
  let previousQ = table[0][2];
  for (let i = 0; i < table.length - 1; i += 1) {
    const [y1, v1, q1] = table[i];
    const [y2, v2, q2] = table[i + 1];

    if (q2 + EPS < previousQ) break;
    previousQ = q2;

    if (qRatio >= q1 - EPS && qRatio <= q2 + EPS) {
      const factor = Math.abs(q2 - q1) < EPS ? 0 : (qRatio - q1) / (q2 - q1);
      return {
        yRatio: y1 + factor * (y2 - y1),
        vRatio: v1 + factor * (v2 - v1),
        qRatio,
        isOutsideTable: false,
      };
    }
  }

  const maxQ = Math.max(...table.map((row) => row[2]));
  if (qRatio > maxQ) {
    return {
      yRatio: 1,
      vRatio: 1,
      qRatio,
      isOutsideTable: true,
      message: 'The requested flow exceeds the maximum tabulated capacity. Increase section, slope, or reduce design flow.',
    };
  }

  return { yRatio: 0, vRatio: 0, qRatio, isOutsideTable: true, message: 'The requested flow is below the tabulated range.' };
}

function interpolateTableByY(table: readonly (readonly number[])[], yRatio: number): InterpolationResult {
  if (!Number.isFinite(yRatio) || yRatio < 0 || yRatio > 1) {
    return { yRatio, vRatio: 0, qRatio: 0, isOutsideTable: true, message: 'y/D or y/H must be between 0 and 1.' };
  }

  for (let i = 0; i < table.length - 1; i += 1) {
    const [y1, v1, q1] = table[i];
    const [y2, v2, q2] = table[i + 1];
    if (yRatio >= y1 - EPS && yRatio <= y2 + EPS) {
      const factor = Math.abs(y2 - y1) < EPS ? 0 : (yRatio - y1) / (y2 - y1);
      return {
        yRatio,
        vRatio: v1 + factor * (v2 - v1),
        qRatio: q1 + factor * (q2 - q1),
        isOutsideTable: false,
      };
    }
  }

  return { yRatio, vRatio: 1, qRatio: 1, isOutsideTable: true };
}

export function interpolateThormannFrankeByQ(qRatio: number) {
  const res = interpolateTableByQ(THORMANN_FRANKE_TABLE, qRatio);
  return { yOverD: res.yRatio, vOverVllu: res.vRatio, ...res };
}

export function interpolateOvoidByQ(qRatio: number) {
  const res = interpolateTableByQ(OVOID_HYDRAULIC_TABLE, qRatio);
  return { yOverH: res.yRatio, vOverVllu: res.vRatio, ...res };
}

export function interpolateThormannFrankeByY(yRatio: number) {
  const res = interpolateTableByY(THORMANN_FRANKE_TABLE, yRatio);
  return { vOverVllu: res.vRatio, qOverQllu: res.qRatio, ...res };
}

export function interpolateOvoidByY(yRatio: number) {
  const res = interpolateTableByY(OVOID_HYDRAULIC_TABLE, yRatio);
  return { vOverVllu: res.vRatio, qOverQllu: res.qRatio, ...res };
}

/** Rational method: Q = C * I * A. I in L/s/ha, A in ha, returns L/s. */
export function rationalFormula(C: number, I_lps_ha: number, A_ha: number): number {
  if (![C, I_lps_ha, A_ha].every(Number.isFinite)) return 0;
  return C * I_lps_ha * A_ha;
}

/** Rational method: I in mm/h, A in ha, returns L/s. */
export function rationalFormulaFromMmHour(C: number, I_mm_h: number, A_ha: number): number {
  if (![C, I_mm_h, A_ha].every(Number.isFinite)) return 0;
  return 2.77778 * C * I_mm_h * A_ha;
}

export function calculateOvoidFull(n: number, j: number, H: number): FullSectionResult {
  assertPositive(n, 'Manning n');
  assertPositive(j, 'Slope j');
  assertPositive(H, 'Ovoid height H');

  const radiusHydraulicFull = 0.193 * H;
  const areaFull = 0.51 * H ** 2;
  const vFull = (1 / n) * radiusHydraulicFull ** (2 / 3) * Math.sqrt(j);
  const qFull = vFull * areaFull;

  return { qFull, vFull, areaFull, radiusHydraulicFull };
}
