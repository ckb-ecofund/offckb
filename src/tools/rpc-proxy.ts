import httpProxy from 'http-proxy';
import http from 'http';
import { Network } from '../util/type';
import fs from 'fs';
import { readSettings } from '../cfg/setting';
import path from 'path';

// todo: if we use import this throws error in tsc building
const { cccA } = require('@ckb-ccc/core/advanced');

export function createRPCProxy(network: Network, targetRpcUrl: string, port: number) {
  const proxy = httpProxy.createProxyServer({
    target: targetRpcUrl, // Target RPC server
  });

  const server = http.createServer((req, res) => {
    proxy.web(req, res, {}, (err) => {
      if (err) {
        console.error('Proxy error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Proxy error');
      }
    });

    proxy.on('proxyReq', (_, req) => {
      let reqData = '';
      req.on('data', (chunk) => {
        reqData += chunk;
      });
      req.on('end', () => {
        try {
          const jsonRpcContent = JSON.parse(reqData);
          console.debug('Incoming Request: ', jsonRpcContent);
          const method = jsonRpcContent.method;
          const params = jsonRpcContent.params;

          if (method === 'send_transaction') {
            const tx = params[0];
            // todo: record tx
            if (network === Network.devnet) {
              const cccTx = cccA.JsonRpcTransformers.transactionTo(tx);
              const txHash = cccTx.hash();
              const settings = readSettings();
              console.log('txHash: ', txHash, settings, settings.devnet.transactionsPath);
              if (!fs.existsSync(settings.devnet.transactionsPath)) {
                fs.mkdirSync(settings.devnet.transactionsPath);
              }
              const txFile = path.resolve(settings.devnet.transactionsPath, `${txHash}.json`);
              fs.writeFileSync(txFile, JSON.stringify(tx, null, 2));
            }
          }
        } catch (err) {
          console.error('Error parsing JSON-RPC content:', err);
        }
      });
    });

    // Capture the content from the response (or request)
    proxy.on('proxyRes', (proxyRes) => {
      let data = '';
      proxyRes.on('data', (chunk) => {
        data += chunk;
      });

      proxyRes.on('end', () => {
        console.log('Captured content:', data);
        // Do something with the captured content
      });
    });
  });

  return {
    server,
    network,
    start: () => {
      return server.listen(port, () => {
        console.debug(`Proxy server running on http://localhost:${port}`);
      });
    },
    stop: () => {
      return server.close();
    },
  };
}
