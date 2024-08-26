import * as fs from 'fs';
import { config } from '@ckb-lumos/lumos';
import { Network } from './type';
import { getContractsPath } from '../deploy/util';
import { getSubfolders } from './fs';
import { getMigrationFolderPath, getNewestMigrationFile, readDeploymentRecipeJsonFile } from '../deploy/migration';
import { getSystemScriptsFromListHashes, toLumosConfig } from '../cmd/system-scripts';
import { MyScriptsRecord } from '../scripts/type';
const version = require('../../package.json').version;

export function updateOffCKBConfigVersion(filePath: string) {
  const versionTarget = '@offckb-update-version';
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  fileContent = fileContent.replace(versionTarget, version);
  // Write the updated content back to the file
  fs.writeFileSync(filePath, fileContent, 'utf-8');
}

export function readUserDeployedScriptsInfo(network: Network) {
  const deployedScriptsInfo: MyScriptsRecord = {};

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
          codeHash: (firstCell.typeId ? firstCell.typeId : firstCell.dataHash) as `0x${string}`,
          hashType: firstCell.typeId ? 'type' : 'data1',
          cellDeps: recipe.depGroupRecipes.map((depGroupRecipe) => {
            return {
              cellDep: {
                outPoint: {
                  txHash: depGroupRecipe.txHash as `0x${string}`,
                  index: +depGroupRecipe.index,
                },
                depType: isDepCode ? 'code' : 'depGroup',
              },
            };
          }),
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
