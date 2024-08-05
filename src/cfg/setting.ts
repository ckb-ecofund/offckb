import { AxiosProxyConfig } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import envPaths from './env-path';

const paths = envPaths('offckb');
const configPath = path.join(paths.config, 'settings.json');

export interface Settings {
  proxy?: AxiosProxyConfig;
}

export const defaultSettings: Settings = {
  proxy: undefined,
};

export function readSettings(): Settings {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data) as Settings;
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
