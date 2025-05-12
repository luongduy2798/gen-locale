import { TEXT } from "./file-init/text.js";
import fs from "fs";
import { Translate } from "@google-cloud/translate/build/src/v2/index.js";
import * as serviceAccount from "./service-account.json" assert { type: "json" };

// Configuration constants
const CONFIG = {
  LANG_KEY: "en", // chọn ngôn ngữ của key, nếu ko muốn thì bỏ rống ""
  IS_KEY_LOWERCASE: false, // nếu muốn viết thường key và cách bởi dấu "_" và bỏ hết kí tự đặc biệt
  IS_GEN_FOR_FLUTTER: false // Output format for Flutter
};

// Utility functions
function removeDuplicates(arr) {
  return [...new Set(arr)];
}

function formatText(text) {
  if (CONFIG.IS_KEY_LOWERCASE) {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s/g, "_");
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Main translation function
async function translateText(text, service) {
  if (CONFIG.LANG_KEY.length > 0) {
    const [translation] = await service.translate(text, CONFIG.LANG_KEY);
    return translation;
  }
  return text.trim();
}

// Process text and generate locale
async function generateLocale() {
  const service = new Translate({
    credentials: serviceAccount.default,
  });

  const listText = removeDuplicates(TEXT.split("\n")).filter(item => item !== "");
  const gen = {};

  await Promise.all(
    listText.map(async (item) => {
      const text = await translateText(item, service);
      let formattedText = formatText(text);
      if (CONFIG.IS_GEN_FOR_FLUTTER && formattedText === "continue") {
        formattedText = "continue_";
      }
      gen[formattedText] = item;
    })
  );

  fs.writeFile(
    `file-init/locale.json`,
    JSON.stringify(gen, null, 2),
    (err) => {
      if (err) console.error("Error writing locale file:", err);
    }
  );
}

// Execute the generation
generateLocale();
