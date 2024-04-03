import axios from 'axios';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import semver from 'semver';
import os from 'os';
import AdmZip from 'adm-zip';
import * as tar from 'tar';
import { ckbBinPath, ckbFolderPath, minimalRequiredCKBVersion, targetEnvironmentPath } from '../cfg/const';

const BINARY = ckbBinPath;
const MINIMAL_VERSION = minimalRequiredCKBVersion;

// Function to download and install the dependency binary
export async function installDependency() {
  const version = getInstalledVersion();
  if (version) {
    if (isVersionOutdated(version)) {
      console.log(
        `${BINARY} version ${version} is outdated, download and install the new version ${MINIMAL_VERSION}..`,
      );
    } else {
      return;
    }
  } else {
    console.log(`${BINARY} not found, download and install the new version ${MINIMAL_VERSION}..`);
  }

  await downloadBinaryAndUnzip();
}

export async function downloadBinaryAndUnzip() {
  const arch = getArch();
  const osname = getOS();
  const ext = getExtension();
  const ckbVersionOSName = `ckb_v${MINIMAL_VERSION}_${arch}-${osname}`;
  try {
    const tempFilePath = path.join(os.tmpdir(), `${ckbVersionOSName}.${ext}`);
    await downloadAndSaveCKBBinary(tempFilePath);

    // Unzip the file
    const extractDir = path.join(targetEnvironmentPath, `ckb_v${MINIMAL_VERSION}`);
    await unZipFile(tempFilePath, extractDir, ext === 'tar.gz');

    // Install the extracted files
    const sourcePath = path.join(extractDir, ckbVersionOSName);
    fs.renameSync(sourcePath, ckbFolderPath); // Move binary to desired location
    fs.chmodSync(ckbBinPath, '755'); // Make the binary executable

    console.log('CKB installed successfully.');
  } catch (error) {
    console.error('Error installing dependency binary:', error);
  }
}

export async function downloadAndSaveCKBBinary(tempFilePath: string) {
  const downloadURL = buildDownloadUrl(MINIMAL_VERSION);
  const response = await axios.get(downloadURL, {
    responseType: 'arraybuffer',
  });
  fs.writeFileSync(tempFilePath, response.data);
}

export async function unZipFile(filePath: string, extractDir: string, useTar: boolean = false) {
  // Ensure the destination directory exists, if not create it
  if (!fs.existsSync(extractDir)) {
    fs.mkdirSync(extractDir, { recursive: true });
  }

  if (useTar === true) {
    return await decompressTarGzAsync(filePath, extractDir);
  }

  const zip = new AdmZip(filePath);
  zip.extractAllTo(extractDir, true);
}

export async function decompressTarGzAsync(tarballPath: string, destinationDir: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Create a readable stream from the .tar.gz file
    const tarballStream = fs.createReadStream(tarballPath);

    // Extract the contents of the .tar.gz file to the destination directory
    tarballStream
      .pipe(
        tar.x({
          cwd: destinationDir,
        }),
      )
      .on('error', (err) => {
        console.error('Error extracting tarball:', err);
        reject(err); // Reject with error if extraction fails
      })
      .on('finish', () => {
        console.log('Extraction complete.');
        resolve(); // Resolve when extraction completes
      });
  });
}

export function getInstalledVersion(): string | null {
  try {
    const versionOutput = execSync(`${BINARY} --version`, {
      encoding: 'utf-8',
    });

    const versionMatch = versionOutput.match(/(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      return versionMatch[0];
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function isVersionOutdated(installedVersion: string): boolean {
  return semver.lt(installedVersion, MINIMAL_VERSION);
}

export function getOS(): string {
  const platform = os.platform();
  if (platform === 'darwin') {
    return 'apple-darwin';
  } else if (platform === 'linux') {
    return 'unknown-linux-gnu';
  } else if (platform === 'win32') {
    return 'pc-windows-msvc';
  } else {
    throw new Error('Unsupported operating system');
  }
}

export function getArch(): string {
  const arch = os.arch();
  if (arch === 'x64') {
    return 'x86_64';
  } else if (arch === 'arm64') {
    return 'aarch64';
  } else {
    throw new Error('Unsupported architecture');
  }
}

export function getExtension(): 'tar.gz' | 'zip' {
  const platform = os.platform();
  if (platform === 'linux') {
    return 'tar.gz';
  }
  return 'zip';
}

export function buildDownloadUrl(version: string, opt: { os?: string; arch?: string; ext?: string } = {}): string {
  const os = opt.os || getOS();
  const arch = opt.arch || getArch();
  const extension = opt.ext || getExtension();
  return `https://github.com/nervosnetwork/ckb/releases/download/v${version}/ckb_v${version}_${arch}-${os}.${extension}`;
}
