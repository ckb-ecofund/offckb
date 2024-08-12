import { readSettings, writeSettings } from '../cfg/setting';
import { Request } from '../util/request';

export enum ConfigAction {
  get = 'get',
  set = 'set',
  rm = 'rm',
}

export enum ConfigSection {
  proxy = 'proxy',
}

export async function Config(action: ConfigAction, section: ConfigSection, value?: string) {
  if (action === ConfigAction.get) {
    switch (section) {
      case ConfigSection.proxy: {
        const settings = readSettings();
        const proxy = settings.proxy;
        if (proxy == null) {
          console.log(`No Proxy.`);
          process.exit(0);
        }
        return console.log(`${Request.proxyConfigToUrl(proxy)}`);
      }

      default:
        break;
    }
  }

  if (action === ConfigAction.set) {
    switch (section) {
      case ConfigSection.proxy: {
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

      default:
        break;
    }
  }

  if (action === ConfigAction.rm) {
    switch (section) {
      case ConfigSection.proxy: {
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
