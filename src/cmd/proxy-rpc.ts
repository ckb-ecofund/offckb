import { readSettings } from '../cfg/setting';
import { createRPCProxy } from '../tools/rpc-proxy';
import { Network } from '../type/base';

export interface ProxyRpcOptions {
  ckbRpc?: string;
  port?: number;
  network?: Network;
}

export function proxyRpc(options: ProxyRpcOptions) {
  const settings = readSettings();
  const network = options.network || Network.devnet;
  let ckbRpc = options.ckbRpc;
  if (!ckbRpc) {
    ckbRpc =
      network === Network.devnet
        ? settings.devnet.rpcUrl
        : network === Network.testnet
          ? settings.testnet.rpcUrl
          : settings.mainnet.rpcUrl;
  }
  const port = options.port || settings.rpc.proxyPort;
  const proxy = createRPCProxy(network, ckbRpc, port);
  proxy.start();
}
