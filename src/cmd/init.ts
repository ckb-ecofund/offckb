import { currentExecPath, dappTemplatePath } from '../cfg/const';
import path from 'path';
import { copyFolderSync } from '../util';

export function init(name: string) {
  const targetPath = path.resolve(currentExecPath, name);
  copyFolderSync(dappTemplatePath, targetPath)
  console.log(`init CKB dapp project with lumos: ${targetPath}`);
}
