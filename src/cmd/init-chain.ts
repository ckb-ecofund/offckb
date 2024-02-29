import * as fs from 'fs';
import { devnetPath, devnetSourcePath } from '../cfg/const';
import path from 'path';
import { copyFilesWithExclusion, isFolderExists } from '../util';

export async function initChainIfNeeded() {
  if (!isFolderExists(devnetPath)) {
    await doInitChain();
  }
}

async function doInitChain() {
  await copyFilesWithExclusion(devnetSourcePath, devnetPath, ['data']);
  console.debug(`init devnet config folder: ${devnetPath}`);
  copyAndEditMinerToml();
}

function copyAndEditMinerToml() {
  const minerToml = path.join(devnetSourcePath, 'ckb-miner.toml');
  const newMinerToml = path.join(devnetPath, 'ckb-miner.toml');
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
