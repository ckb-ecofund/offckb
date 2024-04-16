import { commons, hd, helpers } from '@ckb-lumos/lumos';
import fs from 'fs';
import { currentExecPath, deployedContractInfoFolderPath, userOffCKBConfigPath } from '../cfg/const';
import { NetworkOption, Network } from '../util/type';
import path from 'path';
import { Account, CKB } from '../util/ckb';
import { deployerAccount } from '../cfg/account';
import { buildFullLumosConfig, updateScriptInfoInOffCKBConfigTs } from '../util/config';
import {
  listBinaryFilesInFolder,
  isFolderExists,
  readFileToUint8Array,
  convertFilenameToUppercase,
  isAbsolutePath,
} from '../util/fs';
import { validateNetworkOpt, validateExecDappEnvironment } from '../util/validator';

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
    recordDeployResult(results, network);
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

async function recordDeployResult(results: DeployedInterfaceType[], network: Network) {
  if (results.length === 0) {
    return;
  }

  for (const result of results) {
    const { scriptConfig, contractName } = result;
    const jsonContent = JSON.stringify(scriptConfig, null, 2);
    const filename = `${contractName}.json`;

    const filePath = path.resolve(deployedContractInfoFolderPath, network, filename);
    if (!isFolderExists(path.resolve(deployedContractInfoFolderPath, network))) {
      fs.mkdirSync(path.resolve(deployedContractInfoFolderPath, network), { recursive: true });
    }
    fs.writeFileSync(filePath, jsonContent);
  }

  // update lumos config in offckb.config.ts
  const newLumosConfig = buildFullLumosConfig(network);
  updateScriptInfoInOffCKBConfigTs(newLumosConfig, userOffCKBConfigPath, network);
}

async function deployBinaries(binPaths: string[], from: Account, ckb: CKB) {
  const results: DeployedInterfaceType[] = [];
  for (const bin of binPaths) {
    const result = await deployBinary(bin, from, ckb);
    results.push(result);
  }
  return results;
}

async function deployBinary(binPath: string, from: Account, ckb: CKB) {
  const bin = await readFileToUint8Array(binPath);
  const contractName = convertFilenameToUppercase(binPath);
  const result = await commons.deploy.generateDeployWithDataTx({
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

  //todo: upgrade lumos
  // indexer.waitForSync has a bug, we use negative number to workaround.
  // the negative number presents the block difference from current tip to wait
  await ckb.indexer.waitForSync(-4);

  return {
    contractName,
    ...result,
  };
}
