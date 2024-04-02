import path from 'path';
import { predefinedOffCKBConfigTsPath, currentExecPath, Network } from '../cfg/const';
import {
  buildFullLumosConfig,
  copyFileSync,
  updateScriptInfoInOffCKBConfigTs,
  validateTypescriptWorkspace,
} from '../util';

export function injectConfig() {
  const targetPath = currentExecPath;

  validateTypescriptWorkspace();

  // inject the offckb.config.ts file into users workspace
  copyFileSync(predefinedOffCKBConfigTsPath, targetPath);
  const userFilePath = path.resolve(targetPath, 'offckb.config.ts');
  const fullLumosConfig = buildFullLumosConfig(Network.devnet);
  updateScriptInfoInOffCKBConfigTs(fullLumosConfig, userFilePath, Network.devnet);

  // todo: select yarn/npm/pnpm to install the lumos version from user
}
