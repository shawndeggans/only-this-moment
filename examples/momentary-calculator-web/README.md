# Momentary Calculator - Web Demo

A live demonstration of the Momentary Manifesto principles in a web application.

## Experience Ephemeral Software

This web app demonstrates what software looks like when it follows the Momentary Manifesto:

- **Manifests** only when you need a calculation
- **Executes** the task with your preferences
- **Dissolves** completely, leaving no trace

## Key Features

### 🎭 Manifestation on Demand
- Click "Manifest Calculator" to bring the app into existence
- No persistent installation or background processes
- Only exists for the duration of your calculation task

### ⏱️ Auto-Dissolution
- 30-second maximum lifetime (configurable)
- Visual countdown timer shows remaining time
- Automatic cleanup when time expires

### 🔒 Privacy Through Ephemerality
- No localStorage or sessionStorage usage
- No cookies or persistent tracking
- Complete memory cleanup on dissolution

### 👤 User-Owned State (BYOS)
- Your preferences are stored in your own state layer
- Calculator requests temporary access only
- Immediate release of all handles after use

### 📊 Real-Time Monitoring
- Memory usage tracking
- Active handle counting
- Persistence verification (always shows "None")
- Visual status indicators

## Running the Demo

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

## What You'll See

1. **Landing Page**: Introduction to the Momentary Manifesto
2. **User Preferences**: Simulated BYOS interface for calculation settings
3. **Manifestation**: Click to bring calculator into existence
4. **Real-Time Metrics**: Monitor memory, handles, and dissolution status
5. **Calculation**: Perform operations with ephemeral interface
6. **Dissolution**: Watch the calculator disappear completely

## Technical Demonstration

### Manifestation Process
```typescript
const calculator = await manifestCalculator(intent, domCleanup);
// Calculator now exists with automatic dissolution timer
```

### Execution with User State
```typescript
const result = await calculator.execute(userState);
// Accesses user preferences temporarily, no persistent storage
```

### Guaranteed Dissolution
```typescript
await calculator.dissolve();
// Complete cleanup: DOM elements, event listeners, memory
```

## Monitoring Features

The web interface includes real-time monitoring of:

- **Calculator Status**: Active/Dissolving/Dissolved with visual indicators
- **Memory Usage**: JavaScript heap usage tracking
- **Active Handles**: Count of user state access handles
- **Data Persistence**: Verification that no data is stored

## Anti-Pattern Detection

The demo actively prevents manifesto violations:

- ❌ No localStorage/sessionStorage usage
- ❌ No persistent cookies
- ❌ No background timers (except dissolution timer)
- ❌ No user tracking or analytics
- ❌ No engagement loops or notifications

## Browser Support

Works in modern browsers that support:
- ES2022 features
- Performance.memory API (for memory monitoring)
- Web Crypto API (for UUID generation)

## Files Structure

```
src/
├── main.ts              # Application entry point
├── calculator.ts        # Momentary calculator implementation
├── user-state.ts        # BYOS state management
├── dom-cleanup.ts       # DOM cleanup tracking
├── memory-monitor.ts    # Memory usage monitoring
└── types.ts            # TypeScript definitions
```

## Experience the Future of Software

This demo shows what respectful software looks like:
- Appears when needed
- Does its job efficiently
- Disappears completely
- Respects user privacy and attention

Try it yourself and experience software that serves you without exploiting you.