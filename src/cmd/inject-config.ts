import { predefinedOffCKBConfigTsPath, userOffCKBConfigPath } from '../cfg/const';
import { copyFileSync } from 'fs';
import { updateOffCKBConfigVersion } from '../util/config';
import { validateTypescriptWorkspace } from '../util/validator';

export function injectConfig() {
  validateTypescriptWorkspace();

  // inject the offckb.config.ts file into users workspace
  // copy config template
  copyFileSync(predefinedOffCKBConfigTsPath, userOffCKBConfigPath);
  // update the version in the offckb.config.ts
  updateOffCKBConfigVersion(userOffCKBConfigPath);

  //todo: update my-scripts.json

  console.log(`\n\nAll good. You can now use it in your project like: 
  
  import offCKB from "offckb.config";

  const myScriptCodeHash = offCKB.myScripts['script-name'].codeHash;
  const omnilockScriptCodeHash = offCKB.systemScripts['omnilock'].codeHash;

Check example at https://github.com/nervosnetwork/docs.nervos.org/tree/develop/examples/simple-transfer
  `);
}
