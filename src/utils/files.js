/**
 * Souborové operace a ukládání do Downloads
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Získá cestu ke složce Downloads uživatele
 * @returns {string}
 */
export function getDownloadsPath() {
  const downloads = path.join(os.homedir(), 'Downloads');
  if (fs.existsSync(downloads)) {
    return downloads;
  }
  return process.cwd(); // Fallback do aktuální složky
}

/**
 * Uloží soubor do zadané složky
 * @param {string} directory
 * @param {string} filename
 * @param {string|Buffer} content
 * @returns {Promise<string>} Úplná cesta k uloženému souboru
 */
export async function saveFile(directory, filename, content) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const filePath = path.join(directory, filename);
  await fs.promises.writeFile(filePath, content);
  return filePath;
}

/**
 * Vytvoří dočasný soubor pro rychlý náhled
 * @param {string} extension - 'svg' nebo 'jpg'
 * @param {string|Buffer} content
 * @returns {Promise<string>}
 */
export async function createTempPreview(extension, content) {
  const tmpDir = os.tmpdir();
  const tmpPath = path.join(tmpDir, `qr-nahled-${Date.now()}.${extension}`);
  await fs.promises.writeFile(tmpPath, content);
  return tmpPath;
}

/**
 * Otevře soubor ve výchozím systémovém prohlížeči (QuickLook / Preview)
 * @param {string} filePath
 */
export async function openInSystem(filePath) {
  try {
    const platform = process.platform;
    if (platform === 'darwin') {
      await execAsync(`open "${filePath}"`);
    } else if (platform === 'win32') {
      await execAsync(`start "" "${filePath}"`);
    } else {
      await execAsync(`xdg-open "${filePath}"`);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Ukáže soubor přímo ve správci souborů (Finder na macOS)
 * @param {string} filePath
 */
export async function revealInFinder(filePath) {
  try {
    if (process.platform === 'darwin') {
      await execAsync(`open -R "${filePath}"`);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
