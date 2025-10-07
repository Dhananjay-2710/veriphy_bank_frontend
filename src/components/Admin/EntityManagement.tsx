import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  FileText, 
  Package, 
  Layers, 
  FileType, 
  Upload,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { 
  useRoles, 
  usePermissions, 
  useAuditLogs, 
  useProducts, 
  useSubProducts, 
  useDocumentTypes, 
  useFiles
} from '../../hooks/useDashboardData';

interface EntityManagementProps {
  onNavigateToEntity?: (entity: string) => void;
}

export function EntityManagement({ onNavigateToEntity }: EntityManagementProps) {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'audit' | 'products' | 'sub-products' | 'document-types' | 'files'>('roles');
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: any}>({});
  const { user } = useAuth();
  
  // Get data from Supabase
  const { roles, loading: rolesLoading, error: rolesError, refetch: refetchRoles } = useRoles(selectedFilters);
  const { permissions, loading: permissionsLoading, error: permissionsError, refetch: refetchPermissions } = usePermissions(selectedFilters);
  const { auditLogs, loading: auditLoading, error: auditError, refetch: refetchAuditLogs } = useAuditLogs(selectedFilters);
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts(selectedFilters);
  const { subProducts, loading: subProductsLoading, error: subProductsError, refetch: refetchSubProducts } = useSubProducts(selectedFilters);
  const { documentTypes, loading: docTypesLoading, error: docTypesError, refetch: refetchDocumentTypes } = useDocumentTypes(selectedFilters);
  const { files, loading: filesLoading, error: filesError, refetch: refetchFiles } = useFiles(selectedFilters);

  // Note: Real-time subscriptions are handled automatically by the individual hooks

  const tabs = [
    { id: 'roles', label: 'Roles', icon: Users, count: roles.length },
    { id: 'permissions', label: 'Permissions', icon: Shield, count: permissions.length },
    { id: 'audit', label: 'Audit Logs', icon: FileText, count: auditLogs.length },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'sub-products', label: 'Sub Products', icon: Layers, count: subProducts.length },
    { id: 'document-types', label: 'Document Types', icon: FileType, count: documentTypes.length },
    { id: 'files', label: 'Files', icon: Upload, count: files.length },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'roles': return { data: roles, loading: rolesLoading, error: rolesError, refetch: refetchRoles };
      case 'permissions': return { data: permissions, loading: permissionsLoading, error: permissionsError, refetch: refetchPermissions };
      case 'audit': return { data: auditLogs, loading: auditLoading, error: auditError, refetch: refetchAuditLogs };
      case 'products': return { data: products, loading: productsLoading, error: productsError, refetch: refetchProducts };
      case 'sub-products': return { data: subProducts, loading: subProductsLoading, error: subProductsError, refetch: refetchSubProducts };
      case 'document-types': return { data: documentTypes, loading: docTypesLoading, error: docTypesError, refetch: refetchDocumentTypes };
      case 'files': return { data: files, loading: filesLoading, error: filesError, refetch: refetchFiles };
      default: return { data: [], loading: false, error: null, refetch: () => {} };
    }
  };

  const { data, loading, error, refetch } = getCurrentData();

  const renderEntityCard = (entity: any, index: number) => {
    switch (activeTab) {
      case 'roles':
        return (
          <Card key={entity.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{entity.name}</h3>
                  <p className="text-gray-600 text-sm">{entity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={entity.isActive ? 'default' : 'secondary'}>
                      {entity.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs text-gray-500">{entity.permissions.length} permissions</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'permissions':
        return (
          <Card key={entity.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{entity.name}</h3>
                  <p className="text-gray-600 text-sm">{entity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={entity.isActive ? 'default' : 'secondary'}>
                      {entity.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{entity.resource}:{entity.action}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'audit':
        return (
          <Card key={entity.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{entity.action}</h3>
                    <Badge variant="outline">{entity.resourceType}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{entity.details}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>User: {entity.userName}</span>
                    <span>IP: {entity.ipAddress}</span>
                    <span>{new Date(entity.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'products':
        return (
          <Card key={entity.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{entity.name}</h3>
                  <p className="text-gray-600 text-sm">{entity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={entity.isActive ? 'default' : 'secondary'}>
                      {entity.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{entity.category}</Badge>
                    <span className="text-xs text-gray-500">{entity.interestRate}% interest</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Amount: ₹{entity.minAmount.toLocaleString()} - ₹{entity.maxAmount.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'sub-products':
        return (
          <Card key={entity.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{entity.name}</h3>
                  <p className="text-gray-600 text-sm">{entity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={entity.isActive ? 'default' : 'secondary'}>
                      {entity.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{entity.productName}</Badge>
                    <span className="text-xs text-gray-500">{entity.interestRate}% interest</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Amount: ₹{entity.minAmount.toLocaleString()} - ₹{entity.maxAmount.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'document-types':
        return (
          <Card key={entity.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{entity.name}</h3>
                  <p className="text-gray-600 text-sm">{entity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={entity.isActive ? 'default' : 'secondary'}>
                      {entity.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{entity.category}</Badge>
                    <Badge variant={entity.isRequired ? 'destructive' : 'outline'}>
                      {entity.isRequired ? 'Required' : 'Optional'}
                    </Badge>
                    <Badge variant="secondary">{entity.priority} priority</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'files':
        return (
          <Card key={entity.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{entity.originalName}</h3>
                  <p className="text-gray-600 text-sm">Uploaded by: {entity.uploaderName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={entity.isPublic ? 'default' : 'secondary'}>
                      {entity.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <Badge variant="outline">{entity.fileType}</Badge>
                    <span className="text-xs text-gray-500">
                      {(entity.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(entity.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {activeTab} data...</p>
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
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading {activeTab}</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">Entity Management</h1>
          <p className="text-gray-300">Manage roles, permissions, products, and other system entities</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetch} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab.slice(0, -1)}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <Badge variant="secondary" className="ml-1">
                    {tab.count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={selectedFilters.status || ''}
              onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value || undefined})}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            {activeTab === 'products' && (
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={selectedFilters.category || ''}
                onChange={(e) => setSelectedFilters({...selectedFilters, category: e.target.value || undefined})}
              >
                <option value="">All Categories</option>
                <option value="personal">Personal Loan</option>
                <option value="home">Home Loan</option>
                <option value="business">Business Loan</option>
                <option value="vehicle">Vehicle Loan</option>
              </select>
            )}
            
            {activeTab === 'audit' && (
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={selectedFilters.startDate || ''}
                onChange={(e) => setSelectedFilters({...selectedFilters, startDate: e.target.value || undefined})}
                placeholder="Start Date"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Display */}
      <div className="grid grid-cols-1 gap-6">
        {data.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No {activeTab} found</p>
            </CardContent>
          </Card>
        ) : (
          data.map((entity: any, index: number) => renderEntityCard(entity, index))
        )}
      </div>
    </div>
  );
}
