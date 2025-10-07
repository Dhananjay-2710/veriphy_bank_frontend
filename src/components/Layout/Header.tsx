import { Shield, LogOut, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Button } from '../ui/Button';
import { supabase } from '../../supabase-client';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from '../Search/GlobalSearch';

interface HeaderProps {
  onMenuClick?: () => void;
  onLogoutClick?: () => void;
}

export function Header({ onMenuClick, onLogoutClick }: HeaderProps) {
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

  const handleLogoutClick = () => {
    console.log('Logout button clicked!');
    onLogoutClick?.();
  };

  return (
    <header className="backdrop-blur-xl bg-white/10 border-b border-white/20 px-4 sm:px-6 py-4 relative z-30">
      <div className="flex items-center justify-between">
        {/* Left Section - Mobile Menu + Logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-blue-200 hover:text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-300" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">VERIPHY</h1>
              <p className="text-xs text-blue-200/80 hidden sm:block">Happy Bank of India</p>
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
          <button className="relative p-2 text-blue-200 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Info + Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">
                {user?.full_name}
              </p>
              <p className="text-xs text-blue-200/80 capitalize">
                {user?.role?.replace('-', ' ')}
              </p>
            </div>
            
            {/* Mobile User Info */}
            <div className="sm:hidden text-right">
              <p className="text-sm font-medium text-white truncate max-w-24">
                {user?.full_name?.split(' ')[0] || 'User'}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogoutClick}
              className="ml-1 sm:ml-2 text-white border-white/50 bg-white/30 backdrop-blur-sm hover:border-white/60 hover:bg-white/40 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer relative z-10"
              style={{ pointerEvents: 'auto' }}
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