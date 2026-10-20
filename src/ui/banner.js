/**
 * Vizuální komponenty a banner ve stylu Claude Code CLI
 */

import boxen from 'boxen';
import chalk from 'chalk';
import { THEME } from './colors.js';

/**
 * Zobrazí úvodní uvítací banner
 */
export function printBanner() {
  const title = chalk.bold.white('QR KÓDY') + ' ' + chalk.dim('CLI');
  const subtitle = chalk.dim('Generátor stylových QR kódů, QR plateb & brandingu');
  const tip = chalk.dim('Ovládání: ') + chalk.cyan('↑/↓') + chalk.dim(' výběr  •  ') + chalk.cyan('Enter') + chalk.dim(' potvrzení');

  const content = [
    `  ${chalk.hex('#F59E0B')('█▀▀█ █▀▀█')}   ${chalk.hex('#38BDF8')('█░█ █▀▀█ █▀▀▄ █░█')}`,
    `  ${chalk.hex('#F59E0B')('█░░█ █▄▄▀')}   ${chalk.hex('#38BDF8')('█▀▄ █░░█ █░░█ █▄█')}`,
    `  ${chalk.hex('#F59E0B')('▀▀▀█ ▀░▀▀')}   ${chalk.hex('#38BDF8')('▀░▀ ▀▀▀▀ ▀▀▀░ ░▀░')}`,
    '',
    `  ${title}`,
    `  ${subtitle}`,
    '',
    `  ${tip}`
  ].join('\n');

  const box = boxen(content, {
    padding: { top: 1, bottom: 1, left: 1, right: 3 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderColor: '#38BDF8',
    borderStyle: 'round',
  });

  console.log(box);
}

/**
 * Oddělovač sekcí s číslem kroku
 */
export function printStep(stepNum, totalSteps, title) {
  console.log();
  const stepBadge = chalk.bgHex('#1E293B').hex('#38BDF8').bold(` ${stepNum}/${totalSteps} `);
  console.log(`${stepBadge} ${chalk.bold.white(title)}`);
  console.log(chalk.dim('─'.repeat(54)));
}

/**
 * Zobrazení přehledné karty parametrů před vygenerováním
 */
export function printSummaryCard({ type, contentPreview, fgColor, fontName, label, exportFormat }) {
  const rows = [
    `${chalk.dim('Typ QR kódu:')}   ${chalk.white.bold(type === 'payment' ? '💳 QR Platba (SPAYD standard)' : '🔗 Běžný text / URL')}`,
    `${chalk.dim('Obsah / Účet:')}  ${chalk.cyan(contentPreview)}`,
    `${chalk.dim('Barva kódu:')}    ${chalk.hex(fgColor)('███')} ${chalk.white(fgColor)}`,
    `${chalk.dim('Popisek textu:')} ${label ? chalk.white.bold(`"${label}"`) : chalk.dim('(žádný)')}`,
    label ? `${chalk.dim('Google Font:')}   ${chalk.hex('#F59E0B')(fontName)}` : null,
    `${chalk.dim('Cílový formát:')} ${chalk.green.bold(exportFormat.toUpperCase())}`,
  ].filter(Boolean);

  const card = boxen(rows.join('\n'), {
    title: chalk.bold.white(' Přehled nastavení '),
    titleAlignment: 'left',
    padding: { top: 0, bottom: 0, left: 1, right: 2 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderColor: '#64748B',
    borderStyle: 'single',
  });

  console.log(card);
}

/**
 * Zobrazení úspěšného vygenerování
 */
export function printSuccessCard(files, downloadsDir) {
  const fileLines = files.map(f => `  ${chalk.green('✓')} ${chalk.white.bold(f.filename)} ${chalk.dim(`(${f.sizeKb} kB)`)}`).join('\n');

  const content = [
    chalk.bold.green('✨ QR kód byl úspěšně vygenerován!'),
    '',
    chalk.dim('Uloženo do: ') + chalk.cyan(downloadsDir),
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
