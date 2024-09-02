import * as fs from 'fs';
import path from 'path';
import { isAbsolutePath } from '../util/fs';

export class OffCKBConfigFile {
  static updateVersion(version: string, filePath: string) {
    const versionTarget = '@offckb-update-version';
    let fileContent = fs.readFileSync(filePath, 'utf-8');
    fileContent = fileContent.replace(versionTarget, version);
    // Write the updated content back to the file
    fs.writeFileSync(filePath, fileContent, 'utf-8');
  }

  static readContractInfoFolder(filePath: string): string | null {
    // Read the contents of the TS file
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Use a regular expression to find the version value
    const match = fileContents.match(/contractInfoFolder:\s*['"]([^'"]+)['"]/);
    if (match && match[1]) {
      const contractInfoFolderValue = match[1];
      const folderPath = path.dirname(filePath);
      const contractInfoFolder = isAbsolutePath(contractInfoFolderValue)
        ? contractInfoFolderValue
        : path.resolve(folderPath, contractInfoFolderValue);
      return contractInfoFolder;
    } else {
      console.log('contractBinFolder value not found in offckb.config.ts');
      return null;
    }
  }
}
