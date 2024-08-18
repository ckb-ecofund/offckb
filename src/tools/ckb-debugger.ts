import { spawnSync, execSync } from 'child_process';

export interface DebugOption {
  fullTxJsonFilePath: string;
  cellIndex: number;
  cellType: 'output' | 'input';
  scriptGroupType: 'lock' | 'type';
}

export class CKBDebugger {
  static runRaw(options: string) {
    const command = `ckb-debugger ${options}`;
    execSync(command, { stdio: 'inherit' });
  }

  static runTxCellScript({ fullTxJsonFilePath, cellIndex, cellType, scriptGroupType }: DebugOption) {
    const command = `ckb-debugger --tx-file ${fullTxJsonFilePath} --cell-index ${cellIndex} --cell-type ${cellType} --script-group-type ${scriptGroupType}`;
    execSync(command, { stdio: 'inherit' });
  }

  static isBinaryInstalled() {
    const result = spawnSync('ckb-debugger', ['--version'], { stdio: 'ignore' });
    return result.status === 0;
  }

  static installCKBDebugger() {
    const command = `cargo install --git https://github.com/nervosnetwork/ckb-standalone-debugger ckb-debugger`;
    try {
      console.log('Installing ckb-debugger...');
      execSync(command);
      console.log('ckb-debugger installed successfully.');
    } catch (error) {
      console.error('Failed to install ckb-debugger:', error);
      process.exit(1);
    }
  }
}
