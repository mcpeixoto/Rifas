import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export type LoadedTemplate = {
  bytes: ArrayBuffer;
  numPages: number;
  width: number;  // pt, page 0
  height: number; // pt, page 0
  pdfjsDoc: pdfjs.PDFDocumentProxy;
};

export async function loadTemplate(file: File | Blob): Promise<LoadedTemplate> {
  const bytes = await file.arrayBuffer();
  // pdfjs mutates the buffer it receives; pass a copy so we keep originals for pdf-lib
  const copy = bytes.slice(0);
  const doc = await pdfjs.getDocument({ data: copy }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  return {
    bytes,
    numPages: doc.numPages,
    width: viewport.width,
    height: viewport.height,
    pdfjsDoc: doc,
  };
}

export async function renderPageToCanvas(
  doc: pdfjs.PDFDocumentProxy,
  pageIndex: number,
  canvas: HTMLCanvasElement,
  targetWidthPx: number,
): Promise<{ scale: number }> {
  const page = await doc.getPage(pageIndex + 1);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = targetWidthPx / baseViewport.width;
  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { scale };
}
