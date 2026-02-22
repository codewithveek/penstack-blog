/**
 * apps/api/src/lib/logger.ts
 *
 * Structured application logger.
 * Use this everywhere — never console.log.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

const isDev = process.env.NODE_ENV !== "production";

function writeLog(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  err?: unknown
): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context !== undefined && { context }),
  };

  if (err != null) {
    const e = err instanceof Error ? err : new Error(String(err));
    entry.error = {
      name: e.name,
      message: e.message,
      ...(isDev && e.stack !== undefined ? { stack: e.stack } : {}),
    };
  }

  if (isDev) {
    const prefix = { debug: "🔍", info: "ℹ️", warn: "⚠️", error: "❌" }[level];
    const baseMsg = `${prefix} [${level.toUpperCase()}] ${message}`;
    if (level === "error") {
      console.error(baseMsg, context ?? "", err ?? "");
    } else {
      console.log(baseMsg, context ?? "");
    }
    return;
  }

  // Production: structured JSON to stdout
  process.stdout.write(JSON.stringify(entry) + "\n");
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    writeLog("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    writeLog("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    writeLog("warn", message, context),
  error: (message: string, err?: unknown, context?: Record<string, unknown>) =>
    writeLog("error", message, context, err),
};
