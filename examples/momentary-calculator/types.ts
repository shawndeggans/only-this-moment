type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

type Ephemeral<T> = T & { readonly __ephemeral: true };

type MomentaryPure<T> = T & {
  readonly __momentaryPure: true;
  readonly __noSideEffects: true;
};

export interface CalculatorIntent {
  readonly operation: Operation;
  readonly operands: readonly number[];
}

export interface CalculationResult {
  readonly value?: number;
  readonly error?: string;
  readonly operation: Operation;
  readonly completedAt: Date;
}

export interface UserOwnedState {
  read<T>(path: string): Promise<T | undefined>;
  write<T>(path: string, value: T): Promise<void>;
  delete(path: string): Promise<void>;
  activeHandles(): number;
}

export interface CalculatorPreferences {
  readonly precision?: number;
  readonly roundingMode?: 'floor' | 'ceil' | 'round';
}

export interface MomentaryApp {
  readonly id: string;
  readonly purpose: string;
  readonly manifestedAt: Date;
  readonly maxLifetime: number;
  
  isActive(): boolean;
  hasResidualData(): boolean;
  isAccessingUserState(): boolean;
  getStoredData(): undefined;
  getCachedData(): undefined;
  hasLoggedUserInfo(): boolean;
  hasAnalytics(): boolean;
  hasBackgroundProcesses(): boolean;
  hasTimers(): boolean;
  hasEventListeners(): boolean;
  getSensitiveData(): { operands: null; result: null; userPreferences: null };
}

export interface MomentaryCalculator extends MomentaryApp {
  execute(userState: UserOwnedState): Promise<CalculationResult>;
  dissolve(): Promise<void>;
}

export interface ManifestOptions {
  readonly maxLifetime?: number;
}

export interface ManifestoCompliance {
  readonly isEphemeral: boolean;
  readonly respectsUserDataOwnership: boolean;
  readonly hasZeroAttentionArchitecture: boolean;
  readonly preventsContagion: boolean;
  readonly enablesCompleteDissolusion: boolean;
  readonly violations: readonly string[];
}

export type CalculationFunction = MomentaryPure<
  (operands: readonly number[], preferences: CalculatorPreferences) => number
>;

export interface ResourceHandle {
  readonly id: string;
  readonly acquiredAt: Date;
  readonly expiresAt: Date;
  release(): Promise<void>;
}

export interface EphemeralState<T> {
  readonly data: Ephemeral<T>;
  readonly expiresAt: Date;
  readonly taskId: string;
}