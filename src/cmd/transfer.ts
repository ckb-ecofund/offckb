import { CKB } from '../util/ckb';
import { NetworkOption, Network } from '../util/type';
import { buildTestnetTxLink } from '../util/link';
import { validateNetworkOpt } from '../util/validator';

export interface TransferOptions extends NetworkOption {
  privkey?: string | null;
}

export async function transfer(toAddress: string, amount: string, opt: TransferOptions = { network: Network.devnet }) {
  const network = opt.network;
  validateNetworkOpt(network);

  if (opt.privkey == null) {
    throw new Error('--privkey is required!');
  }

  const privateKey = opt.privkey;
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
