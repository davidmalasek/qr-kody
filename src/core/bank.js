/**
 * Modul pro validaci českých bankovních účtů a generování IBAN
 * Podle standardu České národní banky (vyhláška č. 169/2011 Sb.)
 */

// Oficiální číselník kódů platebního styku ČNB
export const CZECH_BANKS = {
  '0100': 'Komerční banka',
  '0300': 'Československá obchodní banka (ČSOB)',
  '0600': 'MONETA Money Bank',
  '0710': 'Česká národní banka',
  '0800': 'Česká spořitelna',
  '2010': 'Fio banka',
  '2060': 'Citfin, spořitelní družstvo',
  '2070': 'Moravský Peněžní Ústav (TRINITY BANK)',
  '2100': 'Hypoteční banka',
  '2200': 'Peněžní dům, spořitelní družstvo',
  '2220': 'Artesa, spořitelní družstvo',
  '2250': 'Banka CREDITAS',
  '2600': 'Citibank Europe',
  '2700': 'UniCredit Bank Czech Republic and Slovakia',
  '3030': 'Air Bank',
  '3050': 'BNP Paribas Personal Finance (Hello bank)',
  '3060': 'PKO BP S.A., pobočka Česká republika',
  '4000': 'Max banka (dříve Expobank)',
  '4300': 'Národní rozvojová banka',
  '5500': 'Raiffeisenbank',
  '5800': 'J&T Banka',
  '6000': 'PPF banka',
  '6200': 'COMMERZBANK Aktiengesellschaft',
  '6210': 'mBank S.A.',
  '6300': 'BNP Paribas Fortis SA/NV',
  '6700': 'Všeobecná úverová banka',
  '7910': 'Deutsche Bank Aktiengesellschaft',
  '7950': 'Raiffeisen stavební spořitelna',
  '7960': 'ČSOB Stavební spořitelna',
  '7970': 'Wüstenrot stavební spořitelna',
  '7980': 'Modrá pyramida stavební spořitelna',
  '7990': 'Stavební spořitelna České spořitelny',
  '8030': 'Raiffeisenbank im Stiftland eG',
  '8040': 'Oberbank AG',
  '8150': 'HSBC Continental Europe',
  '8200': 'PRIVAT BANK AG der Raiffeisenlandesbank',
  '8220': 'Payment Execution s.r.o.',
  '8240': 'DynaFin',
  '8250': 'Bank of China',
  '8265': 'Western Union',
};

// Váhy pro modulo 11 kontrolní součet ČNB (zprava doleva)
const PREFIX_WEIGHTS = [1, 2, 4, 8, 5, 10];
const NUMBER_WEIGHTS = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6];

/**
 * Validace čísla bankovního účtu v ČR
 * @param {string} input - Formát [předčíslí-]číslo/kód_banky nebo IBAN
 * @returns {{ valid: boolean, error?: string, details?: object }}
 */
export function validateAccount(input) {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Zadejte prosím číslo účtu.' };
  }

  const cleaned = input.trim().replace(/\s+/g, '');

  // Kontrola, zda se jedná přímo o IBAN (např. CZ6508000000192000145399)
  if (/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/i.test(cleaned)) {
    return validateIban(cleaned.toUpperCase());
  }

  // Běžný český formát [předčíslí-]číslo/kód_banky
  const match = cleaned.match(/^(?:([0-9]{1,6})-)?([0-9]{2,10})\/([0-9]{4})$/);
  if (!match) {
    return {
      valid: false,
      error: 'Neplatný formát. Očekává se např. 19-2000145399/0800 nebo 2000005555/2010 (případně IBAN).'
    };
  }

  const [, prefix = '', number, bankCode] = match;

  // 1. Kontrola předčíslí (modulo 11)
  if (prefix) {
    if (prefix.length > 6) {
      return { valid: false, error: 'Předčíslí účtu může mít maximálně 6 číslic.' };
    }
    const pDigits = prefix.padStart(6, '0').split('').map(Number);
    let pSum = 0;
    for (let i = 0; i < 6; i++) {
      pSum += pDigits[5 - i] * PREFIX_WEIGHTS[i];
    }
    if (pSum % 11 !== 0) {
      return {
        valid: false,
        error: `Neplatný kontrolní součet předčíslí účtu (${prefix}). Zkontrolujte překlepy (modulo 11 dle ČNB).`
      };
    }
  }

  // 2. Kontrola základní části čísla účtu (modulo 11)
  if (number.length < 2 || number.length > 10) {
    return { valid: false, error: 'Základní část čísla účtu musí mít 2 až 10 číslic.' };
  }
  const nDigits = number.padStart(10, '0').split('').map(Number);
  let nSum = 0;
  for (let i = 0; i < 10; i++) {
    nSum += nDigits[9 - i] * NUMBER_WEIGHTS[i];
  }
  if (nSum % 11 !== 0) {
    return {
      valid: false,
      error: `Neplatný kontrolní součet čísla účtu (${number}). Zkontrolujte překlepy (modulo 11 dle pravidel ČNB).`
    };
  }

  // 3. Kontrola banky
  const bankName = CZECH_BANKS[bankCode] || 'Neznámá / zahraniční banka s českým kódem';

  const iban = czechAccountToIban(prefix, number, bankCode);

  return {
    valid: true,
    details: {
      type: 'czech',
      prefix,
      number,
      bankCode,
      bankName,
      formatted: prefix ? `${prefix}-${number}/${bankCode}` : `${number}/${bankCode}`,
      iban
    }
  };
}

/**
 * Převod českého čísla účtu na mezinárodní formát IBAN
 */
export function czechAccountToIban(prefix, number, bankCode) {
  const p = (prefix || '').padStart(6, '0');
  const n = number.padStart(10, '0');
  const b = bankCode.padStart(4, '0');
  const bban = b + p + n; // 20 číslic

  // Country code CZ -> C=12, Z=35 -> 123500
  const numericStr = bban + '123500';
  const remainder = Number(BigInt(numericStr) % 97n);
  const checksum = String(98 - remainder).padStart(2, '0');

  return `CZ${checksum}${bban}`;
}

/**
 * Validace IBANu mezinárodním standardem modulo 97
 */
export function validateIban(iban) {
  const clean = iban.replace(/[\s-]+/g, '').toUpperCase();
  if (clean.length < 15 || clean.length > 34) {
    return { valid: false, error: 'IBAN musí mít 15 až 34 znaků.' };
  }

  // Přesunout první 4 znaky na konec
  const rearranged = clean.slice(4) + clean.slice(0, 4);

  // Převod písmen na čísla (A=10, B=11, ..., Z=35)
  let numeric = '';
  for (let i = 0; i < rearranged.length; i++) {
    const code = rearranged.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      numeric += (code - 55).toString();
    } else if (code >= 48 && code <= 57) {
      numeric += rearranged[i];
    } else {
      return { valid: false, error: 'IBAN obsahuje nepovolené znaky.' };
    }
  }

  try {
    const valid = BigInt(numeric) % 97n === 1n;
    if (!valid) {
      return { valid: false, error: 'Neplatný kontrolní součet IBANu (modulo 97).' };
    }
  } catch {
    return { valid: false, error: 'Neplatný formát IBANu.' };
  }

  let bankName = 'Zahraniční nebo nespecifikovaná banka';
  if (clean.startsWith('CZ') && clean.length === 24) {
    const bankCode = clean.slice(4, 8);
    bankName = CZECH_BANKS[bankCode] || 'Česká banka';
  }

  return {
    valid: true,
    details: {
      type: 'iban',
      iban: clean,
      bankName,
      formatted: clean.replace(/(.{4})/g, '$1 ').trim()
    }
  };
}
