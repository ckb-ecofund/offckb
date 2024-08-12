import * as path from 'path';
// todo: move some to user settings
// path
export const currentExecPath = process.cwd();

export const packageSrcPath = path.dirname(require.main!.filename);
export const packageRootPath = path.resolve(packageSrcPath, '../');

export const dappTemplatePath = path.resolve(packageRootPath, './templates');
export const targetEnvironmentPath = path.resolve(packageRootPath, './target');
export const predefinedOffCKBConfigTsPath = path.resolve(dappTemplatePath, 'offckb.config.ts');
export const userOffCKBConfigPath = path.resolve(currentExecPath, 'offckb.config.ts');

export const devnetSourcePath = path.resolve(packageRootPath, './ckb/devnet');
export const devnetPath = path.resolve(targetEnvironmentPath, `devnet`);
export const devnetDataPath = path.resolve(devnetPath, `data`);
export const ckbFolderPath = path.resolve(targetEnvironmentPath, 'ckb');
export const ckbBinPath = path.resolve(ckbFolderPath, 'ckb');
export const deployedContractInfoFolderPath = path.resolve(targetEnvironmentPath, 'contracts');

export const accountTargetDir = path.join(packageRootPath, `account`);

// Version
export const minimalRequiredCKBVersion = '0.113.1';
export const defaultLumosVersion = '0.21.0';

// url
export const dappTemplateGitRepoUserAndName = 'RetricSu/offckb';
export const dappTemplateGitUrl = `https://github.com/${dappTemplateGitRepoUserAndName}`;
export const dappTemplateGitBranch = 'develop';
export const dappTemplateGitFolder = 'templates';
