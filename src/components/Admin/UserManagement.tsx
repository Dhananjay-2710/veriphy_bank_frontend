import { useState } from 'react';
import { ArrowLeft, Users, Plus, Edit, Trash2, Search, Filter, UserCheck, UserX, Shield, Mail, Phone, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useTeamMembers } from '../../hooks/useDashboardData';
import { useAuth } from '../../contexts/AuthContextFixed';
import { UserProfile } from './UserProfile';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface UserManagementProps {
  onBack: () => void;
}

export function UserManagement({ onBack }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'salesperson'
  });
  const { user } = useAuth();

  // Get real team members data from database
  const { teamMembers, loading: usersLoading, error: usersError, refetch: refetchUsers } = useTeamMembers((user as any)?.organization_id);

  // Transform real team members data
  const users = teamMembers.map((member: any) => ({
    id: member.id,
    name: member.full_name || member.name,
    email: member.email,
    role: member.role || 'user',
    status: member.status || 'active',
    lastLogin: member.last_login_at || new Date().toISOString(),
    casesAssigned: 0, // This would need to be calculated from cases
    performance: '95%', // This would need to be calculated
    joinDate: new Date(member.created_at || new Date()).toISOString().split('T')[0],
    phone: member.mobile || 'N/A'
  }));

  const userStats = [
    { label: 'Total Users', value: users.length, color: 'blue' },
    { label: 'Active Users', value: users.filter(u => u.status === 'active').length, color: 'green' },
    { label: 'Salespeople', value: users.filter(u => u.role === 'salesperson').length, color: 'purple' },
    { label: 'Managers', value: users.filter(u => u.role === 'manager').length, color: 'orange' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Loading state
  if (usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (usersError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Users</p>
            <p className="text-sm text-gray-600 mt-2">{usersError}</p>
          </div>
          <Button onClick={refetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="error">Admin</Badge>;
      case 'manager':
        return <Badge variant="warning">Manager</Badge>;
      case 'credit-ops':
        return <Badge variant="info">Credit Ops</Badge>;
      case 'salesperson':
        return <Badge variant="success">Salesperson</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'inactive':
        return <Badge variant="error" size="sm">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="warning" size="sm">Suspended</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const handleUserClick = (userData: any) => {
    setProfileUser(userData);
    setShowUserProfile(true);
  };

  const handleCloseProfile = () => {
    setShowUserProfile(false);
    setProfileUser(null);
  };

  const handleEditUser = async (userId: string, updatedData: any) => {
    try {
      console.log('Editing user:', userId, updatedData);
      await SupabaseDatabaseService.updateUser(userId, updatedData);
      
      // Show success message
      alert('User updated successfully!');
      
      // Refresh the user list
      refetchUsers();
      
      handleCloseProfile();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      console.log('Suspending user:', userId);
      await SupabaseDatabaseService.suspendUser(userId);
      
      // Show success message
      alert('User suspended successfully!');
      
      // Refresh the user list
      refetchUsers();
      
      handleCloseProfile();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user. Please try again.');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      console.log('Activating user:', userId);
      await SupabaseDatabaseService.activateUser(userId);
      
      // Show success message
      alert('User activated successfully!');
      
      // Refresh the user list
      refetchUsers();
      
      handleCloseProfile();
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Failed to activate user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
      if (!confirmDelete) return;

      console.log('Deleting user:', userId);
      await SupabaseDatabaseService.deleteUser(userId);
      
      // Show success message
      alert('User deleted successfully!');
      
      // Refresh the user list
      refetchUsers();
      
      handleCloseProfile();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.name || !newUser.email) {
        alert('Please fill in all required fields (Name and Email)');
        return;
      }

      console.log('Creating new user:', newUser);
      
      await SupabaseDatabaseService.createUser({
        full_name: newUser.name,
        email: newUser.email,
        mobile: newUser.phone,
        role: newUser.role,
        organization_id: (user as any)?.organization_id || 1
      });
      
      // Show success message
      alert('User created successfully!');
      
      // Reset form
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: 'salesperson'
      });
      
      // Close modal
      setShowCreateUser(false);
      
      // Refresh the user list
      refetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  if (usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading users: {usersError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users and permissions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchUsers()}>
            <Users className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateUser(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {userStats.map((stat, index) => {
          const colorClasses = {
            blue: 'text-blue-600 bg-blue-100',
            green: 'text-green-600 bg-green-100',
            purple: 'text-purple-600 bg-purple-100',
            orange: 'text-orange-600 bg-orange-100'
          };
          
          return (
            <Card key={index}>
              <CardContent className="text-center p-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <span className="text-xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="credit-ops">Credit Operations</option>
                <option value="salesperson">Salesperson</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>System Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div 
                key={user.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                onClick={() => handleUserClick(user)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p>Cases Assigned: {user.casesAssigned}</p>
                          <p>Performance: {user.performance}</p>
                          <p>Joined: {new Date(user.joinDate).toLocaleDateString()}</p>
                          <p>Last Login: {new Date(user.lastLogin).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick(user);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="error" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    {user.status === 'active' ? (
                      <Button 
                        variant="warning" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSuspendUser(user.id);
                        }}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Suspend
                      </Button>
                    ) : (
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivateUser(user.id);
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('View permissions for user:', user.id);
                      }}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Permissions
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick(user);
                      }}
                      className="group-hover:bg-blue-50 group-hover:border-blue-300"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="salesperson">Salesperson</option>
                  <option value="manager">Manager</option>
                  <option value="credit-ops">Credit Operations</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && profileUser && (
        <UserProfile
          user={profileUser}
          onClose={handleCloseProfile}
          onEdit={handleEditUser}
          onSuspend={handleSuspendUser}
          onActivate={handleActivateUser}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  );
}