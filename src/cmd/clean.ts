import fs from 'fs';
import { isFolderExists } from '../util/fs';
import { settings } from '../cfg/setting';

export function clean() {
  const devnetDataPath = settings.devnet.dataPath;
  if (isFolderExists(devnetDataPath)) {
    try {
      fs.rmSync(devnetDataPath, { recursive: true });
      console.log(`Chain data cleaned.`);
      // todo: rm deploy info too
    } catch (error: unknown) {
      console.log(`Did you stop running the chain first?`);
      console.log((error as Error).message);
    }
  } else {
    console.log(`${devnetDataPath} not found, unable to clean it.`);
  }
}
