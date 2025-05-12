import localeJson from "./file-init/locale.json" assert { type: "json" };
import fs from "fs";
import { Translate } from "@google-cloud/translate/build/src/v2/index.js";
import * as serviceAccount from "./service-account.json" assert { type: "json" };

// Configuration constants
const CONFIG = {
  IS_GEN_FOR_FLUTTER: false,
  TEXT_KEY: "*ANHDUYDEPTRAIVKL*",
  PATH_SAVE: "locale",
  IS_INSERT: true,
  IS_FIRST_CHAR_UPPER_CASE: false,
  BATCH_SIZE: Math.min(200, Object.values(localeJson).length),
  LANGUAGES: [
    "ar", "de", "en", "es", "fr", "id", "ja", "ko", 
    "pt", "ru", "th", "tl", "tr", "vi", "zh-cn", "zh-tw"
  ]
};

// Initialize translation service
const service = new Translate({
  credentials: serviceAccount.default,
});

// Helper functions
function getFileName(lang) {
  if (CONFIG.IS_GEN_FOR_FLUTTER) {
    if (lang === "zh-cn") return `app_zh.arb`;
    if (lang === "zh-tw") return `app_tw.arb`;
    return `app_${lang}.arb`;
  }
  return `${lang}.json`;
}

async function translateBatch(texts, lang) {
  const joinedText = texts
    .join(CONFIG.TEXT_KEY)
    .replaceAll("\n", " ")
    .replaceAll(CONFIG.TEXT_KEY, "\n");
  const [translation] = await service.translate(joinedText, lang);
  return translation.split("\n");
}

async function generateLocaleFile(lang) {
  const translations = [];
  
  for (let i = 0; i < Math.ceil(Object.values(localeJson).length / CONFIG.BATCH_SIZE); i++) {
    const batch = Object.values(localeJson).slice(
      i * CONFIG.BATCH_SIZE,
      (i + 1) * CONFIG.BATCH_SIZE
    );
    const translated = await translateBatch(batch, lang);
    translations.push(...translated);
  }

  const newLocale = Object.keys(localeJson).reduce((acc, key, index) => {
    const value = translations[index];
    acc[key] = CONFIG.IS_FIRST_CHAR_UPPER_CASE ?
      value?.charAt(0).toUpperCase() + value?.slice(1) :
      value;
    return acc;
  }, {});

  const filePath = `${CONFIG.PATH_SAVE}/${getFileName(lang)}`;
  
  if (CONFIG.IS_INSERT) {
    try {
      const existingData = await fs.promises.readFile(filePath, "utf-8");
      const mergedData = { ...JSON.parse(existingData || "{}"), ...newLocale };
      await fs.promises.writeFile(filePath, JSON.stringify(mergedData, null, 2));
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  } else {
    await fs.promises.writeFile(filePath, JSON.stringify(newLocale, null, 2));
  }
}

// Main execution
async function main() {
  await Promise.all(CONFIG.LANGUAGES.map(lang => generateLocaleFile(lang)));
}

main().catch(console.error);
