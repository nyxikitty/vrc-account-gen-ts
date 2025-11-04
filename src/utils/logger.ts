import { LogLevel } from '../types';

export class Logger {
  private static colors = {
    [LogLevel.INFO]: '\x1b[33m',
    [LogLevel.SUCCESS]: '\x1b[32m',
    [LogLevel.ERROR]: '\x1b[31m',
    [LogLevel.WARNING]: '\x1b[35m',
    reset: '\x1b[0m',
  };

  public static log(level: LogLevel, message: string, ...args: any[]): void {
    const color = this.colors[level];
    const timestamp = new Date().toISOString();
    console.log(`${color}[${timestamp}] [${level}] ${message}${this.colors.reset}`, ...args);
  }

  public static info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  public static success(message: string, ...args: any[]): void {
    this.log(LogLevel.SUCCESS, message, ...args);
  }

  public static error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  public static warning(message: string, ...args: any[]): void {
    this.log(LogLevel.WARNING, message, ...args);
  }
}