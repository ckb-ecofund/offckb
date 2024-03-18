import {
  currentExecPath,
  dappTemplateGitBranch,
  dappTemplateGitUrl,
  dappTemplateGitFolder,
  dappTemplatePath,
} from '../cfg/const';
import path from 'path';
import { copyFileSync, gitCloneAndDownloadFolderSync } from '../util';
import select from '@inquirer/select';
import { loadTemplateOpts } from '../util';

export function init(name: string, template: string) {
  const targetPath = path.resolve(currentExecPath, name);
  const dappTemplateFolderPath = `${dappTemplateGitFolder}/${template}`;
  gitCloneAndDownloadFolderSync(dappTemplateGitUrl, dappTemplateGitBranch, dappTemplateFolderPath, targetPath);

  // add some common code files
  const ckbDotTs = path.resolve(dappTemplatePath, 'ckb.ts');
  const configJson = path.resolve(dappTemplatePath, 'config.json');
  copyFileSync(ckbDotTs, targetPath);
  copyFileSync(configJson, targetPath);

  console.log(`init CKB dapp project: ${targetPath}`);
}

export async function selectTemplate() {
  const opts = await loadTemplateOpts();
  const answer = await select({
    message: 'Select a Dapp template',
    choices: opts,
  });

  return answer as string;
}
