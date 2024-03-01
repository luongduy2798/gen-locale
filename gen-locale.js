import { TEXT } from "./file-init/text.js";
import fs from "fs";
import { Translate } from "@google-cloud/translate/build/src/v2/index.js";
import * as serviceAccount from "./service-account.json" ;
const LANG_KEY = "en"; // chọn ngôn ngữ của key, nếu ko muốn thì bỏ rống ""
const isKeyLowerCase = true; // nếu muốn viết thường key và cách bởi dấu "_" và bỏ hết kí tự đặc biệt
const isGenForFlutter = true;

function removeDuplicates(arr) {
  return [...new Set(arr)];
}
const service = new Translate({
  projectId: "myhome-e4c53",
  credentials: serviceAccount.default,
});

const listText = removeDuplicates(TEXT.split("\n")).filter(
  (item) => item != ""
);
const gen = {};
await Promise.all(
  listText.map(async (item, index) => {
    const [text] =
      LANG_KEY.length > 0
        ? await service.translate(item, LANG_KEY)
        : [item.trim()];
    let newText = isKeyLowerCase
      ? text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .replace(/\s/g, "_")
      : text.charAt(0).toUpperCase() + text.slice(1);
    if (isGenForFlutter && newText === "continue") newText = "continue_";
    gen[newText] = item;
  })
);
fs.writeFile(
  `file-init/locale.json`,
  JSON.stringify(gen, null, 2),
  (err) => {}
);