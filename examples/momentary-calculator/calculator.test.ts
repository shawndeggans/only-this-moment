import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  manifestCalculator,
  CalculatorIntent,
  UserOwnedState,
  CalculationResult,
  MomentaryCalculator,
  validateManifestoCompliance
} from './calculator';
import { getMockUserOwnedState } from './test-utils';

describe('Momentary Calculator', () => {
  let mockUserState: UserOwnedState;

  beforeEach(() => {
    mockUserState = getMockUserOwnedState();
  });

  describe('manifestation lifecycle', () => {
    it('should manifest when user has calculation intent', async () => {
      const intent: CalculatorIntent = {
        operation: 'add',
        operands: [5, 3]
      };

      const calculator = await manifestCalculator(intent);

      expect(calculator.id).toBeDefined();
      expect(calculator.purpose).toBe('add');
      expect(calculator.manifestedAt).toBeInstanceOf(Date);
      expect(calculator.maxLifetime).toBe(30000); // 30 seconds max
    });

    it('should execute calculation and dissolve completely', async () => {
      const intent: CalculatorIntent = {
        operation: 'multiply',
        operands: [7, 6]
      };

      const calculator = await manifestCalculator(intent);
      const result = await calculator.execute(mockUserState);
      
      expect(result.value).toBe(42);
      expect(result.operation).toBe('multiply');
      expect(result.completedAt).toBeInstanceOf(Date);

      await calculator.dissolve();

      expect(calculator.isActive()).toBe(false);
      expect(calculator.hasResidualData()).toBe(false);
      expect(calculator.isAccessingUserState()).toBe(false);
    });

    it('should auto-dissolve after maxLifetime expires', async (done) => {
      const intent: CalculatorIntent = {
        operation: 'add',
        operands: [1, 1]
      };

      const calculator = await manifestCalculator(intent, { maxLifetime: 100 }); // 100ms for testing
      
      expect(calculator.isActive()).toBe(true);

      setTimeout(() => {
        expect(calculator.isActive()).toBe(false);
        expect(calculator.hasResidualData()).toBe(false);
        done();
      }, 150);
    });
  });

  describe('user-owned state interaction', () => {
    it('should read user calculation preferences without storing them', async () => {
      const intent: CalculatorIntent = {
        operation: 'divide',
        operands: [10, 3]
      };

      mockUserState.write('/preferences/calculator', { precision: 2 });

      const calculator = await manifestCalculator(intent);
      const result = await calculator.execute(mockUserState);

      expect(result.value).toBe(3.33);
      expect(calculator.getStoredData()).toBeUndefined();
      expect(calculator.getCachedData()).toBeUndefined();
    });

    it('should handle missing user preferences with defaults', async () => {
      const intent: CalculatorIntent = {
        operation: 'divide',
        operands: [10, 3]
      };

      const calculator = await manifestCalculator(intent);
      const result = await calculator.execute(mockUserState);

      expect(result.value).toBe(3.3333333333333335); // Full precision by default
    });

    it('should release state access immediately after use', async () => {
      const intent: CalculatorIntent = {
        operation: 'add',
        operands: [1, 2]
      };

      const calculator = await manifestCalculator(intent);
      await calculator.execute(mockUserState);

      expect(calculator.isAccessingUserState()).toBe(false);
      expect(mockUserState.activeHandles()).toBe(0);
    });
  });

  describe('privacy and ephemerality', () => {
    it('should never persist user data', async () => {
      const intent: CalculatorIntent = {
        operation: 'subtract',
        operands: [100, 25]
      };

      const calculator = await manifestCalculator(intent);
      await calculator.execute(mockUserState);
      
      expect(calculator.getStoredData()).toBeUndefined();
      expect(calculator.hasLoggedUserInfo()).toBe(false);
      expect(calculator.hasAnalytics()).toBe(false);
    });

    it('should not create any background processes', async () => {
      const intent: CalculatorIntent = {
        operation: 'add',
        operands: [1, 1]
      };

      const calculator = await manifestCalculator(intent);
      
      expect(calculator.hasBackgroundProcesses()).toBe(false);
      expect(calculator.hasTimers()).toBe(false);
      expect(calculator.hasEventListeners()).toBe(false);
    });
  });

  describe('memory cleanup validation', () => {
    it('should prove complete memory cleanup after dissolution', async () => {
      const intent: CalculatorIntent = {
        operation: 'multiply',
        operands: [99, 99]
      };

      const memoryBefore = process.memoryUsage();
      
      const calculator = await manifestCalculator(intent);
      await calculator.execute(mockUserState);
      await calculator.dissolve();

      if (global.gc) global.gc();
      
      const memoryAfter = process.memoryUsage();
      const memoryDiff = memoryAfter.heapUsed - memoryBefore.heapUsed;
      
      expect(memoryDiff).toBeLessThan(1024 * 1024); // Less than 1MB difference
    });

    it('should sanitize all sensitive data on dissolution', async () => {
      const intent: CalculatorIntent = {
        operation: 'add',
        operands: [123.45, 678.90]
      };

      const calculator = await manifestCalculator(intent);
      const result = await calculator.execute(mockUserState);
      
      expect(result.value).toBe(802.35);

      await calculator.dissolve();

      expect(calculator.getSensitiveData()).toEqual({
        operands: null,
        result: null,
        userPreferences: null
      });
    });
  });

  describe('error handling', () => {
    it('should handle division by zero gracefully and dissolve', async () => {
      const intent: CalculatorIntent = {
        operation: 'divide',
        operands: [10, 0]
      };

      const calculator = await manifestCalculator(intent);
      const result = await calculator.execute(mockUserState);
      
      expect(result.error).toBe('Division by zero');
      expect(result.value).toBeUndefined();
      
      await calculator.dissolve();
      expect(calculator.hasResidualData()).toBe(false);
    });

    it('should handle invalid operations and auto-dissolve', async () => {
      const intent: CalculatorIntent = {
        operation: 'invalid' as any,
        operands: [1, 2]
      };

      const calculator = await manifestCalculator(intent);
      const result = await calculator.execute(mockUserState);
      
      expect(result.error).toBe('Unknown operation: invalid');
      
      await calculator.dissolve();
      expect(calculator.isActive()).toBe(false);
    });
  });

  describe('philosophical compliance', () => {
    it('should validate full manifesto compliance', () => {
      const compliance = validateManifestoCompliance(MomentaryCalculator);
      
      expect(compliance.isEphemeral).toBe(true);
      expect(compliance.respectsUserDataOwnership).toBe(true);
      expect(compliance.hasZeroAttentionArchitecture).toBe(true);
      expect(compliance.preventsContagion).toBe(true);
      expect(compliance.enablesCompleteDissolusion).toBe(true);
      expect(compliance.violations).toHaveLength(0);
    });

    it('should detect anti-patterns in code', () => {
      const antiPatterns = MomentaryCalculator.detectAntiPatterns();
      
      expect(antiPatterns).toHaveLength(0);
    });
  });

  describe('functional purity', () => {
    it('should perform calculations as pure functions', async () => {
      const intent: CalculatorIntent = {
        operation: 'add',
        operands: [10, 20]
      };

      const calculator = await manifestCalculator(intent);
      const result1 = await calculator.execute(mockUserState);
      const result2 = await calculator.execute(mockUserState);
      
      expect(result1.value).toBe(30);
      expect(result2.value).toBe(30);
      expect(result1).toEqual(result2);
    });

    it('should not modify input data', async () => {
      const intent: CalculatorIntent = {
        operation: 'multiply',
        operands: [5, 5]
      };
      const originalOperands = [...intent.operands];

      const calculator = await manifestCalculator(intent);
      await calculator.execute(mockUserState);
      
      expect(intent.operands).toEqual(originalOperands);
    });
  });
});

describe('Momentary Calculator Edge Cases', () => {
  it('should handle very large numbers', async () => {
    const intent: CalculatorIntent = {
      operation: 'multiply',
      operands: [Number.MAX_SAFE_INTEGER / 2, 2]
    };

    const calculator = await manifestCalculator(intent);
    const result = await calculator.execute(getMockUserOwnedState());
    
    expect(result.value).toBe(Number.MAX_SAFE_INTEGER - 1);
    
    await calculator.dissolve();
  });

  it('should handle multiple operations sequentially', async () => {
    const intents: CalculatorIntent[] = [
      { operation: 'add', operands: [1, 2] },
      { operation: 'multiply', operands: [3, 4] },
      { operation: 'subtract', operands: [10, 5] }
    ];

    for (const intent of intents) {
      const calculator = await manifestCalculator(intent);
      const result = await calculator.execute(getMockUserOwnedState());
      
      expect(result.value).toBeDefined();
      expect(result.error).toBeUndefined();
      
      await calculator.dissolve();
      expect(calculator.isActive()).toBe(false);
    }
  });
});