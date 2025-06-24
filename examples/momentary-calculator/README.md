# Momentary Calculator Example

This example demonstrates a calculator that embodies the Momentary Manifesto principles:

## Key Features

### 1. Temporary Manifestation
- Calculator exists only during calculation task
- Auto-dissolves after 30 seconds or when explicitly dissolved
- No persistent installation or background processes

### 2. User-Owned State (BYOS)
- Reads user calculation preferences (precision, rounding) if available
- Never stores user data or calculation history
- Accesses state temporarily and releases immediately

### 3. Zero Attention Architecture
- No notifications or alerts
- No engagement features
- Performs calculation and disappears

### 4. Privacy Through Ephemerality
- Complete memory sanitization on dissolution
- No analytics or tracking
- No data persistence beyond task completion

## Architecture

```
manifest → execute → dissolve
```

### Manifestation
```typescript
const calculator = await manifestCalculator({
  operation: 'add',
  operands: [5, 3]
});
```

### Execution
```typescript
const result = await calculator.execute(userState);
// Returns: { value: 8, operation: 'add', completedAt: Date }
```

### Dissolution
```typescript
await calculator.dissolve();
// Complete cleanup, no residual data
```

## Testing

The test suite validates:
- Complete dissolution and memory cleanup
- No data persistence
- Philosophical compliance with manifesto
- Anti-pattern detection
- Pure functional calculations

## Running the Example

```bash
# Install dependencies
npm install

# Run tests
npm test calculator.test.ts

# Check coverage
npm test -- --coverage calculator.test.ts
```

## Manifesto Compliance

The calculator implements several patterns to ensure compliance:

1. **Ephemeral State**: All data is frozen and has expiration times
2. **Memory Sanitization**: Explicit cleanup of sensitive data
3. **Pure Functions**: All calculations are side-effect free
4. **Resource Tracking**: Automatic release of all handles
5. **Anti-Pattern Detection**: Static analysis to catch violations

## Code Patterns Demonstrated

### Self-Cleaning Functions
```typescript
const performAddition = createMomentaryFunction(
  (operands: readonly number[], _preferences: CalculatorPreferences): number => {
    return operands.reduce((sum, value) => sum + value, 0);
  }
);
```

### Secure Cleanup
```typescript
const secureCleanup = async (sensitiveData: unknown[]): Promise<void> => {
  sensitiveData.forEach(data => {
    if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach(key => {
        (data as any)[key] = null;
      });
    }
  });
};
```

### Philosophical Validation
```typescript
const compliance = validateManifestoCompliance(MomentaryCalculator);
// All principles should return true with zero violations
```

## Why This Matters

This calculator demonstrates that useful applications can:
- Respect user privacy completely
- Accomplish tasks without persistence
- Exist only when needed
- Leave no trace after completion

It's a simple example of a fundamental shift in how we think about software - from permanent installations to temporary tools that manifest, serve, and dissolve.