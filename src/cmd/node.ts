import { exec } from "child_process";
import { devnetPath } from "../cfg/const";

export function node() {
  const binPath = "target/ckb/ckb";
  const ckbCmd = `${binPath} run -C ${devnetPath}`;
  const minerCmd = `${binPath} miner -C ${devnetPath}`;
  try {
    // Run first command
    const ckbProcess = exec(ckbCmd);
    // Log first command's output
    ckbProcess.stdout?.on("data", (data) => {
      console.log("CKB output:", data.toString());
    });

    ckbProcess.stderr?.on("data", (data) => {
      console.error("CKB error:", data.toString());
    });

    // Start the second command after 3 seconds
    setTimeout(async () => {
      try {
        // Run second command
        const minerProcess = exec(minerCmd);
        minerProcess.stdout?.on("data", (data) => {
          console.log("CKB-Miner:", data.toString());
        });

        minerProcess.stderr?.on("data", (data) => {
          console.error("CKB-Miner error:", data.toString());
        });
      } catch (error) {
        console.error("Error running CKB-Miner:", error);
      }
    }, 3000);
  } catch (error) {
    console.error("Error:", error);
  }
}
