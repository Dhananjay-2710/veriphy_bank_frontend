import { useState, useEffect } from 'react';
import { ArrowLeft, Layers, Plus, Edit, Trash2, Search, RefreshCw, AlertTriangle, BarChart3, TrendingUp, Package, Link } from 'lucide-react';
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

interface SubProduct {
  id: string;
  name: string;
  code: string;
  description?: string;
  productId: string;
  productName?: string;
  status: string;
  metadata?: any;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  isActive: boolean;
}

interface SubProductsManagementProps {
  onBack: () => void;
}

export function SubProductsManagement({ onBack }: SubProductsManagementProps) {
  const [subProducts, setSubProducts] = useState<SubProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSubProduct, setEditingSubProduct] = useState<SubProduct | null>(null);

  // Form validation for create/edit sub-product
  const {
    values: subProductData,
    errors: subProductErrors,
    isValid: isSubProductValid,
    isSubmitting: isSubmittingSubProduct,
    handleChange: handleSubProductChange,
    handleBlur: handleSubProductBlur,
    handleSubmit: handleSubProductSubmit,
    reset: resetSubProductForm
  } = useFormValidation({
    validationRules: {
      name: {
        required: true,
        minLength: 2,
        message: 'Sub-product name must be at least 2 characters'
      },
      code: {
        required: true,
        minLength: 2,
        message: 'Sub-product code must be at least 2 characters'
      },
      description: {
        required: true,
        minLength: 10,
        message: 'Description must be at least 10 characters'
      },
      productId: {
        required: true,
        message: 'Parent product is required'
      },
      status: {
        required: true,
        message: 'Status is required'
      }
    },
    initialValues: {
      name: '',
      code: '',
      description: '',
      productId: '',
      status: 'active'
    }
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [subProductsData, productsData] = await Promise.all([
        SupabaseDatabaseService.getSubProducts(),
        SupabaseDatabaseService.getProducts()
      ]);
      
      console.log('🔍 Sub-products loaded:', subProductsData.length);
      console.log('🔍 Products loaded:', productsData.length);
      
      setSubProducts(subProductsData);
      setProducts(productsData);
      
      // Log view for audit purposes
      try {
        await AuditLogger.logDashboardView('sub_products_management', AuditLogger.getCurrentUserId());
      } catch (auditError) {
        console.error('Error logging sub-products view:', auditError);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load sub-products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('sub-products-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sub_products' },
        (payload) => {
          console.log('Sub-product change received:', payload);
          loadData();
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
      const subProductData = {
        ...values,
        organizationId: 1 // Assuming organization ID 1
      };

      if (editingSubProduct) {
        // Update existing sub-product
        await SupabaseDatabaseService.updateSubProduct(editingSubProduct.id, subProductData);
      } else {
        // Create new sub-product
        await SupabaseDatabaseService.createSubProduct(subProductData);
      }
      
      resetSubProductForm();
      setShowCreateForm(false);
      setEditingSubProduct(null);
      await loadData();
    } catch (err: any) {
      console.error('Error saving sub-product:', err);
      setError(err.message || 'Failed to save sub-product');
    }
  };

  // Handle edit
  const handleEdit = (subProduct: SubProduct) => {
    setEditingSubProduct(subProduct);
    setShowCreateForm(true);
    
    // Pre-populate form
    handleSubProductChange({ target: { name: 'name', value: subProduct.name } } as any);
    handleSubProductChange({ target: { name: 'code', value: subProduct.code } } as any);
    handleSubProductChange({ target: { name: 'description', value: subProduct.description || '' } } as any);
    handleSubProductChange({ target: { name: 'productId', value: subProduct.productId } } as any);
    handleSubProductChange({ target: { name: 'status', value: subProduct.status } } as any);
  };

  // Handle delete
  const handleDelete = async (subProductId: string) => {
    if (window.confirm('Are you sure you want to delete this sub-product? This action cannot be undone.')) {
      try {
        await SupabaseDatabaseService.deleteSubProduct(subProductId);
        await loadData();
      } catch (err: any) {
        console.error('Error deleting sub-product:', err);
        setError(err.message || 'Failed to delete sub-product');
      }
    }
  };

  // Filter sub-products
  const filteredSubProducts = subProducts.filter(subProduct => {
    const matchesSearch = subProduct.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subProduct.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subProduct.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subProduct.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = selectedProduct === 'all' || subProduct.productId === selectedProduct;
    
    return matchesSearch && matchesProduct;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sub-products...</p>
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
            <p className="text-lg font-semibold">Error Loading Sub-Products</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={loadData}>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sub-Products Management</h1>
            <p className="text-gray-600">Manage sub-products and their configurations</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingSubProduct(null);
            resetSubProductForm();
            setShowCreateForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sub-Product
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sub-Products</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subProducts.length}</div>
            <p className="text-xs text-muted-foreground">Sub-products available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sub-Products</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subProducts.filter(sp => sp.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parent Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Available parent products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subProducts.filter(sp => sp.status === 'active').length}/{subProducts.length}
            </div>
            <p className="text-xs text-muted-foreground">Active/Total</p>
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
          <CardTitle>Search Sub-Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, code, description, or parent product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Products</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
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
            <CardTitle>{editingSubProduct ? 'Edit Sub-Product' : 'Create New Sub-Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubProductSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Sub-Product Name"
                  name="name"
                  value={subProductData.name}
                  onChange={handleSubProductChange('name')}
                  onBlur={handleSubProductBlur('name')}
                  error={subProductErrors.name}
                  placeholder="Enter sub-product name"
                  required
                />

                <ValidatedInput
                  label="Sub-Product Code"
                  name="code"
                  value={subProductData.code}
                  onChange={handleSubProductChange('code')}
                  onBlur={handleSubProductBlur('code')}
                  error={subProductErrors.code}
                  placeholder="Enter unique code"
                  required
                />

                <ValidatedSelect
                  label="Parent Product"
                  name="productId"
                  value={subProductData.productId}
                  onChange={handleSubProductChange('productId')}
                  onBlur={handleSubProductBlur('productId')}
                  error={subProductErrors.productId}
                  options={products.map(product => ({
                    value: product.id,
                    label: product.name
                  }))}
                  required
                />

                <ValidatedSelect
                  label="Status"
                  name="status"
                  value={subProductData.status}
                  onChange={handleSubProductChange('status')}
                  onBlur={handleSubProductBlur('status')}
                  error={subProductErrors.status}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'draft', label: 'Draft' }
                  ]}
                  required
                />

                <div className="md:col-span-2">
                  <ValidatedInput
                    label="Description"
                    name="description"
                    value={subProductData.description}
                    onChange={handleSubProductChange('description')}
                    onBlur={handleSubProductBlur('description')}
                    error={subProductErrors.description}
                    placeholder="Enter detailed description"
                    required
                  />
                </div>
              </div>
              
              <ValidationSummary errors={subProductErrors} />

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingSubProduct(null);
                    resetSubProductForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingSubProduct || !isSubProductValid}
                >
                  {isSubmittingSubProduct ? 'Saving...' : (editingSubProduct ? 'Update Sub-Product' : 'Create Sub-Product')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sub-Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Sub-Products ({filteredSubProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubProducts.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sub-products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedProduct !== 'all' ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first sub-product.'}
              </p>
              {!searchTerm && selectedProduct === 'all' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sub-Product
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubProducts.map((subProduct) => (
                <div key={subProduct.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{subProduct.name}</h3>
                        <Badge variant="outline">{subProduct.code}</Badge>
                        <Badge variant={subProduct.status === 'active' ? 'default' : 'warning'}>
                          {subProduct.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{subProduct.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Parent Product</p>
                          <p className="text-gray-600">{subProduct.productName}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Status</p>
                          <p className="text-gray-600 capitalize">{subProduct.status}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Created</p>
                          <p className="text-gray-600">{new Date(subProduct.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Updated</p>
                          <p className="text-gray-600">{new Date(subProduct.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(subProduct)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(subProduct.id)}>
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