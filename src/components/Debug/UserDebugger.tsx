import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Eye, 
  Copy, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Database,
  Shield,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: string;
  departmentId?: string;
  status: string;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
  };
}

export function UserDebugger() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching all users for debugging...');
      const fetchedUsers = await SupabaseDatabaseService.getUsers();
      console.log('✅ Users fetched:', fetchedUsers);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="error"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>;
      case 'admin':
        return <Badge variant="warning"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'manager':
        return <Badge variant="info">Manager</Badge>;
      case 'salesperson':
        return <Badge variant="default">Salesperson</Badge>;
      case 'credit-ops':
        return <Badge variant="secondary">Credit Ops</Badge>;
      case 'compliance':
        return <Badge variant="outline">Compliance</Badge>;
      case 'auditor':
        return <Badge variant="outline">Auditor</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="error"><AlertTriangle className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const generatePassword = (email: string, role: string) => {
    // Generate a simple password based on email and role for demo purposes
    const basePassword = 'password123';
    return basePassword;
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-800 font-medium">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error loading users</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
        <Button onClick={fetchUsers} size="sm" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Database className="h-6 w-6 text-yellow-600 mr-3" />
          <div>
            <h3 className="text-yellow-800 font-bold text-lg">🔍 User Debug Panel</h3>
            <p className="text-yellow-700 text-sm">Available users in the database ({users.length} total)</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            variant={showPasswords ? "default" : "outline"}
            onClick={() => setShowPasswords(!showPasswords)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPasswords ? 'Hide' : 'Show'} Passwords
          </Button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-700">No users found in the database</p>
          <p className="text-yellow-600 text-sm mt-2">Run the database populator to create demo users</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {user.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {user.fullName || 'Unknown User'}
                        </h4>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600 flex-1 truncate">{user.email}</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(user.email)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Building className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Org: {user.organizationId || 'None'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>

                    {showPasswords && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono">
                            Password: {generatePassword(user.email, user.role)}
                          </span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard(generatePassword(user.email, user.role))}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedUser?.id === user.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="space-y-1 text-xs text-gray-600">
                        <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                        <p><strong>Department ID:</strong> {user.departmentId || 'None'}</p>
                        <p><strong>Organization:</strong> {user.organization?.name || 'Unknown'}</p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            copyToClipboard(user.email);
                            copyToClipboard(generatePassword(user.email, user.role));
                          }}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Credentials
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">🚀 Quick Login Instructions:</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Click the "Copy" button next to any user's email</li>
              <li>Click "Show Passwords" to reveal demo passwords</li>
              <li>Copy the password for your chosen user</li>
              <li>Paste credentials into the login form above</li>
              <li>All demo users use password: <code className="bg-yellow-200 px-1 rounded">password123</code></li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
