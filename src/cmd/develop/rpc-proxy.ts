import httpProxy from 'http-proxy';
import http from 'http';

export function createRPCProxy(targetRpcUrl: string, port: number) {
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
            console.debug(tx);
            // todo: record tx
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
