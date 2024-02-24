#!/usr/bin/env node
import { Command } from "commander";
import { installDependency } from "./cmd/install";
import { genkey } from "./cmd/genkey";
import { listHashes } from "./cmd/list-hashes";

const program = new Command();

program
  .name("offckb")
  .description(
    "CLI to provide full ckb development environment for professionals",
  )
  .version("0.1.0");

// Define the CLI commands and options
program
  .command("install")
  .description("Install the ckb dependency binary")
  .action(installDependency);

program.command("genkey").description("genereate 20 accounts").action(genkey);

program
  .command("list-hashes")
  .description("Use the CKB to list blockchain scripts hashes")
  .action(listHashes);

// Parse command-line arguments
program.parse(process.argv);

// If no command is specified, display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
