import { execSync } from 'child_process';
import { ckbBinPath, devnetPath } from '../cfg/const';
import { installDependency } from './develop/install';
import { initChainIfNeeded } from './develop/init-chain';

export async function listHashes() {
  await installDependency();
  await initChainIfNeeded();

  const cmd = `${ckbBinPath} list-hashes  -C ${devnetPath}`;
  try {
    execSync(cmd, {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Error running dependency binary:', error);
  }
}
