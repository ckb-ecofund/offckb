import { commons, hd, helpers } from '@ckb-lumos/lumos';
import fs from 'fs';
import { currentExecPath, userOffCKBConfigPath } from '../cfg/const';
import { NetworkOption, Network } from '../util/type';
import path from 'path';
import { Account, CKB } from '../util/ckb';
import { deployerAccount } from '../cfg/account';
import {
  listBinaryFilesInFolder,
  readFileToUint8Array,
  isAbsolutePath,
  readContractInfoFolderFromOffCKBConfig,
} from '../util/fs';
import { validateNetworkOpt, validateExecDappEnvironment } from '../util/validator';
import { DeploymentOptions, generateDeploymentToml } from '../deploy/toml';
import { DeploymentRecipe, generateDeploymentRecipeJsonFile } from '../deploy/migration';
import { ckbHash, computeScriptHash } from '@ckb-lumos/lumos/utils';
import { genMyScriptsJsonFile } from '../scripts/gen';

export interface DeployOptions extends NetworkOption {
  target: string | null | undefined;
  privkey?: string | null;
}

export async function deploy(opt: DeployOptions = { network: Network.devnet, target: null }) {
  const network = opt.network as Network;
  validateNetworkOpt(network);

  const ckb = new CKB(network);

  // we use deployerAccount to deploy contract by default
  const privateKey = opt.privkey || deployerAccount.privkey;
  const lumosConfig = ckb.getLumosConfig();
  const from = CKB.generateAccountFromPrivateKey(privateKey, lumosConfig);

  const targetFolder = opt.target;
  if (targetFolder) {
    const binFolder = isAbsolutePath(targetFolder) ? targetFolder : path.resolve(currentExecPath, targetFolder);
    const bins = listBinaryFilesInFolder(binFolder);
    const binPaths = bins.map((bin) => path.resolve(binFolder, bin));
    const results = await deployBinaries(binPaths, from, ckb);

    // record the deployed contract infos
    recordDeployResult(results, network, false); // we don't update my-scripts.json since we don't know where the file is
    return;
  }

  // check if target workspace is valid
  try {
    validateExecDappEnvironment();
  } catch (error) {
    return console.debug('Not a valid offCKB dapp workspace.');
  }

  // read contract bin folder
  const bins = getToDeployBinsPath();
  const results = await deployBinaries(bins, from, ckb);

  // record the deployed contract infos
  recordDeployResult(results, network);
}

function getToDeployBinsPath() {
  const fileContent = fs.readFileSync(userOffCKBConfigPath, 'utf-8');
  const match = fileContent.match(/contractBinFolder:\s*['"]([^'"]+)['"]/);
  if (match && match[1]) {
    const contractBinFolderValue = match[1];
    const binFolderPath = isAbsolutePath(contractBinFolderValue)
      ? contractBinFolderValue
      : path.resolve(currentExecPath, contractBinFolderValue);
    const bins = listBinaryFilesInFolder(binFolderPath);
    return bins.map((bin) => path.resolve(binFolderPath, bin));
  } else {
    console.log('contractBinFolder value not found in offckb.config.ts');
    return [];
  }
}

type DeployBinaryReturnType = ReturnType<typeof deployBinary>;
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type DeployedInterfaceType = UnwrapPromise<DeployBinaryReturnType>;

async function recordDeployResult(results: DeployedInterfaceType[], network: Network, updateMyScriptsJsonFile = true) {
  if (results.length === 0) {
    return;
  }
  for (const result of results) {
    generateDeploymentToml(result.deploymentOptions, network);
    generateDeploymentRecipeJsonFile(result.deploymentOptions.name, result.deploymentRecipe, network);
  }

  // update my-scripts.json
  if (updateMyScriptsJsonFile) {
    const folder = readContractInfoFolderFromOffCKBConfig(userOffCKBConfigPath);
    if (folder) {
      const myScriptsFilePath = path.resolve(folder, 'my-scripts.json');
      genMyScriptsJsonFile(myScriptsFilePath);
    }
  }

  console.log('done.');
}

async function deployBinaries(binPaths: string[], from: Account, ckb: CKB) {
  if (binPaths.length === 0) {
    console.log('No binary to deploy.');
  }
  const results: DeployedInterfaceType[] = [];
  for (const bin of binPaths) {
    const result = await deployBinary(bin, from, ckb);
    results.push(result);
  }
  return results;
}

async function deployBinary(
  binPath: string,
  from: Account,
  ckb: CKB,
): Promise<{
  deploymentRecipe: DeploymentRecipe;
  deploymentOptions: DeploymentOptions;
}> {
  const bin = await readFileToUint8Array(binPath);
  const contractName = path.basename(binPath);
  const result = await commons.deploy.generateDeployWithTypeIdTx({
    cellProvider: ckb.indexer,
    fromInfo: from.address,
    scriptBinary: bin,
    config: ckb.getLumosConfig(),
  });

  // send deploy tx
  let txSkeleton = result.txSkeleton;
  txSkeleton = commons.common.prepareSigningEntries(txSkeleton);
  const message = txSkeleton.get('signingEntries').get(0)!.message;
  const Sig = hd.key.signRecoverable(message!, from.privKey);
  const tx = helpers.sealTransaction(txSkeleton, [Sig]);
  const res = await ckb.rpc.sendTransaction(tx, 'passthrough');
  console.log(`contract ${contractName} deployed, tx hash:`, res);
  console.log('wait 4 blocks..');
  await ckb.indexer.waitForSync(-4); // why negative 4? a bug in ckb-lumos

  // todo: handle multiple cell recipes?
  return {
    deploymentOptions: {
      name: contractName,
      binFilePath: binPath,
      enableTypeId: true,
      lockScript: tx.outputs[+result.scriptConfig.INDEX].lock,
    },
    deploymentRecipe: {
      cellRecipes: [
        {
          name: contractName,
          txHash: result.scriptConfig.TX_HASH,
          index: result.scriptConfig.INDEX,
          occupiedCapacity: '0x' + BigInt(tx.outputsData[+result.scriptConfig.INDEX].slice(2).length / 2).toString(16),
          dataHash: ckbHash(tx.outputsData[+result.scriptConfig.INDEX]),
          typeId: computeScriptHash(result.typeId),
        },
      ],
      depGroupRecipes: [],
    },
  };
}
