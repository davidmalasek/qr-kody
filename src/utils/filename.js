/**
 * Modul pro generování přehledných názvů souborů pro složku Downloads
 */

import fs from 'fs';
import path from 'path';

/**
 * Převede text na bezpečný a čitelný URL slug (odstraní diakritiku a speciální znaky)
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Odstranění háčků a čárek
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

/**
 * Vygeneruje vhodný orientační název souboru
 * @param {Object} info
 * @param {'payment'|'text'} info.type - Typ QR kódu
 * @param {string} [info.label] - Popisek textu pod QR kódem
 * @param {string} [info.url] - URL odkaz
 * @param {string|number} [info.amount] - Částka platby
 * @param {string} [info.currency='czk'] - Měna
 * @param {string} [info.vs] - Variabilní symbol
 * @param {string} [info.recipient] - Jméno příjemce
 * @param {'svg'|'jpg'|'jpeg'} extension - Přípona souboru
 * @returns {string} Název souboru bez kolize
 */
export function buildFilename({ type, label, url, amount, currency = 'czk', vs, recipient }, extension = 'svg') {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  let nameParts = ['qr'];

  if (type === 'payment') {
    nameParts.push('platba');
    if (amount) {
      const cleanAmt = String(amount).replace(/[^0-9]/g, '');
      nameParts.push(`${cleanAmt}${currency.toLowerCase()}`);
    } else if (recipient) {
      nameParts.push(slugify(recipient));
    } else if (vs) {
      nameParts.push(`vs${vs}`);
    }
  } else {
    if (label) {
      nameParts.push(slugify(label));
    } else if (url) {
      try {
        const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
        const domain = parsed.hostname.replace(/^www\./, '').split('.')[0];
        nameParts.push(slugify(domain));
      } catch {
        nameParts.push('odkaz');
      }
    } else {
      nameParts.push('kod');
    }
  }

  nameParts.push(dateStr);
  const baseName = nameParts.filter(Boolean).join('-');
  const ext = extension.toLowerCase().replace(/^\./, '');

  return `${baseName}.${ext}`;
}

/**
 * Zkontroluje a zajistí unikátní název souboru v cílové složce (přidá -1, -2 pokud soubor již existuje)
 * @param {string} directory - Cílová složka (např. Downloads)
 * @param {string} filename - Původní název souboru
 * @returns {string} Unikátní název souboru
 */
export function getUniqueFilename(directory, filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);

  let candidate = filename;
  let counter = 1;

  while (fs.existsSync(path.join(directory, candidate))) {
    candidate = `${base}-${counter}${ext}`;
    counter++;
  }

  return candidate;
}
