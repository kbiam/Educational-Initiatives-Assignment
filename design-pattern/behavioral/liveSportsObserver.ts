import { ConsoleLogger, Logger } from "../utility";

interface Observer {
  update(event: EventData): void;
  getId(): string;
}

interface EventData {
  type: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export class User implements Observer {
  constructor(
    private readonly id: string,
    private name: string,
    private preferences: NotificationPreferences = new NotificationPreferences()
  ) {
    if (!id.trim()) {
      throw new Error("User ID cannot be empty");
    }
    if (!name.trim()) {
      throw new Error("User name cannot be empty");
    }
  }

  update(event: EventData): void {
    try {
      if (!this.preferences.shouldReceive(event)) {
        return;
      }

      const timestamp = event.timestamp.toLocaleTimeString();
      const priorityIndicator = this.getPriorityIndicator(event.priority);
      console.log(`[${timestamp}] ${priorityIndicator}[${this.name}] ${event.message}`);
      
      if (event.metadata) {
        console.log(`    Metadata: ${JSON.stringify(event.metadata)}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error updating user ${this.name}: ${error.message}`);
      } else {
        console.error(`Error updating user ${this.name}: ${String(error)}`);
      }
    }
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = new NotificationPreferences(
      preferences.enabledEventTypes !== undefined ? preferences.enabledEventTypes : this.preferences.enabledEventTypes,
      preferences.minimumPriority !== undefined ? preferences.minimumPriority : this.preferences.minimumPriority,
      preferences.maxNotificationsPerHour !== undefined ? preferences.maxNotificationsPerHour : this.preferences.maxNotificationsPerHour
    );
  }

  private getPriorityIndicator(priority: 'low' | 'medium' | 'high'): string {
    const indicators: { [key in 'low' | 'medium' | 'high']: string } = { low: '🔵', medium: '🟡', high: '🔴' };
    return indicators[priority];
  }
}

class NotificationPreferences {
  constructor(
    public enabledEventTypes: string[] = [],
    public minimumPriority: 'low' | 'medium' | 'high' = 'low',
    public maxNotificationsPerHour: number = 50
  ) {}

  shouldReceive(event: EventData): boolean {
    const priorityLevels = { low: 0, medium: 1, high: 2 };
    const eventPriority = priorityLevels[event.priority];
    const minPriority = priorityLevels[this.minimumPriority];

    return eventPriority >= minPriority && 
           (this.enabledEventTypes.length === 0 || this.enabledEventTypes.includes(event.type));
  }
}

export class SportsEventSubject {
  private observers: Map<string, Observer> = new Map();
  private eventHistory: EventData[] = [];
  private logger: Logger;

  constructor(private eventName: string, logger: Logger = new ConsoleLogger()) {
    if (!eventName.trim()) {
      throw new Error("Event name cannot be empty");
    }
    this.logger = logger;
  }

  subscribe(observer: Observer): void {
    if (!observer) {
      throw new Error("Observer cannot be null or undefined");
    }

    if (this.observers.has(observer.getId())) {
      this.logger.log(`Observer ${observer.getId()} already subscribed`);
      return;
    }

    this.observers.set(observer.getId(), observer);
    this.logger.log(`Observer ${observer.getId()} subscribed to ${this.eventName}`);
  }

  unsubscribe(observer: Observer): void {
    if (!observer) {
      throw new Error("Observer cannot be null or undefined");
    }

    const removed = this.observers.delete(observer.getId());
    if (removed) {
      this.logger.log(`Observer ${observer.getId()} unsubscribed from ${this.eventName}`);
    }
  }

  private notifyObservers(eventData: EventData): void {
    const observerCount = this.observers.size;
    if (observerCount === 0) {
      this.logger.log("No observers to notify");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    this.observers.forEach(observer => {
      try {
        observer.update(eventData);
        successCount++;
      } catch (error) {
        errorCount++;
        if (error instanceof Error) {
          this.logger.error(`Failed to notify observer ${observer.getId()}: ${error.message}`);
        } else {
          this.logger.error(`Failed to notify observer ${observer.getId()}: ${String(error)}`);
        }
      }
    });

    this.logger.log(`Notification complete: ${successCount} succeeded, ${errorCount} failed`);
  }

  scoreUpdate(team: string, score: number, gameTime?: string): void {
    if (!team.trim()) {
      throw new Error("Team name cannot be empty");
    }
    if (typeof score !== 'number' || score < 0) {
      throw new Error("Score must be a non-negative number");
    }

    const eventData: EventData = {
      type: 'score_update',
      message: `Team ${team} scored! Current Score: ${score}${gameTime ? ` (${gameTime})` : ''}`,
      timestamp: new Date(),
      priority: 'medium',
      metadata: { team, score, gameTime }
    };

    this.eventHistory.push(eventData);
    this.notifyObservers(eventData);
  }

  gameEnd(winner: string, finalScore: string): void {
    const eventData: EventData = {
      type: 'game_end',
      message: `Game Over! Winner: ${winner}. Final Score: ${finalScore}`,
      timestamp: new Date(),
      priority: 'high',
      metadata: { winner, finalScore }
    };

    this.eventHistory.push(eventData);
    this.notifyObservers(eventData);
  }

  getObserverCount(): number {
    return this.observers.size;
  }

  getEventHistory(): EventData[] {
    return [...this.eventHistory];
  }
}
