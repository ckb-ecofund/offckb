import * as fs from 'fs';
import * as path from 'path';
import { dappTemplatePath, deployedContractInfoFolderPath } from '../cfg/const';
import { config } from '@ckb-lumos/lumos';
import { Network } from './type';

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
