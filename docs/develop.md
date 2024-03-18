## Development

### Add Dapp templates

Assuming you are trying to add a new template named `my-awesome-template` into `offckb`:

1. add your typescript project to the docs site's example folder: `https://github.com/nervosnetwork/docs.nervos.org/tree/develop-v2/examples/my-awesome-template`
2. copy `templates/ckb.ts` from `offckb` Github repo into your project
   - `cp offckb/templates/ckb.ts docs.nervos.org/examples/my-awesome-template`
3. finish your `my-awesome-template` with `ckb.ts`
4. update the `options.json` file: `https://github.com/nervosnetwork/docs.nervos.org/tree/develop-v2/examples/options.json`
5. done

##### Template Pattern

All Dapp templates must meet the requirements:

- Dapp must be able to run on the CKB Testnet by default
- Dapp must be able to be initialized with `offckb` to run on devnet
  - place a `ckb.ts` file in your root folder to manage CKB chain config like RPC URLs.
  - use `ckb.ts` to export the `lumosConfig`

### Update built-in scripts

required

- rust/cargo
- capsule https://github.com/nervosnetwork/capsule/releases
- docker

update submodule inside `ckb` and then run

```sh
make all
```

### Update chain config

edit the things in `ckb/devnet`

whenever the devnet genesis block's tx hashes changes, you need to update the devnet lumos config file, which is `templates/config.json`.

first start the node:

```sh
yarn start node
```

second, generate Lumos config file:

```sh
NODE_ENV=development yarn start build-lumos-config
```
