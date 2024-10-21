import { readDeploymentToml } from '../deploy/toml';
import { getContractsPath } from '../deploy/util';
import { readUserDeployedScriptsInfo } from '../scripts/util';
import { NetworkOption, Network } from '../type/base';
import { validateNetworkOpt } from '../util/validator';

export interface DeployedScriptOption extends NetworkOption {}

export function printMyScripts(option: DeployedScriptOption = { network: Network.devnet }) {
  const network = option.network;
  validateNetworkOpt(network);

  const scriptsInfo = readUserDeployedScriptsInfo(network);
  console.log(`*** User-deployed Scripts on ${network.toUpperCase()} ***`);
  const scriptNames = Object.keys(scriptsInfo);
  scriptNames.forEach((scriptName) => {
    const deployToml = readDeploymentToml(scriptName, network);
    console.log(`- ${scriptName}`);
    console.log(`Path: ${getContractsPath(network)}/${scriptName}`);
    console.log(`Binary File: ${deployToml.cells[0].location.file}`);
    console.log(`Enable Type Id: ${deployToml.cells[0].enableTypeId}`);
    console.log(`Script Info: ${JSON.stringify(scriptsInfo[scriptName], null, 2)}`);
    console.log(`\n`);
  });
}
