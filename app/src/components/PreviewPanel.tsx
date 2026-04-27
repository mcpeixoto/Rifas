import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { useStore } from '../state/store';
import { composeFirstPagePreview, ComposeConfig } from '../pdf/embedAndCompose';
import { useT, useLang } from '../i18n';

const PREVIEW_WIDTH = 700;

function buildCfg(s: ReturnType<typeof useStore.getState>): ComposeConfig | null {
  if (!s.templateBytes) return null;
  return {
    templateBytes: s.templateBytes,
    templatePageIndex: s.templatePageIndex,
    slots: s.slots,
    rows: s.rows,
    cols: s.cols,
    a4Orientation: s.a4Orientation,
    rifaOrientation: s.rifaOrientation,
    marginsMM: s.marginsMM,
    gapMM: s.gapMM,
    pagesPerSet: s.pagesPerSet,
    total: s.total,
    startNumber: s.startNumber,
    padding: s.padding,
    headerFormat: s.headerFormat,
    headerSize: s.headerSize,
    fontFamily: s.fontFamily,
    drawCutLines: s.drawCutLines,
    fillOrder: s.fillOrder,
  };
}

export function PreviewPanel() {
  const t = useT();
  const lang = useLang(s => s.lang);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState('');

  // subscribe to all relevant state — re-render on any change
  const state = useStore();

  useEffect(() => {
    const cfg = buildCfg(state);
    if (!cfg || cfg.slots.length === 0) {
      setInfo(t('previewIdle') as string);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      setBusy(true);
      setError(null);
      try {
        const bytes = await composeFirstPagePreview(cfg);
        if (cancelled) return;
        const copy = bytes.slice(0);
        const doc = await pdfjs.getDocument({ data: copy }).promise;
        if (cancelled) return;
        const page = await doc.getPage(1);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = PREVIEW_WIDTH / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        const rifasPerPage = cfg.rows * cfg.cols;
        const rifasPerSet = rifasPerPage * cfg.pagesPerSet;
        const totalPages = Math.ceil(cfg.total / rifasPerSet) * cfg.pagesPerSet;
        const orient = lang === 'pt'
          ? (cfg.a4Orientation === 'portrait' ? 'retrato' : 'paisagem')
          : cfg.a4Orientation;
        const summary = t('previewSummary') as (a: string, b: number, c: number, d: number, e: number) => string;
        setInfo(summary(orient, cfg.rows, cfg.cols, rifasPerPage, totalPages));
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Erro');
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 350);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [
    state.templateBytes, state.slots, state.rows, state.cols,
    state.a4Orientation, state.rifaOrientation, state.marginsMM, state.gapMM,
    state.pagesPerSet, state.total, state.startNumber, state.padding,
    state.headerFormat, state.headerSize, state.fontFamily, state.drawCutLines,
    state.fillOrder,
  ]);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <div className="muted">{info}</div>
        {busy && <div className="muted">{t('rendering') as string}</div>}
        {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
      </div>
      <div className="canvas-wrap" style={{ display: 'inline-block' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
