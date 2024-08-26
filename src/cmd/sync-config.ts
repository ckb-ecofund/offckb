import path from 'path';
import { userOffCKBConfigPath } from '../cfg/const';
import { readContractInfoFolderFromOffCKBConfig } from '../util/fs';
import { validateExecDappEnvironment } from '../util/validator';
import { genMyScriptsJsonFile, genSystemScriptsJsonFile } from '../scripts/gen';

export function syncConfig() {
  validateExecDappEnvironment();

  const contractInfoFolder = readContractInfoFolderFromOffCKBConfig(userOffCKBConfigPath);
  if (!contractInfoFolder) {
    throw new Error('No contract info folder found in offckb.config.ts!');
  }

  const systemJsonFilePath = path.resolve(contractInfoFolder, 'system-scripts.json');
  genSystemScriptsJsonFile(systemJsonFilePath);

  const myScriptsJsonFilePath = path.resolve(contractInfoFolder, 'my-scripts.json');
  genMyScriptsJsonFile(myScriptsJsonFilePath);

  console.log('scripts json config updated.');
}
