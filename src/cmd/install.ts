import axios from "axios";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import semver from "semver";
import os from "os";
import AdmZip from "adm-zip";

const BINARY = "ckb";
const MINIMAL_VERSION = "0.113.1"; // Example latest version

// Function to download and install the dependency binary
export async function installDependency() {
  const version = getInstalledVersion();
  if (version) {
    if (isVersionOutdated(version)) {
      console.log(`${BINARY} version ${version} is outdated, download and install the new version ${MINIMAL_VERSION}..`);
      console.log(buildDownloadUrl(MINIMAL_VERSION))
    } else {
      return;
    }
  } else {
    console.log(`${BINARY} not found, download and install the new version ${MINIMAL_VERSION}..`);
  }

  const arch = getArch();
  const osname = getOS();
  try {
    const downloadURL = buildDownloadUrl(MINIMAL_VERSION);
    const response = await axios.get(downloadURL, { responseType: "arraybuffer" });
    const tempFilePath = path.join(os.tmpdir(), `ckb_v${version}_${osname}.zip`);

    // Write downloaded file to temporary location
    fs.writeFileSync(tempFilePath, response.data);

    // Unzip the file
    const zip = new AdmZip(tempFilePath);
    const rootDir = process.cwd();
    const targetDir = path.join(rootDir, `target`);
    const extractDir = path.join(targetDir, `ckb_v${MINIMAL_VERSION}`);
    zip.extractAllTo(extractDir, /*overwrite*/ true);

    // Install the extracted files
    const originalBinFolderPath = path.join(extractDir, `ckb_v${MINIMAL_VERSION}_${arch}-${osname}`);
    const binFolerPath = path.join(targetDir, "ckb");
    const ckbBinPath = path.join(binFolerPath, "ckb");
    fs.renameSync(originalBinFolderPath, binFolerPath); // Move binary to desired location
    fs.chmodSync(ckbBinPath, "755"); // Make the binary executable

    console.log("CKB installed successfully.");
  } catch (error) {
    console.error("Error installing dependency binary:", error);
  }
}


function getInstalledVersion(): string | null {
  try {
    const versionOutput = execSync(`${BINARY} --version`, {
      encoding: "utf-8",
    });

    const versionMatch = versionOutput.match(/(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      return versionMatch[0];
    }
    return null;
  } catch (error) {
    console.error("Error retrieving installed version:", error);
    return null;
  }
}

function isVersionOutdated(installedVersion: string): boolean {
  return semver.lt(installedVersion, MINIMAL_VERSION);
}

function getOS(): string {
  const platform = os.platform();
  if (platform === "darwin") {
    return "apple-darwin";
  } else if (platform === "linux") {
    return "unknown-linux-gnu";
  } else if (platform === "win32") {
    return "pc-windows-msvc";
  } else {
    throw new Error("Unsupported operating system");
  }
}

function getArch(): string {
  const arch = os.arch();
  if (arch === "x64") {
    return "x86_64";
  } else if (arch === "arm64") {
    return "aarch64";
  } else {
    throw new Error("Unsupported architecture");
  }
}

function buildDownloadUrl(version: string): string {
  const os = getOS();
  const arch = getArch();
  return `https://github.com/nervosnetwork/ckb/releases/download/v${version}/ckb_v${version}_${arch}-${os}.zip`;
}
