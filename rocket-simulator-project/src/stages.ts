import { SimulatorException } from "./exceptions";
import { IStageStrategy } from "./types";


// ============================================================================
// STAGE STRATEGIES (Strategy Pattern)
// ============================================================================


abstract class BaseStageStrategy implements IStageStrategy {
  abstract getFuelConsumptionRate(): number;
  abstract getAltitudeIncrement(): number;
  abstract getSpeedIncrement(): number;
  abstract getStageName(): string;
  abstract shouldSeparate(fuel: number): boolean;
}

class Stage1Strategy extends BaseStageStrategy {
  getFuelConsumptionRate(): number {
    return 1.0; // 1% per second
  }

  getAltitudeIncrement(): number {
    return 10; // km per second
  }

  getSpeedIncrement(): number {
    return 1000; // km/h per second
  }

  getStageName(): string {
    return '1';
  }

  shouldSeparate(fuel: number): boolean {
    return fuel <= 30;
  }
}

class Stage2Strategy extends BaseStageStrategy {
  getFuelConsumptionRate(): number {
    return 0.5; // 0.5% per second
  }

  getAltitudeIncrement(): number {
    return 15; // km per second
  }

  getSpeedIncrement(): number {
    return 800; // km/h per second
  }

  getStageName(): string {
    return '2';
  }

  shouldSeparate(fuel: number): boolean {
    return false; // Stage 2 is final
  }
}

export class StageFactory {
  static createStage(stageNumber: number): IStageStrategy {
    switch (stageNumber) {
      case 1:
        return new Stage1Strategy();
      case 2:
        return new Stage2Strategy();
      default:
        throw new SimulatorException(`Unknown stage: ${stageNumber}`);
    }
  }
}