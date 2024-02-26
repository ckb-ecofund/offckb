import { execSync } from "child_process";
import { devnetPath } from "../cfg/const";

export function listHashes() {
  const cmd = `target/ckb/ckb list-hashes  -C ${devnetPath}`;
  try {
    execSync(cmd, {
      stdio: "inherit",
    });
  } catch (error) {
    console.error("Error running dependency binary:", error);
  }
}
