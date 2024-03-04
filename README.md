## OffCKB

[![npm](https://img.shields.io/npm/v/@offckb/cli.svg?maxAge=1000)](https://www.npmjs.com/package/@offckb/cli)
[![CI](https://github.com/retricsu/offckb/actions/workflows/node.js.yml/badge.svg)](https://github.com/retricsu/offckb/actions/workflows/node.js.yml)
[![npm](https://img.shields.io/npm/dt/@offckb/cli.svg?maxAge=1000)](https://www.npmjs.com/package/@offckb/cli)
[![npm](https://img.shields.io/npm/l/@offckb/cli.svg?maxAge=1000)](https://github.com/jeffijoe/@offckb/cli/blob/master/LICENSE.md)
[![node](https://img.shields.io/node/v/@offckb/cli.svg?maxAge=1000)](https://www.npmjs.com/package/@offckb/cli)

**CKB local development network for your first try.**

- One-line command to start a devnet
- no docker required
- pre-funded test accounts
- packed with the most useful scripts like Omnilock and Spore-contract
- multiple minimal Dapp templates to learn and get your hands dirty

Start building on Nervos blockchain, right now, right away!

## Table of Contents

- [OffCKB](#offckb)
- [Table of Contents](#table-of-contents)
- [Install](#install)
- [Usage](#usage)
- [Get started](#get-started)
- [Built-in scripts](#built-in-scripts)
- [Accounts](#accounts)
- [About Lumos](#about-lumos)
- [Contributing](#contributing)

## Install

```sh
npm install -g @offckb/cli
```

## Usage

```sh
offckb node # start the devnet of CKB, `ctrl-c` to stop running the chain
offckb clean # clean the devnet data, needs to stop running the chain first

offckb init <project-name> # init a CKB Dapp typescript boilerplate from multiple templates

offckb accounts # list 20 accounts info with prefund CKB tokens
offckb list-hashes # list built-in scripts hashes, equals `ckb list-hashes`
```

## Get started

```sh
offckb init my-awesome-ckb-dapp

## select the template for your boilerplate
? Select a dapp template (Use arrow keys)
❯ Transfer CKB
  Issue Coin With XUDT scripts
a simple dapp to check CKB balance and transfer CKB from address to address
init CKB dapp project: /Users/ckb/Desktop/offckb/my-awesome-ckb-dapp
✨  Done in 7.52s.

## start running
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

# result
# ...
CKB-Miner: 2024-03-04 14:35:12.563 +00:00 client INFO ckb_miner::miner  Found! #3181 0x3749481a320824fe21077eaa8ec9d024a7b62d031720c27c1ef1681e8ab349e8

CKB-Miner: 2024-03-04 14:35:17.567 +00:00 client INFO ckb_miner::miner  Found! #3184 0xa612a9ea35f292a6473e23e88856283aea8b1bc6a607147bef5c06c94e964f2f
#...
```

open another terminal and check the accounts to use:

```sh
offckb accounts

# result
Print account list, each account is funded with 42_000_000_00000000 capacity in the genesis block.
[
  {
    privkey: '0x6109170b275a09ad54877b82f7d9930f88cab5717d484fb4741ae9d1dd078cd6',
    pubkey: '0x02025fa7b61b2365aa459807b84df065f1949d58c0ae590ff22dd2595157bffefa',
    lockScript: {
      codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
      hashType: 'type',
      args: '0x8e42b1999f265a0078503c4acec4d5e134534297'
    },
    address: 'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqvwg2cen8extgq8s5puft8vf40px3f599cytcyd8',
    args: '0x8e42b1999f265a0078503c4acec4d5e134534297'
  },
  {
    privkey: '0x9f315d5a9618a39fdc487c7a67a8581d40b045bd7a42d83648ca80ef3b2cb4a1',
    pubkey: '0x026efa0579f09cc7c1129b78544f70098c90b2ab155c10746316f945829c034a2d',
    lockScript: {
```

Copy some private keys and visit http://localhost:1234 to play your first CKB Dapp!

## Built-in scripts

- [x] xUDT https://github.com/nervosnetwork/rfcs/pull/428
  - commit id: 410b16c
- [x] Omnilock https://github.com/cryptape/omnilock
  - commit id: cd764d7
- [x] AnyoneCanPay https://github.com/cryptape/anyone-can-pay
  - commit id: b845b3b
- [x] AlwaysSuccess https://github.com/nervosnetwork/ckb-production-scripts/blob/master/c/always_success.c
  - commit id: 410b16c
- [x] Spore https://github.com/sporeprotocol/spore-contract
  - version: 0.2.2-beta.1

## Accounts

`offckb` comes with 20 accounts, each account is funded with 42_000_000_00000000 capacity in the genesis block.

all the private keys are recorded in the `account/keys` file.
detail informations about each account are recorded in the `account/account.json` file.

:warning: **DO NOT SEND REAL ASSETS INTO ALL THESE ACCOUNTS, YOU CAN LOOSE YOUR MONEY** :warning:

## About Lumos

`offckb` uses [Lumos](https://github.com/ckb-js/lumos) as the CKB Dapp framework to build the template projects.

## Contributing

check [development doc](/docs/develop.md)
