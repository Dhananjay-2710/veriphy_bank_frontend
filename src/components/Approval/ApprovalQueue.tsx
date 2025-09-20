import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Eye, AlertTriangle, Clock, FileText, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { useApprovalQueue } from '../../hooks/useDashboardData';

interface ApprovalQueueProps {
  onBack: () => void;
  onNavigateToCase: (caseId: string) => void;
}

export function ApprovalQueue({ onBack, onNavigateToCase }: ApprovalQueueProps) {
  // Use real approval queue data from hook
  const { data: queueData, loading: queueLoading, error: queueError, refetch: refetchQueue } = useApprovalQueue();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Use mock data as fallback if no real data
  const queue = queueData.length > 0 ? queueData : [
    {
      id: 'case-001',
      customer: 'Ramesh & Sunita Gupta',
      phone: '+91-9876543210',
      loanType: 'Home Loan',
      amount: '₹50L',
      risk: 'medium',
      completeness: 85,
      waitTime: '2 hours',
      flags: ['Missing GST', 'High Amount'],
      priority: 'high',
      submittedBy: 'Priya Sharma'
    },
    {
      id: 'case-004',
      customer: 'Deepak Agarwal',
      phone: '+91-9876543213',
      loanType: 'Business Loan',
      amount: '₹25L',
      risk: 'high',
      completeness: 100,
      waitTime: '6 hours',
      flags: ['High Risk Profile'],
      priority: 'high',
      submittedBy: 'Vikram Joshi'
    },
    {
      id: 'case-005',
      customer: 'Kavya Menon',
      phone: '+91-9876543214',
      loanType: 'Personal Loan',
      amount: '₹3L',
      risk: 'low',
      completeness: 100,
      waitTime: '1 day',
      flags: [],
      priority: 'medium',
      submittedBy: 'Meera Nair'
    },
    {
      id: 'case-006',
      customer: 'Rohit Sharma',
      phone: '+91-9876543215',
      loanType: 'Car Loan',
      amount: '₹8L',
      risk: 'low',
      completeness: 95,
      waitTime: '3 hours',
      flags: ['Minor Income Discrepancy'],
      priority: 'low',
      submittedBy: 'Arjun Reddy'
    }
  ];

  const handleApprove = async (caseId: string) => {
    try {
      setProcessingAction(caseId);
      console.log('Approving case:', caseId);
      
      await SupabaseDatabaseService.approveCase(caseId, {
        approvedBy: 'current_user_id', // This should come from auth context
        approvedAt: new Date().toISOString(),
        notes: 'Approved via approval queue'
      });
      
      // Refresh the queue
      refetchQueue();
      
      // Show success message
      alert('Case approved successfully!');
    } catch (err) {
      console.error('Error approving case:', err);
      alert('Failed to approve case. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (caseId: string) => {
    try {
      setProcessingAction(caseId);
      console.log('Rejecting case:', caseId);
      
      await SupabaseDatabaseService.rejectCase(caseId, {
        rejectedBy: 'current_user_id', // This should come from auth context
        rejectedAt: new Date().toISOString(),
        reason: 'Rejected via approval queue'
      });
      
      // Refresh the queue
      refetchQueue();
      
      // Show success message
      alert('Case rejected successfully!');
    } catch (err) {
      console.error('Error rejecting case:', err);
      alert('Failed to reject case. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCustomerDoubleClick = (customer: string, phone: string, caseId: string) => {
    console.log(`Opening WhatsApp conversation with ${customer} (${phone}) for case ${caseId}`);
    onNavigateToCase(caseId);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="error" size="sm">High Risk</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="success" size="sm">Low Risk</Badge>;
      default:
        return <Badge size="sm">{risk}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="info" size="sm">Low</Badge>;
      default:
        return <Badge size="sm">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approval Queue</h1>
            <p className="text-gray-600">Review and approve loan applications</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refetchQueue} disabled={queueLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${queueLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{queue.length} cases pending review</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {(error || queueError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{error || queueError}</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {queueLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading approval queue...</span>
        </div>
      )}

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-sm text-gray-600">High Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-yellow-600">4.2h</div>
            <p className="text-sm text-gray-600">Avg. Wait Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-sm text-gray-600">Complete Cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-blue-600">8</div>
            <p className="text-sm text-gray-600">Today's Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Approval Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Cases Awaiting Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queue.map((case_) => (
              <div 
                key={case_.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 
                        className="text-lg font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                        onDoubleClick={() => handleCustomerDoubleClick(case_.customer, case_.phone, case_.id)}
                        title="Double-click to open WhatsApp conversation"
                      >
                        {case_.customer}
                      </h3>
                      {getPriorityBadge(case_.priority)}
                      {getRiskBadge(case_.risk)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>{case_.loanType}</span>
                      <span>{case_.amount}</span>
                      <span>{case_.phone}</span>
                      <span>Submitted by: {case_.submittedBy}</span>
                      <span className="text-blue-500 text-xs">Double-click name for WhatsApp</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Waiting for {case_.waitTime}</span>
                    </div>
                  </div>
                </div>

                {/* Progress and Flags */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Document Completeness</span>
                    <span className="font-medium">{case_.completeness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${case_.completeness}%` }}
                    ></div>
                  </div>
                  
                  {case_.flags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-700">Compliance Flags:</span>
                      <div className="flex space-x-1">
                        {case_.flags.map((flag, idx) => (
                          <Badge key={idx} variant="warning" size="sm">{flag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigateToCase(case_.id)}
                    className="flex-1 mr-2"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review Case
                  </Button>
                  <div className="flex space-x-2">
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => handleApprove(case_.id)}
                      disabled={processingAction === case_.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {processingAction === case_.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button 
                      variant="error" 
                      size="sm"
                      onClick={() => handleReject(case_.id)}
                      disabled={processingAction === case_.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {processingAction === case_.id ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}