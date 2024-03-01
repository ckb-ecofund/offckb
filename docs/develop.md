## Development

### Add templates

TODO

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
