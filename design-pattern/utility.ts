export interface Logger {
  log(message: string): void;
  error(message: string): void;
}

export class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`);
  }

  error(message: string): void {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
  }
}

function separator(title: string): void {
    console.log('\n' + '='.repeat(60));
    console.log(`  ${title}`);
    console.log('='.repeat(60) + '\n');
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {separator, delay}