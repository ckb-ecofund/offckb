import { readSettings } from '../cfg/setting';
import { Network } from '../util/type';

export function getContractsPath(network: Network) {
  const settings = readSettings();
  if (network === Network.devnet) {
    return settings.devnet.contractsPath;
  }

  if (network === Network.testnet) {
    return settings.testnet.contractsPath;
  }

  throw new Error('Mainnet not implemented yet!');
}
