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

  if (network === Network.mainnet) {
    return settings.mainnet.contractsPath;
  }

  throw new Error(`invalid network ${network}`);
}
