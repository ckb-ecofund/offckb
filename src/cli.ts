#!/usr/bin/env node
import { Command } from 'commander';
import { installDependency } from './cmd/develop/install';
import { buildAccounts, printIssueSectionForToml, genkey } from './cmd/develop/genkey';
import { listHashes } from './cmd/list-hashes';
import { node } from './cmd/node';
import { initChainIfNeeded } from './cmd/develop/init-chain';
import { writePredefinedDevnetLumosConfig } from './cmd/develop/lumos-config';
import { accounts } from './cmd/accounts';
import { clean } from './cmd/clean';
import { setUTF8EncodingForWindows } from './util/encoding';
import { injectConfig } from './cmd/inject-config';
import { DepositOptions, deposit } from './cmd/deposit';
import { DeployOptions, deploy } from './cmd/deploy';
import { syncConfig } from './cmd/sync-config';
import { TransferOptions, transfer } from './cmd/transfer';
import { BalanceOption, balanceOf } from './cmd/balance';
import { buildAccount } from './cmd/develop/build-account';
import { create, selectBareTemplate, CreateOption, createScriptProject } from './cmd/create';
import { deployedScripts, DeployedScriptOption } from './cmd/deployed-scripts';
import { Config, ConfigSection } from './cmd/config';

const version = require('../package.json').version;
const description = require('../package.json').description;

// fix windows terminal encoding of simplified chinese text
setUTF8EncodingForWindows();

const program = new Command();

program.name('offckb').description(description).version(version);

program
  .command('create [your-project-name]')
  .description('Create a new dApp from bare templates')
  .option('-s, --script', 'Only create the script project')
  .action(async (projectName: string, option: CreateOption) => {
    const name = projectName ?? 'my-first-ckb-project';
    if (option.script) {
      return await createScriptProject(name);
    }

    const template = await selectBareTemplate();
    return create(name, template);
  });

program.command('node').description('Use the CKB to start devnet').action(node);
program.command('clean').description('Clean the devnet data, need to stop running the chain first').action(clean);
program.command('accounts').description('Print account list info').action(accounts);
program.command('list-hashes').description('Use the CKB to list blockchain scripts hashes').action(listHashes);
program.command('inject-config').description('Add offckb.config.ts to your workspace').action(injectConfig);
program.command('sync-config').description('Sync offckb.config.ts in your workspace').action(syncConfig);

program
  .command('deposit [toAddress] [amountInShannon]')
  .description('Deposit CKB tokens to address, only devnet and testnet')
  .option('--network <network>', 'Specify the network to deposit to', 'devnet')
  .action(async (toAddress: string, amount: string, options: DepositOptions) => {
    return deposit(toAddress, amount, options);
  });

program
  .command('transfer [toAddress] [amountInShannon]')
  .description('Transfer CKB tokens to address, only devnet and testnet')
  .option('--network <network>', 'Specify the network to transfer to', 'devnet')
  .option('--privkey <privkey>', 'Specify the private key to deploy scripts')
  .action(async (toAddress: string, amount: string, options: TransferOptions) => {
    return transfer(toAddress, amount, options);
  });

program
  .command('balance [toAddress]')
  .description('Check account balance, only devnet and testnet')
  .option('--network <network>', 'Specify the network to check', 'devnet')
  .action(async (toAddress: string, options: BalanceOption) => {
    return balanceOf(toAddress, options);
  });

program
  .command('deploy')
  .description('Deploy contracts to different networks, only supports devnet and testnet')
  .option('--network <network>', 'Specify the network to deploy to', 'devnet')
  .option('--target <target>', 'Specify the relative bin target folder to deploy to')
  .option('--privkey <privkey>', 'Specify the private key to deploy scripts')
  .action((options: DeployOptions) => deploy(options));

program
  .command('deployed-scripts')
  .description('Show deployed contracts info on different networks, only supports devnet and testnet')
  .option('--network <network>', 'Specify the network to deploy to', 'devnet')
  .action((options: DeployedScriptOption) => deployedScripts(options));

program
  .command('config <action> [section] [value]')
  .description('do a configuration action')
  .action((action, section, value) => Config(action, section as ConfigSection, value));

// Add commands meant for developers
if (process.env.NODE_ENV === 'development') {
  // Define the CLI commands and options
  program.command('install').description('Install the ckb dependency binary').action(installDependency);

  program.command('genkey').description('Generate 20 accounts').action(genkey);

  program.command('init-chain').description('Use the CKB to init devnet').action(initChainIfNeeded);

  program
    .command('build-devnet-lumos-config')
    .description('Use the CKB to generate predefined devnet lumos config.json')
    .action(writePredefinedDevnetLumosConfig);

  program.command('build-accounts').description('Generate accounts with prefunded CKB tokens').action(buildAccounts);

  program
    .command('print-account-issue-info')
    .description('Print account issue cells config toml sections')
    .action(printIssueSectionForToml);

  program
    .command('build-account [privateKey]')
    .description('Print standard account info from a privatekey')
    .action(buildAccount);
}

program.parse(process.argv);

// If no command is specified, display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
