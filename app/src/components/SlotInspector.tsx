import { useStore } from '../state/store';
import { useT } from '../i18n';

export function SlotInspector() {
  const t = useT();
  const slots = useStore(s => s.slots);
  const selectedSlotId = useStore(s => s.selectedSlotId);
  const updateSlot = useStore(s => s.updateSlot);
  const selected = slots.find(s => s.id === selectedSlotId);

  if (!selected) {
    return (
      <fieldset>
        <legend>{t('selectedSlot') as string}</legend>
        <p className="muted" style={{ margin: 0 }}>{t('inspectorEmpty') as string}</p>
      </fieldset>
    );
  }

  return (
    <fieldset>
      <legend>{t('selectedSlot') as string}</legend>
      <div className="row stack" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 8 }}>
        <div className="row">
          <label>X (pt)
            <input type="number" value={Math.round(selected.x * 10) / 10}
              onChange={e => updateSlot(selected.id, { x: parseFloat(e.target.value) })}
            />
          </label>
          <label>Y (pt)
            <input type="number" value={Math.round(selected.y * 10) / 10}
              onChange={e => updateSlot(selected.id, { y: parseFloat(e.target.value) })}
            />
          </label>
        </div>
        <div className="row">
          <label>{t('rotation') as string}
            <input type="number" value={Math.round(selected.rotation)}
              onChange={e => updateSlot(selected.id, { rotation: parseFloat(e.target.value) })}
            />
          </label>
          <label>{t('font') as string}
            <input type="number" value={Math.round(selected.fontSize * 10) / 10}
              onChange={e => updateSlot(selected.id, { fontSize: parseFloat(e.target.value) })}
            />
          </label>
        </div>
        <div className="row">
          <button className="btn secondary" onClick={() => updateSlot(selected.id, { rotation: 90 })}>↻ 90°</button>
          <button className="btn secondary" onClick={() => updateSlot(selected.id, { rotation: 0 })}>↻ 0°</button>
          <button className="btn secondary" onClick={() => updateSlot(selected.id, { rotation: -90 })}>↻ −90°</button>
        </div>
        <div className="row">
          <label>{t('color') as string}
            <input type="color" value={selected.color ?? '#000000'}
              onChange={e => updateSlot(selected.id, { color: e.target.value })}
            />
          </label>
          <input type="text" value={selected.color ?? '#000000'} style={{ width: 90 }}
            onChange={e => updateSlot(selected.id, { color: e.target.value })}
          />
          <button className="btn ghost" onClick={() => updateSlot(selected.id, { color: '#000000' })}>{t('black') as string}</button>
          <button className="btn ghost" onClick={() => updateSlot(selected.id, { color: '#cf222e' })}>{t('red') as string}</button>
        </div>
      </div>
    </fieldset>
  );
}
