import * as fs from "fs";
import * as path from "path";
import { packageRootPath } from "../cfg/const";

export function genkey() {
  const numKeys = 20; // Number of keys to generate
  const keyLength = 64; // Length of each key
  generateKeysFile(numKeys, keyLength);
  console.log(`Generated ${numKeys} keys in keys file.`);
}

function generateHex(length: number) {
  const characters = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}

function generateKeysFile(numKeys: number, keyLength: number) {
  const targetDir = path.join(packageRootPath, `account/keys`);

  const stream = fs.createWriteStream(targetDir);
  for (let i = 0; i < numKeys; i++) {
    const key = generateHex(keyLength);
    stream.write(key + "\n");
  }
  stream.end();
}
