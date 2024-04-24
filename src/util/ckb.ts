import { Address, BI, Cell, Indexer, RPC, Script, WitnessArgs, commons, config, hd, helpers } from '@ckb-lumos/lumos';
import { blockchain, values } from '@ckb-lumos/base';
import { bytes } from '@ckb-lumos/codec';
import { readPredefinedDevnetLumosConfig } from './config';
import { isValidNetworkString } from './validator';
import { Network } from './type';
const { ScriptValue } = values;

export type Account = {
  lockScript: Script;
  address: Address;
  pubKey: string;
  privKey: string;
};

interface Options {
  from: string;
  to: string;
  amount: string;
  privKey: string;
}

const networks = {
  devnet: {
    rpc_url: 'http://127.0.0.1:8114',
    rpc: new RPC('http://127.0.0.1:8114'),
    indexer: new Indexer('http://127.0.0.1:8114'),
  },
  testnet: {
    rpc_url: 'https://testnet.ckb.dev/rpc',
    rpc: new RPC('https://testnet.ckb.dev/rpc'),
    indexer: new Indexer('https://testnet.ckb.dev/rpc'),
  },
  mainnet: {
    rpc_url: 'https://mainnet.ckb.dev/rpc',
    rpc: new RPC('https://mainnet.ckb.dev/rpc'),
    indexer: new Indexer('https://mainnet.ckb.dev/rpc'),
  },
};

export class CKB {
  network: Network;
  rpc_url: string;
  rpc: RPC;
  indexer: Indexer;

  constructor(network: Network = Network.devnet) {
    if (!isValidNetworkString(network)) {
      throw new Error('invalid network option');
    }

    this.network = network;
    this.rpc_url = networks[network].rpc_url;
    this.rpc = networks[network].rpc;
    this.indexer = networks[network].indexer;
  }

  public static generateAccountFromPrivateKey(privKey: string, lumosConfig: config.Config): Account {
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
      privKey,
    };
  }

  getLumosConfig() {
    if (this.network === Network.devnet) {
      return readPredefinedDevnetLumosConfig();
    }
    if (this.network === Network.testnet) {
      return config.predefined.AGGRON4;
    }
    return config.predefined.LINA;
  }

  initializedLumosConfig() {
    return config.initializeConfig(this.getLumosConfig());
  }

  async capacityOf(address: string, lumosConfig: config.Config): Promise<BI> {
    const collector = this.indexer.collector({
      lock: helpers.parseAddress(address, { config: lumosConfig }),
    });

    let balance = BI.from(0);
    for await (const cell of collector.collect()) {
      balance = balance.add(cell.cellOutput.capacity);
    }

    return balance;
  }

  async transfer(options: Options, lumosConfig: config.Config): Promise<string> {
    let txSkeleton = helpers.TransactionSkeleton({});
    const fromScript = helpers.parseAddress(options.from, {
      config: lumosConfig,
    });
    const toScript = helpers.parseAddress(options.to, { config: lumosConfig });

    if (BI.from(options.amount).lt(BI.from('6100000000'))) {
      throw new Error(
        `every cell's capacity must be at least 61 CKB, see https://medium.com/nervosnetwork/understanding-the-nervos-dao-and-cell-model-d68f38272c24`,
      );
    }

    // additional 0.001 ckb for tx fee
    // the tx fee could calculated by tx size
    // this is just a simple example
    const neededCapacity = BI.from(options.amount).add(100000);
    let collectedSum = BI.from(0);
    const collected: Cell[] = [];
    const collector = this.indexer.collector({ lock: fromScript, type: 'empty' });
    for await (const cell of collector.collect()) {
      collectedSum = collectedSum.add(cell.cellOutput.capacity);
      collected.push(cell);
      if (collectedSum >= neededCapacity) break;
    }

    if (collectedSum.lt(neededCapacity)) {
      throw new Error(`Not enough CKB, ${collectedSum} < ${neededCapacity}`);
    }

    const transferOutput: Cell = {
      cellOutput: {
        capacity: BI.from(options.amount).toHexString(),
        lock: toScript,
      },
      data: '0x',
    };

    const changeOutput: Cell = {
      cellOutput: {
        capacity: collectedSum.sub(neededCapacity).toHexString(),
        lock: fromScript,
      },
      data: '0x',
    };

    txSkeleton = txSkeleton.update('inputs', (inputs) => inputs.push(...collected));
    txSkeleton = txSkeleton.update('outputs', (outputs) => outputs.push(transferOutput, changeOutput));
    txSkeleton = txSkeleton.update('cellDeps', (cellDeps) =>
      cellDeps.push({
        outPoint: {
          txHash: lumosConfig.SCRIPTS.SECP256K1_BLAKE160!.TX_HASH,
          index: lumosConfig.SCRIPTS.SECP256K1_BLAKE160!.INDEX,
        },
        depType: lumosConfig.SCRIPTS.SECP256K1_BLAKE160!.DEP_TYPE,
      }),
    );

    const firstIndex = txSkeleton
      .get('inputs')
      .findIndex((input) =>
        new ScriptValue(input.cellOutput.lock, { validate: false }).equals(
          new ScriptValue(fromScript, { validate: false }),
        ),
      );
    if (firstIndex !== -1) {
      while (firstIndex >= txSkeleton.get('witnesses').size) {
        txSkeleton = txSkeleton.update('witnesses', (witnesses) => witnesses.push('0x'));
      }
      let witness: string = txSkeleton.get('witnesses').get(firstIndex)!;
      const newWitnessArgs: WitnessArgs = {
        /* 65-byte zeros in hex */
        lock: '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      };
      if (witness !== '0x') {
        const witnessArgs = blockchain.WitnessArgs.unpack(bytes.bytify(witness));
        const lock = witnessArgs.lock;
        if (!!lock && !!newWitnessArgs.lock && !bytes.equal(lock, newWitnessArgs.lock)) {
          throw new Error('Lock field in first witness is set aside for signature!');
        }
        const inputType = witnessArgs.inputType;
        if (inputType) {
          newWitnessArgs.inputType = inputType;
        }
        const outputType = witnessArgs.outputType;
        if (outputType) {
          newWitnessArgs.outputType = outputType;
        }
      }
      witness = bytes.hexify(blockchain.WitnessArgs.pack(newWitnessArgs));
      txSkeleton = txSkeleton.update('witnesses', (witnesses) => witnesses.set(firstIndex, witness));
    }

    txSkeleton = commons.common.prepareSigningEntries(txSkeleton);
    const message = txSkeleton.get('signingEntries').get(0)!.message;
    const Sig = hd.key.signRecoverable(message!, options.privKey);
    const tx = helpers.sealTransaction(txSkeleton, [Sig]);
    const hash = await this.rpc.sendTransaction(tx, 'passthrough');
    return hash;
  }

  async transferAll(privateKey: string, toAddress: string, lumosConfig: config.Config): Promise<string> {
    let txSkeleton = helpers.TransactionSkeleton({});
    const from = CKB.generateAccountFromPrivateKey(privateKey, lumosConfig);
    const fromScript = from.lockScript;
    const toScript = helpers.parseAddress(toAddress, { config: lumosConfig });

    const balance = await this.capacityOf(from.address, lumosConfig);

    // additional 0.001 ckb for tx fee
    // the tx fee could calculated by tx size
    // this is just a simple example
    const neededCapacity = balance.sub(100000);
    let collectedSum = BI.from(0);
    const collected: Cell[] = [];
    const collector = this.indexer.collector({ lock: fromScript, type: 'empty' });
    for await (const cell of collector.collect()) {
      collectedSum = collectedSum.add(cell.cellOutput.capacity);
      collected.push(cell);
      if (collectedSum >= neededCapacity) break;
    }

    if (collectedSum.lt(neededCapacity)) {
      throw new Error(`Not enough CKB, ${collectedSum} < ${neededCapacity}`);
    }

    const transferOutput: Cell = {
      cellOutput: {
        capacity: neededCapacity.toHexString(),
        lock: toScript,
      },
      data: '0x',
    };

    txSkeleton = txSkeleton.update('inputs', (inputs) => inputs.push(...collected));
    txSkeleton = txSkeleton.update('outputs', (outputs) => outputs.push(transferOutput));
    txSkeleton = txSkeleton.update('cellDeps', (cellDeps) =>
      cellDeps.push({
        outPoint: {
          txHash: lumosConfig.SCRIPTS.SECP256K1_BLAKE160!.TX_HASH,
          index: lumosConfig.SCRIPTS.SECP256K1_BLAKE160!.INDEX,
        },
        depType: lumosConfig.SCRIPTS.SECP256K1_BLAKE160!.DEP_TYPE,
      }),
    );

    const firstIndex = txSkeleton
      .get('inputs')
      .findIndex((input) =>
        new ScriptValue(input.cellOutput.lock, { validate: false }).equals(
          new ScriptValue(fromScript, { validate: false }),
        ),
      );
    if (firstIndex !== -1) {
      while (firstIndex >= txSkeleton.get('witnesses').size) {
        txSkeleton = txSkeleton.update('witnesses', (witnesses) => witnesses.push('0x'));
      }
      let witness: string = txSkeleton.get('witnesses').get(firstIndex)!;
      const newWitnessArgs: WitnessArgs = {
        /* 65-byte zeros in hex */
        lock: '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      };
      if (witness !== '0x') {
        const witnessArgs = blockchain.WitnessArgs.unpack(bytes.bytify(witness));
        const lock = witnessArgs.lock;
        if (!!lock && !!newWitnessArgs.lock && !bytes.equal(lock, newWitnessArgs.lock)) {
          throw new Error('Lock field in first witness is set aside for signature!');
        }
        const inputType = witnessArgs.inputType;
        if (inputType) {
          newWitnessArgs.inputType = inputType;
        }
        const outputType = witnessArgs.outputType;
        if (outputType) {
          newWitnessArgs.outputType = outputType;
        }
      }
      witness = bytes.hexify(blockchain.WitnessArgs.pack(newWitnessArgs));
      txSkeleton = txSkeleton.update('witnesses', (witnesses) => witnesses.set(firstIndex, witness));
    }

    txSkeleton = commons.common.prepareSigningEntries(txSkeleton);
    const message = txSkeleton.get('signingEntries').get(0)!.message;
    const Sig = hd.key.signRecoverable(message!, privateKey);
    const tx = helpers.sealTransaction(txSkeleton, [Sig]);
    const hash = await this.rpc.sendTransaction(tx, 'passthrough');
    return hash;
  }
}
