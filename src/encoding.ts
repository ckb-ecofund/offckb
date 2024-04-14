import { execSync } from 'child_process';
import os from 'os';

export function setUTF8EncodingForWindows() {
  if (os.platform() === 'win32') {
    try {
      execSync('chcp 65001');
    } catch (error: unknown) {
      console.error('Failed to set UTF-8 encoding for Windows terminal.', (error as Error).message);
    }
  }
}
