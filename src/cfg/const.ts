import * as path from "path";
const currentExecPath = process.cwd();
const packageRootPath = path.dirname(require.main!.filename);

// path
export const devnetSourcePath = path.resolve(packageRootPath, '../docker/devnet');
export const devnetPath = path.resolve(currentExecPath, `target/devnet`);

