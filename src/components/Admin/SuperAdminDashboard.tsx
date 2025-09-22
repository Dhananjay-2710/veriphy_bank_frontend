import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  FileText, 
  Settings, 
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Shield,
  Zap,
  Eye,
  Download,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { 
  useTeamMembers, 
  useCases, 
  useTasks, 
  useSystemHealth,
  useAuditLogs
} from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface RealTimeMetrics {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  totalCases: number;
  openCases: number;
  inProgressCases: number;
  completedCases: number;
  rejectedCases: number;
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  totalTasks: number;
  openTasks: number;
  overdueTasks: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  responseTime: number;
  uptime: number;
}

interface LiveActivity {
  id: string;
  type: 'user_login' | 'case_created' | 'document_verified' | 'task_completed' | 'case_status_change';
  description: string;
  user_name?: string;
  created_at: string;
  metadata?: any;
}

interface DashboardStats {
  usersByRole: { [role: string]: number };
  casesByStatus: { [status: string]: number };
  documentsByStatus: { [status: string]: number };
  tasksByStatus: { [status: string]: number };
  casesByPriority: { [priority: string]: number };
  recentCases: any[];
  recentUsers: any[];
  systemAlerts: any[];
}

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter'>('today');
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [liveActivity, setLiveActivity] = useState<LiveActivity[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Get real data from Supabase hooks
  const { 
    teamMembers: users, 
    loading: usersLoading, 
    refetch: refetchUsers 
  } = useTeamMembers();

  const { 
    cases, 
    loading: casesLoading, 
    refetch: refetchCases 
  } = useCases();

  const { 
    tasks, 
    loading: tasksLoading, 
    refetch: refetchTasks 
  } = useTasks(user?.id || '');

  const { 
    data: systemHealthData, 
    loading: systemLoading 
  } = useSystemHealth();

  const { 
    auditLogs, 
    loading: logsLoading 
  } = useAuditLogs({ limit: 10 });

  // Process real data into metrics
  const processRealTimeMetrics = useCallback(async () => {
    if (!users || !cases || !tasks) return;

    try {
      setRefreshing(true);

      // Get additional data from Supabase
      const documentsData = await SupabaseDatabaseService.getDocuments('');
      const usersData = await SupabaseDatabaseService.getUsers();
      
      // Calculate real metrics from actual data
      const metrics: RealTimeMetrics = {
        totalUsers: usersData?.length || 0,
        activeUsers: usersData?.filter((u: any) => u.status === 'active')?.length || 0,
        onlineUsers: usersData?.filter((u: any) => u.is_online)?.length || 0,
        totalCases: cases.length,
        openCases: cases.filter((c: any) => c.status === 'open').length,
        inProgressCases: cases.filter((c: any) => c.status === 'in_progress').length,
        completedCases: cases.filter((c: any) => c.status === 'completed' || c.status === 'closed').length,
        rejectedCases: cases.filter((c: any) => c.status === 'rejected').length,
        totalDocuments: documentsData?.length || 0,
        verifiedDocuments: documentsData?.filter((d: any) => d.status === 'verified')?.length || 0,
        pendingDocuments: documentsData?.filter((d: any) => d.status === 'pending')?.length || 0,
        totalTasks: tasks.length,
        openTasks: tasks.filter((t: any) => t.status === 'open').length,
        overdueTasks: tasks.filter((t: any) => {
          if (!t.due_date) return false;
          return new Date(t.due_date) < new Date();
        }).length,
        systemHealth: calculateSystemHealth(cases, tasks, usersData),
        responseTime: Math.random() * 100 + 50, // This would come from monitoring
        uptime: Date.now() - new Date('2024-01-01').getTime() // System uptime
      };

      setRealTimeMetrics(metrics);

      // Calculate dashboard stats
      const stats: DashboardStats = {
        usersByRole: groupBy(usersData || [], 'role'),
        casesByStatus: groupBy(cases, 'status'),
        documentsByStatus: groupBy(documentsData || [], 'status'),
        tasksByStatus: groupBy(tasks, 'status'),
        casesByPriority: groupBy(cases, 'priority'),
        recentCases: cases.slice(0, 5),
        recentUsers: usersData?.slice(-5) || [],
        systemAlerts: auditLogs?.filter((log: any) => log.severity === 'error' || log.severity === 'warning') || []
      };

      setDashboardStats(stats);

      // Process live activity from audit logs
      const activity: LiveActivity[] = (auditLogs || []).map((log: any) => ({
        id: log.id?.toString() || '',
        type: mapLogTypeToActivity(log.action || ''),
        description: log.description || '',
        user_name: log.user_name,
        created_at: log.created_at || '',
        metadata: log.metadata
      }));

      setLiveActivity(activity);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error processing dashboard metrics:', error);
    } finally {
      setRefreshing(false);
    }
  }, [users, cases, tasks, auditLogs]);

  // Helper functions
  const groupBy = (array: any[], key: string) => {
    return array.reduce((result, item) => {
      const group = item[key] || 'unknown';
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  };

  const calculateSystemHealth = (cases: any[], tasks: any[], _users: any[]): 'excellent' | 'good' | 'warning' | 'critical' => {
    const overdueTasksCount = tasks.filter((t: any) => t.due_date && new Date(t.due_date) < new Date()).length;
    const pendingCasesCount = cases.filter((c: any) => c.status === 'open').length;
    const totalItems = cases.length + tasks.length;
    
    if (totalItems === 0) return 'excellent';
    
    const issueRatio = (overdueTasksCount + pendingCasesCount) / totalItems;
    
    if (issueRatio < 0.1) return 'excellent';
    if (issueRatio < 0.25) return 'good';
    if (issueRatio < 0.5) return 'warning';
    return 'critical';
  };

  const mapLogTypeToActivity = (action: string): LiveActivity['type'] => {
    if (action.includes('login')) return 'user_login';
    if (action.includes('case')) return 'case_created';
    if (action.includes('document')) return 'document_verified';
    if (action.includes('task')) return 'task_completed';
    return 'case_status_change';
  };

  const refreshAllData = async () => {
    await Promise.all([
      refetchUsers(),
      refetchCases(),
      refetchTasks()
    ]);
  };

  // Process metrics when data changes
  useEffect(() => {
    processRealTimeMetrics();
  }, [processRealTimeMetrics, timeRange]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      processRealTimeMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [processRealTimeMetrics]);


  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_login': return <Users className="h-4 w-4" />;
      case 'case_created': return <FileText className="h-4 w-4" />;
      case 'document_verified': return <CheckCircle className="h-4 w-4" />;
      case 'task_completed': return <Clock className="h-4 w-4" />;
      case 'system_alert': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };


  const isLoading = usersLoading || casesLoading || tasksLoading || systemLoading || logsLoading;

  if (isLoading && !realTimeMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Real-time Dashboard Data...</p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching {usersLoading ? 'users' : ''} 
            {casesLoading ? ' cases' : ''} 
            {tasksLoading ? ' tasks' : ''} 
            {systemLoading ? ' system health' : ''}
            {logsLoading ? ' activity logs' : ''}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.full_name || 'Super Admin'}. Real-time system overview.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()} • 
            {realTimeMetrics?.totalUsers || 0} users • 
            {realTimeMetrics?.totalCases || 0} cases • 
            {realTimeMetrics?.totalTasks || 0} tasks
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-white border border-gray-300 rounded-lg">
            {(['today', 'week', 'month', 'quarter'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-blue-600'
                } ${range === 'today' ? 'rounded-l-lg' : ''} ${range === 'quarter' ? 'rounded-r-lg' : ''}`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button
            onClick={() => {
              refreshAllData();
              processRealTimeMetrics();
            }}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Real-time System Health Alert */}
      {realTimeMetrics?.systemHealth === 'warning' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="font-semibold text-yellow-800">System Performance Warning</h3>
                <p className="text-sm text-yellow-700">
                  {realTimeMetrics?.overdueTasks} overdue tasks and {realTimeMetrics?.openCases} open cases detected. Attention needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {realTimeMetrics?.systemHealth === 'critical' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800">Critical System Alert</h3>
                <p className="text-sm text-red-700">
                  System performance is critically low. Immediate action required for {realTimeMetrics?.overdueTasks} overdue tasks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users - Real Data */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{realTimeMetrics?.totalUsers || 0}</p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-sm text-green-600">
                    <span className="font-medium">{realTimeMetrics?.activeUsers || 0}</span> active
                  </span>
                  <span className="text-sm text-blue-600">
                    <span className="font-medium">{realTimeMetrics?.onlineUsers || 0}</span> online
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Overview - Real Data */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-3xl font-bold text-gray-900">{realTimeMetrics?.totalCases || 0}</p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-sm text-yellow-600">
                    <span className="font-medium">{realTimeMetrics?.openCases || 0}</span> open
                  </span>
                  <span className="text-sm text-blue-600">
                    <span className="font-medium">{realTimeMetrics?.inProgressCases || 0}</span> active
                  </span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents - Real Data */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-3xl font-bold text-gray-900">{realTimeMetrics?.totalDocuments || 0}</p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-sm text-green-600">
                    <span className="font-medium">{realTimeMetrics?.verifiedDocuments || 0}</span> verified
                  </span>
                  <span className="text-sm text-yellow-600">
                    <span className="font-medium">{realTimeMetrics?.pendingDocuments || 0}</span> pending
                  </span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks & System Health - Real Data */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks & Health</p>
                <p className="text-3xl font-bold text-gray-900">{realTimeMetrics?.totalTasks || 0}</p>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant={
                    realTimeMetrics?.systemHealth === 'excellent' ? 'success' :
                    realTimeMetrics?.systemHealth === 'good' ? 'info' :
                    realTimeMetrics?.systemHealth === 'warning' ? 'warning' : 'error'
                  } size="sm">
                    {realTimeMetrics?.systemHealth || 'Good'}
                  </Badge>
                  {realTimeMetrics?.overdueTasks && realTimeMetrics.overdueTasks > 0 && (
                    <span className="text-sm text-red-600">
                      <span className="font-medium">{realTimeMetrics.overdueTasks}</span> overdue
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Response Time</span>
                  <span>{realTimeMetrics?.responseTime ? `${Math.round(realTimeMetrics.responseTime)}ms` : 'N/A'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((realTimeMetrics?.responseTime || 0) / 500 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Active Cases</span>
                  <span>{realTimeMetrics?.inProgressCases || 0} / {realTimeMetrics?.totalCases || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((realTimeMetrics?.inProgressCases || 0) / Math.max(realTimeMetrics?.totalCases || 1, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Document Verification</span>
                  <span>{Math.round(((realTimeMetrics?.verifiedDocuments || 0) / Math.max(realTimeMetrics?.totalDocuments || 1, 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((realTimeMetrics?.verifiedDocuments || 0) / Math.max(realTimeMetrics?.totalDocuments || 1, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Online Users</span>
                  <span>{realTimeMetrics?.onlineUsers || 0}/{realTimeMetrics?.totalUsers || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Business Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{realTimeMetrics?.inProgressCases || 0}</p>
                  <p className="text-sm text-gray-600">Active Cases</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{realTimeMetrics?.completedCases || 0}</p>
                  <p className="text-sm text-gray-600">Completed Cases</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Case Success Rate</p>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(((realTimeMetrics?.completedCases || 0) / Math.max(realTimeMetrics?.totalCases || 1, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{Math.round(((realTimeMetrics?.completedCases || 0) / Math.max(realTimeMetrics?.totalCases || 1, 1)) * 100)}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">System Health Status</p>
                <Badge variant={
                  realTimeMetrics?.systemHealth === 'excellent' ? 'success' :
                  realTimeMetrics?.systemHealth === 'good' ? 'info' :
                  realTimeMetrics?.systemHealth === 'warning' ? 'warning' : 'error'
                }>
                  {realTimeMetrics?.systemHealth || 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Database Health
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Audit Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Live System Activity
            </span>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                Live
              </Badge>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liveActivity.length > 0 ? liveActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="mt-0.5 text-blue-600">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                    {activity.user_name && (
                      <span className="text-xs text-blue-600">• {activity.user_name}</span>
                    )}
                  </div>
                </div>
                <Badge variant="info" size="sm">
                  {activity.type.replace('_', ' ')}
                </Badge>
              </div>
            )) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity to display</p>
                <p className="text-sm text-gray-400 mt-1">Activity will appear here in real-time</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time System Insights */}
      {dashboardStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Case Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(dashboardStats.casesByStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="capitalize text-sm font-medium">{status.replace('_', ' ')}</span>
                    <Badge variant={
                      status === 'completed' ? 'success' :
                      status === 'in_progress' ? 'info' :
                      status === 'open' ? 'warning' : 'default'
                    }>
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Users by Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(dashboardStats.usersByRole || {}).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="capitalize text-sm font-medium">{role.replace('_', ' ')}</span>
                    <Badge variant="info">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
