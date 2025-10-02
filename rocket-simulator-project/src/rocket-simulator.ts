import * as readline from 'readline';
import {ILogger, IRocketState, ICommand, IStageStrategy, MissionStatus} from './types'
import { ConsoleLogger } from './logger';
import { InvalidCommandException, InvalidStateException, SimulatorException } from './exceptions';
import { StageFactory } from './stages';
import { IRocketObserver, RocketSystem } from './rocketSystem';
import { CommandInvoker, FastForwardCommand, LaunchCommand, StartChecksCommand } from './commands';



// ============================================================================
// DISPLAY (Observer Implementation)
// ============================================================================

class ConsoleDisplay implements IRocketObserver {
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  onStateUpdate(state: IRocketState): void {
    if (state.status === MissionStatus.IN_FLIGHT) {
      const output = `Stage: ${state.stage}, Fuel: ${state.fuel.toFixed(1)}%, ` +
                    `Altitude: ${state.altitude.toFixed(1)} km, ` +
                    `Speed: ${state.speed.toFixed(1)} km/h`;
      this.logger.info(output);
    }
  }
}



class RocketLaunchSimulator {
  private rocketSystem: RocketSystem;
  private commandInvoker: CommandInvoker;
  private logger: ILogger;
  private display: ConsoleDisplay;

  constructor() {
    this.logger = ConsoleLogger.getInstance();
    this.rocketSystem = new RocketSystem(this.logger);
    this.commandInvoker = new CommandInvoker(this.logger);
    this.display = new ConsoleDisplay(this.logger);
    
    this.rocketSystem.addObserver(this.display);
  }

  processInput(input: string): void {
    try {
      const trimmedInput = input.trim().toLowerCase();
      
      if (trimmedInput === 'start_checks') {
        const command = new StartChecksCommand(this.rocketSystem, this.logger);
        this.commandInvoker.executeCommand(command);
      } else if (trimmedInput === 'launch') {
        const command = new LaunchCommand(this.rocketSystem, this.logger);
        this.commandInvoker.executeCommand(command);
      } else if (trimmedInput.startsWith('fast_forward')) {
        const parts = trimmedInput.split(' ');
        if (parts.length !== 2) {
          throw new InvalidCommandException(input);
        }
        
        const seconds = parseInt(parts[1], 10);
        if (isNaN(seconds) || seconds <= 0) {
          throw new SimulatorException('Fast forward value must be a positive number');
        }
        
        const command = new FastForwardCommand(this.rocketSystem, this.logger, seconds);
        this.commandInvoker.executeCommand(command);
      } else if (trimmedInput === 'status') {
        this.displayStatus();
      } else if (trimmedInput === 'help') {
        this.displayHelp();
      } else {
        throw new InvalidCommandException(input);
      }
    } catch (error) {
      if (error instanceof SimulatorException) {
        this.logger.error(error.message);
      } else {
        this.logger.error('An unexpected error occurred');
      }
    }
  }

  private displayStatus(): void {
    const state = this.rocketSystem.getState();
    console.log('\n=== MISSION STATUS ===');
    console.log(`Status: ${state.status}`);
    console.log(`Stage: ${state.stage}`);
    console.log(`Fuel: ${state.fuel.toFixed(1)}%`);
    console.log(`Altitude: ${state.altitude.toFixed(1)} km`);
    console.log(`Speed: ${state.speed.toFixed(1)} km/h`);
    console.log('=====================\n');
  }

  private displayHelp(): void {
    console.log('\n=== AVAILABLE COMMANDS ===');
    console.log('start_checks    - Initiate pre-launch system checks');
    console.log('launch          - Launch the rocket (after checks)');
    console.log('fast_forward X  - Advance simulation by X seconds');
    console.log('status          - Display current mission status');
    console.log('help            - Show this help message');
    console.log('exit            - Exit the simulator');
    console.log('=========================\n');
  }

  displayWelcome(): void {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   ROCKET LAUNCH SIMULATOR v1.0         ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log('Type "help" for available commands\n');
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function demo(): void {
  const simulator = new RocketLaunchSimulator();
  simulator.displayWelcome();

  // Example usage - in real implementation, this would read from stdin
  const commands = [
    'help',
    'start_checks',
    'launch',
    'fast_forward 10',
    'status',
    'fast_forward 50',
    'status'
  ];

  commands.forEach((cmd, index) => {
    console.log(`\n> ${cmd}`);
    simulator.processInput(cmd);
    
    if (index < commands.length - 1) {
      console.log('\n' + '-'.repeat(60));
    }
  });
}

function runInteractive(): void {
  const simulator = new RocketLaunchSimulator();
  simulator.displayWelcome();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  rl.prompt();

  rl.on('line', (line) => {
    const input = line.trim();
    
    if (input.toLowerCase() === 'exit') {
      console.log('Shutting down simulator...');
      rl.close();
      return;
    }

    simulator.processInput(input);
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('Simulator terminated.');
    process.exit(0);
  });
}

runInteractive();

// Run the demo
// demo();