import pino from "pino";
import fs from "fs";
import path from "path";

export type Logger = pino.Logger;

console.log("Current working directory:", process.cwd());

const logsDir = path.resolve(__dirname, "../logs");
console.log("Logs directory path:", logsDir);

try {
  if (!fs.existsSync(logsDir)) {
    console.log("Creating logs directory...");
    fs.mkdirSync(logsDir, { recursive: true });
    console.log("Logs directory created successfully");
  } else {
    console.log("Logs directory already exists");
  }
} catch (error) {
  console.error("Error creating logs directory:", error);
}

const fallbackLogger: Logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
} as unknown as Logger;

let logger: Logger;
try {
  logger = pino({
    level: process.env.LOG_LEVEL || "info",
    transport: {
      targets: [
        {
          target: "pino-pretty",
          level: process.env.LOG_LEVEL || "info",
          options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
        {
          target: "pino/file",
          level: "error",
          options: {
            destination: path.join(logsDir, "error.log"),
            mkdir: true,
          },
        },
      ],
    },
  });
} catch (error) {
  console.error("Failed to initialize pino logger, using fallback:", error);
  logger = fallbackLogger;
}

export default logger;
