'use client';

import { ClientJsonRpc, KnownScript, Script } from '@ckb-ccc/connector-react';
import offCKBConfig from '@/offckb.config';
import { MAINNET_SCRIPTS, TESTNET_SCRIPTS } from '@ckb-ccc/connector-react/advancedBarrel';

export const DEVNET_SCRIPTS: Record<KnownScript, Pick<Script, 'codeHash' | 'hashType'>> = {
  [KnownScript.Secp256k1Blake160]: {
    codeHash: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160']!.CODE_HASH as any,
    hashType: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160']!.HASH_TYPE,
  },
  [KnownScript.Secp256k1Multisig]: {
    codeHash: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160_MULTISIG']!.CODE_HASH as any,
    hashType: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160_MULTISIG']!.HASH_TYPE,
  },
  [KnownScript.AnyoneCanPay]: {
    codeHash: offCKBConfig.lumosConfig.SCRIPTS['ANYONE_CAN_PAY']!.CODE_HASH as any,
    hashType: offCKBConfig.lumosConfig.SCRIPTS['ANYONE_CAN_PAY']!.HASH_TYPE,
  },
  [KnownScript.JoyId]: {
    // note: this is a fake one since JoyId can't be used under devnet environment
    // JoyId requires a backend service to run, you need to disable joyId login under devnet environment
    codeHash: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160']!.CODE_HASH as any,
    hashType: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160']!.HASH_TYPE,
  },
  [KnownScript.OmniLock]: {
    codeHash: offCKBConfig.lumosConfig.SCRIPTS['OMNILOCK']!.CODE_HASH as any,
    hashType: offCKBConfig.lumosConfig.SCRIPTS['OMNILOCK']!.HASH_TYPE,
  },
};

export class WalletClient extends ClientJsonRpc {
  constructor(url = offCKBConfig.rpcUrl, timeout?: number) {
    super(url, timeout);
  }

  async getAddressPrefix(): Promise<string> {
    return offCKBConfig.addressPrefix;
  }

  async getKnownScript(script: KnownScript): Promise<Pick<Script, 'codeHash' | 'hashType'>> {
    const network = offCKBConfig.currentNetwork;
    const scripts = network === 'devnet' ? DEVNET_SCRIPTS : network === 'testnet' ? TESTNET_SCRIPTS : MAINNET_SCRIPTS;
    return { ...scripts[script] };
  }
}
