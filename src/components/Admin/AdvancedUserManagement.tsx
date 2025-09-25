import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  Mail, 
  Phone, 
  Calendar,
  Key,
  AlertTriangle,
  Clock,
  Activity,
  RefreshCw,
  UserCheck,
  UserX,
  Download
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAdvancedUserManagement } from '../../hooks/useDashboardData';

interface User {
  id: string;
  email: string;
  full_name: string;
  mobile?: string;
  role: string;
  department_id?: number;
  department_name?: string;
  organization_id?: number;
  organization_name?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  email_verified_at?: string;
  employment_type?: string;
  metadata?: any;
  permissions?: string[];
  is_online?: boolean;
  login_attempts?: number;
  locked_until?: string;
}


interface BulkAction {
  type: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'reset_password' | 'send_notification';
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  confirmation?: boolean;
}

const BULK_ACTIONS: BulkAction[] = [
  { type: 'activate', label: 'Activate Users', icon: UserCheck, color: 'text-green-600' },
  { type: 'deactivate', label: 'Deactivate Users', icon: UserX, color: 'text-yellow-600' },
  { type: 'suspend', label: 'Suspend Users', icon: Lock, color: 'text-red-600', confirmation: true },
  { type: 'reset_password', label: 'Reset Passwords', icon: Key, color: 'text-blue-600', confirmation: true },
  { type: 'send_notification', label: 'Send Notification', icon: Mail, color: 'text-purple-600' },
  { type: 'delete', label: 'Delete Users', icon: Trash2, color: 'text-red-600', confirmation: true }
];

const USER_ROLES = [
  'super_admin',
  'admin', 
  'manager',
  'credit_ops',
  'salesperson',
  'compliance',
  'auditor'
];

export function AdvancedUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Use the real hook with filters
  const {
    users,
    userStats,
    loading,
    error,
    refetch,
    actions: {
      bulkUpdateStatus,
      bulkDeleteUsers,
      resetUserPassword,
      updateUserStatus,
      sendNotificationToUsers
    }
  } = useAdvancedUserManagement({
    searchTerm: searchTerm || undefined,
    role: selectedRole !== 'all' ? selectedRole : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    limit: 50
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleBulkAction = async (action: BulkAction) => {
    if (selectedUsers.length === 0) return;
    
    if (action.confirmation) {
      const confirmed = window.confirm(`Are you sure you want to ${action.label.toLowerCase()} ${selectedUsers.length} user(s)?`);
      if (!confirmed) return;
    }

    try {
      let result;
      
      switch (action.type) {
        case 'activate':
          result = await bulkUpdateStatus(selectedUsers, 'active');
          break;
        case 'deactivate':
          result = await bulkUpdateStatus(selectedUsers, 'inactive');
          break;
        case 'suspend':
          result = await bulkUpdateStatus(selectedUsers, 'suspended');
          break;
        case 'delete':
          result = await bulkDeleteUsers(selectedUsers);
          break;
        case 'send_notification':
          result = await sendNotificationToUsers(selectedUsers, {
            title: 'Bulk Notification',
            message: 'This is a bulk notification sent to selected users.',
            type: 'info'
          });
          break;
        case 'reset_password':
          // Reset password for each user individually
          const resetResults = await Promise.all(
            selectedUsers.map(userId => resetUserPassword(userId))
          );
          result = { success: resetResults.every(r => r.success) };
          break;
      }
      
      if (result?.success) {
        alert(`Successfully performed ${action.label.toLowerCase()}`);
      } else {
        alert(`Failed to perform ${action.label.toLowerCase()}: ${result?.error || 'Unknown error'}`);
      }
      
      setSelectedUsers([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert(`Error performing ${action.label.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const result = await updateUserStatus(userId, newStatus);
      
      if (result.success) {
        console.log(`User status updated to ${newStatus}`);
      } else {
        alert(`Failed to update user status: ${result.error}`);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert(`Error toggling user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleResetUserPassword = async (userId: string) => {
    try {
      const result = await resetUserPassword(userId);
      
      if (result.success) {
        alert('Password reset initiated successfully!');
      } else {
        alert(`Failed to reset password: ${result.error}`);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(`Error resetting password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-indigo-100 text-indigo-800';
      case 'credit_ops': return 'bg-green-100 text-green-800';
      case 'salesperson': return 'bg-orange-100 text-orange-800';
      case 'compliance': return 'bg-red-100 text-red-800';
      case 'auditor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastLogin = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user management...</p>
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
            <p className="text-lg font-semibold">Error Loading Users</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={refetch}>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{userStats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{userStats.activeUsers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Online Now</p>
                  <p className="text-2xl font-bold text-blue-600">{userStats.onlineUsers}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Today</p>
                  <p className="text-2xl font-bold text-purple-600">{userStats.newUsersToday}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">{userStats.suspendedUsers}</p>
                </div>
                <Lock className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{userStats.pendingVerification}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {USER_ROLES.map(role => (
                  <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                >
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>

          {/* Bulk Actions Panel */}
          {showBulkActions && selectedUsers.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {BULK_ACTIONS.map((action) => (
                  <Button
                    key={action.type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction(action)}
                    className={action.color}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={selectedUsers.includes(user.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            {user.is_online && (
                              <div className="ml-2 h-2 w-2 bg-green-400 rounded-full"></div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.mobile && (
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.mobile}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.department_name || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                      {user.login_attempts && user.login_attempts > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {user.login_attempts} failed attempts
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatLastLogin(user.last_login_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Edit user:', user.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id)}
                          className={user.status === 'active' ? 'text-yellow-600' : 'text-green-600'}
                        >
                          {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetUserPassword(user.id)}
                          className="text-blue-600"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
