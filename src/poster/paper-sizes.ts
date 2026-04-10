export interface PaperSize {
  name: string
  /** Width in meters (portrait orientation) */
  width: number
  /** Height in meters (portrait orientation) */
  height: number
}

export type Orientation = 'portrait' | 'landscape'

/** JIS / ISO paper sizes in meters */
export const PAPER_SIZES: Record<string, PaperSize> = {
  // A series (ISO 216)
  A0: { name: 'A0', width: 0.841, height: 1.189 },
  A1: { name: 'A1', width: 0.594, height: 0.841 },
  A2: { name: 'A2', width: 0.420, height: 0.594 },
  A3: { name: 'A3', width: 0.297, height: 0.420 },
  A4: { name: 'A4', width: 0.210, height: 0.297 },
  A5: { name: 'A5', width: 0.148, height: 0.210 },

  // B series (JIS B)
  B0: { name: 'B0', width: 1.030, height: 1.456 },
  B1: { name: 'B1', width: 0.728, height: 1.030 },
  B2: { name: 'B2', width: 0.515, height: 0.728 },
  B3: { name: 'B3', width: 0.364, height: 0.515 },
  B4: { name: 'B4', width: 0.257, height: 0.364 },
  B5: { name: 'B5', width: 0.182, height: 0.257 },
}

/** Get paper dimensions in meters, respecting orientation */
export function getPaperDimensions(
  sizeKey: string,
  orientation: Orientation,
): { width: number; height: number } {
  const size = PAPER_SIZES[sizeKey]
  if (!size) {
    return { width: 0.210, height: 0.297 } // default A4
  }

  if (orientation === 'landscape') {
    return { width: size.height, height: size.width }
  }
  return { width: size.width, height: size.height }
}

/** Convert mm to meters */
export function mmToMeters(mm: number): number {
  return mm / 1000
}

