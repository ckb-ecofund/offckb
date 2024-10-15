// this is a rewrite for util/ckb.ts
// to replace lumos with ccc

import { ccc, ClientPublicMainnet, ClientPublicTestnet, OutPoint } from '@ckb-ccc/core';
import { Network } from '../util/type';
import { isValidNetworkString } from '../util/validator';
import { networks } from './network';
import { buildCCCDevnetKnownScripts } from '../scripts/private';
import { HexString } from '@ckb-lumos/lumos';

export class CKBProps {
  network?: Network;
  isEnableProxyRpc?: boolean;
}

export class CKB {
  private client: ClientPublicTestnet | ClientPublicMainnet;

  constructor({ network = Network.devnet, isEnableProxyRpc = false }: CKBProps) {
    if (!isValidNetworkString(network)) {
      throw new Error('invalid network option');
    }

    if (isEnableProxyRpc === true) {
      this.client =
        network === 'mainnet'
          ? new ccc.ClientPublicMainnet({ url: networks.mainnet.proxy_rpc_url })
          : network === 'testnet'
            ? new ccc.ClientPublicTestnet({ url: networks.testnet.proxy_rpc_url })
            : new ccc.ClientPublicTestnet({
                url: networks.devnet.proxy_rpc_url,
                scripts: buildCCCDevnetKnownScripts(),
              });
    } else {
      this.client =
        network === 'mainnet'
          ? new ccc.ClientPublicMainnet()
          : network === 'testnet'
            ? new ccc.ClientPublicTestnet()
            : new ccc.ClientPublicTestnet({
                url: networks.devnet.rpc_url,
                scripts: buildCCCDevnetKnownScripts(),
              });
    }
  }

  buildSigner(privateKey: HexString) {
    const signer = new ccc.SignerCkbPrivateKey(this.client, privateKey);
    return signer;
  }

  async deployTypeIDScript(scriptBinBytes: HexString, privateKey: string) {
    const signer = this.buildSigner(privateKey);
    const signerSecp256k1Address = await signer.getAddressObjSecp256k1();
    const typeIdTx = ccc.Transaction.from({
      outputs: [
        {
          lock: signerSecp256k1Address.script,
          type: await ccc.Script.fromKnownScript(this.client, ccc.KnownScript.TypeId, '00'.repeat(32)),
        },
      ],
      outputsData: [scriptBinBytes],
    });
    await typeIdTx.completeInputsByCapacity(signer);
    if (!typeIdTx.outputs[0].type) {
      throw new Error('Unexpected disappeared output');
    }
    typeIdTx.outputs[0].type.args = ccc.hashTypeId(typeIdTx.inputs[0], 0);
    await typeIdTx.completeFeeBy(signer);
    const txHash = await signer.sendTransaction(typeIdTx);
    return txHash;
  }

  async upgradeTypeIdScript(scriptBinBytes: HexString, outpoint: OutPoint, typeId: HexString, privateKey: HexString) {
    const cell = await this.client.getCell(outpoint);
    if (cell == null) {
      throw new Error('type id cell not found!');
    }
    const cellInput = ccc.CellInput.from({ previousOutput: cell.outPoint, since: 0 });
    const signer = this.buildSigner(privateKey);
    const signerSecp256k1Address = await signer.getAddressObjSecp256k1();
    const typeIdTx = ccc.Transaction.from({
      inputs: [cellInput],
      outputs: [
        {
          lock: signerSecp256k1Address.script,
          type: await ccc.Script.fromKnownScript(this.client, ccc.KnownScript.TypeId, '00'.repeat(32)),
        },
      ],
      outputsData: [scriptBinBytes],
    });
    await typeIdTx.completeInputsByCapacity(signer);
    if (!typeIdTx.outputs[0].type) {
      throw new Error('Unexpected disappeared output');
    }
    typeIdTx.outputs[0].type.args = typeId as `0x{string}`;
    await typeIdTx.completeFeeBy(signer);
    const txHash = await signer.sendTransaction(typeIdTx);
    return txHash;
  }
}
