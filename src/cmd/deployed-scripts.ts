import { readUserDeployedScriptsInfo } from '../util/config';
import { NetworkOption, Network } from '../util/type';
import { validateNetworkOpt } from '../util/validator';

export interface DeployedScriptOption extends NetworkOption {}

export function deployedScripts(option: DeployedScriptOption = { network: Network.devnet }) {
  const network = option.network;
  validateNetworkOpt(network);

  const scritpsInfo = readUserDeployedScriptsInfo(network);
  console.log(`User deployed scripts on ${network}`);
  console.log(JSON.stringify(scritpsInfo, null, 2));
}
