import { spawnSync, execSync } from 'child_process';

export class MoleculecGo {
  static isBinaryInstalled() {
    const result = spawnSync('moleculec-go', ['--version'], { stdio: 'ignore' });
    return result.status === 0 && this.checkVersion();
  }

  static checkVersion() {
    // cmd: moleculec-go --version
    // output: Moleculec Plugin 0.1.11
    // check if the version is greater than or equal to 0.1.11
    const result = execSync('moleculec-go --version').toString();
    const version = result.split(' ')[2];
    const versionNumber = version.split('.');
    const major = parseInt(versionNumber[0]);
    const minor = parseInt(versionNumber[1]);
    const patch = parseInt(versionNumber[2]);
    return major > 0 || (major === 0 && (minor > 1 || (minor === 1 && patch >= 11)));
  }

  static installBinary() {
    const command = `cargo install moleculec-go`;
    try {
      console.log('Installing ckb-moleculec-go...');
      execSync(command);
      console.log('ckb-moleculec-go installed successfully.');
    } catch (error) {
      console.error('Failed to install ckb-moleculec-go:', error);
      process.exit(1);
    }
  }
}
