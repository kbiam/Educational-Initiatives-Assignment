import { ConsoleLogger, Logger } from "../utility";

interface SmartDevice {
  getId(): string;
  getType(): string;
  getCapabilities(): string[];
  initialize(): void;
  getStatus(): DeviceStatus;
  performAction(action: string, params?: any): Promise<boolean>;
}

interface DeviceStatus {
  isOnline: boolean;
  batteryLevel?: number;
  lastActivity: Date;
  errorState?: string;
}

class SmartLight implements SmartDevice {
  private id: string;
  private isOn: boolean = false;
  private brightness: number = 100;
  private color: string = 'white';
  private status: DeviceStatus;

  constructor(id: string) {
    if (!id.trim()) {
      throw new Error("Device ID cannot be empty");
    }
    this.id = id;
    this.status = {
      isOnline: true,
      lastActivity: new Date()
    };
  }

  getId(): string {
    return this.id;
  }

  getType(): string {
    return 'Smart Light';
  }

  getCapabilities(): string[] {
    return ['toggle', 'setBrightness', 'setColor', 'schedule'];
  }

  initialize(): void {
    console.log(`[${this.id}] Smart Light initialized - Ready for commands`);
    this.status.lastActivity = new Date();
  }

  getStatus(): DeviceStatus {
    return { ...this.status };
  }

  async performAction(action: string, params?: any): Promise<boolean> {
    try {
      this.status.lastActivity = new Date();
      
      switch (action) {
        case 'toggle':
          this.isOn = !this.isOn;
          console.log(`[${this.id}] Light ${this.isOn ? 'ON' : 'OFF'}`);
          return true;
        case 'setBrightness':
          if (params?.level >= 0 && params?.level <= 100) {
            this.brightness = params.level;
            console.log(`[${this.id}] Brightness set to ${this.brightness}%`);
            return true;
          }
          return false;
        case 'setColor':
          if (params?.color) {
            this.color = params.color;
            console.log(`[${this.id}] Color set to ${this.color}`);
            return true;
          }
          return false;
        default:
          console.log(`[${this.id}] Unknown action: ${action}`);
          return false;
      }
    } catch (error) {
      if (error instanceof Error) {
        this.status.errorState = error.message;
      } else {
        this.status.errorState = String(error);
      }
      return false;
    }
  }
}

class SmartCamera implements SmartDevice {
  private id: string;
  private isRecording: boolean = false;
  private resolution: string = '1080p';
  private status: DeviceStatus;

  constructor(id: string) {
    if (!id.trim()) {
      throw new Error("Device ID cannot be empty");
    }
    this.id = id;
    this.status = {
      isOnline: true,
      batteryLevel: 85,
      lastActivity: new Date()
    };
  }

  getId(): string {
    return this.id;
  }

  getType(): string {
    return 'Smart Camera';
  }

  getCapabilities(): string[] {
    return ['startRecording', 'stopRecording', 'setResolution', 'takeSnapshot'];
  }

  initialize(): void {
    console.log(`[${this.id}] Smart Camera initialized - Surveillance ready`);
    this.status.lastActivity = new Date();
  }

  getStatus(): DeviceStatus {
    return { ...this.status };
  }

  async performAction(action: string, params?: any): Promise<boolean> {
    try {
      this.status.lastActivity = new Date();
      
      switch (action) {
        case 'startRecording':
          if (!this.isRecording) {
            this.isRecording = true;
            console.log(`[${this.id}] Recording started at ${this.resolution}`);
            return true;
          }
          return false;
        case 'stopRecording':
          if (this.isRecording) {
            this.isRecording = false;
            console.log(`[${this.id}] Recording stopped`);
            return true;
          }
          return false;
        case 'setResolution':
          if (['720p', '1080p', '4K'].includes(params?.resolution)) {
            this.resolution = params.resolution;
            console.log(`[${this.id}] Resolution set to ${this.resolution}`);
            return true;
          }
          return false;
        case 'takeSnapshot':
          console.log(`[${this.id}] Snapshot taken at ${this.resolution}`);
          return true;
        default:
          console.log(`[${this.id}] Unknown action: ${action}`);
          return false;
      }
    } catch (error) {
      if (error instanceof Error) {
        this.status.errorState = error.message;
      } else {
        this.status.errorState = String(error);
      }
      return false;
    }
  }
}

class SmartThermostat implements SmartDevice {
  private id: string;
  private temperature: number = 72;
  private targetTemp: number = 72;
  private mode: 'heating' | 'cooling' | 'auto' | 'off' = 'auto';
  private status: DeviceStatus;

  constructor(id: string) {
    if (!id.trim()) {
      throw new Error("Device ID cannot be empty");
    }
    this.id = id;
    this.status = {
      isOnline: true,
      lastActivity: new Date()
    };
  }

  getId(): string {
    return this.id;
  }

  getType(): string {
    return 'Smart Thermostat';
  }

  getCapabilities(): string[] {
    return ['setTemperature', 'setMode', 'getTemperature', 'schedule'];
  }

  initialize(): void {
    console.log(`[${this.id}] Smart Thermostat initialized - Climate control ready`);
    this.status.lastActivity = new Date();
  }

  getStatus(): DeviceStatus {
    return { ...this.status };
  }

  async performAction(action: string, params?: any): Promise<boolean> {
    try {
      this.status.lastActivity = new Date();
      
      switch (action) {
        case 'setTemperature':
          if (params?.temperature >= 50 && params?.temperature <= 90) {
            this.targetTemp = params.temperature;
            console.log(`[${this.id}] Target temperature set to ${this.targetTemp}°F`);
            return true;
          }
          return false;
        case 'setMode':
          if (['heating', 'cooling', 'auto', 'off'].includes(params?.mode)) {
            this.mode = params.mode;
            console.log(`[${this.id}] Mode set to ${this.mode}`);
            return true;
          }
          return false;
        case 'getTemperature':
          console.log(`[${this.id}] Current: ${this.temperature}°F, Target: ${this.targetTemp}°F`);
          return true;
        default:
          console.log(`[${this.id}] Unknown action: ${action}`);
          return false;
      }
    } catch (error) {
      if (error instanceof Error) {
        this.status.errorState = error.message;
      } else {
        this.status.errorState = String(error);
      }
      return false;
    }
  }
}

export class SmartDeviceFactory {
  private static deviceCounter = 0;
  private static logger: Logger = new ConsoleLogger();

  static createDevice(type: string, customId?: string): SmartDevice {
    if (!type || typeof type !== 'string') {
      throw new Error("Device type must be a non-empty string");
    }

    const deviceId = customId || `${type}-${++this.deviceCounter}`;
    let device: SmartDevice;

    try {
      switch (type.toLowerCase()) {
        case 'light':
          device = new SmartLight(deviceId);
          break;
        case 'camera':
          device = new SmartCamera(deviceId);
          break;
        case 'thermostat':
          device = new SmartThermostat(deviceId);
          break;
        default:
          throw new Error(`Unknown device type: ${type}. Supported types: light, camera, thermostat`);
      }

      device.initialize();
      this.logger.log(`Created device: ${device.getType()} with ID: ${deviceId}`);
      return device;

    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to create device of type '${type}': ${error.message}`);
      } else {
        this.logger.error(`Failed to create device of type '${type}': ${String(error)}`);
      }
      throw error;
    }
  }

  static getSupportedTypes(): string[] {
    return ['light', 'camera', 'thermostat'];
  }

  static getDeviceCount(): number {
    return this.deviceCounter;
  }
}