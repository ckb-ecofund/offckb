import { Network, userOffCKBConfigPath } from '../cfg/const';
import { validateExecDappEnvironment, updateScriptInfoInOffCKBConfigTs, buildFullLumosConfig } from '../util';

export function updateConfig() {
  validateExecDappEnvironment();

  // update the offckb.config.ts file in users workspace
  const devnetFullLumosConfig = buildFullLumosConfig(Network.devnet);
  const testnetFullLumosConfig = buildFullLumosConfig(Network.testnet);
  const mainnetFullLumosConfig = buildFullLumosConfig(Network.mainnet);

  updateScriptInfoInOffCKBConfigTs(devnetFullLumosConfig, userOffCKBConfigPath, Network.devnet);
  updateScriptInfoInOffCKBConfigTs(testnetFullLumosConfig, userOffCKBConfigPath, Network.testnet);
  updateScriptInfoInOffCKBConfigTs(mainnetFullLumosConfig, userOffCKBConfigPath, Network.mainnet);
}
