import "server-only";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
    [key: string]: unknown;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === "development";

    private formatMessage(
        level: LogLevel,
        message: string,
        context?: LogContext
    ): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` ${JSON.stringify(context)}` : "";
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    private log(level: LogLevel, message: string, context?: LogContext): void {
        if (!this.isDevelopment && level === "debug") {
            return;
        }

        const formattedMessage = this.formatMessage(level, message, context);

        switch (level) {
            case "error":
                console.error(formattedMessage);
                break;
            case "warn":
                console.warn(formattedMessage);
                break;
            case "debug":
                if (this.isDevelopment) {
                    console.debug(formattedMessage);
                }
                break;
            default:
                console.log(formattedMessage);
        }
    }

    info(message: string, context?: LogContext): void {
        this.log("info", message, context);
    }

    warn(message: string, context?: LogContext): void {
        this.log("warn", message, context);
    }

    error(message: string, error?: Error | unknown, context?: LogContext): void {
        const errorContext = {
            ...context,
            ...(error instanceof Error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: this.isDevelopment ? error.stack : undefined,
                },
            }),
        };
        this.log("error", message, errorContext);
    }

    debug(message: string, context?: LogContext): void {
        this.log("debug", message, context);
    }
}

export const logger = new Logger();
