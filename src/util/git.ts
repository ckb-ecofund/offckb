import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { dappTemplatePath } from '../cfg/const';
import { copyFolderSync } from './fs';

export function isGitInstalled(): boolean {
  try {
    execSync('git --version');
    return true;
  } catch (error) {
    return false;
  }
}

export function gitCloneAndDownloadFolderSync(
  repoUrl: string,
  branch: string,
  subFolderName: string,
  targetPath: string,
) {
  console.log('start cloning the dapp template..');
  const tempFolder = path.resolve(dappTemplatePath, 'temp-clone-folder');

  if (!isGitInstalled()) {
    console.log('Git is not installed, please check https://git-scm.com/');
    return process.exit(1);
  }

  // Empty the temp folder if it exists
  if (fs.existsSync(tempFolder)) {
    fs.rmSync(tempFolder, { recursive: true });
  }

  // Create the temp folder
  fs.mkdirSync(tempFolder, { recursive: true });

  // Clone the repository
  try {
    const cloneCommand = `git clone -n --depth=1 --single-branch --branch ${branch} --filter=tree:0 ${repoUrl} ${tempFolder}`;
    execSync(cloneCommand);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  // checkout the examples sub folder
  try {
    execSync(`git sparse-checkout set ${subFolderName}`, { cwd: tempFolder });
    execSync(`git checkout`, { cwd: tempFolder });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  // Ensure targetPath exists and is a directory
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
  const source = path.resolve(tempFolder, subFolderName);
  copyFolderSync(source, targetPath);

  // Empty the temp folder if it exists
  if (fs.existsSync(tempFolder)) {
    fs.rmSync(tempFolder, { recursive: true });
  }
  console.log(`Folder ${subFolderName} downloaded successfully from ${repoUrl} and moved to ${targetPath}`);
}
