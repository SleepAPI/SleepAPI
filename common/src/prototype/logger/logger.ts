/* eslint-disable @typescript-eslint/no-explicit-any */
type LogLevel = 'debug' | 'log' | 'info' | 'warn' | 'error';
type Loggable = string | number | boolean | object | any[] | null | Error;

export class Logger {
  private get isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined';
  }

  debug(message: Loggable): void {
    this.print('debug', message);
  }

  log(message: Loggable): void {
    this.print('log', message);
  }

  info(message: Loggable): void {
    this.print('info', message);
  }

  warn(message: Loggable): void {
    this.print('warn', message);
  }

  error(message: Loggable): void {
    this.print('error', message);
  }

  private print(level: LogLevel, message: Loggable): void {
    const formattedMessage = this.formatMessage(level, message);

    if (this.isBrowser) {
      const styles: Record<LogLevel, string> = {
        debug: 'color: green;',
        log: 'color: gray;',
        info: 'color: blue;',
        warn: 'color: orange;',
        error: 'color: red; font-weight: bold;',
      };

      console[level](`%c${formattedMessage}`, styles[level]);
    } else {
      const coloredMessage = this.colorize(level, formattedMessage);
      console[level](coloredMessage);
    }
  }

  private formatMessage(level: LogLevel, message: Loggable): string {
    const timestamp = new Date().toISOString();
    let formattedContent: string;

    if (typeof message === 'string') {
      formattedContent = message;
    } else if (typeof message === 'number' || typeof message === 'boolean' || message === null) {
      formattedContent = String(message);
    } else if (message instanceof Error) {
      formattedContent = `${message.message}\nStacktrace:\n${message.stack || ''}`;
    } else if (Array.isArray(message) || typeof message === 'object') {
      formattedContent = JSON.stringify(message, null, 2); // Pretty-print objects and arrays
    } else {
      formattedContent = String(message); // Fallback for other types
    }

    return `[${level.toUpperCase()}] ${timestamp}: ${formattedContent}`;
  }

  private colorize(level: LogLevel, message: string): string {
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[32m', // Green
      log: '\x1b[90m', // Gray
      info: '\x1b[34m', // Blue
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
    };

    const reset = '\x1b[0m';
    return `${colors[level]}${message}${reset}`;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var logger: Logger;
}

const loggerInstance = new Logger();
if (typeof window !== 'undefined') {
  window.logger = loggerInstance; // Browser
} else if (typeof global !== 'undefined') {
  global.logger = loggerInstance; // Node.js
}
