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
  pageNumber: number;
  rifaNumbers: (number | null)[];
};

export function computeRifaNumber(
  cfg: NumberingConfig,
  setIdx: number,
  pageInSet: number,
  cellIdx: number,
): number | null {
  const n =
    cfg.startNumber +
    setIdx * cfg.pagesPerSet * cfg.rifasPerPage +
    cellIdx * cfg.pagesPerSet +
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
    for (let pageInSet = 1; pageInSet <= cfg.pagesPerSet; pageInSet++) {
      const rifaNumbers: (number | null)[] = [];
      let allNull = true;
      for (let cellIdx = 0; cellIdx < cfg.rifasPerPage; cellIdx++) {
        const n = computeRifaNumber(cfg, setIdx, pageInSet, cellIdx);
        if (n !== null) allNull = false;
        rifaNumbers.push(n);
      }
      if (allNull) continue;
      pages.push({ setIdx, setFirst, setLast, pageInSet, pageNumber, rifaNumbers });
      pageNumber++;
    }
  }
  return pages;
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
