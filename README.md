<p align="center">
  <img src="static/icon.svg" width="112" alt="Ikona aplikace QR kódy">
</p>

<h1 align="center">QR kódy</h1>

<p align="center">
  CLI nástroj pro vývojáře na generování QR kódů a českých plateb.<br>
  Vektorové SVG i tiskové JPG vygeneruješ za pár vteřin přímo do Downloads.<br>
  <b>Open-source</b>, bez registrací, bez reklam a bez prostředníků.
</p>

<p align="center">
  <a href="#instalace"><b>Nainstalovat příkaz qr</b></a>
</p>

## Proč CLI a ne webový generátor

Většina online generátorů QR kódů vyžaduje registraci, platbu za vektorové SVG, cpe do odkazů vlastní redirect domény se sledováním nebo po měsíci kód zneplatní.
QR kódy běží lokálně v terminálu: vygenerují čisté SVG nebo 300 DPI JPG přímo ze zadaných dat. Žádné přesměrování, žádná telemetrie a žádné závislosti na cizím cloudu.

## Co za tebe vyřeší

- **Příkaz `qr` po ruce.** Žádné přepínání do prohlížeče. Napíšeš text nebo webovou adresu, vybereš barvu a hotový soubor máš hned v `~/Downloads`.
- **Česká QR Platba (SPAYD) s validací.** Zadáte číslo účtu a aplikace okamžitě zkontroluje kontrolní součet modulo 11 podle vyhlášky ČNB pro předčíslí i samotný účet. Nestane se, že bys vygeneroval platební kód s překlepem. Účet automaticky převede na mezinárodní IBAN a sestaví oficiální standard SPAYD pro české bankovnictví.
- **Vlastní barvy a branding.** Vybereš si z přednastavených palet nebo zadáš libovolný HEX kód své značky. Umí i průhledné pozadí, když kód dáváš do grafických podkladů.
- **Popisek s Google Fonts.** Přímo pod QR kód můžeš přidat vystředěný text (třeba _„Odkaz na vstupenky“_ nebo _„Platba za kávu“_) v písmu z Google Fonts s plnou podporou české diakritiky. Text je proporčně škálovaný k šířce kódu, aby nikdy nepřetekl.
- **Hlídání limitů matrice i překlepů.** Průběžně vidíš délku v bajtech a procentuální zaplnění kapacity QR matrice. U URL zkontroluje formát a upozorní tě na mezery nebo chybějící protokol.
- **ANSI náhled v terminálu i QuickLook.** Kód vidíš přímo v konzoli v barvách brandingu a jedním stiskem si můžeš otevřít systémový QuickLook na Macu ještě před uložením.
- **Vektorové SVG i 300 DPI JPG pro tisk.** Uložíš si čisté SVG pro web a grafiky nebo rastrové JPG ve vysokém rozlišení (1800×1800 px) připravené pro tisk.

## Instalace

Potřebuješ Node.js verze 18 nebo novější.

1. Naklonuj repozitář a nainstaluj závislosti:
   ```bash
   git clone https://github.com/davidmalasek/qr-kody.git
   cd qr-kody
   npm install
   ```
2. Propoj příkaz do systému:
   ```bash
   npm link
   ```
3. Otevři terminál a napiš:
   ```bash
   qr
   ```

Aplikace se spustí a rovnou tě provede vytvořením kódu.

## Jak se používá

Aplikace se ovládá šipkami `↑` / `↓` a textovým vstupem podobně jako Claude Code CLI.

1. **Typ kódu** – Zvolíš, jestli tvoříš webový odkaz / text, nebo českou QR Platbu.
2. **Zadání údajů** – U platby zadáš číslo účtu (např. `19-2000145399/0800`), částku a volitelná pole (zpráva, variabilní symbol...). Pole, která nechceš vyplňovat, jednoduše přeskočíš klávesou Enter.
3. **Vzhled a barva** – Vybereš barvu z nabídky nebo napíšeš vlastní HEX kód.
4. **Popisek pod kódem** – Volitelně napíšeš text a vybereš Google Font (_Poppins, Inter, Montserrat..._).
5. **Export** – Zkontroluješ náhled a vybereš SVG, JPG nebo obojí. Soubor se uloží do složky Downloads s přehledným názvem (např. `qr-platba-1500czk-2026-10-20.svg`).

## Tvoje data

Všechno běží offline u tebe na stroji. Čísla účtů, platební údaje ani URL se nikam neposílají.
Aplikace nemá žádný tracking ani telemetrii. Na internet se obrátí jen v případě generování JPG s Google Fonts, kdy si Sharp stáhne příslušný font pro vykreslení.

## Pro vývojáře

Jak spustit testy a ověřit kód:

```bash
# Spuštění testů (kontrola modulo 11, IBAN, SPAYD, generátor)
npm test

# Spuštění přímo ze zdrojových souborů
node bin/qr.js
```

Licence [MIT](LICENSE).
