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

export const accountTargetDir = path.join(packageRootPath, `account`);

// Version
export const defaultLumosVersion = '0.21.0';
