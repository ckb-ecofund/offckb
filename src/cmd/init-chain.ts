import * as fs from 'fs';
import { devnetPath, devnetSourcePath } from '../cfg/const';
import path from 'path';
import { isFolderExists } from '../util';

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

async function copyFilesWithExclusion(sourceDir: string, destinationDir: string, excludedFolders: string[]) {
  try {
    // Ensure the destination directory exists
    await fs.promises.mkdir(destinationDir, { recursive: true });

    // Start copying recursively from the source directory
    await copyRecursive(sourceDir, destinationDir, excludedFolders);
  } catch (error) {
    console.error('An error occurred during copying files:', error);
  }
}

// Function to recursively copy files and directories
async function copyRecursive(source: string, destination: string, excludedFolders: string[]) {
  // Get a list of all files and directories in the source directory
  const files = await fs.promises.readdir(source);

  // Iterate through each file or directory
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    // Get the file's stats
    const stats = await fs.promises.stat(sourcePath);

    // If it's a directory, recursively copy it (unless it's excluded)
    if (stats.isDirectory()) {
      if (excludedFolders.includes(file)) {
        // Skipping directory: ${sourcePath}
      } else {
        // Ensure destination directory exists before copying
        await fs.promises.mkdir(destPath, { recursive: true });
        await copyRecursive(sourcePath, destPath, excludedFolders);
      }
    } else {
      // Otherwise, copy the file
      await fs.promises.copyFile(sourcePath, destPath);
    }
  }
}
