import React, { useState, useEffect } from 'react';
import { X, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface CaseAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: {
    id: string;
    caseNumber: string;
    customer?: {
      name: string;
      email?: string;
      phone?: string;
    };
    loanType: string;
    loanAmount: number;
    priority: string;
    status: string;
    assignedTo?: string;
  };
  teamMembers: Array<{
    id: string;
    fullName?: string;
    name?: string;
    email?: string;
    role?: string;
  }>;
  onAssignmentComplete: () => void;
}

export function CaseAssignmentModal({
  isOpen,
  onClose,
  caseData,
  teamMembers,
  onAssignmentComplete
}: CaseAssignmentModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(caseData.assignedTo || '');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId(caseData.assignedTo || '');
      setAssignmentStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, caseData.assignedTo]);

  const handleAssign = async () => {
    if (!selectedUserId) {
      setErrorMessage('Please select a team member to assign this case to.');
      return;
    }

    setIsAssigning(true);
    setAssignmentStatus('idle');
    setErrorMessage('');

    try {
      await SupabaseDatabaseService.assignCaseToUser(caseData.id, selectedUserId);
      setAssignmentStatus('success');
      
      // Close modal after a brief success display
      setTimeout(() => {
        onAssignmentComplete();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error assigning case:', error);
      setAssignmentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to assign case');
    } finally {
      setIsAssigning(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'info';
      case 'in_progress': return 'warning';
      case 'closed': return 'success';
      case 'rejected': return 'error';
      default: return 'info';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Case</h2>
            <p className="text-sm text-gray-600">Assign this case to a team member</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isAssigning}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Case Details */}
        <div className="p-6 border-b bg-gray-50">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Case Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Case Number</label>
                  <p className="text-sm text-gray-900">{caseData.caseNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-sm text-gray-900">{caseData.customer?.name || 'Unknown Customer'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Loan Type</label>
                  <p className="text-sm text-gray-900 capitalize">{caseData.loanType?.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Loan Amount</label>
                  <p className="text-sm text-gray-900">
                    ₹{caseData.loanAmount ? (caseData.loanAmount / 100000).toFixed(0) + 'L' : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <Badge variant={getPriorityColor(caseData.priority)} size="sm">
                    {caseData.priority}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Badge variant={getStatusColor(caseData.status)} size="sm">
                    {caseData.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Section */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Team Member *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAssigning}
              >
                <option value="">Select a team member...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName || member.name} {member.role && `(${member.role})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignment Status */}
            {assignmentStatus === 'success' && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800">Case assigned successfully!</span>
              </div>
            )}

            {assignmentStatus === 'error' && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-800">{errorMessage}</span>
              </div>
            )}

            {/* Team Member Info */}
            {selectedUserId && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Selected Team Member</span>
                </div>
                {(() => {
                  const selectedMember = teamMembers.find(m => m.id === selectedUserId);
                  return selectedMember ? (
                    <div className="text-sm text-blue-800">
                      <p><strong>Name:</strong> {selectedMember.fullName || selectedMember.name}</p>
                      {selectedMember.email && <p><strong>Email:</strong> {selectedMember.email}</p>}
                      {selectedMember.role && <p><strong>Role:</strong> {selectedMember.role}</p>}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isAssigning || !selectedUserId}
            className="min-w-[120px]"
          >
            {isAssigning ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Case'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
