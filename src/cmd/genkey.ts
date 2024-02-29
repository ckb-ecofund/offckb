import * as fs from 'fs';
import * as path from 'path';
import { accountTargetDir } from '../cfg/const';
import { Address, HashType, HexString, Script, hd, helpers } from '@ckb-lumos/lumos';
import * as readline from 'readline';

interface Account {
  privkey: HexString;
  pubkey: HexString;
  args: HexString;
  lockScript: Script;
  address: Address;
}

export function genkey() {
  const numKeys = 20; // Number of keys to generate
  const keyLength = 64; // Length of each key
  generateKeysFile(numKeys, keyLength);
  console.log(`Generated ${numKeys} keys in keys file.`);
}

function generateHex(length: number) {
  const characters = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}

function generateKeysFile(numKeys: number, keyLength: number) {
  const targetDir = path.join(accountTargetDir, `keys`);

  const stream = fs.createWriteStream(targetDir);
  for (let i = 0; i < numKeys; i++) {
    const key = generateHex(keyLength);
    stream.write(key + '\n');
  }
  stream.end();
}

export async function buildAccounts() {
  const keysDir = path.join(accountTargetDir, `keys`);

  // Create a Readable stream from the file
  const fileStream = fs.createReadStream(keysDir);

  // Create an interface for reading data from the stream line by line
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // Specify Infinity to read all lines without removing newlines
  });

  const accounts: Account[] = [];

  // Read each line from the file
  for await (const line of rl) {
    const privkey = `0x${line}`;
    const account = genAccount(privkey);
    accounts.push(account);
  }

  const accountDir = path.join(accountTargetDir, `account.json`);

  fs.writeFile(accountDir, JSON.stringify(accounts, null, 2), 'utf8', (err) => {
    if (err) {
      return console.error('Error writing file:', err);
    }
  });
}

export function genAccount(privkey: HexString): Account {
  const pubkey = hd.key.privateToPublic(privkey);
  const args = hd.key.publicKeyToBlake160(pubkey);
  const lockScript: Script = {
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type' as HashType,
    args: args,
  };
  const address = helpers.encodeToAddress(lockScript);
  return {
    privkey,
    pubkey,
    lockScript,
    address,
    args,
  };
}

export function printIssueSectionForToml() {
  const config: Account[] = require('../../account/account.json');

  for (const account of config) {
    const section = `# issue for account private key: ${account.privkey}
[[genesis.issued_cells]]
capacity = 42_000_000_00000000
lock.code_hash = "${account.lockScript.codeHash}"
lock.args = "${account.lockScript.args}"
lock.hash_type = "${account.lockScript.hashType}"
    `;

    console.log(section);
  }
}
