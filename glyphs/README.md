# MapLibre glyph PBF packs

Pre-built SDF glyph ranges for MapLibre `{fontstack}/{range}.pbf` API.

Generated with [fontnik](https://github.com/mapbox/node-fontnik) + [@mapbox/glyph-pbf-composite](https://github.com/mapbox/glyph-pbf-composite) (the same pipeline used by openmaptiles/fonts and mapbox).

Stacks are **combined** (first-font-wins per codepoint): Arabic glyphs come from Noto Naskh Arabic; Latin/digits/punctuation come from Noto Sans (Naskh contains no Latin letters).

| fontstack | sources |
|---|---|
| Noto Naskh Arabic,Noto Sans Regular | NotoNaskhArabic-Regular.ttf + NotoSans-Regular.ttf |
| Noto Naskh Arabic,Noto Sans Bold | NotoNaskhArabic-Bold.ttf + NotoSans-Bold.ttf |
| Noto Naskh Arabic,Noto Sans Italic | NotoNaskhArabic-Regular.ttf + NotoSans-Italic.ttf |

Fonts: © Google, SIL Open Font License 1.1 (see OFL.txt). Generation script preserved in commit history.
