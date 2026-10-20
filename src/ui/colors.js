/**
 * Barevné palety a stylování terminálu ve stylu moderních CLI nástrojů (Claude Code)
 */

import chalk from 'chalk';

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
