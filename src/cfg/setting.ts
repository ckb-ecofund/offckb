import { AxiosProxyConfig } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import envPaths from './env-path';

const paths = envPaths('offckb');
const configPath = path.join(paths.config, 'settings.json');
const dataPath = paths.data;
const cachePath = paths.cache;

export interface Settings {
  proxy?: AxiosProxyConfig;
  devnet: {
    configPath: string;
    dataPath: string;
    minimalRequiredCKBVersion: string;
    binaryFolderPath: string;
    CKBBinaryPath: string;
    downloadPath: string;
  };
  dappTemplate: {
    gitRepoUrl: string;
    gitBranch: string;
    gitFolder: string;
  };
}

export const defaultSettings: Settings = {
  proxy: undefined,
  devnet: {
    downloadPath: path.resolve(cachePath, 'download'),
    configPath: path.resolve(dataPath, 'devnet'),
    dataPath: path.resolve(dataPath, 'devnet/data'),
    minimalRequiredCKBVersion: '0.113.1',
    binaryFolderPath: path.resolve(dataPath, 'binary'),
    CKBBinaryPath: path.resolve(dataPath, 'binary', 'ckb'),
  },
  dappTemplate: {
    gitRepoUrl: `https://github.com/RetricSu/offckb`,
    gitBranch: 'develop',
    gitFolder: 'templates',
  },
};

export function readSettings(): Settings {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) } as Settings;
    } else {
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error reading settings:', error);
    return defaultSettings;
  }
}

export function writeSettings(settings: Settings): void {
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(settings, null, 2));
    console.log('save new settings');
  } catch (error) {
    console.error('Error writing settings:', error);
  }
}

export const settings = readSettings();
