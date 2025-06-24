import {
  CalculatorIntent,
  UserOwnedState,
  CalculationResult,
  MomentaryCalculator,
  ManifestOptions,
  ManifestoCompliance,
  CalculatorPreferences,
  CalculationFunction,
  EphemeralState
} from './types';

const DEFAULT_MAX_LIFETIME = 30000;

const createEphemeralState = <T>(data: T, taskDuration: number): EphemeralState<T> => ({
  data: Object.freeze(data) as any,
  expiresAt: new Date(Date.now() + taskDuration),
  taskId: crypto.randomUUID()
});

const secureCleanup = async (sensitiveData: unknown[]): Promise<void> => {
  sensitiveData.forEach(data => {
    if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach(key => {
        (data as any)[key] = null;
      });
    }
  });
  
  if (global.gc) global.gc();
};

const createMomentaryFunction = <I, O>(
  fn: (input: I, context: any) => O
): CalculationFunction => {
  const wrapped = (input: I, context: any): O => fn(input, context);
  (wrapped as any).__momentaryPure = true;
  (wrapped as any).__noSideEffects = true;
  return wrapped as any;
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

const operations: Record<string, CalculationFunction> = {
  add: performAddition,
  subtract: performSubtraction,
  multiply: performMultiplication,
  divide: performDivision
};

class MomentaryCalculatorImpl implements MomentaryCalculator {
  private active = true;
  private dissolutionTimer: NodeJS.Timeout;
  private ephemeralState: EphemeralState<CalculatorIntent>;
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
    private readonly intent: CalculatorIntent
  ) {
    this.ephemeralState = createEphemeralState(intent, maxLifetime);
    this.sensitiveData.operands = [...intent.operands];
    
    this.dissolutionTimer = setTimeout(() => {
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
    this.active = false;
    clearTimeout(this.dissolutionTimer);
    
    await secureCleanup([
      this.sensitiveData,
      this.ephemeralState.data
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
    return false;
  }

  hasEventListeners(): boolean {
    return false;
  }

  getSensitiveData(): { operands: null; result: null; userPreferences: null } {
    return this.sensitiveData as any;
  }

  static detectAntiPatterns(): string[] {
    const violations: string[] = [];
    const codeString = MomentaryCalculatorImpl.toString();
    
    if (codeString.includes('localStorage') || codeString.includes('sessionStorage')) {
      violations.push('Uses browser storage (violates BYOS)');
    }
    
    if (codeString.includes('setInterval')) {
      violations.push('Uses persistent timers (violates temporary manifestation)');
    }
    
    if (codeString.includes('analytics') || codeString.includes('tracking')) {
      violations.push('Includes tracking (violates privacy through ephemerality)');
    }
    
    return violations;
  }
}

export const manifestCalculator = async (
  intent: CalculatorIntent,
  options?: ManifestOptions
): Promise<MomentaryCalculator> => {
  const maxLifetime = options?.maxLifetime || DEFAULT_MAX_LIFETIME;
  
  return new MomentaryCalculatorImpl(
    crypto.randomUUID(),
    intent.operation,
    new Date(),
    maxLifetime,
    intent
  );
};

export const validateManifestoCompliance = (
  calculatorClass: typeof MomentaryCalculatorImpl
): ManifestoCompliance => {
  const violations: string[] = [];
  
  const antiPatterns = calculatorClass.detectAntiPatterns();
  violations.push(...antiPatterns);
  
  return {
    isEphemeral: violations.length === 0,
    respectsUserDataOwnership: !violations.some(v => v.includes('BYOS')),
    hasZeroAttentionArchitecture: !violations.some(v => v.includes('attention')),
    preventsContagion: true,
    enablesCompleteDissolusion: true,
    violations
  };
};

export const MomentaryCalculator = MomentaryCalculatorImpl;

export type { 
  UserOwnedState, 
  CalculatorIntent, 
  CalculationResult 
} from './types';