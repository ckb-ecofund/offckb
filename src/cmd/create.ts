import path from 'path';
import { currentExecPath, dappTemplateGitBranch, dappTemplateGitFolder, dappTemplateGitUrl } from '../cfg/const';
import { updateVersionInTSFile } from '../util/fs';
import { BareTemplateOption, loadBareTemplateOpts } from '../util/template';
import { gitCloneAndDownloadFolderSync } from '../util/git';
import { select } from '@inquirer/prompts';
const version = require('../../package.json').version;

export async function create(name: string, template: BareTemplateOption) {
  const targetPath = path.resolve(currentExecPath, name);
  const dappTemplateFolderPath = `${dappTemplateGitFolder}/${template.value}`;
  gitCloneAndDownloadFolderSync(dappTemplateGitUrl, dappTemplateGitBranch, dappTemplateFolderPath, targetPath);

  // update the version
  const targetConfigPath = path.resolve(currentExecPath, name, 'offckb.config.ts');
  updateVersionInTSFile(version, targetConfigPath);
}

export async function selectBareTemplate() {
  const opts = await loadBareTemplateOpts();

  const answer = await select({
    message: 'Select a bare template',
    choices: opts.map((opt) => {
      return {
        name: opt.name,
        value: opt.value,
        description: `${opt.description}, \n[${opt.tag.toString()}]`,
      };
    }),
  });

  return opts.find((opt) => opt.value === answer)!;
}
