import { describe, it, expect } from 'vitest';
import { suggestLayouts } from './suggestLayout';

describe('suggestLayouts', () => {
  it('Santos template (612x198) suggests count near 8', () => {
    const r = suggestLayouts({ templateW: 612, templateH: 198, preferredCount: 8 });
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].count).toBe(8);
    expect(r[0].scale).toBeGreaterThan(0.4);
  });

  it('respects preferredCount=4', () => {
    const r = suggestLayouts({ templateW: 612, templateH: 198, preferredCount: 4 });
    expect(r[0].count).toBe(4);
  });

  it('returns up to 6 unique suggestions', () => {
    const r = suggestLayouts({ templateW: 400, templateH: 200 });
    expect(r.length).toBeLessThanOrEqual(6);
    const keys = new Set(r.map(s => `${s.count}-${s.rows}-${s.cols}-${s.a4Orientation}-${s.rifaOrientation}`));
    expect(keys.size).toBe(r.length);
  });
});
