import os from "os";

export function runningOnWindows() {
  console.log("Element AI Logs >>> runningOnWindows: ", os.platform(), os.platform() === "win32");
  return os.platform() === "win32";
}
