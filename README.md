<p align="center">
  <img src="static/icon.svg" width="112" alt="Ikona aplikace QR kódy">
</p>

<h1 align="center">QR kódy</h1>

<p align="center">
  Generátor QR kódů a českých plateb přímo v terminálu.<br>
  Kód vytvoříš za pár vteřin a stáhneš rovnou do Downloads.<br>
  <b>Celé zdarma</b>, bez předplatného a bez placené verze.
</p>

<p align="center">
  <a href="#instalace"><b>Nainstalovat příkaz qr</b></a>
</p>

```text
                  ▄▀
  █▀▀█ █▀▀█   █░█ █▀▀█ █▀▀▄ █░█
  █░░█ █▄▄▀   █▀▄ █░░█ █░░█ █▄█
  ▀▀▀█ ▀░▀▀   ▀░▀ ▀▀▀▀ ▀▀▀░ ░▀░

  QR KÓDY CLI • Generátor stylových QR kódů
```

Pro vývojáře, tvůrce, freelancery a každého, kdo potřebuje rychle vytvořit hezký QR kód na web, vstupenky nebo českou platbu bez klikání na pochybných webech plných reklam.

## Zdarma, bez háčku

Online generátory QR kódů většinou chtějí registraci, platbu za vektorové SVG, nutí do odkazů svoje přesměrování a sledování, nebo po měsíci kód zneplatní.
QR kódy běží přímo u tebe v terminálu: žádné předplatné, žádná placená verze, žádné limity a ani účet si nezakládáš.

## Co za tebe vyřeší

- **Kód za pár vteřin.** Napíšeš text nebo webový odkaz, vybereš barvu a hotový kód ti přistane přímo ve složce Downloads.
- **Česká QR Platba bez chyb.** Zadáš číslo účtu a aplikace rovnou zkontroluje kontrolní součet modulo 11 podle vyhlášky ČNB pro předčíslí i samotné číslo účtu. Nestane se, že bys vygeneroval kód s překlepem. Účet automaticky převede na mezinárodní IBAN a sestaví oficiální standard SPAYD pro české bankovnictví.
- **Vlastní barvy a branding.** Můžeš si vybrat z předpřipravených barev nebo zadat libovolný HEX kód své značky. Vygenerovat jde i kód s průhledným pozadím.
- **Popisek s Google Fonts.** Přímo pod QR kód můžeš přidat vystředěný text (třeba *„Odkaz na vstupenky“* nebo *„Platba za oběd“*) v písmu z Google Fonts s plnou podporou české diakritiky. Text je mírně odsazený a automaticky se přizpůsobí šířce kódu, aby nikdy nepřetekl.
- **Hlídá limity i překlepy.** Průběžně vidíš délku v bajtech a zaplnění kapacity QR kódu. U webových odkazů hlídá formát URL a upozorní tě na mezery nebo chybějící protokol.
- **Náhled před uložením.** Kód vidíš přímo v terminálu v barvách brandingu a jedním stiskem si můžeš otevřít systémový QuickLook na Macu ještě před potvrzením.
- **SVG i ostré JPG pro tisk.** Uložíš si vektorové SVG pro web a grafiky nebo 300 DPI JPG ve vysokém rozlišení (1800×1800 px) připravené pro tisk na plakáty a letáky.

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

1. **Typ kódu** – Vybereš, jestli tvoříš webový odkaz / běžný text, nebo českou QR Platbu.
2. **Zadání údajů** – U platby zadáš číslo účtu (např. `19-2000145399/0800`), částku a volitelná pole (zpráva, variabilní symbol...). Pole, která nechceš vyplňovat, jednoduše přeskočíš klávesou Enter.
3. **Vzhled a barva** – Vybereš si barvu z nabídky nebo napíšeš vlastní HEX kód.
4. **Popisek pod kódem** – Volitelně napíšeš text a vybereš Google Font (*Poppins, Inter, Montserrat...*).
5. **Export** – Zkontroluješ náhled a vybereš SVG, JPG nebo obojí. Soubor se uloží do složky Downloads s orientačním názvem (např. `qr-platba-1500czk-2026-10-20.svg`).

## Tvoje data

Všechno běží jen u tebe v počítači. Čísla účtů, zprávy ani generované odkazy se nikam neposílají.
QR kódy nemají žádný účet, žádné prostředníky ani sledování. Na internet se aplikace zeptá jen Google Fonts, pokud zvolíš generování JPG s vlastním fontem, aby si stáhla řez písma pro vykreslení.

## Pro vývojáře

Jak spustit testy a ověřit kód:

```bash
# Spuštění testů (kontrola modulo 11, IBAN, SPAYD, generátor)
npm test

# Spuštění přímo ze zdrojových souborů
node bin/qr.js
```

Licence [MIT](LICENSE).
