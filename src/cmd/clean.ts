import { devnetDataPath } from '../cfg/const';
import { isFolderExists, removeFolderSync } from '../util';

export function clean() {
  if (isFolderExists(devnetDataPath)) {
    try {
      removeFolderSync(devnetDataPath);
      console.log(`Chain data cleaned.`);
    } catch (error: unknown) {
      console.log(`Did you stop running the chain first?`);
      console.log((error as Error).message);
    }
  } else {
    console.log(`${devnetDataPath} not found, unable to clean it.`);
  }
}
