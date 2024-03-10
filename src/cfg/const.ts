import * as path from 'path';

// path
export const currentExecPath = process.cwd();

export const packageSrcPath = path.dirname(require.main!.filename);
export const packageRootPath = path.resolve(packageSrcPath, '../');

export const dappTemplatePath = path.resolve(packageRootPath, './templates');
export const targetEnvironmentPath = path.resolve(packageRootPath, './target');

export const devnetSourcePath = path.resolve(packageRootPath, './ckb/devnet');
export const devnetPath = path.resolve(targetEnvironmentPath, `devnet`);
export const devnetDataPath = path.resolve(devnetPath, `data`);
export const ckbFolderPath = path.resolve(targetEnvironmentPath, 'ckb');
export const ckbBinPath = path.resolve(ckbFolderPath, 'ckb');

export const accountTargetDir = path.join(packageRootPath, `account`);

// Version
export const minimalRequiredCKBVersion = '0.113.1';

// url
export const dappTemplateGitRepo = 'https://github.com/nervosnetwork/docs.nervos.org';
export const dappTemplateGitBranch = 'develop-v2';
export const dappTemplateGitSubfolderName = 'website';
