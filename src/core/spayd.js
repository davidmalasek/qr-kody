/**
 * Modul pro generování SPAYD (Short Payment Descriptor) řetězce
 * Standard České bankovní asociace pro formát QR Platba
 * https://raw.githubusercontent.com/davidmalasek/qr-platba / standard ČBA
 */

/**
 * Normalizace a bezpečné kódování hodnoty v SPAYD formátu
 * Odstraní nepovolené oddělovače '*' a ořízne na maximální délku
 */
function sanitizeValue(value, maxLength) {
  if (value === undefined || value === null) return '';
  const str = String(value).trim().replace(/\*/g, '');
  return maxLength ? str.slice(0, maxLength) : str;
}

/**
 * Validace a formátování částky
 * @param {string|number} amount
 * @returns {string|null} Formát např. "150.00" nebo null pokud není zadána
 */
export function formatAmount(amount) {
  if (amount === undefined || amount === null || amount === '') return null;
  const numStr = String(amount).trim().replace(',', '.').replace(/\s/g, '');
  const num = parseFloat(numStr);
  if (isNaN(num) || num <= 0) {
    throw new Error('Částka musí být kladné číslo.');
  }
  return num.toFixed(2);
}

/**
 * Sestavení platebního řetězce SPAYD
 * @param {Object} payment
 * @param {string} payment.iban - Mezinárodní číslo účtu (např. CZ6508000000192000145399)
 * @param {string|number} [payment.amount] - Částka platby
 * @param {string} [payment.currency='CZK'] - Třímístný kód měny (výchozí CZK)
 * @param {string} [payment.message] - Zpráva pro příjemce (max 60 znaků)
 * @param {string} [payment.vs] - Variabilní symbol (max 10 číslic)
 * @param {string} [payment.ss] - Specifický symbol (max 10 číslic)
 * @param {string} [payment.ks] - Konstantní symbol (max 4 číslice)
 * @param {string} [payment.recipient] - Jméno příjemce (max 35 znaků)
 * @returns {string} SPAYD řetězec začínající SPD*1.0*...
 */
export function generateSpayd(payment) {
  if (!payment || !payment.iban) {
    throw new Error('IBAN je povinný parametr pro vytvoření QR platby.');
  }

  const parts = ['SPD*1.0'];

  // Účet IBAN (povinné)
  const cleanIban = payment.iban.replace(/[\s-]+/g, '').toUpperCase();
  parts.push(`ACC:${cleanIban}`);

  // Částka (volitelné)
  if (payment.amount !== undefined && payment.amount !== null && payment.amount !== '') {
    const formattedAmount = formatAmount(payment.amount);
    parts.push(`AM:${formattedAmount}`);
  }

  // Měna (výchozí CZK)
  const currency = sanitizeValue(payment.currency || 'CZK', 3).toUpperCase();
  parts.push(`CC:${currency}`);

  // Zpráva pro příjemce (max 60 znaků)
  if (payment.message) {
    const msg = sanitizeValue(payment.message, 60);
    if (msg) parts.push(`MSG:${msg}`);
  }

  // Variabilní symbol (max 10 číslic)
  if (payment.vs) {
    const vs = sanitizeValue(payment.vs, 10).replace(/\D/g, '');
    if (vs) parts.push(`X-VS:${vs}`);
  }

  // Specifický symbol (max 10 číslic)
  if (payment.ss) {
    const ss = sanitizeValue(payment.ss, 10).replace(/\D/g, '');
    if (ss) parts.push(`X-SS:${ss}`);
  }

  // Konstantní symbol (max 4 číslice)
  if (payment.ks) {
    const ks = sanitizeValue(payment.ks, 4).replace(/\D/g, '');
    if (ks) parts.push(`X-KS:${ks}`);
  }

  // Jméno příjemce (max 35 znaků)
  if (payment.recipient) {
    const rn = sanitizeValue(payment.recipient, 35);
    if (rn) parts.push(`RN:${rn}`);
  }

  return parts.join('*') + '*';
}
