import { ILogger } from "./types";


// ============================================================================
// LOGGER IMPLEMENTATION (Singleton Pattern)
// ============================================================================

export class ConsoleLogger implements ILogger {
  private static instance: ConsoleLogger;
  private logHistory: string[] = [];

  private constructor() {}

  static getInstance(): ConsoleLogger {
    if (!ConsoleLogger.instance) {
      ConsoleLogger.instance = new ConsoleLogger();
    }
    return ConsoleLogger.instance;
  }

  info(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[INFO] [${timestamp}] ${message}`;
    console.log(logMessage);
    this.logHistory.push(logMessage);
  }

  warn(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[WARN] [${timestamp}] ${message}`;
    console.warn(logMessage);
    this.logHistory.push(logMessage);
  }

  error(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[ERROR] [${timestamp}] ${message}`;
    console.error(logMessage);
    this.logHistory.push(logMessage);
  }

  getHistory(): string[] {
    return [...this.logHistory];
  }
}