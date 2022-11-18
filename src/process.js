import { spawn } from "node:child_process";
import { EOL } from "node:os";

export class Process {
  constructor(path) {
      this.process = spawn(path);
      this.process.on("error", (err) => {
          this.error = err;
      });
  }

  get isRunning() {
    return !!(this.process.pid && this.process.exitCode == null);
  }

  /**
   * @param {string} command
   * @return {void}
   */
  send(command) {
    this.process.stdin?.write(`${command}${EOL}`);
  }

  /**
   * @param {(line : string) => void} callback
   */
  onReadLine(callback) {
    this.process.stdout?.on("data", (data) => {
      const lines = data.toString().split(EOL).filter(x => x);
      for (let i = 0, length = lines.length; i < length; i++) {
        callback(lines[i]);
      }
    });
  }

  /**
   * @param {(code : number) => void} callback
   */
  onExit(callback) {
    this.process.on("exit", (code) => {
      callback(code);
    });
  }
}
