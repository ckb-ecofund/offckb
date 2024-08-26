import * as fs from 'fs';
import publicScripts from './public';
import { NetworkSystemScripts } from './type';
import { getSystemScriptsFromListHashes } from '../cmd/system-scripts';
import path from 'path';

export function genSystemScripts(): NetworkSystemScripts | null {
  const devnetScripts = getSystemScriptsFromListHashes();
  if (devnetScripts != null) {
    const networkScripts: NetworkSystemScripts = {
      devnet: devnetScripts,
      testnet: publicScripts.testnet,
      mainnet: publicScripts.mainnet,
    };
    return networkScripts;
  }
  return null;
}

export function genSystemScriptsJsonFile(filePath: string) {
  const scripts = genSystemScripts();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(scripts, null, 2));
}
