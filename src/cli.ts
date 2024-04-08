#!/usr/bin/env node
import { Command } from 'commander';
import { installDependency } from './cmd/install';
import { buildAccounts, printIssueSectionForToml, genkey } from './cmd/genkey';
import { listHashes } from './cmd/list-hashes';
import { node } from './cmd/node';
import { initChainIfNeeded } from './cmd/init-chain';
import { writePredefinedDevnetLumosConfig } from './cmd/lumos-config';
import { init, initBare, selectTemplate } from './cmd/init';
import { accounts } from './cmd/accounts';
import { clean } from './cmd/clean';
import { setUTF8EncodingForWindows } from './encoding';
import { injectConfig } from './cmd/inject-config';
import { DepositOptions, deposit } from './cmd/deposit';
import { DeployOptions, deploy } from './cmd/deploy';
import { updateConfig } from './cmd/update-config';
import { TransferOptions, transfer } from './cmd/transfer';
import { BalanceOption, balanceOf } from './cmd/balance';
import { buildAccount } from './cmd/buildAccount';
const version = require('../package.json').version;
const description = require('../package.json').description;

// fix windows terminal encoding of simplified chinese text
setUTF8EncodingForWindows();

const program = new Command();

program.name('offckb').description(description).version(version);

program
  .command('init [your-project-name]')
  .description('init dapp project with lumos')
  .option('--bare', 'enable bare template mode')
  .action(async (str, options) => {
    const name = str ?? 'my-awesome-ckb-dapp';
    const isBare = options.bare || false; // Check if --bare option is present
    if (isBare) {
      return initBare(name);
    }

    const template = await selectTemplate();
    return init(name, template);
  });

program.command('node').description('Use the CKB to start devnet').action(node);
program.command('clean').description('Clean the devnet data, need to stop running the chain first').action(clean);
program.command('accounts').description('print account list info').action(accounts);
program.command('list-hashes').description('Use the CKB to list blockchain scripts hashes').action(listHashes);
program.command('inject-config').description('Add offckb.config.ts to your workspace').action(injectConfig);
program.command('update-config').description('Update offckb.config.ts in your workspace').action(updateConfig);

program
  .command('deposit [toAddress] [amountInShannon]')
  .description('deposit CKB tokens to address, only devnet and testnet')
  .option('--network <network>', 'specify the network to deposit to', 'devnet')
  .action(async (toAddress: string, amount: string, options: DepositOptions) => {
    return deposit(toAddress, amount, options);
  });

program
  .command('transfer [privateKey] [toAddress] [amountInShannon]')
  .description('transfer CKB tokens to address, only devnet and testnet')
  .option('--network <network>', 'specify the network to transfer to', 'devnet')
  .action(async (privateKey: string, toAddress: string, amount: string, options: TransferOptions) => {
    return transfer(privateKey, toAddress, amount, options);
  });

program
  .command('balance [toAddress]')
  .description('Check account balance, only devnet and testnet')
  .option('--network <network>', 'specify the network to check', 'devnet')
  .action(async (toAddress: string, options: BalanceOption) => {
    return balanceOf(toAddress, options);
  });

program
  .command('deploy')
  .description('deploy contracts to different networks, only supports devnet and testnet')
  .option('--network <network>', 'specify the network to deploy to', 'devnet')
  .action((options: DeployOptions) => deploy(options));

// Add commands meant for developers
if (process.env.NODE_ENV === 'development') {
  // Define the CLI commands and options
  program.command('install').description('Install the ckb dependency binary').action(installDependency);

  program.command('genkey').description('generate 20 accounts').action(genkey);

  program.command('init-chain').description('Use the CKB to init devnet').action(initChainIfNeeded);

  program
    .command('build-devnet-lumos-config')
    .description('Use the CKB to generate predefined devnet lumos config.json')
    .action(writePredefinedDevnetLumosConfig);

  program.command('build-accounts').description('generate accounts with prefunded CKB tokens').action(buildAccounts);

  program
    .command('print-account-issue-info')
    .description('print account issue cells config toml sections')
    .action(printIssueSectionForToml);

  program
    .command('build-account [privateKey]')
    .description('print standard account info from a privatekey')
    .action(buildAccount);
}

program.parse(process.argv);

// If no command is specified, display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
