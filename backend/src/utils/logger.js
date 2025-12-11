// src/utils/logger.js

// Färgkoder
const colors = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m"
};

// Tidsstämplar i ISO-format
function timestamp() {
  return new Date().toISOString();
}

// Format helper
function format(level, color, msg) {
  const time = timestamp();
  return `${colors.gray}${time}${colors.reset} ${color}${level}${colors.reset} ${msg}`;
}

// MAIN LOGGER OBJECT
export const log = {
  info: (msg) => console.log(format("[INFO]", colors.blue, msg)),
  success: (msg) => console.log(format("[OK]", colors.green, msg)),
  warn: (msg) => console.warn(format("[WARN]", colors.yellow, msg)),
  error: (msg) => console.error(format("[ERROR]", colors.red, msg)),
  debug: (msg) => {
    if (process.env.DEBUG === "true") {
      console.log(format("[DEBUG]", colors.magenta, msg));
    }
  }
};

export default log;
