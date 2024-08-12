// take and adapt from https://github.com/sindresorhus/env-paths/blob/main/index.js
import path from 'path';
import os from 'os';
import process from 'process';

const homedir = os.homedir();
const tmpdir = os.tmpdir();
const { env } = process;

const macos = (appName: string) => {
  const library = path.join(homedir, 'Library');

  return {
    data: path.join(library, 'Application Support', appName),
    config: path.join(library, 'Preferences', appName),
    cache: path.join(library, 'Caches', appName),
    log: path.join(library, 'Logs', appName),
    temp: path.join(tmpdir, appName),
  };
};

const windows = (appName: string) => {
  const appData = env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
  const localAppData = env.LOCALAPPDATA || path.join(homedir, 'AppData', 'Local');

  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: path.join(localAppData, appName, 'Data'),
    config: path.join(appData, appName, 'Config'),
    cache: path.join(localAppData, appName, 'Cache'),
    log: path.join(localAppData, appName, 'Log'),
    temp: path.join(tmpdir, appName),
  };
};

// https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
const linux = (appName: string) => {
  const username = path.basename(homedir);

  return {
    data: path.join(env.XDG_DATA_HOME || path.join(homedir, '.local', 'share'), appName),
    config: path.join(env.XDG_CONFIG_HOME || path.join(homedir, '.config'), appName),
    cache: path.join(env.XDG_CACHE_HOME || path.join(homedir, '.cache'), appName),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: path.join(env.XDG_STATE_HOME || path.join(homedir, '.local', 'state'), appName),
    temp: path.join(tmpdir, username, appName),
  };
};

export default function envPaths(appName: string, { suffix = 'nodejs' } = {}) {
  if (typeof appName !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof appName}`);
  }

  if (suffix) {
    // Add suffix to prevent possible conflict with native apps
    appName += `-${suffix}`;
  }

  if (process.platform === 'darwin') {
    return macos(appName);
  }

  if (process.platform === 'win32') {
    return windows(appName);
  }

  return linux(appName);
}
