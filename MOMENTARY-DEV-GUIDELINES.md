# Momentary Application Development Guidelines

This document provides momentary-specific development patterns that complement DEVELOPMENT.md. While DEVELOPMENT.md covers core practices (TDD, TypeScript, functional patterns), this guide focuses on implementing the Momentary Manifesto principles in code.

## Context Block
```yaml
role: momentary_application_developer
objective: build_ephemeral_privacy_first_applications
methodology: test_driven_minimalism
philosophy: temporary_manifestation_user_owned_state
constraints: no_persistence_no_tracking_complete_dissolution
```

## Core Philosophy Integration

### Momentary Manifesto Principles in Code

**1. Temporary Manifestation**
```typescript
// Applications exist only for task duration
interface AppLifecycle {
  manifest: (trigger: UserIntent) => Promise<EphemeralApp>;
  execute: (app: EphemeralApp, userState: UserOwnedState) => Promise<TaskResult>;
  dissolve: (app: EphemeralApp) => Promise<void>; // Complete cleanup
}
```

**2. Bring Your Own State (BYOS)**
```typescript
// Users own data, apps access temporarily
interface StateAccess {
  request: (permissions: DataPermissions) => Promise<StateHandle>;
  read: <T>(handle: StateHandle, query: Query) => Promise<T>;
  write: <T>(handle: StateHandle, data: T) => Promise<void>;
  release: (handle: StateHandle) => Promise<void>; // Immediate cleanup
}
```

**3. Zero Attention Architecture**
```typescript
// No persistence, no tracking, no engagement loops
const validateEphemeralDesign = (app: AppDesign): ValidationResult => {
  const violations = [
    app.hasNotifications && "Notifications violate Zero Attention principle",
    app.storesUserData && "Data storage violates BYOS principle", 
    app.hasEngagementFeatures && "Engagement loops violate Temporary Manifestation",
    app.hasAnalytics && "Analytics violate Privacy Through Ephemerality"
  ].filter(Boolean);
  
  return violations.length === 0 ? { valid: true } : { valid: false, violations };
};
```

## Development Constraints

### Prohibition List - Never Implement
- Data persistence beyond task completion
- User tracking or analytics
- Notifications or background processes
- Session management or "remember me" features
- Engagement loops or addiction mechanics
- Cross-app data sharing without explicit user action
- A/B testing or behavioral experimentation
- Advertising or monetization through user data

### Required Patterns

**Ephemeral State Management**
```typescript
// State exists only during task execution
interface EphemeralState<T> {
  readonly data: T;
  readonly expiresAt: Date;
  readonly taskId: string;
}

const createEphemeralState = <T>(data: T, taskDuration: number): EphemeralState<T> => ({
  data: Object.freeze(data), // Immutable
  expiresAt: new Date(Date.now() + taskDuration),
  taskId: crypto.randomUUID()
});
```

**Memory Sanitization**
```typescript
// Guarantee complete cleanup
const secureCleanup = async (sensitiveData: unknown[]): Promise<void> => {
  // Overwrite memory locations
  sensitiveData.forEach(data => {
    if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach(key => {
        (data as any)[key] = null;
      });
    }
  });
  
  // Force garbage collection if available
  if (global.gc) global.gc();
};
```

**Function Purity for Momentary Apps**
```typescript
// All business logic must be pure and stateless
type MomentaryFunction<Input, Output> = {
  (input: Input, context: UserOwnedState): Output;
  readonly isPure: true;
  readonly hasNoSideEffects: true;
};

// Factory for creating momentary functions
const createMomentaryFunction = <I, O>(
  fn: (input: I, context: UserOwnedState) => O
): MomentaryFunction<I, O> => {
  const wrapped = (input: I, context: UserOwnedState): O => fn(input, context);
  (wrapped as any).isPure = true;
  (wrapped as any).hasNoSideEffects = true;
  return wrapped as MomentaryFunction<I, O>;
};
```

## Testing for Momentary Applications

### Test-Driven Ephemeral Development

Following DEVELOPMENT.md TDD principles with momentary-specific validations:

```typescript
describe('Payment Processor (Momentary)', () => {
  describe('when processing payment', () => {
    it('should complete task and clean up completely', async () => {
      // Arrange
      const userState = getMockUserOwnedState();
      const paymentRequest = getMockPaymentRequest();
      
      // Act
      const processor = await manifestPaymentProcessor();
      const result = await processor.process(paymentRequest, userState);
      await processor.dissolve();
      
      // Assert - Task completed
      expect(result.success).toBe(true);
      
      // Assert - Complete cleanup
      expect(processor.hasResidualData()).toBe(false);
      expect(processor.isAccessingUserState()).toBe(false);
      expect(processor.isRunning()).toBe(false);
    });
    
    it('should never persist user data', async () => {
      // Arrange
      const userState = getMockUserOwnedState();
      const paymentRequest = getMockPaymentRequest();
      
      // Act
      const processor = await manifestPaymentProcessor();
      await processor.process(paymentRequest, userState);
      
      // Assert - No data persistence
      expect(processor.getStoredData()).toBeUndefined();
      expect(processor.getCachedData()).toBeUndefined();
      expect(processor.hasLoggedUserInfo()).toBe(false);
    });
  });
  
  describe('dissolution guarantees', () => {
    it('should prove complete memory cleanup', async () => {
      // Arrange
      const processor = await manifestPaymentProcessor();
      const memoryBefore = process.memoryUsage();
      
      // Act
      await processor.process(getMockPaymentRequest(), getMockUserOwnedState());
      await processor.dissolve();
      
      // Force garbage collection
      if (global.gc) global.gc();
      
      const memoryAfter = process.memoryUsage();
      
      // Assert - Memory returned to baseline (with tolerance)
      const memoryDiff = memoryAfter.heapUsed - memoryBefore.heapUsed;
      expect(memoryDiff).toBeLessThan(1024 * 1024); // Less than 1MB difference
    });
  });
});
```

### Philosophical Validation Tests

```typescript
describe('Momentary Manifesto Compliance', () => {
  it('should validate app follows all manifesto principles', () => {
    const appDesign = analyzeAppDesign(paymentProcessorCode);
    
    expect(appDesign.isEphemeral).toBe(true);
    expect(appDesign.respectsUserDataOwnership).toBe(true);
    expect(appDesign.hasZeroAttentionArchitecture).toBe(true);
    expect(appDesign.preventsContagion).toBe(true);
    expect(appDesign.enablesCompleteDissolusion).toBe(true);
  });
});
```

## Code Patterns for Momentary Apps

### Manifestation Pattern

```typescript
interface MomentaryApp {
  readonly id: string;
  readonly purpose: string;
  readonly manifestedAt: Date;
  readonly maxLifetime: number;
}

const manifestApp = async (
  template: AppTemplate,
  userIntent: UserIntent
): Promise<MomentaryApp> => {
  return {
    id: crypto.randomUUID(),
    purpose: userIntent.description,
    manifestedAt: new Date(),
    maxLifetime: template.maxLifetime
  };
};
```

### User-Owned State Interface

```typescript
interface UserOwnedState {
  read<T>(path: string): Promise<T | undefined>;
  write<T>(path: string, value: T): Promise<void>;
  delete(path: string): Promise<void>;
  // No app can iterate or discover what data exists
}

// Apps request specific data paths, never browse
const accessUserPreferences = async (
  state: UserOwnedState
): Promise<UserPreferences> => {
  // Request specific, known paths only
  const preferences = await state.read<UserPreferences>('/preferences/payment');
  return preferences ?? getDefaultPreferences();
};
```

### Anti-Pattern Detection

```typescript
// Static analysis helpers for detecting manifesto violations
const detectAntiPatterns = (code: string): string[] => {
  const violations = [];
  
  if (code.includes('localStorage') || code.includes('sessionStorage')) {
    violations.push('Uses browser storage (violates BYOS)');
  }
  
  if (code.includes('setInterval') || code.includes('setTimeout')) {
    violations.push('Uses persistent timers (violates temporary manifestation)');
  }
  
  if (code.includes('analytics') || code.includes('tracking')) {
    violations.push('Includes tracking (violates privacy through ephemerality)');
  }
  
  return violations;
};
```

## TypeScript for Momentary Applications

### Ephemeral-Specific Types

```typescript
// Mark data that must not persist
type Ephemeral<T> = T & { readonly __ephemeral: true };

// Mark functions that auto-clean
type SelfCleaning<T extends (...args: any[]) => any> = T & {
  readonly __autoCleans: true;
};

// Mark pure momentary computations
type MomentaryPure<T> = T & {
  readonly __momentaryPure: true;
  readonly __noSideEffects: true;
};
```

### Resource Lifetime Tracking

```typescript
interface ResourceHandle {
  readonly id: string;
  readonly acquiredAt: Date;
  readonly expiresAt: Date;
  release(): Promise<void>;
}

const trackResourceLifetime = <T extends ResourceHandle>(
  resource: T
): T => {
  // Auto-release on expiration
  setTimeout(() => {
    resource.release();
  }, resource.expiresAt.getTime() - Date.now());
  
  return resource;
};
```

## Integration with Existing Guidelines

### Alignment with DEVELOPMENT.md

- **TDD First**: All momentary apps follow strict TDD from DEVELOPMENT.md
- **No Comments**: Code self-documents through clear momentary-specific naming
- **Functional Purity**: Enhanced for momentary applications with cleanup guarantees
- **Immutable Data**: Critical for preventing data leakage between manifestations
- **TypeScript Strict**: Ensures no data can accidentally persist

### Enhanced for Momentary Context

```typescript
// Building on DEVELOPMENT.md patterns with momentary constraints
const processPayment = createMomentaryFunction(
  (payment: PaymentRequest, userState: UserOwnedState): PaymentResult => {
    // Pure function - no side effects
    // Self-documenting names
    // Will auto-clean after execution
    const validatedPayment = validatePaymentRequest(payment);
    const userPaymentMethods = extractPaymentMethods(userState);
    
    return executePaymentSecurely(validatedPayment, userPaymentMethods);
  }
);
```

## Execution Protocol for Momentary Apps

### Manifestation-Execution-Dissolution Cycle

1. **Validate Manifestation Request**
   - Ensure user intent is clear and specific
   - Verify app template exists for this intent
   - Check user permissions for required data access

2. **Secure Manifestation**
   - Create isolated execution context
   - Grant minimal required permissions
   - Set automatic expiration timers

3. **Execute with User State**
   - Access only explicitly granted data
   - Process using pure functions
   - Generate results without persistence

4. **Guaranteed Dissolution**
   - Clean all ephemeral state
   - Release all resource handles
   - Verify complete cleanup
   - Report dissolution completion

## Success Criteria

**Technical Validation:**
- Zero data persistence after dissolution
- Complete memory cleanup verification
- No network connections maintained
- All resource handles released

**Philosophical Compliance:**
- Respects user data ownership
- Enables zero attention interaction
- Prevents behavioral modification
- Maintains temporal existence only

**Quality Assurance:**
- 100% test coverage of dissolution logic
- Anti-pattern detection in CI/CD
- Memory leak detection
- Privacy audit compliance

## Summary

Momentary applications represent a fundamental shift from persistent, engagement-driven software to respectful, ephemeral tools. These development guidelines ensure that code embodies the Momentary Manifesto principles while maintaining the technical rigor established in DEVELOPMENT.md.

The goal is not just to build better software, but to build software that respects human agency and attention while accomplishing specific tasks efficiently and then gracefully disappearing.