import { PDFDocument, StandardFonts, degrees, rgb, PDFFont, PDFEmbeddedPage } from 'pdf-lib';

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [0, 0, 0];
  const v = parseInt(m[1], 16);
  return [((v >> 16) & 0xff) / 255, ((v >> 8) & 0xff) / 255, (v & 0xff) / 255];
}
import { A4_PT, mmToPt } from '../utils/a4';
import { buildPages, formatHeader, padNumber, NumberingConfig, PageDescriptor } from './numbering';
import { Slot, slotOnPage } from './coords';

export type ComposeConfig = {
  templateBytes: ArrayBuffer;
  templatePageIndex: number;
  slots: Slot[];

  rows: number;
  cols: number;
  a4Orientation: 'portrait' | 'landscape';
  rifaOrientation: 0 | 90;
  marginsMM: { top: number; right: number; bottom: number; left: number };
  gapMM: { x: number; y: number };
  scaleOverride?: number; // optional manual scale; otherwise auto-fit

  pagesPerSet: number;
  total: number;
  startNumber: number;
  padding: number;
  fillOrder: 'horizontal' | 'vertical';

  headerFormat: string;
  headerSize: number;
  fontFamily: 'HelveticaBold' | 'Helvetica';

  drawCutLines?: boolean;
  /** Render only the first N pages (used by the preview). */
  maxPages?: number;
};

export type Progress = (done: number, total: number) => void;

export async function composePdf(cfg: ComposeConfig, onProgress?: Progress): Promise<Uint8Array> {
  const outDoc = await PDFDocument.create();
  const srcDoc = await PDFDocument.load(cfg.templateBytes);
  const [embedded] = await outDoc.embedPdf(srcDoc, [cfg.templatePageIndex]);
  const font = await outDoc.embedFont(
    cfg.fontFamily === 'HelveticaBold' ? StandardFonts.HelveticaBold : StandardFonts.Helvetica,
  );

  const A4w = cfg.a4Orientation === 'portrait' ? A4_PT.w : A4_PT.h;
  const A4h = cfg.a4Orientation === 'portrait' ? A4_PT.h : A4_PT.w;

  const tW = embedded.width;
  const tH = embedded.height;

  const rW = cfg.rifaOrientation === 0 ? tW : tH;
  const rH = cfg.rifaOrientation === 0 ? tH : tW;

  const mTop = mmToPt(cfg.marginsMM.top);
  const mRight = mmToPt(cfg.marginsMM.right);
  const mBottom = mmToPt(cfg.marginsMM.bottom);
  const mLeft = mmToPt(cfg.marginsMM.left);
  const gapX = mmToPt(cfg.gapMM.x);
  const gapY = mmToPt(cfg.gapMM.y);
  const headerH = cfg.headerSize + 4;

  const availW = A4w - mLeft - mRight - (cfg.cols - 1) * gapX;
  const availH = A4h - mTop - mBottom - headerH - (cfg.rows - 1) * gapY;
  const fitScale = Math.min(availW / (cfg.cols * rW), availH / (cfg.rows * rH));
  const scale = cfg.scaleOverride ?? fitScale;

  if (scale <= 0) {
    throw new Error('Layout não cabe na página A4. Reduz rows/cols ou margens.');
  }

  const cellW = rW * scale;
  const cellH = rH * scale;

  const numbering: NumberingConfig = {
    total: cfg.total,
    startNumber: cfg.startNumber,
    pagesPerSet: cfg.pagesPerSet,
    rifasPerPage: cfg.rows * cfg.cols,
  };
  const allPages = buildPages(numbering);
  const pages = cfg.maxPages != null ? allPages.slice(0, cfg.maxPages) : allPages;

  const totalPages = pages.length;
  for (let pIdx = 0; pIdx < totalPages; pIdx++) {
    const desc = pages[pIdx];
    const page = outDoc.addPage([A4w, A4h]);

    // Header
    const headerText = formatHeader(cfg.headerFormat, desc);
    page.drawText(headerText, {
      x: mLeft,
      y: A4h - mTop - cfg.headerSize,
      size: cfg.headerSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(`pág. ${desc.pageNumber} (set ${desc.setIdx + 1}, ${desc.pageInSet}/${desc.pagesInSet})`, {
      x: A4w - mRight - 160,
      y: A4h - mTop - cfg.headerSize,
      size: cfg.headerSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Grid
    const gridTop = A4h - mTop - headerH;
    for (let cellIdx = 0; cellIdx < cfg.rows * cfg.cols; cellIdx++) {
      // fillOrder horizontal = row-major (linhas primeiro: esquerda→direita, depois desce).
      // fillOrder vertical = column-major (colunas primeiro: cima→baixo, depois para a direita).
      const row = cfg.fillOrder === 'horizontal'
        ? Math.floor(cellIdx / cfg.cols)
        : cellIdx % cfg.rows;
      const col = cfg.fillOrder === 'horizontal'
        ? cellIdx % cfg.cols
        : Math.floor(cellIdx / cfg.rows);
      const cellX = mLeft + col * (cellW + gapX);
      const cellY = gridTop - (row + 1) * cellH - row * gapY;

      // Place template
      if (cfg.rifaOrientation === 0) {
        page.drawPage(embedded, { x: cellX, y: cellY, xScale: scale, yScale: scale });
      } else {
        // 90° CCW rotation around (x,y); offset so cell visually starts at cellX
        page.drawPage(embedded, {
          x: cellX + tH * scale,
          y: cellY,
          xScale: scale,
          yScale: scale,
          rotate: degrees(90),
        });
      }

      const num = desc.rifaNumbers[cellIdx];
      if (num === null) {
        // Mark empty cell with light watermark
        page.drawText('—', {
          x: cellX + cellW / 2 - 4,
          y: cellY + cellH / 2 - 4,
          size: 12,
          font,
          color: rgb(0.85, 0.85, 0.85),
        });
        continue;
      }
      const label = padNumber(num, cfg.padding);

      for (const slot of cfg.slots) {
        const placed = slotOnPage(slot, cellX, cellY, scale, cfg.rifaOrientation, tW, tH);
        const [r, g, b] = hexToRgb(slot.color ?? '#000000');
        page.drawText(label, {
          x: placed.x,
          y: placed.y,
          size: placed.fontSize,
          font,
          color: rgb(r, g, b),
          rotate: degrees(placed.rotation),
        });
      }

      if (cfg.drawCutLines) {
        page.drawRectangle({
          x: cellX,
          y: cellY,
          width: cellW,
          height: cellH,
          borderColor: rgb(0.85, 0.85, 0.85),
          borderWidth: 0.3,
          borderDashArray: [2, 2],
        });
      }
    }

    if (onProgress && (pIdx % 10 === 0 || pIdx === totalPages - 1)) {
      onProgress(pIdx + 1, totalPages);
      // yield to event loop so UI can update
      await new Promise(r => setTimeout(r, 0));
    }
  }

  return outDoc.save();
}

export async function composeFirstPagePreview(cfg: ComposeConfig): Promise<Uint8Array> {
  // Keep the real total so the preview shows the numbers page 1 will actually get.
  const previewCfg: ComposeConfig = { ...cfg, maxPages: 1 };
  return composePdf(previewCfg);
}
