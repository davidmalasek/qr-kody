/**
 * Modul pro Google Fonts integraci a výběr typografie
 */

export const POPULAR_GOOGLE_FONTS = [
  { name: 'Inter', description: 'Moderní, minimalistický a skvěle čitelný sans-serif' },
  { name: 'Roboto', description: 'Klasický univerzální Google font' },
  { name: 'Montserrat', description: 'Výrazný geometrický styl vhodný pro nadpisy a plakáty' },
  { name: 'Poppins', description: 'Přátelský, zaoblený geometrický sans' },
  { name: 'Open Sans', description: 'Čistý, neutrální a vysoce čitelný' },
  { name: 'Plus Jakarta Sans', description: 'Prémiový moderní font pro tech a startupy' },
  { name: 'Lato', description: 'Teplý a elegantní sans-serif' },
  { name: 'Playfair Display', description: 'Luxusní serif s patkami (vhodný pro prémiové akce)' },
  { name: 'Oswald', description: 'Kondenzovaný, úzký výrazný styl' },
  { name: 'Fira Code', description: 'Technický monospaced font s programátorským duchem' },
  { name: 'Raleway', description: 'Stylový, lehký a elegantní font' },
];

/**
 * Získá CSS definici a Google Fonts import pro zadané jméno fontu
 * @param {string} fontName - Název fontu (např. "Poppins")
 * @returns {{ name: string, importUrl: string, fontFamily: string }}
 */
export function getFontDefinition(fontName = 'Inter') {
  const cleanName = (fontName || 'Inter').trim();
  const encodedName = encodeURIComponent(cleanName).replace(/%20/g, '+');

  return {
    name: cleanName,
    importUrl: `https://fonts.googleapis.com/css2?family=${encodedName}:wght@500;600;700&amp;display=swap`,
    fontFamily: `'${cleanName}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
  };
}
