import {
  currentExecPath,
  dappTemplateGitBranch,
  dappTemplateGitUrl,
  dappTemplateGitFolder,
  dappTemplatePath,
} from '../cfg/const';
import path from 'path';
import select from '@inquirer/select';
import { TemplateOption, loadTemplateOpts } from '../util/template';
import { copyFileSync, updateVersionInTSFile } from '../util/fs';
import { gitCloneAndDownloadFolderSync } from '../util/git';
const version = require('../../package.json').version;

export function init(name: string, template: TemplateOption) {
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

export async function initBare(name: string) {
  const opts = await loadTemplateOpts();
  const bareTemplateOpt = opts.find((opt) => opt.type === 'template');
  if (!bareTemplateOpt) throw new Error('no valid bare template option!');

  init(name, bareTemplateOpt);

  // update the version
  const targetPath = path.resolve(currentExecPath, name, 'offckb.config.ts');
  updateVersionInTSFile(version, targetPath);
}

export async function selectTemplate() {
  const opts = await loadTemplateOpts();

  const answer = await select({
    message: 'Select a Dapp template',
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
