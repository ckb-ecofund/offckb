import { BindingLanguage, generateMolBindings } from '../molecule/mol';
import fs from 'fs';
import path from 'path';

export async function molSingleFile(schemeFilePath: string, outputFilePath: string, bindingLang: string) {
  await generateMolBindings(schemeFilePath, outputFilePath, bindingLang as BindingLanguage);
}

export async function molFiles(schemaFolderPath: string, outputFolderPath: string, bindingLang: string) {
  const files = fs.readdirSync(schemaFolderPath).filter((file) => file.endsWith('.mol'));

  if (files.length === 0) {
    throw new Error(`No .mol files found in the specified folder: ${schemaFolderPath}`);
  }

  for (const file of files) {
    const filePath = path.join(schemaFolderPath, file);
    const outputFileName = path.basename(file, '.mol') + '.' + bindingLang;
    const outputFilePath = path.join(outputFolderPath, outputFileName);
    await molSingleFile(filePath, outputFilePath, bindingLang as BindingLanguage);
  }
}
