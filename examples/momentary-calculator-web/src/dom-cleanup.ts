import { DOMCleanupTracker } from './types.js';

export const createDOMCleanupTracker = (): DOMCleanupTracker => {
  const elementsToClean = new Set<Element>();
  const listenersToRemove: Array<{
    target: EventTarget;
    type: string;
    listener: EventListener;
  }> = [];

  return {
    addElement(element: Element): void {
      elementsToClean.add(element);
    },

    addEventListener(target: EventTarget, type: string, listener: EventListener): void {
      target.addEventListener(type, listener);
      listenersToRemove.push({ target, type, listener });
    },

    cleanup(): void {
      for (const element of elementsToClean) {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }
      elementsToClean.clear();

      for (const { target, type, listener } of listenersToRemove) {
        target.removeEventListener(type, listener);
      }
      listenersToRemove.length = 0;
    }
  };
};