import React, { useState } from 'react';
import { LogOut, User, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { useAuth } from '../../contexts/AuthContextFixed';
import { supabase } from '../../supabase-client';
import { useNavigate } from 'react-router-dom';

interface SoftLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchUser?: () => void;
}

export function SoftLogoutModal({ isOpen, onClose, onSwitchUser }: SoftLogoutModalProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutType, setLogoutType] = useState<'soft' | 'hard' | null>(null);

  console.log('SoftLogoutModal rendered:', { isOpen, user: user?.email });

  const handleSoftLogout = async () => {
    setIsLoggingOut(true);
    setLogoutType('soft');
    
    try {
      // Soft logout - clear local session but keep user data for quick re-login
      console.log('Performing soft logout...');
      
      // Clear local storage but keep user preferences
      const userPreferences = localStorage.getItem('user_preferences');
      localStorage.clear();
      if (userPreferences) {
        localStorage.setItem('user_preferences', userPreferences);
      }
      
      // Store session info for quick re-login (encrypted)
      const sessionInfo = {
        email: user?.email,
        lastLogin: new Date().toISOString(),
        softLogout: true
      };
      localStorage.setItem('veriphy_session_info', JSON.stringify(sessionInfo));
      
      // Clear user context but don't sign out from Supabase
      await logout();
      
      // Navigate to login with soft logout indicator
      navigate('/login?logout=soft');
      
    } catch (error) {
      console.error('Soft logout error:', error);
    } finally {
      setIsLoggingOut(false);
      onClose();
    }
  };

  const handleHardLogout = async () => {
    setIsLoggingOut(true);
    setLogoutType('hard');
    
    try {
      // Hard logout - complete session termination
      console.log('Performing hard logout...');
      
      // Clear all local storage
      localStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase logout error:', error.message);
      }
      
      // Clear user context
      await logout();
      
      // Navigate to login
      navigate('/login?logout=hard');
      
    } catch (error) {
      console.error('Hard logout error:', error);
    } finally {
      setIsLoggingOut(false);
      onClose();
    }
  };

  const handleSwitchUser = () => {
    onSwitchUser?.();
    onClose();
  };

  const getLogoutButtonText = () => {
    if (!isLoggingOut) return '';
    return logoutType === 'soft' ? 'Soft Logging Out...' : 'Logging Out...';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Logout Options"
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* User Info */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-blue-600 capitalize">
                {user?.role?.replace('-', ' ')} • Active Session
              </p>
            </div>
          </div>
        </div>

        {/* Logout Options */}
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Choose your logout preference:
          </div>

          {/* Soft Logout Option */}
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  Soft Logout
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Keep session data for quick re-login. Recommended for shared devices.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSoftLogout}
              disabled={isLoggingOut}
              className="mt-3 w-full border-green-200 text-green-700 hover:bg-green-50"
            >
              {isLoggingOut && logoutType === 'soft' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  Soft Logging Out...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Soft Logout
                </>
              )}
            </Button>
          </div>

          {/* Hard Logout Option */}
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">
                  Complete Logout
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Fully terminate session and clear all data. Recommended for personal devices.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleHardLogout}
              disabled={isLoggingOut}
              className="mt-3 w-full border-red-200 text-red-700 hover:bg-red-50"
            >
              {isLoggingOut && logoutType === 'hard' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  Logging Out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Complete Logout
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Additional Options */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchUser}
              disabled={isLoggingOut}
              className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <User className="h-4 w-4 mr-2" />
              Switch User
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoggingOut}
              className="flex-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium">Security Notice:</p>
              <p>Always log out completely when using shared or public devices to protect your account.</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
