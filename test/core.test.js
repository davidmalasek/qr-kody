import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'os';

import { validateAccount, czechAccountToIban, validateIban } from '../src/core/bank.js';
import { generateSpayd, formatAmount } from '../src/core/spayd.js';
import { checkCapacity, validateUrl } from '../src/core/limits.js';
import { generateSvg, generateJpg } from '../src/core/generator.js';
import { getFontDefinition, POPULAR_GOOGLE_FONTS } from '../src/core/fonts.js';
import { isValidHex, normalizeHex } from '../src/ui/colors.js';
import { slugify, buildFilename, getUniqueFilename } from '../src/utils/filename.js';

test('České bankovní účty - modulo 11 validace', () => {
  // Platné účty
  const valid1 = validateAccount('19-2000145399/0800');
  assert.equal(valid1.valid, true);
  assert.equal(valid1.details.bankName, 'Česká spořitelna');
  assert.equal(valid1.details.iban, 'CZ6508000000192000145399');

  // Neplatný kontrolní součet
  const invalidChecksum = validateAccount('1234567890/0100');
  assert.equal(invalidChecksum.valid, false);
  assert.match(invalidChecksum.error, /kontrolní součet/i);

  // Neplatný formát
  const invalidFormat = validateAccount('neplatny-ucet');
  assert.equal(invalidFormat.valid, false);
  assert.match(invalidFormat.error, /formát/i);

  // Přímý IBAN
  const validIban = validateAccount('CZ6508000000192000145399');
  assert.equal(validIban.valid, true);
  assert.equal(validIban.details.type, 'iban');
});

test('SPAYD generování', () => {
  const spayd = generateSpayd({
    iban: 'CZ6508000000192000145399',
    amount: '1500.50',
    currency: 'CZK',
    message: 'Vstupenky koncert',
    vs: '20261020',
    recipient: 'Jan Novák'
  });

  assert.equal(
    spayd,
    'SPD*1.0*ACC:CZ6508000000192000145399*AM:1500.50*CC:CZK*MSG:Vstupenky koncert*X-VS:20261020*RN:Jan Novák*'
  );

  assert.equal(formatAmount('250,5'), '250.50');
  assert.equal(formatAmount(''), null);
});

test('Kapacita QR kódu a validace URL', () => {
  const cap = checkCapacity('Ahoj svete');
  assert.equal(cap.bytes, 10);
  assert.equal(cap.isOverLimit, false);
  assert.equal(cap.status, 'optimal');

  // Validace URL bez protokolu
  const url1 = validateUrl('www.google.cz');
  assert.equal(url1.isValid, true);
  assert.equal(url1.formattedUrl, 'https://www.google.cz');

  // Validace URL s chybou
  const urlInvalid = validateUrl('http://neplatna adresa s mezerami.cz');
  assert.equal(urlInvalid.isValid, false);
  assert.match(urlInvalid.error, /mezery/i);
});

test('Branding barev a HEX validace', () => {
  assert.equal(isValidHex('#FFFFFF'), true);
  assert.equal(isValidHex('#1E40AF'), true);
  assert.equal(isValidHex('#fff'), true);
  assert.equal(isValidHex('123456'), false);
  assert.equal(normalizeHex('1E40AF'), '#1E40AF');
  assert.equal(normalizeHex('#1e40af'), '#1E40AF');
});

test('Google Fonts definice', () => {
  assert.ok(POPULAR_GOOGLE_FONTS.length > 5);
  const def = getFontDefinition('Poppins');
  assert.equal(def.name, 'Poppins');
  assert.ok(def.importUrl.includes('Poppins'));
  assert.ok(def.fontFamily.includes('Poppins'));
});

test('Tvorba názvů souborů a slug', () => {
  assert.equal(slugify('Odkaz na vstupenky!'), 'odkaz-na-vstupenky');
  assert.equal(slugify('Žluťoučký kůň'), 'zlutoucky-kun');

  const fnPayment = buildFilename({
    type: 'payment',
    amount: '1500',
    currency: 'CZK'
  }, 'svg');
  assert.match(fnPayment, /^qr-platba-1500czk-\d{4}-\d{2}-\d{2}\.svg$/);

  const fnText = buildFilename({
    type: 'text',
    label: 'Vstupenky'
  }, 'jpg');
  assert.match(fnText, /^qr-vstupenky-\d{4}-\d{2}-\d{2}\.jpg$/);

  const tmpDir = os.tmpdir();
  const testFile = path.join(tmpDir, 'test-qr-collide.svg');
  fs.writeFileSync(testFile, 'test');
  const uniqueName = getUniqueFilename(tmpDir, 'test-qr-collide.svg');
  assert.equal(uniqueName, 'test-qr-collide-1.svg');
  fs.unlinkSync(testFile);
});

test('Generování SVG a JPG s brandingem a textem', async () => {
  const res = await generateSvg({
    data: 'https://example.com',
    fgColor: '#1E40AF',
    bgColor: '#FFFFFF',
    label: 'Odkaz na vstupenky',
    fontName: 'Poppins'
  });

  assert.ok(res.svg.includes('<svg'));
  assert.ok(res.svg.includes('Odkaz na vstupenky'));
  assert.ok(res.svg.includes('#1E40AF'));

  const jpgBuf = await generateJpg(res.svg, { targetWidth: 800 });
  assert.ok(jpgBuf instanceof Buffer);
  assert.ok(jpgBuf.length > 1000);
});
