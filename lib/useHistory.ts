// lib/useHistory.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_HISTORY = 30;
const DEBOUNCE_MS = 400;

type HistoryState<T> = {
  present: T;
  past: T[];
  future: T[];
};

/**
 * Manages a single value with undo/redo. Every `set` that changes the value
 * pushes the previous value onto the past stack (debounced).
 *
 * - `set(value, { immediate: true })` bypasses debounce (for discrete actions)
 * - `undo()` restores the previous value
 * - `redo()` re-applies an undone value
 * - `reset(value)` clears history and sets a new starting point
 */
export function useHistory<T>(initial: T, options?: { compare?: (a: T, b: T) => boolean }) {
  const compare =
    options?.compare ?? ((a: T, b: T) => JSON.stringify(a) === JSON.stringify(b));

  const [state, setState] = useState<HistoryState<T>>({
    present: initial,
    past: [],
    future: [],
  });

  // Track a debounce timer so we don't push a snapshot on every keystroke
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The last committed value (present at the moment of last push)
  const lastCommittedRef = useRef<T>(initial);

  const clearTimer = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  const commit = useCallback(
    (next: T) => {
      setState((prev) => {
        if (compare(prev.present, next)) return prev;
        const past = [...prev.past, prev.present].slice(-MAX_HISTORY);
        lastCommittedRef.current = next;
        return {
          present: next,
          past,
          future: [],
        };
      });
    },
    [compare]
  );

  /**
   * Set a new value. By default, pushes to history after a debounce.
   * Use `immediate: true` for discrete actions (add slide, delete, theme change).
   */
  const set = useCallback(
    (updater: T | ((prev: T) => T), { immediate = false }: { immediate?: boolean } = {}) => {
      setState((prev) => {
        const next =
          typeof updater === 'function' ? (updater as (p: T) => T)(prev.present) : updater;

        if (compare(prev.present, next)) return prev;

        if (immediate) {
          clearTimer();
          const past = [...prev.past, prev.present].slice(-MAX_HISTORY);
          lastCommittedRef.current = next;
          return { present: next, past, future: [] };
        }

        // Debounced push: update present immediately, but delay pushing to past
        clearTimer();
        const snapshot = prev.present;
        debounceRef.current = setTimeout(() => {
          setState((s2) => {
            // Only push if we still have the same "present" as when we scheduled
            if (s2.present !== next) return s2;
            const past = [...s2.past, snapshot].slice(-MAX_HISTORY);
            lastCommittedRef.current = next;
            return { present: s2.present, past, future: [] };
          });
        }, DEBOUNCE_MS);

        return {
          present: next,
          past: prev.past,
          future: [],
        };
      });
    },
    [compare]
  );

  const undo = useCallback(() => {
    clearTimer();
    setState((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const past = prev.past.slice(0, -1);
      const future = [prev.present, ...prev.future].slice(0, MAX_HISTORY);
      lastCommittedRef.current = previous;
      return { present: previous, past, future };
    });
  }, []);

  const redo = useCallback(() => {
    clearTimer();
    setState((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      const future = prev.future.slice(1);
      const past = [...prev.past, prev.present].slice(-MAX_HISTORY);
      lastCommittedRef.current = next;
      return { present: next, past, future };
    });
  }, []);

  const reset = useCallback((value: T) => {
    clearTimer();
    lastCommittedRef.current = value;
    setState({ present: value, past: [], future: [] });
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return {
    value: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}