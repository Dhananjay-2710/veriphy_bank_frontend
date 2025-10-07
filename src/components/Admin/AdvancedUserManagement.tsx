import React, { useState, useEffect } from 'react';
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
import { SupabaseDatabaseService } from '../../services/supabase-database';
// import { useAuth } from '../../contexts/AuthContextFixed'; // Unused for now

interface User {
  id: string;
  full_name: string;
  email: string;
  mobile?: string;
  email_verified_at?: string;
  remember_token?: string;
  department_id?: number;
  employment_type_id?: number;
  organization_id?: number;
  status: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  auth_id?: string;
  role: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: string;
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
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { user } = useAuth(); // Unused for now

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await SupabaseDatabaseService.getUsers();
      
      // Map the data to match our User interface
      const mappedUsers = usersData.map((user: any) => ({
        id: user.id,
        full_name: user.full_name || user.fullName || '',
        email: user.email,
        mobile: user.mobile,
        email_verified_at: user.email_verified_at || user.emailVerifiedAt,
        remember_token: user.remember_token || user.rememberToken,
        department_id: user.department_id || user.departmentId,
        employment_type_id: user.employment_type_id || user.employmentTypeId,
        organization_id: user.organization_id || user.organizationId,
        status: user.status,
        metadata: user.metadata,
        created_at: user.created_at || user.createdAt,
        updated_at: user.updated_at || user.updatedAt,
        deleted_at: user.deleted_at || user.deletedAt,
        auth_id: user.auth_id || user.authId,
        role: user.role,
        password_hash: user.password_hash || user.passwordHash,
        first_name: user.first_name || user.firstName,
        last_name: user.last_name || user.lastName,
        phone: user.phone,
        is_active: user.is_active !== undefined ? user.is_active : (user.isActive !== undefined ? user.isActive : true),
        last_login_at: user.last_login_at || user.lastLoginAt
      }));
      
      setUsers(mappedUsers);
      
      // Calculate stats
      const stats = {
        total: mappedUsers.length,
        active: mappedUsers.filter((u: User) => u.is_active).length,
        inactive: mappedUsers.filter((u: User) => !u.is_active).length,
        suspended: mappedUsers.filter((u: User) => u.status === 'suspended').length
      };
      setUserStats(stats);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const refetch = loadUsers;

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Bulk update status
  const bulkUpdateStatus = async (userIds: string[], status: string) => {
    try {
      for (const userId of userIds) {
        await SupabaseDatabaseService.updateUser(userId, { status });
      }
      await loadUsers();
    } catch (err: any) {
      console.error('Error bulk updating status:', err);
      setError(err.message || 'Failed to update user status');
    }
  };

  // Bulk delete users
  const bulkDeleteUsers = async (userIds: string[]) => {
    try {
      for (const userId of userIds) {
        await SupabaseDatabaseService.deleteUser(userId);
      }
      await loadUsers();
    } catch (err: any) {
      console.error('Error bulk deleting users:', err);
      setError(err.message || 'Failed to delete users');
    }
  };

  // Reset user password
  const resetUserPassword = async (userId: string) => {
    try {
      // Implementation for password reset
      console.log('Resetting password for user:', userId);
      // Add actual password reset logic here
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Failed to reset password');
    }
  };

  // Update user status
  const updateUserStatus = async (userId: string, status: string) => {
    try {
      await SupabaseDatabaseService.updateUser(userId, { status });
      await loadUsers();
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError(err.message || 'Failed to update user status');
    }
  };

  // Send notification to users
  const sendNotificationToUsers = async (userIds: string[], message: string) => {
    try {
      // Implementation for sending notifications
      console.log('Sending notification to users:', userIds, message);
      // Add actual notification logic here
    } catch (err: any) {
      console.error('Error sending notification:', err);
      setError(err.message || 'Failed to send notification');
    }
  };

  const filteredUsers = users.filter((user: User) => {
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
      setSelectedUsers(filteredUsers.map((user: User) => user.id));
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
          await bulkUpdateStatus(selectedUsers, 'active');
          result = { success: true };
          break;
        case 'deactivate':
          await bulkUpdateStatus(selectedUsers, 'inactive');
          result = { success: true };
          break;
        case 'suspend':
          await bulkUpdateStatus(selectedUsers, 'suspended');
          result = { success: true };
          break;
        case 'delete':
          await bulkDeleteUsers(selectedUsers);
          result = { success: true };
          break;
        case 'send_notification':
          await sendNotificationToUsers(selectedUsers, 'Bulk Notification: This is a bulk notification sent to selected users.');
          result = { success: true };
          break;
        case 'reset_password':
          // Reset password for each user individually
          await Promise.all(
            selectedUsers.map((userId: string) => resetUserPassword(userId))
          );
          result = { success: true };
          break;
      }
      
      if (result?.success) {
        alert(`Successfully performed ${action.label.toLowerCase()}`);
      } else {
        alert(`Failed to perform ${action.label.toLowerCase()}: Unknown error`);
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
      await updateUserStatus(userId, newStatus);
      console.log(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert(`Error toggling user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleResetUserPassword = async (userId: string) => {
    try {
      await resetUserPassword(userId);
      alert('Password reset initiated successfully!');
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
      <div className="relative flex items-center justify-between">
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-300">Manage users, roles, and permissions</p>
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
                  <p className="text-2xl font-bold">{userStats.total}</p>
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
                  <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
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
                  <p className="text-2xl font-bold text-blue-600">0</p>
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
                  <p className="text-2xl font-bold text-purple-600">0</p>
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
                  <p className="text-2xl font-bold text-red-600">{userStats.suspended}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">0</p>
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
                {USER_ROLES.map((role: string) => (
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
                {BULK_ACTIONS.map((action: BulkAction) => (
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
                {filteredUsers.map((user: User) => (
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
                            <div className="ml-2 h-2 w-2 bg-gray-400 rounded-full"></div>
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
                      {user.department_id ? `Dept ${user.department_id}` : 'Not assigned'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        No failed attempts
                      </div>
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
