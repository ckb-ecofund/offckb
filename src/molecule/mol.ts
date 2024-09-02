import { execSync } from 'child_process';
import { MoleculecES } from '../tools/moleculec-es';
import { MoleculecRust } from '../tools/moleculec-rust';
import { readSettings } from '../cfg/setting';
import path from 'path';
import * as fs from 'fs';
import { MoleculecGo } from '../tools/moleculec-go';

export enum BindingLanguage {
  rust = 'rs',
  c = 'c',
  typescript = 'ts',
  javascript = 'js',
  go = 'go',
}

export async function generateMolBindings(
  schemeFilePath: string,
  outputFilePath: string | undefined,
  bindingLanguage: BindingLanguage,
) {
  await installMolToolsIfNeeded();
  const settings = readSettings();
  if (bindingLanguage === BindingLanguage.typescript) {
    const jsonFilePath = path.join(settings.tools.moleculeES.cachePath, 'schema.json');
    fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });
    if (outputFilePath) {
      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
    }

    execSync(`moleculec --language - --schema-file ${schemeFilePath} --format json > ${jsonFilePath}`);
    execSync(
      `${MoleculecES.bin} -generateTypeScriptDefinition -hasBigInt -inputFile ${jsonFilePath} -outputFile ${outputFilePath || '-'}`,
      { stdio: 'inherit' },
    );
    return;
  }

  if (bindingLanguage === BindingLanguage.javascript) {
    const jsonFilePath = path.join(settings.tools.moleculeES.cachePath, 'schema.json');
    fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });
    if (outputFilePath) {
      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
    }

    execSync(`moleculec --language - --schema-file ${schemeFilePath} --format json > ${jsonFilePath}`, {
      stdio: 'inherit',
    });
    execSync(`${MoleculecES.bin} -hasBigInt -inputFile ${jsonFilePath} -outputFile ${outputFilePath || '-'}`, {
      stdio: 'inherit',
    });
    return;
  }

  if (bindingLanguage === BindingLanguage.c) {
    if (!outputFilePath) {
      execSync(`moleculec --language c --schema-file ${schemeFilePath}`, {
        stdio: 'inherit',
      });
      return;
    }

    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

    execSync(`moleculec --language c --schema-file ${schemeFilePath} > ${outputFilePath}`, {
      stdio: 'inherit',
    });
    return;
  }

  if (bindingLanguage === BindingLanguage.rust) {
    if (!outputFilePath) {
      execSync(`moleculec --language rust --schema-file ${schemeFilePath}`, {
        stdio: 'inherit',
      });
      return;
    }

    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

    execSync(`moleculec --language rust --schema-file ${schemeFilePath} > ${outputFilePath}`, {
      stdio: 'inherit',
    });
    return;
  }

  if (bindingLanguage === BindingLanguage.go) {
    if (!outputFilePath) {
      execSync(`moleculec --language go --schema-file ${schemeFilePath}`, {
        stdio: 'inherit',
      });
      return;
    }

    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

    execSync(`moleculec --language go --schema-file ${schemeFilePath} | gofmt > ${outputFilePath}`, {
      stdio: 'inherit',
    });
    return;
  }

  throw new Error(`Unsupported binding language: ${bindingLanguage}`);
}

export async function installMolToolsIfNeeded() {
  if (!MoleculecES.isBinaryInstalled()) {
    const version = '0.4.6';
    await MoleculecES.installMoleculeES(version);
  }

  if (!MoleculecRust.isBinaryInstalled()) {
    MoleculecRust.installBinary();
  }

  if (!MoleculecGo.isBinaryInstalled()) {
    MoleculecGo.installBinary();
  }
}
