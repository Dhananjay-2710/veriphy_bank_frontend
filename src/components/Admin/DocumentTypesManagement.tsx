import { useState, useEffect } from 'react';
import { ArrowLeft, FileType, Plus, Edit, Trash2, Search, RefreshCw, AlertTriangle, BarChart3, TrendingUp, Shield, Clock } from 'lucide-react';
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

interface DocumentType {
  id: string;
  name: string;
  description?: string;
  category: string;
  isRequired: boolean;
  priority: string;
  validityPeriod?: number;
  isActive: boolean;
  mimeTypes?: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface DocumentTypesManagementProps {
  onBack: () => void;
}

export function DocumentTypesManagement({ onBack }: DocumentTypesManagementProps) {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDocumentType, setEditingDocumentType] = useState<DocumentType | null>(null);

  // Form validation for create/edit document type
  const {
    values: docTypeData,
    errors: docTypeErrors,
    isValid: isDocTypeValid,
    isSubmitting: isSubmittingDocType,
    handleChange: handleDocTypeChange,
    handleBlur: handleDocTypeBlur,
    handleSubmit: handleDocTypeSubmit,
    reset: resetDocTypeForm
  } = useFormValidation({
    validationRules: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 100,
        message: 'Document type name must be 2-100 characters'
      },
      description: {
        maxLength: 500,
        message: 'Description must be less than 500 characters'
      },
      category: {
        required: true,
        message: 'Category is required'
      },
      priority: {
        required: true,
        message: 'Priority is required'
      },
      validityPeriod: {
        min: 0,
        max: 3650,
        message: 'Validity period must be between 0 and 3650 days'
      }
    },
    initialValues: {
      name: '',
      description: '',
      category: 'identity',
      isRequired: 'true',
      priority: 'medium',
      validityPeriod: '',
      isActive: 'true'
    }
  });

  // Load document types
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const documentTypesData = await SupabaseDatabaseService.getDocumentTypes();
      
      console.log('🔍 Document types loaded:', documentTypesData.length);
      
      // Map document types data to match interface
      const mappedDocumentTypes = documentTypesData.map(docType => ({
        id: docType.id,
        name: docType.name,
        description: docType.description,
        category: docType.category,
        isRequired: docType.isRequired,
        priority: docType.priority,
        validityPeriod: docType.validityPeriod,
        isActive: docType.isActive,
        mimeTypes: docType.mimeTypes,
        metadata: docType.metadata,
        createdAt: docType.createdAt,
        updatedAt: docType.updatedAt
      }));
      
      setDocumentTypes(mappedDocumentTypes);
      
      // Log document types management view for audit purposes
      try {
        await AuditLogger.logDashboardView('document_types_management', AuditLogger.getCurrentUserId());
      } catch (auditError) {
        console.error('Error logging document types management view:', auditError);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load document types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription for document types
    const subscription = supabase
      .channel('document-types-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'document_types' },
        (payload) => {
          console.log('Document type change received:', payload);
          loadData(); // Refresh data when document types are modified
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
      // Convert string values to appropriate types
      const docTypeData = {
        ...values,
        isRequired: values.isRequired === 'true',
        validityPeriod: values.validityPeriod ? parseInt(values.validityPeriod) : null,
        isActive: values.isActive === 'true'
      };

      if (editingDocumentType) {
        // Update existing document type
        await SupabaseDatabaseService.updateDocumentType(editingDocumentType.id, docTypeData);
        setEditingDocumentType(null);
      } else {
        // Create new document type
        await SupabaseDatabaseService.createDocumentType(docTypeData);
      }
      
      resetDocTypeForm();
      setShowCreateForm(false);
      await loadData();
    } catch (err: any) {
      console.error('Error saving document type:', err);
      setError(err.message || 'Failed to save document type');
    }
  };

  // Handle edit
  const handleEdit = (docType: DocumentType) => {
    setEditingDocumentType(docType);
    setShowCreateForm(true);
    
    // Pre-populate form with existing data
    handleDocTypeChange({ target: { name: 'name', value: docType.name } } as any);
    handleDocTypeChange({ target: { name: 'description', value: docType.description || '' } } as any);
    handleDocTypeChange({ target: { name: 'category', value: docType.category } } as any);
    handleDocTypeChange({ target: { name: 'isRequired', value: docType.isRequired.toString() } } as any);
    handleDocTypeChange({ target: { name: 'priority', value: docType.priority } } as any);
    handleDocTypeChange({ target: { name: 'validityPeriod', value: docType.validityPeriod?.toString() || '' } } as any);
    handleDocTypeChange({ target: { name: 'isActive', value: docType.isActive.toString() } } as any);
  };

  // Handle delete
  const handleDelete = async (docTypeId: string) => {
    if (window.confirm('Are you sure you want to delete this document type? This action cannot be undone.')) {
      try {
        await SupabaseDatabaseService.deleteDocumentType(docTypeId);
        await loadData();
      } catch (err: any) {
        console.error('Error deleting document type:', err);
        setError(err.message || 'Failed to delete document type');
      }
    }
  };

  // Filter document types
  const filteredDocumentTypes = documentTypes.filter(docType => {
    const matchesSearch = docType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         docType.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || docType.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || docType.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Get unique categories and priorities
  const categories = Array.from(new Set(documentTypes.map(dt => dt.category)));
  const priorities = Array.from(new Set(documentTypes.map(dt => dt.priority)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document types...</p>
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
            <p className="text-lg font-semibold">Error Loading Document Types</p>
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
      <div className="relative flex items-center justify-between">
        <Button variant="outline" onClick={onBack} style={{ background: '#ffffff', color: '#374151' }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">Document Types Management</h1>
          <p className="text-gray-300">Manage document types and their configurations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadData} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingDocumentType(null);
            resetDocTypeForm();
            setShowCreateForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document Type
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Document Types</CardTitle>
            <FileType className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentTypes.length}</div>
            <p className="text-xs text-muted-foreground">Defined in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Types</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentTypes.filter(dt => dt.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              {documentTypes.length > 0 ? Math.round((documentTypes.filter(dt => dt.isActive).length / documentTypes.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Required Types</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentTypes.filter(dt => dt.isRequired).length}</div>
            <p className="text-xs text-muted-foreground">Mandatory documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Document categories</p>
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
          <CardTitle>Search Document Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-48">
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
            <div className="w-48">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                {priorities.sort().map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
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
            <CardTitle>{editingDocumentType ? 'Edit Document Type' : 'Create New Document Type'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDocTypeSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Document Type Name"
                  name="name"
                  value={docTypeData.name}
                  onChange={handleDocTypeChange('name')}
                  onBlur={handleDocTypeBlur('name')}
                  error={docTypeErrors.name}
                  placeholder="e.g., Aadhaar Card"
                  required
                />

                <ValidatedSelect
                  label="Category"
                  name="category"
                  value={docTypeData.category}
                  onChange={handleDocTypeChange('category')}
                  onBlur={handleDocTypeBlur('category')}
                  error={docTypeErrors.category}
                  options={[
                    { value: 'identity', label: 'Identity' },
                    { value: 'financial', label: 'Financial' },
                    { value: 'business', label: 'Business' },
                    { value: 'property', label: 'Property' },
                    { value: 'employment', label: 'Employment' },
                    { value: 'other', label: 'Other' }
                  ]}
                  required
                />

                <div className="md:col-span-2">
                  <ValidatedInput
                    label="Description"
                    name="description"
                    value={docTypeData.description}
                    onChange={handleDocTypeChange('description')}
                    onBlur={handleDocTypeBlur('description')}
                    error={docTypeErrors.description}
                    placeholder="Brief description of the document type"
                  />
                </div>

                <ValidatedSelect
                  label="Priority"
                  name="priority"
                  value={docTypeData.priority}
                  onChange={handleDocTypeChange('priority')}
                  onBlur={handleDocTypeBlur('priority')}
                  error={docTypeErrors.priority}
                  options={[
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' }
                  ]}
                  required
                />

                <ValidatedSelect
                  label="Required"
                  name="isRequired"
                  value={docTypeData.isRequired}
                  onChange={handleDocTypeChange('isRequired')}
                  onBlur={handleDocTypeBlur('isRequired')}
                  error={docTypeErrors.isRequired}
                  options={[
                    { value: 'true', label: 'Required' },
                    { value: 'false', label: 'Optional' }
                  ]}
                  required
                />

                <ValidatedInput
                  label="Validity Period (days)"
                  name="validityPeriod"
                  type="number"
                  value={docTypeData.validityPeriod}
                  onChange={handleDocTypeChange('validityPeriod')}
                  onBlur={handleDocTypeBlur('validityPeriod')}
                  error={docTypeErrors.validityPeriod}
                  placeholder="365"
                />

                <ValidatedSelect
                  label="Status"
                  name="isActive"
                  value={docTypeData.isActive}
                  onChange={handleDocTypeChange('isActive')}
                  onBlur={handleDocTypeBlur('isActive')}
                  error={docTypeErrors.isActive}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                  required
                />
              </div>
              
              <ValidationSummary errors={docTypeErrors} />

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingDocumentType(null);
                    resetDocTypeForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingDocType || !isDocTypeValid}
                >
                  {isSubmittingDocType ? 'Saving...' : (editingDocumentType ? 'Update Document Type' : 'Create Document Type')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Document Types List */}
      <Card>
        <CardHeader>
          <CardTitle>Document Types ({filteredDocumentTypes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocumentTypes.length === 0 ? (
            <div className="text-center py-8">
              <FileType className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No document types found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all' ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first document type.'}
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedPriority === 'all' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document Type
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocumentTypes.map((docType) => (
                <div key={docType.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{docType.name}</h3>
                        <Badge variant={docType.isActive ? 'default' : 'warning'}>
                          {docType.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={docType.isRequired ? 'error' : 'info'}>
                          {docType.isRequired ? 'Required' : 'Optional'}
                        </Badge>
                        <Badge variant={
                          docType.priority === 'high' ? 'error' : 
                          docType.priority === 'medium' ? 'warning' : 'default'
                        }>
                          {docType.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{docType.category}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {docType.description && <p><strong>Description:</strong> {docType.description}</p>}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="font-medium text-gray-700">Category</p>
                            <p className="text-sm capitalize">{docType.category}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Priority</p>
                            <p className="text-sm capitalize">{docType.priority}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Validity Period</p>
                            <p className="text-sm">{docType.validityPeriod ? `${docType.validityPeriod} days` : 'No expiry'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Created</p>
                            <p className="text-sm">{new Date(docType.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(docType)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(docType.id)}>
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
