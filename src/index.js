/**
 * Hlavní interaktivní CLI aplikace QR Kódy
 */

import { select, input, confirm, Separator } from '@inquirer/prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

import { validateAccount } from './core/bank.js';
import { generateSpayd } from './core/spayd.js';
import { checkCapacity, validateUrl } from './core/limits.js';
import { POPULAR_GOOGLE_FONTS } from './core/fonts.js';
import { generateSvg, generateJpg } from './core/generator.js';
import { PRESET_COLORS, isValidHex, normalizeHex } from './ui/colors.js';
import { printBanner, printStep, printSummaryCard, printSuccessCard } from './ui/banner.js';
import { printTerminalQr } from './ui/terminal-qr.js';
import { buildFilename, getUniqueFilename } from './utils/filename.js';
import { getDownloadsPath, saveFile, createTempPreview, openInSystem, revealInFinder } from './utils/files.js';

/**
 * Průvodce pro zadání platebních údajů (QR Platba dle SPAYD)
 */
async function promptPaymentDetails() {
  printStep(2, 5, 'Platební údaje (QR Platba ČBA)');

  console.log(chalk.dim('Zadejte číslo účtu ve formátu např. 19-2000145399/0800 nebo IBAN.'));
  console.log(chalk.dim('Appka provádí kontrolu modulo 11 dle standardu České národní banky.'));
  console.log();

  // 1. Číslo účtu
  let bankDetails = null;
  let rawAccount = '';

  while (!bankDetails) {
    rawAccount = await input({
      message: 'Číslo účtu ([předčíslí-]číslo/banka nebo IBAN):',
      validate: (value) => {
        if (!value || !value.trim()) return 'Zadejte prosím číslo účtu.';
        const result = validateAccount(value);
        if (!result.valid) return result.error;
        return true;
      }
    });

    const validation = validateAccount(rawAccount);
    if (validation.valid) {
      bankDetails = validation.details;
      console.log(chalk.green(`  ✓ ${bankDetails.bankName} (IBAN: ${bankDetails.iban})`));
    }
  }

  // 2. Částka platby
  console.log();
  const amountStr = await input({
    message: 'Částka platby v Kč (např. 1500 nebo 250.50) [Enter pro nevyplněno]:',
    validate: (value) => {
      if (!value || !value.trim()) return true;
      const num = parseFloat(value.replace(',', '.'));
      if (isNaN(num) || num <= 0) return 'Částka musí být kladné číslo.';
      return true;
    }
  });

  const amount = amountStr ? amountStr.replace(',', '.').trim() : '';

  // 3. Měna
  let currency = 'CZK';
  if (amount) {
    currency = await select({
      message: 'Měna platby:',
      choices: [
        { name: 'CZK (česká koruna)', value: 'CZK' },
        { name: 'EUR (euro)', value: 'EUR' },
        { name: 'USD (americký dolar)', value: 'USD' },
      ],
      default: 'CZK',
    });
  }

  // 4. Zpráva pro příjemce
  console.log();
  const message = await input({
    message: 'Zpráva pro příjemce (max 60 znaků) [Enter pro přeskočení]:',
    validate: (value) => {
      if (!value) return true;
      if (value.length > 60) return `Zpráva je příliš dlouhá (${value.length}/60 znaků).`;
      return true;
    }
  });

  // 5. Variabilní symbol
  const vs = await input({
    message: 'Variabilní symbol (max 10 číslic) [Enter pro přeskočení]:',
    validate: (value) => {
      if (!value) return true;
      if (!/^\d{1,10}$/.test(value.trim())) return 'Variabilní symbol může obsahovat pouze 1 až 10 číslic.';
      return true;
    }
  });

  // 6. Konstantní symbol
  const ks = await input({
    message: 'Konstantní symbol (max 4 číslice) [Enter pro přeskočení]:',
    validate: (value) => {
      if (!value) return true;
      if (!/^\d{1,4}$/.test(value.trim())) return 'Konstantní symbol může obsahovat pouze 1 až 4 číslice.';
      return true;
    }
  });

  // 7. Specifický symbol
  const ss = await input({
    message: 'Specifický symbol (max 10 číslic) [Enter pro přeskočení]:',
    validate: (value) => {
      if (!value) return true;
      if (!/^\d{1,10}$/.test(value.trim())) return 'Specifický symbol může obsahovat pouze 1 až 10 číslic.';
      return true;
    }
  });

  // 8. Jméno příjemce
  const recipient = await input({
    message: 'Jméno příjemce (např. Jan Novák, max 35 znaků) [Enter pro přeskočení]:',
    validate: (value) => {
      if (!value) return true;
      if (value.length > 35) return `Jméno je příliš dlouhé (${value.length}/35 znaků).`;
      return true;
    }
  });

  // Sestavení SPAYD
  const spaydString = generateSpayd({
    iban: bankDetails.iban,
    amount: amount || undefined,
    currency,
    message: message.trim() || undefined,
    vs: vs.trim() || undefined,
    ks: ks.trim() || undefined,
    ss: ss.trim() || undefined,
    recipient: recipient.trim() || undefined,
  });

  const cap = checkCapacity(spaydString);
  console.log();
  console.log(chalk.dim(`  Délka SPAYD řetězce: ${cap.bytes} bajtů (${cap.percentage} % kapacity QR kódu)`));

  return {
    qrData: spaydString,
    contentPreview: `${bankDetails.formatted}${amount ? ` • ${amount} ${currency}` : ''}`,
    amount,
    currency,
    vs: vs.trim(),
    recipient: recipient.trim(),
  };
}

/**
 * Průvodce pro běžný text / webový odkaz
 */
async function promptTextDetails() {
  printStep(2, 5, 'Obsah QR kódu (Text nebo URL odkaz)');

  console.log(chalk.dim('Zadejte libovolný text nebo webovou adresu (např. https://mojedomena.cz/vstupenky).'));
  console.log(chalk.dim('Aplikace hlídá správný tvar odkazu a maximální kapacitu QR kódu.'));
  console.log();

  let textValue = '';
  let urlInfo = null;

  while (!textValue) {
    const rawInput = await input({
      message: 'Zadejte odkaz (URL) nebo text:',
      validate: (value) => {
        if (!value || !value.trim()) return 'Zadejte prosím text nebo webovou adresu.';
        const cap = checkCapacity(value);
        if (cap.isOverLimit) {
          return `Zadaný text je příliš dlouhý (${cap.bytes} bajtů). Maximální limit je ${cap.maxBytes} bajtů.`;
        }
        const valRes = validateUrl(value);
        if (!valRes.isValid && valRes.isUrl) {
          return valRes.error;
        }
        return true;
      }
    });

    const valRes = validateUrl(rawInput);
    if (valRes.warning) {
      console.log(chalk.cyan(`  ℹ ${valRes.warning}`));
    }

    urlInfo = valRes;
    textValue = valRes.formattedUrl || rawInput.trim();
  }

  const cap = checkCapacity(textValue);
  console.log(chalk.dim(`  Délka: ${cap.characters} znaků / ${cap.bytes} B (${cap.percentage} % kapacity QR kódu)`));

  return {
    qrData: textValue,
    contentPreview: textValue.length > 40 ? textValue.slice(0, 37) + '...' : textValue,
    url: urlInfo.isUrl ? textValue : null,
  };
}

/**
 * Průvodce výběrem brandingu a barev
 */
async function promptBranding() {
  printStep(3, 5, 'Branding & Vzhled (barva QR kódu)');

  // Barva popředí
  const fgChoice = await select({
    message: 'Vyberte barvu QR kódu (branding):',
    choices: PRESET_COLORS.map(c => ({
      name: `${c.badge} ${chalk.dim(c.hex !== 'custom' ? c.hex : '')}`,
      value: c.hex,
    })),
  });

  let fgColor = fgChoice;
  if (fgChoice === 'custom') {
    fgColor = await input({
      message: 'Zadejte vlastní HEX kód barvy (např. #1E40AF):',
      validate: (value) => {
        if (!isValidHex(value)) return 'Neplatný HEX formát. Použijte tvar #RRGGBB (např. #2563EB).';
        return true;
      }
    });
    fgColor = normalizeHex(fgColor);
  }

  // Barva pozadí
  const bgChoice = await select({
    message: 'Vyberte barvu pozadí:',
    choices: [
      { name: 'Bílé pozadí (#FFFFFF) - Doporučeno pro spolehlivé čtení mobilem', value: '#FFFFFF' },
      { name: 'Jemně krémové / šedé (#F8FAFC)', value: '#F8FAFC' },
      { name: 'Průhledné pozadí (pouze SVG, pro vkládání do designů)', value: 'transparent' },
      { name: 'Vlastní HEX kód...', value: 'custom' },
    ],
  });

  let bgColor = bgChoice;
  if (bgChoice === 'custom') {
    bgColor = await input({
      message: 'Zadejte vlastní HEX kód pozadí (např. #F1F5F9):',
      validate: (value) => {
        if (!isValidHex(value)) return 'Neplatný HEX formát. Použijte tvar #RRGGBB.';
        return true;
      }
    });
    bgColor = normalizeHex(bgColor);
  }

  return { fgColor, bgColor };
}

/**
 * Průvodce zadáním textu pod QR kód a výběrem Google Fontu
 */
async function promptTextLabel() {
  printStep(4, 5, 'Doprovodný text & Google Fonts');

  console.log(chalk.dim('Text bude umístěn pod spodním okrajem QR kódu a vycentrován na střed.'));
  console.log(chalk.dim('Například: "Odkaz na vstupenky", "Jídelní lístek", "Platba za oběd" apod.'));
  console.log();

  const label = await input({
    message: 'Text pod QR kód [Enter pro žádný text]:',
  });

  if (!label || !label.trim()) {
    return { label: '', fontName: 'Inter' };
  }

  const cleanLabel = label.trim();

  // Výběr Google Fontu
  const fontChoices = POPULAR_GOOGLE_FONTS.map(f => ({
    name: `${chalk.bold(f.name)} - ${chalk.dim(f.description)}`,
    value: f.name,
  }));
  fontChoices.push(new Separator());
  fontChoices.push({ name: 'Zadat jiný Google Font ze seznamu fonts.google.com...', value: 'custom' });

  const fontChoice = await select({
    message: 'Vyberte typ písma z Google Fonts:',
    choices: fontChoices,
  });

  let fontName = fontChoice;
  if (fontChoice === 'custom') {
    fontName = await input({
      message: 'Název Google Fontu (např. "Space Grotesk" nebo "Cinzel"):',
      validate: (value) => {
        if (!value || !value.trim()) return 'Zadejte název fontu.';
        return true;
      }
    });
    fontName = fontName.trim();
  }

  return { label: cleanLabel, fontName };
}

/**
 * Výběr formátu exportu (SVG / JPG)
 */
async function promptExportFormat() {
  printStep(5, 5, 'Formát exportu & Uložení');

  return await select({
    message: 'Jaký formát si přejete vygenerovat?',
    choices: [
      { name: 'SVG (vektorový formát - perfektní ostrost v libovolné velikosti)', value: 'svg' },
      { name: 'JPG (rastrový obrázek ve vysokém rozlišení 1800×1800 px)', value: 'jpg' },
      { name: 'Obojí (SVG i JPG současně)', value: 'both' },
    ],
  });
}

/**
 * Hlavní běh aplikace
 */
export async function run() {
  console.clear();
  printBanner();

  let restart = true;

  while (restart) {
    // 1. Výběr typu QR kódu
    printStep(1, 5, 'Typ QR kódu');

    const qrType = await select({
      message: 'Co si přejete vygenerovat?',
      choices: [
        {
          name: `${chalk.cyan('🔗')} Běžný text nebo webový odkaz (URL)`,
          value: 'text',
        },
        {
          name: `${chalk.hex('#F59E0B')('💳')} Platební QR kód (český standard QR Platba / SPAYD)`,
          value: 'payment',
        },
      ],
    });

    // 2. Zadání obsahu
    let contentData;
    if (qrType === 'payment') {
      contentData = await promptPaymentDetails();
    } else {
      contentData = await promptTextDetails();
    }

    // 3. Branding & Barvy
    const branding = await promptBranding();

    // 4. Doprovodný text & Google Fonts
    const typography = await promptTextLabel();

    // 5. Výběr exportního formátu
    const exportFormat = await promptExportFormat();

    // Příprava dat pro náhled a export
    const generatorOptions = {
      data: contentData.qrData,
      fgColor: branding.fgColor,
      bgColor: branding.bgColor,
      label: typography.label,
      fontName: typography.fontName,
    };

    // Generování SVG v paměti
    const { svg } = await generateSvg(generatorOptions);

    // Terminálový náhled & souhrnná karta
    console.log();
    console.log(chalk.bold.cyan('━'.repeat(54)));
    console.log(chalk.bold.white('  NÁHLED VÝSLEDNÉHO QR KÓDU'));
    console.log(chalk.bold.cyan('━'.repeat(54)));

    printTerminalQr(contentData.qrData, {
      fgColor: branding.fgColor,
      bgColor: branding.bgColor,
      label: typography.label,
      fontName: typography.fontName,
    });

    printSummaryCard({
      type: qrType,
      contentPreview: contentData.contentPreview,
      fgColor: branding.fgColor,
      fontName: typography.fontName,
      label: typography.label,
      exportFormat,
    });

    // Interaktivní volba před finálním uložením
    let readyToSave = false;
    let cancel = false;

    while (!readyToSave && !cancel) {
      const action = await select({
        message: 'Co si přejete udělat před uložením?',
        choices: [
          { name: '💾 Uložit do složky Downloads', value: 'save' },
          { name: '👀 Otevřít rychlý náhled v systému (QuickLook / Obrázek)', value: 'preview' },
          { name: '🔄 Upravit parametry znovu od začátku', value: 'restart' },
          { name: '❌ Zrušit a ukončit', value: 'exit' },
        ],
      });

      if (action === 'save') {
        readyToSave = true;
      } else if (action === 'preview') {
        // Vytvoříme dočasný soubor a otevřeme
        try {
          let previewPath;
          if (exportFormat === 'jpg') {
            const jpgBuf = await generateJpg(svg, { targetWidth: 1200, bgColor: branding.bgColor });
            previewPath = await createTempPreview('jpg', jpgBuf);
          } else {
            previewPath = await createTempPreview('svg', svg);
          }
          console.log(chalk.dim(`  Otevírám systémový náhled: ${previewPath}...`));
          await openInSystem(previewPath);
        } catch (err) {
          console.log(chalk.red(`  Chyba při otevírání náhledu: ${err.message}`));
        }
      } else if (action === 'restart') {
        readyToSave = false;
        break; // Restart loop
      } else if (action === 'exit') {
        cancel = true;
        console.log(chalk.dim('\nGenerování bylo zrušeno.'));
        return;
      }
    }

    if (!readyToSave) {
      continue;
    }

    // Uložení do Downloads
    const downloadsDir = getDownloadsPath();
    const savedFiles = [];

    const fileMeta = {
      type: qrType,
      label: typography.label,
      url: contentData.url,
      amount: contentData.amount,
      currency: contentData.currency,
      vs: contentData.vs,
      recipient: contentData.recipient,
    };

    if (exportFormat === 'svg' || exportFormat === 'both') {
      const svgFilename = getUniqueFilename(downloadsDir, buildFilename(fileMeta, 'svg'));
      const fullPath = await saveFile(downloadsDir, svgFilename, svg);
      const stats = fs.statSync(fullPath);
      savedFiles.push({
        filename: svgFilename,
        path: fullPath,
        sizeKb: (stats.size / 1024).toFixed(1),
      });
    }

    if (exportFormat === 'jpg' || exportFormat === 'both') {
      const jpgBuf = await generateJpg(svg, { targetWidth: 1800, quality: 95, bgColor: branding.bgColor });
      const jpgFilename = getUniqueFilename(downloadsDir, buildFilename(fileMeta, 'jpg'));
      const fullPath = await saveFile(downloadsDir, jpgFilename, jpgBuf);
      const stats = fs.statSync(fullPath);
      savedFiles.push({
        filename: jpgFilename,
        path: fullPath,
        sizeKb: (stats.size / 1024).toFixed(1),
      });
    }

    printSuccessCard(savedFiles, downloadsDir);

    // Nabídka další akce
    const nextAction = await select({
      message: 'Co dál?',
      choices: [
        { name: '📂 Zobrazit soubor ve Finderu / Průzkumníku', value: 'reveal' },
        { name: '✨ Vytvořit další QR kód', value: 'another' },
        { name: '🚪 Ukončit', value: 'exit' },
      ],
    });

    if (nextAction === 'reveal') {
      if (savedFiles.length > 0) {
        await revealInFinder(savedFiles[0].path);
      }
      restart = false;
    } else if (nextAction === 'another') {
      restart = true;
      console.clear();
      printBanner();
    } else {
      restart = false;
    }
  }

  console.log(chalk.dim('\nDíky za použití QR Kódy CLI! Na shledanou.\n'));
}
