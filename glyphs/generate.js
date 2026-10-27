// Combined-stack glyph generator — replicates openmaptiles/fonts + mapbox production pipeline:
// fontnik.range() per font -> @mapbox/glyph-pbf-composite.combine() (first-wins glyph fallback)
const fs = require('fs');
const path = require('path');
const fontnik = require('fontnik');
const composite = require('@mapbox/glyph-pbf-composite');

const OUT = 'glyphs';
const FONTS = 'fonts';

// EXACT stack names MapLibre puts in the URL (text-font arrays comma-JOINED, no space after comma)
const STACKS = [
  { name: 'Noto Naskh Arabic,Noto Sans Regular', sources: ['NotoNaskhArabic-Regular.ttf', 'NotoSans-Regular.ttf'] },
  { name: 'Noto Naskh Arabic,Noto Sans Bold',    sources: ['NotoNaskhArabic-Bold.ttf',    'NotoSans-Bold.ttf'] },
  { name: 'Noto Naskh Arabic,Noto Sans Italic',  sources: ['NotoNaskhArabic-Regular.ttf', 'NotoSans-Italic.ttf'] },
];

// fontnik wants a Buffer per call; load once per stack
const fontsByStack = STACKS.map(cfg => cfg.sources.map(s => fs.readFileSync(path.join(FONTS, s))));

function rangePromise(font, start) {
  return new Promise((resolve, reject) => {
    fontnik.range({ font, start, end: start + 255 }, (err, data) =>
      err ? reject(err) : resolve(data));
  });
}

// Fallback: valid empty glyph pbf (in case both fonts yield nothing for a range)
function emptyPbf(range, name) {
  const n = Buffer.from(name);        // field 1: fontstack name
  const r = Buffer.from(range);       // field 2: range string
  const stack = Buffer.concat([
    Buffer.from([0x0a, n.length]), n,              // field 1, wire 2
    Buffer.from([0x12, r.length]), r,              // field 2, wire 2
  ]);
  return Buffer.concat([Buffer.from([0x0a, stack.length]), stack]);
}

(async () => {
  let totalFiles = 0, totalBytes = 0;
  for (let si = 0; si < STACKS.length; si++) {
    const cfg = STACKS[si];
    const dir = path.join(OUT, cfg.name);
    fs.mkdirSync(dir, { recursive: true });
    const fonts = fontsByStack[si];
    for (let start = 0; start < 65536; start += 256) {
      const buffers = [];
      for (const font of fonts) {
        const buf = await rangePromise(font, start);
        if (buf && buf.length) buffers.push(buf);   // fontnik may return empty for glyph-less ranges
      }
      let combined = buffers.length ? composite.combine(buffers, cfg.name) : null;
      if (!combined || !combined.length) combined = emptyPbf(`${start}-${start + 255}`, cfg.name);
      fs.writeFileSync(path.join(dir, `${start}-${start + 255}.pbf`), combined);
    }
    // count
    const files = fs.readdirSync(dir);
    totalFiles += files.length;
    totalBytes += files.reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0);
    console.log(`built "${cfg.name}" — ${files.length} files, ${(totalBytes / 1048576).toFixed(1)} MB total so far`);
  }
  console.log(`TOTAL: ${totalFiles} files, ${(totalBytes / 1048576).toFixed(1)} MB`);
})();
