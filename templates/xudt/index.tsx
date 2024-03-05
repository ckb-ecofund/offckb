import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Cell, Script } from '@ckb-lumos/lumos';
import {
  capacityOf,
  computeLockScriptHashFromPrivateKey,
  generateAccountFromPrivateKey,
  issueToken,
  queryIssuedTokenCells,
  readTokenAmount,
  transferTokenToAddress,
} from './lib';

const app = document.getElementById('root');
ReactDOM.render(<App />, app);

export function App() {
  const [privKey, setPrivKey] = useState('');
  const [fromAddr, setFromAddr] = useState('');
  const [fromLock, setFromLock] = useState<Script>();
  const [balance, setBalance] = useState('0');

  const [amount, setAmount] = useState('');
  const [cells, setCells] = useState<Cell[]>([]);

  const [udtArgs, setUdtArgs] = useState<string>('');
  const [senderPrivkey, setSenderPrivkey] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');

  useEffect(() => {
    const updateFromInfo = async () => {
      const { lockScript, address } = generateAccountFromPrivateKey(privKey);
      const capacity = await capacityOf(address);
      setFromAddr(address);
      setFromLock(lockScript);
      setBalance(capacity.toString());
    };

    if (privKey) {
      updateFromInfo();
    }
  }, [privKey]);

  const onInputPrivKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Regular expression to match a valid private key with "0x" prefix
    const priv = e.target.value;
    const privateKeyRegex = /^0x[0-9a-fA-F]{64}$/;

    const isValid = privateKeyRegex.test(priv);
    if (isValid) {
      setPrivKey(priv);
    } else {
      alert(
        `Invalid private key: must start with 0x and 32 bytes length. Ensure you're using a valid private key from the offckb accounts list.`,
      );
    }
  };

  const onInputSenderPrivKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Regular expression to match a valid private key with "0x" prefix
    const priv = e.target.value;
    const privateKeyRegex = /^0x[0-9a-fA-F]{64}$/;

    const isValid = privateKeyRegex.test(priv);
    if (isValid) {
      setSenderPrivkey(priv);
    } else {
      alert(
        `Invalid private key: must start with 0x and 32 bytes length. Ensure you're using a valid private key from the offckb accounts list.`,
      );
    }
  };

  const enabledIssue = +amount > 0 && +balance > 6100000000;
  const enabledCheck = privKey.length > 0;
  return (
    <div>
      <h1>
        Issue Custom Token{' '}
        <small>
          <a href="https://github.com/XuJiandong/rfcs/blob/xudt/rfcs/0052-extensible-udt/0052-extensible-udt.md#xudt-witness">
            {'(xUDT specs)'}
          </a>
        </small>
      </h1>
      <p></p>
      <label htmlFor="private-key">Private Key: </label>&nbsp;
      <input id="private-key" type="text" onChange={onInputPrivKey} />
      <ul>
        <li>CKB Address: {fromAddr}</li>
        <li>
          Current lock script:
          <pre>{JSON.stringify(fromLock, null, 2)}</pre>
        </li>

        <li>Total capacity: {(+balance).toLocaleString()}</li>
      </ul>
      <br />
      <label htmlFor="amount">Token Amount</label>
      &nbsp;
      <input id="amount" type="text" onChange={(e) => setAmount(e.target.value)} />
      <br />
      <button disabled={!enabledIssue} onClick={() => issueToken(privKey, amount).catch(alert)}>
        Issue token
      </button>
      <br />
      <br />
      <hr />
      
      <p>after issued token, click the below button to check it</p>
      <button disabled={!enabledCheck} onClick={() => queryIssuedTokenCells(privKey).then(setCells).catch(alert)}>
        Check issued token
      </button>
      {cells.length > 0 && <h3>Result: all the cells which hosted this issued token</h3>}
      {cells.map((cell, index) => (
        <div key={index}>
          <p>Cell #{index}</p>
          <p>token amount: {readTokenAmount(cell.data).toNumber()}</p>
          <p>issuer lockScript Hash: {computeLockScriptHashFromPrivateKey(privKey)}</p>
          <p>token xudt args: {cell.cellOutput.type.args}</p>
          <p>token holder's lockScript args: {cell.cellOutput.lock.args}</p>
          <hr />
        </div>
      ))}
      <br /><br /><br />
      <hr />

      <p>try transfer the issued token to some addresses</p>
      <label htmlFor="sender-private-key">Private Key: </label>&nbsp;
      <input id="sender-private-key" type="text" onChange={onInputSenderPrivKey} />
      <label htmlFor="udt">UDT args</label>
      &nbsp;
      <input id="udt" type="text" onChange={(e) => setUdtArgs(e.target.value)} />
      <br /> 
      <label htmlFor="transferAmount">Transfer Token Amount</label>
      &nbsp;
      <input id="transferAmount" type="text" onChange={(e) => setTransferAmount(e.target.value)} />
      <br />
      <label htmlFor="receiverAddress">Receiver Address</label>
      &nbsp;
      <input id="receiverAddress" type="text" onChange={(e) => setReceiverAddress(e.target.value)} />
      <br />

      <button disabled={!enabledCheck} onClick={() => transferTokenToAddress(udtArgs, senderPrivkey, transferAmount, receiverAddress).catch(alert)}>
        Transfer issued token
      </button>
    </div>
  );
}
