import { useState } from 'react';
import { 
  Building2, 
  Shield, 
  Key, 
  Package,
  Layers,
  FileType,
  FileText,
  Link,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { DepartmentManagement } from '../Admin/DepartmentManagement';
import { RolesManagement } from '../Admin/RolesManagement';
import { PermissionsManagement } from '../Admin/PermissionsManagement';
import { ProductsManagement } from '../Admin/ProductsManagement';
import { SubProductsManagement } from '../Admin/SubProductsManagement';
import { DocumentTypesManagement } from '../Admin/DocumentTypesManagement';
import { DocumentsManagement } from '../Admin/DocumentsManagement';
import { ProductDocumentMapping } from '../Admin/ProductDocumentMapping';

interface AdminDashboardProps {
  onNavigateToUserManagement?: () => void;
  onNavigateToSystemSettings?: () => void;
  onNavigateToAuditLogs?: () => void;
}

export function AdminDashboard({}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'departments' | 'roles' | 'permissions' | 'products' | 'sub-products' | 'document-types' | 'documents' | 'product-document-mapping'>('overview');
  const { user } = useAuth();
  
  const handleBackToOverview = () => {
    setActiveView('overview');
  };

  // Show specific management views
  if (activeView === 'departments') {
    return <DepartmentManagement onBack={handleBackToOverview} />;
  }

  if (activeView === 'roles') {
    return <RolesManagement onBack={handleBackToOverview} />;
  }

  if (activeView === 'permissions') {
    return <PermissionsManagement onBack={handleBackToOverview} />;
  }

  if (activeView === 'products') {
    return <ProductsManagement onBack={handleBackToOverview} />;
  }

  if (activeView === 'sub-products') {
    return <SubProductsManagement onBack={handleBackToOverview} />;
  }

  if (activeView === 'document-types') {
    return <DocumentTypesManagement onBack={handleBackToOverview} />;
  }

  if (activeView === 'documents') {
    return <DocumentsManagement onBack={handleBackToOverview} />;
  }

  if (activeView === 'product-document-mapping') {
    return <ProductDocumentMapping onBack={handleBackToOverview} />;
  }

  // Main overview dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage departments, roles, permissions, products, sub-products, documents, and mappings</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('departments')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Department Management</h3>
                <p className="text-sm text-gray-600">Manage organizational departments and structure</p>
            </div>
          </div>
        </CardContent>
      </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('roles')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Shield className="h-6 w-6" />
            </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Roles Management</h3>
                <p className="text-sm text-gray-600">Create and manage user roles and permissions</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('permissions')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <Key className="h-6 w-6" />
                  </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Permissions Management</h3>
                <p className="text-sm text-gray-600">Configure system permissions and access controls</p>
              </div>
          </div>
        </CardContent>
      </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('products')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                <Package className="h-6 w-6" />
            </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Products Management</h3>
                <p className="text-sm text-gray-600">Manage loan products and their configurations</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('sub-products')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-teal-100 text-teal-600">
                <Layers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Sub-Products Management</h3>
                <p className="text-sm text-gray-600">Manage sub-products and variants of main products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('document-types')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                <FileType className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Document Types Management</h3>
                <p className="text-sm text-gray-600">Manage document types and their configurations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('documents')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-pink-100 text-pink-600">
                <FileText className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Documents Management</h3>
                <p className="text-sm text-gray-600">Manage system-wide documents and verification</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('product-document-mapping')}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-cyan-100 text-cyan-600">
                <Link className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Document Mapping</h3>
                <p className="text-sm text-gray-600">Manage document requirements for products and sub-products</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveView('departments')}
            >
              <Building2 className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Departments</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveView('roles')}
            >
              <Shield className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Roles</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveView('permissions')}
            >
              <Key className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Permissions</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveView('products')}
            >
              <Package className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Products</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveView('sub-products')}
            >
              <Layers className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Sub-Products</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveView('document-types')}
            >
              <FileType className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Document Types</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveView('documents')}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Documents</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setActiveView('product-document-mapping')}
            >
              <Link className="h-6 w-6 mb-2" />
              <span className="text-sm">Product Document Mapping</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current User</h4>
              <p className="text-sm text-gray-600">{user?.email || 'Not logged in'}</p>
              <p className="text-sm text-gray-600">Role: {user?.role || 'Unknown'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
              <p className="text-sm text-gray-600">Name: {user?.full_name || 'Not available'}</p>
              <p className="text-sm text-gray-600">ID: {user?.id || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}