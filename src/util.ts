import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { dappTemplatePath } from './cfg/const';
import axios from 'axios';
import {
  dappTemplateGitBranch,
  dappTemplateGitSelectOptionFile,
  dappTemplateGitRepoUserAndName,
  dappTemplateGitFolder,
} from './cfg/const';

export function isFolderExists(folderPath: string): boolean {
  try {
    // Check if the path exists
    fs.accessSync(folderPath, fs.constants.F_OK);

    // Check if it's a directory
    const stats = fs.statSync(folderPath);
    return stats.isDirectory();
  } catch (error) {
    // If the access or stat fails, or if it's not a directory, return false
    return false;
  }
}

export function copyFolderSync(source: string, destination: string) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  const files = fs.readdirSync(source);

  for (const file of files) {
    const currentPath = path.join(source, file);
    const destinationPath = path.join(destination, file);

    if (fs.statSync(currentPath).isDirectory()) {
      copyFolderSync(currentPath, destinationPath);
    } else {
      fs.copyFileSync(currentPath, destinationPath);
    }
  }
}

export function copyFileSync(source: string, target: string) {
  let targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

export async function copyFilesWithExclusion(sourceDir: string, destinationDir: string, excludedFolders: string[]) {
  try {
    // Ensure the destination directory exists
    await fs.promises.mkdir(destinationDir, { recursive: true });

    // Start copying recursively from the source directory
    await copyRecursive(sourceDir, destinationDir, excludedFolders);
  } catch (error) {
    console.error('An error occurred during copying files:', error);
  }
}

// Function to recursively copy files and directories
export async function copyRecursive(source: string, destination: string, excludedFolders: string[]) {
  // Get a list of all files and directories in the source directory
  const files = await fs.promises.readdir(source);

  // Iterate through each file or directory
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    // Get the file's stats
    const stats = await fs.promises.stat(sourcePath);

    // If it's a directory, recursively copy it (unless it's excluded)
    if (stats.isDirectory()) {
      if (excludedFolders.includes(file)) {
        // Skipping directory: ${sourcePath}
      } else {
        // Ensure destination directory exists before copying
        await fs.promises.mkdir(destPath, { recursive: true });
        await copyRecursive(sourcePath, destPath, excludedFolders);
      }
    } else {
      // Otherwise, copy the file
      await fs.promises.copyFile(sourcePath, destPath);
    }
  }
}

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

export interface TemplateOption {
  name: string;
  value: string;
  description: string;
}

export async function loadTemplateOpts(): Promise<Array<TemplateOption>> {
  const githubUrl = `https://raw.githubusercontent.com/${dappTemplateGitRepoUserAndName}/${dappTemplateGitBranch}/${dappTemplateGitFolder}/${dappTemplateGitSelectOptionFile}`;

  try {
    const response = await axios.get(githubUrl);
    return response.data as Array<TemplateOption>;
  } catch (error: unknown) {
    throw new Error(`Error fetching JSON: ${(error as Error).message}`);
  }
}
