import * as path from "path";

// path
export const currentExecPath = process.cwd();
export const packageSrcPath = path.dirname(require.main!.filename);

export const packageRootPath = path.resolve(packageSrcPath, '../');
export const dappTemplatePath = path.resolve(packageRootPath, './template');
export const devnetSourcePath = path.resolve(packageSrcPath, '../docker/devnet');
export const devnetPath = path.resolve(currentExecPath, `target/devnet`);








