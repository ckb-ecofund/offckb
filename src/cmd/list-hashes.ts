import { execSync } from 'child_process';
import { installDependency } from './develop/install';
import { initChainIfNeeded } from './develop/init-chain';
import { settings } from '../cfg/setting';
import { encodePathForTerminal } from '../util/encoding';

export async function listHashes() {
  await installDependency();
  await initChainIfNeeded();

  const ckbBinPath = encodePathForTerminal(settings.devnet.CKBBinaryPath);
  const devnetPath = encodePathForTerminal(settings.devnet.configPath);
  const cmd = `${ckbBinPath} list-hashes  -C ${devnetPath}`;
  try {
    execSync(cmd, {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Error running dependency binary:', error);
  }
}
