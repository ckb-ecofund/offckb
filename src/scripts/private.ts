import { ccc, KnownScript } from '@ckb-ccc/core';
//todo: extract getSystemScriptsFromListHashes/toCCCKnownScripts from cmd folder
import { getSystemScriptsFromListHashes, toCCCKnownScripts } from '../cmd/system-scripts';

export function buildCCCDevnetKnownScripts() {
  const devnetSystemScripts = getSystemScriptsFromListHashes();
  if (devnetSystemScripts == null) {
    throw new Error('can not getSystemScriptsFromListHashes in devnet');
  }
  const devnetKnownScripts:
    | Record<
        KnownScript,
        Pick<ccc.Script, 'codeHash' | 'hashType'> & {
          cellDeps: ccc.CellDepInfoLike[];
        }
      >
    | undefined = toCCCKnownScripts(devnetSystemScripts);
  return devnetKnownScripts;
}
