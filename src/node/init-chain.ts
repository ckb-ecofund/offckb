import fs from 'fs';
import path from 'path';
import { isFolderExists, copyFilesWithExclusion } from '../util/fs';
import { packageRootPath, readSettings } from '../cfg/setting';

export async function initChainIfNeeded() {
  const settings = readSettings();
  const devnetSourcePath = path.resolve(packageRootPath, './ckb/devnet');
  const devnetConfigPath = settings.devnet.configPath;
  if (!isFolderExists(devnetConfigPath)) {
    const devnetConfigPath = settings.devnet.configPath;
    await copyFilesWithExclusion(devnetSourcePath, devnetConfigPath, ['data']);
    console.debug(`init devnet config folder: ${devnetConfigPath}`);

    // copy and edit ckb-miner.toml
    const minerToml = path.join(devnetSourcePath, 'ckb-miner.toml');
    const newMinerToml = path.join(devnetConfigPath, 'ckb-miner.toml');
    // Read the content of the ckb-miner.toml file
    const data = fs.readFileSync(minerToml, 'utf8');
    // Replace the URL
    const modifiedData = data.replace('http://ckb:8114/', 'http://localhost:8114');
    // Write the modified content back to the file
    fs.writeFileSync(newMinerToml, modifiedData, 'utf8');
  }
}
