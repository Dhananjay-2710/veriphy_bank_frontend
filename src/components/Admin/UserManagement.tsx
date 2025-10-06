import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, Edit, Trash2, Search, RefreshCw, AlertTriangle, UserCheck, UserX } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ValidatedSelect } from '../ui/FormField';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { UserManagementModal } from '../modals/UserManagementModal';
import { AuditLogger } from '../../utils/audit-logger';

interface User {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  emailVerifiedAt?: string;
  rememberToken?: string;
  departmentId?: number;
  employmentTypeId?: number;
  organizationId?: number;
  status: string;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  authId?: string;
  role: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

interface UserManagementProps {
  onBack: () => void;
}

export function UserManagement({ onBack }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await SupabaseDatabaseService.getUsers();
      setUsers(fetchedUsers);
      
      // Log user management view for audit purposes
      try {
        await AuditLogger.logDashboardView('user_management', AuditLogger.getCurrentUserId());
      } catch (auditError) {
        console.error('Error logging user management view:', auditError);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await SupabaseDatabaseService.deleteUser(userId);
        fetchUsers();
      } catch (err: any) {
        console.error('Error deleting user:', err);
        setError(err.message || 'Failed to delete user.');
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await SupabaseDatabaseService.updateUser(userId, {
        isActive: !currentStatus,
        status: !currentStatus ? 'active' : 'inactive'
      });
      fetchUsers();
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError(err.message || 'Failed to update user status.');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingUser(null);
    fetchUsers(); // Refresh data after modal closes
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
        <Button onClick={handleCreateUser} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add New User
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <ValidatedSelect
              label="Status"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />

            <ValidatedSelect
              label="Role"
              name="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'super_admin', label: 'Super Admin' },
                { value: 'admin', label: 'Admin' },
                { value: 'manager', label: 'Manager' },
                { value: 'salesperson', label: 'Salesperson' },
                { value: 'credit_ops', label: 'Credit Ops' },
                { value: 'compliance', label: 'Compliance' },
                { value: 'auditor', label: 'Auditor' }
              ]}
            />

            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p className="text-lg mb-2">No users found.</p>
          <p>Click "Add New User" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{user.fullName}</CardTitle>
                <div className="flex space-x-2">
                  <Badge variant="default">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="default">
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Mobile:</strong> {user.mobile || 'N/A'}</p>
                  <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                  <p><strong>Department ID:</strong> {user.departmentId || 'N/A'}</p>
                  <p><strong>Organization ID:</strong> {user.organizationId || 'N/A'}</p>
                  <p><strong>Status:</strong> {user.status}</p>
                  <p><strong>Created:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  {user.lastLoginAt && (
                    <p><strong>Last Login:</strong> {new Date(user.lastLoginAt).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                    className={user.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                  >
                    {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <UserManagementModal
          isOpen={showModal}
          onClose={handleModalClose}
          user={editingUser}
        />
      )}
    </div>
  );
}