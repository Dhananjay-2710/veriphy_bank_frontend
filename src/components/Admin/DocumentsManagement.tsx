import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Plus, Edit, Trash2, Search, RefreshCw, AlertTriangle, BarChart3, TrendingUp, Shield, Clock, Eye, CheckCircle, XCircle } from 'lucide-react';
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

interface Document {
  id: string;
  customerId: string;
  documentTypeId: string;
  fileId?: string;
  uploadedBy: string;
  status: string;
  submittedAt: string;
  reviewStartedAt?: string;
  reviewCompletedAt?: string;
  verifiedBy?: string;
  verifiedOn?: string;
  expiryDate?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  // Related data
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  documentType?: {
    id: string;
    name: string;
    category: string;
    isRequired: boolean;
    priority: string;
  };
  uploadedByUser?: {
    id: string;
    name: string;
    email: string;
  };
  verifiedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

interface DocumentsManagementProps {
  onBack: () => void;
}

export function DocumentsManagement({ onBack }: DocumentsManagementProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedDocumentType, setSelectedDocumentType] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  // Form validation for create/edit document
  const {
    values: documentData,
    errors: documentErrors,
    isValid: isDocumentValid,
    isSubmitting: isSubmittingDocument,
    handleChange: handleDocumentChange,
    handleBlur: handleDocumentBlur,
    handleSubmit: handleDocumentSubmit,
    reset: resetDocumentForm
  } = useFormValidation({
    validationRules: {
      customerId: {
        required: true,
        message: 'Customer is required'
      },
      documentTypeId: {
        required: true,
        message: 'Document type is required'
      },
      status: {
        required: true,
        message: 'Status is required'
      },
      uploadedBy: {
        required: true,
        message: 'Uploaded by is required'
      }
    },
    initialValues: {
      customerId: '',
      documentTypeId: '',
      status: 'submitted',
      uploadedBy: '',
      expiryDate: '',
      metadata: ''
    }
  });

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load documents, customers, document types, and users
      const [documentsData, customersData, documentTypesData, usersData] = await Promise.all([
        SupabaseDatabaseService.getDocuments(),
        SupabaseDatabaseService.getCustomers(),
        SupabaseDatabaseService.getDocumentTypes(),
        SupabaseDatabaseService.getUsers()
      ]);
      
      console.log('🔍 Documents loaded:', documentsData.length);
      console.log('🔍 Customers loaded:', customersData.length);
      console.log('🔍 Document types loaded:', documentTypesData.length);
      console.log('🔍 Users loaded:', usersData.length);
      
      // Map documents data to match interface
      const mappedDocuments = documentsData.map(doc => ({
        id: doc.id,
        customerId: doc.customerId || doc.customer_id,
        documentTypeId: doc.documentTypeId || doc.document_type_id,
        fileId: doc.fileId || doc.file_id,
        uploadedBy: doc.uploadedBy || doc.uploaded_by,
        status: doc.status,
        submittedAt: doc.submittedAt || doc.submitted_at,
        reviewStartedAt: doc.reviewStartedAt || doc.review_started_at,
        reviewCompletedAt: doc.reviewCompletedAt || doc.review_completed_at,
        verifiedBy: doc.verifiedBy || doc.verified_by,
        verifiedOn: doc.verifiedOn || doc.verified_on,
        expiryDate: doc.expiryDate || doc.expiry_date,
        metadata: doc.metadata,
        createdAt: doc.createdAt || doc.created_at,
        updatedAt: doc.updatedAt || doc.updated_at,
        // Add related data
        customer: customersData.find(c => c.id === (doc.customerId || doc.customer_id)),
        documentType: documentTypesData.find(dt => dt.id === (doc.documentTypeId || doc.document_type_id)),
        uploadedByUser: usersData.find(u => u.id === (doc.uploadedBy || doc.uploaded_by)),
        verifiedByUser: usersData.find(u => u.id === (doc.verifiedBy || doc.verified_by))
      }));
      
      setDocuments(mappedDocuments);
      setCustomers(customersData);
      setDocumentTypes(documentTypesData);
      setUsers(usersData);
      
      // Log documents management view for audit purposes
      try {
        await AuditLogger.logDashboardView('documents_management', AuditLogger.getCurrentUserId());
      } catch (auditError) {
        console.error('Error logging documents management view:', auditError);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription for documents
    const subscription = supabase
      .channel('documents-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'documents' },
        (payload) => {
          console.log('Document change received:', payload);
          loadData(); // Refresh data when documents are modified
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
      const docData = {
        ...values,
        submittedAt: new Date().toISOString(),
        metadata: values.metadata ? JSON.parse(values.metadata) : null
      };

      if (editingDocument) {
        // Update existing document
        await SupabaseDatabaseService.updateDocument(editingDocument.id, docData);
        setEditingDocument(null);
      } else {
        // Create new document
        await SupabaseDatabaseService.createDocument(docData);
      }
      
      resetDocumentForm();
      setShowCreateForm(false);
      await loadData();
    } catch (err: any) {
      console.error('Error saving document:', err);
      setError(err.message || 'Failed to save document');
    }
  };

  // Handle edit
  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setShowCreateForm(true);
    
    // Pre-populate form with existing data
    handleDocumentChange({ target: { name: 'customerId', value: document.customerId } } as any);
    handleDocumentChange({ target: { name: 'documentTypeId', value: document.documentTypeId } } as any);
    handleDocumentChange({ target: { name: 'status', value: document.status } } as any);
    handleDocumentChange({ target: { name: 'uploadedBy', value: document.uploadedBy } } as any);
    handleDocumentChange({ target: { name: 'expiryDate', value: document.expiryDate || '' } } as any);
    handleDocumentChange({ target: { name: 'metadata', value: document.metadata ? JSON.stringify(document.metadata) : '' } } as any);
  };

  // Handle delete
  const handleDelete = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await SupabaseDatabaseService.deleteDocument(documentId);
        await loadData();
      } catch (err: any) {
        console.error('Error deleting document:', err);
        setError(err.message || 'Failed to delete document');
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (documentId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'verified') {
        updates.verifiedOn = new Date().toISOString();
        updates.verifiedBy = users[0]?.id; // Use first user as verifier for demo
      } else if (newStatus === 'review') {
        updates.reviewStartedAt = new Date().toISOString();
      } else if (newStatus === 'rejected') {
        updates.reviewCompletedAt = new Date().toISOString();
      }
      
      await SupabaseDatabaseService.updateDocument(documentId, updates);
      await loadData();
    } catch (err: any) {
      console.error('Error updating document status:', err);
      setError(err.message || 'Failed to update document status');
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    const matchesCustomer = selectedCustomer === 'all' || doc.customerId === selectedCustomer;
    const matchesDocumentType = selectedDocumentType === 'all' || doc.documentTypeId === selectedDocumentType;
    
    return matchesSearch && matchesStatus && matchesCustomer && matchesDocumentType;
  });

  // Get unique statuses
  const statuses = Array.from(new Set(documents.map(d => d.status)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
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
            <p className="text-lg font-semibold">Error Loading Documents</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Documents Management</h1>
            <p className="text-gray-600">Manage system-wide documents and verification</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingDocument(null);
            resetDocumentForm();
            setShowCreateForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Documents in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter(d => d.status === 'verified').length}</div>
            <p className="text-xs text-muted-foreground">
              {documents.length > 0 ? Math.round((documents.filter(d => d.status === 'verified').length / documents.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter(d => d.status === 'submitted').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter(d => d.status === 'rejected').length}</div>
            <p className="text-xs text-muted-foreground">Require resubmission</p>
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
          <CardTitle>Search Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer, document type, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                {statuses.sort().map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <select
                value={selectedDocumentType}
                onChange={(e) => setSelectedDocumentType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Document Types</option>
                {documentTypes.map(docType => (
                  <option key={docType.id} value={docType.id}>{docType.name}</option>
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
            <CardTitle>{editingDocument ? 'Edit Document' : 'Create New Document'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDocumentSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedSelect
                  label="Customer"
                  name="customerId"
                  value={documentData.customerId}
                  onChange={handleDocumentChange('customerId')}
                  onBlur={handleDocumentBlur('customerId')}
                  error={documentErrors.customerId}
                  options={customers.map(customer => ({
                    value: customer.id,
                    label: customer.name
                  }))}
                  required
                />

                <ValidatedSelect
                  label="Document Type"
                  name="documentTypeId"
                  value={documentData.documentTypeId}
                  onChange={handleDocumentChange('documentTypeId')}
                  onBlur={handleDocumentBlur('documentTypeId')}
                  error={documentErrors.documentTypeId}
                  options={documentTypes.map(docType => ({
                    value: docType.id,
                    label: docType.name
                  }))}
                  required
                />

                <ValidatedSelect
                  label="Status"
                  name="status"
                  value={documentData.status}
                  onChange={handleDocumentChange('status')}
                  onBlur={handleDocumentBlur('status')}
                  error={documentErrors.status}
                  options={[
                    { value: 'submitted', label: 'Submitted' },
                    { value: 'review', label: 'Under Review' },
                    { value: 'verified', label: 'Verified' },
                    { value: 'rejected', label: 'Rejected' }
                  ]}
                  required
                />

                <ValidatedSelect
                  label="Uploaded By"
                  name="uploadedBy"
                  value={documentData.uploadedBy}
                  onChange={handleDocumentChange('uploadedBy')}
                  onBlur={handleDocumentBlur('uploadedBy')}
                  error={documentErrors.uploadedBy}
                  options={users.map(user => ({
                    value: user.id,
                    label: user.full_name || user.email
                  }))}
                  required
                />

                <ValidatedInput
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  value={documentData.expiryDate}
                  onChange={handleDocumentChange('expiryDate')}
                  onBlur={handleDocumentBlur('expiryDate')}
                  error={documentErrors.expiryDate}
                />

                <div className="md:col-span-2">
                  <ValidatedInput
                    label="Metadata (JSON)"
                    name="metadata"
                    value={documentData.metadata}
                    onChange={handleDocumentChange('metadata')}
                    onBlur={handleDocumentBlur('metadata')}
                    error={documentErrors.metadata}
                    placeholder='{"notes": "Additional information"}'
                  />
                </div>
              </div>
              
              <ValidationSummary errors={documentErrors} />

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingDocument(null);
                    resetDocumentForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingDocument || !isDocumentValid}
                >
                  {isSubmittingDocument ? 'Saving...' : (editingDocument ? 'Update Document' : 'Create Document')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedStatus !== 'all' || selectedCustomer !== 'all' || selectedDocumentType !== 'all' ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first document.'}
              </p>
              {!searchTerm && selectedStatus === 'all' && selectedCustomer === 'all' && selectedDocumentType === 'all' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{document.documentType?.name || 'Unknown Document Type'}</h3>
                        <Badge variant={
                          document.status === 'verified' ? 'default' : 
                          document.status === 'review' ? 'warning' : 
                          document.status === 'rejected' ? 'error' : 'info'
                        }>
                          {document.status}
                        </Badge>
                        {document.documentType?.isRequired && (
                          <Badge variant="error">Required</Badge>
                        )}
                        <Badge variant="outline">{document.documentType?.category}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Customer:</strong> {document.customer?.name || 'Unknown Customer'}</p>
                        <p><strong>Uploaded by:</strong> {document.uploadedByUser?.name || document.uploadedByUser?.email || 'Unknown User'}</p>
                        {document.verifiedByUser && (
                          <p><strong>Verified by:</strong> {document.verifiedByUser.name || document.verifiedByUser.email}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="font-medium text-gray-700">Submitted</p>
                            <p className="text-sm">{new Date(document.submittedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Status</p>
                            <p className="text-sm capitalize">{document.status}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Expiry</p>
                            <p className="text-sm">{document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : 'No expiry'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Verified</p>
                            <p className="text-sm">{document.verifiedOn ? new Date(document.verifiedOn).toLocaleDateString() : 'Not verified'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(document)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {document.status === 'submitted' && (
                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(document.id, 'verified')}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {document.status === 'submitted' && (
                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(document.id, 'rejected')}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleDelete(document.id)}>
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
