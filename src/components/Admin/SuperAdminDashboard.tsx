import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  Settings, 
  CheckCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface SuperAdminDashboardProps {
  onNavigateToOrganizations: () => void;
  onNavigateToDepartments: () => void;
  onNavigateToUsers: () => void;
  onNavigateToCustomers: () => void;
  onNavigateToAuditLogs: () => void;
}

export function SuperAdminDashboard({ 
  onNavigateToOrganizations,
  onNavigateToDepartments,
  onNavigateToUsers,
  onNavigateToCustomers,
  onNavigateToAuditLogs
}: SuperAdminDashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalDepartments: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalCustomers: 0,
    activeCustomers: 0
  });

  // Load dashboard statistics
  const loadStats = async () => {
    setLoading(true);
    try {
      const [orgs, depts, users, customers] = await Promise.all([
        SupabaseDatabaseService.getOrganizations(),
        SupabaseDatabaseService.getDepartments(),
        SupabaseDatabaseService.getUsers(),
        SupabaseDatabaseService.getCustomers()
      ]);

      setStats({
        totalOrganizations: orgs.length,
        totalDepartments: depts.length,
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.status === 'active').length,
        totalCustomers: customers.length,
        activeCustomers: customers.filter((c: any) => c.status === 'active').length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    loadStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
          <div className="relative flex items-center justify-between">
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
          <p className="text-gray-300">Manage all organizations, departments, and system-wide settings</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading} className="dashboard-refresh-button" style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              Organizations in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            <p className="text-xs text-muted-foreground">
              Departments across all orgs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users across all organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active users
            </p>
          </CardContent>
        </Card>
          </div>

      {/* Management Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToOrganizations}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Organization Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Create, update, and manage all organizations in the system. Set up organization details, contact information, and settings.
            </p>
            <div className="flex items-center justify-between">
                        <Badge variant="default">{stats.totalOrganizations} Organizations</Badge>
                <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Manage
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToDepartments}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Department Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage departments across all organizations. Create department structures and assign users to departments.
            </p>
                <div className="flex items-center justify-between">
              <Badge variant="default">{stats.totalDepartments} Departments</Badge>
              <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToUsers}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and manage all users across all organizations. Assign roles, manage permissions, and monitor user activity.
            </p>
                        <div className="flex items-center justify-between">
              <Badge variant="default">{stats.totalUsers} Users</Badge>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToCustomers}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Customer Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and manage all customers across all organizations. Monitor customer data, KYC status, and loan applications.
            </p>
                        <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Badge variant="default">{stats.totalCustomers} Total</Badge>
                <Badge variant="default">{stats.activeCustomers} Active</Badge>
                          </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Manage
              </Button>
                          </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onNavigateToAuditLogs}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-purple-600" />
              Super Admin Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View comprehensive audit logs of all Super Admin operations. Track user actions, system changes, and compliance activities.
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="default">Real-time Logging</Badge>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Logs
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current User</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {user?.full_name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> <Badge variant="default">Super Admin</Badge></p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">System Status</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Database:</strong> <Badge variant="default">Connected</Badge></p>
                <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
