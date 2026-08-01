import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export type RasterTemplate = {
  jpeg: ArrayBuffer;
  widthPx: number;
  heightPx: number;
};

/**
 * Render the template page to a single flat, opaque JPEG.
 *
 * The generated PDF places the template once per ticket — 8 times per sheet,
 * hundreds of times per job. Templates exported from design tools (Canva &co)
 * carry stacked images with soft masks, so every one of those placements makes
 * the printer's RIP flatten transparency again. Cheap printers take minutes per
 * sheet. One opaque raster drawn N times costs the RIP almost nothing.
 */
export async function rasterizeTemplate(
  templateBytes: ArrayBuffer,
  pageIndex: number,
  targetWidthPx: number,
  quality = 0.9,
): Promise<RasterTemplate> {
  // pdfjs mutates the buffer it receives; keep the original intact for pdf-lib.
  const doc = await pdfjs.getDocument({ data: templateBytes.slice(0) }).promise;
  try {
    const page = await doc.getPage(pageIndex + 1);
    const base = page.getViewport({ scale: 1 });
    const scale = targetWidthPx / base.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    const ctx = canvas.getContext('2d', { alpha: false })!;
    // JPEG has no alpha: paint the sheet white so transparent areas don't go black.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // intent 'print' also makes pdf.js drop its requestAnimationFrame scheduling,
    // so generation keeps going when the tab is in the background.
    await page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise;

    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', quality));
    if (!blob) throw new Error('Falha a rasterizar o template.');
    return { jpeg: await blob.arrayBuffer(), widthPx: canvas.width, heightPx: canvas.height };
  } finally {
    await doc.destroy();
  }
}
