## OffCKB

ckb development environment for professionals

## Install

```sh
npm install -g @offckb/cli
```

## Usage

```sh
offckb node // start the devnet of CKB 
offckb init <project-name> // init a typescript boilerplate with lumos to get started with to build CKB DAPP,think 'hardhat init'
offckb accounts // list 20 accounts info with prefund CKB tokens
offckb list-hashes // list scripts hashes, equals `ckb list-hashes`
```

### Get started

```sh
offckb init my-awesome-ckb-dapp
cd my-awesome-ckb-dapp
yarn && yarn start

## results
yarn run v1.22.19
$ parcel index.html
Server running at http://localhost:1234
✨ Built in 10ms
```

open another terminal and start the devnet:

```sh
offckb node
```

open another terminal and check the accounts to use:

```sh
offckb accounts
```

Copy some private keys and visit http://localhost:1234 to play basic CKB transfer!

### Built-in scripts

- [x] xUDT https://github.com/nervosnetwork/rfcs/pull/428
- [x] Omnilock https://github.com/cryptape/omnilock
- [x] AnyoneCanPay https://github.com/cryptape/anyone-can-pay
- [x] AlwaysSuccess https://github.com/nervosnetwork/ckb-production-scripts/blob/master/c/always_success.c
- [ ] Spore https://github.com/sporeprotocol/spore-contract

### Accounts

`offckb` comes with 20 accounts, each account is funded with 42_000_000_00000000 capacity in the genesis block.

all the private keys are recorded in the `account/keys` file.
detail informations about each account are recorded in the `account/account.json` file.

## Development

update built-in scripts:

update submodule inside `docker` and then run
```sh
make all
```
