import { InvalidStateException, SimulatorException } from "./exceptions";
import { StageFactory } from "./stages";
import { ILogger, IRocketState, IStageStrategy, MissionStatus } from "./types";

// ============================================================================
// ROCKET STATE (State Pattern)
// ============================================================================

class RocketState implements IRocketState {
  constructor(
    public stage: number = 0,
    public fuel: number = 100,
    public altitude: number = 0,
    public speed: number = 0,
    public status: MissionStatus = MissionStatus.PRE_LAUNCH
  ) {}

  clone(): RocketState {
    return new RocketState(
      this.stage,
      this.fuel,
      this.altitude,
      this.speed,
      this.status
    );
  }
}

// ============================================================================
// ROCKET SYSTEM (Core Logic with Observer Pattern)
// ============================================================================

export interface IRocketObserver {
  onStateUpdate(state: IRocketState): void;
}

export class RocketSystem {
  private state: RocketState;
  private currentStageStrategy: IStageStrategy | null = null;
  private observers: IRocketObserver[] = [];
  private logger: ILogger;
  private readonly ORBIT_ALTITUDE = 160; // km
  private readonly MIN_FUEL_FOR_ORBIT = 5;

  constructor(logger: ILogger) {
    this.state = new RocketState();
    this.logger = logger;
  }

  addObserver(observer: IRocketObserver): void {
    this.observers.push(observer);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer.onStateUpdate(this.state));
  }

  getState(): IRocketState {
    return { ...this.state };
  }

  performPreLaunchChecks(): void {
    try {
      this.logger.info('Initiating pre-launch system checks...');
      this.state.status = MissionStatus.CHECKS_IN_PROGRESS;
      
      // Simulate system checks with transient error handling
      const systemChecks = [
        'Flight computer',
        'Navigation system',
        'Fuel tanks',
        'Engine systems',
        'Communication array'
      ];

      systemChecks.forEach(system => {
        // Simulate potential transient errors
        if (Math.random() < 0.1) { // 10% chance of transient error
          this.logger.warn(`${system}: Transient error detected. Retrying...`);
          // Retry logic
          this.logger.info(`${system}: Retry successful.`);
        }
        this.logger.info(`${system}: OK`);
      });

      this.state.status = MissionStatus.READY_TO_LAUNCH;
      this.logger.info("All systems are 'Go' for launch.");
      this.notifyObservers();
    } catch (error) {
      this.handleError(error, 'Pre-launch checks failed');
      throw error;
    }
  }

  launch(): void {
    try {
      if (this.state.status !== MissionStatus.READY_TO_LAUNCH) {
        throw new InvalidStateException(
          'Cannot launch: Pre-launch checks not completed'
        );
      }

      this.logger.info('🚀 Launching rocket!');
      this.state.stage = 1;
      this.state.status = MissionStatus.IN_FLIGHT;
      this.currentStageStrategy = StageFactory.createStage(1);
      this.notifyObservers();
    } catch (error) {
      this.handleError(error, 'Launch failed');
      throw error;
    }
  }

  advanceTime(seconds: number): void {
    try {
      if (this.state.status !== MissionStatus.IN_FLIGHT) {
        throw new InvalidStateException('Rocket is not in flight');
      }

      for (let i = 0; i < seconds; i++) {
        if (!this.updateFlightParameters()) {
          break;
        }
      }
    } catch (error) {
      this.handleError(error, 'Flight simulation error');
      throw error;
    }
  }

  private updateFlightParameters(): boolean {
    if (!this.currentStageStrategy) {
      this.logger.error('No stage strategy available');
      return false;
    }

    // Update fuel
    this.state.fuel -= this.currentStageStrategy.getFuelConsumptionRate();
    
    // Check for fuel exhaustion
    if (this.state.fuel <= 0) {
      this.state.fuel = 0;
      this.missionFailed('Insufficient fuel');
      return false;
    }

    // Update altitude and speed
    this.state.altitude += this.currentStageStrategy.getAltitudeIncrement();
    this.state.speed += this.currentStageStrategy.getSpeedIncrement();

    // Check for orbit achievement
    if (this.state.altitude >= this.ORBIT_ALTITUDE && 
        this.state.fuel >= this.MIN_FUEL_FOR_ORBIT) {
      this.achieveOrbit();
      return false;
    }

    // Check for stage separation
    if (this.currentStageStrategy.shouldSeparate(this.state.fuel)) {
      this.separateStage();
    }

    this.notifyObservers();
    return true;
  }

  private separateStage(): void {
    this.logger.info(
      `Stage ${this.currentStageStrategy!.getStageName()} complete. Separating stage.`
    );
    this.state.stage++;
    this.currentStageStrategy = StageFactory.createStage(this.state.stage);
    this.logger.info(`Entering Stage ${this.currentStageStrategy.getStageName()}.`);
  }

  private achieveOrbit(): void {
    this.state.status = MissionStatus.ORBIT_ACHIEVED;
    this.logger.info('🎉 Orbit achieved! Mission Successful.');
    this.notifyObservers();
  }

  private missionFailed(reason: string): void {
    this.state.status = MissionStatus.MISSION_FAILED;
    this.logger.error(`❌ Mission Failed due to ${reason}.`);
    this.notifyObservers();
  }

  private handleError(error: unknown, context: string): void {
    if (error instanceof SimulatorException) {
      this.logger.error(`${context}: ${error.message}`);
    } else if (error instanceof Error) {
      this.logger.error(`${context}: Unexpected error - ${error.message}`);
    } else {
      this.logger.error(`${context}: Unknown error occurred`);
    }
  }
}