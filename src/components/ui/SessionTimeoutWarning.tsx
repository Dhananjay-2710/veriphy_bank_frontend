import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useNavigate } from 'react-router-dom';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onExtendSession: () => void;
  timeRemaining: number; // in seconds
}

export function SessionTimeoutWarning({ 
  isOpen, 
  onClose, 
  onExtendSession, 
  timeRemaining 
}: SessionTimeoutWarningProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(timeRemaining);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    setCountdown(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleAutoLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  const handleAutoLogout = async () => {
    console.log('Session expired - auto logging out');
    await logout();
    navigate('/login?timeout=true');
  };

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      await onExtendSession();
      onClose();
    } catch (error) {
      console.error('Error extending session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogoutNow = async () => {
    await logout();
    navigate('/login');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getWarningLevel = () => {
    if (countdown <= 30) return 'critical';
    if (countdown <= 60) return 'warning';
    return 'info';
  };

  const warningLevel = getWarningLevel();

  const getWarningStyles = () => {
    switch (warningLevel) {
      case 'critical':
        return {
          borderColor: 'border-red-200 dark:border-red-800',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          iconColor: 'text-red-600 dark:text-red-400',
          titleColor: 'text-red-900 dark:text-red-100',
          textColor: 'text-red-800 dark:text-red-200',
          buttonVariant: 'destructive' as const
        };
      case 'warning':
        return {
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          titleColor: 'text-yellow-900 dark:text-yellow-100',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          buttonVariant: 'outline' as const
        };
      default:
        return {
          borderColor: 'border-blue-200 dark:border-blue-800',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          titleColor: 'text-blue-900 dark:text-blue-100',
          textColor: 'text-blue-800 dark:text-blue-200',
          buttonVariant: 'outline' as const
        };
    }
  };

  const styles = getWarningStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      className="max-w-md"
      showCloseButton={false}
    >
      <div className={`${styles.bgColor} ${styles.borderColor} border rounded-lg p-6`}>
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
            warningLevel === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
            warningLevel === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            {warningLevel === 'critical' ? (
              <AlertTriangle className={`h-5 w-5 ${styles.iconColor}`} />
            ) : (
              <Clock className={`h-5 w-5 ${styles.iconColor}`} />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
              {warningLevel === 'critical' ? 'Session Expiring Soon!' : 'Session Timeout Warning'}
            </h3>
            <p className={`text-sm ${styles.textColor}`}>
              Your session will expire in
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="text-center mb-6">
          <div className={`text-3xl font-bold ${styles.titleColor} font-mono`}>
            {formatTime(countdown)}
          </div>
          <p className={`text-sm ${styles.textColor} mt-2`}>
            {warningLevel === 'critical' ? 
              'Please extend your session or save your work immediately!' :
              'Your session will automatically expire due to inactivity.'
            }
          </p>
        </div>

        {/* User Info */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email} • {user?.role?.replace('-', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleExtendSession}
            disabled={isExtending}
            className="flex-1"
          >
            {isExtending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Extending...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Extend Session
              </>
            )}
          </Button>
          
          <Button
            variant={styles.buttonVariant}
            onClick={handleLogoutNow}
            disabled={isExtending}
            className="flex-1"
          >
            Logout Now
          </Button>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
          <p className={`text-xs ${styles.textColor}`}>
            <strong>Security Notice:</strong> Your session expires automatically to protect your account. 
            You can extend your session or log out manually at any time.
          </p>
        </div>
      </div>
    </Modal>
  );
}
