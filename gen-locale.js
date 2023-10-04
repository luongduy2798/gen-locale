import { translate } from '@vitalets/google-translate-api';
import { HttpProxyAgent } from 'http-proxy-agent';
import { TEXT } from "./file-init/text.js";
import fs from 'fs';

function removeDuplicates(arr) {
  return [...new Set(arr)];
}

const listText = removeDuplicates(TEXT.split('\n')).filter((item) => item != '')
const gen = listText.reduce((a, v) => ({ ...a, [v]: v }), {})
fs.writeFile(`gen/gen.json`, JSON.stringify(gen, null, 2), (err) => { });

