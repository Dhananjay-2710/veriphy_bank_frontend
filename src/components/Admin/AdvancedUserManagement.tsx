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
  MapPin, 
  Calendar,
  Shield,
  Eye,
  UserCheck,
  UserX,
  Download,
  Upload,
  RotateCcw,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  MoreVertical
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { SupabaseDatabaseService } from '../../services/supabase-database';

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

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  newUsersToday: number;
  suspendedUsers: number;
  pendingVerification: number;
  roleDistribution: { [role: string]: number };
  departmentDistribution: { [department: string]: number };
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
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from Supabase
      const mockUsers: User[] = [
        {
          id: '40',
          email: 'superadmin@veriphy.com',
          full_name: 'Super Admin',
          mobile: '+91-9999999999',
          role: 'super_admin',
          department_id: 1,
          department_name: 'Administration',
          organization_id: 1,
          organization_name: 'Veriphy Bank',
          status: 'active',
          last_login_at: '2024-01-22T10:30:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-22T10:30:00Z',
          email_verified_at: '2024-01-01T00:00:00Z',
          employment_type: 'permanent',
          is_online: true,
          login_attempts: 0,
          permissions: ['all']
        },
        {
          id: '41',
          email: 'priya.sharma@veriphy.com',
          full_name: 'Priya Sharma',
          mobile: '+91-9876543210',
          role: 'manager',
          department_id: 2,
          department_name: 'Sales',
          organization_id: 1,
          organization_name: 'Veriphy Bank',
          status: 'active',
          last_login_at: '2024-01-22T09:15:00Z',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-22T09:15:00Z',
          email_verified_at: '2024-01-15T00:00:00Z',
          employment_type: 'permanent',
          is_online: true,
          login_attempts: 0
        },
        {
          id: '42',
          email: 'rajesh.kumar@veriphy.com',
          full_name: 'Rajesh Kumar',
          mobile: '+91-9876543211',
          role: 'credit_ops',
          department_id: 3,
          department_name: 'Credit Operations',
          organization_id: 1,
          organization_name: 'Veriphy Bank',
          status: 'active',
          last_login_at: '2024-01-21T14:20:00Z',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-21T14:20:00Z',
          email_verified_at: '2024-01-15T00:00:00Z',
          employment_type: 'permanent',
          is_online: false,
          login_attempts: 0
        },
        {
          id: '43',
          email: 'sneha.singh@veriphy.com',
          full_name: 'Sneha Singh',
          mobile: '+91-9876543212',
          role: 'salesperson',
          department_id: 2,
          department_name: 'Sales',
          organization_id: 1,
          organization_name: 'Veriphy Bank',
          status: 'active',
          last_login_at: '2024-01-22T08:45:00Z',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-22T08:45:00Z',
          email_verified_at: '2024-01-15T00:00:00Z',
          employment_type: 'permanent',
          is_online: true,
          login_attempts: 0
        },
        {
          id: '44',
          email: 'amit.patel@veriphy.com',
          full_name: 'Amit Patel',
          mobile: '+91-9876543213',
          role: 'compliance',
          department_id: 4,
          department_name: 'Compliance',
          organization_id: 1,
          organization_name: 'Veriphy Bank',
          status: 'suspended',
          last_login_at: '2024-01-20T16:30:00Z',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-20T16:30:00Z',
          email_verified_at: '2024-01-15T00:00:00Z',
          employment_type: 'contract',
          is_online: false,
          login_attempts: 3
        }
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Calculate stats from the users data
      const stats: UserStats = {
        totalUsers: 14,
        activeUsers: 12,
        onlineUsers: 8,
        newUsersToday: 2,
        suspendedUsers: 1,
        pendingVerification: 1,
        roleDistribution: {
          'super_admin': 1,
          'admin': 1,
          'manager': 3,
          'credit_ops': 4,
          'salesperson': 3,
          'compliance': 1,
          'auditor': 1
        },
        departmentDistribution: {
          'Administration': 2,
          'Sales': 5,
          'Credit Operations': 4,
          'Compliance': 2,
          'IT': 1
        }
      };
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

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
      // In a real app, this would make API calls
      console.log(`Performing ${action.type} on users:`, selectedUsers);
      
      // Update local state based on action
      switch (action.type) {
        case 'activate':
          setUsers(users.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: 'active' as const }
              : user
          ));
          break;
        case 'deactivate':
          setUsers(users.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: 'inactive' as const }
              : user
          ));
          break;
        case 'suspend':
          setUsers(users.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: 'suspended' as const }
              : user
          ));
          break;
        case 'delete':
          setUsers(users.filter(user => !selectedUsers.includes(user.id)));
          break;
      }
      
      setSelectedUsers([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              status: user.status === 'active' ? 'inactive' : 'active' as const
            }
          : user
      ));
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const resetUserPassword = async (userId: string) => {
    try {
      // In a real app, this would send a password reset email
      console.log('Password reset for user:', userId);
      alert('Password reset email sent successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <div className="flex space-x-3">
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
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.department_name || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {user.status}
                      </Badge>
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
                          onClick={() => setEditingUser(user)}
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
                          onClick={() => resetUserPassword(user.id)}
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
