
export class SimulatorException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SimulatorException';
  }
}

export class InvalidCommandException extends SimulatorException {
  constructor(command: string) {
    super(`Invalid command: ${command}`);
    this.name = 'InvalidCommandException';
  }
}

export class InvalidStateException extends SimulatorException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStateException';
  }
}