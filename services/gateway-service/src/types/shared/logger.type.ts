export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

export type LogContext = Record<string, unknown>;

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  http(message: string, context?: LogContext): void;
  child(context: LogContext): ILogger;
}
