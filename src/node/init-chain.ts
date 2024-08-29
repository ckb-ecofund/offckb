import * as fs from 'fs';
import path from 'path';
import { isFolderExists, copyFilesWithExclusion } from '../util/fs';
import { packageRootPath, readSettings } from '../cfg/setting';

const devnetSourcePath = path.resolve(packageRootPath, './ckb/devnet');
const settings = readSettings();

export async function initChainIfNeeded() {
  const devnetConfigPath = settings.devnet.configPath;
  if (!isFolderExists(devnetConfigPath)) {
    await doInitChain();
  }
}

async function doInitChain() {
  const devnetConfigPath = settings.devnet.configPath;
  await copyFilesWithExclusion(devnetSourcePath, devnetConfigPath, ['data']);
  console.debug(`init devnet config folder: ${devnetConfigPath}`);
  copyAndEditMinerToml();
}

function copyAndEditMinerToml() {
  const devnetConfigPath = settings.devnet.configPath;
  const minerToml = path.join(devnetSourcePath, 'ckb-miner.toml');
  const newMinerToml = path.join(devnetConfigPath, 'ckb-miner.toml');
  // Read the content of the ckb-miner.toml file
  fs.readFile(minerToml, 'utf8', (err, data) => {
    if (err) {
      return console.error('Error reading file:', err);
    }

    // Replace the URL
    const modifiedData = data.replace('http://ckb:8114/', 'http://localhost:8114');

    // Write the modified content back to the file
    fs.writeFile(newMinerToml, modifiedData, 'utf8', (err) => {
      if (err) {
        return console.error('Error writing file:', err);
      }
      console.debug('modified ', newMinerToml);
    });
  });
}
