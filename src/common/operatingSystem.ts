import os from "os";

export function runningOnWindows() {
  return os.platform() === "win32";
}
