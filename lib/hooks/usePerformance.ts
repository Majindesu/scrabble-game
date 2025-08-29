import { useCallback, useMemo, useRef } from 'react';

// Debounce hook for performance
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

// Throttle hook for performance
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);

  return useCallback(
    ((...args) => {
      const now = Date.now();
      
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    }) as T,
    [callback, delay]
  );
}

// Memoized board calculation
export function useMemoizedBoard(
  board: any[][],
  dependencies: any[] = []
) {
  return useMemo(() => {
    // Deep clone board to prevent mutations
    return board.map(row => row.map(cell => ({ ...cell })));
  }, [board, ...dependencies]);
}

// Virtual scrolling for large lists
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  buffer: number = 5
) {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const totalHeight = items.length * itemHeight;
    
    return {
      visibleCount: visibleCount + buffer * 2,
      totalHeight,
      getVisibleItems: (scrollTop: number) => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
        const endIndex = Math.min(items.length, startIndex + visibleCount);
        
        return {
          items: items.slice(startIndex, endIndex),
          startIndex,
          offsetY: startIndex * itemHeight,
        };
      },
    };
  }, [items, containerHeight, itemHeight, buffer]);
}

// Optimized tile comparison
export const compareTiles = (a: any, b: any): boolean => {
  return a.letter === b.letter && a.points === b.points;
};

// Batch updates to prevent excessive re-renders
export class BatchUpdater {
  private updates: (() => void)[] = [];
  private scheduled = false;

  add(update: () => void) {
    this.updates.push(update);
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  flush() {
    const updates = [...this.updates];
    this.updates.length = 0;
    this.scheduled = false;
    
    updates.forEach(update => update());
  }
}

// Cache for expensive calculations
export class GameCache {
  private cache = new Map<string, any>();
  private maxSize = 100;

  get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  set<T>(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const gameCache = new GameCache();
