import { useStore } from '../state/store';
import { summarize } from '../pdf/numbering';
import { useT } from '../i18n';

export function NumberingPanel() {
  const t = useT();
  const total = useStore(s => s.total);
  const startNumber = useStore(s => s.startNumber);
  const pagesPerSet = useStore(s => s.pagesPerSet);
  const padding = useStore(s => s.padding);
  const rows = useStore(s => s.rows);
  const cols = useStore(s => s.cols);
  const headerFormat = useStore(s => s.headerFormat);
  const headerSize = useStore(s => s.headerSize);
  const patch = useStore(s => s.patch);

  const rifasPerPage = rows * cols;
  const rifasPerSet = rifasPerPage * pagesPerSet;
  const { numSets, totalPages, emptyCells: empty } = summarize({
    total, startNumber, pagesPerSet, rifasPerPage,
  });

  const summaryFn = t('numberingSummary') as (a: number, b: number, c: number, d: number, e: number) => string;

  return (
    <fieldset>
      <legend>{t('numbering') as string}</legend>
      <div className="row" style={{ marginBottom: 6 }}>
        <label>{t('totalRifas') as string}
          <input type="number" min={1} max={100000} value={total}
            onChange={e => patch({ total: Math.max(1, parseInt(e.target.value) || 1) })} />
        </label>
        <label>{t('startNumber') as string}
          <input type="number" value={startNumber}
            onChange={e => patch({ startNumber: parseInt(e.target.value) || 1 })} />
        </label>
      </div>
      <div className="row" style={{ marginBottom: 6 }}>
        <label>{t('pagesPerSet') as string}
          <span className="help-icon" title={t('pagesPerSetHelp') as string}>?</span>
          <input type="number" min={1} max={50} value={pagesPerSet}
            onChange={e => patch({ pagesPerSet: Math.max(1, parseInt(e.target.value) || 1) })} />
        </label>
        <label>{t('padding') as string}
          <input type="number" min={1} max={8} value={padding}
            onChange={e => patch({ padding: Math.max(1, parseInt(e.target.value) || 1) })} />
        </label>
      </div>
      <div className="muted" style={{ marginBottom: 8 }}>
        {summaryFn(rifasPerPage, rifasPerSet, numSets, totalPages, empty)}
      </div>

      <label style={{ display: 'block', marginBottom: 6 }}>{t('header') as string}
        <input type="text" style={{ width: '100%' }} value={headerFormat}
          onChange={e => patch({ headerFormat: e.target.value })} />
      </label>
      <div className="muted" style={{ marginBottom: 6 }}>
        {t('variables') as string} {'{setIndex} {first} {last} {page} {pageInSet}'}
      </div>
      <label>{t('headerSize') as string}
        <input type="number" value={headerSize}
          onChange={e => patch({ headerSize: parseFloat(e.target.value) || 10 })} />
      </label>
    </fieldset>
  );
}
