import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Calendar,
  User,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { AuditLogger } from '../../utils/audit-logger';
import { supabase } from '../../supabase-client';

interface SuperAdminAuditLogsProps {
  onBack: () => void;
}

interface AuditLogEntry {
  id: string;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string | null;
  log_type: string;
  metadata: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  updated_at: string | null;
  users?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  } | null;
}

export function SuperAdminAuditLogs({ onBack }: SuperAdminAuditLogsProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    userActions: 0,
    systemActions: 0,
    createActions: 0,
    updateActions: 0,
    deleteActions: 0
  });

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching Super Admin audit logs...');
      
      // Get audit logs from the database (using 'logs' table)
      console.log('🔍 Fetching logs without foreign key relationship...');
      
      // Always fetch logs and users separately to avoid foreign key issues
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (logsError) {
        throw new Error(`Failed to fetch audit logs: ${logsError.message}`);
      }
      
      console.log('📊 Fetched logs:', logsData?.length || 0);
      
      // Get user data separately and merge
      const userIds = logsData?.map(log => log.user_id).filter(id => id) || [];
      console.log('👥 Unique user IDs found:', userIds);
      
      let usersData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, email, role')
          .in('id', userIds);
        
        console.log('👤 Users fetched:', users?.length || 0, usersError ? 'with error' : 'successfully');
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
        } else if (users) {
          usersData = users;
        }
      }
      
      // Merge user data with logs
      const mergedData = logsData?.map(log => {
        const user = usersData.find(u => u.id === log.user_id);
        console.log(`🔗 Merging log ${log.id} with user ${log.user_id}:`, user ? `${user.full_name} (${user.email})` : 'No user found');
        return {
          ...log,
          users: user || null
        };
      }) || [];

      console.log('✅ Fetched audit logs:', mergedData?.length || 0);
      setAuditLogs(mergedData || []);

      // Calculate statistics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const stats = {
        totalLogs: mergedData?.length || 0,
        todayLogs: mergedData?.filter((log: any) => new Date(log.created_at) >= today).length || 0,
        userActions: mergedData?.filter((log: any) => log.entity_type === 'user').length || 0,
        systemActions: mergedData?.filter((log: any) => log.entity_type === 'dashboard' || log.entity_type === 'system').length || 0,
        createActions: mergedData?.filter((log: any) => log.action === 'CREATE').length || 0,
        updateActions: mergedData?.filter((log: any) => log.action === 'UPDATE').length || 0,
        deleteActions: mergedData?.filter((log: any) => log.action === 'DELETE').length || 0
      };

      setStats(stats);

      // Log audit logs view for audit purposes
      try {
        await AuditLogger.logDashboardView('super_admin_audit_logs', AuditLogger.getCurrentUserId());
      } catch (auditError) {
        console.error('Error logging audit logs view:', auditError);
      }

    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.message || 'Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    
    // Set up real-time subscription for audit logs
    const subscription = supabase
      .channel('audit-logs-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'logs' },
        (payload) => {
          console.log('New audit log received:', payload);
          fetchAuditLogs(); // Refresh data when new audit logs are added
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRefresh = () => {
    fetchAuditLogs();
  };

  const handleExportLogs = async () => {
    try {
      // Log export action
      await AuditLogger.log({
        userId: AuditLogger.getCurrentUserId(),
        action: 'EXPORT',
        entityType: 'report',
        entityId: null,
        beforeState: null,
        afterState: {
          type: 'audit_logs_export',
          format: 'csv',
          total_records: auditLogs.length
        },
        metadata: {
          operation: 'audit_logs_export',
          exportedBy: AuditLogger.getCurrentUserId(),
          timestamp: new Date().toISOString()
        }
      });

      // Create CSV content
      const csvContent = [
        ['ID', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Session ID', 'Timestamp', 'Details'].join(','),
        ...auditLogs.map(log => [
          log.id,
          log.users?.full_name || 'Unknown',
          log.action,
          log.entity_type,
          log.entity_id || '',
          log.ip_address,
          log.metadata?.session_id || '',
          log.created_at,
          `"${log.description || ''}"`
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm);

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntityType = entityTypeFilter === 'all' || log.entity_type === entityTypeFilter;

    return matchesSearch && matchesAction && matchesEntityType;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'UPDATE': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'DELETE': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'VIEW': return <Eye className="h-4 w-4 text-gray-600" />;
      case 'LOGIN': return <User className="h-4 w-4 text-green-600" />;
      case 'LOGOUT': return <User className="h-4 w-4 text-gray-600" />;
      case 'EXPORT': return <Download className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'VIEW': return 'bg-gray-100 text-gray-800';
      case 'LOGIN': return 'bg-green-100 text-green-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      case 'EXPORT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const parseStateData = (stateData: any) => {
    if (!stateData) return null;
    if (typeof stateData === 'object') return stateData;
    try {
      return JSON.parse(stateData);
    } catch {
      return stateData;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Audit Logs</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Audit Logs</h1>
            <p className="text-gray-600">Comprehensive audit trail of all system operations</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayLogs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">User Actions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.userActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Actions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.systemActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="VIEW">View</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="EXPORT">Export</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
              <select
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="user">Users</option>
                <option value="customer">Customers</option>
                <option value="organization">Organizations</option>
                <option value="department">Departments</option>
                <option value="dashboard">Dashboard</option>
                <option value="report">Reports</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => {
                  const beforeState = parseStateData(log.metadata?.before_state);
                  const afterState = parseStateData(log.metadata?.after_state);
                  
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          {formatTimestamp(log.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {log.users?.full_name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {log.users?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getActionIcon(log.action)}
                          <div className={`ml-2 inline-flex items-center rounded-full font-medium px-2 py-1 text-xs ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{log.entity_type}</div>
                          {log.entity_id && (
                            <div className="text-gray-500">ID: {log.entity_id}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {beforeState && afterState ? (
                            <div className="text-xs">
                              <div className="text-red-600">Before: {JSON.stringify(beforeState).substring(0, 50)}...</div>
                              <div className="text-green-600">After: {JSON.stringify(afterState).substring(0, 50)}...</div>
                            </div>
                          ) : beforeState ? (
                            <div className="text-red-600 text-xs">Removed: {JSON.stringify(beforeState).substring(0, 50)}...</div>
                          ) : afterState ? (
                            <div className="text-green-600 text-xs">Added: {JSON.stringify(afterState).substring(0, 50)}...</div>
                          ) : (
                            <div className="text-gray-500 text-xs">No state changes</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No audit logs found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
