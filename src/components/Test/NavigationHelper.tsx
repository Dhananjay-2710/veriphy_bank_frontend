import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  FileText,
  Home,
  UserPlus,
  Database
} from 'lucide-react';

export function NavigationHelper() {
  const navigate = useNavigate();

  const navigationItems = [
    {
      title: 'Home Dashboard',
      description: 'Go back to main dashboard',
      icon: Home,
      path: '/',
      color: 'blue'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      path: '/user-management',
      color: 'green'
    },
    {
      title: 'System Settings',
      description: 'Configure system parameters',
      icon: Settings,
      path: '/system-settings',
      color: 'gray'
    },
    {
      title: 'Audit Logs',
      description: 'View system activity logs',
      icon: Shield,
      path: '/audit-logs',
      color: 'yellow'
    },
    {
      title: 'Analytics',
      description: 'View reports and insights',
      icon: BarChart3,
      path: '/analytics',
      color: 'purple'
    },
    {
      title: 'Cases',
      description: 'Browse and manage loan cases',
      icon: FileText,
      path: '/cases',
      color: 'red'
    },
    {
      title: 'Add User',
      description: 'Create new user accounts',
      icon: UserPlus,
      path: '/user-management',
      color: 'blue'
    },
    {
      title: 'Database Tools',
      description: 'Database management tools',
      icon: Database,
      path: '/database-tools',
      color: 'indigo'
    }
  ];

  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 hover:bg-blue-200',
    green: 'text-green-600 bg-green-100 hover:bg-green-200',
    gray: 'text-gray-600 bg-gray-100 hover:bg-gray-200',
    yellow: 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200',
    purple: 'text-purple-600 bg-purple-100 hover:bg-purple-200',
    red: 'text-red-600 bg-red-100 hover:bg-red-200',
    indigo: 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200'
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-900">🧭 Navigation Helper</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-blue-800">
            Quick navigation to all available pages in the application.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${colorClasses[item.color as keyof typeof colorClasses]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-white rounded border">
            <h4 className="font-semibold text-sm text-gray-800 mb-2">Current Location:</h4>
            <p className="text-sm text-gray-600">
              {window.location.pathname === '/' ? 'Home Dashboard' : window.location.pathname}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
