import { env } from '@src/config/env.js';
import type { ILogger, LogLevel, LogContext } from '@src/types/shared/index.js';

const ANSI_RESET = '\x1b[0m';
const ANSI_RED = '\x1b[31m';
const ANSI_GREEN = '\x1b[32m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_MAGENTA = '\x1b[35m';
const ANSI_CYAN = '\x1b[36m';

const COLOR_MAP: Record<LogLevel, string> = {
  error: ANSI_RED,
  warn: ANSI_YELLOW,
  info: ANSI_GREEN,
  http: ANSI_CYAN,
  debug: ANSI_MAGENTA
};

export class Logger implements ILogger {
  constructor(private readonly default_context: LogContext = {}) {}

  private static serialize_error(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      const error_object = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
      return error_object;
    }

    const fallback_object = {
      message: String(error)
    };
    return fallback_object;
  }

  private static normalize_context(context?: LogContext): LogContext | undefined {
    if (!context) {
      return undefined;
    }

    const normalized_entries: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(context)) {
      if (value instanceof Error) {
        normalized_entries[key] = Logger.serialize_error(value);
      } else {
        normalized_entries[key] = value;
      }
    }

    return normalized_entries;
  }

  private static format_development(level: LogLevel, message: string, timestamp: string, context?: LogContext): string {
    const color = COLOR_MAP[level] ?? ANSI_RESET;
    const upper_level = level.toUpperCase().padEnd(5);
    let serialized_context = '';

    if (context && Object.keys(context).length > 0) {
      serialized_context = ` ${JSON.stringify(context)}`;
    }

    const output = `[${timestamp}] ${color}[${upper_level}]${ANSI_RESET} ${message}${serialized_context}\n`;
    return output;
  }

  private static format_production(level: LogLevel, message: string, timestamp: string, context?: LogContext): string {
    const log_entry = {
      timestamp,
      level,
      message,
      ...(context ? { context } : {})
    };

    const output = `${JSON.stringify(log_entry)}\n`;
    return output;
  }

  private write(level: LogLevel, message: string, context?: LogContext): void {
    let merged_context: LogContext | undefined;

    if (Object.keys(this.default_context).length > 0 || context) {
      merged_context = { ...this.default_context, ...context };
    }

    const normalized = Logger.normalize_context(merged_context);
    const timestamp = new Date().toISOString();
    let formatted = '';

    if (env.NODE_ENV === 'production') {
      formatted = Logger.format_production(level, message, timestamp, normalized);
    } else {
      formatted = Logger.format_development(level, message, timestamp, normalized);
    }

    if (level === 'error') {
      process.stderr.write(formatted);
      return;
    }

    process.stdout.write(formatted);
  }

  debug(message: string, context?: LogContext): void {
    this.write('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.write('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.write('error', message, context);
  }

  http(message: string, context?: LogContext): void {
    this.write('http', message, context);
  }

  child(default_context: LogContext): ILogger {
    const child_context = {
      ...this.default_context,
      ...default_context
    };
    const child_logger = new Logger(child_context);
    return child_logger;
  }
}

export const logger = new Logger();
