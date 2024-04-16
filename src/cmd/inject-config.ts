import path from 'path';
import { predefinedOffCKBConfigTsPath, currentExecPath, userOffCKBConfigPath, defaultLumosVersion } from '../cfg/const';
import { execSync } from 'child_process';
import fs, { copyFileSync } from 'fs';
import { buildFullLumosConfig, updateScriptInfoInOffCKBConfigTs } from '../util/config';
import { validateTypescriptWorkspace } from '../util/validator';
import { Network } from '../util/type';

export function injectConfig() {
  const targetPath = currentExecPath;

  validateTypescriptWorkspace();

  // inject the offckb.config.ts file into users workspace
  // copy config template
  copyFileSync(predefinedOffCKBConfigTsPath, targetPath);
  // update the config
  const devnetFullLumosConfig = buildFullLumosConfig(Network.devnet);
  const testnetFullLumosConfig = buildFullLumosConfig(Network.testnet);
  const mainnetFullLumosConfig = buildFullLumosConfig(Network.mainnet);

  updateScriptInfoInOffCKBConfigTs(devnetFullLumosConfig, userOffCKBConfigPath, Network.devnet);
  updateScriptInfoInOffCKBConfigTs(testnetFullLumosConfig, userOffCKBConfigPath, Network.testnet);
  updateScriptInfoInOffCKBConfigTs(mainnetFullLumosConfig, userOffCKBConfigPath, Network.mainnet);
  console.log(`Inject offckb.config.ts file.`);

  // todo: select yarn/npm/pnpm to install the lumos version from user
  const version = readLumosVersionFromOffCKBConfig();
  installLumosPackage(version);
  console.log(`\n\nAll good. You can now use it in your project like: 
  
  import offCKB from "offckb.config";

  const lumosConfig = offCKB.lumosConfig;
  const indexer = offCKB.indexer;
  const rpc = offCKB.rpc;

Check example at https://github.com/nervosnetwork/docs.nervos.org/tree/develop-v2/examples/create-dob
  `);
}

export function readLumosVersionFromOffCKBConfig() {
  const fileContent = fs.readFileSync(userOffCKBConfigPath, 'utf-8');
  const match = fileContent.match(/lumosVersion:\s*['"]([^'"]+)['"]/);
  if (match && match[1]) {
    return match[1];
  } else {
    console.log('lumosVersion value not found in offckb.config.ts', match);
    return defaultLumosVersion;
  }
}

export function installLumosPackage(version: string) {
  // Check if package.json exists
  const packageJsonPath = path.join(currentExecPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found in the current directory');
  }

  const packageLock = path.join(currentExecPath, 'package-lock.json');
  if (fs.existsSync(packageLock)) {
    return execSync(`npm i @ckb-lumos/lumos@${version}`, { stdio: 'inherit' });
  }

  const yarnLock = path.join(currentExecPath, 'yarn.lock');
  if (fs.existsSync(yarnLock)) {
    console.log(`yarn add @ckb-lumos/lumos@${version}`);
    return execSync(`yarn add @ckb-lumos/lumos@${version}`, { stdio: 'inherit' });
  }

  const pnpmLock = path.join(currentExecPath, 'pnpm-lock.json');
  if (fs.existsSync(pnpmLock)) {
    return execSync(`pnpm i @ckb-lumos/lumos@${version}`, { stdio: 'inherit' });
  }

  return execSync(`pnpm i @ckb-lumos/lumos@${version}`, { stdio: 'inherit' });
}
