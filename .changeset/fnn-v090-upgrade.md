---
'@offckb/cli': patch
---

Upgrade the bundled Fiber (FNN) integration from the `0.9.0-rc` pre-release to the final FNN `v0.9.0` release.

- The default and only downloadable FNN version is now `0.9.0` (was `0.9.0-rc7`); the pinned download SHA-256 digests were re-derived from the `v0.9.0` release tarballs.
- The `ckb/fiber` submodule is re-pinned to the `v0.9.0` tag commit `e6cb7ac` (was `bc361aa`).
- The bundled Fiber contracts (`auth`, `funding_lock`, `commitment_lock`) and the `testnet-config.yml` template are byte-identical between `0.9.0-rc7` and `v0.9.0`, and the `node_info` / `connect_peer` / `list_peers` RPC surface plus the `-c` / `-d` / `-s` / `--rpc-enabled-modules` CLI flags offckb uses are unchanged, so no devnet-format or config-generation change was required.
