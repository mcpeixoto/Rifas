import { useMemo } from 'react';
import { useStore } from '../state/store';
import { suggestLayouts } from '../pdf/suggestLayout';
import { useT, useLang } from '../i18n';

export function LayoutPanel() {
  const t = useT();
  const lang = useLang(s => s.lang);
  const templateW = useStore(s => s.templateW);
  const templateH = useStore(s => s.templateH);
  const rows = useStore(s => s.rows);
  const cols = useStore(s => s.cols);
  const a4Orientation = useStore(s => s.a4Orientation);
  const rifaOrientation = useStore(s => s.rifaOrientation);
  const marginsMM = useStore(s => s.marginsMM);
  const gapMM = useStore(s => s.gapMM);
  const drawCutLines = useStore(s => s.drawCutLines);
  const fillOrder = useStore(s => s.fillOrder);
  const patch = useStore(s => s.patch);

  const suggestions = useMemo(() => {
    if (!templateW || !templateH) return [];
    return suggestLayouts({ templateW, templateH, preferredCount: 8 });
  }, [templateW, templateH]);

  const activeKey = `${rows}-${cols}-${a4Orientation}-${rifaOrientation}`;

  const formatSuggestion = (s: typeof suggestions[number]) => {
    const orient = lang === 'pt'
      ? (s.a4Orientation === 'portrait' ? 'retrato' : 'paisagem')
      : s.a4Orientation;
    const word = lang === 'pt' ? 'rifas/página' : 'tickets/page';
    const scaleW = lang === 'pt' ? 'escala' : 'scale';
    return `${s.count} ${word} · A4 ${orient} · ${s.rows}×${s.cols} · ${scaleW} ${s.scale.toFixed(2)} · ${s.rifaOrientation}°`;
  };

  return (
    <fieldset>
      <legend>{t('layout') as string}</legend>

      {suggestions.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div className="muted" style={{ marginBottom: 6 }}>{t('suggestionsHint') as string}</div>
          {suggestions.slice(0, 4).map((s, i) => {
            const key = `${s.rows}-${s.cols}-${s.a4Orientation}-${s.rifaOrientation}`;
            return (
              <div
                key={i}
                className={`suggestion-card ${key === activeKey ? 'active' : ''}`}
                onClick={() => patch({
                  rows: s.rows, cols: s.cols,
                  a4Orientation: s.a4Orientation,
                  rifaOrientation: s.rifaOrientation,
                })}
              >
                {formatSuggestion(s)}
              </div>
            );
          })}
        </div>
      )}

      <div className="row" style={{ marginBottom: 6 }}>
        <label>{t('rows') as string}
          <input type="number" min={1} max={20} value={rows}
            onChange={e => patch({ rows: Math.max(1, parseInt(e.target.value) || 1) })} />
        </label>
        <label>{t('cols') as string}
          <input type="number" min={1} max={10} value={cols}
            onChange={e => patch({ cols: Math.max(1, parseInt(e.target.value) || 1) })} />
        </label>
      </div>

      <div className="row" style={{ marginBottom: 6 }}>
        <label>{t('a4') as string}
          <select value={a4Orientation}
            onChange={e => patch({ a4Orientation: e.target.value as 'portrait' | 'landscape' })}>
            <option value="portrait">{t('portrait') as string}</option>
            <option value="landscape">{t('landscape') as string}</option>
          </select>
        </label>
        <label>{t('rifaOrient') as string}
          <select value={rifaOrientation}
            onChange={e => patch({ rifaOrientation: parseInt(e.target.value) as 0 | 90 })}>
            <option value={0}>0°</option>
            <option value={90}>90°</option>
          </select>
        </label>
      </div>

      <div className="row" style={{ marginBottom: 6 }}>
        <label style={{ width: '100%' }}>{t('fillOrder') as string}
          <select value={fillOrder} style={{ flex: 1 }}
            onChange={e => patch({ fillOrder: e.target.value as 'horizontal' | 'vertical' })}>
            <option value="horizontal">{t('fillHorizontal') as string}</option>
            <option value="vertical">{t('fillVertical') as string}</option>
          </select>
        </label>
      </div>

      <div className="muted" style={{ marginBottom: 4 }}>{t('margins') as string}</div>
      <div className="row" style={{ marginBottom: 6 }}>
        <label>{t('top') as string}<input type="number" value={marginsMM.top}
          onChange={e => patch({ marginsMM: { ...marginsMM, top: parseFloat(e.target.value) || 0 } })} /></label>
        <label>{t('right') as string}<input type="number" value={marginsMM.right}
          onChange={e => patch({ marginsMM: { ...marginsMM, right: parseFloat(e.target.value) || 0 } })} /></label>
      </div>
      <div className="row" style={{ marginBottom: 6 }}>
        <label>{t('bottom') as string}<input type="number" value={marginsMM.bottom}
          onChange={e => patch({ marginsMM: { ...marginsMM, bottom: parseFloat(e.target.value) || 0 } })} /></label>
        <label>{t('left') as string}<input type="number" value={marginsMM.left}
          onChange={e => patch({ marginsMM: { ...marginsMM, left: parseFloat(e.target.value) || 0 } })} /></label>
      </div>

      <div className="row" style={{ marginBottom: 8 }}>
        <label>{t('gapX') as string}<input type="number" value={gapMM.x}
          onChange={e => patch({ gapMM: { ...gapMM, x: parseFloat(e.target.value) || 0 } })} /></label>
        <label>{t('gapY') as string}<input type="number" value={gapMM.y}
          onChange={e => patch({ gapMM: { ...gapMM, y: parseFloat(e.target.value) || 0 } })} /></label>
      </div>

      <label>
        <input type="checkbox" checked={drawCutLines}
          onChange={e => patch({ drawCutLines: e.target.checked })} />
        {t('cutLines') as string}
      </label>
    </fieldset>
  );
}
