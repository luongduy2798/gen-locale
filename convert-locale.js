import localeJson from "./file-init/locale.json" assert { type: "json" };
import fs from "fs";
import { Translate } from "@google-cloud/translate/build/src/v2/index.js";
import * as serviceAccount from "./service-account.json" assert { type: "json" };

const isGenForFlutter = true; // nếu muốn gen cho flutter (nếu muốn gen cho js thì đổi thành false)
const TEXT_KEY = "*ANHDUYDEPTRAIVKL*";
const PATH_SAVE = "/Users/luongnhatduy/Desktop/twa-pmf-mobile-flutter/lib/l10n";
// const PATH_SAVE = "locale"; // thư mục locale của project này
const isInsert = true; // chèn data dịch mới vào file có sẵn (nếu muốn thay thế thì đổi thành false)
const isFirstCharUpperCase = false;
const LENGTH =
  Object.values(localeJson).length > 200
    ? 200
    : Object.values(localeJson).length; // dịch 200 field 1 lần, nếu lỗi thì giảm giá trị này đi cho đến khi thoả mãn

const lang = [
  "ar",
  "de",
  "en",
  "es",
  "fr",
  "id",
  "ja",
  "ko",
  "pt",
  "ru",
  "th",
  "tl",
  "tr",
  "vi",
  "zh-cn",
  "zh-tw",
];
const service = new Translate({
  projectId: "myhome-e4c53",
  credentials: serviceAccount.default,
});

const getFileNameGen = (lang) => {
  if (isGenForFlutter) {
    if (lang === "zh-cn") return `app_zh.arb`;
    if (lang === "zh-tw") return `app_tw.arb`;
    return `app_${lang}.arb`;
  }
  return `${lang}.json`;
};

const genLocale = async (lang) => {
  let textTrans = "";
  for (
    let index = 0;
    index < Math.round(Object.values(localeJson).length / LENGTH);
    index++
  ) {
    const element = Object.values(localeJson).slice(
      LENGTH * index,
      LENGTH * (index + 1)
    );
    const newString = element
      .join(TEXT_KEY)
      .replaceAll("\n", " ")
      .replaceAll(TEXT_KEY, "\n");
    const [text] = await service.translate(newString, lang);
    textTrans += text + "\n";
  }
  const listTextTrans = textTrans.split("\n");
  const newLocaleJson = {};
  for (let index = 0; index < Object.keys(localeJson).length; index++) {
    const element = Object.keys(localeJson)[index];
    newLocaleJson[`${element}`] = isFirstCharUpperCase ?
      listTextTrans[index]?.charAt(0).toUpperCase() +
      listTextTrans[index]?.slice(1) : listTextTrans[index];
  }

  if (isInsert) {
    fs.readFile(
      `${PATH_SAVE}/${getFileNameGen(lang)}`,
      "utf-8",
      (err, data) => {
        try {
          const jsonDataRoot = JSON.parse(data || "{}");
          var obj = { ...jsonDataRoot, ...newLocaleJson };
          fs.writeFile(
            `${PATH_SAVE}/${getFileNameGen(lang)}`,
            JSON.stringify(obj, null, 2),
            (err) => {}
          );
        } catch (error) {
          console.log(getFileNameGen(lang), error);
        }
      }
    );
  } else {
    fs.writeFile(
      `${PATH_SAVE}/${getFileNameGen(lang)}`,
      JSON.stringify(newLocaleJson, null, 2),
      (err) => {}
    );
  }
};

for (let index = 0; index < lang.length; index++) {
  const element = lang[index];
  genLocale(element);
}
