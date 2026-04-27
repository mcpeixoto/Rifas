import { A4_PT, mmToPt } from '../utils/a4';

export type LayoutSuggestion = {
  rows: number;
  cols: number;
  count: number;
  scale: number;
  fill: number;
  a4Orientation: 'portrait' | 'landscape';
  rifaOrientation: 0 | 90;
  label: string;
};

export type SuggestInput = {
  templateW: number;
  templateH: number;
  preferredCount?: number;
  marginMM?: number;
  gapMM?: number;
  headerHeightMM?: number;
};

export function suggestLayouts(input: SuggestInput): LayoutSuggestion[] {
  const preferredCount = input.preferredCount ?? 8;
  const margin = mmToPt(input.marginMM ?? 8);
  const gap = mmToPt(input.gapMM ?? 2);
  const headerH = mmToPt(input.headerHeightMM ?? 6);

  const candidates: LayoutSuggestion[] = [];

  for (const a4Orient of ['portrait', 'landscape'] as const) {
    const A4w = a4Orient === 'portrait' ? A4_PT.w : A4_PT.h;
    const A4h = a4Orient === 'portrait' ? A4_PT.h : A4_PT.w;

    for (const rifaOrient of [0, 90] as const) {
      const rW = rifaOrient === 0 ? input.templateW : input.templateH;
      const rH = rifaOrient === 0 ? input.templateH : input.templateW;

      for (let cols = 1; cols <= 6; cols++) {
        for (let rows = 1; rows <= 16; rows++) {
          const count = rows * cols;
          if (count > 24) continue;
          const availW = A4w - 2 * margin - (cols - 1) * gap;
          const availH = A4h - 2 * margin - headerH - (rows - 1) * gap;
          if (availW <= 0 || availH <= 0) continue;
          const scaleX = availW / (cols * rW);
          const scaleY = availH / (rows * rH);
          const scale = Math.min(scaleX, scaleY);
          if (scale <= 0.05) continue;

          const usedW = cols * rW * scale + (cols - 1) * gap;
          const usedH = rows * rH * scale + (rows - 1) * gap;
          const fill = (usedW * usedH) / (A4w * A4h);

          candidates.push({
            rows,
            cols,
            count,
            scale,
            fill,
            a4Orientation: a4Orient,
            rifaOrientation: rifaOrient,
            label: `${count} rifas/página · A4 ${a4Orient === 'portrait' ? 'retrato' : 'paisagem'} · ${rows}×${cols} · escala ${scale.toFixed(2)} · rifa ${rifaOrient}°`,
          });
        }
      }
    }
  }

  candidates.sort((a, b) => {
    const da = Math.abs(a.count - preferredCount);
    const db = Math.abs(b.count - preferredCount);
    if (da !== db) return da - db;
    const sa = a.scale < 0.4 ? 1 : 0;
    const sb = b.scale < 0.4 ? 1 : 0;
    if (sa !== sb) return sa - sb;
    return b.fill - a.fill;
  });

  const seen = new Set<string>();
  const unique: LayoutSuggestion[] = [];
  for (const c of candidates) {
    const key = `${c.count}-${c.rows}-${c.cols}-${c.a4Orientation}-${c.rifaOrientation}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(c);
    if (unique.length >= 6) break;
  }
  return unique;
}
