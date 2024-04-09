import { CKB } from '../cfg/ckb';
import { Network, NetworkOption } from '../cfg/const';
import { buildTestnetTxLink, validateNetworkOpt } from '../util';

export interface TransferOptions extends NetworkOption {}

export async function transfer(
  privateKey: string,
  toAddress: string,
  amount: string,
  opt: TransferOptions = { network: Network.devnet },
) {
  const network = opt.network;
  validateNetworkOpt(network);

  const ckb = new CKB(network);
  const lumosConfig = ckb.getLumosConfig();
  const from = CKB.generateAccountFromPrivateKey(privateKey, lumosConfig);

  const txHash = await ckb.transfer(
    {
      from: from.address,
      to: toAddress,
      amount: amount,
      privKey: privateKey,
    },
    lumosConfig,
  );
  if (network === 'testnet') {
    console.log(`Successfully transfer, check ${buildTestnetTxLink(txHash)} for details.`);
    return;
  }

  console.log('Successfully transfer, txHash:', txHash);
}
