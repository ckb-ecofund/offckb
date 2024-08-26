import { config } from '@ckb-lumos/lumos';
import { readSettings } from '../cfg/setting';
import { getListHashes, ListHashes, SystemCell } from './list-hashes';
import toml from '@iarna/toml';
import { CellDepInfoLike, KnownScript, Script } from '@ckb-ccc/core';
import { SystemScript, SystemScriptName, SystemScriptsRecord } from '../scripts/type';

export type PrintProps = 'lumos' | 'ccc';

export async function printSystemScripts(props?: PrintProps) {
  const systemScripts = getSystemScriptsFromListHashes();
  if (systemScripts) {
    if (!props) {
      return printInSystemStyle(systemScripts);
    }

    if (props === 'lumos') {
      return printInLumosConfigStyle(systemScripts);
    }

    if (props === 'ccc') {
      return printInCCCStyle(systemScripts);
    }
  }
}

export function printInSystemStyle(systemScripts: SystemScriptsRecord) {
  console.log('*** OffCKB Devnet System Scripts ***\n');
  for (const [name, script] of Object.entries(systemScripts)) {
    console.log(`- name: ${name}`);
    if (script == null) {
      return console.log(`  undefined\n`);
    }
    console.log(`  file: ${script.file}`);
    console.log(`  code_hash: ${script.script.codeHash}`);
    console.log(`  hash_type: ${script.script.hashType}`);
    console.log(`  cellDeps: ${JSON.stringify(script.script.cellDeps, null, 2)}\n`);
  }
}

export function printInLumosConfigStyle(scripts: SystemScriptsRecord) {
  const config = toLumosConfig(scripts);
  console.log('*** OffCKB Devnet System Scripts As LumosConfig ***\n');
  console.log(JSON.stringify(config, null, 2));
}

export function printInCCCStyle(scripts: SystemScriptsRecord) {
  const knownsScripts = toCCCKnownScripts(scripts);
  console.log('*** OffCKB Devnet System Scripts As CCC KnownScripts ***\n');
  console.log(JSON.stringify(knownsScripts, null, 2));
}

export function getSystemScriptsFromListHashes(): SystemScriptsRecord | null {
  const settings = readSettings();
  const listHashesString = getListHashes(settings.bins.defaultCKBVersion);
  if (listHashesString) {
    const listHashes = toml.parse(listHashesString) as unknown as ListHashes;
    const systemScriptArray = listHashes.offckb.system_cells
      .map((cell) => {
        // Extract the file name
        const name = cell.path.split('/').pop()?.replace(')', '') || 'unknown script';
        const depGroupIndex = listHashes.offckb.dep_groups.findIndex((depGroup) =>
          depGroup.included_cells.includes(`Bundled(specs/cells/${name})`),
        );
        const depType = depGroupIndex === -1 ? 'code' : 'depGroup';
        const depGroup =
          depGroupIndex === -1
            ? undefined
            : {
                txHash: listHashes.offckb.dep_groups[depGroupIndex].tx_hash,
                index: listHashes.offckb.dep_groups[depGroupIndex].index,
              };
        const scriptInfo = systemCellToScriptInfo(cell, depType, depGroup);
        return {
          name,
          file: cell.path,
          script: scriptInfo,
        };
      })
      .filter((s) => s.name != 'secp256k1_data');
    const systemScripts: SystemScriptsRecord = systemScriptArray.reduce<SystemScriptsRecord>((acc, item) => {
      const key = item.name as unknown as SystemScriptName;
      acc[key] = item as unknown as SystemScript;
      return acc;
    }, {} as SystemScriptsRecord);
    return systemScripts;
  } else {
    console.log(`list-hashes not found!`);
    return null;
  }
}

export function systemCellToScriptInfo(
  cell: SystemCell,
  depType: 'code' | 'depGroup',
  depGroup?: {
    txHash: string;
    index: number;
  },
) {
  if (depType === 'depGroup' && !depGroup) {
    throw new Error('require depGroup info since the dep type is depGroup');
  }

  if (depType === 'code') {
    return {
      codeHash: cell.type_hash || cell.data_hash,
      hashType: cell.type_hash ? 'type' : 'data',
      cellDeps: [
        {
          cellDep: {
            outPoint: {
              txHash: cell.tx_hash,
              index: cell.index,
            },
            depType,
          },
        },
      ],
    };
  }

  return {
    codeHash: cell.type_hash || cell.data_hash,
    hashType: cell.type_hash ? 'type' : 'data',
    cellDeps: [
      {
        cellDep: {
          outPoint: {
            txHash: depGroup!.txHash,
            index: depGroup!.index,
          },
          depType,
        },
      },
    ],
  };
}

export function toLumosConfig(scripts: SystemScriptsRecord, addressPrefix: 'ckb' | 'ckt' = 'ckt') {
  const config: config.Config = {
    PREFIX: addressPrefix,
    SCRIPTS: {
      SECP256K1_BLAKE160: {
        CODE_HASH: scripts.secp256k1_blake160_sighash_all!.script.codeHash,
        HASH_TYPE: scripts.secp256k1_blake160_sighash_all!.script.hashType,
        TX_HASH: scripts.secp256k1_blake160_sighash_all!.script.cellDeps[0].cellDep.outPoint.txHash,
        INDEX: '0x' + scripts.secp256k1_blake160_sighash_all!.script.cellDeps[0].cellDep.outPoint.index.toString(16),
        DEP_TYPE: scripts.secp256k1_blake160_sighash_all!.script.cellDeps[0].cellDep.depType,
        SHORT_ID: 1,
      },
      SECP256K1_BLAKE160_MULTISIG: {
        CODE_HASH: scripts.secp256k1_blake160_multisig_all!.script.codeHash,
        HASH_TYPE: scripts.secp256k1_blake160_multisig_all!.script.hashType,
        TX_HASH: scripts.secp256k1_blake160_multisig_all!.script.cellDeps[0].cellDep.outPoint.txHash,
        INDEX: '0x' + scripts.secp256k1_blake160_multisig_all!.script.cellDeps[0].cellDep.outPoint.index.toString(16),
        DEP_TYPE: scripts.secp256k1_blake160_multisig_all!.script.cellDeps[0].cellDep.depType,
      },
      DAO: {
        CODE_HASH: scripts.dao!.script.codeHash,
        HASH_TYPE: scripts.dao!.script.hashType,
        TX_HASH: scripts.dao!.script.cellDeps[0].cellDep.outPoint.txHash,
        INDEX: '0x' + scripts.dao!.script.cellDeps[0].cellDep.outPoint.index.toString(16),
        DEP_TYPE: scripts.dao!.script.cellDeps[0].cellDep.depType,
        SHORT_ID: 2,
      },
      SUDT: {
        CODE_HASH: scripts.sudt!.script.codeHash,
        HASH_TYPE: scripts.sudt!.script.hashType,
        TX_HASH: scripts.sudt!.script.cellDeps[0].cellDep.outPoint.txHash,
        INDEX: '0x' + scripts.sudt!.script.cellDeps[0].cellDep.outPoint.index.toString(16),
        DEP_TYPE: scripts.sudt!.script.cellDeps[0].cellDep.depType,
      },
      XUDT: {
        CODE_HASH: scripts.xudt!.script.codeHash,
        HASH_TYPE: scripts.xudt!.script.hashType,
        TX_HASH: scripts.xudt!.script.cellDeps[0].cellDep.outPoint.txHash,
        INDEX: '0x' + scripts.xudt!.script.cellDeps[0].cellDep.outPoint.index.toString(16),
        DEP_TYPE: scripts.xudt!.script.cellDeps[0].cellDep.depType,
      },
      OMNILOCK: {
        CODE_HASH: scripts.omnilock!.script.codeHash,
        HASH_TYPE: scripts.omnilock!.script.hashType,
        TX_HASH: scripts.omnilock!.script.cellDeps[0].cellDep.outPoint.txHash,
        INDEX: '0x' + scripts.omnilock!.script.cellDeps[0].cellDep.outPoint.index.toString(16),
        DEP_TYPE: scripts.omnilock!.script.cellDeps[0].cellDep.depType,
      },
      ANYONE_CAN_PAY: {
        CODE_HASH: scripts.anyone_can_pay!.script.codeHash,
        HASH_TYPE: scripts.anyone_can_pay!.script.hashType,
        TX_HASH: scripts.anyone_can_pay!.script.cellDeps[0].cellDep.outPoint.txHash,
        INDEX: '0x' + scripts.anyone_can_pay!.script.cellDeps[0].cellDep.outPoint.index.toString(16),
        DEP_TYPE: scripts.anyone_can_pay!.script.cellDeps[0].cellDep.depType,
      },
      SPORE: {
        CODE_HASH: scripts.spore!.script.codeHash,
        HASH_TYPE: scripts.spore!.script.hashType,
        TX_HASH: scripts.spore!.script.cellDeps[0].cellDep.outPoint.txHash,
        INDEX: '0x' + scripts.spore!.script.cellDeps[0].cellDep.outPoint.index.toString(16),
        DEP_TYPE: scripts.spore!.script.cellDeps[0].cellDep.depType,
      },
      SPORE_CLUSTER: {
        CODE_HASH: scripts.spore_cluster!.script.codeHash,
        HASH_TYPE: scripts.spore_cluster!.script.hashType,
        TX_HASH: scripts.spore_cluster!.script.cellDeps[0].cellDep.outPoint.txHash,
        INDEX: '0x' + scripts.spore_cluster!.script.cellDeps[0].cellDep.outPoint.index.toString(16),
        DEP_TYPE: scripts.spore_cluster!.script.cellDeps[0].cellDep.depType,
      },
    },
  };
  if (scripts.always_success) {
    config.SCRIPTS['ALWAYS_SUCCESS'] = {
      CODE_HASH: scripts.always_success.script.codeHash,
      HASH_TYPE: scripts.always_success.script.hashType,
      TX_HASH: scripts.always_success.script.cellDeps[0].cellDep.outPoint.txHash,
      INDEX: '0x' + scripts.always_success.script.cellDeps[0].cellDep.outPoint.index.toString(16),
      DEP_TYPE: scripts.always_success.script.cellDeps[0].cellDep.depType,
    };
  }
  if (scripts.spore_cluster_agent) {
    config.SCRIPTS['SPORE_CLUSTER_AGENT'] = {
      CODE_HASH: scripts.spore_cluster_agent.script.codeHash,
      HASH_TYPE: scripts.spore_cluster_agent.script.hashType,
      TX_HASH: scripts.spore_cluster_agent.script.cellDeps[0].cellDep.outPoint.txHash,
      INDEX: '0x' + scripts.spore_cluster_agent.script.cellDeps[0].cellDep.outPoint.index.toString(16),
      DEP_TYPE: scripts.spore_cluster_agent.script.cellDeps[0].cellDep.depType,
    };
  }
  if (scripts.spore_cluster_proxy) {
    config.SCRIPTS['SPORE_CLUSTER_PROXY'] = {
      CODE_HASH: scripts.spore_cluster_proxy.script.codeHash,
      HASH_TYPE: scripts.spore_cluster_proxy.script.hashType,
      TX_HASH: scripts.spore_cluster_proxy.script.cellDeps[0].cellDep.outPoint.txHash,
      INDEX: '0x' + scripts.spore_cluster_proxy.script.cellDeps[0].cellDep.outPoint.index.toString(16),
      DEP_TYPE: scripts.spore_cluster_proxy.script.cellDeps[0].cellDep.depType,
    };
  }
  if (scripts.spore_extension_lua) {
    config.SCRIPTS['SPORE_LUA'] = {
      CODE_HASH: scripts.spore_extension_lua.script.codeHash,
      HASH_TYPE: scripts.spore_extension_lua.script.hashType,
      TX_HASH: scripts.spore_extension_lua.script.cellDeps[0].cellDep.outPoint.txHash,
      INDEX: '0x' + scripts.spore_extension_lua.script.cellDeps[0].cellDep.outPoint.index.toString(16),
      DEP_TYPE: scripts.spore_extension_lua.script.cellDeps[0].cellDep.depType,
    };
  }
  return config;
}

export function toCCCKnownScripts(scripts: SystemScriptsRecord) {
  const DEVNET_SCRIPTS: Record<string, Pick<Script, 'codeHash' | 'hashType'> & { cellDeps: CellDepInfoLike[] }> = {
    [KnownScript.Secp256k1Blake160]: scripts.secp256k1_blake160_sighash_all!.script,
    [KnownScript.Secp256k1Multisig]: scripts.secp256k1_blake160_multisig_all!.script,
    [KnownScript.AnyoneCanPay]: scripts.anyone_can_pay!.script,
    [KnownScript.OmniLock]: scripts.omnilock!.script,
    [KnownScript.XUdt]: scripts.xudt!.script,
    [KnownScript.TypeId]: {
      codeHash: '0x00000000000000000000000000000000000000000000000000545950455f4944',
      hashType: 'type',
      cellDeps: [],
    },
  };
  return DEVNET_SCRIPTS;
}
