import React, { useState, useRef } from 'react';
import { ArrowLeft, FileText, CheckCircle, XCircle, Clock, AlertTriangle, Eye, Download, MessageCircle, Upload, Filter, Search, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Document } from '../../types';
import { useDocuments, useRealtimeDocuments } from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { useAuth } from '../../contexts/AuthContextFixed';
import { DocumentWorkflowIntegration } from './DocumentWorkflowIntegration';

interface DocumentManagerProps {
  caseId?: string;
  onBack: () => void;
  onSendMessage?: (message: string, documentId?: string) => void;
}

export function DocumentManager({ caseId, onBack, onSendMessage }: DocumentManagerProps) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [activeTab, setActiveTab] = useState('documents');

  // Get real documents data from database
  const { documents, loading: documentsLoading, error: documentsError, refetch } = useDocuments(caseId || '');

  // Loading state
  if (documentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (documentsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Documents</p>
            <p className="text-sm text-gray-600 mt-2">{documentsError}</p>
          </div>
          <Button onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Calculate categories from real documents data
  const categories = [
    { id: 'all', label: 'All Documents', count: documents.length },
    { id: 'identity', label: 'Identity', count: documents.filter(d => d.category === 'identity').length },
    { id: 'financial', label: 'Financial', count: documents.filter(d => d.category === 'financial').length },
    { id: 'business', label: 'Business', count: documents.filter(d => d.category === 'business').length },
    { id: 'property', label: 'Property', count: documents.filter(d => d.category === 'property').length },
    { id: 'employment', label: 'Employment', count: documents.filter(d => d.category === 'employment').length }
  ];

  // Use dynamic documents if available, otherwise fallback to mock
  const displayDocuments = documents.length > 0 ? documents : mockDocuments;

  // If no caseId is provided, show case selection interface
  if (!caseId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
            <p className="text-gray-600">Select a case to manage documents</p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Case Selected</h3>
            <p className="text-gray-600 mb-4">Please select a case to view and manage its documents.</p>
            <Button onClick={() => window.location.href = '/cases'}>
              View Cases
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusCounts = {
    all: displayDocuments.length,
    pending: displayDocuments.filter(d => d.status === 'pending').length,
    received: displayDocuments.filter(d => d.status === 'received').length,
    verified: displayDocuments.filter(d => d.status === 'verified').length,
    rejected: displayDocuments.filter(d => d.status === 'rejected').length
  };

  const filteredDocuments = displayDocuments.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'received':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>;
      case 'received':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="default">Pending Upload</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="success" size="sm">Low</Badge>;
      default:
        return <Badge size="sm">{priority}</Badge>;
    }
  };

  const handleDocumentAction = async (action: string, document: Document) => {
    if (!user?.id) return;

    try {
      switch (action) {
        case 'approve':
          await SupabaseDatabaseService.approveDocument(document.id, user.id);
          await refetch();
          break;
        case 'reject':
          setSelectedDocument(document);
          setReviewMode(true);
          break;
        case 'request_reupload':
          if (onSendMessage) {
            onSendMessage(
              `Hi! We need you to re-upload your ${document.name}. ${document.rejectionReason || 'Please ensure the document is clear and complete.'}`,
              document.id
            );
          }
          break;
      }
    } catch (error) {
      console.error('Error handling document action:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocumentType || !caseId || !user?.id) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // For now, we'll use a mock file path. In a real app, you'd upload to Supabase Storage first
      const filePath = `documents/${caseId}/${selectedFile.name}`;
      
      await SupabaseDatabaseService.uploadDocument(
        caseId,
        selectedDocumentType,
        selectedFile.name,
        filePath,
        selectedFile.size,
        selectedFile.type.split('/')[1] || 'unknown'
      );

      setUploadProgress(100);
      await refetch();
      
      setShowUploadModal(false);
      setSelectedFile(null);
      setSelectedDocumentType('');
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const types = await SupabaseDatabaseService.getDocumentTypes();
      setDocumentTypes(types);
    } catch (error) {
      console.error('Error loading document types:', error);
    }
  };

  React.useEffect(() => {
    if (showUploadModal) {
      loadDocumentTypes();
    }
  }, [showUploadModal]);

  // Real-time updates for documents
  useRealtimeDocuments(caseId || '', (payload) => {
    console.log('Document update received:', payload);
    refetch(); // Refresh the documents list when changes occur
  });

  const handleRejectDocument = async (reason: string) => {
    if (selectedDocument && user?.id) {
      try {
        await SupabaseDatabaseService.rejectDocument(selectedDocument.id, reason, user.id);
        await refetch();
        
        if (onSendMessage) {
          onSendMessage(
            `Hi! Your ${selectedDocument.name} has been reviewed. ${reason} Please upload a corrected version.`,
            selectedDocument.id
          );
        }
      } catch (error) {
        console.error('Error rejecting document:', error);
      }
    }
    setSelectedDocument(null);
    setReviewMode(false);
  };

  if (reviewMode && selectedDocument) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setReviewMode(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Document</h1>
            <p className="text-gray-600">{selectedDocument.name}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Document Preview</h3>
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">{selectedDocument.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedDocument.fileType} • {selectedDocument.fileSize}MB
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Rejection Reasons</h3>
                {[
                  'Document is not clear or readable',
                  'Document appears to be incomplete',
                  'Document format is not acceptable',
                  'Document is expired or outdated',
                  'Information does not match application details',
                  'Document quality is too poor'
                ].map((reason, index) => (
                  <button
                    key={index}
                    onClick={() => handleRejectDocument(reason)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="success" 
                  onClick={() => handleDocumentAction('approve', selectedDocument)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Document
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setReviewMode(false)}
                  className="flex-1"
                >
                  Cancel Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (documentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (documentsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading documents: {documentsError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
            <p className="text-gray-600">Review and manage customer documents</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
          <Button variant="outline" onClick={refetch} disabled={documentsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${documentsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Request Documents
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 mr-2 inline" />
            Document List
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workflow'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircle className="h-4 w-4 mr-2 inline" />
            Document Workflow
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'workflow' && caseId && (
        <DocumentWorkflowIntegration
          caseId={caseId}
          onDocumentVerified={(documentId) => {
            console.log('Document verified:', documentId);
            refetch(); // Refresh the document list
          }}
          onDocumentRejected={(documentId, reason) => {
            console.log('Document rejected:', documentId, reason);
            refetch(); // Refresh the document list
          }}
          onRequestAdditionalDocuments={(documentTypes) => {
            console.log('Requesting additional documents:', documentTypes);
            // Could trigger a message to customer
          }}
        />
      )}

      {activeTab === 'documents' && (
        <>
          {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card 
            key={status}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === status ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setSelectedStatus(status)}
          >
            <CardContent className="text-center p-3">
              <div className="text-lg font-bold text-gray-900">{count}</div>
              <p className="text-xs text-gray-600 capitalize">{status.replace('_', ' ')}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(document.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
                      {document.required && <span className="text-red-500 text-sm">*</span>}
                      {getPriorityBadge(document.priority)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="capitalize">{document.category} document</span>
                      {document.fileType && <span>{document.fileType}</span>}
                      {document.fileSize && <span>{document.fileSize}MB</span>}
                    </div>
                    {document.uploadedAt && (
                      <p className="text-xs text-gray-500">
                        Uploaded: {new Date(document.uploadedAt).toLocaleString()}
                      </p>
                    )}
                    {document.reviewedBy && (
                      <p className="text-xs text-gray-500">
                        Reviewed by: {document.reviewedBy}
                      </p>
                    )}
                    {document.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">{document.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(document.status)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {document.status !== 'pending' && (
                    <>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex space-x-2">
                  {document.status === 'received' && (
                    <>
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handleDocumentAction('approve', document)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="error" 
                        size="sm"
                        onClick={() => handleDocumentAction('reject', document)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {document.status === 'rejected' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDocumentAction('request_reupload', document)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Request Re-upload
                    </Button>
                  )}
                  {document.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDocumentAction('request_reupload', document)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Send Reminder
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters.</p>
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upload Document</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select document type</option>
                  {documentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedDocumentType || uploading}
                  className="flex-1"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        </>
      )}
    </div>
  );
}