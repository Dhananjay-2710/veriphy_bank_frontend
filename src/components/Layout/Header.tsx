import { Shield, LogOut, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Button } from '../ui/Button';
import { supabase } from '../../supabase-client';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from '../Search/GlobalSearch';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
   const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase logout error:', error.message);
        return;
      }
      await logout(); // clear context state
      navigate('/');
    } catch (err) {
      console.error('Unexpected logout error:', err);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Mobile Menu + Logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">VERIPHY</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Happy Bank of India</p>
            </div>
          </div>
        </div>

        {/* Center Section - Global Search (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <GlobalSearch 
            placeholder="Search cases, users, documents..."
            className="w-full"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Info + Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('-', ' ')}
              </p>
            </div>
            
            {/* Mobile User Info */}
            <div className="sm:hidden text-right">
              <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                {user?.full_name?.split(' ')[0] || 'User'}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="ml-1 sm:ml-2"
            >
              <LogOut className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}