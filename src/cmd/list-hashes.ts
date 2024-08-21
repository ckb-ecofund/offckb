import { execSync } from 'child_process';
import { installCKBBinary } from './develop/install';
import { initChainIfNeeded } from './develop/init-chain';
import { getCKBBinaryPath, readSettings } from '../cfg/setting';
import { encodeBinPathForTerminal } from '../util/encoding';

export async function listHashes(version?: string) {
  const settings = readSettings();
  const ckbVersion = version || settings.bins.defaultCKBVersion;
  await installCKBBinary(ckbVersion);
  await initChainIfNeeded();

  const ckbBinPath = encodeBinPathForTerminal(getCKBBinaryPath(ckbVersion));
  const devnetPath = encodeBinPathForTerminal(settings.devnet.configPath);
  const cmd = `${ckbBinPath} list-hashes  -C ${devnetPath}`;
  try {
    execSync(cmd, {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Error running dependency binary:', error);
  }
}
