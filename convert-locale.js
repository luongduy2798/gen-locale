import { translate } from '@vitalets/google-translate-api';
import { HttpProxyAgent } from 'http-proxy-agent';
import localeJson from "./file-init/locale.json" assert { type: "json" };
import fs from 'fs';
const TEXT_KEY = '*ANHDUYDEPTRAIVKL*'
const agent = new HttpProxyAgent('http://163.53.18.119:80');
const lang = ['ar', 'de', 'en', 'es', 'fr', 'id', 'ja', 'ko', 'pt', 'ru', 'th', 'tl', 'tr', 'vi', 'zh-cn', 'zh-tw']

const genLocale = async (lang) => {
  const newString = Object.values(localeJson).join(TEXT_KEY).replaceAll('\n', ' ').replaceAll(TEXT_KEY, '\n')
  const { text } = await translate(newString, {
    to: lang,
    fetchOptions: { agent }
  });
  const listTextTrans = text.split('\n')
  for (let index = 0; index < Object.keys(localeJson).length; index++) {
    const element = Object.keys(localeJson)[index];
    localeJson[`${element}`] = listTextTrans[index]
  }
  fs.writeFile(`locale/${lang}.json`, JSON.stringify(localeJson, null, 2), (err) => { });
}

for (let index = 0; index < lang.length; index++) {
  const element = lang[index];
  genLocale(element)
}