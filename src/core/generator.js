/**
 * Modul pro generování SVG a JPG souborů QR kódů
 * Podporuje vlastní barvy (HEX branding), text pod QR kódem a Google Fonts
 */

import qrcode from 'qrcode';
import sharp from 'sharp';
import { getFontDefinition } from './fonts.js';

/**
 * Escapování speciálních znaků pro XML / SVG
 */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generování vektorového SVG řetězce
 * @param {Object} options
 * @param {string} options.data - Data pro zakódování do QR kódu
 * @param {string} [options.fgColor='#000000'] - Barva popředí (HEX)
 * @param {string} [options.bgColor='#FFFFFF'] - Barva pozadí (HEX nebo 'transparent')
 * @param {string} [options.label=''] - Text pod QR kódem
 * @param {string} [options.fontName='Inter'] - Google Font pro text
 * @param {'L'|'M'|'Q'|'H'} [options.ecc='M'] - Úroveň korekce chyb
 * @returns {Promise<{ svg: string, width: number, height: number }>}
 */
export async function generateSvg({
  data,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  label = '',
  fontName = 'Inter',
  ecc = 'M',
}) {
  const qr = qrcode.create(data, { errorCorrectionLevel: ecc });
  const moduleCount = qr.modules.size;

  const cellSize = 22;
  const margin = 66; // Tichá zóna dle QR standardu
  const qrSize = moduleCount * cellSize;
  const width = qrSize + margin * 2;

  const hasLabel = Boolean(label && label.trim());
  const labelText = hasLabel ? label.trim() : '';

  // Výpočet rozměrů pro text pod QR kódem
  const labelHeight = hasLabel ? 96 : 0;
  const height = width + labelHeight;

  // Vytvoření SVG cest pro QR moduly
  let rects = [];
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (qr.modules.get(r, c)) {
        const x = margin + c * cellSize;
        const y = margin + r * cellSize;
        rects.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fgColor}" />`);
      }
    }
  }

  // Příprava písma a textu
  let styleTag = '';
  let textElement = '';

  if (hasLabel) {
    const fontDef = getFontDefinition(fontName);
    styleTag = `
    <defs>
      <style>
        @import url('${fontDef.importUrl}');
        .qr-label {
          font-family: ${fontDef.fontFamily};
          font-weight: 600;
          fill: ${fgColor === '#FFFFFF' ? '#333333' : fgColor};
          text-anchor: middle;
          dominant-baseline: middle;
        }
      </style>
    </defs>`;

    // Dynamický výpočet velikosti písma podle délky textu a šířky plátna
    const maxTextWidth = width - margin;
    let fontSize = Math.round(width * 0.042); // Výchozí poměr
    const estimatedWidth = labelText.length * (fontSize * 0.62);

    if (estimatedWidth > maxTextWidth) {
      fontSize = Math.max(16, Math.floor(maxTextWidth / (labelText.length * 0.62)));
    }

    const textX = width / 2;
    // Odsazení od spodního okraje QR kódu (width je spodní okraj QR části)
    const textY = width + Math.round(labelHeight / 2) - 4;

    textElement = `<text x="${textX}" y="${textY}" font-size="${fontSize}" class="qr-label">${escapeXml(labelText)}</text>`;
  }

  const bgElement = bgColor && bgColor.toLowerCase() !== 'transparent'
    ? `<rect width="${width}" height="${height}" fill="${bgColor}" />`
    : '';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${bgElement}
  ${styleTag}
  <g id="qr-matrix">
    ${rects.join('\n    ')}
  </g>
  ${textElement}
</svg>`;

  return {
    svg,
    width,
    height,
  };
}

/**
 * Generování JPG souboru z SVG
 * @param {string} svgContent - SVG řetězec
 * @param {Object} [options]
 * @param {number} [options.targetWidth=1800] - Cílová šířka pro vysoké rozlišení (např. pro tisk)
 * @param {number} [options.quality=95] - Kvalita komprese JPEG (1-100)
 * @param {string} [options.bgColor='#FFFFFF'] - Barva pozadí (pokud je transparent, použije se bílá)
 * @returns {Promise<Buffer>}
 */
export async function generateJpg(svgContent, { targetWidth = 1800, quality = 95, bgColor = '#FFFFFF' } = {}) {
  // Pro JPEG zajistíme, že pozadí nebude černé ani průhledné
  let safeSvg = svgContent;
  if (!bgColor || bgColor.toLowerCase() === 'transparent') {
    // Vložíme bílý obdélník pod obsah
    safeSvg = svgContent.replace(/<svg([^>]*)>/, '<svg$1><rect width="100%" height="100%" fill="#FFFFFF" />');
  }

  const image = sharp(Buffer.from(safeSvg), { density: 300 });

  return image
    .resize({ width: targetWidth, withoutEnlargement: false })
    .jpeg({ quality, chromaSubsampling: '4:4:4' })
    .toBuffer();
}
