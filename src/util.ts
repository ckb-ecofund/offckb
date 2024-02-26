import * as fs from 'fs';

export function isFolderExists(folderPath: string): boolean {
  try {
    // Check if the path exists
    fs.accessSync(folderPath, fs.constants.F_OK);

    // Check if it's a directory
    const stats = fs.statSync(folderPath);
    return stats.isDirectory();
  } catch (error) {
    // If the access or stat fails, or if it's not a directory, return false
    return false;
  }
}
