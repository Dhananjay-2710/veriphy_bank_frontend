import React, { useState } from 'react';
import { useSessionManager } from '../../hooks/useSessionManager';
import { SessionTimeoutWarning } from '../ui/SessionTimeoutWarning';
import { useAuth } from '../../contexts/AuthContextFixed';

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

export function SessionTimeoutProvider({ children }: SessionTimeoutProviderProps) {
  const { user } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  const {
    timeRemaining,
    isWarning,
    isExpired,
    extendSession,
    resetSession
  } = useSessionManager({
    timeoutMinutes: 30, // 30 minutes session timeout
    warningMinutes: 5,  // Show warning 5 minutes before expiry
    onWarning: () => {
      setShowWarning(true);
    },
    onTimeout: () => {
      setShowWarning(false);
      // The session manager will handle the actual logout
    }
  });

  const handleExtendSession = async () => {
    try {
      extendSession();
      setShowWarning(false);
    } catch (error) {
      console.error('Error extending session:', error);
    }
  };

  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  // Don't show warning if user is not logged in
  if (!user) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Session Timeout Warning Modal */}
      <SessionTimeoutWarning
        isOpen={showWarning && isWarning}
        onClose={handleCloseWarning}
        onExtendSession={handleExtendSession}
        timeRemaining={timeRemaining}
      />
    </>
  );
}
