import React, { useState } from 'react';
import { ArrowLeft, Users, Plus, Edit, Trash2, Search, Filter, UserCheck, UserX, Shield, Mail, Phone, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface UserManagementProps {
  onBack: () => void;
}

export function UserManagement({ onBack }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const allUsers = [
    {
      id: '1',
      name: 'Priya Sharma',
      email: 'priya.sharma@happybank.in',
      role: 'salesperson',
      status: 'active',
      lastLogin: '2025-01-09T15:30:00Z',
      casesAssigned: 8,
      performance: '94%',
      joinDate: '2024-03-15',
      phone: '+91-9876543220'
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@happybank.in',
      role: 'manager',
      status: 'active',
      lastLogin: '2025-01-09T14:45:00Z',
      casesAssigned: 0,
      performance: '97%',
      joinDate: '2023-08-10',
      phone: '+91-9876543221'
    },
    {
      id: '3',
      name: 'Anita Patel',
      email: 'anita.patel@happybank.in',
      role: 'credit-ops',
      status: 'active',
      lastLogin: '2025-01-09T16:00:00Z',
      casesAssigned: 23,
      performance: '98%',
      joinDate: '2023-11-20',
      phone: '+91-9876543222'
    },
    {
      id: '4',
      name: 'Dr. Suresh Krishnamurthy',
      email: 'suresh.krishnamurthy@happybank.in',
      role: 'admin',
      status: 'active',
      lastLogin: '2025-01-09T16:15:00Z',
      casesAssigned: 0,
      performance: '100%',
      joinDate: '2022-01-05',
      phone: '+91-9876543223'
    },
    {
      id: '5',
      name: 'Vikram Joshi',
      email: 'vikram.joshi@happybank.in',
      role: 'salesperson',
      status: 'active',
      lastLogin: '2025-01-09T13:20:00Z',
      casesAssigned: 6,
      performance: '91%',
      joinDate: '2024-01-12',
      phone: '+91-9876543224'
    },
    {
      id: '6',
      name: 'Meera Nair',
      email: 'meera.nair@happybank.in',
      role: 'salesperson',
      status: 'inactive',
      lastLogin: '2025-01-07T18:30:00Z',
      casesAssigned: 10,
      performance: '87%',
      joinDate: '2024-05-08',
      phone: '+91-9876543225'
    }
  ];

  const userStats = [
    { label: 'Total Users', value: allUsers.length, color: 'blue' },
    { label: 'Active Users', value: allUsers.filter(u => u.status === 'active').length, color: 'green' },
    { label: 'Salespeople', value: allUsers.filter(u => u.role === 'salesperson').length, color: 'purple' },
    { label: 'Managers', value: allUsers.filter(u => u.role === 'manager').length, color: 'orange' }
  ];

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

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
        <Button onClick={() => setShowCreateUser(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
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
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
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
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {user.status === 'active' ? (
                      <Button variant="warning" size="sm">
                        <UserX className="h-4 w-4 mr-1" />
                        Suspend
                      </Button>
                    ) : (
                      <Button variant="success" size="sm">
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-1" />
                      Permissions
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Activity
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
              <Button onClick={() => setShowCreateUser(false)}>
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}