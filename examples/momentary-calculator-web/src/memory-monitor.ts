import { MemoryMonitor } from './types.js';

export const createMemoryMonitor = (): MemoryMonitor => {
  let monitoringInterval: number | null = null;
  let baselineMemory = 0;

  const updateMemoryDisplay = (): void => {
    const memoryElement = document.getElementById('memoryUsage');
    if (!memoryElement) return;

    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const currentUsage = memInfo.usedJSHeapSize;
      const usageKB = Math.round((currentUsage - baselineMemory) / 1024);
      memoryElement.textContent = `${Math.max(0, usageKB)} KB`;
    } else {
      memoryElement.textContent = 'N/A (not supported)';
    }
  };

  return {
    getUsage(): number {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        return memInfo.usedJSHeapSize - baselineMemory;
      }
      return 0;
    },

    startMonitoring(): void {
      if ('memory' in performance) {
        baselineMemory = (performance as any).memory.usedJSHeapSize;
      }
      
      updateMemoryDisplay();
      
      if (monitoringInterval === null) {
        monitoringInterval = window.setInterval(updateMemoryDisplay, 1000);
      }
    },

    stopMonitoring(): void {
      if (monitoringInterval !== null) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
      }
      
      setTimeout(() => {
        updateMemoryDisplay();
      }, 100);
    }
  };
};