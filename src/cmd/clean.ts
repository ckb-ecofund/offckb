import { devnetDataPath } from '../cfg/const';
import { isFolderExists, removeFolderSync } from '../util';

export function clean() {
  if (isFolderExists(devnetDataPath)) {
    removeFolderSync(devnetDataPath);
    console.log(`Chain data cleaned.`);
  } else {
    console.log(`${devnetDataPath} not found, unable to clean it.`);
  }
}
