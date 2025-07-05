import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  elapsedTime: number;
  currentPhase: 'workout' | 'rest' | 'preparation';
  restTimeRemaining: number;
  setTimeRemaining: number;
  currentSet: number;
  totalSets: number;
}

export interface TimerControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  startRest: (duration: number) => void;
  skipRest: () => void;
  addRestTime: (seconds: number) => void;
  startSetTimer: (duration: number, setNumber: number, totalSets: number) => void;
  completeSet: () => void;
}

export interface TimerCallbacks {
  onRestComplete?: () => void;
  onSetComplete?: () => void;
  onWorkoutComplete?: () => void;
  onPhaseChange?: (phase: TimerState['currentPhase']) => void;
}

export function useWorkoutTimer(callbacks: TimerCallbacks = {}): [TimerState, TimerControls] {
  const [state, setState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    elapsedTime: 0,
    currentPhase: 'workout',
    restTimeRemaining: 0,
    setTimeRemaining: 0,
    currentSet: 0,
    totalSets: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const updateElapsedTime = useCallback(() => {
    if (startTimeRef.current && !state.isPaused) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000);
      setState(prev => ({ ...prev, elapsedTime: elapsed }));
    }
  }, [state.isPaused]);

  // Main timer effect
  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        updateElapsedTime();

        setState(prev => {
          const newState = { ...prev };

          // Handle rest timer
          if (prev.currentPhase === 'rest' && prev.restTimeRemaining > 0) {
            newState.restTimeRemaining = Math.max(0, prev.restTimeRemaining - 1);
            
            if (newState.restTimeRemaining === 0) {
              newState.currentPhase = 'workout';
              callbacks.onRestComplete?.();
              callbacks.onPhaseChange?.('workout');
            }
          }

          // Handle set timer
          if (prev.currentPhase === 'workout' && prev.setTimeRemaining > 0) {
            newState.setTimeRemaining = Math.max(0, prev.setTimeRemaining - 1);
            
            if (newState.setTimeRemaining === 0) {
              callbacks.onSetComplete?.();
            }
          }

          return newState;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [state.isActive, state.isPaused, updateElapsedTime, callbacks, clearTimer]);

  const controls: TimerControls = {
    start: useCallback(() => {
      const now = Date.now();
      startTimeRef.current = now;
      pausedTimeRef.current = 0;
      setState(prev => ({
        ...prev,
        isActive: true,
        isPaused: false,
        currentPhase: 'workout',
      }));
      callbacks.onPhaseChange?.('workout');
    }, [callbacks]),

    pause: useCallback(() => {
      if (state.isActive && !state.isPaused) {
        setState(prev => ({ ...prev, isPaused: true }));
      }
    }, [state.isActive, state.isPaused]),

    resume: useCallback(() => {
      if (state.isActive && state.isPaused) {
        const now = Date.now();
        const pauseDuration = now - (startTimeRef.current || now);
        pausedTimeRef.current += pauseDuration;
        setState(prev => ({ ...prev, isPaused: false }));
      }
    }, [state.isActive, state.isPaused]),

    stop: useCallback(() => {
      clearTimer();
      setState({
        isActive: false,
        isPaused: false,
        elapsedTime: 0,
        currentPhase: 'workout',
        restTimeRemaining: 0,
        setTimeRemaining: 0,
        currentSet: 0,
        totalSets: 0,
      });
      startTimeRef.current = null;
      pausedTimeRef.current = 0;
      callbacks.onWorkoutComplete?.();
    }, [clearTimer, callbacks]),

    startRest: useCallback((duration: number) => {
      setState(prev => ({
        ...prev,
        currentPhase: 'rest',
        restTimeRemaining: duration,
      }));
      callbacks.onPhaseChange?.('rest');
    }, [callbacks]),

    skipRest: useCallback(() => {
      setState(prev => ({
        ...prev,
        currentPhase: 'workout',
        restTimeRemaining: 0,
      }));
      callbacks.onPhaseChange?.('workout');
    }, [callbacks]),

    addRestTime: useCallback((seconds: number) => {
      setState(prev => ({
        ...prev,
        restTimeRemaining: Math.max(0, prev.restTimeRemaining + seconds),
      }));
    }, []),

    startSetTimer: useCallback((duration: number, setNumber: number, totalSets: number) => {
      setState(prev => ({
        ...prev,
        setTimeRemaining: duration,
        currentSet: setNumber,
        totalSets: totalSets,
      }));
    }, []),

    completeSet: useCallback(() => {
      setState(prev => ({
        ...prev,
        setTimeRemaining: 0,
        currentSet: prev.currentSet + 1,
      }));
    }, []),
  };

  return [state, controls];
}
