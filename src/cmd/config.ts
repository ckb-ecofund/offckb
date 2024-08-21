import { readSettings, writeSettings } from '../cfg/setting';
import { Request } from '../util/request';
import { isValidVersion } from '../util/validator';

export enum ConfigAction {
  list = 'list',
  get = 'get',
  set = 'set',
  rm = 'rm',
}

export enum ConfigItem {
  proxy = 'proxy',
  ckbVersion = 'ckb-version',
}

export async function Config(action: ConfigAction, item: ConfigItem, value?: string) {
  if (action === ConfigAction.list) {
    return console.log(readSettings());
  }

  if (action === ConfigAction.get) {
    switch (item) {
      case ConfigItem.proxy: {
        const settings = readSettings();
        const proxy = settings.proxy;
        if (proxy == null) {
          console.log(`No Proxy.`);
          process.exit(0);
        }
        return console.log(`${Request.proxyConfigToUrl(proxy)}`);
      }

      case ConfigItem.ckbVersion: {
        const settings = readSettings();
        const version = settings.bins.defaultCKBVersion;
        return console.log(`${version}`);
      }

      default:
        break;
    }
  }

  if (action === ConfigAction.set) {
    switch (item) {
      case ConfigItem.proxy: {
        if (value == null) throw new Error('No proxyUrl!');

        try {
          const proxy = Request.parseProxyUrl(value);
          const settings = readSettings();
          settings.proxy = proxy;
          return writeSettings(settings);
        } catch (error: unknown) {
          return console.error(`invalid proxyURL, `, (error as Error).message);
        }
      }

      case ConfigItem.ckbVersion: {
        const settings = readSettings();
        try {
          if (isValidVersion(value)) {
            settings.bins.defaultCKBVersion = value as string;
            return writeSettings(settings);
          } else {
            return console.error(`invalid version value, `, value);
          }
        } catch (error: unknown) {
          return console.error(`invalid version value, `, (error as Error).message);
        }
      }

      default:
        break;
    }
  }

  if (action === ConfigAction.rm) {
    switch (item) {
      case ConfigItem.proxy: {
        const settings = readSettings();
        settings.proxy = undefined;
        return writeSettings(settings);
      }

      default:
        break;
    }
  }

  throw new Error('invalid config action.');
}
