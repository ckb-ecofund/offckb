import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Network, currentExecPath, dappTemplatePath, deployedContractInfoFolderPath } from './cfg/const';
import axios from 'axios';
import {
  dappTemplateGitBranch,
  dappTemplateGitSelectOptionFile,
  dappTemplateGitRepoUserAndName,
  dappTemplateGitFolder,
} from './cfg/const';
import { config } from '@ckb-lumos/lumos';

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
    fs.mkdirSync(destination, { recursive: true });
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

export function validateTypescriptWorkspace() {
  const cwd = currentExecPath;

  // Check if package.json exists
  const packageJsonPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found in the current directory');
  }

  // Check if tsconfig.json exists
  const tsconfig = path.join(cwd, 'tsconfig.json');
  if (!fs.existsSync(tsconfig)) {
    throw new Error('tsconfig.json not found in the current directory');
  }
}

export function validateExecDappEnvironment() {
  const cwd = currentExecPath;

  // Check if package.json and tsconfig.json exists
  validateTypescriptWorkspace();

  // Check if offckb.config.ts exists
  const offCKBConfigPath = path.resolve(cwd, 'offckb.config.ts');
  if (!fs.existsSync(offCKBConfigPath)) {
    throw new Error('offckb.config.ts not found in the current directory');
  }

  // Read offckb.config.ts file
  const offCKBConfigFile = fs.readFileSync(offCKBConfigPath, 'utf-8');

  // Check if offckb.config.ts contains OffCKBConfig interface
  if (!offCKBConfigFile.includes('export interface OffCKBConfig')) {
    throw new Error('offckb.config.ts does not contain OffCKBConfig interface');
  }

  // Check if OffCKBConfig is exported
  if (!offCKBConfigFile.includes('export default offCKBConfig;')) {
    throw new Error('OffCKBConfig interface is not exported in offckb.config.ts');
  }
}

export function isValidNetworkString(network: string) {
  return ['devnet', 'testnet', 'mainnet'].includes(network);
}

export function validateNetworkOpt(network: string) {
  if (!isValidNetworkString(network)) {
    throw new Error('invalid network option, ' + network);
  }

  if (network === 'mainnet') {
    console.log(
      'Mainnet not support yet. Please use CKB-CLI to operate on mainnet for better security. Check https://github.com/nervosnetwork/ckb-cli',
    );
    process.exit(1);
  }
}

export async function readFileToUint8Array(filePath: string): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(new Uint8Array(data));
    });
  });
}

export function convertFilenameToUppercase(filePath: string): string {
  // Extract the filename from the file path
  const filename = path.basename(filePath);

  // Convert the filename to uppercase
  const uppercaseFilename = filename.toUpperCase();
  return uppercaseFilename;
}

export function listBinaryFilesInFolder(folderPath: string): string[] {
  // Check if the provided path is a directory
  if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
    throw new Error(`${folderPath} is not a valid directory.`);
  }

  // Read the contents of the directory
  const files = fs.readdirSync(folderPath);

  // Filter out only the binary files (assuming they have extensions like .exe, .bin, .dll, etc.)
  const binaryFiles = files.filter((file) => {
    const filePath = path.join(folderPath, file);
    // Check if the file is a regular file and not a directory
    return fs.statSync(filePath).isFile() && isBinaryFile(filePath);
  });

  return binaryFiles;
}

// Function to check if a file is binary
export function isBinaryFile(filePath: string): boolean {
  const buffer = fs.readFileSync(filePath);
  for (let i = 0; i < buffer.length; i++) {
    // If any byte has a value greater than 127, it's likely a binary file
    if (buffer[i] > 127) {
      return true;
    }
  }
  return false;
}

export function updateScriptInfoInOffCKBConfigTs(newConfig: config.Config, filePath: string, network: Network): void {
  // Read the content of the offckb.config.ts file
  let fileContent = fs.readFileSync(filePath, 'utf-8');

  if (network === Network.devnet) {
    /// Define the regular expression pattern to match the JSON content
    const regexPattern = /\/\/ ---devnet lumos config---([\s\S]*?)\/\/ ---end of devnet lumos config---/;

    // Replace the old JSON content with the new JSON content using the regular expression
    fileContent = fileContent.replace(
      regexPattern,
      `// ---devnet lumos config---\nconst lumosConfig: config.Config = ${JSON.stringify(newConfig, null, 2)} as config.Config;\n// ---end of devnet lumos config---`,
    );

    // Write the updated content back to the file
    fs.writeFileSync(filePath, fileContent, 'utf-8');
  }

  if (network === Network.testnet) {
    /// Define the regular expression pattern to match the JSON content
    const regexPattern = /\/\/ ---testnet lumos config---([\s\S]*?)\/\/ ---end of testnet lumos config---/;

    // Replace the old JSON content with the new JSON content using the regular expression
    fileContent = fileContent.replace(
      regexPattern,
      `// ---testnet lumos config---\nconst testnetLumosConfig: config.Config = ${JSON.stringify(newConfig, null, 2)} as config.Config;\n// ---end of testnet lumos config---`,
    );

    // Write the updated content back to the file
    fs.writeFileSync(filePath, fileContent, 'utf-8');
  }

  if (network === Network.mainnet) {
    /// Define the regular expression pattern to match the JSON content
    const regexPattern = /\/\/ ---mainnet lumos config---([\s\S]*?)\/\/ ---end of mainnet lumos config---/;

    // Replace the old JSON content with the new JSON content using the regular expression
    fileContent = fileContent.replace(
      regexPattern,
      `// ---mainnet lumos config---\nconst mainnetLumosConfig: config.Config = ${JSON.stringify(newConfig, null, 2)} as config.Config;\n// ---end of mainnet lumos config---`,
    );

    // Write the updated content back to the file
    fs.writeFileSync(filePath, fileContent, 'utf-8');
  }
}

export function readUserDeployedScriptsInfo(network: Network) {
  const deployedScriptsInfo: Record<string, config.ScriptConfig> = {};

  // Read all files in the folder
  const folder = path.resolve(deployedContractInfoFolderPath, network);
  if (!fs.existsSync(folder)) {
    return deployedScriptsInfo;
  }

  const files = fs.readdirSync(folder);

  // Iterate through each file
  files.forEach((fileName) => {
    // Construct the full file path
    const filePath = path.join(folder, fileName);

    // Check if the file is a JSON file
    if (fileName.endsWith('.json')) {
      try {
        // Read the file content
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Parse the JSON content
        const scriptContent = JSON.parse(fileContent);

        const rawFileName = path.parse(fileName).name.replace(/-/g, '_');

        // Add the file content to the result object with the file name as the key
        deployedScriptsInfo[rawFileName] = scriptContent;
      } catch (error) {
        console.error(`Error reading or parsing file '${fileName}':`, error);
      }
    }
  });

  return deployedScriptsInfo;
}

export function readPredefinedDevnetLumosConfig() {
  const filePath = path.resolve(dappTemplatePath, 'config.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    return jsonData as config.Config;
  } catch (error: unknown) {
    throw new Error('Error reading the json file:' + (error as Error).message);
  }
}

export function readPredefinedMainnetLumosConfig(): config.Config {
  const predefined = config.predefined.LINA;
  // add more example like spore;
  return predefined;
}

export function readPredefinedTestnetLumosConfig(): config.Config {
  const predefined = config.predefined.AGGRON4;
  // add more example like spore;
  return predefined;
}

export function buildFullLumosConfig(network: Network) {
  const config =
    network === Network.devnet
      ? readPredefinedDevnetLumosConfig()
      : network === Network.testnet
        ? readPredefinedTestnetLumosConfig()
        : readPredefinedMainnetLumosConfig();
  const userDeployedScripts = readUserDeployedScriptsInfo(network);
  const conf = JSON.parse(JSON.stringify(config));
  conf.SCRIPTS = { ...config.SCRIPTS, ...userDeployedScripts };
  return conf;
}

export function buildTestnetTxLink(txHash: string) {
  return `https://pudge.explorer.nervos.org/transaction/${txHash}`;
}
