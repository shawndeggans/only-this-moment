import { UserOwnedState, CalculatorPreferences } from './types.js';

export const createUserOwnedState = (): UserOwnedState => {
  const storage = new Map<string, unknown>();
  let handleCount = 0;

  return {
    async read<T>(path: string): Promise<T | undefined> {
      handleCount++;
      
      const value = storage.get(path) as T | undefined;
      
      setTimeout(() => {
        handleCount = Math.max(0, handleCount - 1);
      }, 10);
      
      return value;
    },

    async write<T>(path: string, value: T): Promise<void> {
      handleCount++;
      
      storage.set(path, Object.freeze(value));
      
      setTimeout(() => {
        handleCount = Math.max(0, handleCount - 1);
      }, 10);
    },

    async delete(path: string): Promise<void> {
      handleCount++;
      
      storage.delete(path);
      
      setTimeout(() => {
        handleCount = Math.max(0, handleCount - 1);
      }, 10);
    },

    activeHandles(): number {
      return handleCount;
    }
  };
};

export const initializeUserPreferences = async (
  userState: UserOwnedState,
  precisionSelect: HTMLSelectElement
): Promise<void> => {
  const updatePreferences = async (): Promise<void> => {
    const precision = precisionSelect.value ? parseInt(precisionSelect.value, 10) : undefined;
    
    const preferences: CalculatorPreferences = {
      precision,
      roundingMode: 'round'
    };
    
    await userState.write('/preferences/calculator', preferences);
  };

  precisionSelect.addEventListener('change', updatePreferences);
  
  await updatePreferences();
};