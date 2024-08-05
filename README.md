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
  - [Add Network Proxy](#add-network-proxy)
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
  config <action> <section> [value]                 do a configuration action
  help [command]                                    display help for command
```

*Use `offckb [command] -h` to learn more about a specific command.*

Sometimes you might encounter sudo permission problems. Granting the current user write access to the node_modules directory can resolve the problem.

```sh
sudo chown -R $(whoami) /usr/local/lib/node_modules
npm install -g @offckb/cli
```

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

### Add Network Proxy

```sh
offckb config set proxy http://127.0.0.1:1086
> save new settings
offckb config get proxy
> http://127.0.0.1:1086
```

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
