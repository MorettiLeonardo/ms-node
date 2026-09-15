export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'http';

export type LogContext = Record<string, unknown>;

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  http(message: string, context?: LogContext): void;
  child(default_context: LogContext): ILogger;
}
