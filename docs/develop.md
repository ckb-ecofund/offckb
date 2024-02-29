## Development

### Update built-in scripts

update submodule inside `ckb` and then run
```sh
make all
```

### Update chain config

edit the things in `ckb/devnet`

whenever the devnet genesis block's tx hashes changed, you need to update the devnet lumos config file, which is `templates/config.json`.

first start the node:

```sh
yarn start node
```

second, generate lumos config file:

```sh
NODE_ENV=development yarn start build-lumos-config
```
