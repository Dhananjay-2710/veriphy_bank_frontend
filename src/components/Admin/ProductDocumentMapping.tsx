import { useState, useEffect } from 'react';
import { ArrowLeft, Link, Plus, Edit, Trash2, Search, RefreshCw, AlertTriangle, BarChart3, TrendingUp, Shield, Clock, FileType, Package, Layers } from 'lucide-react';
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

interface ProductDocumentMapping {
  id: string;
  productId: string;
  documentTypeId: string;
  mandatory: boolean;
  notes?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  // Related data
  product?: {
    id: string;
    name: string;
    code: string;
    category: string;
  };
  documentType?: {
    id: string;
    name: string;
    category: string;
    priority: string;
  };
}

interface SubProductDocumentMapping {
  id: string;
  subProductId: string;
  documentTypeId: string;
  mandatory: boolean;
  notes?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  // Related data
  subProduct?: {
    id: string;
    name: string;
    code: string;
    productId: string;
  };
  parentProduct?: {
    id: string;
    name: string;
    code: string;
    category: string;
  };
  documentType?: {
    id: string;
    name: string;
    category: string;
    priority: string;
  };
}

interface ProductDocumentMappingProps {
  onBack: () => void;
}

export function ProductDocumentMapping({ onBack }: ProductDocumentMappingProps) {
  const [productMappings, setProductMappings] = useState<ProductDocumentMapping[]>([]);
  const [subProductMappings, setSubProductMappings] = useState<SubProductDocumentMapping[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [subProducts, setSubProducts] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'products' | 'sub-products'>('products');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMapping, setEditingMapping] = useState<any>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form validation for create/edit mapping
  const {
    values: mappingData,
    errors: mappingErrors,
    isValid: isMappingValid,
    isSubmitting: isSubmittingMapping,
    handleChange: handleMappingChange,
    handleBlur: handleMappingBlur,
    handleSubmit: handleMappingSubmit,
    reset: resetMappingForm
  } = useFormValidation({
    validationRules: {
      productId: {
        required: true,
        message: 'Product is required'
      },
      documentTypeId: {
        required: true,
        message: 'Document type is required'
      },
      mandatory: {
        required: true,
        message: 'Mandatory status is required'
      }
    },
    initialValues: {
      productId: '',
      documentTypeId: '',
      mandatory: 'true',
      notes: ''
    }
  });

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all required data
      const [productMappingsData, subProductMappingsData, productsData, subProductsData, documentTypesData] = await Promise.all([
        SupabaseDatabaseService.getDocumentAgainstProduct(),
        SupabaseDatabaseService.getDocAgainstSubProduct(),
        SupabaseDatabaseService.getProducts(),
        SupabaseDatabaseService.getSubProducts(),
        SupabaseDatabaseService.getDocumentTypes()
      ]);
      
      console.log('🔍 Product mappings loaded:', productMappingsData.length);
      console.log('🔍 Sub-product mappings loaded:', subProductMappingsData.length);
      console.log('🔍 Products loaded:', productsData.length);
      console.log('🔍 Sub-products loaded:', subProductsData.length);
      console.log('🔍 Document types loaded:', documentTypesData.length);
      
      // Debug: Log first few items to check structure
      if (productMappingsData.length > 0) {
        console.log('📋 Sample product mapping:', productMappingsData[0]);
      }
      if (subProductMappingsData.length > 0) {
        console.log('📋 Sample sub-product mapping:', subProductMappingsData[0]);
      }
      if (subProductsData.length > 0) {
        console.log('📋 Sample sub-product:', subProductsData[0]);
      }
      
      // Map product mappings data
      const mappedProductMappings = productMappingsData.map(mapping => ({
        id: mapping.id,
        productId: mapping.productId || mapping.product_id,
        documentTypeId: mapping.documentTypeId || mapping.document_type_id,
        mandatory: mapping.mandatory,
        notes: mapping.notes,
        metadata: mapping.metadata,
        createdAt: mapping.createdAt || mapping.created_at,
        updatedAt: mapping.updatedAt || mapping.updated_at,
        product: productsData.find(p => p.id === (mapping.productId || mapping.product_id)),
        documentType: documentTypesData.find(dt => dt.id === (mapping.documentTypeId || mapping.document_type_id))
      }));
      
      // Map sub-product mappings data
      const mappedSubProductMappings = subProductMappingsData.map(mapping => {
        const subProduct = subProductsData.find(sp => sp.id === (mapping.subProductId || mapping.sub_product_id));
        const parentProduct = productsData.find(p => p.id === subProduct?.productId);
        
        return {
          id: mapping.id,
          subProductId: mapping.subProductId || mapping.sub_product_id,
          documentTypeId: mapping.documentTypeId || mapping.document_type_id,
          mandatory: mapping.mandatory,
          notes: mapping.notes,
          metadata: mapping.metadata,
          createdAt: mapping.createdAt || mapping.created_at,
          updatedAt: mapping.updatedAt || mapping.updated_at,
          subProduct: subProduct,
          parentProduct: parentProduct,
          documentType: documentTypesData.find(dt => dt.id === (mapping.documentTypeId || mapping.document_type_id))
        };
      });
      
      setProductMappings(mappedProductMappings);
      setSubProductMappings(mappedSubProductMappings);
      setProducts(productsData);
      setSubProducts(subProductsData);
      setDocumentTypes(documentTypesData);
      
      // Log view for audit purposes
      try {
        await AuditLogger.logDashboardView('product_document_mapping', AuditLogger.getCurrentUserId());
      } catch (auditError) {
        console.error('Error logging product document mapping view:', auditError);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load product document mappings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up real-time subscriptions
    const productSubscription = supabase
      .channel('product-document-mappings-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'document_against_product' },
        (payload) => {
          console.log('Product document mapping change received:', payload);
          loadData();
        }
      )
      .subscribe();

    const subProductSubscription = supabase
      .channel('sub-product-document-mappings-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'doc_against_sub_product' },
        (payload) => {
          console.log('Sub-product document mapping change received:', payload);
          loadData();
        }
      )
      .subscribe();

    return () => {
      productSubscription.unsubscribe();
      subProductSubscription.unsubscribe();
    };
  }, []);

  // Handle form submission
  const onSubmit = async (values: any) => {
    try {
      if (activeTab === 'products') {
        const mappingData = {
          productId: values.productId,
          documentTypeId: values.documentTypeId,
          mandatory: values.mandatory === 'true',
          notes: values.notes,
          organizationId: 1 // Assuming organization ID 1
        };

        if (editingMapping) {
          // Update existing product mapping
          await SupabaseDatabaseService.updateDocumentAgainstProduct(editingMapping.id, mappingData);
        } else {
          // Create new product mapping
          await SupabaseDatabaseService.createDocumentAgainstProduct(mappingData);
        }
      } else {
        const mappingData = {
          subProductId: values.productId, // Note: using productId field for sub-product ID
          documentTypeId: values.documentTypeId,
          mandatory: values.mandatory === 'true',
          notes: values.notes,
          organizationId: 1 // Assuming organization ID 1
        };

        if (editingMapping) {
          // Update existing sub-product mapping
          await SupabaseDatabaseService.updateDocAgainstSubProduct(editingMapping.id, mappingData);
        } else {
          // Create new sub-product mapping
          await SupabaseDatabaseService.createDocAgainstSubProduct(mappingData);
        }
      }
      
      resetMappingForm();
      setShowCreateForm(false);
      setEditingMapping(null);
      await loadData();
    } catch (err: any) {
      console.error('Error saving mapping:', err);
      setError(err.message || 'Failed to save mapping');
    }
  };

  // Handle edit
  const handleEdit = (mapping: any) => {
    setEditingMapping(mapping);
    setShowCreateForm(true);
    
    // Pre-populate form
    if (activeTab === 'products') {
      handleMappingChange({ target: { name: 'productId', value: mapping.productId } } as any);
    } else {
      handleMappingChange({ target: { name: 'productId', value: mapping.subProductId } } as any);
    }
    handleMappingChange({ target: { name: 'documentTypeId', value: mapping.documentTypeId } } as any);
    handleMappingChange({ target: { name: 'mandatory', value: mapping.mandatory.toString() } } as any);
    handleMappingChange({ target: { name: 'notes', value: mapping.notes || '' } } as any);
  };

  // Handle delete
  const handleDelete = async (mappingId: string, type: 'product' | 'sub-product') => {
    if (window.confirm('Are you sure you want to delete this mapping? This action cannot be undone.')) {
      try {
        if (type === 'product') {
          await SupabaseDatabaseService.deleteDocumentAgainstProduct(mappingId);
        } else {
          await SupabaseDatabaseService.deleteDocAgainstSubProduct(mappingId);
        }
        await loadData();
      } catch (err: any) {
        console.error('Error deleting mapping:', err);
        setError(err.message || 'Failed to delete mapping');
      }
    }
  };

  // Filter mappings
  const filteredProductMappings = productMappings.filter(mapping => {
    const matchesSearch = mapping.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mapping.documentType?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mapping.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = selectedProduct === 'all' || mapping.productId === selectedProduct;
    const matchesCategory = selectedCategory === 'all' || mapping.documentType?.category === selectedCategory;
    
    return matchesSearch && matchesProduct && matchesCategory;
  });

  const filteredSubProductMappings = subProductMappings.filter(mapping => {
    const matchesSearch = mapping.subProduct?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mapping.documentType?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mapping.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = selectedProduct === 'all' || mapping.subProductId === selectedProduct;
    const matchesCategory = selectedCategory === 'all' || mapping.documentType?.category === selectedCategory;
    
    return matchesSearch && matchesProduct && matchesCategory;
  });

  // Pagination logic
  const totalItems = activeTab === 'products' ? filteredProductMappings.length : filteredSubProductMappings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const paginatedProductMappings = filteredProductMappings.slice(startIndex, endIndex);
  const paginatedSubProductMappings = filteredSubProductMappings.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedProduct, selectedCategory, activeTab]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Get unique categories
  const categories = Array.from(new Set([
    ...productMappings.map(m => m.documentType?.category).filter(Boolean),
    ...subProductMappings.map(m => m.documentType?.category).filter(Boolean)
  ]));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product document mappings...</p>
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
            <p className="text-lg font-semibold">Error Loading Mappings</p>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto" style={{ background: '#ffffff', color: '#374151' }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Product Document Mapping</h1>
            <p className="text-sm sm:text-base text-gray-300 mt-1">Manage document requirements for products and sub-products</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline" onClick={loadData} className="w-full sm:w-auto" style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingMapping(null);
            resetMappingForm();
            setShowCreateForm(true);
          }} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Mapping
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Mappings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productMappings.length}</div>
            <p className="text-xs text-muted-foreground">Product-document relationships</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sub-Product Mappings</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subProductMappings.length}</div>
            <p className="text-xs text-muted-foreground">Sub-product-document relationships</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mappings</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productMappings.length + subProductMappings.length}</div>
            <p className="text-xs text-muted-foreground">All document mappings</p>
            <p className="text-xs text-blue-600 mt-1">Page {currentPage} of {totalPages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Document Types</CardTitle>
            <FileType className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentTypes.length}</div>
            <p className="text-xs text-muted-foreground">Available document types</p>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Product Mappings ({productMappings.length})
          </button>
          <button
            onClick={() => setActiveTab('sub-products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sub-products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Layers className="h-4 w-4 inline mr-2" />
            Sub-Product Mappings ({subProductMappings.length})
          </button>
        </nav>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by product, document type, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Products</option>
                  {activeTab === 'products' 
                    ? products.map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))
                    : subProducts.map(subProduct => (
                        <option key={subProduct.id} value={subProduct.id}>{subProduct.name}</option>
                      ))
                  }
                </select>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700">
                    Show:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="block px-3 py-1 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-500">per page</span>
                </div>
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingMapping ? 'Edit Mapping' : 'Create New Mapping'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMappingSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedSelect
                  label={activeTab === 'products' ? 'Product' : 'Sub-Product'}
                  name="productId"
                  value={mappingData.productId}
                  onChange={handleMappingChange('productId')}
                  onBlur={handleMappingBlur('productId')}
                  error={mappingErrors.productId}
                  options={activeTab === 'products' 
                    ? products.map(product => ({
                        value: product.id,
                        label: product.name
                      }))
                    : subProducts.map(subProduct => ({
                        value: subProduct.id,
                        label: subProduct.name
                      }))
                  }
                  required
                />

                <ValidatedSelect
                  label="Document Type"
                  name="documentTypeId"
                  value={mappingData.documentTypeId}
                  onChange={handleMappingChange('documentTypeId')}
                  onBlur={handleMappingBlur('documentTypeId')}
                  error={mappingErrors.documentTypeId}
                  options={documentTypes.map(docType => ({
                    value: docType.id,
                    label: docType.name
                  }))}
                  required
                />

                <ValidatedSelect
                  label="Mandatory"
                  name="mandatory"
                  value={mappingData.mandatory}
                  onChange={handleMappingChange('mandatory')}
                  onBlur={handleMappingBlur('mandatory')}
                  error={mappingErrors.mandatory}
                  options={[
                    { value: 'true', label: 'Required' },
                    { value: 'false', label: 'Optional' }
                  ]}
                  required
                />

                <div className="md:col-span-2">
                  <ValidatedInput
                    label="Notes"
                    name="notes"
                    value={mappingData.notes}
                    onChange={handleMappingChange('notes')}
                    onBlur={handleMappingBlur('notes')}
                    error={mappingErrors.notes}
                    placeholder="Additional notes about this mapping"
                  />
                </div>
              </div>
              
              <ValidationSummary errors={mappingErrors} />

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingMapping(null);
                    resetMappingForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingMapping || !isMappingValid}
                >
                  {isSubmittingMapping ? 'Saving...' : (editingMapping ? 'Update Mapping' : 'Create Mapping')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mappings List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'products' ? 'Product Mappings' : 'Sub-Product Mappings'} 
            ({activeTab === 'products' ? filteredProductMappings.length : filteredSubProductMappings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === 'products' ? (
            paginatedProductMappings.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No product mappings found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedProduct !== 'all' || selectedCategory !== 'all' ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first product mapping.'}
                </p>
                {!searchTerm && selectedProduct === 'all' && selectedCategory === 'all' && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Mapping
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProductMappings.map((mapping) => (
                  <div key={mapping.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{mapping.product?.name}</h3>
                          <Badge variant="outline">{mapping.product?.code}</Badge>
                          <Badge variant={mapping.product?.category === 'secured' ? 'default' : 'warning'}>
                            {mapping.product?.category}
                          </Badge>
                          <span className="text-sm text-gray-500">→</span>
                          <h4 className="text-md font-medium text-gray-700">{mapping.documentType?.name}</h4>
                          <Badge variant={mapping.mandatory ? 'error' : 'info'}>
                            {mapping.mandatory ? 'Required' : 'Optional'}
                          </Badge>
                          <Badge variant="outline">{mapping.documentType?.category}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {mapping.notes && <p><strong>Notes:</strong> {mapping.notes}</p>}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            <div>
                              <p className="font-medium text-gray-700">Product</p>
                              <p className="text-sm">{mapping.product?.name}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Document Type</p>
                              <p className="text-sm">{mapping.documentType?.name}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Category</p>
                              <p className="text-sm capitalize">{mapping.documentType?.category}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Priority</p>
                              <p className="text-sm capitalize">{mapping.documentType?.priority}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(mapping)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(mapping.id, 'product')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            paginatedSubProductMappings.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sub-product mappings found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedProduct !== 'all' || selectedCategory !== 'all' ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first sub-product mapping.'}
                </p>
                {!searchTerm && selectedProduct === 'all' && selectedCategory === 'all' && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Mapping
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedSubProductMappings.map((mapping) => (
                  <div key={mapping.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{mapping.subProduct?.name}</h3>
                          <Badge variant="outline">{mapping.subProduct?.code}</Badge>
                          <span className="text-sm text-gray-500">→</span>
                          <h4 className="text-md font-medium text-gray-700">{mapping.documentType?.name}</h4>
                          <Badge variant={mapping.mandatory ? 'error' : 'info'}>
                            {mapping.mandatory ? 'Required' : 'Optional'}
                          </Badge>
                          <Badge variant="outline">{mapping.documentType?.category}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Parent Product:</strong> {mapping.parentProduct?.name} ({mapping.parentProduct?.code})</p>
                          {mapping.notes && <p><strong>Notes:</strong> {mapping.notes}</p>}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            <div>
                              <p className="font-medium text-gray-700">Sub-Product</p>
                              <p className="text-sm">{mapping.subProduct?.name}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Document Type</p>
                              <p className="text-sm">{mapping.documentType?.name}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Category</p>
                              <p className="text-sm capitalize">{mapping.documentType?.category}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Priority</p>
                              <p className="text-sm capitalize">{mapping.documentType?.priority}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(mapping)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(mapping.id, 'sub-product')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          
          {/* Bottom Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

