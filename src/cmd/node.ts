import { exec } from 'child_process';
import { initChainIfNeeded } from './develop/init-chain';
import { installDependency } from './develop/install';
import { readSettings } from '../cfg/setting';
import { encodePathForTerminal } from '../util/encoding';

export async function node() {
  await installDependency();
  await initChainIfNeeded();

  const settings = readSettings();
  const ckbBinPath = encodePathForTerminal(settings.devnet.CKBBinaryPath);
  const devnetConfigPath = encodePathForTerminal(settings.devnet.configPath);

  const ckbCmd = `${ckbBinPath} run -C ${devnetConfigPath}`;
  const minerCmd = `${ckbBinPath} miner -C ${devnetConfigPath}`;
  try {
    // Run first command
    const ckbProcess = exec(ckbCmd);
    // Log first command's output
    ckbProcess.stdout?.on('data', (data) => {
      console.log('CKB output:', data.toString());
    });

    ckbProcess.stderr?.on('data', (data) => {
      console.error('CKB error:', data.toString());
    });

    // Start the second command after 3 seconds
    setTimeout(async () => {
      try {
        // Run second command
        const minerProcess = exec(minerCmd);
        minerProcess.stdout?.on('data', (data) => {
          console.log('CKB-Miner:', data.toString());
        });

        minerProcess.stderr?.on('data', (data) => {
          console.error('CKB-Miner error:', data.toString());
        });
      } catch (error) {
        console.error('Error running CKB-Miner:', error);
      }
    }, 3000);
  } catch (error) {
    console.error('Error:', error);
  }
}
