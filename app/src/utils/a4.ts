export const A4_PT = { w: 595.28, h: 841.89 };
export const MM_PER_PT = 25.4 / 72;
export const PT_PER_MM = 72 / 25.4;

export function mmToPt(mm: number): number { return mm * PT_PER_MM; }
export function ptToMm(pt: number): number { return pt * MM_PER_PT; }

export function a4Size(orientation: 'portrait' | 'landscape'): { w: number; h: number } {
  return orientation === 'portrait' ? { w: A4_PT.w, h: A4_PT.h } : { w: A4_PT.h, h: A4_PT.w };
}
