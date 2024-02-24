import { execSync } from "child_process";

export function listHashes() {
  try {
    // Assuming the binary is named 'dep-binary' and is in the same directory
    const result = execSync("target/ckb/ckb list-hashes  -C docker/devnet", {
      stdio: "inherit",
    });
    console.log(result);
  } catch (error) {
    console.error("Error running dependency binary:", error);
  }
}
