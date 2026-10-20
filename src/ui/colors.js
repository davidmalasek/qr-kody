/**
 * Barevné palety a stylování terminálu ve stylu moderních CLI nástrojů (Claude Code)
 */

import chalk from 'chalk';

// Vynutíme plnou podporu 24-bit TrueColor barev v libovolném terminálu
chalk.level = Math.max(chalk.level || 0, 3);

export const THEME = {
  primary: chalk.hex('#D97706'),      // Warm amber
  accent: chalk.hex('#F59E0B'),       // Bright amber
  cyan: chalk.hex('#38BDF8'),         // Sky cyan
  success: chalk.hex('#10B981'),      // Emerald green
  warning: chalk.hex('#F59E0B'),      // Amber
  error: chalk.hex('#EF4444'),        // Crimson red
  muted: chalk.hex('#64748B'),        // Slate dim
  subtle: chalk.hex('#94A3B8'),       // Slate light
  boldWhite: chalk.white.bold,
  dimWhite: chalk.dim,
};

export const PRESET_COLORS = [
  { name: 'Klasická černá', hex: '#000000', badge: '⬛ Černá' },
  { name: 'Půlnoční modrá (Navy)', hex: '#0F172A', badge: '🔷 Tmavě modrá' },
  { name: 'Moderní Indigo', hex: '#4F46E5', badge: '🟣 Indigo' },
  { name: 'Smaragdově zelená', hex: '#059669', badge: '🟢 Zelená' },
  { name: 'Karmínově červená', hex: '#DC2626', badge: '🔴 Červená' },
  { name: 'Královská fialová', hex: '#7C3AED', badge: '🟪 Fialová' },
  { name: 'Čokoládově hnědá', hex: '#78350F', badge: '🟫 Hnědá' },
  { name: 'Vlastní HEX kód...', hex: 'custom', badge: '🎨 Zadat vlastní HEX' },
];

/**
 * Barevný gradient pro ASCII logo (Amber -> Coral -> Pink -> Purple -> Cyan -> Emerald)
 */
const LOGO_GRADIENT = [
  '#F59E0B', '#F59E0B', '#F59E0B', '#F59E0B', // Q (Amber)
  '#F97316',                                   // mezera
  '#F97316', '#F97316', '#F97316', '#F97316', // R (Orange)
  '#FB7185', '#FB7185', '#FB7185',             // mezera
  '#EC4899', '#EC4899', '#EC4899',             // K (Pink)
  '#D946EF',                                   // mezera
  '#A855F7', '#A855F7', '#A855F7', '#A855F7', // Ó (Purple)
  '#06B6D4',                                   // mezera
  '#0EA5E9', '#0EA5E9', '#0EA5E9', '#0EA5E9', // D (Sky Cyan)
  '#10B981',                                   // mezera
  '#10B981', '#10B981', '#10B981',             // Y (Emerald)
];

/**
 * Obarví řádek ASCII loga plynulým duhovým gradientem
 * @param {string} line
 * @returns {string}
 */
export function colorizeLogoLine(line) {
  let result = '';
  for (let i = 0; i < line.length; i++) {
    const color = LOGO_GRADIENT[i] || '#38BDF8';
    result += chalk.hex(color).bold(line[i]);
  }
  return result;
}

/**
 * Validace HEX barevného kódu
 * @param {string} hex
 * @returns {boolean}
 */
export function isValidHex(hex) {
  if (!hex || typeof hex !== 'string') return false;
  const clean = hex.trim();
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(clean);
}

/**
 * Normalizuje HEX kód (přidá # pokud chybí)
 * @param {string} hex
 * @returns {string}
 */
export function normalizeHex(hex) {
  const clean = hex.trim();
  return clean.startsWith('#') ? clean.toUpperCase() : `#${clean.toUpperCase()}`;
}
