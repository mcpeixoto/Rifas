import { useEffect, useRef, useState } from 'react';
import { useStore } from '../state/store';
import { renderPageToCanvas, loadTemplate } from '../pdf/loadTemplate';
import { pdfToCanvas, Slot } from '../pdf/coords';
import { padNumber } from '../pdf/numbering';
import { useT } from '../i18n';

const PREVIEW_WIDTH = 900;

export function SlotEditor() {
  const t = useT();
  const templateBytes = useStore(s => s.templateBytes);
  const templateW = useStore(s => s.templateW);
  const templateH = useStore(s => s.templateH);
  const slots = useStore(s => s.slots);
  const selectedSlotId = useStore(s => s.selectedSlotId);
  const padding = useStore(s => s.padding);
  const startNumber = useStore(s => s.startNumber);
  const addSlot = useStore(s => s.addSlot);
  const updateSlot = useStore(s => s.updateSlot);
  const removeSlot = useStore(s => s.removeSlot);
  const selectSlot = useStore(s => s.selectSlot);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!templateBytes || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      const blob = new Blob([templateBytes]);
      const tpl = await loadTemplate(blob);
      if (cancelled) return;
      await renderPageToCanvas(tpl.pdfjsDoc, 0, canvasRef.current!, PREVIEW_WIDTH);
      if (cancelled) return;
      setCanvasSize({ w: canvasRef.current!.width, h: canvasRef.current!.height });
    })();
    return () => { cancelled = true; };
  }, [templateBytes]);

  // Keyboard shortcuts: Delete to remove, arrow keys to nudge
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedSlotId) return;
      const target = e.target as HTMLElement | null;
      if (target && /input|select|textarea/i.test(target.tagName)) return;
      const slot = slots.find(s => s.id === selectedSlotId);
      if (!slot) return;
      const step = e.shiftKey ? 5 : 1;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeSlot(selectedSlotId);
      } else if (e.key === 'ArrowLeft') { e.preventDefault(); updateSlot(slot.id, { x: slot.x - step }); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); updateSlot(slot.id, { x: slot.x + step }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); updateSlot(slot.id, { y: slot.y + step }); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); updateSlot(slot.id, { y: slot.y - step }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedSlotId, slots, removeSlot, updateSlot]);

  if (!templateBytes) return null;

  const handleAddSlot = () => {
    const slot: Slot = {
      id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      x: templateW / 2,
      y: templateH / 2,
      rotation: 0,
      fontSize: 14,
      color: '#000000',
    };
    addSlot(slot);
  };

  const handleClickEmpty = () => selectSlot(null);

  const slotsCountFn = t('slotsCount') as (n: number) => string;
  return (
    <div>
      <div style={{ marginBottom: 10 }} className="row">
        <button className="btn" onClick={handleAddSlot}>{t('addSlot') as string}</button>
        {selectedSlotId && (
          <button className="btn danger" onClick={() => removeSlot(selectedSlotId)}>
            {t('deleteSelected') as string}
          </button>
        )}
        <span className="muted">{slotsCountFn(slots.length)}</span>
      </div>
      {slots.length === 0 && (
        <div className="empty" style={{ marginBottom: 10 }}>{t('slotEmptyHint') as string}</div>
      )}
      <div ref={wrapRef} className="canvas-wrap" onClick={handleClickEmpty}>
        <canvas ref={canvasRef} />
        {canvasSize.w > 0 && slots.map(slot => (
          <SlotMarker
            key={slot.id}
            slot={slot}
            templateW={templateW}
            templateH={templateH}
            canvasW={canvasSize.w}
            canvasH={canvasSize.h}
            label={padNumber(startNumber, padding)}
            selected={selectedSlotId === slot.id}
            onSelect={() => selectSlot(slot.id)}
            onChange={(p) => updateSlot(slot.id, p)}
          />
        ))}
      </div>
    </div>
  );
}

type SlotMarkerProps = {
  slot: Slot;
  templateW: number;
  templateH: number;
  canvasW: number;
  canvasH: number;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onChange: (p: Partial<Slot>) => void;
};

function SlotMarker(p: SlotMarkerProps) {
  const { slot, templateW, templateH, canvasW, canvasH } = p;
  const pos = pdfToCanvas(slot.x, slot.y, canvasW, canvasH, templateW, templateH);
  const canvasScale = canvasW / templateW;
  const fontPx = slot.fontSize * canvasScale;
  const widthPx = Math.max(40, p.label.length * fontPx * 0.6);
  const heightPx = fontPx * 1.2;

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    p.onSelect();
    if (!(e.target as HTMLElement).classList.contains('handle-action')) {
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startX = slot.x;
      const startY = slot.y;
      const move = (ev: MouseEvent) => {
        const dxCanvas = ev.clientX - startMouseX;
        const dyCanvas = ev.clientY - startMouseY;
        // canvas px -> pdf pt (note Y flip)
        const dxPdf = dxCanvas / canvasScale;
        const dyPdf = -dyCanvas / canvasScale;
        p.onChange({ x: startX + dxPdf, y: startY + dyPdf });
      };
      const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    }
  };

  const onResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startMouseY = e.clientY;
    const startSize = slot.fontSize;
    const move = (ev: MouseEvent) => {
      const dyCanvas = ev.clientY - startMouseY;
      const newSize = Math.max(4, startSize + dyCanvas / canvasScale * 0.5);
      p.onChange({ fontSize: newSize });
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const onRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startMouseX = e.clientX;
    const startRot = slot.rotation;
    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - startMouseX;
      let newRot = startRot + dx * 0.5;
      if (ev.shiftKey) newRot = Math.round(newRot / 15) * 15;
      p.onChange({ rotation: newRot });
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  // CSS rotates clockwise; PDF rotates counterclockwise
  const cssRot = -slot.rotation;
  const slotColor = slot.color ?? '#000000';
  return (
    <div
      className={`slot-marker ${p.selected ? 'selected' : ''}`}
      style={{
        left: pos.x - widthPx / 2,
        top: pos.y - heightPx / 2,
        width: widthPx,
        height: heightPx,
        fontSize: fontPx,
        transform: `rotate(${cssRot}deg)`,
        color: slotColor,
      }}
      onMouseDown={onMouseDown}
      onClick={e => e.stopPropagation()}
    >
      {p.label}
      {p.selected && (
        <>
          <div className="handle rotate handle-action" onMouseDown={onRotate} title="Rodar (arrastar)" />
          <div className="handle resize handle-action" onMouseDown={onResize} title="Tamanho (arrastar)" />
        </>
      )}
    </div>
  );
}
