import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  Database, 
  Activity, 
  CheckCircle,
  FileText,
  DollarSign,
  Home,
  UserPlus,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { NavigationHelper } from '../Test/NavigationHelper';
import { DatabasePopulator } from '../Test/DatabasePopulator';
import { useAdminDashboardStats } from '../../hooks/useDashboardData';

interface SuperAdminDashboardProps {
  onNavigateToUserManagement: () => void;
  onNavigateToSystemSettings: () => void;
  onNavigateToAuditLogs: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToCase: (caseId: string) => void;
  onNavigateToFeatureFlags?: () => void;
  onNavigateToSystemIntegrations?: () => void;
  onNavigateToSystemSettingsNew?: () => void;
  onNavigateToOrganizationSettings?: () => void;
}

export function SuperAdminDashboardFixed({}: SuperAdminDashboardProps) {
  const navigate = useNavigate();
  const [showDatabasePopulator, setShowDatabasePopulator] = useState(false);
  
  // Fetch real data from Supabase
  const { stats, loading: statsLoading, error: statsError, refetch } = useAdminDashboardStats();

  const systemStats = [
    { 
      label: 'Total Users', 
      value: statsLoading ? '...' : stats.totalUsers.toString(), 
      change: '+3 this week', 
      icon: Users, 
      color: 'blue',
      type: 'total-users',
      details: `Salespeople: ${Math.floor(stats.totalUsers * 0.5)}, Managers: ${Math.floor(stats.totalUsers * 0.2)}, Credit Ops: ${Math.floor(stats.totalUsers * 0.25)}, Admins: ${Math.floor(stats.totalUsers * 0.05)}`
    },
    { 
      label: 'System Health', 
      value: statsLoading ? '...' : `${stats.systemHealth}%`, 
      change: 'All systems operational', 
      icon: Activity, 
      color: 'green',
      type: 'system-health',
      details: `API: ${stats.systemHealth}%, Database: ${stats.systemHealth}%, WhatsApp: 100%, Document Storage: ${stats.systemHealth}%`
    },
    { 
      label: 'Security Alerts', 
      value: statsLoading ? '...' : stats.securityAlerts.toString(), 
      change: '1 resolved today', 
      icon: Shield, 
      color: 'yellow',
      type: 'security-alerts',
      details: `Failed Login Attempts: ${Math.floor(stats.securityAlerts * 0.5)}, Suspicious Activity: ${Math.floor(stats.securityAlerts * 0.5)}, All Critical Systems Secure`
    },
    { 
      label: 'Total Cases', 
      value: statsLoading ? '...' : stats.totalCases.toString(), 
      change: '+89 this month', 
      icon: FileText, 
      color: 'purple',
      type: 'total-cases',
      details: `Active: ${stats.activeCases}, Approved: ${Math.floor(stats.totalCases * 0.7)}, Rejected: ${Math.floor(stats.totalCases * 0.1)}, Under Review: ${Math.floor(stats.totalCases * 0.2)}`
    },
    { 
      label: 'Revenue (MTD)', 
      value: '₹45.2Cr', 
      change: '+12% vs last month', 
      icon: DollarSign, 
      color: 'green',
      type: 'revenue',
      details: 'Home Loans: ₹28.5Cr, Business: ₹12.1Cr, Personal: ₹3.2Cr, Car: ₹1.4Cr'
    },
    { 
      label: 'Compliance Score', 
      value: '98.5%', 
      change: '+0.3% this week', 
      icon: CheckCircle, 
      color: 'green',
      type: 'compliance-score',
      details: 'AML Checks: 100%, KYC: 98.2%, Document Verification: 97.8%, Audit Ready: 99.1%'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      color: 'blue',
      onClick: () => navigate('/user-management')
    },
    {
      title: 'System Settings',
      description: 'Configure system parameters and preferences',
      icon: Settings,
      color: 'gray',
      onClick: () => navigate('/system-settings')
    },
    {
      title: 'Feature Flags',
      description: 'Manage feature flags and toggles',
      icon: Settings,
      color: 'blue',
      onClick: () => navigate('/feature-flags')
    },
    {
      title: 'System Integrations',
      description: 'Manage third-party integrations',
      icon: Settings,
      color: 'indigo',
      onClick: () => navigate('/system-integrations')
    },
    {
      title: 'Organization Settings',
      description: 'Configure organization-specific settings',
      icon: Settings,
      color: 'teal',
      onClick: () => navigate('/organization-settings')
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and security logs',
      icon: Shield,
      color: 'yellow',
      onClick: () => navigate('/audit-logs')
    },
    {
      title: 'Analytics',
      description: 'View detailed reports and insights',
      icon: BarChart3,
      color: 'purple',
      onClick: () => navigate('/analytics')
    },
    {
      title: 'View Cases',
      description: 'Browse and manage loan cases',
      icon: FileText,
      color: 'green',
      onClick: () => navigate('/cases')
    },
    {
      title: 'Database Tools',
      description: 'Database management and testing tools',
      icon: Database,
      color: 'red',
      onClick: () => navigate('/database-tools')
    }
  ];

  const recentActivities = [
    {
      id: 'activity-1',
      user: 'Priya Sharma',
      action: 'Approved loan application',
      details: 'Home Loan - ₹35L for Kavya Menon',
      timestamp: '2025-01-09T15:45:00Z',
      type: 'approval'
    },
    {
      id: 'activity-2',
      user: 'Rajesh Kumar',
      action: 'Created new user account',
      details: 'Added new salesperson: Rohit Gupta',
      timestamp: '2025-01-09T14:30:00Z',
      type: 'user_management'
    },
    {
      id: 'activity-3',
      user: 'Anita Patel',
      action: 'Flagged compliance issue',
      details: 'Document mismatch in case HBI-BL-2025-008',
      timestamp: '2025-01-09T13:20:00Z',
      type: 'compliance'
    },
    {
      id: 'activity-4',
      user: 'System',
      action: 'Automated backup completed',
      details: 'Daily backup of all customer data and documents',
      timestamp: '2025-01-09T02:00:00Z',
      type: 'system'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'user_management':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'compliance':
        return <Shield className="h-4 w-4 text-yellow-600" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Show loading state
  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600">Loading system data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (statsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600">Error loading system data</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error Loading Dashboard</p>
              <p className="text-sm text-gray-600 mt-2">{statsError}</p>
            </div>
            <Button onClick={refetch} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Helper */}
      <NavigationHelper />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Complete oversight of VERIPHY banking operations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" onClick={() => navigate('/user-management')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
          <Button onClick={() => navigate('/analytics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'text-blue-600 bg-blue-100',
            green: 'text-green-600 bg-green-100',
            yellow: 'text-yellow-600 bg-yellow-100',
            purple: 'text-purple-600 bg-purple-100',
            red: 'text-red-600 bg-red-100'
          };
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
              switch (stat.type) {
                case 'total-users':
                  navigate('/user-management');
                  break;
                case 'system-health':
                  navigate('/system-settings');
                  break;
                case 'security-alerts':
                  navigate('/audit-logs');
                  break;
                case 'total-cases':
                  navigate('/analytics');
                  break;
                case 'revenue':
                  navigate('/analytics');
                  break;
                case 'compliance-score':
                  navigate('/audit-logs');
                  break;
                default:
                  break;
              }
            }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500">{stat.details}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colorClasses = {
                blue: 'text-blue-600 bg-blue-100 hover:bg-blue-200',
                gray: 'text-gray-600 bg-gray-100 hover:bg-gray-200',
                yellow: 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200',
                purple: 'text-purple-600 bg-purple-100 hover:bg-purple-200',
                green: 'text-green-600 bg-green-100 hover:bg-green-200',
                red: 'text-red-600 bg-red-100 hover:bg-red-200'
              };
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={action.onClick}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${colorClasses[action.color as keyof typeof colorClasses]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-gray-500">{action.description}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                      <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                    </div>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Services</span>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">WhatsApp Integration</span>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Document Storage</span>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Services</span>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backup System</span>
                <Badge variant="success">Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Populator Section */}
      {showDatabasePopulator && (
        <div className="mt-8">
          <DatabasePopulator />
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setShowDatabasePopulator(!showDatabasePopulator)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {showDatabasePopulator ? 'Hide DB Populator' : 'Show DB Populator'}
          </Button>
          
          <Button
            onClick={() => navigate('/admin')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Admin Panel
          </Button>
        </div>
      </div>
    </div>
  );
}
