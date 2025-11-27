export function log(...msg) {
  console.log("[INFO]", ...msg);
}

export function error(...msg) {
  console.error("[ERROR]", ...msg);
}
