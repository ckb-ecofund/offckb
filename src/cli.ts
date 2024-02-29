#!/usr/bin/env node
import { Command } from 'commander';
import { installDependency } from './cmd/install';
import { buildAccounts, printIssueSectionForToml, genkey } from './cmd/genkey';
import { listHashes } from './cmd/list-hashes';
import { node } from './cmd/node';
import { initChainIfNeeded } from './cmd/init-chain';
import { buildLumosConfig } from './cmd/build-lumos-config';
import { init } from './cmd/init';
import { accounts } from './cmd/accounts';
const version = require('../package.json').version;

const program = new Command();

program
  .name('offckb')
  .description('CLI to provide full ckb development environment for professionals')
  .version(version);

program
  .command('init')
  .description('init dapp project with lumos')
  .argument('<string>', 'name of the dapp')
  .action((str) => {
    const name = str ?? 'offckb-dapp';
    return init(name);
  });

program.command('node').description('Use the CKB to start devnet').action(node);
program.command('accounts').description('print account list info').action(accounts);
program.command('list-hashes').description('Use the CKB to list blockchain scripts hashes').action(listHashes);

// Add commands meant for developers
if (process.env.NODE_ENV === 'development') {
  // Define the CLI commands and options
  program.command('install').description('Install the ckb dependency binary').action(installDependency);

  program.command('genkey').description('generate 20 accounts').action(genkey);

  program.command('init-chain').description('Use the CKB to init devnet').action(initChainIfNeeded);

  program
    .command('build-lumos-config')
    .description('Use the CKB to generate lumos config.json')
    .action(buildLumosConfig);

  program.command('build-accounts').description('generate accounts with prefunded CKB tokens').action(buildAccounts);

  program
    .command('print-account-issue-info')
    .description('print account issue cells config toml sections')
    .action(printIssueSectionForToml);
}

// Parse command-line arguments
program.parse(process.argv);

// If no command is specified, display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
