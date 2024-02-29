import { currentExecPath, dappTemplatePath } from '../cfg/const';
import path from 'path';
import { copyFileSync, copyFolderSync } from '../util';

export function init(name: string, template: string) {
  const targetPath = path.resolve(currentExecPath, name);
  const sourcePath = path.resolve(dappTemplatePath, template);
  copyFolderSync(sourcePath, targetPath);

  // add some common code files
  const ckbDotTs = path.resolve(dappTemplatePath, 'ckb.ts');
  const configJson = path.resolve(dappTemplatePath, 'config.json');
  copyFileSync(ckbDotTs, targetPath);
  copyFileSync(configJson, targetPath);

  console.log(`init CKB dapp project: ${targetPath}`);
}
