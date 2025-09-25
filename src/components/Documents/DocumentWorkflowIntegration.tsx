import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Download, 
  Upload,
  MessageCircle,
  Shield,
  User,
  Briefcase,
  Home,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useNavigation } from '../../contexts/NavigationContext';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface DocumentWorkflowIntegrationProps {
  caseId: string;
  onDocumentVerified?: (documentId: string) => void;
  onDocumentRejected?: (documentId: string, reason: string) => void;
  onRequestAdditionalDocuments?: (documentTypes: string[]) => void;
}

interface DocumentRequirement {
  id: string;
  type: string;
  name: string;
  description: string;
  category: 'identity' | 'financial' | 'business' | 'property' | 'employment';
  required: boolean;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected' | 'missing';
  uploadedDocument?: any;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  icon: React.ComponentType<any>;
}

export function DocumentWorkflowIntegration({ 
  caseId, 
  onDocumentVerified,
  onDocumentRejected,
  onRequestAdditionalDocuments
}: DocumentWorkflowIntegrationProps) {
  const { user } = useAuth();
  const { navigateDirect } = useNavigation();
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRequirement | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchDocumentWorkflow();
  }, [caseId]);

  const fetchDocumentWorkflow = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch case details
      const caseData = await SupabaseDatabaseService.getCaseById(caseId);
      setCurrentCase(caseData);

      // Fetch uploaded documents
      const documents = await SupabaseDatabaseService.getDocumentsByCaseId(caseId);
      setUploadedDocuments(documents);

      // Build document requirements based on case type
      const requirements = buildDocumentRequirements(caseData, documents);
      setDocumentRequirements(requirements);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch document workflow');
    } finally {
      setLoading(false);
    }
  };

  const buildDocumentRequirements = (caseData: any, documents: any[]): DocumentRequirement[] => {
    const baseRequirements: DocumentRequirement[] = [
      {
        id: 'pan_card',
        type: 'pan_card',
        name: 'PAN Card',
        description: 'Permanent Account Number card for identity verification',
        category: 'identity',
        required: true,
        status: 'pending',
        icon: User
      },
      {
        id: 'aadhaar_card',
        type: 'aadhaar_card',
        name: 'Aadhaar Card',
        description: 'Aadhaar card for identity and address verification',
        category: 'identity',
        required: true,
        status: 'pending',
        icon: User
      },
      {
        id: 'bank_statement',
        type: 'bank_statement',
        name: 'Bank Statement',
        description: 'Last 6 months bank statement for financial verification',
        category: 'financial',
        required: true,
        status: 'pending',
        icon: TrendingUp
      },
      {
        id: 'salary_certificate',
        type: 'salary_certificate',
        name: 'Salary Certificate',
        description: 'Salary certificate from employer',
        category: 'employment',
        required: true,
        status: 'pending',
        icon: Briefcase
      },
      {
        id: 'address_proof',
        type: 'address_proof',
        name: 'Address Proof',
        description: 'Utility bill or rental agreement for address verification',
        category: 'identity',
        required: true,
        status: 'pending',
        icon: Home
      }
    ];

    // Update status based on uploaded documents
    return baseRequirements.map(req => {
      const uploadedDoc = documents.find(doc => doc.document_type === req.type);
      if (uploadedDoc) {
        return {
          ...req,
          status: uploadedDoc.status === 'verified' ? 'verified' : 
                 uploadedDoc.status === 'rejected' ? 'rejected' : 'uploaded',
          uploadedDocument: uploadedDoc,
          verifiedBy: uploadedDoc.verified_by,
          verifiedAt: uploadedDoc.verified_at,
          rejectionReason: uploadedDoc.rejection_reason
        };
      }
      return req;
    });
  };

  const handleDocumentVerification = async (requirement: DocumentRequirement, action: 'verify' | 'reject') => {
    if (!user || !requirement.uploadedDocument) return;

    setProcessing(`${action}_${requirement.id}`);
    try {
      if (action === 'verify') {
        await SupabaseDatabaseService.updateDocument(requirement.uploadedDocument.id, {
          status: 'verified',
          verified_by: user.id,
          verified_at: new Date().toISOString()
        });

        // Update requirement status
        const updatedRequirements = documentRequirements.map(req => 
          req.id === requirement.id 
            ? { ...req, status: 'verified', verifiedBy: user.id, verifiedAt: new Date().toISOString() }
            : req
        );
        setDocumentRequirements(updatedRequirements);

        // Notify customer
        await SupabaseDatabaseService.sendNotification({
          user_id: currentCase.customer_id,
          type: 'document_verified',
          title: 'Document Verified',
          message: `Your ${requirement.name} has been verified successfully.`,
          metadata: { case_id: caseId, document_type: requirement.type }
        });

        onDocumentVerified?.(requirement.uploadedDocument.id);

      } else {
        // Show rejection modal
        setSelectedDocument(requirement);
        setShowRejectionModal(true);
      }

    } catch (err) {
      console.error('Document verification failed:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setProcessing(null);
    }
  };

  const handleDocumentRejection = async () => {
    if (!user || !selectedDocument?.uploadedDocument || !rejectionReason) return;

    try {
      await SupabaseDatabaseService.updateDocument(selectedDocument.uploadedDocument.id, {
        status: 'rejected',
        rejection_reason: rejectionReason,
        rejected_by: user.id,
        rejected_at: new Date().toISOString()
      });

      // Update requirement status
      const updatedRequirements = documentRequirements.map(req => 
        req.id === selectedDocument.id 
          ? { 
              ...req, 
              status: 'rejected', 
              rejectionReason: rejectionReason 
            }
          : req
      );
      setDocumentRequirements(updatedRequirements);

      // Notify customer
      await SupabaseDatabaseService.sendNotification({
        user_id: currentCase.customer_id,
        type: 'document_rejected',
        title: 'Document Rejected',
        message: `Your ${selectedDocument.name} was rejected: ${rejectionReason}`,
        metadata: { 
          case_id: caseId, 
          document_type: selectedDocument.type,
          rejection_reason: rejectionReason
        }
      });

      onDocumentRejected?.(selectedDocument.uploadedDocument.id, rejectionReason);

      // Reset modal
      setShowRejectionModal(false);
      setSelectedDocument(null);
      setRejectionReason('');

    } catch (err) {
      console.error('Document rejection failed:', err);
      setError(err instanceof Error ? err.message : 'Rejection failed');
    }
  };

  const handleRequestAdditionalDocuments = () => {
    const missingDocuments = documentRequirements
      .filter(req => req.status === 'pending' || req.status === 'rejected')
      .map(req => req.name);

    onRequestAdditionalDocuments?.(missingDocuments);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'uploaded': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return CheckCircle;
      case 'uploaded': return Upload;
      case 'rejected': return XCircle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'identity': return User;
      case 'financial': return TrendingUp;
      case 'business': return Briefcase;
      case 'property': return Home;
      case 'employment': return Briefcase;
      default: return FileText;
    }
  };

  const completedDocuments = documentRequirements.filter(req => req.status === 'verified').length;
  const totalRequired = documentRequirements.filter(req => req.required).length;
  const completionPercentage = totalRequired > 0 ? (completedDocuments / totalRequired) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading document workflow...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={fetchDocumentWorkflow} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Document Verification Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Document Completion</h3>
                <p className="text-sm text-gray-600">
                  {completedDocuments} of {totalRequired} required documents verified
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(completionPercentage)}%
                </div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>

            {completionPercentage === 100 && (
              <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  All required documents verified! Case ready for next stage.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documentRequirements.map((requirement) => {
              const StatusIcon = getStatusIcon(requirement.status);
              const CategoryIcon = getCategoryIcon(requirement.category);

              return (
                <div key={requirement.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{requirement.name}</h4>
                          {requirement.required && (
                            <Badge variant="warning" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{requirement.description}</p>
                        {requirement.verifiedBy && (
                          <p className="text-xs text-green-600">
                            Verified by {requirement.verifiedBy} on {new Date(requirement.verifiedAt || '').toLocaleDateString()}
                          </p>
                        )}
                        {requirement.rejectionReason && (
                          <p className="text-xs text-red-600">
                            Rejected: {requirement.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(requirement.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {requirement.status}
                      </Badge>

                      {requirement.status === 'uploaded' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleDocumentVerification(requirement, 'verify')}
                            disabled={processing === `verify_${requirement.id}`}
                          >
                            {processing === `verify_${requirement.id}` ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="error"
                            onClick={() => handleDocumentVerification(requirement, 'reject')}
                            disabled={processing === `reject_${requirement.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {requirement.uploadedDocument && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigateDirect(`/document-manager/${caseId}?document=${requirement.uploadedDocument.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleRequestAdditionalDocuments}
          disabled={documentRequirements.every(req => req.status === 'verified')}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Request Additional Documents
        </Button>

        <Button
          onClick={fetchDocumentWorkflow}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Document</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting {selectedDocument.name}:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
              rows={3}
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedDocument(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="error"
                onClick={handleDocumentRejection}
                disabled={!rejectionReason.trim()}
              >
                Reject Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
