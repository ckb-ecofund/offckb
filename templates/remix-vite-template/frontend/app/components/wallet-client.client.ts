import { ccc, CellDepInfoLike, KnownScript, Script } from '@ckb-ccc/connector-react';
import offCKBConfig, { Network } from 'offckb.config';

export const DEVNET_SCRIPTS: Record<string, Pick<Script, 'codeHash' | 'hashType'> & { cellDeps: CellDepInfoLike[] }> = {
  [KnownScript.Secp256k1Blake160]: {
    codeHash: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160']!.CODE_HASH as `0x${string}`,
    hashType: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160']!.HASH_TYPE,
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160']!.TX_HASH,
            index: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160']!.INDEX,
          },
          depType: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160']!.DEP_TYPE,
        },
      },
    ],
  },
  [KnownScript.Secp256k1Multisig]: {
    codeHash: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160_MULTISIG']!.CODE_HASH as `0x{string}`,
    hashType: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160_MULTISIG']!.HASH_TYPE,
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160_MULTISIG']!.TX_HASH,
            index: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160_MULTISIG']!.INDEX,
          },
          depType: offCKBConfig.lumosConfig.SCRIPTS['SECP256K1_BLAKE160_MULTISIG']!.DEP_TYPE,
        },
      },
    ],
  },
  [KnownScript.AnyoneCanPay]: {
    codeHash: offCKBConfig.lumosConfig.SCRIPTS['ANYONE_CAN_PAY']!.CODE_HASH as `0x{string}`,
    hashType: offCKBConfig.lumosConfig.SCRIPTS['ANYONE_CAN_PAY']!.HASH_TYPE,
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash: offCKBConfig.lumosConfig.SCRIPTS['ANYONE_CAN_PAY']!.TX_HASH,
            index: offCKBConfig.lumosConfig.SCRIPTS['ANYONE_CAN_PAY']!.INDEX,
          },
          depType: offCKBConfig.lumosConfig.SCRIPTS['ANYONE_CAN_PAY']!.DEP_TYPE,
        },
      },
    ],
  },
  [KnownScript.OmniLock]: {
    codeHash: offCKBConfig.lumosConfig.SCRIPTS['OMNILOCK']!.CODE_HASH as `0x{string}`,
    hashType: offCKBConfig.lumosConfig.SCRIPTS['OMNILOCK']!.HASH_TYPE,
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash: offCKBConfig.lumosConfig.SCRIPTS['OMNILOCK']!.TX_HASH,
            index: offCKBConfig.lumosConfig.SCRIPTS['OMNILOCK']!.INDEX,
          },
          depType: offCKBConfig.lumosConfig.SCRIPTS['OMNILOCK']!.DEP_TYPE,
        },
      },
    ],
  },
  [KnownScript.TypeId]: {
    codeHash: '0x00000000000000000000000000000000000000000000000000545950455f4944',
    hashType: 'type',
    cellDeps: [],
  },
  [KnownScript.XUdt]: {
    codeHash: offCKBConfig.lumosConfig.SCRIPTS['XUDT']!.CODE_HASH as `0x{string}`,
    hashType: offCKBConfig.lumosConfig.SCRIPTS['XUDT']!.HASH_TYPE,
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash: offCKBConfig.lumosConfig.SCRIPTS['XUDT']!.TX_HASH,
            index: offCKBConfig.lumosConfig.SCRIPTS['XUDT']!.INDEX,
          },
          depType: offCKBConfig.lumosConfig.SCRIPTS['XUDT']!.DEP_TYPE,
        },
      },
    ],
  },
};

export function buildCccClient(network: Network) {
  const client =
    network === 'mainnet'
      ? new ccc.ClientPublicMainnet()
      : network === 'testnet'
        ? new ccc.ClientPublicTestnet()
        : new ccc.ClientPublicTestnet(offCKBConfig.rpcUrl, undefined, DEVNET_SCRIPTS);

  return client;
}
