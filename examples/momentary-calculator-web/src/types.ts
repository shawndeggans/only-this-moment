export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

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

export interface MomentaryWebCalculator {
  readonly id: string;
  readonly purpose: string;
  readonly manifestedAt: Date;
  readonly maxLifetime: number;
  
  execute(userState: UserOwnedState): Promise<CalculationResult>;
  dissolve(): Promise<void>;
  
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
  getRemainingTime(): number;
}

export interface ManifestOptions {
  readonly maxLifetime?: number;
}

export interface DOMCleanupTracker {
  addElement(element: Element): void;
  addEventListener(target: EventTarget, type: string, listener: EventListener): void;
  cleanup(): void;
}

export interface MemoryMonitor {
  getUsage(): number;
  startMonitoring(): void;
  stopMonitoring(): void;
}