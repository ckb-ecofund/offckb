import { Script } from '@ckb-lumos/lumos';
import fs from 'fs';
import toml from 'toml';
import { Network } from '../util/type';
import { readSettings } from '../cfg/setting';
import { dirname } from 'path';

export interface DeploymentOptions {
  name: string;
  binFilePath: string;
  enableTypeId: boolean;
  lockScript: Script;
}

export function generateDeploymentToml(options: DeploymentOptions, network: Network) {
  const settings = readSettings();
  const data = {
    cells: [
      {
        name: options.name,
        enable_type_id: options.enableTypeId ? 'true' : 'false',
        location: {
          file: options.binFilePath,
        },
      },
    ],
    lock: {
      code_hash: options.lockScript.codeHash,
      args: options.lockScript.args,
      hash_type: options.lockScript.hashType,
    },
  };

  const tomlString = JSON.stringify(data);
  let outputFilePath: string | undefined = undefined;
  if (network === Network.devnet) {
    outputFilePath = `${settings.devnet.contractsPath}/${options.name}/deployment.toml`;
  }
  if (outputFilePath) {
    if (!fs.existsSync(dirname(outputFilePath))) {
      fs.mkdirSync(dirname(outputFilePath), { recursive: true });
    }
    fs.writeFileSync(outputFilePath, tomlString);
    console.log(`${options.name} deployment.toml file ${outputFilePath} generated successfully.`);
  }
}

export function readDeploymentToml(scriptName: string, network: Network) {
  let filePath = '';
  const settings = readSettings();
  if (network === Network.devnet) {
    filePath = `${settings.devnet.contractsPath}/${scriptName}/deployment.toml`;
  }

  const file = fs.readFileSync(filePath, 'utf-8');
  const data = toml.parse(file);
  return {
    cells: [
      {
        name: data.name as string,
        enableTypeId: data.enable_type_id === 'true' ? true : false,
        location: {
          file: data.filePath as string,
        },
      },
    ],
    lock: {
      codeHash: data.lock.code_hash as string,
      args: data.lock.args as string,
      hashType: data.lock.hash_type as string,
    },
  };
}
