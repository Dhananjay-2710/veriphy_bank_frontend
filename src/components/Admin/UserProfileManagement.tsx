import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  MoreVertical
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useTeamMembers } from '../../hooks/useDashboardData';
import { User } from '../../types';

interface UserProfileManagementProps {
  onNavigateToUser?: (userId: string) => void;
  onCreateUser?: () => void;
  onEditUser?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export function UserProfileManagement({ 
  onNavigateToUser,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onViewProfile
}: UserProfileManagementProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    role?: string;
    status?: string;
    department?: string;
  }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'lastLogin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { teamMembers, loading, error, refetch } = useTeamMembers();

  // Filter and sort users
  const filteredUsers = teamMembers
    .filter((user: User) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !selectedFilters.role || user.role === selectedFilters.role;
      const matchesStatus = !selectedFilters.status || (user as any).isActive === (selectedFilters.status === 'active');
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a: User, b: User) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'lastLogin':
          aValue = (a as any).lastLoginAt || '';
          bValue = (b as any).lastLoginAt || '';
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'credit-ops': return 'bg-green-100 text-green-800';
      case 'salesperson': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Handle actions
  const handleViewUser = (userId: string) => {
    if (onNavigateToUser) {
      onNavigateToUser(userId);
    }
  };

  const handleEditUser = (userId: string) => {
    if (onEditUser) {
      onEditUser(userId);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (onDeleteUser) {
      onDeleteUser(userId);
    }
  };

  const handleViewProfile = (userId: string) => {
    if (onViewProfile) {
      onViewProfile(userId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profiles...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Users className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading User Profiles</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={refetch}>
            <Activity className="h-4 w-4 mr-2" />
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
          <h1 className="text-2xl font-bold text-gray-900">User Profile Management</h1>
          <p className="text-gray-600">Manage user accounts and profiles across the organization</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetch}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onCreateUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.filter((user: User) => (user as any).isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.filter((user: User) => user.role === 'manager').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sales Team</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.filter((user: User) => user.role === 'salesperson').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={selectedFilters.role || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, role: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="credit-ops">Credit Ops</option>
                <option value="salesperson">Salesperson</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedFilters.status || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
                <option value="lastLogin">Last Login</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user: User) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProfile(user.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor((user as any).isActive)}>
                    {(user as any).isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>
                  {(user as any).mobile && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {(user as any).mobile}
                    </div>
                  )}
                  {(user as any).lastLoginAt && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Last login: {new Date((user as any).lastLoginAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
            {searchTerm || Object.values(selectedFilters).some(Boolean) && (
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default UserProfileManagement;
