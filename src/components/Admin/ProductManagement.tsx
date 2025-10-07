import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  RefreshCw, 
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Copy,
  TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  processingFee: number;
  prepaymentCharges: number;
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
}

interface ProductFormData {
  name: string;
  code: string;
  description: string;
  category: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  processingFee: number;
  prepaymentCharges: number;
  organizationId: string;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    code: '',
    description: '',
    category: 'personal',
    interestRate: 0,
    minAmount: 0,
    maxAmount: 0,
    minTenure: 0,
    maxTenure: 0,
    processingFee: 0,
    prepaymentCharges: 0,
    organizationId: ''
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productData, orgData] = await Promise.all([
        SupabaseDatabaseService.getLoanProducts(),
        SupabaseDatabaseService.getOrganizations()
      ]);
      
      setProducts(productData);
      setOrganizations(orgData);
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
      
      if (editingProduct) {
        await SupabaseDatabaseService.updateLoanProduct(editingProduct.id, formData);
      } else {
        await SupabaseDatabaseService.createLoanProduct(formData);
      }
      
      await fetchData();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await SupabaseDatabaseService.deleteLoanProduct(productId);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  // Handle duplicate
  const handleDuplicate = async (product: Product) => {
    const duplicateData = {
      ...formData,
      name: `${product.name} (Copy)`,
      code: `${product.code}-COPY`,
      organizationId: product.organizationId || ''
    };
    setFormData(duplicateData);
    setEditingProduct(null);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'personal',
      interestRate: 0,
      minAmount: 0,
      maxAmount: 0,
      minTenure: 0,
      maxTenure: 0,
      processingFee: 0,
      prepaymentCharges: 0,
      organizationId: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      code: product.code,
      description: product.description,
      category: product.category,
      interestRate: product.interestRate,
      minAmount: product.minAmount,
      maxAmount: product.maxAmount,
      minTenure: product.minTenure,
      maxTenure: product.maxTenure,
      processingFee: product.processingFee,
      prepaymentCharges: product.prepaymentCharges,
      organizationId: product.organizationId || ''
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesOrg = orgFilter === 'all' || product.organizationId === orgFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesOrg && matchesStatus;
  });

  // Get category badge
  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      personal: { color: 'blue', label: 'Personal Loan' },
      home: { color: 'green', label: 'Home Loan' },
      business: { color: 'purple', label: 'Business Loan' },
      car: { color: 'orange', label: 'Car Loan' },
      education: { color: 'teal', label: 'Education Loan' },
      gold: { color: 'yellow', label: 'Gold Loan' },
      other: { color: 'gray', label: 'Other' }
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || { color: 'gray', label: category };
    return <Badge variant={config.color as any}>{config.label}</Badge>;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (rate: number) => {
    return `${rate}%`;
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Products</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">Product Management</h1>
          <p className="text-gray-300">Manage loan products and their configurations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchData} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="personal">Personal Loan</option>
                <option value="home">Home Loan</option>
                <option value="business">Business Loan</option>
                <option value="car">Car Loan</option>
                <option value="education">Education Loan</option>
                <option value="gold">Gold Loan</option>
                <option value="other">Other</option>
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
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setOrgFilter('all');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.code}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(product)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getCategoryBadge(product.category)}
                  {product.isActive ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="error">Inactive</Badge>
                  )}
                </div>
                
                {product.description && (
                  <p className="text-sm text-gray-600">{product.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Interest Rate:</span>
                    <div className="font-semibold text-green-600">
                      {formatPercentage(product.interestRate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount Range:</span>
                    <div className="font-semibold">
                      {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Tenure:</span>
                    <div className="font-semibold">
                      {product.minTenure} - {product.maxTenure} months
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Processing Fee:</span>
                    <div className="font-semibold">
                      {formatCurrency(product.processingFee)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add First Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
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
                      Product Code *
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
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="personal">Personal Loan</option>
                      <option value="home">Home Loan</option>
                      <option value="business">Business Loan</option>
                      <option value="car">Car Loan</option>
                      <option value="education">Education Loan</option>
                      <option value="gold">Gold Loan</option>
                      <option value="other">Other</option>
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
                      Interest Rate (%) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="50"
                      required
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Processing Fee (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.processingFee}
                      onChange={(e) => setFormData({ ...formData, processingFee: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Amount (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Amount (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.maxAmount}
                      onChange={(e) => setFormData({ ...formData, maxAmount: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Tenure (months) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.minTenure}
                      onChange={(e) => setFormData({ ...formData, minTenure: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Tenure (months) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.maxTenure}
                      onChange={(e) => setFormData({ ...formData, maxTenure: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prepayment Charges (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.prepaymentCharges}
                    onChange={(e) => setFormData({ ...formData, prepaymentCharges: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                      editingProduct ? 'Update Product' : 'Create Product'
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
