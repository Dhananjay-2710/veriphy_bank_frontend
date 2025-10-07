import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContextFixed';

interface SessionManagerOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
}

interface SessionManagerReturn {
  timeRemaining: number;
  isWarning: boolean;
  isExpired: boolean;
  extendSession: () => void;
  resetSession: () => void;
  startSession: () => void;
  stopSession: () => void;
}

export function useSessionManager(options: SessionManagerOptions = {}): SessionManagerReturn {
  const {
    timeoutMinutes = 30, // Default 30 minutes
    warningMinutes = 5, // Show warning 5 minutes before expiry
    onTimeout,
    onWarning
  } = options;

  const { user, sessionTimeout, setSessionTimeout } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(timeoutMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate if we should show warning
  const shouldShowWarning = timeRemaining <= (warningMinutes * 60);

  // Start session timer
  const startSession = useCallback(() => {
    if (!user) return;

    console.log('Starting session timer:', timeoutMinutes, 'minutes');
    setIsActive(true);
    setIsExpired(false);
    setTimeRemaining(timeoutMinutes * 60);

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up interval to update countdown
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Show warning when time is low
        if (newTime <= (warningMinutes * 60) && !isWarning) {
          setIsWarning(true);
          onWarning?.();
        }
        
        return newTime;
      });
    }, 1000);

    // Set up timeout for session expiry
    timeoutRef.current = setTimeout(() => {
      setIsExpired(true);
      setIsWarning(false);
      setIsActive(false);
      onTimeout?.();
    }, timeoutMinutes * 60 * 1000);

    // Store timeout ID in context for cleanup
    setSessionTimeout(timeoutRef.current);
  }, [user, timeoutMinutes, warningMinutes, onTimeout, onWarning, isWarning, setSessionTimeout]);

  // Stop session timer
  const stopSession = useCallback(() => {
    console.log('Stopping session timer');
    setIsActive(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setSessionTimeout(null);
  }, [setSessionTimeout]);

  // Reset session timer
  const resetSession = useCallback(() => {
    if (!user) return;
    
    console.log('Resetting session timer');
    stopSession();
    startSession();
  }, [user, startSession, stopSession]);

  // Extend session
  const extendSession = useCallback(() => {
    if (!user) return;
    
    console.log('Extending session');
    setIsWarning(false);
    resetSession();
  }, [user, resetSession]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start session when user logs in
  useEffect(() => {
    if (user && !isActive) {
      startSession();
    } else if (!user && isActive) {
      stopSession();
    }
  }, [user, isActive, startSession, stopSession]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    timeRemaining,
    isWarning,
    isExpired,
    extendSession,
    resetSession,
    startSession,
    stopSession
  };
}
