import React, { useState, useEffect } from 'react';
import { 
  Workflow, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  User, 
  FileText, 
  Shield,
  MessageSquare,
  History,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useNavigation } from '../../contexts/NavigationContext';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface CaseWorkflowManagerProps {
  caseId: string;
  onStatusChange?: (newStatus: string) => void;
  onNavigateToCase?: (caseId: string) => void;
  onNavigateToDocuments?: (caseId: string) => void;
  onNavigateToCompliance?: (caseId: string) => void;
}

interface WorkflowStage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  description: string;
  icon: React.ComponentType<any>;
  actions: WorkflowAction[];
  completedAt?: string;
  assignedTo?: string;
  estimatedTime?: string;
}

interface WorkflowAction {
  id: string;
  label: string;
  type: 'approve' | 'reject' | 'request_info' | 'assign' | 'escalate' | 'view';
  icon: React.ComponentType<any>;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function CaseWorkflowManager({ 
  caseId, 
  onStatusChange,
  onNavigateToCase,
  onNavigateToDocuments,
  onNavigateToCompliance
}: CaseWorkflowManagerProps) {
  const { user } = useAuth();
  const { navigateDirect } = useNavigation();
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchCaseWorkflow();
  }, [caseId]);

  const fetchCaseWorkflow = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch case details
      const caseData = await SupabaseDatabaseService.getCaseById(caseId);
      setCurrentCase(caseData);

      // Fetch workflow stages
      const stages = await SupabaseDatabaseService.getCaseWorkflowStages(caseId);
      setWorkflowStages(await buildWorkflowStages(caseData, stages));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case workflow');
    } finally {
      setLoading(false);
    }
  };

  const buildWorkflowStages = async (caseData: any, stages: any[]): Promise<WorkflowStage[]> => {
    const baseStages: WorkflowStage[] = [
      {
        id: 'submission',
        name: 'Application Submitted',
        status: 'completed',
        description: 'Customer submitted loan application',
        icon: FileText,
        actions: [],
        completedAt: caseData?.created_at
      },
      {
        id: 'document_verification',
        name: 'Document Verification',
        status: caseData?.status === 'open' ? 'current' : 
                ['in_progress', 'review'].includes(caseData?.status) ? 'current' : 'pending',
        description: 'Verify customer documents and KYC',
        icon: Shield,
        actions: [
          {
            id: 'view_documents',
            label: 'View Documents',
            type: 'view',
            icon: Eye,
            onClick: () => onNavigateToDocuments?.(caseId)
          },
          {
            id: 'verify_documents',
            label: 'Mark Verified',
            type: 'approve',
            icon: CheckCircle,
            onClick: () => handleWorkflowAction('document_verified')
          },
          {
            id: 'request_more_docs',
            label: 'Request More',
            type: 'request_info',
            icon: MessageSquare,
            onClick: () => handleWorkflowAction('request_documents')
          }
        ]
      },
      {
        id: 'credit_assessment',
        name: 'Credit Assessment',
        status: ['in_progress', 'review'].includes(caseData?.status) ? 'current' : 
                ['approved', 'rejected'].includes(caseData?.status) ? 'completed' : 'pending',
        description: 'Assess creditworthiness and risk',
        icon: User,
        actions: [
          {
            id: 'approve_credit',
            label: 'Approve Credit',
            type: 'approve',
            icon: CheckCircle,
            onClick: () => handleWorkflowAction('credit_approved')
          },
          {
            id: 'reject_credit',
            label: 'Reject Credit',
            type: 'reject',
            icon: AlertTriangle,
            onClick: () => handleWorkflowAction('credit_rejected')
          },
          {
            id: 'escalate_credit',
            label: 'Escalate',
            type: 'escalate',
            icon: ArrowRight,
            onClick: () => handleWorkflowAction('credit_escalated')
          }
        ]
      },
      {
        id: 'compliance_review',
        name: 'Compliance Review',
        status: caseData?.status === 'approved' ? 'completed' : 'pending',
        description: 'Final compliance and regulatory check',
        icon: Shield,
        actions: [
          {
            id: 'view_compliance',
            label: 'Review Compliance',
            type: 'view',
            icon: Eye,
            onClick: () => onNavigateToCompliance?.(caseId)
          },
          {
            id: 'approve_compliance',
            label: 'Approve',
            type: 'approve',
            icon: CheckCircle,
            onClick: () => handleWorkflowAction('compliance_approved')
          }
        ]
      },
      {
        id: 'final_approval',
        name: 'Final Approval',
        status: caseData?.status === 'approved' ? 'completed' : 'pending',
        description: 'Final approval and loan disbursement',
        icon: CheckCircle,
        actions: [
          {
            id: 'disburse_loan',
            label: 'Disburse Loan',
            type: 'approve',
            icon: CheckCircle,
            onClick: () => handleWorkflowAction('loan_disbursed')
          }
        ]
      }
    ];

    return baseStages;
  };

  const handleWorkflowAction = async (action: string) => {
    if (!user || !currentCase) return;

    setProcessing(action);
    try {
      let newStatus = currentCase.status;
      let updateData: any = {};

      switch (action) {
        case 'document_verified':
          newStatus = 'in_progress';
          updateData = { 
            status: newStatus,
            updated_at: new Date().toISOString()
          };
          break;

        case 'request_documents':
          // Send notification to customer
          await SupabaseDatabaseService.sendNotification({
            user_id: currentCase.customer_id,
            type: 'document_request',
            title: 'Additional Documents Required',
            message: 'Please provide additional documents for your loan application.',
            metadata: { case_id: caseId }
          });
          break;

        case 'credit_approved':
          newStatus = 'review';
          updateData = { 
            status: newStatus,
            updated_at: new Date().toISOString()
          };
          break;

        case 'credit_rejected':
          newStatus = 'rejected';
          updateData = { 
            status: newStatus,
            updated_at: new Date().toISOString()
          };
          break;

        case 'compliance_approved':
          newStatus = 'approved';
          updateData = { 
            status: newStatus,
            updated_at: new Date().toISOString()
          };
          break;

        case 'loan_disbursed':
          newStatus = 'closed';
          updateData = { 
            status: newStatus,
            updated_at: new Date().toISOString()
          };
          break;
      }

      // Update case status
      if (updateData.status) {
        await SupabaseDatabaseService.updateCase(caseId, updateData);
        
        // Create status history entry
        await SupabaseDatabaseService.createCaseStatusHistory({
          case_id: caseId,
          status: newStatus,
          previous_status: currentCase.status,
          changed_by: user.id,
          reason: `Status changed via workflow: ${action}`,
          metadata: { workflow_action: action }
        });

        // Notify relevant parties
        await notifyStatusChange(newStatus);

        // Refresh workflow
        await fetchCaseWorkflow();
        
        // Call callback
        onStatusChange?.(newStatus);
      }

    } catch (err) {
      console.error('Workflow action failed:', err);
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setProcessing(null);
    }
  };

  const notifyStatusChange = async (newStatus: string) => {
    if (!currentCase) return;

    // Notify customer
    await SupabaseDatabaseService.sendNotification({
      user_id: currentCase.customer_id,
      type: 'case_status_change',
      title: 'Application Status Update',
      message: `Your loan application status has been updated to: ${newStatus}`,
      metadata: { case_id: caseId, new_status: newStatus }
    });

    // Notify assigned user if different from current user
    if (currentCase.assigned_to && currentCase.assigned_to !== user?.id) {
      await SupabaseDatabaseService.sendNotification({
        user_id: currentCase.assigned_to,
        type: 'case_assignment_update',
        title: 'Case Status Update',
        message: `Case ${currentCase.case_number} status updated to: ${newStatus}`,
        metadata: { case_id: caseId, new_status: newStatus }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'current': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'skipped': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getActionVariant = (type: string) => {
    switch (type) {
      case 'approve': return 'success';
      case 'reject': return 'error';
      case 'request_info': return 'warning';
      case 'escalate': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading workflow...</span>
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
            <Button onClick={fetchCaseWorkflow} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Workflow className="h-5 w-5 mr-2" />
          Case Workflow - {currentCase?.case_number}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Workflow Progress */}
          <div className="relative">
            {workflowStages.map((stage, index) => (
              <div key={stage.id} className="relative flex items-start">
                {/* Connection Line */}
                {index < workflowStages.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                )}
                
                {/* Stage Content */}
                <div className="flex items-start space-x-4 w-full">
                  {/* Stage Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getStatusColor(stage.status)}`}>
                    <stage.icon className="h-6 w-6" />
                  </div>
                  
                  {/* Stage Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
                      <Badge variant={stage.status === 'completed' ? 'success' : 
                                   stage.status === 'current' ? 'info' : 'default'}>
                        {stage.status}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mt-1">{stage.description}</p>
                    
                    {stage.completedAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Completed: {new Date(stage.completedAt).toLocaleDateString()}
                      </p>
                    )}
                    
                    {/* Stage Actions */}
                    {stage.status === 'current' && stage.actions.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {stage.actions.map((action) => (
                          <Button
                            key={action.id}
                            size="sm"
                            variant={getActionVariant(action.type) as any}
                            onClick={action.onClick}
                            disabled={processing === action.id || action.disabled}
                            className="flex items-center"
                          >
                            {processing === action.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <action.icon className="h-4 w-4 mr-2" />
                            )}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToCase?.(caseId)}
                className="flex items-center justify-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Case
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToDocuments?.(caseId)}
                className="flex items-center justify-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToCompliance?.(caseId)}
                className="flex items-center justify-center"
              >
                <Shield className="h-4 w-4 mr-2" />
                Compliance
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDirect(`/case/${caseId}?tab=history`)}
                className="flex items-center justify-center"
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
