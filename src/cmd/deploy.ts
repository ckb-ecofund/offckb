import { NetworkOption, Network } from '../util/type';
import path from 'path';
import { CKB } from '../util/ckb';
import { deployerAccount } from '../cfg/account';
import { listBinaryFilesInFolder, isAbsolutePath } from '../util/fs';
import { validateNetworkOpt, validateExecDappEnvironment } from '../util/validator';
import { deployBinaries, getToDeployBinsPath, recordDeployResult } from '../deploy';

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
    const binFolder = isAbsolutePath(targetFolder) ? targetFolder : path.resolve(process.cwd(), targetFolder);
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
