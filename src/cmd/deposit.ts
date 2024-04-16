import { CKB } from '../util/ckb';
import axios, { AxiosRequestConfig } from 'axios';
import { generateHex } from './develop/genkey';
import { ckbDevnetMinerAccount } from '../cfg/account';
import { NetworkOption, Network } from '../util/type';
import { buildTestnetTxLink } from '../util/link';
import { validateNetworkOpt } from '../util/validator';

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
    'User-Agent': 'axios-requests/2.31.0',
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

  const config: AxiosRequestConfig = {
    method: 'post',
    url: url,
    headers: headers,
    data: body,
  };

  try {
    const response = await axios(config);
    console.log('send claim request, status: ', response.status); // Handle the response data here
  } catch (error) {
    console.error('Error:', error);
  }
}
