import axios, { AxiosProxyConfig, AxiosRequestConfig } from 'axios';
import { readSettings } from '../cfg/setting';

export class Request {
  static proxy = readSettings().proxy;

  static async send(_config: AxiosRequestConfig) {
    const config = this.proxy ? { ...{ proxy: this.proxy }, ..._config } : _config;
    console.log(config);
    return await axios(config);
  }

  static async get(url: string, _config?: AxiosRequestConfig) {
    const config = this.proxy ? { ...{ proxy: this.proxy }, ..._config } : _config;
    console.log(config);
    return await axios.get(url, config);
  }

  static parseProxyUrl(url: string): AxiosProxyConfig {
    const parsedUrl = new URL(url);

    const proxyConfig: AxiosProxyConfig = {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port, 10),
    };

    if (parsedUrl.username || parsedUrl.password) {
      proxyConfig.auth = {
        username: parsedUrl.username,
        password: parsedUrl.password,
      };
    }

    if (parsedUrl.protocol) {
      proxyConfig.protocol = parsedUrl.protocol.slice(0, -1); // Remove the trailing ':'
    }

    return proxyConfig;
  }

  static proxyConfigToUrl(proxy: AxiosProxyConfig): string {
    const protocol = proxy.protocol ? `${proxy.protocol}://` : '';
    const auth = proxy.auth ? `${proxy.auth.username}:${proxy.auth.password}@` : '';
    const port = proxy.port ? `:${proxy.port}` : '';

    return `${protocol}${auth}${proxy.host}${port}`;
  }
}
