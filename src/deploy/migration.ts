import { HexNumber } from '@ckb-lumos/lumos';
import { Network } from '../util/type';
import { readSettings } from '../cfg/setting';
import path, { dirname } from 'path';
import fs from 'fs';
import { getContractsPath } from './util';

export interface CellRecipe {
  name: string;
  txHash: string;
  index: HexNumber;
  occupiedCapacity: HexNumber;
  dataHash: string;
  typeId?: string;
}

export interface DepGroupRecipe {
  name: string;
  txHash: string;
  index: HexNumber;
  dataHash: string;
  occupiedCapacity: HexNumber;
}

export interface DeploymentRecipe {
  cellRecipes: CellRecipe[];
  depGroupRecipes: DepGroupRecipe[];
}

export interface DeploymentRecipeJson {
  cell_recipes: {
    name: string;
    tx_hash: string;
    index: HexNumber;
    occupied_capacity: HexNumber;
    data_hash: string;
    type_id?: string;
  }[];
  dep_group_recipes: {
    name: string;
    tx_hash: string;
    index: HexNumber;
    data_hash: string;
    occupied_capacity: HexNumber;
  }[];
}

export function generateDeploymentRecipeJsonFile(
  name: string,
  deploymentRecipe: DeploymentRecipe,
  network = Network.devnet,
) {
  const settings = readSettings();
  const cellRecipes = deploymentRecipe.cellRecipes;
  const depGroupRecipes = deploymentRecipe.depGroupRecipes;
  const jsonString = JSON.stringify(deploymentRecipeToJson({ cellRecipes, depGroupRecipes }), null, 2);
  let outputFilePath: string | undefined = undefined;
  if (network === Network.devnet) {
    outputFilePath = `${settings.devnet.contractsPath}/${name}/migrations/${getFormattedMigrationDate()}.json`;
  }
  if (outputFilePath) {
    if (!fs.existsSync(dirname(outputFilePath))) {
      fs.mkdirSync(dirname(outputFilePath), { recursive: true });
    }
    fs.writeFileSync(outputFilePath, jsonString);
    console.log(`${name} migration json file ${outputFilePath} generated successfully.`);
  }
}

export function readDeploymentRecipeJsonFile(filePath: string): DeploymentRecipe {
  const jsonString = fs.readFileSync(filePath, 'utf-8');
  const data: DeploymentRecipeJson = JSON.parse(jsonString);
  return deploymentRecipeFromJson(data);
}

export function getFormattedMigrationDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

export function getMigrationFolderPath(scriptName: string, network: Network) {
  const contractsPath = getContractsPath(network);
  return path.resolve(contractsPath, `${scriptName}/migrations`);
}

export function getNewestMigrationFile(folderPath: string): string | undefined {
  const files = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith('.json')) // Ensure only JSON files are considered
    .sort((a, b) => {
      // Extract the timestamp part of the filename and compare them
      const timestampA = a.split('.json')[0];
      const timestampB = b.split('.json')[0];
      return timestampA.localeCompare(timestampB);
    });

  // Return the full path of the newest file (last in sorted array) or undefined if no files
  return files.length > 0 ? path.join(folderPath, files[files.length - 1]) : undefined;
}

export function deploymentRecipeToJson(recipe: DeploymentRecipe): DeploymentRecipeJson {
  return {
    cell_recipes: recipe.cellRecipes.map((val) => {
      return {
        name: val.name,
        tx_hash: val.txHash,
        index: val.index,
        occupied_capacity: val.occupiedCapacity,
        data_hash: val.dataHash,
        type_id: val.typeId,
      };
    }),
    dep_group_recipes: recipe.depGroupRecipes.map((val) => {
      return {
        name: val.name,
        tx_hash: val.txHash,
        index: val.index,
        data_hash: val.dataHash,
        occupied_capacity: val.occupiedCapacity,
      };
    }),
  };
}

export function deploymentRecipeFromJson(json: DeploymentRecipeJson): DeploymentRecipe {
  return {
    cellRecipes: json.cell_recipes.map((val) => {
      return {
        name: val.name,
        txHash: val.tx_hash,
        index: val.index,
        occupiedCapacity: val.occupied_capacity,
        dataHash: val.data_hash,
        typeId: val.type_id,
      };
    }),
    depGroupRecipes: json.dep_group_recipes.map((val) => {
      return {
        name: val.name,
        txHash: val.tx_hash,
        index: val.index,
        dataHash: val.data_hash,
        occupiedCapacity: val.occupied_capacity,
      };
    }),
  };
}
