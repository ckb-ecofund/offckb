import * as fs from 'fs';
import publicScripts from './public';
import { NetworkSystemScripts } from './type';
import { getSystemScriptsFromListHashes } from '../cmd/system-scripts';

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

export function genSystemScriptsJsonFile(path: string) {
  const scripts = genSystemScripts();
  fs.writeFileSync(path, JSON.stringify(scripts, null, 2));
}
