import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Plus, Edit, Trash2, Search, Users, RefreshCw, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  ValidatedInput, 
  ValidatedSelect, 
  ValidationSummary,
} from '../ui/FormField';
import { useFormValidation } from '../../hooks/useFormValidation';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { AuditLogger } from '../../utils/audit-logger';
import { supabase } from '../../supabase-client';

interface Role {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  is_active: boolean;
}

interface RolesManagementProps {
  onBack: () => void;
}

export function RolesManagement({ onBack }: RolesManagementProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Form validation for create/edit role
  const {
    values: roleData,
    errors: roleErrors,
    isValid: isRoleValid,
    isSubmitting: isSubmittingRole,
    handleChange: handleRoleChange,
    handleBlur: handleRoleBlur,
    handleSubmit: handleRoleSubmit,
    reset: resetRoleForm
  } = useFormValidation({
    validationRules: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'Role name must be 2-50 characters'
      },
      description: {
        maxLength: 500,
        message: 'Description must be less than 500 characters'
      }
    },
    initialValues: {
      name: '',
      description: '',
      is_active: 'true'
    }
  });

  // Load roles and permissions
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get roles and permissions from database
      const [rolesData, permissionsData] = await Promise.all([
        SupabaseDatabaseService.getRoles(),
        SupabaseDatabaseService.getPermissions()
      ]);
      
      console.log('🔍 Roles loaded:', rolesData.length);
      console.log('🔍 Permissions loaded:', permissionsData.length);
      
      // Map roles data to match interface
      const enhancedRoles = rolesData.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        is_active: role.isActive,
        created_at: role.createdAt,
        updated_at: role.updatedAt,
        permissions: [] // Will be populated separately if needed
      }));
      
      console.log('✅ Enhanced roles:', enhancedRoles.length);
      
      // Map permissions data to match interface
      const mappedPermissions = permissionsData.map(permission => ({
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        is_active: permission.isActive,
        created_at: permission.createdAt,
        updated_at: permission.updatedAt
      }));
      
      setRoles(enhancedRoles);
      setPermissions(mappedPermissions);
      
      // Log roles management view for audit purposes
      try {
        await AuditLogger.logDashboardView('roles_management', AuditLogger.getCurrentUserId());
      } catch (auditError) {
        console.error('Error logging roles management view:', auditError);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription for roles
    const subscription = supabase
      .channel('roles-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'roles' },
        (payload) => {
          console.log('Role change received:', payload);
          loadData(); // Refresh data when roles are modified
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
      const roleData = {
        name: values.name,
        description: values.description || '',
        permissions: selectedPermissions,
        isActive: values.is_active === 'true'
      };
      
      console.log('💾 Mapped role data:', roleData);
      
      if (editingRole) {
        // Update existing role
        await SupabaseDatabaseService.updateRole(editingRole.id, roleData);
        console.log('✅ Role updated successfully');
        
        // Update role permissions (simplified - just log for now)
        console.log('Updating role permissions for role:', editingRole.id, 'with permissions:', selectedPermissions);
        
        setEditingRole(null);
      } else {
        // Create new role
        const newRole = await SupabaseDatabaseService.createRole(roleData);
        console.log('✅ Role created successfully:', newRole);
        
        // Assign permissions to new role (simplified - just log for now)
        console.log('Assigning permissions to new role:', newRole.id, 'with permissions:', selectedPermissions);
      }
      
      resetRoleForm();
      setShowCreateForm(false);
      setSelectedPermissions([]);
      await loadData();
    } catch (err: any) {
      console.error('Error saving role:', err);
      setError(err.message || 'Failed to save role');
    }
  };

  // Handle edit
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowCreateForm(true);
    setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    
    // Pre-populate form with existing data using reset
    resetRoleForm({
      name: role.name || '',
      description: role.description || '',
      is_active: role.is_active ? 'true' : 'false'
    });
    
    console.log('📝 Editing role:', role);
  };

  // Handle delete
  const handleDelete = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      try {
        await SupabaseDatabaseService.deleteRole(roleId);
        await loadData();
      } catch (err: any) {
        console.error('Error deleting role:', err);
        setError(err.message || 'Failed to delete role');
      }
    }
  };

  // Filter roles
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  console.log('🔍 Total roles:', roles.length);
  console.log('🔍 Filtered roles:', filteredRoles.length);

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roles and permissions...</p>
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
          <h1 className="text-2xl font-bold text-white">Roles Management</h1>
          <p className="text-gray-300">Manage user roles and their permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadData} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingRole(null);
            resetRoleForm();
            setSelectedPermissions([]);
            setShowCreateForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">System-wide roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.filter(r => r.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              {roles.length > 0 ? Math.round((roles.filter(r => r.is_active).length / roles.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">Available permissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permission Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(groupedPermissions).length}</div>
            <p className="text-xs text-muted-foreground">Resource groups</p>
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

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by role name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRoleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Role Name"
                  name="name"
                  value={roleData.name}
                  onChange={handleRoleChange('name')}
                  onBlur={handleRoleBlur('name')}
                  error={roleErrors.name}
                  placeholder="Enter role name"
                  required
                />

                <ValidatedSelect
                  label="Status"
                  name="is_active"
                  value={roleData.is_active}
                  onChange={handleRoleChange('is_active')}
                  onBlur={handleRoleBlur('is_active')}
                  error={roleErrors.is_active}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                  required
                />
              </div>

              <div>
                <ValidatedInput
                  label="Description"
                  name="description"
                  value={roleData.description}
                  onChange={handleRoleChange('description')}
                  onBlur={handleRoleBlur('description')}
                  error={roleErrors.description}
                  placeholder="Enter role description"
                />
              </div>

              {/* Permissions Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissions
                </label>
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                    <div key={resource} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 capitalize">{resource}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {resourcePermissions.map((permission) => (
                          <label key={permission.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPermissions([...selectedPermissions, permission.id]);
                                } else {
                                  setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{permission.action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <ValidationSummary errors={roleErrors} />

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingRole(null);
                    resetRoleForm();
                    setSelectedPermissions([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingRole || !isRoleValid}
                >
                  {isSubmittingRole ? 'Saving...' : (editingRole ? 'Update Role' : 'Create Role')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Roles List */}
      <Card>
        <CardHeader>
          <CardTitle>Roles ({filteredRoles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRoles.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first role.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRoles.map((role) => (
                <div key={role.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                        <Badge variant={role.is_active ? 'default' : 'warning'}>
                          {role.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {role.description && <p><strong>Description:</strong> {role.description}</p>}
                        <p><strong>Permissions:</strong> {role.permissions?.length || 0} assigned</p>
                        <p><strong>Created:</strong> {new Date(role.created_at).toLocaleDateString()}</p>
                        {role.updated_at && role.updated_at !== role.created_at && (
                          <p><strong>Updated:</strong> {new Date(role.updated_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Assigned Permissions:</p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((permission) => (
                              <Badge key={permission.id} variant="info">
                                {permission.resource}.{permission.action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(role)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(role.id)}>
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
