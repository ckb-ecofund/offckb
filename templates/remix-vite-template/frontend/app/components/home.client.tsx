import { ccc } from '@ckb-ccc/connector-react';
import { Wallet } from './wallet.client';
import offckb from 'offckb.config';

export default function Home() {
  return (
    <ccc.Provider>
      <div>
        <h1>Minimal Template for CKB Dapp</h1>
        <p>Tech stack: </p>
        <li>
          <a target="_blank" href="https://github.com/cryptape/ckb-script-templates" rel="noreferrer">
            ckb-scripts-template
          </a>{' '}
          for smart contract development
        </li>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/blog" rel="noreferrer">
            remix-vite
          </a>{' '}
          and{'  '}
          <a target="_blank" href="https://github.com/ckb-js/lumos" rel="noreferrer">
            Lumos
          </a>{' '}
          for frontend development
        </li>

        <p>
          Current Network: {offckb.currentNetwork}, CKB rpc url: {offckb.rpcUrl}
        </p>
        <p>
          HELLO_WORLD Script code hash:{' '}
          {offckb.lumosConfig.SCRIPTS['HELLO_WORLD']
            ? offckb.lumosConfig.SCRIPTS['HELLO_WORLD']?.CODE_HASH
            : 'Not Found, deploy script first.'}
        </p>
        <p>
          Below is a simple CKB wallet connector powered by{' '}
          <a href="https://github.com/ckb-ecofund/ccc" target="_blank" rel="noopener noreferrer">
            CCC
          </a>
        </p>
      </div>
      <Wallet />
    </ccc.Provider>
  );
}
