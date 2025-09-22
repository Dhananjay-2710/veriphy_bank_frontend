import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  RefreshCw, 
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentType: 'sales' | 'credit_ops' | 'compliance' | 'admin' | 'support';
  parentDepartmentId?: string;
  managerId?: string;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  parentDepartment?: Department;
  manager?: {
    id: string;
    full_name: string;
    email: string;
  };
  children?: Department[];
}

interface DepartmentFormData {
  name: string;
  code: string;
  description: string;
  departmentType: 'sales' | 'credit_ops' | 'compliance' | 'admin' | 'support';
  parentDepartmentId?: string;
  managerId?: string;
  organizationId: string;
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    code: '',
    description: '',
    departmentType: 'sales',
    organizationId: ''
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [deptData, orgData, userData] = await Promise.all([
        SupabaseDatabaseService.getDepartments(),
        SupabaseDatabaseService.getOrganizations(),
        SupabaseDatabaseService.getUsers()
      ]);
      
      setDepartments(deptData);
      setOrganizations(orgData);
      setUsers(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingDept) {
        await SupabaseDatabaseService.updateDepartment(editingDept.id, formData);
      } else {
        await SupabaseDatabaseService.createDepartment(formData);
      }
      
      await fetchData();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (deptId: string) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await SupabaseDatabaseService.deleteDepartment(deptId);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      departmentType: 'sales',
      organizationId: ''
    });
    setEditingDept(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (dept: Department) => {
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      departmentType: dept.departmentType,
      parentDepartmentId: dept.parentDepartmentId,
      managerId: dept.managerId,
      organizationId: dept.organizationId || ''
    });
    setEditingDept(dept);
    setShowForm(true);
  };

  // Toggle department expansion
  const toggleExpansion = (deptId: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  // Build department tree
  const buildDepartmentTree = (depts: Department[]): Department[] => {
    const deptMap = new Map<string, Department>();
    const rootDepts: Department[] = [];

    // Create map and add children array
    depts.forEach(dept => {
      deptMap.set(dept.id, { ...dept, children: [] });
    });

    // Build tree structure
    depts.forEach(dept => {
      const deptWithChildren = deptMap.get(dept.id)!;
      if (dept.parentDepartmentId && deptMap.has(dept.parentDepartmentId)) {
        const parent = deptMap.get(dept.parentDepartmentId)!;
        parent.children!.push(deptWithChildren);
      } else {
        rootDepts.push(deptWithChildren);
      }
    });

    return rootDepts;
  };

  // Filter departments
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || dept.departmentType === typeFilter;
    const matchesOrg = orgFilter === 'all' || dept.organizationId === orgFilter;
    
    return matchesSearch && matchesType && matchesOrg;
  });

  // Get department type badge
  const getTypeBadge = (type: string) => {
    const typeConfig = {
      sales: { color: 'blue', label: 'Sales' },
      credit_ops: { color: 'green', label: 'Credit Ops' },
      compliance: { color: 'yellow', label: 'Compliance' },
      admin: { color: 'purple', label: 'Admin' },
      support: { color: 'gray', label: 'Support' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { color: 'gray', label: type };
    return <Badge variant={config.color as any}>{config.label}</Badge>;
  };

  // Render department tree
  const renderDepartmentTree = (depts: Department[], level = 0) => {
    return depts.map(dept => (
      <div key={dept.id} className="ml-4">
        <Card className={`mb-2 ${level > 0 ? 'border-l-2 border-gray-200' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {dept.children && dept.children.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpansion(dept.id)}
                    className="p-1 h-6 w-6"
                  >
                    {expandedDepts.has(dept.id) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                )}
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">{dept.name}</h4>
                  <p className="text-sm text-gray-500">{dept.code}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getTypeBadge(dept.departmentType)}
                {dept.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="error">Inactive</Badge>
                )}
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(dept)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(dept.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {dept.description && (
              <p className="text-sm text-gray-600 mt-2">{dept.description}</p>
            )}
            
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>Created: {new Date(dept.createdAt).toLocaleDateString()}</span>
              {dept.manager && (
                <span>Manager: {dept.manager.full_name}</span>
              )}
            </div>
          </CardContent>
        </Card>
        
        {expandedDepts.has(dept.id) && dept.children && dept.children.length > 0 && (
          <div className="ml-4">
            {renderDepartmentTree(dept.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading && departments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  if (error && departments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Departments</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const departmentTree = buildDepartmentTree(filteredDepartments);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600">Manage departments and organizational structure</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="sales">Sales</option>
                <option value="credit_ops">Credit Ops</option>
                <option value="compliance">Compliance</option>
                <option value="admin">Admin</option>
                <option value="support">Support</option>
              </select>
            </div>
            
            <div>
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Organizations</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setOrgFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Departments Tree */}
      <div className="space-y-4">
        {departmentTree.length > 0 ? (
          renderDepartmentTree(departmentTree)
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No departments found</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Department
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Department Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Type *
                    </label>
                    <select
                      required
                      value={formData.departmentType}
                      onChange={(e) => setFormData({ ...formData, departmentType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="sales">Sales</option>
                      <option value="credit_ops">Credit Ops</option>
                      <option value="compliance">Compliance</option>
                      <option value="admin">Admin</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization *
                    </label>
                    <select
                      required
                      value={formData.organizationId}
                      onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Organization</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Department
                    </label>
                    <select
                      value={formData.parentDepartmentId || ''}
                      onChange={(e) => setFormData({ ...formData, parentDepartmentId: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No Parent</option>
                      {departments
                        .filter(dept => dept.organizationId === formData.organizationId)
                        .map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manager
                    </label>
                    <select
                      value={formData.managerId || ''}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No Manager</option>
                      {users
                        .filter(user => user.organization_id === formData.organizationId)
                        .map(user => (
                          <option key={user.id} value={user.id}>{user.full_name}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingDept ? 'Update Department' : 'Create Department'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
