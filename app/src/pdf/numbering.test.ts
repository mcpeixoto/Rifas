import { describe, it, expect } from 'vitest';
import { buildPages, computeRifaNumber, padNumber, summarize } from './numbering';

describe('numbering', () => {
  it('matches user example: 8/page, 10 pages/set, total 80', () => {
    const cfg = { total: 80, startNumber: 1, pagesPerSet: 10, rifasPerPage: 8 };
    const pages = buildPages(cfg);
    expect(pages).toHaveLength(10);

    expect(pages[0].rifaNumbers).toEqual([1, 11, 21, 31, 41, 51, 61, 71]);
    expect(pages[1].rifaNumbers).toEqual([2, 12, 22, 32, 42, 52, 62, 72]);
    expect(pages[9].rifaNumbers).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);

    expect(pages[0].setFirst).toBe(1);
    expect(pages[0].setLast).toBe(80);
  });

  it('continues into set 2 starting at 81', () => {
    const cfg = { total: 160, startNumber: 1, pagesPerSet: 10, rifasPerPage: 8 };
    const pages = buildPages(cfg);
    expect(pages).toHaveLength(20);
    expect(pages[10].rifaNumbers[0]).toBe(81);
    expect(pages[10].setFirst).toBe(81);
    expect(pages[10].setLast).toBe(160);
    expect(pages[19].rifaNumbers).toEqual([90, 100, 110, 120, 130, 140, 150, 160]);
  });

  it('handles total not multiple of set size with null cells', () => {
    const cfg = { total: 75, startNumber: 1, pagesPerSet: 10, rifasPerPage: 8 };
    const pages = buildPages(cfg);
    expect(pages).toHaveLength(10);
    // page 6 (index 5), cell 7 -> n = 1 + 7*10 + 5 = 76, which is >= start+total -> null
    expect(pages[5].rifaNumbers[7]).toBeNull();
    // page 5 (index 4), cell 7 -> n = 1 + 70 + 4 = 75 -> valid
    expect(pages[4].rifaNumbers[7]).toBe(75);
    // last page: 70, 80(null since 80>=76)... cell 0 = 10
    expect(pages[9].rifaNumbers[0]).toBe(10);
    expect(pages[9].rifaNumbers[7]).toBeNull(); // 80 > 75
  });

  it('shrinks the final partial set instead of leaving whole blank pages', () => {
    // 500 rifas, 8/page, 10 pages/set -> 6 full sets (480) + 20 leftover.
    // The leftover set needs only ceil(20/8) = 3 pages, not 10.
    const cfg = { total: 500, startNumber: 1500, pagesPerSet: 10, rifasPerPage: 8 };
    const pages = buildPages(cfg);
    expect(pages).toHaveLength(63);

    const lastSet = pages.filter(p => p.setIdx === 6);
    expect(lastSet).toHaveLength(3);
    expect(lastSet.every(p => p.pagesInSet === 3)).toBe(true);
    // stride within the leftover set is 3 (one per sheet), so columns fill up
    expect(lastSet[0].rifaNumbers).toEqual([1980, 1983, 1986, 1989, 1992, 1995, 1998, null]);
    expect(lastSet[1].rifaNumbers).toEqual([1981, 1984, 1987, 1990, 1993, 1996, 1999, null]);
    expect(lastSet[2].rifaNumbers).toEqual([1982, 1985, 1988, 1991, 1994, 1997, null, null]);

    // every number 1500..1999 appears exactly once
    const seen = pages.flatMap(p => p.rifaNumbers).filter((n): n is number => n !== null);
    expect(seen).toHaveLength(500);
    expect(new Set(seen).size).toBe(500);
    expect(Math.min(...seen)).toBe(1500);
    expect(Math.max(...seen)).toBe(1999);
  });

  it('full sets keep the configured stride and page count', () => {
    const cfg = { total: 500, startNumber: 1500, pagesPerSet: 10, rifasPerPage: 8 };
    const pages = buildPages(cfg);
    expect(pages[0].pagesInSet).toBe(10);
    expect(pages[0].rifaNumbers).toEqual([1500, 1510, 1520, 1530, 1540, 1550, 1560, 1570]);
    expect(pages[0].setLast).toBe(1579);
    expect(pages.filter(p => p.setIdx === 6)[0].setFirst).toBe(1980);
    expect(pages.filter(p => p.setIdx === 6)[0].setLast).toBe(1999);
  });

  it('summarize reports pages and empty cells actually produced', () => {
    const s = summarize({ total: 500, startNumber: 1500, pagesPerSet: 10, rifasPerPage: 8 });
    expect(s.numSets).toBe(7);
    expect(s.totalPages).toBe(63);
    expect(s.emptyCells).toBe(4);
  });

  it('respects startNumber offset', () => {
    const cfg = { total: 80, startNumber: 1001, pagesPerSet: 10, rifasPerPage: 8 };
    const pages = buildPages(cfg);
    expect(pages[0].rifaNumbers[0]).toBe(1001);
    expect(pages[0].rifaNumbers[1]).toBe(1011);
    expect(pages[9].rifaNumbers[7]).toBe(1080);
    expect(pages[0].setFirst).toBe(1001);
    expect(pages[0].setLast).toBe(1080);
  });

  it('handles 10000 rifas without crashing', () => {
    const cfg = { total: 10000, startNumber: 1, pagesPerSet: 10, rifasPerPage: 8 };
    const pages = buildPages(cfg);
    expect(pages).toHaveLength(1250);
    expect(pages[0].rifaNumbers[0]).toBe(1);
    expect(pages[1249].rifaNumbers[7]).toBe(10000);
  });

  it('computeRifaNumber returns null beyond total', () => {
    const cfg = { total: 5, startNumber: 1, pagesPerSet: 10, rifasPerPage: 8 };
    expect(computeRifaNumber(cfg, 0, 1, 0)).toBe(1);
    expect(computeRifaNumber(cfg, 0, 6, 0)).toBe(null); // 6 > 5
  });

  it('padNumber pads with zeros', () => {
    expect(padNumber(1, 4)).toBe('0001');
    expect(padNumber(42, 4)).toBe('0042');
    expect(padNumber(10000, 4)).toBe('10000');
    expect(padNumber(7, 2)).toBe('07');
  });
});
