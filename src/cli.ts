#!/usr/bin/env node
import { Command } from "commander";
import { execSync } from "child_process";
import { installDependency } from "./cmd/install";
import { genkey } from "./cmd/genkey";

const program = new Command();

program
  .name('offckb')
  .description('CLI to provide full ckb development environment for professionals')
  .version('0.1.0');

// Define the CLI commands and options
program
  .command("install")
  .description("Install the ckb dependency binary")
  .action(installDependency);

program
  .command("genkey")
  .description("genereate 20 accounts")
  .action(genkey);

program
  .command("use")
  .description("Use the dependency binary")
  .action(useDependency);

// Parse command-line arguments
program.parse(process.argv);

// If no command is specified, display help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}



// Function to use the installed dependency binary
function useDependency() {
  try {
    // Assuming the binary is named 'dep-binary' and is in the same directory
    execSync("./dep-binary", { stdio: "inherit" });
  } catch (error) {
    console.error("Error running dependency binary:", error);
  }
}
