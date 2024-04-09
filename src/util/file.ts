import fs from 'fs';

export function updateVersionInTSFile(newVersion: string, filePath: string): void {
  try {
    // Read the contents of the TS file
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Use a regular expression to find the version value
    const regex = /const\s+offCKBConfig:\s+OffCKBConfig\s*=\s*\{\s*version:\s*'([^']+)'/;
    const match = fileContents.match(regex);

    if (match) {
      // Replace the version value with the new value
      const updatedContents = fileContents.replace(
        regex,
        `const offCKBConfig: OffCKBConfig = {\n  version: '${newVersion}',`,
      );

      // Write the updated contents back to the file
      fs.writeFileSync(filePath, updatedContents, 'utf8');
      console.log(`Version updated to '${newVersion}' in ${filePath}`);
    } else {
      console.error(`Could not find version value in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating version in ${filePath}: ${error}`);
  }
}
