import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, Edit, Trash2, Search, Building2, RefreshCw, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  ValidatedInput, 
  ValidatedSelect, 
  ValidationSummary,
} from '../ui/FormField';
import { useFormValidation } from '../../hooks/useFormValidation';
import { VALIDATION_RULES } from '../../utils/validation';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { AuditLogger } from '../../utils/audit-logger';
import { supabase } from '../../supabase-client';

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  organization_id: string;
  organization_name?: string;
  department_type: 'sales' | 'credit' | 'management' | 'administration' | 'compliance' | 'support';
  parent_department_id?: string;
  parent_department_name?: string;
  manager_id?: string;
  manager_name?: string;
  is_active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface Organization {
  id: string;
  name: string;
  code: string;
}

interface DepartmentManagementProps {
  onBack: () => void;
}

export function DepartmentManagement({ onBack }: DepartmentManagementProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form validation for create/edit department
  const {
    values: deptData,
    errors: deptErrors,
    isValid: isDeptValid,
    isSubmitting: isSubmittingDept,
    handleChange: handleDeptChange,
    handleBlur: handleDeptBlur,
    handleSubmit: handleDeptSubmit,
    reset: resetDeptForm
  } = useFormValidation({
    validationRules: {
      name: VALIDATION_RULES.fullName,
      code: {
        required: true,
        minLength: 2,
        maxLength: 10,
        message: 'Code must be 2-10 characters'
      },
      organization_id: {
        required: true,
        message: 'Please select an organization'
      },
      department_type: {
        required: true,
        message: 'Please select a department type'
      }
    },
    initialValues: {
      name: '',
      code: '',
      description: '',
      organization_id: '',
      department_type: 'sales',
      parent_department_id: '',
      manager_id: '',
      is_active: 'true',
      metadata: ''
    }
  });

  // Load departments and organizations
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [deptsData, orgsData] = await Promise.all([
        SupabaseDatabaseService.getDepartments(),
        SupabaseDatabaseService.getOrganizations()
      ]);
      
      console.log('🔍 Departments loaded:', deptsData.length);
      console.log('🔍 Organizations loaded:', orgsData.length);
      
      // Enhance departments with organization names and other related data
      const enhancedDepts = deptsData.map(dept => ({
        ...dept,
        // Map camelCase to snake_case for the component interface
        organization_id: dept.organizationId,
        department_type: dept.departmentType,
        is_active: dept.isActive,
        created_at: dept.createdAt,
        updated_at: dept.updatedAt,
        organization_name: orgsData.find(org => org.id === dept.organizationId)?.name || 'Unknown',
        parent_department_name: undefined, // Will be populated separately if needed
        manager_name: undefined // Will be populated separately if needed
      }));
      
      console.log('✅ Enhanced departments:', enhancedDepts.length);
      
      setDepartments(enhancedDepts);
      setOrganizations(orgsData);
      
      // Log department management view for audit purposes
      try {
        await AuditLogger.logDashboardView('department_management', AuditLogger.getCurrentUserId());
      } catch (auditError) {
        console.error('Error logging department management view:', auditError);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription for departments
    const subscription = supabase
      .channel('departments-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'departments' },
        (payload) => {
          console.log('Department change received:', payload);
          loadData(); // Refresh data when departments are modified
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle form submission
  const onSubmit = async (values: any) => {
    try {
      console.log('📝 Form values received:', values);
      
      // Map form values to database service expected format (camelCase)
      const departmentData = {
        name: values.name,
        code: values.code,
        description: values.description || '',
        departmentType: values.department_type,
        parentDepartmentId: values.parent_department_id || undefined,
        managerId: values.manager_id || undefined,
        organizationId: values.organization_id,
        isActive: values.is_active === 'true'
      };
      
      console.log('💾 Mapped department data:', departmentData);
      
      if (editingDept) {
        // Update existing department
        await SupabaseDatabaseService.updateDepartment(editingDept.id, departmentData);
        console.log('✅ Department updated successfully');
        setEditingDept(null);
      } else {
        // Create new department
        const result = await SupabaseDatabaseService.createDepartment(departmentData);
        console.log('✅ Department created successfully:', result);
      }
      
      resetDeptForm();
      setShowCreateForm(false);
      await loadData();
    } catch (err: any) {
      console.error('❌ Error saving department:', err);
      setError(err.message || 'Failed to save department');
    }
  };

  // Handle edit
  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setShowCreateForm(true);
    
    // Pre-populate form with existing data using reset
    resetDeptForm({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
      organization_id: dept.organization_id?.toString() || '',
      department_type: dept.department_type || 'sales',
      parent_department_id: dept.parent_department_id?.toString() || '',
      manager_id: dept.manager_id?.toString() || '',
      is_active: dept.is_active ? 'true' : 'false',
      metadata: dept.metadata ? JSON.stringify(dept.metadata) : ''
    });
    
    console.log('📝 Editing department:', dept);
  };

  // Handle delete
  const handleDelete = async (deptId: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await SupabaseDatabaseService.deleteDepartment(deptId);
        await loadData();
      } catch (err: any) {
        console.error('Error deleting department:', err);
        setError(err.message || 'Failed to delete department');
      }
    }
  };

  // Filter departments
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrg === 'all' || dept.organization_id === selectedOrg;
    
    return matchesSearch && matchesOrg;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative flex items-center justify-between">
        <Button variant="outline" onClick={onBack} style={{ background: '#ffffff', color: '#374151' }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">Department Management</h1>
          <p className="text-gray-300">Manage departments across all organizations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadData} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingDept(null);
            resetDeptForm();
            setShowCreateForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>


      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Across all organizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.filter(d => d.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              {departments.length > 0 ? Math.round((departments.filter(d => d.is_active).length / departments.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
            <p className="text-xs text-muted-foreground">With departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Types</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(departments.map(d => d.department_type)).size}</div>
            <p className="text-xs text-muted-foreground">Different types</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, code, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-64">
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Organizations</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
          <Card>
            <CardHeader>
            <CardTitle>{editingDept ? 'Edit Department' : 'Create New Department'}</CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleDeptSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Department Name"
                  name="name"
                  value={deptData.name}
                  onChange={handleDeptChange('name')}
                  onBlur={handleDeptBlur('name')}
                  error={deptErrors.name}
                  placeholder="Enter department name"
                  required
                />

                <ValidatedInput
                  label="Department Code"
                  name="code"
                  value={deptData.code}
                  onChange={handleDeptChange('code')}
                  onBlur={handleDeptBlur('code')}
                  error={deptErrors.code}
                  placeholder="Enter unique code"
                  required
                />

                <ValidatedSelect
                  label="Organization"
                  name="organization_id"
                  value={deptData.organization_id}
                  onChange={handleDeptChange('organization_id')}
                  onBlur={handleDeptBlur('organization_id')}
                  error={deptErrors.organization_id}
                  options={organizations.map(org => ({
                    value: org.id,
                    label: `${org.name} (${org.code})`
                  }))}
                  placeholder="Select organization"
                  required
                />

                <ValidatedSelect
                  label="Department Type"
                  name="department_type"
                  value={deptData.department_type}
                  onChange={handleDeptChange('department_type')}
                  onBlur={handleDeptBlur('department_type')}
                  error={deptErrors.department_type}
                  options={[
                    { value: 'sales', label: 'Sales' },
                    { value: 'credit', label: 'Credit' },
                    { value: 'management', label: 'Management' },
                    { value: 'administration', label: 'Administration' },
                    { value: 'compliance', label: 'Compliance' },
                    { value: 'support', label: 'Support' }
                  ]}
                  placeholder="Select department type"
                  required
                />

                <ValidatedSelect
                  label="Parent Department"
                  name="parent_department_id"
                  value={deptData.parent_department_id}
                  onChange={handleDeptChange('parent_department_id')}
                  onBlur={handleDeptBlur('parent_department_id')}
                  error={deptErrors.parent_department_id}
                  options={[
                    { value: '', label: 'None (Top-level department)' },
                    ...departments
                      .filter(dept => dept.id !== editingDept?.id && dept.is_active)
                      .map(dept => ({
                        value: dept.id,
                        label: `${dept.name} (${dept.code})`
                      }))
                  ]}
                  placeholder="Select parent department (optional)"
                />

                <ValidatedSelect
                  label="Status"
                  name="is_active"
                  value={deptData.is_active}
                  onChange={handleDeptChange('is_active')}
                  onBlur={handleDeptBlur('is_active')}
                  error={deptErrors.is_active}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                  required
                />

                <div className="md:col-span-2">
                  <ValidatedInput
                    label="Description"
                    name="description"
                    value={deptData.description}
                    onChange={handleDeptChange('description')}
                    onBlur={handleDeptBlur('description')}
                    error={deptErrors.description}
                    placeholder="Enter department description"
                  />
                </div>
                  </div>
                  
              <ValidationSummary errors={deptErrors} />

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingDept(null);
                    resetDeptForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingDept || !isDeptValid}
                >
                  {isSubmittingDept ? 'Saving...' : (editingDept ? 'Update Department' : 'Create Department')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Departments List */}
      <Card>
        <CardHeader>
          <CardTitle>Departments ({filteredDepartments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDepartments.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedOrg !== 'all' ? 'Try adjusting your search terms.' : 'Get started by creating your first department.'}
              </p>
              {!searchTerm && selectedOrg === 'all' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Department
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDepartments.map((dept) => (
                <div key={dept.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{dept.name}</h3>
                        <Badge variant={dept.is_active ? 'default' : 'warning'}>
                          {dept.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="info">{dept.code}</Badge>
                        <div className="flex items-center">
                          <Badge variant="info">
                            <Building2 className="h-3 w-3 mr-1" />
                            {dept.organization_name}
                          </Badge>
                        </div>
                        <Badge variant="success">{dept.department_type}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {dept.description && <p><strong>Description:</strong> {dept.description}</p>}
                        {dept.parent_department_name && <p><strong>Parent Department:</strong> {dept.parent_department_name}</p>}
                        {dept.manager_name && <p><strong>Manager:</strong> {dept.manager_name}</p>}
                        <p><strong>Created:</strong> {new Date(dept.created_at).toLocaleDateString()}</p>
                        {dept.updated_at && dept.updated_at !== dept.created_at && (
                          <p><strong>Updated:</strong> {new Date(dept.updated_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(dept)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(dept.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </CardContent>
          </Card>
    </div>
  );
}