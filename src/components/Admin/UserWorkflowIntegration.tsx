import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail, 
  Phone, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  ArrowRight,
  FileText,
  Briefcase,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  MessageCircle,
  Settings,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useNavigation } from '../../contexts/NavigationContext';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface UserWorkflowIntegrationProps {
  userId?: string;
  onUserSelected?: (userId: string) => void;
  onUserUpdated?: (userId: string) => void;
  onUserDeleted?: (userId: string) => void;
}

interface UserActivity {
  id: string;
  type: 'case_assigned' | 'case_completed' | 'document_verified' | 'task_created' | 'login' | 'profile_updated';
  description: string;
  timestamp: string;
  metadata?: any;
}

interface UserPerformance {
  casesAssigned: number;
  casesCompleted: number;
  documentsVerified: number;
  tasksCompleted: number;
  avgResponseTime: number;
  completionRate: number;
  lastActivity: string;
}

interface UserWorkflow {
  currentCases: any[];
  pendingTasks: any[];
  recentActivity: UserActivity[];
  performance: UserPerformance;
  permissions: string[];
  department: string;
  manager?: string;
}

export function UserWorkflowIntegration({ 
  userId, 
  onUserSelected,
  onUserUpdated,
  onUserDeleted
}: UserWorkflowIntegrationProps) {
  const { user: currentUser } = useAuth();
  const { navigateDirect } = useNavigation();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userWorkflow, setUserWorkflow] = useState<UserWorkflow | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUsersAndWorkflow();
  }, [userId]);

  const fetchUsersAndWorkflow = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all users
      const users = await SupabaseDatabaseService.getUsers();
      setAllUsers(users);

      // If specific user ID provided, fetch their workflow
      if (userId) {
        const user = users.find(u => u.id === userId);
        setSelectedUser(user);
        
        if (user) {
          const workflow = await fetchUserWorkflow(user);
          setUserWorkflow(workflow);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user workflow');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWorkflow = async (user: any): Promise<UserWorkflow> => {
    try {
      // Fetch user's cases
      const cases = await SupabaseDatabaseService.getCasesByUserId(user.id);
      
      // Fetch user's tasks
      const tasks = await SupabaseDatabaseService.getTasksByUserId(user.id);
      
      // Fetch user's recent activity
      const activity = await SupabaseDatabaseService.getUserActivity(user.id);
      
      // Calculate performance metrics
      const performance = await calculateUserPerformance(user.id, cases, tasks);
      
      // Get user permissions and department
      const permissions = await SupabaseDatabaseService.getUserPermissions(user.id);
      const department = await SupabaseDatabaseService.getUserDepartment(user.id);
      
      return {
        currentCases: cases.filter(c => ['open', 'in_progress'].includes(c.status)),
        pendingTasks: tasks.filter(t => ['open', 'in_progress'].includes(t.status)),
        recentActivity: activity,
        performance,
        permissions,
        department: department?.name || 'Unknown',
        manager: department?.manager_name
      };
    } catch (err) {
      console.error('Error fetching user workflow:', err);
      return {
        currentCases: [],
        pendingTasks: [],
        recentActivity: [],
        performance: {
          casesAssigned: 0,
          casesCompleted: 0,
          documentsVerified: 0,
          tasksCompleted: 0,
          avgResponseTime: 0,
          completionRate: 0,
          lastActivity: new Date().toISOString()
        },
        permissions: [],
        department: 'Unknown'
      };
    }
  };

  const calculateUserPerformance = async (userId: string, cases: any[], tasks: any[]): Promise<UserPerformance> => {
    const completedCases = cases.filter(c => c.status === 'completed' || c.status === 'approved');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    // Calculate average response time (simplified)
    const avgResponseTime = tasks.length > 0 ? 
      tasks.reduce((acc, task) => acc + (task.response_time || 0), 0) / tasks.length : 0;
    
    const completionRate = cases.length > 0 ? 
      (completedCases.length / cases.length) * 100 : 0;

    return {
      casesAssigned: cases.length,
      casesCompleted: completedCases.length,
      documentsVerified: 0, // Would need to query documents table
      tasksCompleted: completedTasks.length,
      avgResponseTime: Math.round(avgResponseTime),
      completionRate: Math.round(completionRate),
      lastActivity: new Date().toISOString()
    };
  };

  const handleUserAction = async (action: string, targetUser: any) => {
    if (!currentUser || !targetUser) return;

    setProcessing(`${action}_${targetUser.id}`);
    try {
      switch (action) {
        case 'activate':
          await SupabaseDatabaseService.updateUser(targetUser.id, { status: 'active' });
          break;
        case 'deactivate':
          await SupabaseDatabaseService.updateUser(targetUser.id, { status: 'inactive' });
          break;
        case 'reset_password':
          await SupabaseDatabaseService.resetUserPassword(targetUser.id);
          break;
        case 'assign_cases':
          navigateDirect(`/cases?assigned_to=${targetUser.id}`);
          break;
        case 'view_performance':
          setSelectedUser(targetUser);
          const workflow = await fetchUserWorkflow(targetUser);
          setUserWorkflow(workflow);
          setActiveTab('performance');
          break;
        case 'send_message':
          navigateDirect(`/communicator?user=${targetUser.id}`);
          break;
        case 'update_permissions':
          navigateDirect(`/user-management?user=${targetUser.id}&action=permissions`);
          break;
      }

      onUserUpdated?.(targetUser.id);
      await fetchUsersAndWorkflow();

    } catch (err) {
      console.error('User action failed:', err);
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setProcessing(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'super_admin': 'bg-red-100 text-red-800 border-red-200',
      'admin': 'bg-purple-100 text-purple-800 border-purple-200',
      'manager': 'bg-blue-100 text-blue-800 border-blue-200',
      'salesperson': 'bg-green-100 text-green-800 border-green-200',
      'credit-ops': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'compliance': 'bg-orange-100 text-orange-800 border-orange-200',
      'auditor': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'inactive': return <Badge variant="error">Inactive</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading user workflow...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={fetchUsersAndWorkflow} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Workflow Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{allUsers.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {allUsers.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {allUsers.filter(u => u.last_login_at && 
                  new Date(u.last_login_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-gray-600">Inactive (7+ days)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {userWorkflow?.performance.completionRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Completion</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigateDirect('/user-management?action=create')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateDirect('/user-management?action=bulk')}
            >
              <Users className="h-4 w-4 mr-2" />
              Bulk Operations
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateDirect('/user-management?action=import')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Import Users
            </Button>
            <Button
              variant="outline"
              onClick={fetchUsersAndWorkflow}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{user.full_name}</h3>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><Mail className="h-3 w-3 inline mr-1" />{user.email}</p>
                        <p><Phone className="h-3 w-3 inline mr-1" />{user.mobile || 'N/A'}</p>
                        {user.department && (
                          <p><Briefcase className="h-3 w-3 inline mr-1" />{user.department}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user);
                        fetchUserWorkflow(user).then(setUserWorkflow);
                        setActiveTab('overview');
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserAction('view_performance', user)}
                      disabled={processing === `view_performance_${user.id}`}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Performance
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserAction('assign_cases', user)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Cases
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserAction('send_message', user)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>

                    {user.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="error"
                        onClick={() => handleUserAction('deactivate', user)}
                        disabled={processing === `deactivate_${user.id}`}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleUserAction('activate', user)}
                        disabled={processing === `activate_${user.id}`}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected User Details */}
      {selectedUser && userWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                {selectedUser.full_name} - Workflow Details
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(null);
                  setUserWorkflow(null);
                }}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'performance', label: 'Performance', icon: TrendingUp },
                  { id: 'activity', label: 'Activity', icon: Activity },
                  { id: 'permissions', label: 'Permissions', icon: Shield }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Current Cases</h4>
                    <div className="text-2xl font-bold text-blue-600 mt-2">
                      {userWorkflow.currentCases.length}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">Pending Tasks</h4>
                    <div className="text-2xl font-bold text-green-600 mt-2">
                      {userWorkflow.pendingTasks.length}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Department</h4>
                    <div className="text-lg font-bold text-purple-600 mt-2">
                      {userWorkflow.department}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Quick Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleUserAction('assign_cases', selectedUser)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Assign Cases
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUserAction('send_message', selectedUser)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleUserAction('update_permissions', selectedUser)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Update Permissions
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Cases Assigned</h4>
                    <div className="text-2xl font-bold text-blue-600 mt-2">
                      {userWorkflow.performance.casesAssigned}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">Cases Completed</h4>
                    <div className="text-2xl font-bold text-green-600 mt-2">
                      {userWorkflow.performance.casesCompleted}
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800">Tasks Completed</h4>
                    <div className="text-2xl font-bold text-yellow-600 mt-2">
                      {userWorkflow.performance.tasksCompleted}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Completion Rate</h4>
                    <div className="text-2xl font-bold text-purple-600 mt-2">
                      {userWorkflow.performance.completionRate}%
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average Response Time:</span>
                      <span className="font-semibold">{userWorkflow.performance.avgResponseTime} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Documents Verified:</span>
                      <span className="font-semibold">{userWorkflow.performance.documentsVerified}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Activity:</span>
                      <span className="font-semibold">
                        {new Date(userWorkflow.performance.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h4 className="font-semibold">Recent Activity</h4>
                <div className="space-y-3">
                  {userWorkflow.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Activity className="h-5 w-5 text-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {userWorkflow.recentActivity.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-4">
                <h4 className="font-semibold">User Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userWorkflow.permissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{permission}</span>
                    </div>
                  ))}
                  {userWorkflow.permissions.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No specific permissions assigned</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
