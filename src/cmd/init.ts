import {
  currentExecPath,
  dappTemplateGitBranch,
  dappTemplateGitUrl,
  dappTemplateGitFolder,
  dappTemplatePath,
} from '../cfg/const';
import path from 'path';
import select from '@inquirer/select';
import { TutorialOption, loadTutorialOpts } from '../util/template';
import { copyFileSync } from '../util/fs';
import { gitCloneAndDownloadFolderSync } from '../util/git';

export function init(name: string, template: TutorialOption) {
  const targetPath = path.resolve(currentExecPath, name);
  const dappTemplateFolderPath = `${dappTemplateGitFolder}/${template.value}`;
  gitCloneAndDownloadFolderSync(dappTemplateGitUrl, dappTemplateGitBranch, dappTemplateFolderPath, targetPath);

  // add some common code files
  const ckbDotTs = path.resolve(dappTemplatePath, 'ckb.ts');
  const configJson = path.resolve(dappTemplatePath, 'config.json');
  copyFileSync(ckbDotTs, targetPath);
  copyFileSync(configJson, targetPath);

  console.log(`init CKB dapp project: ${targetPath}`);
}

export async function selectTemplate() {
  const opts = await loadTutorialOpts();

  const answer = await select({
    message: 'Select an example dApp',
    choices: opts.map((opt) => {
      return {
        name: opt.name,
        value: opt.value,
        description: opt.description,
      };
    }),
  });

  return opts.find((opt) => opt.value === answer)!;
}
