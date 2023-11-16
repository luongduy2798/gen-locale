import { TEXT } from "./file-init/text.js";
import fs from 'fs';
import { Translate } from '@google-cloud/translate/build/src/v2/index.js';
import * as serviceAccount from './service-account.json' assert { type: "json" };
const LANG_KEY = 'en';

function removeDuplicates(arr) {
  return [...new Set(arr)];
}
const service = new Translate({ projectId: 'myhome-e4c53', credentials: serviceAccount.default });

const listText = removeDuplicates(TEXT.split('\n')).filter((item) => item != '')
const gen = {}
await Promise.all(listText.map(async (item, index) => {
  const [text] = LANG_KEY.length > 0 ? await service.translate(item, LANG_KEY) : [item]
  const newText = text.charAt(0).toUpperCase() + text.slice(1);
  gen[newText] = item
}))
fs.writeFile(`gen/gen.json`, JSON.stringify(gen, null, 2), (err) => { });

