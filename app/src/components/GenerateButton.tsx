import { useState } from 'react';
import { useStore } from '../state/store';
import { composePdf, composeFirstPagePreview, ComposeConfig } from '../pdf/embedAndCompose';
import { useT } from '../i18n';

function buildCfg(s: ReturnType<typeof useStore.getState>): ComposeConfig {
  return {
    templateBytes: s.templateBytes!,
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
    fillOrder: s.fillOrder,
    headerFormat: s.headerFormat,
    headerSize: s.headerSize,
    fontFamily: s.fontFamily,
    drawCutLines: s.drawCutLines,
  };
}

function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function GenerateButton() {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const hasTemplate = useStore(s => !!s.templateBytes);
  const hasSlots = useStore(s => s.slots.length > 0);
  const generatingFn = t('generating') as (a: number, b: number) => string;

  const generate = async () => {
    setError(null);
    setBusy(true);
    setProgress(0);
    try {
      const cfg = buildCfg(useStore.getState());
      const bytes = await composePdf(cfg, (done, total) => {
        setProgress(done);
        setProgressTotal(total);
      });
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      downloadPdf(bytes, `rifas-${ts}.pdf`);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao gerar PDF');
    } finally {
      setBusy(false);
    }
  };

  const generatePreview = async () => {
    setError(null);
    setBusy(true);
    try {
      const cfg = buildCfg(useStore.getState());
      const bytes = await composeFirstPagePreview(cfg);
      downloadPdf(bytes, 'rifas-preview-1pag.pdf');
    } catch (e: any) {
      setError(e?.message ?? 'Erro');
    } finally {
      setBusy(false);
    }
  };

  return (
    <fieldset>
      <legend>{t('generate') as string}</legend>
      <div className="row" style={{ marginBottom: 6 }}>
        <button className="btn secondary" onClick={generatePreview} disabled={busy || !hasTemplate || !hasSlots}>
          {t('previewOnePage') as string}
        </button>
        <button className="btn" onClick={generate} disabled={busy || !hasTemplate || !hasSlots}>
          {busy ? generatingFn(progress, progressTotal) : (t('generatePdf') as string)}
        </button>
      </div>
      {busy && progressTotal > 0 && (
        <div className="progress"><div style={{ width: `${(progress / progressTotal) * 100}%` }} /></div>
      )}
      {!hasTemplate && <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>{t('needTemplate') as string}</p>}
      {hasTemplate && !hasSlots && <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>{t('needSlot') as string}</p>}
      {error && <p style={{ color: 'var(--danger)', marginTop: 8, marginBottom: 0 }}>{error}</p>}
    </fieldset>
  );
}
