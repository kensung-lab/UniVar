import * as fs from 'fs';
import 'dotenv/config';
import { Converter } from './interfaces/converter.js';
import { HPOFile } from './interfaces/hpo-files.js';
import { UniVarConverter } from './converters/univar-converter.js';
import { exit } from 'process';
// default path
const DEFAULT_DATA_PATH = './data/';
const DEFAULT_FILE_NAME = 'hp.json';
const DEFAULT_CONVERTER = 'UNIVAR';

const main = async () => {
  const dataPath = process.env.DATA_PATH ? process.env.DATA_PATH : DEFAULT_DATA_PATH;
  const fileName = process.env.FILE_NAME ? process.env.FILE_NAME : DEFAULT_FILE_NAME;
  const converterString = process.env.CONVERTER ? process.env.CONVERTER : DEFAULT_CONVERTER; 

  const jsonData = fs.readFileSync(dataPath + fileName, 'utf8');
  const jsonObj = JSON.parse(jsonData); // string to "any" object first
  const hpoFile = jsonObj as HPOFile;

  let converter: Converter;
  switch(converterString) {
    case 'UNIVAR':
      converter = new UniVarConverter(hpoFile);
      break;
    default:
      converter = new UniVarConverter(hpoFile);
  }

  await converter.convert();
}

main().then(() => {
  console.log('compelete convert');
  exit();
});