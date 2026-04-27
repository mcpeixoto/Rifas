import { useEffect, useState } from 'react';
import { useStore } from './state/store';
import { useT } from './i18n';
import { Header } from './components/Header';
import { UploadStep } from './components/UploadStep';
import { SlotEditor } from './components/SlotEditor';
import { SlotInspector } from './components/SlotInspector';
import { LayoutPanel } from './components/LayoutPanel';
import { NumberingPanel } from './components/NumberingPanel';
import { GenerateButton } from './components/GenerateButton';
import { PreviewPanel } from './components/PreviewPanel';
import { loadTemplateFromDb, clearTemplate } from './utils/storage';
import { loadTemplate } from './pdf/loadTemplate';

export function App() {
  const t = useT();
  const templateBytes = useStore(s => s.templateBytes);
  const templateName = useStore(s => s.templateName);
  const setTemplate = useStore(s => s.setTemplate);
  const reset = useStore(s => s.reset);
  const [tab, setTab] = useState<'slots' | 'preview'>('slots');

  useEffect(() => {
    if (templateBytes) return;
    (async () => {
      const stored = await loadTemplateFromDb();
      if (stored) {
        try {
          const tpl = await loadTemplate(new Blob([stored.bytes]));
          setTemplate(stored.bytes, stored.name, tpl.width, tpl.height);
        } catch {
          await clearTemplate();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClear = async () => {
    if (!confirm(t('confirmReset') as string)) return;
    await clearTemplate();
    reset();
  };

  return (
    <div className="app">
      <Header />

      <div className="body">
        <div className="left">
          {!templateBytes ? (
            <>
              <span className="step-pill">{t('step1') as string}</span>
              <UploadStep />
              <p className="muted" style={{ marginTop: 14 }}>{t('uploadHint') as string}</p>
            </>
          ) : (
            <>
              <div className="row" style={{ marginBottom: 12, justifyContent: 'space-between' }}>
                <div className="row">
                  <span className="template-pill">
                    <DocIcon />
                    {templateName}
                  </span>
                  <button className="btn ghost" onClick={handleClear}>{t('reset') as string}</button>
                </div>
                <div className="tabs">
                  <button className={tab === 'slots' ? 'active' : ''} onClick={() => setTab('slots')}>
                    {t('tabSlots') as string}
                  </button>
                  <button className={tab === 'preview' ? 'active' : ''} onClick={() => setTab('preview')}>
                    {t('tabPreview') as string}
                  </button>
                </div>
              </div>
              {tab === 'slots' ? <SlotEditor /> : <PreviewPanel />}
            </>
          )}
        </div>

        <div className="right">
          {templateBytes && tab === 'slots' && <SlotInspector />}
          <LayoutPanel />
          <NumberingPanel />
          <GenerateButton />
        </div>
      </div>

      <footer className="footer">
        <span>{t('footerLine') as string}</span>
        <span>rifas-toolkit · MIT</span>
      </footer>
    </div>
  );
}

function DocIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
    </svg>
  );
}
