/**
 * Vizuální komponenty a banner ve stylu Claude Code CLI
 */

import boxen from 'boxen';
import chalk from 'chalk';
import { THEME, colorizeLogoLine } from './colors.js';

/**
 * Zobrazí úvodní uvítací banner
 */
export function printBanner() {
  const title = chalk.bold.white('QR KÓDY') + ' ' + chalk.bgHex('#4F46E5').white.bold(' CLI ') + '  ' + chalk.dim('•') + '  ' + chalk.hex('#38BDF8')('Generátor stylových QR kódů & QR plateb');
  const tip = chalk.dim('Ovládání: ') + chalk.cyan.bold('↑/↓') + chalk.dim(' výběr  •  ') + chalk.cyan.bold('Enter') + chalk.dim(' potvrzení  •  ') + chalk.dim('Ctrl+C ukončení');

  const content = [
    `  ${' '.repeat(16)}${chalk.hex('#A855F7').bold('▄▀')}`,
    `  ${colorizeLogoLine('█▀▀█ █▀▀█   █░█ █▀▀█ █▀▀▄ █░█')}`,
    `  ${colorizeLogoLine('█░░█ █▄▄▀   █▀▄ █░░█ █░░█ █▄█')}`,
    `  ${colorizeLogoLine('▀▀▀█ ▀░▀▀   ▀░▀ ▀▀▀▀ ▀▀▀░ ░▀░')}`,
    '',
    `  ${title}`,
    '',
    `  ${tip}`
  ].join('\n');

  const box = boxen(content, {
    padding: { top: 1, bottom: 1, left: 2, right: 3 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderColor: '#818CF8',
    borderStyle: 'round',
  });

  console.log(box);
}

/**
 * Oddělovač sekcí s číslem kroku
 */
export function printStep(stepNum, totalSteps, title) {
  console.log();
  const stepBadge = chalk.bgHex('#4338CA').hex('#E0E7FF').bold(` Krok ${stepNum}/${totalSteps} `);
  console.log(`${stepBadge} ${chalk.bold.white(title)}`);
  console.log(chalk.hex('#475569')('─'.repeat(58)));
}

/**
 * Zobrazení přehledné karty parametrů před vygenerováním
 */
export function printSummaryCard({ type, contentPreview, fgColor, fontName, label, exportFormat }) {
  const rows = [
    `${chalk.dim('Typ QR kódu:')}   ${chalk.hex('#38BDF8').bold(type === 'payment' ? '💳 QR Platba (SPAYD standard)' : '🔗 Běžný text / URL')}`,
    `${chalk.dim('Obsah / Účet:')}  ${chalk.white.bold(contentPreview)}`,
    `${chalk.dim('Barva kódu:')}    ${chalk.hex(fgColor)('████')} ${chalk.hex(fgColor).bold(fgColor)}`,
    `${chalk.dim('Popisek textu:')} ${label ? chalk.hex('#F59E0B').bold(`"${label}"`) : chalk.dim('(žádný)')}`,
    label ? `${chalk.dim('Google Font:')}   ${chalk.hex('#EC4899').bold(fontName)}` : null,
    `${chalk.dim('Cílový formát:')} ${chalk.hex('#10B981').bold(exportFormat.toUpperCase())}`,
  ].filter(Boolean);

  const card = boxen(rows.join('\n'), {
    title: chalk.bold.white(' 📋 Přehled nastavení '),
    titleAlignment: 'left',
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderColor: '#6366F1',
    borderStyle: 'round',
  });

  console.log(card);
}

/**
 * Zobrazení úspěšného vygenerování
 */
export function printSuccessCard(files, downloadsDir) {
  const fileLines = files.map(f => `  ${chalk.hex('#10B981')('✓')} ${chalk.white.bold(f.filename)} ${chalk.dim(`(${f.sizeKb} kB)`)}`).join('\n');

  const content = [
    chalk.bold.hex('#10B981')('✨ QR kód byl úspěšně vygenerován!'),
    '',
    chalk.dim('Uloženo do: ') + chalk.hex('#38BDF8').bold(downloadsDir),
    '',
    fileLines,
  ].join('\n');

  const box = boxen(content, {
    padding: 1,
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderColor: '#10B981',
    borderStyle: 'round',
  });

  console.log(box);
}
