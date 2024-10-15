import { DeploymentOptions, generateDeploymentToml } from '../deploy/toml';
import { DeploymentRecipe, generateDeploymentMigrationFile, Migration } from '../deploy/migration';
import { ckbHash, computeScriptHash } from '@ckb-lumos/lumos/utils';
import { genMyScriptsJsonFile } from '../scripts/gen';
import { OffCKBConfigFile } from '../template/offckb-config';
import { listBinaryFilesInFolder, readFileToUint8Array, isAbsolutePath } from '../util/fs';
import path from 'path';
import fs from 'fs';
import { HexString } from '@ckb-lumos/lumos';
import { Network } from '../util/type';
import { CKB } from '../sdk/ckb';

export type DeployBinaryReturnType = ReturnType<typeof deployBinary>;
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export type DeployedInterfaceType = UnwrapPromise<DeployBinaryReturnType>;

export function getToDeployBinsPath() {
  const userOffCKBConfigPath = path.resolve(process.cwd(), 'offckb.config.ts');
  const fileContent = fs.readFileSync(userOffCKBConfigPath, 'utf-8');
  const match = fileContent.match(/contractBinFolder:\s*['"]([^'"]+)['"]/);
  if (match && match[1]) {
    const contractBinFolderValue = match[1];
    const binFolderPath = isAbsolutePath(contractBinFolderValue)
      ? contractBinFolderValue
      : path.resolve(process.cwd(), contractBinFolderValue);
    const bins = listBinaryFilesInFolder(binFolderPath);
    return bins.map((bin) => path.resolve(binFolderPath, bin));
  } else {
    console.log('contractBinFolder value not found in offckb.config.ts');
    return [];
  }
}

export async function recordDeployResult(
  results: DeployedInterfaceType[],
  network: Network,
  isUpdateMyScriptsJsonFile = true,
) {
  if (results.length === 0) {
    return;
  }
  for (const result of results) {
    generateDeploymentToml(result.deploymentOptions, network);
    generateDeploymentMigrationFile(result.deploymentOptions.name, result.deploymentRecipe, network);
  }

  // update my-scripts.json
  if (isUpdateMyScriptsJsonFile) {
    const userOffCKBConfigPath = path.resolve(process.cwd(), 'offckb.config.ts');
    const folder = OffCKBConfigFile.readContractInfoFolder(userOffCKBConfigPath);
    if (folder) {
      const myScriptsFilePath = path.resolve(folder, 'my-scripts.json');
      genMyScriptsJsonFile(myScriptsFilePath);
    }
  }

  console.log('done.');
}

export async function deployBinaries(binPaths: string[], privateKey: HexString, ckb: CKB) {
  if (binPaths.length === 0) {
    console.log('No binary to deploy.');
  }
  const results: DeployedInterfaceType[] = [];
  for (const bin of binPaths) {
    const result = await deployBinary(bin, privateKey, ckb);
    results.push(result);
  }
  return results;
}

export async function deployBinary(
  binPath: string,
  privateKey: HexString,
  ckb: CKB,
): Promise<{
  deploymentRecipe: DeploymentRecipe;
  deploymentOptions: DeploymentOptions;
}> {
  const bin = await readFileToUint8Array(binPath);
  const contractName = path.basename(binPath);

  const result = Migration.isDeployedWithTypeId(contractName, ckb.network)
    ? await ckb.upgradeTypeIdScript(contractName, bin, privateKey)
    : await ckb.deployNewTypeIDScript(bin, privateKey);
  console.log(`contract ${contractName} deployed, tx hash:`, result.txHash);
  console.log('wait for tx confirmed on-chain...');
  await ckb.queryOnChainTransaction(result.txHash);
  console.log('tx committed.');

  const txHash = result.txHash;
  const index = result.scriptOutputCellIndex;
  const tx = result.tx;
  const dataByteLen = BigInt(tx.outputsData[+index].slice(2).length / 2);
  const dataShannonLen = dataByteLen * BigInt('100000000');
  const occupiedCapacity = '0x' + dataShannonLen.toString(16);

  // todo: handle multiple cell recipes?
  return {
    deploymentOptions: {
      name: contractName,
      binFilePath: binPath,
      enableTypeId: true,
      lockScript: tx.outputs[+index].lock,
    },
    deploymentRecipe: {
      cellRecipes: [
        {
          name: contractName,
          txHash,
          index: '0x' + index.toString(16),
          occupiedCapacity,
          dataHash: ckbHash(tx.outputsData[+index]),
          typeId: computeScriptHash(result.typeId!),
        },
      ],
      depGroupRecipes: [],
    },
  };
}
