import path from 'path';
import { readSettings } from '../cfg/setting';
import { unZipFile } from '../node/install';
import fs from 'fs';
import os from 'os';
import { Request } from '../util/request';
import { encodeBinPathForTerminal } from '../util/encoding';

export class MoleculecES {
  static isBinaryInstalled() {
    return fs.existsSync(this.binPath);
  }

  static async installMoleculeES(version: string) {
    const arch = getArch();
    const osname = getOS();
    const fileName = `moleculec-es-v${version}-${osname}-${arch}.tar.gz`;
    try {
      const tempFilePath = path.join(os.tmpdir(), fileName);
      await MoleculecES.downloadAndSaveMoleculeES(version, tempFilePath);

      // Unzip the file
      const extractDir = path.join(readSettings().tools.moleculeES.downloadPath, `molecule-es_v${version}`);
      await unZipFile(tempFilePath, extractDir, true);

      // Install the extracted files
      const sourcePath = path.join(extractDir, 'moleculec-es');
      const targetPath = MoleculecES.binPath;
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
      fs.chmodSync(targetPath, '755'); // Make the binary executable

      console.log(`Molecule-ES ${version} installed successfully.`);
    } catch (error) {
      console.error('Error installing Molecule-ES:', error);
    }
  }

  static get binPath() {
    return path.join(readSettings().tools.moleculeES.binFolder, 'moleculec-es');
  }

  static get bin() {
    return encodeBinPathForTerminal(this.binPath);
  }

  static async downloadAndSaveMoleculeES(version: string, tempFilePath: string) {
    const downloadURL = MoleculecES.buildDownloadUrl(version);
    const response = await Request.send(downloadURL);
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));
  }

  static buildDownloadUrl(version: string): string {
    const osName: string = getOS();
    const archName: string = getArch();
    // https://github.com/nervosnetwork/moleculec-es/releases/download/0.4.6/moleculec-es_0.4.6_darwin_arm64.tar.gz
    // https://github.com/nervosnetwork/moleculec-es/releases/download/0.4.6/moleculec-es_0.4.6_darwin_amd64.tar.gz
    return `https://github.com/nervosnetwork/moleculec-es/releases/download/${version}/moleculec-es_${version}_${osName}_${archName}.tar.gz`;
  }
}

function getOS(): string {
  const platform = os.platform();
  if (platform === 'darwin') {
    return 'darwin';
  } else if (platform === 'linux') {
    return 'linux';
  } else if (platform === 'win32') {
    return 'windows';
  } else {
    throw new Error('Unsupported operating system');
  }
}

function getArch(): string {
  const arch = os.arch();
  if (arch === 'x64') {
    return 'amd64';
  } else if (arch === 'arm64') {
    return 'arm64';
  } else {
    throw new Error('Unsupported architecture');
  }
}
