import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock, 
  RefreshCw, 
  Settings,
  User,
  Database,
  FileText,
  Lock,
  Unlock,
  Activity,
  Calendar,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_name?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'user' | 'system' | 'data';
}

interface AuditStats {
  totalLogsToday: number;
  securityEvents: number;
  userActions: number;
  systemEvents: number;
  criticalAlerts: number;
  topUsers: Array<{ user_name: string; action_count: number }>;
  actionBreakdown: { [action: string]: number };
}

export function SuperAdminAuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logStats, setLogStats] = useState<AuditStats>({
    totalLogsToday: 0,
    securityEvents: 0,
    userActions: 0,
    systemEvents: 0,
    criticalAlerts: 0,
    topUsers: [],
    actionBreakdown: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch audit logs and stats
  const fetchAuditData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching audit data with filters:', {
        searchTerm,
        selectedType,
        selectedSeverity,
        selectedCategory,
        selectedPeriod
      });

      const [logs, stats] = await Promise.all([
        SupabaseDatabaseService.getAuditLogsEnhanced({
          searchTerm: searchTerm || undefined,
          action: selectedType !== 'all' ? selectedType : undefined,
          severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          period: selectedPeriod,
          limit: 200
        }),
        SupabaseDatabaseService.getAuditLogStatsEnhanced(selectedPeriod)
      ]);

      setAuditLogs(logs);
      setLogStats(stats);
    } catch (err) {
      console.error('Error fetching audit data:', err);
      setError(`Failed to load audit logs: ${err instanceof Error ? err.message : 'Unknown error'}. Please check your database connection and table structure.`);
      setAuditLogs([]);
      setLogStats({
        totalLogsToday: 0,
        securityEvents: 0,
        userActions: 0,
        systemEvents: 0,
        criticalAlerts: 0,
        topUsers: [],
        actionBreakdown: {}
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchAuditData();
  }, [searchTerm, selectedType, selectedSeverity, selectedCategory, selectedPeriod]);

  // Helper to display helpful information about the logs table
  const renderDatabaseInfo = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Info className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-blue-800">Audit Logs Information</h3>
      </div>
      <p className="text-blue-700 mb-4">
        This page displays audit logs from your database's <code className="bg-blue-100 px-2 py-1 rounded">logs</code> table. 
        If you're not seeing data, it may be because:
      </p>
      <ul className="list-disc list-inside text-blue-700 space-y-2 mb-4">
        <li>The logs table doesn't exist yet</li>
        <li>No audit logs have been created</li>
        <li>There may be a database connection issue</li>
      </ul>
      <div className="flex space-x-4">
        <Button 
          onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Open Supabase Dashboard
        </Button>
        <Button 
          variant="outline"
          onClick={fetchAuditData}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Loading
        </Button>
      </div>
    </div>
  );

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <Shield className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'user':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-600" />;
      case 'data':
        return <Database className="h-4 w-4 text-green-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800';
      case 'VIEW':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportAuditLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Severity', 'IP Address'].join(','),
      ...auditLogs.map(log => [
        log.created_at,
        log.user_name || 'Unknown',
        log.action,
        `${log.resource_type}:${log.resource_id || 'N/A'}`,
        log.severity,
        log.ip_address || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Audit Logs</h1>
          <p className="text-gray-600 mt-2">Comprehensive security and activity monitoring across all systems</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <Button variant="outline" onClick={exportAuditLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={fetchAuditData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message / Database Info */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Show database info if no data and no specific error */}
      {!loading && !error && auditLogs.length === 0 && renderDatabaseInfo()}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{logStats.totalLogsToday}</p>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{logStats.securityEvents}</p>
                <p className="text-sm font-medium text-gray-600">Security Events</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{logStats.userActions}</p>
                <p className="text-sm font-medium text-gray-600">User Actions</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{logStats.systemEvents}</p>
                <p className="text-sm font-medium text-gray-600">System Events</p>
              </div>
              <Settings className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{logStats.criticalAlerts}</p>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Top Active Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logStats.topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-yellow-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{user.user_name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{user.action_count} actions</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Action Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(logStats.actionBreakdown).map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(action)}`}>
                      {action}
                    </span>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="security">Security</option>
                <option value="user">User Actions</option>
                <option value="system">System</option>
                <option value="data">Data</option>
              </select>
              
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Actions</option>
                  <option value="LOGIN">Login</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="VIEW">View</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Filter by IP address..."
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="text"
                  placeholder="Filter by user..."
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Recent Audit Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatTimestamp(log.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{log.user_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(log.category)}
                        <span>{log.resource_type}</span>
                        {log.resource_id && <span className="text-gray-500">:{log.resource_id}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                        {getSeverityIcon(log.severity)}
                        <span className="capitalize">{log.severity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {auditLogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Audit Log Details</h3>
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">Timestamp</label>
                  <p className="text-sm text-gray-600">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-600">{selectedLog.user_name}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Action</label>
                  <p className="text-sm text-gray-600">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Resource</label>
                  <p className="text-sm text-gray-600">{selectedLog.resource_type}:{selectedLog.resource_id}</p>
                </div>
              </div>
              {selectedLog.old_values && (
                <div>
                  <label className="font-medium text-gray-700">Previous Values</label>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.new_values && (
                <div>
                  <label className="font-medium text-gray-700">New Values</label>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
