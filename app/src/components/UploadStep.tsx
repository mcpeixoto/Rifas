import { useCallback, useState } from 'react';
import { useStore } from '../state/store';
import { loadTemplate } from '../pdf/loadTemplate';
import { saveTemplate } from '../utils/storage';
import { useT } from '../i18n';

export function UploadStep() {
  const t = useT();
  const setTemplate = useStore(s => s.setTemplate);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    try {
      const tpl = await loadTemplate(file);
      setTemplate(tpl.bytes, file.name, tpl.width, tpl.height);
      await saveTemplate(tpl.bytes, file.name);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao ler PDF');
    }
  }, [setTemplate]);

  return (
    <div
      className={`upload-zone ${drag ? 'drag' : ''}`}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
    >
      <p>{t('dropPdf') as string}</p>
      <p className="muted">{t('or') as string}</p>
      <label className="btn">
        {t('chooseFile') as string}
        <input
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </label>
      {error && <p style={{ color: 'var(--danger)', marginTop: 12 }}>{error}</p>}
    </div>
  );
}
