// ============================================================================
// COMMANDS (Command Pattern)
// ============================================================================

import { InvalidStateException, SimulatorException } from "./exceptions";
import { RocketSystem } from "./rocketSystem";
import { ICommand, ILogger, MissionStatus } from "./types";

abstract class BaseCommand implements ICommand {
  constructor(protected rocketSystem: RocketSystem, protected logger: ILogger) {}
  
  abstract execute(): void;
  abstract canExecute(): boolean;
  abstract getDescription(): string;
}

class StartChecksCommand extends BaseCommand {
  execute(): void {
    this.rocketSystem.performPreLaunchChecks();
  }

  canExecute(): boolean {
    const state = this.rocketSystem.getState();
    return state.status === MissionStatus.PRE_LAUNCH;
  }

  getDescription(): string {
    return 'Start pre-launch system checks';
  }
}

class LaunchCommand extends BaseCommand {
  execute(): void {
    this.rocketSystem.launch();
  }

  canExecute(): boolean {
    const state = this.rocketSystem.getState();
    return state.status === MissionStatus.READY_TO_LAUNCH;
  }

  getDescription(): string {
    return 'Launch the rocket';
  }
}

class FastForwardCommand extends BaseCommand {
  constructor(
    rocketSystem: RocketSystem,
    logger: ILogger,
    private seconds: number
  ) {
    super(rocketSystem, logger);
  }

  execute(): void {
    this.logger.info(`Fast forwarding ${this.seconds} seconds...`);
    this.rocketSystem.advanceTime(this.seconds);
  }

  canExecute(): boolean {
    const state = this.rocketSystem.getState();
    return state.status === MissionStatus.IN_FLIGHT && this.seconds > 0;
  }

  getDescription(): string {
    return `Fast forward ${this.seconds} seconds`;
  }
}

// ============================================================================
// COMMAND INVOKER
// ============================================================================

export class CommandInvoker {
  private commandHistory: ICommand[] = [];
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  executeCommand(command: ICommand): void {
    try {
      if (!command.canExecute()) {
        throw new InvalidStateException(
          `Cannot execute command: ${command.getDescription()}`
        );
      }

      this.logger.info(`Executing: ${command.getDescription()}`);
      command.execute();
      this.commandHistory.push(command);
    } catch (error) {
      if (error instanceof SimulatorException) {
        this.logger.error(error.message);
      } else {
        this.logger.error('Command execution failed');
      }
      throw error;
    }
  }

  getHistory(): ICommand[] {
    return [...this.commandHistory];
  }
}

export {StartChecksCommand, LaunchCommand, FastForwardCommand};