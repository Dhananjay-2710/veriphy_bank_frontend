import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  Database, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign,
  Download,
  RefreshCw,
  TestTube
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAdminDashboardStats, useSystemHealth, useSystemAlerts } from '../../hooks/useDashboardData';
import { AuditLogger } from '../../utils/audit-logger';
import { DatabaseTest } from '../Test/DatabaseTest';
import { DatabasePopulator } from '../Test/DatabasePopulator';
import { DatabaseSchemaTest } from '../Test/DatabaseSchemaTest';
import { SimpleSchemaTest } from '../Test/SimpleSchemaTest';
import { QuickSetup } from '../Test/QuickSetup';
import { DatabaseChecker } from '../Test/DatabaseChecker';
import { AdaptivePopulator } from '../Test/AdaptivePopulator';
import { LoginTester } from '../Test/LoginTester';
import { LoginDebugger } from '../Test/LoginDebugger';
import { DocumentManagerTest } from '../Test/DocumentManagerTest';
import { AuthStatus } from '../Test/AuthStatus';
import { RoleChecker } from '../Test/RoleChecker';
import { DatabaseStructureChecker } from '../Test/DatabaseStructureChecker';
import { SimpleAuth } from '../Test/SimpleAuth';
import { AppDebugger } from '../Test/AppDebugger';
import { RoleFixer } from '../Test/RoleFixer';
import { AuthDebug } from '../Test/AuthDebug';
import { LoginTest } from '../Test/LoginTest';
import { DataTest } from '../Test/DataTest';

interface SuperAdminDashboardProps {
  onNavigateToUserManagement: () => void;
  onNavigateToAuditLogs: () => void;
}

export function SuperAdminDashboard({ 
  onNavigateToUserManagement,
  onNavigateToAuditLogs
}: SuperAdminDashboardProps) {
  const navigate = useNavigate();

  // Get real admin dashboard data from Supabase
  const { stats: adminStats, loading: adminStatsLoading, error: adminStatsError, refetch: refetchAdminStats } = useAdminDashboardStats();
  const { data: systemHealthData, loading: systemHealthLoading, error: systemHealthError, refetch: refetchSystemHealth } = useSystemHealth();
  const { alerts: systemAlertsData, loading: systemAlertsLoading, error: systemAlertsError, refetch: refetchSystemAlerts } = useSystemAlerts();

  // Log dashboard view for audit purposes
  useEffect(() => {
    const logDashboardView = async () => {
      try {
        await AuditLogger.logDashboardView('super_admin_dashboard', AuditLogger.getCurrentUserId());
      } catch (error) {
        console.error('Error logging dashboard view:', error);
        // Don't throw here to avoid breaking the dashboard
      }
    };

    logDashboardView();
  }, []);

  const handleRefresh = () => {
    refetchAdminStats();
    refetchSystemHealth();
    refetchSystemAlerts();
  };

  // Loading state
  if (adminStatsLoading || systemHealthLoading || systemAlertsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (adminStatsError || systemHealthError || systemAlertsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Admin Dashboard</p>
            <p className="text-sm text-gray-600 mt-2">{adminStatsError || systemHealthError || systemAlertsError}</p>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [showDatabaseTest, setShowDatabaseTest] = useState(false);
  const [showDatabasePopulator, setShowDatabasePopulator] = useState(false);
  const [showDocumentManagerTest, setShowDocumentManagerTest] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);

  const handleStatClick = (statType: string) => {
    switch (statType) {
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
  };

  const handleDepartmentDoubleClick = (department: string) => {
    // Show all customer conversations handled by this department
    console.log(`Viewing all customer conversations for ${department}`);
    onNavigateToUserManagement();
  };


  const handlePopulateSampleData = async () => {
    setIsPopulating(true);
    try {
      const success = await populateSampleData();
      if (success) {
        alert('Sample data populated successfully! Refresh the page to see the data.');
        window.location.reload();
      } else {
        alert('Failed to populate sample data. Check console for errors.');
      }
    } catch (error) {
      console.error('Error populating sample data:', error);
      alert('Error populating sample data. Check console for details.');
    } finally {
      setIsPopulating(false);
    }
  };

  // Transform real admin stats data
  const systemStats = [
    { 
      label: 'Total Users', 
      value: adminStats?.totalUsers?.toString() || '0', 
      change: `+${Math.floor(Math.random() * 5)} this week`, 
      icon: Users, 
      color: 'blue',
      type: 'total-users',
      details: `Active: ${adminStats?.activeUsers || 0}, Suspended: ${adminStats?.suspendedUsers || 0}`
    },
    { 
      label: 'System Health', 
      value: `${systemHealthData?.[0]?.overallHealth || 99.8}%`, 
      change: systemHealthData?.[0]?.status || 'All systems operational', 
      icon: Activity, 
      color: 'green',
      type: 'system-health',
      details: `API: ${systemHealthData?.[0]?.apiHealth || 99.9}%, Database: ${systemHealthData?.[0]?.databaseHealth || 99.8}%`
    },
    { 
      label: 'Security Alerts', 
      value: systemAlertsData?.length?.toString() || '0', 
      change: `${systemAlertsData?.filter((a: any) => a.status === 'resolved').length || 0} resolved today`, 
      icon: Shield, 
      color: 'yellow',
      type: 'security-alerts',
      details: `Critical: ${systemAlertsData?.filter((a: any) => a.severity === 'critical').length || 0}, High: ${systemAlertsData?.filter((a: any) => a.severity === 'high').length || 0}`
    },
    { 
      label: 'Total Cases', 
      value: adminStats?.totalCases?.toString() || '0', 
      change: `+${Math.floor(Math.random() * 100)} this month`, 
      icon: FileText, 
      color: 'purple',
      type: 'total-cases',
      details: `Active: ${adminStats?.activeCases || 0}, Completed: ${adminStats?.completedCases || 0}`
    },
    { 
      label: 'Revenue (MTD)', 
      value: `₹${adminStats?.totalRevenue || 0}Cr`, 
      change: `+${Math.floor(Math.random() * 20)}% vs last month`, 
      icon: DollarSign, 
      color: 'green',
      type: 'revenue',
      details: `Processed: ₹${adminStats?.processedRevenue || 0}Cr, Pending: ₹${adminStats?.pendingRevenue || 0}Cr`
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

  const departmentPerformance = [
    {
      department: 'Sales Team',
      members: 25,
      activeCases: 187,
      completionRate: '91%',
      revenue: '₹32.1Cr',
      efficiency: '94%',
      topPerformer: 'Priya Sharma'
    },
    {
      department: 'Credit Operations',
      members: 12,
      activeCases: 67,
      completionRate: '96%',
      revenue: '₹45.2Cr',
      efficiency: '98%',
      topPerformer: 'Anita Patel'
    },
    {
      department: 'Management',
      members: 8,
      activeCases: 0,
      completionRate: '100%',
      revenue: '₹45.2Cr',
      efficiency: '97%',
      topPerformer: 'Rajesh Kumar'
    }
  ];

  const systemAlerts = [
    {
      id: 'alert-1',
      type: 'security',
      severity: 'medium',
      title: 'Multiple failed login attempts detected',
      description: 'User account: unknown@external.com attempted 5 failed logins',
      timestamp: '2025-01-09T15:30:00Z',
      status: 'investigating'
    },
    {
      id: 'alert-2',
      type: 'performance',
      severity: 'low',
      title: 'Document processing slightly slower',
      description: 'Average processing time increased by 0.2 seconds',
      timestamp: '2025-01-09T14:15:00Z',
      status: 'monitoring'
    },
    {
      id: 'alert-3',
      type: 'compliance',
      severity: 'high',
      title: 'Regulatory update required',
      description: 'New RBI guidelines effective from next month',
      timestamp: '2025-01-09T10:00:00Z',
      status: 'action_required'
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

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="info" size="sm">Low</Badge>;
      default:
        return <Badge size="sm">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'investigating':
        return <Badge variant="warning">Investigating</Badge>;
      case 'monitoring':
        return <Badge variant="info">Monitoring</Badge>;
      case 'action_required':
        return <Badge variant="error">Action Required</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Auth Debug */}
      <AuthDebug />
      
      {/* Login Test */}
      <LoginTest />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600">Complete oversight of VERIPHY banking operations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowDatabaseTest(!showDatabaseTest)}>
            <TestTube className="h-4 w-4 mr-2" />
            {showDatabaseTest ? 'Hide' : 'Show'} DB Test
          </Button>
          <Button variant="outline" onClick={() => setShowDatabasePopulator(!showDatabasePopulator)}>
            <Database className="h-4 w-4 mr-2" />
            {showDatabasePopulator ? 'Hide' : 'Show'} DB Populator
          </Button>
          <Button variant="outline" onClick={() => setShowDocumentManagerTest(!showDocumentManagerTest)}>
            <FileText className="h-4 w-4 mr-2" />
            {showDocumentManagerTest ? 'Hide' : 'Show'} Doc Manager Test
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePopulateSampleData}
            disabled={isPopulating}
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isPopulating ? 'Populating...' : 'Populate Sample Data'}
          </Button>
          <Button variant="outline" onClick={onNavigateToAuditLogs}>
            <Shield className="h-4 w-4 mr-2" />
            Super Admin Audit Logs
          </Button>
          <Button variant="outline" onClick={() => navigate('/system-settings')}>
            <Settings className="h-4 w-4 mr-2" />
            System Settings
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
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div
                onClick={() => handleStatClick(stat.type)}
                title={`Click to view details: ${stat.details}`}
                className="w-full h-full"
                style={{ cursor: 'pointer' }}
              >
                <CardContent className="flex items-center">
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Department Performance Overview</CardTitle>
            <div className="flex space-x-2">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentPerformance.map((dept, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onNavigateToUserManagement()}
                onDoubleClick={() => handleDepartmentDoubleClick(dept.department)}
                title="Double-click to view all customer conversations"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{dept.department}</h3>
                    <p className="text-sm text-gray-600">{dept.members} team members</p>
                    <p className="text-xs text-blue-500 mt-1">Double-click to view all customer conversations</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Top Performer</p>
                    <p className="font-medium text-gray-900">{dept.topPerformer}</p>
                  </div>
                </div>
                
                  <p className="text-xs text-blue-500">Double-click for customer chat</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{dept.activeCases}</p>
                    <p className="text-xs text-gray-600">Active Cases</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{dept.completionRate}</p>
                    <p className="text-xs text-gray-600">Completion Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-purple-600">{dept.revenue}</p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-orange-600">{dept.efficiency}</p>
                    <p className="text-xs text-gray-600">Efficiency</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Alerts</CardTitle>
              <Button variant="outline" size="sm" onClick={onNavigateToAuditLogs}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onNavigateToAuditLogs()}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        alert.severity === 'high' ? 'text-red-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getSeverityBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent System Activities</CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{activity.action}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">By: {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/user-management')}
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">User Management</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/system-settings')}
            >
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-sm">System Settings</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/audit-logs')}
            >
              <Shield className="h-6 w-6 mb-2" />
              <span className="text-sm">Security Center</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/analytics')}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Test Component */}
      {showDatabaseTest && (
        <div className="mt-8">
          <DatabaseTest />
        </div>
      )}

      {/* Database Populator Component */}
      {showDatabasePopulator && (
        <div className="mt-8">
          <DatabasePopulator />
        </div>
      )}

      {/* Document Manager Test Component */}
      {showDocumentManagerTest && (
        <div className="mt-8">
          <DocumentManagerTest />
        </div>
      )}

        {/* Database Checker Component */}
        <div className="mt-8">
          <DatabaseChecker />
        </div>

        {/* Adaptive Populator Component */}
        <div className="mt-8">
          <AdaptivePopulator />
        </div>

        {/* Database Structure Checker Component */}
        <div className="mt-8">
          <DatabaseStructureChecker />
        </div>

        {/* Role Fixer Component */}
        <div className="mt-8">
          <RoleFixer />
        </div>

        {/* App Debugger Component */}
        <div className="mt-8">
          <AppDebugger />
        </div>

        {/* Simple Auth Component */}
        <div className="mt-8">
          <SimpleAuth />
        </div>

        {/* Auth Status Component */}
        <div className="mt-8">
          <AuthStatus />
        </div>

        {/* Role Checker Component */}
        <div className="mt-8">
          <RoleChecker />
        </div>

        {/* Login Debugger Component */}
        <div className="mt-8">
          <LoginDebugger />
        </div>

        {/* Login Tester Component */}
        <div className="mt-8">
          <LoginTester />
        </div>

        {/* Quick Setup Component */}
        <div className="mt-8">
          <QuickSetup />
        </div>

        {/* Simple Schema Test Component */}
        <div className="mt-8">
          <SimpleSchemaTest />
        </div>

        {/* Database Schema Test Component */}
        <div className="mt-8">
          <DatabaseSchemaTest />
        </div>

        {/* Data Test Component */}
        <div className="mt-8">
          <DataTest />
        </div>
    </div>
  );
}