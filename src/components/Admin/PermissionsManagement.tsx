import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Plus, Edit, Trash2, Search, Key, RefreshCw, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';
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

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PermissionsManagementProps {
  onBack: () => void;
}

export function PermissionsManagement({ onBack }: PermissionsManagementProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  // Form validation for create/edit permission
  const {
    values: permissionData,
    errors: permissionErrors,
    isValid: isPermissionValid,
    isSubmitting: isSubmittingPermission,
    handleChange: handlePermissionChange,
    handleBlur: handlePermissionBlur,
    handleSubmit: handlePermissionSubmit,
    reset: resetPermissionForm
  } = useFormValidation({
    validationRules: {
      name: {
        required: true,
        minLength: 3,
        maxLength: 100,
        message: 'Permission name must be 3-100 characters'
      },
      resource: {
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'Resource must be 2-50 characters'
      },
      action: {
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'Action must be 2-50 characters'
      }
    },
    initialValues: {
      name: '',
      resource: '',
      action: '',
      is_active: 'true'
    }
  });

  // Load permissions
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const permissionsData = await SupabaseDatabaseService.getPermissions();
      
      console.log('🔍 Permissions loaded:', permissionsData.length);
      
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
      
      setPermissions(mappedPermissions);
      
      // Log permissions management view for audit purposes
      try {
        await AuditLogger.logDashboardView('permissions_management', AuditLogger.getCurrentUserId());
      } catch (auditError) {
        console.error('Error logging permissions management view:', auditError);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription for permissions
    const subscription = supabase
      .channel('permissions-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'permissions' },
        (payload) => {
          console.log('Permission change received:', payload);
          loadData(); // Refresh data when permissions are modified
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
      if (editingPermission) {
        // Update existing permission
        await SupabaseDatabaseService.updatePermission(editingPermission.id, values);
        setEditingPermission(null);
      } else {
        // Create new permission
        await SupabaseDatabaseService.createPermission(values);
      }
      
      resetPermissionForm();
      setShowCreateForm(false);
      await loadData();
    } catch (err: any) {
      console.error('Error saving permission:', err);
      setError(err.message || 'Failed to save permission');
    }
  };

  // Handle edit
  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setShowCreateForm(true);
    
    // Pre-populate form with existing data
    Object.keys(permissionData).forEach(key => {
      if (permission[key as keyof Permission]) {
        handlePermissionChange({ target: { name: key, value: permission[key as keyof Permission] } } as any);
      }
    });
  };

  // Handle delete
  const handleDelete = async (permissionId: string) => {
    if (window.confirm('Are you sure you want to delete this permission? This may affect role assignments.')) {
      try {
        await SupabaseDatabaseService.deletePermission(permissionId);
        await loadData();
      } catch (err: any) {
        console.error('Error deleting permission:', err);
        setError(err.message || 'Failed to delete permission');
      }
    }
  };

  // Filter permissions
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResource = selectedResource === 'all' || permission.resource === selectedResource;
    
    return matchesSearch && matchesResource;
  });

  // Get unique resources for filter
  const uniqueResources = Array.from(new Set(permissions.map(p => p.resource)));

  // Group permissions by resource for statistics
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
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permissions Management</h1>
            <p className="text-gray-600">Manage system permissions and access controls</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingPermission(null);
            resetPermissionForm();
            setShowCreateForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Permission
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">System-wide permissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Permissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.filter(p => p.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              {permissions.length > 0 ? Math.round((permissions.filter(p => p.is_active).length / permissions.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Groups</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueResources.length}</div>
            <p className="text-xs text-muted-foreground">Different resources</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Types</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(permissions.map(p => p.action)).size}</div>
            <p className="text-xs text-muted-foreground">Different actions</p>
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
          <CardTitle>Search Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, resource, or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-64">
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Resources</option>
                {uniqueResources.map(resource => (
                  <option key={resource} value={resource}>{resource}</option>
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
            <CardTitle>{editingPermission ? 'Edit Permission' : 'Create New Permission'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePermissionSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Permission Name"
                  name="name"
                  value={permissionData.name}
                  onChange={handlePermissionChange('name')}
                  onBlur={handlePermissionBlur('name')}
                  error={permissionErrors.name}
                  placeholder="e.g., users.create"
                  required
                />

                <ValidatedInput
                  label="Resource"
                  name="resource"
                  value={permissionData.resource}
                  onChange={handlePermissionChange('resource')}
                  onBlur={handlePermissionBlur('resource')}
                  error={permissionErrors.resource}
                  placeholder="e.g., users"
                  required
                />

                <ValidatedInput
                  label="Action"
                  name="action"
                  value={permissionData.action}
                  onChange={handlePermissionChange('action')}
                  onBlur={handlePermissionBlur('action')}
                  error={permissionErrors.action}
                  placeholder="e.g., create"
                  required
                />

                <ValidatedSelect
                  label="Status"
                  name="is_active"
                  value={permissionData.is_active}
                  onChange={handlePermissionChange('is_active')}
                  onBlur={handlePermissionBlur('is_active')}
                  error={permissionErrors.is_active}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                  required
                />
              </div>
              
              <ValidationSummary errors={permissionErrors} />

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPermission(null);
                    resetPermissionForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingPermission || !isPermissionValid}
                >
                  {isSubmittingPermission ? 'Saving...' : (editingPermission ? 'Update Permission' : 'Create Permission')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Permissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions ({filteredPermissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPermissions.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No permissions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedResource !== 'all' ? 'Try adjusting your search terms.' : 'Get started by creating your first permission.'}
              </p>
              {!searchTerm && selectedResource === 'all' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Permission
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPermissions.map((permission) => (
                <div key={permission.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{permission.name}</h3>
                        <Badge variant={permission.is_active ? 'default' : 'warning'}>
                          {permission.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="info">{permission.resource}</Badge>
                        <Badge variant="success">{permission.action}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Resource:</strong> {permission.resource}</p>
                        <p><strong>Action:</strong> {permission.action}</p>
                        <p><strong>Created:</strong> {new Date(permission.created_at).toLocaleDateString()}</p>
                        {permission.updated_at && permission.updated_at !== permission.created_at && (
                          <p><strong>Updated:</strong> {new Date(permission.updated_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(permission)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(permission.id)}>
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

      {/* Resource Groups Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions by Resource</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
              <div key={resource} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 capitalize">{resource}</h4>
                <p className="text-sm text-gray-600 mb-3">{resourcePermissions.length} permissions</p>
                <div className="space-y-1">
                  {resourcePermissions.slice(0, 3).map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{permission.action}</span>
                      <Badge variant={permission.is_active ? 'default' : 'warning'}>
                        {permission.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                  {resourcePermissions.length > 3 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{resourcePermissions.length - 3} more...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
