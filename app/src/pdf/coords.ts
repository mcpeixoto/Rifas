export type Slot = {
  id: string;
  x: number;       // PDF coords on template (origin bottom-left)
  y: number;
  rotation: number; // degrees, counterclockwise
  fontSize: number; // pt at template scale
  color?: string;  // hex like "#000000"
};

// Canvas pixel -> template PDF coords (PDF origin bottom-left)
export function canvasToPdf(
  canvasX: number,
  canvasY: number,
  canvasW: number,
  canvasH: number,
  templateW: number,
  templateH: number,
): { x: number; y: number } {
  const sx = templateW / canvasW;
  const sy = templateH / canvasH;
  return { x: canvasX * sx, y: templateH - canvasY * sy };
}

// Template PDF coords -> canvas pixel (canvas origin top-left)
export function pdfToCanvas(
  pdfX: number,
  pdfY: number,
  canvasW: number,
  canvasH: number,
  templateW: number,
  templateH: number,
): { x: number; y: number } {
  const sx = canvasW / templateW;
  const sy = canvasH / templateH;
  return { x: pdfX * sx, y: (templateH - pdfY) * sy };
}

/**
 * Given a slot position on the template (PDF coords) and the template's placement
 * on the page (cellX, cellY = bottom-left of placement, scale, optional rotation
 * applied to the embedded template), return the absolute PDF coords on the output
 * page where the text should be drawn, plus the final text rotation.
 *
 * Template rotation = 0: placed as-is, scaled around its bottom-left.
 * Template rotation = 90: rotated 90° CCW around its bottom-left, then translated
 *   so that the original bottom-left of the rotated template aligns with cellX/cellY.
 *   In pdf-lib, drawPage with rotate: degrees(90) rotates around (x,y); to keep
 *   it visually upright in the cell we offset cellX by templateH*scale.
 */
export function slotOnPage(
  slot: Slot,
  cellX: number,
  cellY: number,
  scale: number,
  templateRotation: 0 | 90,
  templateW: number,
  templateH: number,
): { x: number; y: number; rotation: number; fontSize: number } {
  if (templateRotation === 0) {
    return {
      x: cellX + slot.x * scale,
      y: cellY + slot.y * scale,
      rotation: slot.rotation,
      fontSize: slot.fontSize * scale,
    };
  }
  // templateRotation === 90: drawPage is called with x = cellX + templateH*scale,
  // y = cellY, rotate = 90deg. A point (px, py) in template space maps to:
  //   px' = cellX + templateH*scale - py*scale
  //   py' =          cellY          + px*scale
  return {
    x: cellX + templateH * scale - slot.y * scale,
    y: cellY + slot.x * scale,
    rotation: slot.rotation + 90,
    fontSize: slot.fontSize * scale,
  };
}
