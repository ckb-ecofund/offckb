import { CKB } from '../util/ckb';
import { ckbDevnetMinerAccount } from '../cfg/account';
import { NetworkOption, Network } from '../util/type';
import { buildTestnetTxLink } from '../util/link';
import { validateNetworkOpt } from '../util/validator';
import { Request } from '../util/request';
import { RequestInit } from 'node-fetch';

export interface DepositOptions extends NetworkOption {}

export async function deposit(toAddress: string, amount: string, opt: DepositOptions = { network: Network.devnet }) {
  const network = opt.network;
  validateNetworkOpt(network);

  const ckb = new CKB(network);
  const lumosConfig = ckb.getLumosConfig();

  if (network === 'testnet') {
    return await depositFromTestnetFaucet(toAddress, ckb);
  }

  // deposit from devnet miner
  const from = CKB.generateAccountFromPrivateKey(ckbDevnetMinerAccount.privkey, lumosConfig);
  const txHash = await ckb.transfer(
    {
      from: from.address,
      to: toAddress,
      privKey: from.privKey,
      amount,
    },
    lumosConfig,
  );
  console.log('tx hash: ', txHash);
}

async function depositFromTestnetFaucet(ckbAddress: string, ckb: CKB) {
  console.log('testnet faucet only supports fixed-amount claim: 10,000 CKB');

  const lumosConfig = ckb.getLumosConfig();
  const randomAccountPrivateKey = '0x' + generateHex(64);
  const randomAccount = CKB.generateAccountFromPrivateKey(randomAccountPrivateKey, lumosConfig);

  console.log(
    `use random account to claim from faucet: \n\nprivate key: ${randomAccountPrivateKey}\n\n address: ${randomAccount.address}`,
  );
  try {
    await sendClaimRequest(randomAccount.address);

    console.log('Wait for 4 blocks to transfer all from random account to your account..');
    console.log('You can transfer by yourself if it ends up fails..');
    await ckb.indexer.waitForSync(-4);
    const txHash = await ckb.transferAll(randomAccount.privKey, ckbAddress, lumosConfig);
    console.log(`Done, check ${buildTestnetTxLink(txHash)} for details.`);
  } catch (error) {
    console.log(error);
    throw new Error('request failed.');
  }
}

async function sendClaimRequest(toAddress: string) {
  const url = 'https://faucet-api.nervos.org/claim_events'; // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint

  const headers = {
    'User-Agent': 'node-fetch-requests/v2',
    'Accept-Encoding': 'gzip, deflate',
    Accept: '*/*',
    Connection: 'keep-alive',
    'Content-Type': 'application/json',
  };

  const body = JSON.stringify({
    claim_event: {
      address_hash: toAddress,
      amount: '10000',
    },
  });

  const config: RequestInit = {
    method: 'post',
    headers: headers,
    body,
  };

  try {
    const response = await Request.send(url, config);
    console.log('send claim request, status: ', response.status); // Handle the response data here
  } catch (error) {
    console.error('Error:', error);
  }
}

function generateHex(length: number) {
  const characters = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}
