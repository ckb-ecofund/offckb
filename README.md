## OffCKB

ckb development environment for professionals

## Install

```sh
git clone https://github.com/RetricSu/offckb.git
cd offckb && alias offckb='yarn start'
```

eventually you will do simple
```sh
npm install -g offckb // not yet, todo
```

## Usage

```sh
offckb node // start the devnet of CKB 
offckb init // init a typescript boilerplate with lumos to get started with to build CKB DAPP,think 'hardhat init'
offckb list-hashes // list scripts hashes, equals `ckb list-hashes`
offckb accounts // list 20 accounts info with prefund CKB tokens
```

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
