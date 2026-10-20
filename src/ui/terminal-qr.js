/**
 * Vykreslení QR kódu přímo v terminálu pomocí ANSI polobloků
 * Umožňuje rychlý živý náhled včetně vybrané barvy a vycentrovaného textu
 */

import qrcode from 'qrcode';
import chalk from 'chalk';

/**
 * Vykreslí QR kód do terminálu s volitelnou barvou a centrovaným popiskem
 * @param {string} text - Data pro QR kód
 * @param {Object} options
 * @param {string} [options.fgColor='#000000'] - HEX barva kódu
 * @param {string} [options.bgColor='#FFFFFF'] - HEX barva pozadí
 * @param {string} [options.label=''] - Text pod QR kódem
 * @param {string} [options.fontName=''] - Název fontu
 */
export function printTerminalQr(text, { fgColor = '#000000', bgColor = '#FFFFFF', label = '', fontName = '' } = {}) {
  const qr = qrcode.create(text, { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const data = qr.modules.data;

  // Barvy pomocí Chalk
  const fg = chalk.hex(fgColor);
  const bg = chalk.hex(bgColor === 'transparent' ? '#000000' : bgColor);

  // Přidáme tichou zónu (okraj 2 moduly)
  const margin = 2;
  const fullSize = size + margin * 2;

  const getModule = (r, c) => {
    const origR = r - margin;
    const origC = c - margin;
    if (origR < 0 || origR >= size || origC < 0 || origC >= size) return 0;
    return data[origR * size + origC];
  };

  const lines = [];

  // Terminál: každý znak má 2 vertikální pixely: horní (▀) a dolní (▄)
  for (let r = 0; r < fullSize; r += 2) {
    let rowStr = '  '; // Odsazení zleva
    for (let c = 0; c < fullSize; c++) {
      const top = getModule(r, c);
      const bottom = r + 1 < fullSize ? getModule(r + 1, c) : 0;

      if (top && bottom) {
        // Obě části zapnuté
        rowStr += fg('█');
      } else if (top && !bottom) {
        // Jen horní
        rowStr += fg('▀');
      } else if (!top && bottom) {
        // Jen dolní
        rowStr += fg('▄');
      } else {
        // Obě vypnuté
        rowStr += ' ';
      }
    }
    lines.push(rowStr);
  }

  // Tisk QR kódu
  console.log();
  lines.forEach(line => console.log(line));

  // Tisk vycentrovaného popisku pod QR kódem
  if (label && label.trim()) {
    const trimmedLabel = label.trim();
    const qrWidthChars = fullSize; // Šířka v terminálových znacích
    const padTotal = Math.max(0, qrWidthChars - trimmedLabel.length);
    const padLeft = Math.floor(padTotal / 2) + 2; // +2 kvůli odsazení zleva
    const spaces = ' '.repeat(padLeft);

    console.log();
    console.log(spaces + chalk.hex(fgColor === '#FFFFFF' ? '#F59E0B' : fgColor).bold(trimmedLabel));
    if (fontName) {
      const subInfo = `[Font: ${fontName}]`;
      const padSub = Math.floor(Math.max(0, qrWidthChars - subInfo.length) / 2) + 2;
      console.log(' '.repeat(padSub) + chalk.dim(subInfo));
    }
  }
  console.log();
}
