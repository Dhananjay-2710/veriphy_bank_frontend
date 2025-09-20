import { Shield, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContextFixed';
import { Button } from '../ui/Button';
import { supabase } from '../../supabase-client';
import { useNavigate } from 'react-router-dom';

export function Header() {
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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">VERIPHY</h1>
              <p className="text-xs text-gray-500">Happy Bank of India</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Info + Logout */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name}
                {/* {user?.name || user?.email} */}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('-', ' ')}
              </p>
            </div>
            {/* {user?.avatar && (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="h-8 w-8 rounded-full object-cover"
              />
            )} */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="ml-2"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}