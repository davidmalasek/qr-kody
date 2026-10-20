# 📱 QR Kódy CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-emerald.svg)](https://nodejs.org/)
[![CLI: qr](https://img.shields.io/badge/Příkaz-qr-sky.svg)](#instalace-a-spuštění)

> Moderní, minimalistická a stylová aplikace pro terminál pro generování běžných QR kódů a českých QR plateb s vlastním brandingem a Google Fonts typografií.

Inspirováno rozhraním nástrojů jako **Claude Code CLI** – ovládá se jednoduše šipkami (`↑`/`↓`) a textovými vstupy, nabízí živý náhled přímo v konzoli a ukládá soubory přehledně do složky `Downloads`.

---

```text
  █▀▀█ █▀▀█   █░█ █▀▀█ █▀▀▄ █░█
  █░░█ █▄▄▀   █▀▄ █░░█ █░░█ █▄█
  ▀▀▀█ ▀░▀▀   ▀░▀ ▀▀▀▀ ▀▀▀░ ░▀░

  QR KÓDY CLI • Generátor stylových QR kódů
```

---

## ✨ Klíčové vlastnosti

- 💳 **QR Platba dle standardu ČBA (SPAYD)**
  - Podpora českého formátu účtu `[předčíslí-]číslo/kód_banky` i přímého `IBAN`.
  - **Matematická kontrola modulo 11** dle vyhlášky České národní banky pro předčíslí i číslo účtu (okamžitě odhalí překlepy).
  - Automatický převod na mezinárodní **IBAN** a sestavení oficiálního formátu `SPD*1.0*...`.
  - Volitelná pole: částka, měna (CZK/EUR/USD), zpráva pro příjemce, variabilní symbol, konstantní symbol, specifický symbol, jméno příjemce.
  - Všechna volitelná pole lze jednoduše přeskočit stiskem <kbd>Enter</kbd>.

- 🔗 **Webové odkazy a texty**
  - Inteligentní validace URL (kontrola protokolu, formátu domény a překlepů/mezer).
  - Automatické doporučení protokolu `https://` pro bezproblémové skenování mobilním fotoaparátem.

- 📊 **Hlídání limitů a kapacity QR kódu**
  - Živé zobrazení počtu znaků, délky v bajtech a procentuálního vytížení kapacity QR kódu.
  - Varování před překročením limitu matrice QR kódu.

- 🎨 **Jednoduchý branding (HEX barvy)**
  - Výběr z přednastavených moderních palet (Půlnoční modrá, Indigo, Smaragdová, Karmínová, Fialová...) nebo zadání libovolného vlastního **HEX kódu** (např. `#1E40AF`).
  - Volba barvy pozadí včetně transparentního pozadí pro grafiky a designéry.

- 🔤 **Doprovodný text & Google Fonts**
  - Možnost doplnit pod QR kód vystředěný popisek (např. *"Odkaz na vstupenky"*, *"Platba za oběd"*).
  - Výběr z oblíbených **Google Fonts** s plnou podporou české diakritiky (*Inter, Roboto, Montserrat, Poppins, Open Sans, Plus Jakarta Sans, Lato, Playfair Display, Oswald, Fira Code, Raleway*) nebo zadání vlastního Google Fontu.
  - Text je mírně odsazen od spodního okraje a automaticky proporčně přizpůsoben šířce kódu, aby nikdy nepřetekl.

- 👁️ **Živý náhled před uložením**
  - **Terminálový ANSI náhled** vykreslený v reálných barvách zvoleného brandingu.
  - Možnost **otevřít rychlý náhled v systému** (QuickLook na macOS) jedním klikem před finálním potvrzením uložení.

- 💾 **Export do složky Downloads**
  - Možnost volby formátu: **vektorové SVG**, **rastrové JPG** (vysoké rozlišení 1800×1800 px s 300 DPI pro tisk) nebo **obojí současně**.
  - Inteligentní orientační pojmenování souborů (např. `qr-platba-1500czk-2026-10-20.svg` nebo `qr-vstupenky-2026-10-20.jpg`).
  - Ochrana proti nechtěnému přepsání existujících souborů (automatické číslování `-1`, `-2`).

---

## 🚀 Instalace a spuštění

### Globální spuštění přes příkaz `qr` (doporučeno)

Přímo v adresáři projektu propojte příkaz do systému:

```bash
npm link
```

Nyní můžete aplikaci kdykoliv spustit odkudkoliv z terminálu jednoduchým příkazem:

```bash
qr
```

### Lokální spuštění bez instalace

```bash
git clone https://github.com/davidmalasek/qr-kody.git
cd qr-kody
npm install
npm start
```

---

## 🖥️ Ukázka použití

Po spuštění příkazu `qr` vás aplikace provede několika intuitivními kroky:

### 1. Výběr typu
```text
? Co si přejete vygenerovat?
❯ 🔗 Běžný text nebo webový odkaz (URL)
  💳 Platební QR kód (český standard QR Platba / SPAYD)
```

### 2. Zadání údajů
- **Pro platbu:** Zadáte číslo účtu (např. `19-2000145399/0800`). Aplikace zkontroluje modulo 11 ČNB a vypíše banku. Následně zadáte částku a případné symboly (nebo přeskočíte stiskem <kbd>Enter</kbd>).
- **Pro odkaz:** Zadáte URL (např. `vstupenky.cz`), aplikace případně doplní `https://` a spočítá zaplnění QR kódu.

### 3. Vzhled a branding
```text
? Vyberte barvu QR kódu (branding):
  ⬛ Černá #000000
❯ 🟣 Indigo #4F46E5
  🟢 Zelená #059669
  🎨 Zadat vlastní HEX...
```

### 4. Text a Google Fonts
```text
? Text pod QR kód [Enter pro žádný text]: Odkaz na vstupenky
? Vyberte typ písma z Google Fonts:
❯ Poppins - Přátelský, zaoblený geometrický sans
  Inter - Moderní, minimalistický a skvěle čitelný sans-serif
  Montserrat - Výrazný geometrický styl vhodný pro nadpisy a plakáty
```

### 5. Náhled a export
V terminálu se vykreslí ANSI náhled a aplikace nabídne uložení do `~/Downloads` ve formátu **SVG**, **JPG** nebo **obojí**.

---

## 📁 Struktura projektu

```text
qr-kody/
├── bin/
│   └── qr.js              # Spustitelný skript pro terminál (#!/usr/bin/env node)
├── src/
│   ├── index.js           # Hlavní CLI orchestrátor s @inquirer/prompts
│   ├── core/
│   │   ├── bank.js        # Modulo 11 ČNB validátor, číselník bank a převod na IBAN
│   │   ├── spayd.js       # Sestavení řetězce QR Platby dle standardu ČBA
│   │   ├── limits.js      # Kontrola limitů kapacity QR a validace URL
│   │   ├── fonts.js       # Google Fonts definice a integrace
│   │   └── generator.js   # Generátor SVG a 300 DPI JPG (pomocí Sharp)
│   ├── ui/
│   │   ├── banner.js      # Claude Code styl banner, rámečky a karty
│   │   ├── colors.js      # Palety a práce s HEX barvami
│   │   └── terminal-qr.js # Vykreslení QR kódu v terminálu pomocí ANSI polobloků
│   └── utils/
│       ├── filename.js    # Inteligentní pojmenování orientačních názvů souborů
│       └── files.js       # Ukládání do Downloads a interakce se systémem
├── test/
│   └── core.test.js       # Komplexní unit testy (banka, SPAYD, limity, grafika)
├── package.json
├── LICENSE                # MIT Licence
└── README.md
```

---

## 🧪 Testy

Aplikace obsahuje sadu unit testů postavenou na nativním Node.js test runneru:

```bash
npm test
```

Výstup testů ověřuje správnost kontrolních součtů modulo 11 ČNB, výpočet IBANu, sestavení SPAYD řetězce, validaci URL a generování SVG/JPG.

---

## 📄 Licence

Tento projekt je open source pod licencí [MIT](LICENSE).

Autor: **[David Malášek](https://github.com/davidmalasek)** (<davidmalasek@post.cz>)
