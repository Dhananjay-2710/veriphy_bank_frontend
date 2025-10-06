import { useState } from 'react';
import { 
  Building2, 
  Shield, 
  Key, 
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { DepartmentManagement } from '../Admin/DepartmentManagement';
import { RolesManagement } from '../Admin/RolesManagement';
import { PermissionsManagement } from '../Admin/PermissionsManagement';

interface AdminDashboardProps {
  onNavigateToUserManagement?: () => void;
  onNavigateToSystemSettings?: () => void;
  onNavigateToAuditLogs?: () => void;
}

export function AdminDashboard({}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'departments' | 'roles' | 'permissions'>('overview');
  const { user } = useAuth();
  
  const handleBackToOverview = () => {
    setActiveView('overview');
  };

  // Show specific management views
  if (activeView === 'departments') {
    return <DepartmentManagement onBack={handleBackToOverview} />;
  }

  if (activeView === 'roles') {
    return <RolesManagement onBack={handleBackToOverview} />;
  }

  if (activeView === 'permissions') {
    return <PermissionsManagement onBack={handleBackToOverview} />;
  }

  // Main overview dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage departments, roles, and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('departments')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Department Management</h3>
                <p className="text-sm text-gray-600">Manage organizational departments and structure</p>
            </div>
          </div>
        </CardContent>
      </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('roles')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Shield className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Roles Management</h3>
                <p className="text-sm text-gray-600">Create and manage user roles and permissions</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('permissions')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <Key className="h-6 w-6" />
            </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Permissions Management</h3>
                <p className="text-sm text-gray-600">Configure system permissions and access controls</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveView('departments')}
            >
              <Building2 className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Departments</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveView('roles')}
            >
              <Shield className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Roles</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveView('permissions')}
            >
              <Key className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Permissions</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current User</h4>
              <p className="text-sm text-gray-600">{user?.email || 'Not logged in'}</p>
              <p className="text-sm text-gray-600">Role: {user?.role || 'Unknown'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
              <p className="text-sm text-gray-600">Name: {user?.full_name || 'Not available'}</p>
              <p className="text-sm text-gray-600">ID: {user?.id || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}