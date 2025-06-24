import { manifestCalculator } from './calculator.js';
import { createUserOwnedState, initializeUserPreferences } from './user-state.js';
import { createDOMCleanupTracker } from './dom-cleanup.js';
import { createMemoryMonitor } from './memory-monitor.js';
import { CalculatorIntent, MomentaryWebCalculator, Operation } from './types.js';

let currentCalculator: MomentaryWebCalculator | null = null;
let dissolutionTimerInterval: number | null = null;

const userState = createUserOwnedState();
const memoryMonitor = createMemoryMonitor();

const updateStatusIndicator = (status: 'active' | 'dissolving' | 'dissolved'): void => {
  const indicator = document.getElementById('statusIndicator');
  const text = document.getElementById('statusText');
  if (!indicator || !text) return;

  indicator.className = `status-indicator status-${status}`;
  text.textContent = status.charAt(0).toUpperCase() + status.slice(1);
};

const updateActiveHandles = (): void => {
  const element = document.getElementById('activeHandles');
  if (element) {
    element.textContent = userState.activeHandles().toString();
  }
};

const updateDataPersisted = (): void => {
  const element = document.getElementById('dataPersisted');
  if (element) {
    if (typeof Storage !== 'undefined') {
      const localStorageCount = localStorage.length;
      const sessionStorageCount = sessionStorage.length;
      const totalStored = localStorageCount + sessionStorageCount;
      
      element.textContent = totalStored > 0 ? `${totalStored} items` : 'None';
    } else {
      element.textContent = 'None (Storage not supported)';
    }
  }
};

const startDissolutionTimer = (calculator: MomentaryWebCalculator): void => {
  const timerElement = document.getElementById('dissolutionTimer');
  if (!timerElement) return;

  const updateTimer = (): void => {
    const remaining = calculator.getRemainingTime();
    const seconds = Math.ceil(remaining / 1000);
    
    if (seconds <= 0) {
      timerElement.textContent = 'Dissolving...';
      if (dissolutionTimerInterval !== null) {
        clearInterval(dissolutionTimerInterval);
        dissolutionTimerInterval = null;
      }
    } else {
      timerElement.textContent = `${seconds}s`;
    }
  };

  updateTimer();
  dissolutionTimerInterval = window.setInterval(updateTimer, 100);
};

const stopDissolutionTimer = (): void => {
  if (dissolutionTimerInterval !== null) {
    clearInterval(dissolutionTimerInterval);
    dissolutionTimerInterval = null;
  }
};

const showCalculator = (): void => {
  const container = document.getElementById('calculatorContainer');
  const overlay = document.getElementById('overlay');
  if (!container || !overlay) return;

  overlay.classList.add('active');
  container.classList.add('manifested');
  container.classList.remove('dissolving');
};

const hideCalculator = async (): Promise<void> => {
  const container = document.getElementById('calculatorContainer');
  const overlay = document.getElementById('overlay');
  if (!container || !overlay) return;

  updateStatusIndicator('dissolving');
  container.classList.add('dissolving');
  
  setTimeout(() => {
    container.classList.remove('manifested', 'dissolving');
    overlay.classList.remove('active');
    updateStatusIndicator('dissolved');
  }, 300);
};

const displayResult = (result: any): void => {
  const display = document.getElementById('resultDisplay');
  if (!display) return;

  display.style.display = 'block';
  
  if (result.error) {
    display.className = 'result-display error';
    display.innerHTML = `
      <strong>Error:</strong> ${result.error}<br>
      <small>Operation: ${result.operation} at ${result.completedAt.toLocaleTimeString()}</small>
    `;
  } else {
    display.className = 'result-display';
    display.innerHTML = `
      <strong>Result:</strong> ${result.value}<br>
      <small>Operation: ${result.operation} at ${result.completedAt.toLocaleTimeString()}</small>
    `;
  }
};

const clearResult = (): void => {
  const display = document.getElementById('resultDisplay');
  if (display) {
    display.style.display = 'none';
  }
};

const manifestCalculatorUI = async (): Promise<void> => {
  if (currentCalculator?.isActive()) {
    return;
  }

  const manifestBtn = document.getElementById('manifestBtn') as HTMLButtonElement;
  if (!manifestBtn) return;

  manifestBtn.disabled = true;
  manifestBtn.textContent = 'Manifesting...';

  try {
    const domCleanup = createDOMCleanupTracker();
    
    const intent: CalculatorIntent = {
      operation: 'add',
      operands: [0, 0]
    };

    currentCalculator = await manifestCalculator(intent, domCleanup);
    
    updateStatusIndicator('active');
    showCalculator();
    startDissolutionTimer(currentCalculator);
    memoryMonitor.startMonitoring();
    clearResult();

    const autoDissolve = async (): Promise<void> => {
      if (currentCalculator?.isActive()) {
        await dissolveCalculator();
      }
    };

    setTimeout(autoDissolve, currentCalculator.maxLifetime);

  } finally {
    manifestBtn.disabled = false;
    manifestBtn.textContent = '✨ Manifest Calculator';
  }
};

const dissolveCalculator = async (): Promise<void> => {
  if (!currentCalculator?.isActive()) return;

  updateStatusIndicator('dissolving');
  stopDissolutionTimer();

  await currentCalculator.dissolve();
  currentCalculator = null;

  await hideCalculator();
  memoryMonitor.stopMonitoring();
  
  setTimeout(() => {
    updateActiveHandles();
    updateDataPersisted();
  }, 500);
};

const performCalculation = async (event: Event): Promise<void> => {
  event.preventDefault();
  
  if (!currentCalculator?.isActive()) {
    alert('Calculator has been dissolved. Please manifest a new one.');
    return;
  }

  
  const operation = (document.getElementById('operation') as HTMLSelectElement).value as Operation;
  const operand1 = parseFloat((document.getElementById('operand1') as HTMLInputElement).value);
  const operand2 = parseFloat((document.getElementById('operand2') as HTMLInputElement).value);

  if (!operation || isNaN(operand1) || isNaN(operand2)) {
    displayResult({
      error: 'Please fill in all fields with valid numbers',
      operation: operation || 'unknown',
      completedAt: new Date()
    });
    return;
  }

  const newIntent: CalculatorIntent = {
    operation,
    operands: [operand1, operand2]
  };

  const domCleanup = createDOMCleanupTracker();
  const manifestedCalculator = await manifestCalculator(newIntent, domCleanup, {
    maxLifetime: currentCalculator.getRemainingTime()
  });

  await currentCalculator.dissolve();
  currentCalculator = manifestedCalculator;

  try {
    const result = await currentCalculator.execute(userState);
    displayResult(result);
  } catch (error) {
    displayResult({
      error: error instanceof Error ? error.message : 'Unknown error',
      operation,
      completedAt: new Date()
    });
  }
};

const initializeApp = async (): Promise<void> => {
  const manifestBtn = document.getElementById('manifestBtn');
  const calculatorForm = document.getElementById('calculatorForm');
  const dissolveBtn = document.getElementById('dissolveBtn');
  const precisionSelect = document.getElementById('precision') as HTMLSelectElement;

  if (!manifestBtn || !calculatorForm || !dissolveBtn || !precisionSelect) {
    console.error('Required elements not found');
    return;
  }

  await initializeUserPreferences(userState, precisionSelect);

  manifestBtn.addEventListener('click', manifestCalculatorUI);
  calculatorForm.addEventListener('submit', performCalculation);
  dissolveBtn.addEventListener('click', dissolveCalculator);

  const handlersInterval = setInterval(updateActiveHandles, 1000);
  const persistenceInterval = setInterval(updateDataPersisted, 2000);

  updateStatusIndicator('dissolved');
  updateActiveHandles();
  updateDataPersisted();
  memoryMonitor.startMonitoring();

  window.addEventListener('beforeunload', async () => {
    clearInterval(handlersInterval);
    clearInterval(persistenceInterval);
    
    if (currentCalculator?.isActive()) {
      await currentCalculator.dissolve();
    }
    
    memoryMonitor.stopMonitoring();
  });
};

document.addEventListener('DOMContentLoaded', initializeApp);