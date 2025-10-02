export interface ILogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface IRocketState {
  stage: number;
  fuel: number;
  altitude: number;
  speed: number;
  status: MissionStatus;
}

export interface ICommand {
  execute(): void;
  canExecute(): boolean;
  getDescription(): string;
}

export interface IStageStrategy {
  getFuelConsumptionRate(): number;
  getAltitudeIncrement(): number;
  getSpeedIncrement(): number;
  getStageName(): string;
  shouldSeparate(fuel: number): boolean;
}

export enum MissionStatus {
  PRE_LAUNCH = 'Pre-Launch',
  CHECKS_IN_PROGRESS = 'System Checks',
  READY_TO_LAUNCH = 'Ready for Launch',
  IN_FLIGHT = 'In Flight',
  ORBIT_ACHIEVED = 'Orbit Achieved',
  MISSION_FAILED = 'Mission Failed'
}