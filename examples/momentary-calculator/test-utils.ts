import { UserOwnedState, CalculatorPreferences } from './types';

export const getMockUserOwnedState = (): UserOwnedState => {
  const storage = new Map<string, unknown>();
  let handleCount = 0;

  return {
    async read<T>(path: string): Promise<T | undefined> {
      handleCount++;
      const value = storage.get(path) as T | undefined;
      setTimeout(() => handleCount--, 0);
      return value;
    },

    async write<T>(path: string, value: T): Promise<void> {
      handleCount++;
      storage.set(path, Object.freeze(value));
      setTimeout(() => handleCount--, 0);
    },

    async delete(path: string): Promise<void> {
      handleCount++;
      storage.delete(path);
      setTimeout(() => handleCount--, 0);
    },

    activeHandles(): number {
      return handleCount;
    }
  };
};

export const getMockCalculatorPreferences = (
  overrides?: Partial<CalculatorPreferences>
): CalculatorPreferences => {
  return {
    precision: undefined,
    roundingMode: undefined,
    ...overrides
  };
};