import * as fs from 'fs';
import { config } from '@ckb-lumos/lumos';
import { Network } from './type';
import { getContractsPath } from '../deploy/util';
import { getSubfolders } from './fs';
import { getMigrationFolderPath, getNewestMigrationFile, readDeploymentRecipeJsonFile } from '../deploy/migration';
import { getSystemScriptsFromListHashes, toLumosConfig } from '../cmd/system-scripts';
const version = require('../../package.json').version;

export function updateOffCKBConfigVersion(filePath: string) {
  const versionTarget = 'update-me-offckb-config-version';
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  fileContent = fileContent.replace(versionTarget, version);
  // Write the updated content back to the file
  fs.writeFileSync(filePath, fileContent, 'utf-8');
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
  const folder = getContractsPath(network);
  if (!fs.existsSync(folder)) {
    return deployedScriptsInfo;
  }

  const contractNames = getSubfolders(folder);
  for (const contractName of contractNames) {
    const folderPath = getMigrationFolderPath(contractName, network); // Replace with your function to get the folder path
    const newestFilePath = getNewestMigrationFile(folderPath);

    if (newestFilePath) {
      try {
        // Read the file content
        const recipe = readDeploymentRecipeJsonFile(newestFilePath);
        // todo: handle multiple cell recipes?
        const firstCell = recipe.cellRecipes[0];
        const isDepCode = recipe.depGroupRecipes.length === 0;
        deployedScriptsInfo[firstCell.name] = {
          CODE_HASH: firstCell.typeId ? firstCell.typeId : firstCell.dataHash,
          HASH_TYPE: firstCell.typeId ? 'type' : 'data1',
          TX_HASH: firstCell.txHash,
          INDEX: firstCell.index,
          DEP_TYPE: isDepCode ? 'code' : 'depGroup',
        };
      } catch (error) {
        console.error(`Error reading or parsing file '${newestFilePath}':`, error);
      }
    }
  }

  return deployedScriptsInfo;
}

export function readPredefinedDevnetLumosConfig() {
  try {
    const systemScripts = getSystemScriptsFromListHashes();
    if (systemScripts) {
      return toLumosConfig(systemScripts);
    }
    throw new Error('systemScripts not found!');
  } catch (error: unknown) {
    throw new Error('getSystemScriptsFromListHashes error' + (error as Error).message);
  }
}

export function readPredefinedMainnetLumosConfig(): config.Config {
  const predefined = config.MAINNET;
  // add more example like spore;
  return predefined;
}

export function readPredefinedTestnetLumosConfig(): config.Config {
  const predefined = config.TESTNET;
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
