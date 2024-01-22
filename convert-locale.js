import localeJson from "./file-init/locale.json";
import fs from 'fs';
import { Translate } from '@google-cloud/translate/build/src/v2/index.js';
import * as serviceAccount from './service-account.json';

const TEXT_KEY = '*ANHDUYDEPTRAIVKL*'
const lang = ['ar', 'de', 'en', 'es', 'fr', 'id', 'ja', 'ko', 'pt', 'ru', 'th', 'tl', 'tr', 'vi', 'zh-cn', 'zh-tw']
const service = new Translate({ projectId: 'myhome-e4c53', credentials: serviceAccount.default });
const LENGTH = Object.values(localeJson).length > 200 ? 200 : Object.values(localeJson).length // dịch 200 field 1 lần, nếu lỗi thì giảm giá trị này đi cho đến khi thoả mãn

const genLocale = async (lang) => {
  let textTrans = ''
  for (let index = 0; index < Math.round(Object.values(localeJson).length / LENGTH); index++) {
    const element = Object.values(localeJson).slice(LENGTH * index, LENGTH * (index + 1))
    const newString = element.join(TEXT_KEY).replaceAll('\n', ' ').replaceAll(TEXT_KEY, '\n')
    const [text] = await service.translate(newString, lang);
    textTrans += text + '\n'
  }
  const listTextTrans = textTrans.split('\n')
  for (let index = 0; index < Object.keys(localeJson).length; index++) {
    const element = Object.keys(localeJson)[index];
    localeJson[`${element}`] = listTextTrans[index]?.charAt(0).toUpperCase() + listTextTrans[index]?.slice(1);
  }
  fs.writeFile(`locale/${lang}.json`, JSON.stringify(localeJson, null, 2), (err) => { });
}

for (let index = 0; index < lang.length; index++) {
  const element = lang[index];
  genLocale(element)
}