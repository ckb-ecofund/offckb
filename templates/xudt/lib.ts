import { helpers, Address, Script, hd, config, Cell, commons, BI, utils, CellDep } from '@ckb-lumos/lumos';
import { values, blockchain } from '@ckb-lumos/base';
import { indexer, lumosConfig, rpc } from './ckb';
import { TransactionSkeletonType } from '@ckb-lumos/helpers';
import { bytes, number } from '@ckb-lumos/codec';
import { xudtWitnessType } from './scheme';

config.initializeConfig(lumosConfig);

type Account = {
  lockScript: Script;
  address: Address;
  pubKey: string;
};
export const generateAccountFromPrivateKey = (privKey: string): Account => {
  const pubKey = hd.key.privateToPublic(privKey);
  const args = hd.key.publicKeyToBlake160(pubKey);
  const template = lumosConfig.SCRIPTS['SECP256K1_BLAKE160']!;
  const lockScript = {
    codeHash: template.CODE_HASH,
    hashType: template.HASH_TYPE,
    args: args,
  };
  const address = helpers.encodeToAddress(lockScript, { config: lumosConfig });
  return {
    lockScript,
    address,
    pubKey,
  };
};

export const computeLockScriptHashFromPrivateKey = (privkey: string) => {
  const { lockScript } = generateAccountFromPrivateKey(privkey);
  return utils.computeScriptHash(lockScript);
};

export async function capacityOf(address: string): Promise<BI> {
  const collector = indexer.collector({
    lock: helpers.parseAddress(address, { config: lumosConfig }),
  });

  let balance = BI.from(0);
  for await (const cell of collector.collect()) {
    balance = balance.add(cell.cellOutput.capacity);
  }

  return balance;
}

export function addCellDep(txSkeleton: TransactionSkeletonType, newCellDep: CellDep): TransactionSkeletonType {
  const cellDep = txSkeleton.get('cellDeps').find((cellDep) => {
    return (
      cellDep.depType === newCellDep.depType &&
      new values.OutPointValue(cellDep.outPoint, { validate: false }).equals(
        new values.OutPointValue(newCellDep.outPoint, { validate: false }),
      )
    );
  });

  if (!cellDep) {
    txSkeleton = txSkeleton.update('cellDeps', (cellDeps) => {
      return cellDeps.push({
        outPoint: newCellDep.outPoint,
        depType: newCellDep.depType,
      });
    });
  }

  return txSkeleton;
}

export async function issueToken(privKey: string, amount: string) {
  const { lockScript } = generateAccountFromPrivateKey(privKey);
  const xudtDeps = lumosConfig.SCRIPTS.XUDT;
  const lockDeps = lumosConfig.SCRIPTS.SECP256K1_BLAKE160;

  const xudtArgs = utils.computeScriptHash(lockScript) + '00000000';
  const typeScript = {
    codeHash: xudtDeps.CODE_HASH,
    hashType: xudtDeps.HASH_TYPE,
    args: xudtArgs,
  };

  let txSkeleton = helpers.TransactionSkeleton();
  txSkeleton = addCellDep(txSkeleton, {
    outPoint: {
      txHash: lockDeps.TX_HASH,
      index: lockDeps.INDEX,
    },
    depType: lockDeps.DEP_TYPE,
  });
  txSkeleton = addCellDep(txSkeleton, {
    outPoint: {
      txHash: xudtDeps.TX_HASH,
      index: xudtDeps.INDEX,
    },
    depType: xudtDeps.DEP_TYPE,
  });

  const targetOutput: Cell = {
    cellOutput: {
      capacity: '0x0',
      lock: lockScript,
      type: typeScript,
    },
    data: bytes.hexify(number.Uint128LE.pack(amount)),
  };

  // additional 0.001 ckb for tx fee
  // the tx fee could calculated by tx size
  // this is just a simple example
  const capacity = helpers.minimalCellCapacity(targetOutput);
  targetOutput.cellOutput.capacity = '0x' + capacity.toString(16);
  const neededCapacity = BI.from(capacity.toString(10)).add(100000);
  let collectedSum = BI.from(0);
  const collected: Cell[] = [];
  const collector = indexer.collector({ lock: lockScript, type: 'empty' });
  for await (const cell of collector.collect()) {
    collectedSum = collectedSum.add(cell.cellOutput.capacity);
    collected.push(cell);
    if (collectedSum >= neededCapacity) break;
  }

  if (collectedSum.lt(neededCapacity)) {
    throw new Error(`Not enough CKB, ${collectedSum} < ${neededCapacity}`);
  }

  const changeOutput: Cell = {
    cellOutput: {
      capacity: collectedSum.sub(neededCapacity).toHexString(),
      lock: lockScript,
    },
    data: '0x',
  };

  txSkeleton = txSkeleton.update('inputs', (inputs) => inputs.push(...collected));
  txSkeleton = txSkeleton.update('outputs', (outputs) => outputs.push(targetOutput, changeOutput));
  /* 65-byte zeros in hex */
  const lockWitness =
    '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
  const outputTypeWitness = xudtWitnessType.pack({ extension_data: [] });
  const witnessArgs = blockchain.WitnessArgs.pack({ lock: lockWitness, outputType: outputTypeWitness });
  const witness = bytes.hexify(witnessArgs);
  txSkeleton = txSkeleton.update('witnesses', (witnesses) => witnesses.set(0, witness));

  // signing
  txSkeleton = commons.common.prepareSigningEntries(txSkeleton);
  const message = txSkeleton.get('signingEntries').get(0)?.message;
  const Sig = hd.key.signRecoverable(message!, privKey);
  const tx = helpers.sealTransaction(txSkeleton, [Sig]);
  console.log(tx);

  const hash = await rpc.sendTransaction(tx, 'passthrough');
  console.log('The transaction hash is', hash);
  alert(`The transaction hash is ${hash}`);
}

export async function queryIssuedTokenCells(privKey: string) {
  const { lockScript } = generateAccountFromPrivateKey(privKey);
  const xudtDeps = lumosConfig.SCRIPTS.XUDT;

  const xudtArgs = utils.computeScriptHash(lockScript) + '00000000';
  const typeScript = {
    codeHash: xudtDeps.CODE_HASH,
    hashType: xudtDeps.HASH_TYPE,
    args: xudtArgs,
  };

  const collected: Cell[] = [];
  const collector = indexer.collector({ type: typeScript });
  for await (const cell of collector.collect()) {
    collected.push(cell);
  }
  return collected;
}

export async function  transferTokenToAddress(udtIssuerArgs: string, privKey: string, amount: string, receiverAddress: string) {
  const { lockScript: senderLockScript } = generateAccountFromPrivateKey(privKey);
  
  const receiverLockScript = helpers.parseAddress(receiverAddress);

  const xudtDeps = lumosConfig.SCRIPTS.XUDT;
  const lockDeps = lumosConfig.SCRIPTS.SECP256K1_BLAKE160;

  const xudtArgs = udtIssuerArgs;
  const typeScript = {
    codeHash: xudtDeps.CODE_HASH,
    hashType: xudtDeps.HASH_TYPE,
    args: xudtArgs,
  };

  let txSkeleton = helpers.TransactionSkeleton();
  txSkeleton = addCellDep(txSkeleton, {
    outPoint: {
      txHash: lockDeps.TX_HASH,
      index: lockDeps.INDEX,
    },
    depType: lockDeps.DEP_TYPE,
  });
  txSkeleton = addCellDep(txSkeleton, {
    outPoint: {
      txHash: xudtDeps.TX_HASH,
      index: xudtDeps.INDEX,
    },
    depType: xudtDeps.DEP_TYPE,
  });

  const targetOutput: Cell = {
    cellOutput: {
      capacity: '0x0',
      lock: receiverLockScript,
      type: typeScript,
    },
    data: bytes.hexify(number.Uint128LE.pack(amount)),
  };

  // additional 0.001 ckb for tx fee
  // the tx fee could calculated by tx size
  // this is just a simple example
  const capacity = helpers.minimalCellCapacity(targetOutput);
  targetOutput.cellOutput.capacity = '0x' + capacity.toString(16);
  const neededCapacity = BI.from(capacity.toString(10)).add(100000);
  let collectedSum = BI.from(0);
  let collectedAmount = BI.from(0);
  const collected: Cell[] = [];
  const collector = indexer.collector({ lock: senderLockScript, type: typeScript });
  for await (const cell of collector.collect()) {
    collectedSum = collectedSum.add(cell.cellOutput.capacity);
    collectedAmount = collectedAmount.add(number.Uint128LE.unpack(cell.data));
    collected.push(cell);
    if ( collectedAmount >= BI.from(amount)) break;
  }

  let changedOutputTokenAmount = bytes.hexify(number.Uint128LE.pack(0));
  if (collectedAmount.gt(BI.from(amount))) {
    //throw new Error(`Not enough Token, ${collectedAmount} < ${BI.from(amount)}`);
    changedOutputTokenAmount = bytes.hexify(number.Uint128LE.pack(collectedAmount.sub(BI.from(amount)).toString(10)))
  }

  const changeOutput: Cell = {
    cellOutput: {
      capacity: '0x0',
      lock: senderLockScript,
      type: typeScript
    },
    data: changedOutputTokenAmount,
  };

  const changedNeededCapacity = BI.from(helpers.minimalCellCapacity(changeOutput));
  const extraNeededCapacity = collectedSum.lt(neededCapacity) ? neededCapacity.sub(collectedSum).add(changedNeededCapacity) : collectedSum.sub(neededCapacity).add(changedNeededCapacity);
  if(extraNeededCapacity.gt(0)){
    let collectedChangedSum = BI.from(0);
    const collectedChangeCells: Cell[] = [];
    const collector = indexer.collector({ lock: senderLockScript, type: 'empty' });
    for await (const cell of collector.collect()) {
      collectedChangedSum = collectedChangedSum.add(cell.cellOutput.capacity);
      collectedChangeCells.push(cell);
      if (collectedChangedSum >= extraNeededCapacity) break;
    }

    if (collectedChangedSum.lt(extraNeededCapacity)) {
      throw new Error(`Not enough CKB for change, ${collectedChangedSum} < ${extraNeededCapacity}`);
    }

    changeOutput.cellOutput.capacity = extraNeededCapacity.toHexString();
    txSkeleton = txSkeleton.update('inputs', (inputs) => inputs.push(...collectedChangeCells));
  }

  txSkeleton = txSkeleton.update('inputs', (inputs) => inputs.push(...collected));
  txSkeleton = txSkeleton.update('outputs', (outputs) => outputs.push(targetOutput, changeOutput));
  /* 65-byte zeros in hex */
  const lockWitness =
    '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    
  const inputTypeWitness = xudtWitnessType.pack({ extension_data: [] });
  const outputTypeWitness = xudtWitnessType.pack({ extension_data: [] });
  const witnessArgs = blockchain.WitnessArgs.pack({ lock: lockWitness, inputType: inputTypeWitness, outputType: outputTypeWitness });
  const witness = bytes.hexify(witnessArgs);
  txSkeleton = txSkeleton.update('witnesses', (witnesses) => witnesses.set(0, witness));

  // signing
  txSkeleton = commons.common.prepareSigningEntries(txSkeleton);
  const message = txSkeleton.get('signingEntries').get(0)?.message;
  const Sig = hd.key.signRecoverable(message!, privKey);
  const tx = helpers.sealTransaction(txSkeleton, [Sig]);
  console.log(tx);

  const hash = await rpc.sendTransaction(tx, 'passthrough');
  console.log('The transaction hash is', hash);
  alert(`The transaction hash is ${hash}`);
}

export function readTokenAmount(amount: string) {
  return number.Uint128LE.unpack(amount);
}
