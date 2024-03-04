## Development

### Add Dapp templates

Assuming you are trying to add a new template named `my-awesome-template` into `offckb`:

1. add your typescript project inside the `templates` folder: `templates/my-awesome-template`
2. copy `templates/ckb.ts` and `templates/config.json` into your project
   - `cp templates/ckb.ts templates/my-awesome-template`
   - `cp templates/config.json templates/my-awesome-template`
3. finish your `my-awesome-template` with `ckb.ts` and `config.json`
4. done

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
