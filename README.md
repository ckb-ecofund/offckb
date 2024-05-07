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
- built-in scripts like [Omnilock](https://github.com/cryptape/omnilock) and [Spore-contract](https://github.com/sporeprotocol/spore-contract)
- multiple minimal dApp templates to learn and get your hands dirty

Start building on Nervos blockchain, right now, right away!

## Table of Contents

- [OffCKB](#offckb)
- [Table of Contents](#table-of-contents)
- [Install](#install)
- [Usage](#usage)
- [Get started](#get-started)
  - [Create a full-stack Project](#create-a-full-stack-project)
  - [Create a script-only Project](#create-a-script-only-project)
- [Run A dApp Example](#run-a-dapp-example)
  - [Step 1: Select A dApp To Init](#step-1-select-a-dapp-to-init)
  - [Step 2: Start the Devnet](#step-2-start-the-devnet)
  - [Step 3: Access Pre-funded Accounts](#step-3-access-pre-funded-accounts)
- [dApp Examples with Detailed Tutorial](#dapp-examples-with-detailed-tutorial)
  - [View and transfer balance](#view-and-transfer-balance)
  - [Write \& read on-chain messages](#write--read-on-chain-messages)
  - [Issue custom token via xUDT scripts](#issue-custom-token-via-xudt-scripts)
  - [Create on-chain digital object via Spore protocol](#create-on-chain-digital-object-via-spore-protocol)
- [Built-in scripts](#built-in-scripts)
- [Accounts](#accounts)
- [About Lumos](#about-lumos)
- [Contributing](#contributing)

## Install

```sh
npm install -g @offckb/cli
```

*We recommand using [LTS](https://nodejs.org/en/download/package-manager) version of Node to run `offckb`*

## Usage

```sh
Usage: offckb [options] [command]

ckb development network for your first try

Options:
  -V, --version                                     output the version number
  -h, --help                                        display help for command

Commands:
  init [your-project-name]                          Init a example dApp to learn and run
  create [your-project-name]                        Create a new dApp from bare templates
  node                                              Use the CKB to start devnet
  clean                                             Clean the devnet data, need to stop running the chain first
  accounts                                          Print account list info
  list-hashes                                       Use the CKB to list blockchain scripts hashes
  inject-config                                     Add offckb.config.ts to your workspace
  sync-config                                       sync offckb.config.ts in your workspace
  deposit [options] [toAddress] [amountInShannon]   Deposit CKB tokens to address, only devnet and testnet
  transfer [options] [toAddress] [amountInShannon]  Transfer CKB tokens to address, only devnet and testnet
  balance [options] [toAddress]                     Check account balance, only devnet and testnet
  deploy [options]                                  Deploy contracts to different networks, only supports devnet and testnet
  deployed-scripts [options]                        Show deployed contracts info on networks, only supports devnet and testnet
  help [command]                                    display help for command
```

*Use `offckb [command] -h` to learn more about a specific command.*

## Get started

### Create a full-stack Project 

Create a new project from predefined boilerplates.

```sh
offckb create <your-project-name, eg:my-first-ckb-project>
```

The boilerplate can be targeting on different CKB networks. Check [README.md](https://github.com/nervosnetwork/docs.nervos.org/blob/develop/examples/remix-vite-template/readme.md) in the project to get started.

### Create a script-only Project

You can create a new script project without a frontend. This is useful when you only want to develop smart contracts for CKB.

```sh
offckb create <your-project-name> --script
```

Note: you need to have rust/cargo/cargo-generate/clang 16+ installed in your environment to use this command. offckb doesn't do anything really, it just call [ckb-script-template](https://github.com/cryptape/ckb-script-tempaltes) to do all the magic. 

## Run A dApp Example

### Step 1: Select A dApp To Init

```sh
offckb init <your-project-name, eg:my-awesome-ckb-dapp>

## Select an example dApp
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

### Step 2: Start the Devnet

Open another terminal and run:

```sh
offckb node

# result
# ...
CKB-Miner: 2024-03-04 14:35:12.563 +00:00 client INFO ckb_miner::miner  Found! #3181 0x3749481a320824fe21077eaa8ec9d024a7b62d031720c27c1ef1681e8ab349e8

CKB-Miner: 2024-03-04 14:35:17.567 +00:00 client INFO ckb_miner::miner  Found! #3184 0xa612a9ea35f292a6473e23e88856283aea8b1bc6a607147bef5c06c94e964f2f
#...
```

You can leave this terminal open to keep the devnet running, feel free to `ctrl+c` to exit the terminal and stop the local blockchain.

### Step 3: Access Pre-funded Accounts

Open another terminal and check the accounts to use:

```sh
offckb accounts

# results

#### ALL ACCOUNTS ARE FOR TEST AND DEVELOP ONLY  ####
#### DON'T USE THESE ACCOUNTS ON MAINNET         ####
#### OTHERWISE YOU WILL LOOSE YOUR MONEY         ####

Print account list, each account is funded with 42_000_000_00000000 capacity in the devnet genesis block.

- "#": 0
address: ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqvwg2cen8extgq8s5puft8vf40px3f599cytcyd8
privkey: 0x6109170b275a09ad54877b82f7d9930f88cab5717d484fb4741ae9d1dd078cd6
pubkey: 0x02025fa7b61b2365aa459807b84df065f1949d58c0ae590ff22dd2595157bffefa
lock_arg: 0x8e42b1999f265a0078503c4acec4d5e134534297
lockScript:
    codeHash: 0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8
    hashType: type
    args: 0x8e42b1999f265a0078503c4acec4d5e134534297

- "#": 1
address: ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqt435c3epyrupszm7khk6weq5lrlyt52lg48ucew
privkey: 0x9f315d5a9618a39fdc487c7a67a8581d40b045bd7a42d83648ca80ef3b2cb4a1
pubkey: 0x026efa0579f09cc7c1129b78544f70098c90b2ab155c10746316f945829c034a2d
lock_arg: 0x758d311c8483e0602dfad7b69d9053e3f917457d
lockScript:
    codeHash: 0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8
    hashType: type
    args: 0x758d311c8483e0602dfad7b69d9053e3f917457d
```

Copy some private keys and visit http://localhost:1234 to play your first CKB dApp!

## dApp Examples with Detailed Tutorial

`offckb` packs some basic minimal dApp examples for you to learn and get started with. By running `offckb init`, you can select the different dApp examples to quickly set up a local dApp project targeting the local blockchain with built-in scripts and accounts.

The dApp examples often involve interaction with some most useful smart contracts on CKB like xUDT/Spore/Omnilock. The best thing is those dApp examples also come with detailed tutorial documents from [docs.nervos.org](https://docs.nervos.org/). The source codes of these templates are also maintained [here](https://github.com/nervosnetwork/docs.nervos.org/tree/develop-v2/examples).

### View and transfer balance

A simple dApp to check CKB balance and transfer CKB.

[Tutorial](https://docs.nervos.org/docs/getting-started/transfer-ckb)

### Write & read on-chain messages

A simple dApp to issue your own token via XUDT scripts.

[Tutorial](https://docs.nervos.org/docs/getting-started/write-message)

### Issue custom token via xUDT scripts

A simple dApp to store & retrieve data from a Cell.

[Tutorial](https://docs.nervos.org/docs/getting-started/create-token)

### Create on-chain digital object via Spore protocol

A simple dApp to create on-chain digital objects with spore scripts.

[Tutorial](https://docs.nervos.org/docs/getting-started/create-dob)

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

`offckb` uses [Lumos](https://github.com/ckb-js/lumos) as the CKB dApp framework to build the template projects.

## Contributing

check [development doc](/docs/develop.md)
