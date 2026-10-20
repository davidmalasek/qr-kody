#!/usr/bin/env node

/**
 * QR Kódy CLI - Spouštěcí soubor
 */

import { run } from '../src/index.js';

process.on('SIGINT', () => {
  console.log('\n\nOperace přerušena uživatelem. Na shledanou!\n');
  process.exit(0);
});

run().catch((err) => {
  if (err.name === 'ExitPromptError') {
    console.log('\nNa shledanou!\n');
    process.exit(0);
  }
  console.error('\nDošlo k neočekávané chybě:', err.message || err);
  process.exit(1);
});
