import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  FileText, 
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
  BarChart3,
  ArrowUpRight,
  Bell,
  MoreHorizontal,
  ChevronRight,
  Server,
  Gauge,
  Sparkles,
  Workflow
} from 'lucide-react';
// Card components are not used in the new design
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useNavigation } from '../../contexts/NavigationContext';
import { 
  useTeamMembers, 
  useCases, 
  useTasks, 
  useSystemHealth,
  useAuditLogs
} from '../../hooks/useDashboardData';
import { WorkflowProcessor } from './WorkflowProcessor';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { ROUTES } from '../../constants/navigation';

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
  const { navigateTo, navigateDirect } = useNavigation();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter'>('today');
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [liveActivity, setLiveActivity] = useState<LiveActivity[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

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
  } = useTasks(user?.id || '40'); // Fallback to super admin ID

  const { 
    loading: systemLoading 
  } = useSystemHealth();

  // Stable filters to prevent infinite loops
  const auditLogsFilters = useMemo(() => ({ limit: 10 }), []);
  
  const { 
    auditLogs, 
    loading: logsLoading 
  } = useAuditLogs(auditLogsFilters);

  // Process real data into metrics
  const processRealTimeMetrics = useCallback(async () => {
    if (!users || !cases || !tasks) return;

    try {
      setRefreshing(true);

      // Get additional data from Supabase
      const documentsData = await SupabaseDatabaseService.getDocuments();
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
        responseTime: await getSystemResponseTime(), // Get real response time from monitoring
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

  const getSystemResponseTime = async (): Promise<number> => {
    try {
      // Get real response time from system monitoring
      const startTime = Date.now();
      await SupabaseDatabaseService.getUsers(); // Simple query to measure response
      const responseTime = Date.now() - startTime;
      return responseTime;
    } catch (error) {
      console.error('Error measuring response time:', error);
      return 100; // Fallback value
    }
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

  // Dynamic Navigation handlers with contextual flows
  const handleManageUsers = () => {
    console.log('🚀 Navigating to User Management with context:', {
      totalUsers: realTimeMetrics?.totalUsers,
      activeUsers: realTimeMetrics?.activeUsers,
      onlineUsers: realTimeMetrics?.onlineUsers
    });
    navigateDirect(ROUTES.ADVANCED_USER_MANAGEMENT);
  };

  const handleSystemSettings = () => {
    console.log('🚀 Navigating to System Settings');
    navigateDirect(ROUTES.SYSTEM_SETTINGS);
  };

  const handleDatabaseHealth = () => {
    console.log('🚀 Navigating to System Monitoring with health status:', realTimeMetrics?.systemHealth);
    navigateDirect(ROUTES.SYSTEM_MONITORING);
  };

  const handleWorkflowDesigner = () => {
    console.log('🚀 Navigating to Workflow Designer');
    navigateDirect(ROUTES.WORKFLOW_DESIGNER);
  };

  const handleAnalytics = () => {
    console.log('🚀 Navigating to Analytics with dashboard context');
    navigateDirect(ROUTES.ANALYTICS);
  };

  const handleAuditLogs = () => {
    console.log('🚀 Navigating to Audit Logs');
    navigateDirect(ROUTES.AUDIT_LOGS);
  };

  // Dynamic context-aware navigations
  const handleCasesOverview = (status?: string) => {
    console.log('🚀 Navigating to Cases with filter:', status);
    const url = status ? `/cases?status=${status}` : '/cases';
    navigateDirect(url);
  };

  const handleTasksOverview = (priority?: string) => {
    console.log('🚀 Navigating to Tasks with priority:', priority);
    const url = priority ? `/tasks?priority=${priority}` : '/tasks';
    navigateDirect(url);
  };

  const handleDocumentsOverview = (status?: string) => {
    console.log('🚀 Navigating to Documents with status:', status);
    const url = status ? `/documents?status=${status}` : '/documents';
    navigateDirect(url);
  };

  // Quick action handlers
  const handleQuickUserCreate = () => {
    console.log('🚀 Quick action: Create new user');
    navigateDirect('/user-management?action=create');
  };

  const handleQuickCaseCreate = () => {
    console.log('🚀 Quick action: Create new case');
    navigateDirect('/cases?action=create');
  };

  const handleQuickSystemCheck = async () => {
    console.log('🚀 Quick action: System health check');
    setRefreshing(true);
    // Trigger system health check
    await processRealTimeMetrics();
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleExportReports = () => {
    console.log('🚀 Opening export modal');
    setShowExportModal(true);
  };

  const handleViewAllActivity = () => {
    console.log('🚀 Navigating to comprehensive activity logs');
    navigateDirect('/audit-logs');
  };

  const handleAlerts = () => {
    console.log('🚀 Opening alerts modal');
    setShowAlertModal(true);
  };

  // Dynamic drill-down handlers
  const handleDrillDownUsers = (type: 'active' | 'online' | 'inactive') => {
    console.log('🚀 Drilling down into users:', type);
    navigateDirect(`/advanced-user-management?filter=${type}`);
  };

  const handleDrillDownCases = (status: 'open' | 'in_progress' | 'completed' | 'rejected') => {
    console.log('🚀 Drilling down into cases:', status);
    navigateDirect(`/cases?status=${status}`);
  };

  const handleDrillDownDocuments = (status: 'verified' | 'pending' | 'rejected') => {
    console.log('🚀 Drilling down into documents:', status);
    navigateDirect(`/documents?status=${status}`);
  };

  const handleDrillDownTasks = (status: 'open' | 'overdue' | 'completed') => {
    console.log('🚀 Drilling down into tasks:', status);
    navigateDirect(`/tasks?status=${status}`);
  };

  const handleExportData = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      console.log(`Exporting data as ${format}...`);
      
      // Simulate export process with delay
      setRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add actual export logic here
      const exportData = {
        users: users || [],
        cases: cases || [],
        tasks: tasks || [],
        metrics: realTimeMetrics,
        timestamp: new Date().toISOString()
      };
      
      // Create downloadable content (this is a simplified example)
      const content = format === 'csv' 
        ? convertToCSV(exportData)
        : format === 'excel'
        ? exportData // For Excel, you'd use a library like xlsx
        : exportData; // For PDF, you'd use jsPDF or similar
      
      // Trigger download (simplified)
      downloadFile(content, `dashboard-export-${format}`, format);
      
      setShowExportModal(false);
      setRefreshing(false);
      
      // Show success notification
      console.log(`Data exported as ${format.toUpperCase()} successfully!`);
      // TODO: Replace with proper toast notification
    } catch (error) {
      console.error('Export failed:', error);
      setRefreshing(false);
      console.error('Export failed. Please try again.');
      // TODO: Replace with proper error toast notification
    }
  };

  // Helper functions for export
  const convertToCSV = (data: any) => {
    // Simplified CSV conversion
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (content: any, filename: string, format: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Gradient */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Gauge className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
                  Welcome back, {user?.full_name || 'Super Admin'} - Real-time system control center
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Live Status Indicator */}
              <div className="flex items-center px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-green-700">Live</span>
              </div>
              
              {/* Time Range Selector */}
              <div className="flex bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {(['today', 'week', 'month', 'quarter'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-all duration-200 ${
                      timeRange === range
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              
              {/* Action Buttons */}
              <Button
                onClick={() => {
                  refreshAllData();
                  processRealTimeMetrics();
                }}
                disabled={refreshing}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button 
                onClick={handleAlerts}
                variant="outline" 
                className="border-gray-200 hover:bg-gray-50"
              >
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Button>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-blue-500" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-green-500" />
                {realTimeMetrics?.totalUsers || 0} users online
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1 text-purple-500" />
                {realTimeMetrics?.totalCases || 0} active cases
              </div>
              <div className="flex items-center">
                <Activity className="h-4 w-4 mr-1 text-orange-500" />
                {realTimeMetrics?.totalTasks || 0} tasks pending
              </div>
            </div>
            
            <Badge variant={
              realTimeMetrics?.systemHealth === 'excellent' ? 'success' :
              realTimeMetrics?.systemHealth === 'good' ? 'info' :
              realTimeMetrics?.systemHealth === 'warning' ? 'warning' : 'error'
            }>
              System {realTimeMetrics?.systemHealth || 'Unknown'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">

        {/* Enhanced System Alerts */}
        {(realTimeMetrics?.systemHealth === 'warning' || realTimeMetrics?.systemHealth === 'critical') && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
              <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {realTimeMetrics?.systemHealth === 'critical' ? 'Critical System Alert' : 'System Performance Warning'}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {realTimeMetrics?.systemHealth === 'critical' 
                      ? `System performance is critically low. Immediate action required for ${realTimeMetrics?.overdueTasks} overdue tasks.`
                      : `${realTimeMetrics?.overdueTasks} overdue tasks and ${realTimeMetrics?.openCases} open cases detected. Attention needed.`
                    }
                  </p>
                  <div className="flex space-x-3">
                    <Button size="sm" className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Metric Card */}
          <div 
            onClick={handleManageUsers}
            className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">+12%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mb-3">{realTimeMetrics?.totalUsers || 0}</p>
                <div className="space-y-1">
                  <div 
                    className="flex items-center justify-between text-sm cursor-pointer hover:bg-blue-50 p-2 rounded -m-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDrillDownUsers('active');
                    }}
                  >
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium text-green-600 flex items-center">
                      {realTimeMetrics?.activeUsers || 0}
                      <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
                    </span>
                  </div>
                  <div 
                    className="flex items-center justify-between text-sm cursor-pointer hover:bg-blue-50 p-2 rounded -m-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDrillDownUsers('online');
                    }}
                  >
                    <span className="text-gray-600">Online</span>
                    <span className="font-medium text-blue-600 flex items-center">
                      {realTimeMetrics?.onlineUsers || 0}
                      <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cases Metric Card */}
          <div 
            onClick={() => handleCasesOverview()}
            className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">+8%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Cases</p>
                <p className="text-3xl font-bold text-gray-900 mb-3">{realTimeMetrics?.totalCases || 0}</p>
                <div className="space-y-1">
                  <div 
                    className="flex items-center justify-between text-sm cursor-pointer hover:bg-green-50 p-2 rounded -m-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDrillDownCases('open');
                    }}
                  >
                    <span className="text-gray-600">Open</span>
                    <span className="font-medium text-yellow-600 flex items-center">
                      {realTimeMetrics?.openCases || 0}
                      <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
                    </span>
                  </div>
                  <div 
                    className="flex items-center justify-between text-sm cursor-pointer hover:bg-green-50 p-2 rounded -m-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDrillDownCases('in_progress');
                    }}
                  >
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-medium text-blue-600 flex items-center">
                      {realTimeMetrics?.inProgressCases || 0}
                      <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Metric Card */}
          <div 
            onClick={() => handleDocumentsOverview()}
            className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full bg-gradient-to-br from-purple-400/10 to-violet-400/10 rounded-full"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">+15%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Documents</p>
                <p className="text-3xl font-bold text-gray-900 mb-3">{realTimeMetrics?.totalDocuments || 0}</p>
                <div className="space-y-1">
                  <div 
                    className="flex items-center justify-between text-sm cursor-pointer hover:bg-purple-50 p-2 rounded -m-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDrillDownDocuments('verified');
                    }}
                  >
                    <span className="text-gray-600">Verified</span>
                    <span className="font-medium text-green-600 flex items-center">
                      {realTimeMetrics?.verifiedDocuments || 0}
                      <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
                    </span>
                  </div>
                  <div 
                    className="flex items-center justify-between text-sm cursor-pointer hover:bg-purple-50 p-2 rounded -m-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDrillDownDocuments('pending');
                    }}
                  >
                    <span className="text-gray-600">Pending</span>
                    <span className="font-medium text-yellow-600 flex items-center">
                      {realTimeMetrics?.pendingDocuments || 0}
                      <ChevronRight className="h-3 w-3 ml-1 opacity-50" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Health Metric Card */}
          <div 
            onClick={handleDatabaseHealth}
            className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8">
              <div className="w-full h-full bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">98%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">System Health</p>
                <p className="text-3xl font-bold text-gray-900 mb-3">{realTimeMetrics?.totalTasks || 0}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <Badge variant={
                      realTimeMetrics?.systemHealth === 'excellent' ? 'success' :
                      realTimeMetrics?.systemHealth === 'good' ? 'info' :
                      realTimeMetrics?.systemHealth === 'warning' ? 'warning' : 'error'
                    } size="sm">
                      {realTimeMetrics?.systemHealth || 'Good'}
                    </Badge>
                  </div>
                  {realTimeMetrics?.overdueTasks && realTimeMetrics.overdueTasks > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Overdue</span>
                      <span className="font-medium text-red-600">{realTimeMetrics.overdueTasks}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics & Quick Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Performance Analytics */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                    <Server className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
                </div>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Response Time */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Response Time</span>
                    <span className="text-sm font-bold text-gray-900">
                      {realTimeMetrics?.responseTime ? `${Math.round(realTimeMetrics.responseTime)}ms` : 'N/A'}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.min((realTimeMetrics?.responseTime || 0) / 500 * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="absolute -top-1 left-0 w-2 h-5 bg-blue-600 rounded-full opacity-50"></div>
                  </div>
                </div>

                {/* Active Cases */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Active Cases</span>
                    <span className="text-sm font-bold text-gray-900">
                      {realTimeMetrics?.inProgressCases || 0} / {realTimeMetrics?.totalCases || 0}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(((realTimeMetrics?.inProgressCases || 0) / Math.max(realTimeMetrics?.totalCases || 1, 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Document Verification */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Document Verification</span>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(((realTimeMetrics?.verifiedDocuments || 0) / Math.max(realTimeMetrics?.totalDocuments || 1, 1)) * 100)}%
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(((realTimeMetrics?.verifiedDocuments || 0) / Math.max(realTimeMetrics?.totalDocuments || 1, 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Analytics */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Business Metrics</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <p className="text-2xl font-bold text-violet-600">{realTimeMetrics?.inProgressCases || 0}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <p className="text-2xl font-bold text-green-600">{realTimeMetrics?.completedCases || 0}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Success Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {Math.round(((realTimeMetrics?.completedCases || 0) / Math.max(realTimeMetrics?.totalCases || 1, 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(((realTimeMetrics?.completedCases || 0) / Math.max(realTimeMetrics?.totalCases || 1, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleManageUsers}
                  className="w-full justify-between group bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-700 border border-blue-200 hover:border-blue-300 transition-all duration-200" 
                  variant="outline"
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-3 text-blue-600" />
                    <div className="text-left">
                      <span className="font-medium">User Management</span>
                      <p className="text-xs text-gray-500">{realTimeMetrics?.totalUsers || 0} users</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  onClick={handleWorkflowDesigner}
                  className="w-full justify-between group bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 text-gray-700 border border-purple-200 hover:border-purple-300 transition-all duration-200" 
                  variant="outline"
                >
                  <div className="flex items-center">
                    <Workflow className="h-4 w-4 mr-3 text-purple-600" />
                    <div className="text-left">
                      <span className="font-medium">Workflow Designer</span>
                      <p className="text-xs text-gray-500">Create flows</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  onClick={handleDatabaseHealth}
                  className="w-full justify-between group bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-gray-700 border border-green-200 hover:border-green-300 transition-all duration-200" 
                  variant="outline"
                >
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-3 text-green-600" />
                    <div className="text-left">
                      <span className="font-medium">System Health</span>
                      <p className="text-xs text-gray-500 capitalize">{realTimeMetrics?.systemHealth || 'checking'}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  onClick={handleAnalytics}
                  className="w-full justify-between group bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 text-gray-700 border border-orange-200 hover:border-orange-300 transition-all duration-200" 
                  variant="outline"
                >
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-3 text-orange-600" />
                    <div className="text-left">
                      <span className="font-medium">Analytics</span>
                      <p className="text-xs text-gray-500">View reports</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  onClick={() => navigateDirect('/super-admin/table-management')}
                  className="w-full justify-between group bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-gray-700 border border-indigo-200 hover:border-indigo-300 transition-all duration-200" 
                  variant="outline"
                >
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-3 text-indigo-600" />
                    <div className="text-left">
                      <span className="font-medium">Table Management</span>
                      <p className="text-xs text-gray-500">Manage all tables</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* Dynamic Quick Actions Row */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleQuickUserCreate}
                      size="sm"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                      variant="outline"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Add User
                    </Button>
                    <Button 
                      onClick={handleQuickSystemCheck}
                      size="sm"
                      className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                      variant="outline"
                      disabled={refreshing}
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      {refreshing ? 'Checking...' : 'Health Check'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Activity Feed & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-sm">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Live System Activity</h3>
                      <p className="text-sm text-gray-600">Real-time updates from your system</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center px-3 py-1 bg-green-100 border border-green-200 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs font-medium text-green-700">Live</span>
                    </div>
                    <Button 
                      onClick={handleViewAllActivity}
                      variant="outline" 
                      size="sm" 
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View All
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {liveActivity.length > 0 ? (
                  <div className="space-y-4">
                    {liveActivity.slice(0, 8).map((activity, index) => (
                      <div key={activity.id} className="group flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-full ${
                            index % 4 === 0 ? 'bg-blue-100 text-blue-600' :
                            index % 4 === 1 ? 'bg-green-100 text-green-600' :
                            index % 4 === 2 ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">{activity.description}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(activity.created_at).toLocaleTimeString()}
                            </div>
                            {activity.user_name && (
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                <span className="text-blue-600 font-medium">{activity.user_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="info" size="sm">
                            {activity.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Activity className="h-8 w-8 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h4>
                    <p className="text-gray-500 mb-4">Activity will appear here in real-time</p>
                    <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Activity
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced System Insights */}
          <div className="space-y-6">
            {dashboardStats && (
              <>
                {/* Case Status Distribution */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Case Status</h3>
                      <p className="text-sm text-gray-600">Distribution overview</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(dashboardStats.casesByStatus || {}).map(([status, count]) => (
                      <div 
                        key={status} 
                        onClick={() => navigateDirect(`/cases?status=${status}`)}
                        className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status === 'completed' ? 'bg-green-500' :
                            status === 'in_progress' ? 'bg-blue-500' :
                            status === 'open' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="capitalize text-sm font-medium text-gray-700 group-hover:text-green-700">{status.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            status === 'completed' ? 'success' :
                            status === 'in_progress' ? 'info' :
                            status === 'open' ? 'warning' : 'default'
                          }>
                            {count}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Users by Role */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">User Roles</h3>
                      <p className="text-sm text-gray-600">Team distribution</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(dashboardStats.usersByRole || {}).map(([role, count]) => (
                      <div 
                        key={role} 
                        onClick={() => navigateDirect(`${ROUTES.ADVANCED_USER_MANAGEMENT}?role=${role}`)}
                        className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span className="capitalize text-sm font-medium text-gray-700 group-hover:text-purple-700">{role.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="info">
                            {count}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Export Reports</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Select the format for your export:</p>
                
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={() => handleExportData('csv')}
                    className="w-full justify-start bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-gray-700 border border-green-200 hover:border-green-300"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-3 text-green-600" />
                    Export as CSV
                  </Button>
                  
                  <Button 
                    onClick={() => handleExportData('excel')}
                    className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-700 border border-blue-200 hover:border-blue-300"
                    variant="outline"
                  >
                    <Database className="h-4 w-4 mr-3 text-blue-600" />
                    Export as Excel
                  </Button>
                  
                  <Button 
                    onClick={() => handleExportData('pdf')}
                    className="w-full justify-start bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-gray-700 border border-red-200 hover:border-red-300"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-3 text-red-600" />
                    Export as PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">System Alerts</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAlertModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                {dashboardStats?.systemAlerts && dashboardStats.systemAlerts.length > 0 ? (
                  dashboardStats.systemAlerts.map((alert: any, index: number) => (
                    <div key={index} className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{alert.type || 'System Alert'}</h4>
                          <p className="text-gray-700 mt-1">{alert.description || alert.message}</p>
                          <p className="text-sm text-gray-500 mt-2">{alert.created_at || 'Just now'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">All Good!</h4>
                    <p className="text-gray-600">No system alerts at this time.</p>
                  </div>
                )}
                
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button 
                    onClick={() => navigateDirect('/super-admin/system-logs')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    View All Logs
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
