export type NumberingConfig = {
  total: number;
  startNumber: number;
  pagesPerSet: number;
  rifasPerPage: number;
};

export type PageDescriptor = {
  setIdx: number;
  setFirst: number;
  setLast: number;
  pageInSet: number;
  /** How many sheets this set actually has (< pagesPerSet for a partial last set). */
  pagesInSet: number;
  pageNumber: number;
  rifaNumbers: (number | null)[];
};

/**
 * Sheets in a given set. Full sets use pagesPerSet; the final partial set only
 * gets as many sheets as its leftover rifas need, so it doesn't trail dozens of
 * blank cells across full-size pages.
 */
export function pagesInSet(cfg: NumberingConfig, setIdx: number): number {
  const rifasPerSet = cfg.rifasPerPage * cfg.pagesPerSet;
  const remaining = cfg.total - setIdx * rifasPerSet;
  if (remaining >= rifasPerSet) return cfg.pagesPerSet;
  return Math.min(cfg.pagesPerSet, Math.max(1, Math.ceil(remaining / cfg.rifasPerPage)));
}

export function computeRifaNumber(
  cfg: NumberingConfig,
  setIdx: number,
  pageInSet: number,
  cellIdx: number,
  stride: number = pagesInSet(cfg, setIdx),
): number | null {
  // stride == sheets in this set, so stacking the set and cutting a column
  // yields consecutive numbers.
  const n =
    cfg.startNumber +
    setIdx * cfg.pagesPerSet * cfg.rifasPerPage +
    cellIdx * stride +
    (pageInSet - 1);
  if (n >= cfg.startNumber + cfg.total) return null;
  return n;
}

export function buildPages(cfg: NumberingConfig): PageDescriptor[] {
  if (cfg.total <= 0 || cfg.rifasPerPage <= 0 || cfg.pagesPerSet <= 0) return [];
  const rifasPerSet = cfg.rifasPerPage * cfg.pagesPerSet;
  const numSets = Math.ceil(cfg.total / rifasPerSet);
  const pages: PageDescriptor[] = [];
  let pageNumber = 1;
  for (let setIdx = 0; setIdx < numSets; setIdx++) {
    const setFirst = cfg.startNumber + setIdx * rifasPerSet;
    const setLast = Math.min(cfg.startNumber + cfg.total - 1, setFirst + rifasPerSet - 1);
    const sheets = pagesInSet(cfg, setIdx);
    for (let pageInSet = 1; pageInSet <= sheets; pageInSet++) {
      const rifaNumbers: (number | null)[] = [];
      let allNull = true;
      for (let cellIdx = 0; cellIdx < cfg.rifasPerPage; cellIdx++) {
        const n = computeRifaNumber(cfg, setIdx, pageInSet, cellIdx, sheets);
        if (n !== null) allNull = false;
        rifaNumbers.push(n);
      }
      if (allNull) continue;
      pages.push({ setIdx, setFirst, setLast, pageInSet, pagesInSet: sheets, pageNumber, rifaNumbers });
      pageNumber++;
    }
  }
  return pages;
}

export type NumberingSummary = {
  numSets: number;
  totalPages: number;
  emptyCells: number;
};

export function summarize(cfg: NumberingConfig): NumberingSummary {
  const pages = buildPages(cfg);
  const cells = pages.length * cfg.rifasPerPage;
  const numSets = pages.length ? pages[pages.length - 1].setIdx + 1 : 0;
  return { numSets, totalPages: pages.length, emptyCells: Math.max(0, cells - cfg.total) };
}

export function padNumber(n: number, padding: number): string {
  const s = String(n);
  return s.length >= padding ? s : '0'.repeat(padding - s.length) + s;
}

export function formatHeader(template: string, page: PageDescriptor): string {
  return template
    .replace('{setIndex}', String(page.setIdx + 1))
    .replace('{first}', String(page.setFirst))
    .replace('{last}', String(page.setLast))
    .replace('{page}', String(page.pageNumber))
    .replace('{pageInSet}', String(page.pageInSet));
}
