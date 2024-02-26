import * as fs from "fs";
import { execSync } from "child_process";
import { devnetPath, devnetSourcePath } from "../cfg/const";
import path from "path";

export function initChain() {
  execSync(`cp -r ${devnetSourcePath} ${devnetPath}`);
  console.log("copy devnet config folder");
  copyAndEditMinerToml();

  execSync(`rm -rf ${devnetPath}/data`);
}

function copyAndEditMinerToml() {
  const minerToml = path.join(devnetSourcePath, "ckb-miner.toml");
  const newMinerToml = path.join(devnetPath, "ckb-miner.toml");
  // Read the content of the ckb-miner.toml file
  fs.readFile(minerToml, "utf8", (err, data) => {
    if (err) {
      return console.error("Error reading file:", err);
    }

    // Replace the URL
    const modifiedData = data.replace(
      "http://ckb:8114/",
      "http://localhost:8114"
    );

    // Write the modified content back to the file
    fs.writeFile(newMinerToml, modifiedData, "utf8", (err) => {
      if (err) {
        return console.error("Error writing file:", err);
      }
      console.log("modified ", newMinerToml);
    });
  });
}

