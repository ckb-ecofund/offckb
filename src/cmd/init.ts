import { execSync } from "child_process";
import { currentExecPath, dappTemplatePath } from "../cfg/const";
import path from "path";

export function init(name: string) {
  const targetPath = path.resolve(currentExecPath, name);
  execSync(`cp -r ${dappTemplatePath} ${targetPath}`);
  console.log(`init CKB dapp project with lumos: ${targetPath}`);
}
