import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Plus, Edit, Trash2, Search, RefreshCw, AlertTriangle, BarChart3, TrendingUp, DollarSign, Percent } from 'lucide-react';
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

interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductsManagementProps {
  onBack: () => void;
}

export function ProductsManagement({ onBack }: ProductsManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form validation for create/edit product
  const {
    values: productData,
    errors: productErrors,
    isValid: isProductValid,
    isSubmitting: isSubmittingProduct,
    handleChange: handleProductChange,
    handleBlur: handleProductBlur,
    handleSubmit: handleProductSubmit,
    reset: resetProductForm
  } = useFormValidation({
    validationRules: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 100,
        message: 'Product name must be 2-100 characters'
      },
      code: {
        required: true,
        minLength: 2,
        maxLength: 20,
        message: 'Product code must be 2-20 characters'
      },
      description: {
        maxLength: 500,
        message: 'Description must be less than 500 characters'
      },
      category: {
        required: true,
        message: 'Category is required'
      },
      interestRate: {
        required: true,
        min: 0,
        max: 100,
        message: 'Interest rate must be between 0 and 100'
      },
      minAmount: {
        required: true,
        min: 0,
        message: 'Minimum amount must be greater than 0'
      },
      maxAmount: {
        required: true,
        min: 0,
        message: 'Maximum amount must be greater than 0'
      },
      minTenure: {
        required: true,
        min: 1,
        message: 'Minimum tenure must be at least 1 month'
      },
      maxTenure: {
        required: true,
        min: 1,
        message: 'Maximum tenure must be at least 1 month'
      }
    },
    initialValues: {
      name: '',
      code: '',
      description: '',
      category: 'secured',
      interestRate: '',
      minAmount: '',
      maxAmount: '',
      minTenure: '',
      maxTenure: '',
      isActive: 'true'
    }
  });

  // Load products
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productsData = await SupabaseDatabaseService.getProducts();
      
      console.log('🔍 Products loaded:', productsData.length);
      
      // Map products data to match interface
      const mappedProducts = productsData.map(product => ({
        id: product.id,
        name: product.name,
        code: product.code,
        description: product.description,
        category: product.category,
        interestRate: product.interestRate,
        minAmount: product.minAmount,
        maxAmount: product.maxAmount,
        minTenure: product.minTenure,
        maxTenure: product.maxTenure,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));
      
      setProducts(mappedProducts);
      
      // Log products management view for audit purposes
      try {
        await AuditLogger.logDashboardView('products_management', AuditLogger.getCurrentUserId());
      } catch (auditError) {
        console.error('Error logging products management view:', auditError);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription for products
    const subscription = supabase
      .channel('products-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Product change received:', payload);
          loadData(); // Refresh data when products are modified
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
      // Convert string values to numbers
      const productData = {
        ...values,
        interestRate: parseFloat(values.interestRate),
        minAmount: parseFloat(values.minAmount),
        maxAmount: parseFloat(values.maxAmount),
        minTenure: parseInt(values.minTenure),
        maxTenure: parseInt(values.maxTenure),
        isActive: values.isActive === 'true'
      };

      if (editingProduct) {
        // Update existing product
        await SupabaseDatabaseService.updateProduct(editingProduct.id, productData);
        setEditingProduct(null);
      } else {
        // Create new product
        await SupabaseDatabaseService.createProduct(productData);
      }
      
      resetProductForm();
      setShowCreateForm(false);
      await loadData();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product');
    }
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowCreateForm(true);
    
    // Pre-populate form with existing data
    handleProductChange({ target: { name: 'name', value: product.name } } as any);
    handleProductChange({ target: { name: 'code', value: product.code } } as any);
    handleProductChange({ target: { name: 'description', value: product.description || '' } } as any);
    handleProductChange({ target: { name: 'category', value: product.category } } as any);
    handleProductChange({ target: { name: 'interestRate', value: product.interestRate.toString() } } as any);
    handleProductChange({ target: { name: 'minAmount', value: product.minAmount.toString() } } as any);
    handleProductChange({ target: { name: 'maxAmount', value: product.maxAmount.toString() } } as any);
    handleProductChange({ target: { name: 'minTenure', value: product.minTenure.toString() } } as any);
    handleProductChange({ target: { name: 'maxTenure', value: product.maxTenure.toString() } } as any);
    handleProductChange({ target: { name: 'isActive', value: product.isActive.toString() } } as any);
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await SupabaseDatabaseService.deleteProduct(productId);
        await loadData();
      } catch (err: any) {
        console.error('Error deleting product:', err);
        setError(err.message || 'Failed to delete product');
      }
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
            <p className="text-lg font-semibold">Error Loading Products</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600">Manage loan products and their configurations</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingProduct(null);
            resetProductForm();
            setShowCreateForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Defined in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              {products.length > 0 ? Math.round((products.filter(p => p.isActive).length / products.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Interest Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.length > 0 ? (products.reduce((sum, p) => sum + p.interestRate, 0) / products.length).toFixed(2) : '0.00'}%
            </div>
            <p className="text-xs text-muted-foreground">Across all products</p>
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
          <CardTitle>Search Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.sort().map(category => (
                  <option key={category} value={category}>{category}</option>
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
            <CardTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProductSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Product Name"
                  name="name"
                  value={productData.name}
                  onChange={handleProductChange('name')}
                  onBlur={handleProductBlur('name')}
                  error={productErrors.name}
                  placeholder="e.g., Home Loan"
                  required
                />

                <ValidatedInput
                  label="Product Code"
                  name="code"
                  value={productData.code}
                  onChange={handleProductChange('code')}
                  onBlur={handleProductBlur('code')}
                  error={productErrors.code}
                  placeholder="e.g., HOME"
                  required
                />

                <div className="md:col-span-2">
                  <ValidatedInput
                    label="Description"
                    name="description"
                    value={productData.description}
                    onChange={handleProductChange('description')}
                    onBlur={handleProductBlur('description')}
                    error={productErrors.description}
                    placeholder="Brief description of the product"
                  />
                </div>

                <ValidatedSelect
                  label="Category"
                  name="category"
                  value={productData.category}
                  onChange={handleProductChange('category')}
                  onBlur={handleProductBlur('category')}
                  error={productErrors.category}
                  options={[
                    { value: 'secured', label: 'Secured' },
                    { value: 'unsecured', label: 'Unsecured' }
                  ]}
                  required
                />

                <ValidatedSelect
                  label="Status"
                  name="isActive"
                  value={productData.isActive}
                  onChange={handleProductChange('isActive')}
                  onBlur={handleProductBlur('isActive')}
                  error={productErrors.isActive}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                  required
                />

                <ValidatedInput
                  label="Interest Rate (%)"
                  name="interestRate"
                  type="number"
                  step="0.01"
                  value={productData.interestRate}
                  onChange={handleProductChange('interestRate')}
                  onBlur={handleProductBlur('interestRate')}
                  error={productErrors.interestRate}
                  placeholder="8.50"
                  required
                />

                <ValidatedInput
                  label="Minimum Amount (₹)"
                  name="minAmount"
                  type="number"
                  step="0.01"
                  value={productData.minAmount}
                  onChange={handleProductChange('minAmount')}
                  onBlur={handleProductBlur('minAmount')}
                  error={productErrors.minAmount}
                  placeholder="500000"
                  required
                />

                <ValidatedInput
                  label="Maximum Amount (₹)"
                  name="maxAmount"
                  type="number"
                  step="0.01"
                  value={productData.maxAmount}
                  onChange={handleProductChange('maxAmount')}
                  onBlur={handleProductBlur('maxAmount')}
                  error={productErrors.maxAmount}
                  placeholder="50000000"
                  required
                />

                <ValidatedInput
                  label="Minimum Tenure (months)"
                  name="minTenure"
                  type="number"
                  value={productData.minTenure}
                  onChange={handleProductChange('minTenure')}
                  onBlur={handleProductBlur('minTenure')}
                  error={productErrors.minTenure}
                  placeholder="60"
                  required
                />

                <ValidatedInput
                  label="Maximum Tenure (months)"
                  name="maxTenure"
                  type="number"
                  value={productData.maxTenure}
                  onChange={handleProductChange('maxTenure')}
                  onBlur={handleProductBlur('maxTenure')}
                  error={productErrors.maxTenure}
                  placeholder="360"
                  required
                />
              </div>
              
              <ValidationSummary errors={productErrors} />

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingProduct(null);
                    resetProductForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingProduct || !isProductValid}
                >
                  {isSubmittingProduct ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first product.'}
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Product
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                        <Badge variant={product.isActive ? 'default' : 'warning'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="info">{product.category}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Code:</strong> {product.code}</p>
                        {product.description && <p><strong>Description:</strong> {product.description}</p>}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="font-medium text-gray-700">Interest Rate</p>
                            <p className="text-lg font-semibold text-blue-600">{product.interestRate}%</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Amount Range</p>
                            <p className="text-sm">₹{product.minAmount.toLocaleString()} - ₹{product.maxAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Tenure Range</p>
                            <p className="text-sm">{product.minTenure} - {product.maxTenure} months</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Created</p>
                            <p className="text-sm">{new Date(product.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
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
