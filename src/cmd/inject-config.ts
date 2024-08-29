import { copyFileSync } from 'fs';
import { updateOffCKBConfigVersion } from '../util/config';
import { validateTypescriptWorkspace } from '../util/validator';
import path from 'path';
import { genMyScriptsJsonFile, genSystemScriptsJsonFile } from '../scripts/gen';
import { OffCKBConfigFile } from '../template/config';

export function injectConfig() {
  validateTypescriptWorkspace();

  // inject the offckb.config.ts file into users workspace
  // copy config template
  const predefinedOffCKBConfigTsPath = path.resolve('../template', 'offckb.config.ts');
  const userOffCKBConfigPath = path.resolve(process.cwd(), 'offckb.config.ts');
  copyFileSync(predefinedOffCKBConfigTsPath, userOffCKBConfigPath);
  // update the version in the offckb.config.ts
  updateOffCKBConfigVersion(userOffCKBConfigPath);

  const contractInfoFolder = OffCKBConfigFile.readContractInfoFolder(userOffCKBConfigPath);
  if (!contractInfoFolder) {
    throw new Error('No contract info folder found in offckb.config.ts!');
  }

  const systemJsonFilePath = path.resolve(contractInfoFolder, 'system-scripts.json');
  genSystemScriptsJsonFile(systemJsonFilePath);

  const myScriptsJsonFilePath = path.resolve(contractInfoFolder, 'my-scripts.json');
  genMyScriptsJsonFile(myScriptsJsonFilePath);

  console.log(`\n\nAll good. You can now use it in your project like: 
  
  import offCKB from "offckb.config";

  const myScriptCodeHash = offCKB.myScripts['script-name'].codeHash;
  const omnilockScriptCodeHash = offCKB.systemScripts['omnilock'].codeHash;

Check example at https://github.com/nervosnetwork/docs.nervos.org/tree/develop/examples/simple-transfer
  `);
}
