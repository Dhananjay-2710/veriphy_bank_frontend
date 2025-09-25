import { useState } from 'react';
import { ArrowLeft, User, Phone, Briefcase, Home, RefreshCw, AlertTriangle, Workflow, History, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DocumentChecklist } from './DocumentChecklist';
import { WhatsAppTimeline } from './WhatsAppTimeline';
import { ComplianceLog } from './ComplianceLog';
import { WhatsAppCommunicator } from './WhatsAppCommunicator';
import { DocumentManager } from '../Documents/DocumentManager';
import { CaseWorkflowManager } from './CaseWorkflowManager';
import { useCase, useDocuments, useWhatsAppMessages, useComplianceLogs, useCaseStatusHistory, useCaseWorkflowStages } from '../../hooks/useDashboardData';
import { useAuth } from '../../contexts/AuthContextFixed';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface CasePageProps {
  caseId: string;
  onBack: () => void;
}

export function CasePage({ caseId, onBack }: CasePageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { user } = useAuth();
  
  const { case: case_, loading: caseLoading, error: caseError, refetch: refetchCase } = useCase(caseId);
  const { documents: _documents, loading: docsLoading, error: _docsError, refetch: refetchDocs } = useDocuments(caseId);
  const { data: chatMessages, loading: messagesLoading, error: _messagesError, refetch: refetchMessages } = useWhatsAppMessages(caseId);
  const { logs: _complianceLog, loading: logsLoading, error: _logsError, refetch: refetchLogs } = useComplianceLogs(caseId);
  
  // Workflow data
  const { history: statusHistory, refetch: refetchHistory } = useCaseStatusHistory(caseId);
  const { stages: workflowStages, refetch: refetchStages } = useCaseWorkflowStages(caseId);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow', icon: Workflow },
    { id: 'documents', label: 'Documents' },
    { id: 'document-manager', label: 'Document Manager' },
    { id: 'status-history', label: 'Status History', icon: History },
    { id: 'whatsapp', label: 'WhatsApp Timeline' },
    { id: 'communicator', label: 'Chat with Customer' },
    { id: 'compliance', label: 'Compliance Log' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'review':
        return <Badge variant="info">Under Review</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="error">High Risk</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="success">Low Risk</Badge>;
      default:
        return <Badge>{risk}</Badge>;
    }
  };

  const handleSendMessage = (message: string) => {
    // In real implementation, this would send to the database
    console.log('Message sent:', message);
    
    // Simulate customer response
    setTimeout(() => {
      console.log('Customer response received');
    }, 2000);
  };

  const handleSendDocument = (file: File) => {
    // In real implementation, this would update the database
    console.log('Document sent:', file.name);
  };

  // Workflow handlers
  const handleStatusChange = async () => {
    if (!newStatus || !user) return;
    
    try {
      await SupabaseDatabaseService.createCaseStatusHistory({
        case_id: caseId,
        status: newStatus,
        previous_status: case_?.status,
        changed_by: user.id,
        reason: statusReason
      });
      
      // Update case status
      await SupabaseDatabaseService.updateLoanApplication(caseId, { status: newStatus });
      
      setNewStatus('');
      setStatusReason('');
      setShowStatusModal(false);
      refetchCase();
      refetchHistory();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleWorkflowStageUpdate = async (stageId: string, updates: any) => {
    try {
      await SupabaseDatabaseService.updateCaseWorkflowStage(stageId, updates);
      refetchStages();
    } catch (error) {
      console.error('Failed to update workflow stage:', error);
    }
  };

  const handleCreateWorkflowStage = async (stageName: string, stageOrder: number) => {
    try {
      await SupabaseDatabaseService.createCaseWorkflowStage({
        case_id: caseId,
        stage_name: stageName,
        stage_order: stageOrder,
        assigned_to: user?.id
      });
      refetchStages();
    } catch (error) {
      console.error('Failed to create workflow stage:', error);
    }
  };

  const handleRefresh = () => {
    refetchCase();
    refetchDocs();
    refetchMessages();
    refetchLogs();
    refetchHistory();
    refetchStages();
  };

  if (caseError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Case Details</h1>
              <p className="text-gray-600">Error loading case information</p>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading case</h3>
              <p className="mt-1 text-sm text-red-700">
                {caseError}. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (caseLoading || !case_) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Case Details</h1>
              <p className="text-gray-600">Loading case information...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
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
            <h1 className="text-2xl font-bold text-gray-900">Case #{case_.caseNumber}</h1>
            <p className="text-gray-600">{case_.customer.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={caseLoading || docsLoading || messagesLoading || logsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${(caseLoading || docsLoading || messagesLoading || logsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {getStatusBadge(case_.status)}
          {getRiskBadge(case_.customer.riskProfile)}
        </div>
      </div>

      {/* Customer Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{case_.customer.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{case_.customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Employment</p>
                <p className="font-medium capitalize">{case_.customer.employment}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Home className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Loan Amount</p>
                <p className="font-medium">₹{((case_.loanAmount || 0) / 100000).toFixed(0)}L</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DocumentChecklist documents={case_.documents} />
            <WhatsAppTimeline messages={case_.whatsappMessages.slice(-5)} />
          </div>
        )}
        {activeTab === 'documents' && <DocumentChecklist documents={case_.documents} />}
        {activeTab === 'document-manager' && (
          <DocumentManager 
            caseId={caseId}
            onBack={() => setActiveTab('overview')}
            onSendMessage={handleSendMessage}
          />
        )}
        {activeTab === 'whatsapp' && <WhatsAppTimeline messages={chatMessages} />}
        {activeTab === 'communicator' && (
          <div className="max-w-4xl mx-auto">
            <WhatsAppCommunicator 
              messages={chatMessages}
              customerName={case_.customer.name}
              customerPhone={case_.customer.phone}
              onSendMessage={handleSendMessage}
              onSendDocument={handleSendDocument}
            />
          </div>
        )}
        {activeTab === 'compliance' && <ComplianceLog logs={case_.complianceLog} />}
        
        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <CaseWorkflowManager
            caseId={caseId}
            onStatusChange={(newStatus) => {
              // Refresh case data when status changes
              refetchCase();
              setActiveTab('overview'); // Switch to overview to see updated status
            }}
            onNavigateToCase={(caseId) => {
              // Already on case page, just switch tabs
              setActiveTab('overview');
            }}
            onNavigateToDocuments={(caseId) => {
              setActiveTab('documents');
            }}
            onNavigateToCompliance={(caseId) => {
              setActiveTab('compliance');
            }}
          />
        )}
        
        {/* Status History Tab */}
        {activeTab === 'status-history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Status History</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowStatusModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Change Status
                </Button>
                <Button variant="outline" onClick={refetchHistory}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {statusHistory.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusBadge(item.status)}
                          {item.previous_status && (
                            <span className="text-sm text-gray-500">
                              from {item.previous_status}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Changed by:</strong> {item.user?.name || item.changed_by}</p>
                          <p><strong>Date:</strong> {new Date(item.changed_at).toLocaleString()}</p>
                          {item.reason && <p><strong>Reason:</strong> {item.reason}</p>}
                          {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {statusHistory.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No status history found</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      
      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Change Case Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter reason for status change..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleStatusChange}
                  disabled={!newStatus}
                  className="flex-1"
                >
                  Update Status
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}