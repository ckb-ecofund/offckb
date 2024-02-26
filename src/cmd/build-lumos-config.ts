import fs from 'fs';
import path from 'path';
import { dappTemplatePath } from '../cfg/const';

const genesisTxHash = '0x920bb4250dc6216c08ee0713f86b3fcb01bf444027b08b7d92db0ed1c0fb9214';
const depGroupTxHash = '0x37f2b7799b199491f4732c572c086afdace0bf92992faf0b90bae44cdd119f9e';

export const devnetConfig = {
  PREFIX: 'ckt',
  SCRIPTS: {
    SECP256K1_BLAKE160: {
      CODE_HASH: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
      HASH_TYPE: 'type',
      TX_HASH: depGroupTxHash,
      INDEX: '0x0',
      DEP_TYPE: 'depGroup',
      SHORT_ID: 1,
    },
    SECP256K1_BLAKE160_MULTISIG: {
      CODE_HASH: '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8',
      HASH_TYPE: 'type',
      TX_HASH: depGroupTxHash,
      INDEX: '0x1',
      DEP_TYPE: 'depGroup',
    },
    DAO: {
      CODE_HASH: '0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e',
      HASH_TYPE: 'type',
      TX_HASH: genesisTxHash,
      INDEX: '0x2',
      DEP_TYPE: 'code',
      SHORT_ID: 2,
    },
    SUDT: {
      CODE_HASH: '0x6283a479a3cf5d4276cd93594de9f1827ab9b55c7b05b3d28e4c2e0a696cfefd',
      HASH_TYPE: 'type',
      TX_HASH: genesisTxHash,
      INDEX: '0x5',
      DEP_TYPE: 'code',
    },
    XUDT: {
      CODE_HASH: '0x1a1e4fef34f5982906f745b048fe7b1089647e82346074e0f32c2ece26cf6b1e',
      HASH_TYPE: 'type',
      TX_HASH: genesisTxHash,
      INDEX: '0x6',
      DEP_TYPE: 'code',
    },
    OMNILOCK: {
      CODE_HASH: '0x9c6933d977360f115a3e9cd5a2e0e475853681b80d775d93ad0f8969da343e56',
      HASH_TYPE: 'type',
      TX_HASH: genesisTxHash,
      INDEX: '0x7',
      DEP_TYPE: 'code',
    },
    ANYONE_CAN_PAY: {
      CODE_HASH: '0xe09352af0066f3162287763ce4ddba9af6bfaeab198dc7ab37f8c71c9e68bb5b',
      HASH_TYPE: 'type',
      TX_HASH: genesisTxHash,
      INDEX: '0x8',
      DEP_TYPE: 'code',
    },
    ALWAYS_SUCCESS: {
      CODE_HASH: '0xbb4469004225b39e983929db71fe2253cba1d49a76223e9e1d212cdca1f79f28',
      HASH_TYPE: 'type',
      TX_HASH: genesisTxHash,
      INDEX: '0x9',
      DEP_TYPE: 'code',
    },
  },
};

export function buildLumosConfig() {
  const filePath = path.resolve(dappTemplatePath, 'config.json');
  fs.writeFile(filePath, JSON.stringify(devnetConfig, null, 2), 'utf8', (err) => {
    if (err) {
      return console.error('Error writing file:', err);
    }
  });
}
