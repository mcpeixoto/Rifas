// Smoke test: compose the Santos PDF with 80 rifas and verify page count + numbering anchors.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = path.join(ROOT, 'Rifas dos Santos.pdf');

// Inline a minimal copy of the algorithm so we don't have to ts-jest the app source.
function buildPages(cfg) {
  const pages = [];
  const rifasPerSet = cfg.rifasPerPage * cfg.pagesPerSet;
  const numSets = Math.ceil(cfg.total / rifasPerSet);
  let pageNumber = 1;
  for (let setIdx = 0; setIdx < numSets; setIdx++) {
    const setFirst = cfg.startNumber + setIdx * rifasPerSet;
    const setLast = Math.min(cfg.startNumber + cfg.total - 1, setFirst + rifasPerSet - 1);
    for (let pageInSet = 1; pageInSet <= cfg.pagesPerSet; pageInSet++) {
      const rifaNumbers = [];
      let allNull = true;
      for (let cellIdx = 0; cellIdx < cfg.rifasPerPage; cellIdx++) {
        const n = cfg.startNumber + setIdx*rifasPerSet + cellIdx*cfg.pagesPerSet + (pageInSet - 1);
        if (n >= cfg.startNumber + cfg.total) {
          rifaNumbers.push(null);
        } else {
          rifaNumbers.push(n);
          allNull = false;
        }
      }
      if (!allNull) pages.push({ setIdx, setFirst, setLast, pageInSet, pageNumber: pageNumber++, rifaNumbers });
    }
  }
  return pages;
}

const cfg = {
  total: 80, startNumber: 1, pagesPerSet: 10, rifasPerPage: 8,
};
const pages = buildPages(cfg);

console.log('pages.length:', pages.length);
console.log('page 1:', pages[0].rifaNumbers);
console.log('page 10:', pages[9].rifaNumbers);
console.log('header(1):', `Set ${pages[0].setIdx + 1}: ${pages[0].setFirst} a ${pages[0].setLast}`);

const must = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1); } };
must(pages.length === 10, '10 pages');
must(pages[0].rifaNumbers.join(',') === '1,11,21,31,41,51,61,71', 'page 1 nums');
must(pages[9].rifaNumbers.join(',') === '10,20,30,40,50,60,70,80', 'page 10 nums');
must(pages[0].setFirst === 1 && pages[0].setLast === 80, 'set range');

// Generate an actual output PDF using pdf-lib + the Santos template
console.log('Embedding Santos template...');
const tplBytes = fs.readFileSync(TEMPLATE);
const out = await PDFDocument.create();
const src = await PDFDocument.load(tplBytes);
const [embedded] = await out.embedPdf(src, [0]);
const font = await out.embedFont(StandardFonts.HelveticaBold);

const A4w = 595.28, A4h = 841.89;
const tW = embedded.width, tH = embedded.height;
console.log('template size pt:', tW, 'x', tH);

const rows = 4, cols = 2;
const margin = 22; // pt
const headerH = 14;
const cellW = (A4w - 2*margin) / cols;
const cellH = (A4h - 2*margin - headerH) / rows;
const scale = Math.min(cellW/tW, cellH/tH);

console.log('scale:', scale.toFixed(3), 'cellW:', cellW.toFixed(1), 'cellH:', cellH.toFixed(1));

// Slots in template space: canhoto at left vertical, talão at right vertical
const slots = [
  { x: 30, y: tH/2, rotation: 90, fontSize: 14 },           // canhoto
  { x: tW - 30, y: tH/2, rotation: 90, fontSize: 14 },      // talão
];

const pad = (n) => String(n).padStart(4, '0');
for (const desc of pages) {
  const page = out.addPage([A4w, A4h]);
  page.drawText(`Set ${desc.setIdx+1}: ${desc.setFirst} a ${desc.setLast}`, {
    x: margin, y: A4h - margin - 10, size: 10, font, color: rgb(0,0,0),
  });
  const gridTop = A4h - margin - headerH;
  for (let cellIdx = 0; cellIdx < rows*cols; cellIdx++) {
    const r = Math.floor(cellIdx/cols), c = cellIdx % cols;
    const cellX = margin + c*cellW;
    const cellY = gridTop - (r+1)*tH*scale - r*0;
    page.drawPage(embedded, { x: cellX, y: cellY, xScale: scale, yScale: scale });
    const num = desc.rifaNumbers[cellIdx];
    if (num === null) continue;
    const label = pad(num);
    for (const slot of slots) {
      page.drawText(label, {
        x: cellX + slot.x*scale,
        y: cellY + slot.y*scale,
        size: slot.fontSize*scale,
        font, color: rgb(0,0,0), rotate: degrees(slot.rotation),
      });
    }
  }
}

const bytes = await out.save();
const outPath = path.join(ROOT, 'smoke-output.pdf');
fs.writeFileSync(outPath, bytes);
console.log('OK ->', outPath, 'bytes:', bytes.length);
