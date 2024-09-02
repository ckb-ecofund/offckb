import fs from 'fs';
import { isFolderExists } from '../util/fs';
import { readSettings } from '../cfg/setting';

export function clean() {
  const settings = readSettings();
  const allDevnetDataPath = settings.devnet.configPath;
  // this is the root folder of devnet, it contains config, data, debugFullTransactions, transactions, failed-transactions, contracts
  if (isFolderExists(allDevnetDataPath)) {
    try {
      fs.rmSync(allDevnetDataPath, { recursive: true });
      console.log(`Chain data cleaned.`);
    } catch (error: unknown) {
      console.log(`Did you stop running the chain first?`);
      console.log((error as Error).message);
    }
  } else {
    console.log(`${allDevnetDataPath} not found, unable to clean it.`);
  }
}
