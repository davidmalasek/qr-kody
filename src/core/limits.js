/**
 * Modul pro kontrolu limitů QR kódu a validaci URL odkazů
 */

// Maximální kapacity pro QR kód verze 40 dle úrovně korekce chyb (ECC)
export const QR_LIMITS = {
  L: { binary: 2953, alphanumeric: 4296, numeric: 7089 },
  M: { binary: 2331, alphanumeric: 3848, numeric: 6358 }, // Standard
  Q: { binary: 1663, alphanumeric: 2797, numeric: 4616 },
  H: { binary: 1273, alphanumeric: 2132, numeric: 3521 }, // Nejvyšší zabezpečení
};

/**
 * Zjistí velikost a kapacitní vytížení QR kódu
 * @param {string} text - Vstupní řetězec
 * @param {'L'|'M'|'Q'|'H'} [ecc='M'] - Úroveň korekce chyb
 * @returns {Object} Informace o kapacitě
 */
export function checkCapacity(text, ecc = 'M') {
  if (!text) {
    return {
      bytes: 0,
      characters: 0,
      maxBytes: QR_LIMITS[ecc].binary,
      percentage: 0,
      isOverLimit: false,
      status: 'empty'
    };
  }

  const characters = text.length;
  const bytes = Buffer.byteLength(text, 'utf8');
  const maxBytes = QR_LIMITS[ecc].binary;
  const percentage = Math.min(100, Number(((bytes / maxBytes) * 100).toFixed(1)));
  const isOverLimit = bytes > maxBytes;

  let status = 'optimal';
  if (isOverLimit) {
    status = 'exceeded';
  } else if (percentage > 85) {
    status = 'warning';
  }

  return {
    bytes,
    characters,
    maxBytes,
    percentage,
    isOverLimit,
    status
  };
}

/**
 * Validace URL odkazu
 * @param {string} input - Vstupní odkaz
 * @returns {{ isValid: boolean, isUrl: boolean, formattedUrl: string, warning?: string, error?: string }}
 */
export function validateUrl(input) {
  if (!input || typeof input !== 'string') {
    return { isValid: false, isUrl: false, formattedUrl: '', error: 'Zadejte prosím odkaz nebo text.' };
  }

  const trimmed = input.trim();

  // Detekce, zda se jedná o pokus o webový odkaz
  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) ||
    /^www\./i.test(trimmed) ||
    /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/.*)?$/i.test(trimmed);

  if (!looksLikeUrl) {
    // Jedná se o běžný text, nikoli webovou adresu
    return {
      isValid: true,
      isUrl: false,
      formattedUrl: trimmed
    };
  }

  // Má mezery?
  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      isUrl: true,
      formattedUrl: trimmed,
      error: 'Webová adresa nesmí obsahovat mezery. Zkontrolujte překlepy.'
    };
  }

  // Doplnění protokolu https:// pokud chybí
  let urlToTest = trimmed;
  let addedProtocol = false;
  if (!/^https?:\/\//i.test(trimmed)) {
    urlToTest = 'https://' + trimmed;
    addedProtocol = true;
  }

  try {
    const parsed = new URL(urlToTest);

    // Kontrola platné domény
    const hostname = parsed.hostname;
    if (!hostname || !hostname.includes('.') || hostname.endsWith('.')) {
      return {
        isValid: false,
        isUrl: true,
        formattedUrl: urlToTest,
        error: `Neplatná doména "${hostname}". Zadejte platnou webovou adresu (např. https://priklad.cz).`
      };
    }

    const tld = hostname.split('.').pop();
    if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
      return {
        isValid: false,
        isUrl: true,
        formattedUrl: urlToTest,
        error: `Neplatná koncovka domény (.${tld}).`
      };
    }

    return {
      isValid: true,
      isUrl: true,
      formattedUrl: urlToTest,
      warning: addedProtocol ? `Automaticky doplněn protokol https:// -> ${urlToTest}` : undefined
    };
  } catch (err) {
    return {
      isValid: false,
      isUrl: true,
      formattedUrl: urlToTest,
      error: `Neplatný formát URL odkazu: ${err.message}`
    };
  }
}
