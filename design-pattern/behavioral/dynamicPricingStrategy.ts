import { ConsoleLogger, Logger } from "../utility";

interface PricingStrategy {
  calculate(baseFare: number): number;
  getStrategyName(): string;
  isApplicable(conditions: PricingConditions): boolean;
}

export interface PricingConditions {
  weather: 'sunny' | 'rainy' | 'stormy';
  demand: 'low' | 'medium' | 'high';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  distance: number;
}

export class NormalStrategy implements PricingStrategy {
  calculate(baseFare: number): number {
    this.validateBaseFare(baseFare);
    return Math.round(baseFare * 100) / 100;
  }

  getStrategyName(): string {
    return "Normal Pricing";
  }

  isApplicable(conditions: PricingConditions): boolean {
    return conditions.demand === 'low' && conditions.weather === 'sunny';
  }

  private validateBaseFare(baseFare: number): void {
    if (typeof baseFare !== 'number' || baseFare <= 0) {
      throw new Error(`Invalid base fare: ${baseFare}. Must be a positive number.`);
    }
  }
}

export class SurgeStrategy implements PricingStrategy {
  constructor(private multiplier: number = 2.0) {
    if (multiplier <= 1 || multiplier > 5) {
      throw new Error(`Invalid surge multiplier: ${multiplier}. Must be between 1 and 5.`);
    }
  }

  calculate(baseFare: number): number {
    this.validateBaseFare(baseFare);
    const surgedPrice = baseFare * this.multiplier;
    return Math.round(surgedPrice * 100) / 100;
  }

  getStrategyName(): string {
    return `Surge Pricing (${this.multiplier}x)`;
  }

  isApplicable(conditions: PricingConditions): boolean {
    return conditions.demand === 'high' || conditions.timeOfDay === 'night';
  }

  private validateBaseFare(baseFare: number): void {
    if (typeof baseFare !== 'number' || baseFare <= 0) {
      throw new Error(`Invalid base fare: ${baseFare}. Must be a positive number.`);
    }
  }
}

export class WeatherStrategy implements PricingStrategy {
  private readonly weatherMultipliers = {
    sunny: 1.0,
    rainy: 1.3,
    stormy: 1.8
  };

  calculate(baseFare: number): number {
    this.validateBaseFare(baseFare);
    // Default to rainy weather if conditions not provided
    const multiplier = this.weatherMultipliers.rainy;
    return Math.round(baseFare * multiplier * 100) / 100;
  }

  getStrategyName(): string {
    return "Weather-Based Pricing";
  }

  isApplicable(conditions: PricingConditions): boolean {
    return conditions.weather === 'rainy' || conditions.weather === 'stormy';
  }

  private validateBaseFare(baseFare: number): void {
    if (typeof baseFare !== 'number' || baseFare <= 0) {
      throw new Error(`Invalid base fare: ${baseFare}. Must be a positive number.`);
    }
  }
}

export class RideService {
  private strategy: PricingStrategy;
  private logger: Logger;

  constructor(strategy: PricingStrategy, logger: Logger = new ConsoleLogger()) {
    if (!strategy) {
      throw new Error("Pricing strategy is required");
    }
    this.strategy = strategy;
    this.logger = logger;
  }

  setStrategy(strategy: PricingStrategy): void {
    if (!strategy) {
      throw new Error("Strategy cannot be null or undefined");
    }
    
    const oldStrategy = this.strategy.getStrategyName();
    this.strategy = strategy;
    this.logger.log(`Strategy changed from ${oldStrategy} to ${strategy.getStrategyName()}`);
  }

  calculateFare(baseFare: number, conditions?: PricingConditions): number {
    try {
      const fare = this.strategy.calculate(baseFare);
      this.logger.log(`Fare calculated: $${fare} using ${this.strategy.getStrategyName()}`);
      return fare;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error calculating fare: ${error.message}`);
      } else {
        this.logger.error(`Error calculating fare: ${String(error)}`);
      }
      throw error;
    }
  }

  getActiveStrategy(): string {
    return this.strategy.getStrategyName();
  }
}