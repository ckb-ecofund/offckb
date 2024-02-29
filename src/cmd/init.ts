import { currentExecPath, dappTemplatePath } from '../cfg/const';
import path from 'path';
import { copyFolderSync } from '../util';

export function init(name: string, template: string) {
  const targetPath = path.resolve(currentExecPath, name);
  const sourcePath = path.resolve(dappTemplatePath, template);
  copyFolderSync(sourcePath, targetPath);
  console.log(`init CKB dapp project: ${targetPath}`);
}
