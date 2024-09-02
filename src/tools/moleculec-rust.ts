import { spawnSync, execSync } from 'child_process';

export class MoleculecRust {
  static isBinaryInstalled() {
    const result = spawnSync('moleculec', ['--version'], { stdio: 'ignore' });
    return result.status === 0 && this.checkVersion();
  }

  static checkVersion() {
    // cmd: moleculec --version
    // output: Moleculec 0.8.0
    // check if the version is greater than or equal to 0.8.0
    const result = execSync('moleculec --version').toString();
    const version = result.split(' ')[1];
    const versionNumber = version.split('.');
    const major = parseInt(versionNumber[0]);
    const minor = parseInt(versionNumber[1]);
    const patch = parseInt(versionNumber[2]);
    return major > 0 || (major === 0 && (minor > 8 || (minor === 8 && patch >= 0)));
  }

  static installBinary() {
    const command = `cargo install moleculec`;
    try {
      console.log('Installing ckb-moleculec...');
      execSync(command);
      console.log('ckb-moleculec installed successfully.');
    } catch (error) {
      console.error('Failed to install ckb-moleculec:', error);
      process.exit(1);
    }
  }
}
