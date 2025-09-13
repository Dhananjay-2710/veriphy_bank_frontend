import React, { useState } from 'react';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  Database, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  DollarSign,
  UserCheck,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AdminDashboardProps {
  onNavigateToUserManagement: () => void;
  onNavigateToSystemSettings: () => void;
  onNavigateToAuditLogs: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToCase: (caseId: string) => void;
}

export function AdminDashboard({ 
  onNavigateToUserManagement,
  onNavigateToSystemSettings,
  onNavigateToAuditLogs,
  onNavigateToAnalytics,
  onNavigateToCase
}: AdminDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');

  const handleStatClick = (statType: string) => {
    switch (statType) {
      case 'total-users':
        onNavigateToUserManagement();
        break;
      case 'system-health':
        onNavigateToSystemSettings();
        break;
      case 'security-alerts':
        onNavigateToAuditLogs();
        break;
      case 'total-cases':
        onNavigateToAnalytics();
        break;
      case 'revenue':
        onNavigateToAnalytics();
        break;
      case 'compliance-score':
        onNavigateToAuditLogs();
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

  const handleActivityDoubleClick = (activity: any) => {
    // If activity involves a customer case, show WhatsApp conversation
    if (activity.type === 'approval' && activity.details.includes('for')) {
      const customerName = activity.details.split('for ')[1];
      console.log(`Opening WhatsApp conversation with ${customerName}`);
    }
    onNavigateToCase('case-001');
  };

  const systemStats = [
    { 
      label: 'Total Users', 
      value: '47', 
      change: '+3 this week', 
      icon: Users, 
      color: 'blue',
      type: 'total-users',
      details: 'Salespeople: 25, Managers: 8, Credit Ops: 12, Admins: 2'
    },
    { 
      label: 'System Health', 
      value: '99.8%', 
      change: 'All systems operational', 
      icon: Activity, 
      color: 'green',
      type: 'system-health',
      details: 'API: 99.9%, Database: 99.8%, WhatsApp: 100%, Document Storage: 99.7%'
    },
    { 
      label: 'Security Alerts', 
      value: '2', 
      change: '1 resolved today', 
      icon: Shield, 
      color: 'yellow',
      type: 'security-alerts',
      details: 'Failed Login Attempts: 1, Suspicious Activity: 1, All Critical Systems Secure'
    },
    { 
      label: 'Total Cases', 
      value: '1,247', 
      change: '+89 this month', 
      icon: FileText, 
      color: 'purple',
      type: 'total-cases',
      details: 'Active: 234, Approved: 892, Rejected: 87, Under Review: 34'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600">Complete oversight of VERIPHY banking operations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onNavigateToAuditLogs}>
            <Shield className="h-4 w-4 mr-2" />
            Audit Logs
          </Button>
          <Button variant="outline" onClick={onNavigateToSystemSettings}>
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
          <Button onClick={onNavigateToAnalytics}>
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
              onClick={() => handleStatClick(stat.type)}
              title={`Click to view details: ${stat.details}`}
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
                onDoubleClick={() => handleActivityDoubleClick(activity)}
                title="Double-click to view related customer conversation"
                onClick={() => onNavigateToUserManagement()}
                onDoubleClick={() => handleDepartmentDoubleClick(dept.department)}
                title="Click to view department details"
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
              onClick={onNavigateToUserManagement}
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">User Management</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={onNavigateToSystemSettings}
            >
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-sm">System Settings</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={onNavigateToAuditLogs}
            >
              <Shield className="h-6 w-6 mb-2" />
              <span className="text-sm">Security Center</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={onNavigateToAnalytics}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}