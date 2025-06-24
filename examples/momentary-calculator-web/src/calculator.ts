import {
  CalculatorIntent,
  UserOwnedState,
  CalculationResult,
  MomentaryWebCalculator,
  ManifestOptions,
  CalculatorPreferences,
  DOMCleanupTracker
} from './types.js';

const DEFAULT_MAX_LIFETIME = 30000;

const createMomentaryFunction = <I, O>(
  fn: (input: I, context: any) => O
) => {
  const wrapped = (input: I, context: any): O => fn(input, context);
  (wrapped as any).__momentaryPure = true;
  (wrapped as any).__noSideEffects = true;
  return wrapped;
};

const performAddition = createMomentaryFunction(
  (operands: readonly number[], _preferences: CalculatorPreferences): number => {
    return operands.reduce((sum, value) => sum + value, 0);
  }
);

const performSubtraction = createMomentaryFunction(
  (operands: readonly number[], _preferences: CalculatorPreferences): number => {
    return operands.reduce((diff, value, index) => 
      index === 0 ? value : diff - value
    );
  }
);

const performMultiplication = createMomentaryFunction(
  (operands: readonly number[], _preferences: CalculatorPreferences): number => {
    return operands.reduce((product, value) => product * value, 1);
  }
);

const performDivision = createMomentaryFunction(
  (operands: readonly number[], preferences: CalculatorPreferences): number => {
    const result = operands.reduce((quotient, value, index) => {
      if (index === 0) return value;
      if (value === 0) throw new Error('Division by zero');
      return quotient / value;
    });
    
    return preferences.precision !== undefined
      ? Math.round(result * Math.pow(10, preferences.precision)) / Math.pow(10, preferences.precision)
      : result;
  }
);

const operations = {
  add: performAddition,
  subtract: performSubtraction,
  multiply: performMultiplication,
  divide: performDivision
} as const;

const secureCleanup = async (sensitiveData: unknown[]): Promise<void> => {
  sensitiveData.forEach(data => {
    if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach(key => {
        (data as any)[key] = null;
      });
    }
  });
  
  if ('gc' in window) {
    (window as any).gc();
  }
};

class MomentaryWebCalculatorImpl implements MomentaryWebCalculator {
  private active = true;
  private dissolutionTimer: number;
  private sensitiveData: {
    operands: number[] | null;
    result: number | null;
    userPreferences: CalculatorPreferences | null;
  } = { operands: null, result: null, userPreferences: null };

  constructor(
    public readonly id: string,
    public readonly purpose: string,
    public readonly manifestedAt: Date,
    public readonly maxLifetime: number,
    private readonly intent: CalculatorIntent,
    private readonly domCleanup: DOMCleanupTracker
  ) {
    this.sensitiveData.operands = [...intent.operands];
    
    this.dissolutionTimer = window.setTimeout(() => {
      this.dissolve();
    }, maxLifetime);
  }

  async execute(userState: UserOwnedState): Promise<CalculationResult> {
    if (!this.active) {
      throw new Error('Calculator has been dissolved');
    }

    try {
      const preferences = await this.getUserPreferences(userState);
      this.sensitiveData.userPreferences = preferences;
      
      const operation = operations[this.intent.operation];
      if (!operation) {
        return {
          error: `Unknown operation: ${this.intent.operation}`,
          operation: this.intent.operation,
          completedAt: new Date()
        };
      }

      const value = operation(this.intent.operands, preferences);
      this.sensitiveData.result = value;
      
      return {
        value,
        operation: this.intent.operation,
        completedAt: new Date()
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: this.intent.operation,
        completedAt: new Date()
      };
    }
  }

  private async getUserPreferences(userState: UserOwnedState): Promise<CalculatorPreferences> {
    const preferences = await userState.read<CalculatorPreferences>('/preferences/calculator');
    return preferences || {};
  }

  async dissolve(): Promise<void> {
    if (!this.active) return;
    
    this.active = false;
    clearTimeout(this.dissolutionTimer);
    
    this.domCleanup.cleanup();
    
    await secureCleanup([
      this.sensitiveData,
      this.intent
    ]);
    
    this.sensitiveData = {
      operands: null,
      result: null,
      userPreferences: null
    };
  }

  isActive(): boolean {
    return this.active;
  }

  hasResidualData(): boolean {
    return false;
  }

  isAccessingUserState(): boolean {
    return false;
  }

  getStoredData(): undefined {
    return undefined;
  }

  getCachedData(): undefined {
    return undefined;
  }

  hasLoggedUserInfo(): boolean {
    return false;
  }

  hasAnalytics(): boolean {
    return false;
  }

  hasBackgroundProcesses(): boolean {
    return false;
  }

  hasTimers(): boolean {
    return this.active;
  }

  hasEventListeners(): boolean {
    return false;
  }

  getSensitiveData(): { operands: null; result: null; userPreferences: null } {
    return this.sensitiveData as any;
  }

  getRemainingTime(): number {
    if (!this.active) return 0;
    const elapsed = Date.now() - this.manifestedAt.getTime();
    return Math.max(0, this.maxLifetime - elapsed);
  }
}

export const manifestCalculator = async (
  intent: CalculatorIntent,
  domCleanup: DOMCleanupTracker,
  options?: ManifestOptions
): Promise<MomentaryWebCalculator> => {
  const maxLifetime = options?.maxLifetime || DEFAULT_MAX_LIFETIME;
  
  return new MomentaryWebCalculatorImpl(
    crypto.randomUUID(),
    intent.operation,
    new Date(),
    maxLifetime,
    intent,
    domCleanup
  );
};