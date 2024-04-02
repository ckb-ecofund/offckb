import { genAccount } from './genkey';

export function buildAccount(privKey: string) {
  const account = genAccount(privKey);
  console.log(account);
}
