import React, { useState } from 'react';
import { ArrowLeft, FileText, CheckCircle, XCircle, Clock, AlertTriangle, Eye, Download, MessageCircle, Upload, Filter, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Document } from '../../types';
import { getDocumentRequirements } from '../../data/documentRequirements';

interface DocumentManagerProps {
  onBack: () => void;
  onSendMessage?: (message: string, documentId?: string) => void;
}

export function DocumentManager({ onBack, onSendMessage }: DocumentManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  // Mock documents with enhanced data
  const documents: Document[] = [
    {
      id: 'doc1',
      name: 'Aadhaar Card',
      type: 'identity',
      category: 'identity',
      status: 'verified',
      required: true,
      priority: 'high',
      uploadedAt: '2025-01-09T10:30:00Z',
      verifiedAt: '2025-01-09T11:15:00Z',
      reviewedBy: 'Priya Sharma',
      fileSize: 2.1,
      fileType: 'PDF'
    },
    {
      id: 'doc2',
      name: 'PAN Card',
      type: 'identity',
      category: 'identity',
      status: 'verified',
      required: true,
      priority: 'high',
      uploadedAt: '2025-01-09T10:45:00Z',
      verifiedAt: '2025-01-09T11:20:00Z',
      reviewedBy: 'Priya Sharma',
      fileSize: 1.8,
      fileType: 'PDF'
    },
    {
      id: 'doc3',
      name: 'Bank Statements (6 months)',
      type: 'financial',
      category: 'financial',
      status: 'received',
      required: true,
      priority: 'high',
      uploadedAt: '2025-01-09T11:00:00Z',
      fileSize: 8.5,
      fileType: 'PDF'
    },
    {
      id: 'doc4',
      name: 'GST Returns',
      type: 'business',
      category: 'business',
      status: 'rejected',
      required: true,
      priority: 'high',
      uploadedAt: '2025-01-09T09:30:00Z',
      reviewedAt: '2025-01-09T14:15:00Z',
      reviewedBy: 'Rajesh Kumar',
      rejectionReason: 'Documents are not clear. Please upload high-resolution scans.',
      fileSize: 3.2,
      fileType: 'JPG'
    },
    {
      id: 'doc5',
      name: 'ITR (Last 3 years)',
      type: 'business',
      category: 'business',
      status: 'received',
      required: true,
      priority: 'high',
      uploadedAt: '2025-01-09T14:30:00Z',
      fileSize: 12.3,
      fileType: 'PDF'
    },
    {
      id: 'doc6',
      name: 'Property Documents',
      type: 'property',
      category: 'property',
      status: 'pending',
      required: true,
      priority: 'high'
    },
    {
      id: 'doc7',
      name: 'Employment Certificate',
      type: 'employment',
      category: 'employment',
      status: 'received',
      required: false,
      priority: 'medium',
      uploadedAt: '2025-01-09T13:15:00Z',
      fileSize: 1.2,
      fileType: 'PDF'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Documents', count: documents.length },
    { id: 'identity', label: 'Identity', count: documents.filter(d => d.category === 'identity').length },
    { id: 'financial', label: 'Financial', count: documents.filter(d => d.category === 'financial').length },
    { id: 'business', label: 'Business', count: documents.filter(d => d.category === 'business').length },
    { id: 'property', label: 'Property', count: documents.filter(d => d.category === 'property').length },
    { id: 'employment', label: 'Employment', count: documents.filter(d => d.category === 'employment').length }
  ];

  const statusCounts = {
    all: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    received: documents.filter(d => d.status === 'received').length,
    verified: documents.filter(d => d.status === 'verified').length,
    rejected: documents.filter(d => d.status === 'rejected').length
  };

  const filteredDocuments = documents.filter(doc => {
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

  const handleDocumentAction = (action: string, document: Document) => {
    switch (action) {
      case 'approve':
        console.log('Approving document:', document.id);
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
  };

  const handleRejectDocument = (reason: string) => {
    if (selectedDocument && onSendMessage) {
      onSendMessage(
        `Hi! Your ${selectedDocument.name} has been reviewed. ${reason} Please upload a corrected version.`,
        selectedDocument.id
      );
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
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Request Documents
          </Button>
          <Button>
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

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
    </div>
  );
}