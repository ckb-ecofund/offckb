import { AxiosProxyConfig } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import envPaths from './env-path';
import { deepMerge } from '../util/setting';

const paths = envPaths('offckb');
export const configPath = path.join(paths.config, 'settings.json');
export const dataPath = paths.data;
export const cachePath = paths.cache;

export interface Settings {
  proxy?: AxiosProxyConfig;
  bins: {
    rootFolder: string;
    defaultCKBVersion: string;
    downloadPath: string;
  };
  devnet: {
    configPath: string;
    dataPath: string;
    debugFullTransactionsPath: string;
    transactionsPath: string;
    failedTransactionsPath: string;
    contractsPath: string;
  };
  testnet: {
    contractsPath: string;
  };
  mainnet: {
    contractsPath: string;
  };
  dappTemplate: {
    gitRepoUrl: string;
    gitBranch: string;
    gitFolder: string;
  };
}

export const defaultSettings: Settings = {
  proxy: undefined,
  bins: {
    rootFolder: path.resolve(dataPath, 'bins'),
    defaultCKBVersion: '0.113.1', // this also the default version
    downloadPath: path.resolve(cachePath, 'download'),
  },
  devnet: {
    configPath: path.resolve(dataPath, 'devnet'),
    dataPath: path.resolve(dataPath, 'devnet/data'),
    debugFullTransactionsPath: path.resolve(cachePath, 'devnet/full-transactions'),
    transactionsPath: path.resolve(dataPath, 'devnet/transactions'),
    failedTransactionsPath: path.resolve(dataPath, 'devnet/failed-transactions'),
    contractsPath: path.resolve(dataPath, 'devnet/contracts'),
  },
  testnet: {
    contractsPath: path.resolve(dataPath, 'testnet/contracts'),
  },
  mainnet: {
    contractsPath: path.resolve(dataPath, 'mainnet/contracts'),
  },
  dappTemplate: {
    gitRepoUrl: `https://github.com/ckb-ecofund/offckb`,
    gitBranch: 'v0.3.x',
    gitFolder: 'templates/v3',
  },
};

export function readSettings(): Settings {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return deepMerge(defaultSettings, JSON.parse(data)) as Settings;
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

export function getCKBBinaryInstallPath(version: string) {
  const setting = readSettings();
  return `${setting.bins.rootFolder}/${version}`;
}

export function getCKBBinaryPath(version: string) {
  return `${getCKBBinaryInstallPath(version)}/ckb`;
}

export const settings = readSettings();
