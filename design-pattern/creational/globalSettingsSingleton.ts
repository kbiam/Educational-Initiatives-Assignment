import { ConsoleLogger, Logger } from "../utility";

export class GlobalSettings {
  private static instance: GlobalSettings | null = null;
  private settings: Map<string, any> = new Map();
  private logger: Logger;
  private readonly validationRules: Map<string, (value: any) => boolean> = new Map();
  private changeHistory: Array<{ key: string; oldValue: any; newValue: any; timestamp: Date }> = [];

  private constructor() {
    this.logger = new ConsoleLogger();
    this.initializeDefaultSettings();
    this.setupValidationRules();
    this.logger.log("GlobalSettings instance created");
  }

  static getInstance(): GlobalSettings {
    if (!GlobalSettings.instance) {
      GlobalSettings.instance = new GlobalSettings();
    }
    return GlobalSettings.instance;
  }

  set(key: string, value: any): void {
    if (!key || typeof key !== 'string') {
      throw new Error("Setting key must be a non-empty string");
    }

    if (!this.validateSetting(key, value)) {
      throw new Error(`Invalid value for setting '${key}': ${value}`);
    }

    const oldValue = this.settings.get(key);
    this.settings.set(key, value);
    
    this.changeHistory.push({
      key,
      oldValue,
      newValue: value,
      timestamp: new Date()
    });

    this.logger.log(`[Settings] ${key} changed from ${oldValue} to ${value}`);
  }

  get<T = any>(key: string): T | undefined {
    if (!key || typeof key !== 'string') {
      throw new Error("Setting key must be a non-empty string");
    }
    return this.settings.get(key) as T;
  }

  has(key: string): boolean {
    return this.settings.has(key);
  }

  remove(key: string): boolean {
    if (!key || typeof key !== 'string') {
      throw new Error("Setting key must be a non-empty string");
    }

    const existed = this.settings.delete(key);
    if (existed) {
      this.logger.log(`[Settings] Removed setting: ${key}`);
    }
    return existed;
  }

  getAllSettings(): Record<string, any> {
    return Object.fromEntries(this.settings.entries());
  }

  getChangeHistory(): Array<{ key: string; oldValue: any; newValue: any; timestamp: Date }> {
    return [...this.changeHistory];
  }

  private initializeDefaultSettings(): void {
    this.settings.set('appName', 'Smart Transport System');
    this.settings.set('version', '1.0.0');
    this.settings.set('debugMode', false);
    this.settings.set('maxRetries', 3);
    this.settings.set('timeoutMs', 5000);
  }

  private setupValidationRules(): void {
    this.validationRules.set('maxRetries', (value) => 
      typeof value === 'number' && value >= 0 && value <= 10);
    this.validationRules.set('timeoutMs', (value) => 
      typeof value === 'number' && value >= 1000 && value <= 30000);
    this.validationRules.set('debugMode', (value) => 
      typeof value === 'boolean');
  }

  private validateSetting(key: string, value: any): boolean {
    const rule = this.validationRules.get(key);
    if (rule) {
      return rule(value);
    }
    return true; // No validation rule = allow any value
  }

  // Prevent cloning
  private clone(): never {
    throw new Error("Cannot clone singleton instance");
  }
}