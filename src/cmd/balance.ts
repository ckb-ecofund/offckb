import { BI } from '@ckb-lumos/lumos';
import { CKB } from '../cfg/ckb';
import { validateNetworkOpt } from '../util';
import { Network, NetworkOption } from '../cfg/const';

export interface BalanceOption extends NetworkOption {}

export async function balanceOf(address: string, opt: BalanceOption = { network: Network.devnet }) {
  const network = opt.network;
  validateNetworkOpt(network);

  const ckb = new CKB(network);
  const lumosConfig = ckb.getLumosConfig();

  const balance = await ckb.capacityOf(address, lumosConfig);
  const balanceInCKB = balance.div(BI.from('100000000'));
  console.log(`Balance: ${balanceInCKB} CKB`);
}
