import React, { useState } from 'react';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle, Eye, FileText, Clock, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ComplianceReviewProps {
  onBack: () => void;
  onNavigateToCase: (caseId: string) => void;
}

export function ComplianceReview({ onBack, onNavigateToCase }: ComplianceReviewProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const complianceIssues = [
    {
      id: 'comp-001',
      caseId: 'case-001',
      customer: 'Ramesh & Sunita Gupta',
      phone: '+91-9876543210',
      loanType: 'Home Loan',
      amount: '₹50L',
      issueType: 'document_mismatch',
      severity: 'high',
      description: 'Income declared in application does not match bank statements',
      flaggedBy: 'System Auto-Check',
      flaggedAt: '2025-01-09T14:30:00Z',
      status: 'open',
      assignedTo: 'Anita Patel',
      dueDate: '2025-01-10T18:00:00Z'
    },
    {
      id: 'comp-002',
      caseId: 'case-004',
      customer: 'Deepak Agarwal',
      phone: '+91-9876543213',
      loanType: 'Business Loan',
      amount: '₹25L',
      issueType: 'kyc_verification',
      severity: 'medium',
      description: 'Business address verification pending from field team',
      flaggedBy: 'KYC Team',
      flaggedAt: '2025-01-09T11:15:00Z',
      status: 'in_progress',
      assignedTo: 'Anita Patel',
      dueDate: '2025-01-11T12:00:00Z'
    },
    {
      id: 'comp-003',
      caseId: 'case-006',
      customer: 'Rohit Sharma',
      phone: '+91-9876543215',
      loanType: 'Personal Loan',
      amount: '₹3L',
      issueType: 'credit_score',
      severity: 'low',
      description: 'Credit score dropped by 15 points since application',
      flaggedBy: 'Credit Bureau API',
      flaggedAt: '2025-01-09T09:45:00Z',
      status: 'resolved',
      assignedTo: 'Anita Patel',
      resolvedAt: '2025-01-09T16:20:00Z'
    },
    {
      id: 'comp-004',
      caseId: 'case-007',
      customer: 'Kavya Menon',
      phone: '+91-9876543214',
      loanType: 'Home Loan',
      amount: '₹35L',
      issueType: 'regulatory_check',
      severity: 'high',
      description: 'Customer appears on PEP (Politically Exposed Person) list',
      flaggedBy: 'AML System',
      flaggedAt: '2025-01-08T16:30:00Z',
      status: 'escalated',
      assignedTo: 'Senior Compliance Officer',
      dueDate: '2025-01-10T10:00:00Z'
    }
  ];

  const handleCustomerDoubleClick = (customer: string, phone: string, caseId: string) => {
    console.log(`Opening WhatsApp conversation with ${customer} (${phone}) for case ${caseId}`);
    onNavigateToCase(caseId);
  };

  const complianceStats = [
    { label: 'Open Issues', value: '8', color: 'red' },
    { label: 'In Progress', value: '12', color: 'yellow' },
    { label: 'Resolved Today', value: '5', color: 'green' },
    { label: 'Escalated', value: '2', color: 'purple' }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="info" size="sm">Low</Badge>;
      default:
        return <Badge size="sm">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="error">Open</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'escalated':
        return <Badge variant="default">Escalated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getIssueIcon = (issueType: string) => {
    switch (issueType) {
      case 'document_mismatch':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'kyc_verification':
        return <User className="h-5 w-5 text-yellow-600" />;
      case 'credit_score':
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
      case 'regulatory_check':
        return <Shield className="h-5 w-5 text-purple-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredIssues = selectedFilter === 'all' 
    ? complianceIssues 
    : complianceIssues.filter(issue => issue.status === selectedFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compliance Review</h1>
            <p className="text-gray-600">Monitor and resolve compliance issues</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">AML & KYC Monitoring Active</span>
        </div>
      </div>

      {/* Compliance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {complianceStats.map((stat, index) => {
          const colorClasses = {
            red: 'text-red-600 bg-red-100',
            yellow: 'text-yellow-600 bg-yellow-100',
            green: 'text-green-600 bg-green-100',
            purple: 'text-purple-600 bg-purple-100'
          };
          
          return (
            <Card key={index}>
              <CardContent className="text-center p-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <span className="text-xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            {['all', 'open', 'in_progress', 'escalated', 'resolved'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div 
                key={issue.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIssueIcon(issue.issueType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 
                          className="text-lg font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onDoubleClick={() => handleCustomerDoubleClick(issue.customer, issue.phone, issue.caseId)}
                          title="Double-click to open WhatsApp conversation"
                        >
                          {issue.customer}
                        </h3>
                        {getSeverityBadge(issue.severity)}
                        {getStatusBadge(issue.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span>{issue.loanType}</span>
                        <span>{issue.amount}</span>
                        <span>{issue.phone}</span>
                        <span>Case: {issue.caseId}</span>
                        <span className="text-blue-500 text-xs">Double-click name for WhatsApp</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{issue.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Flagged by: {issue.flaggedBy}</span>
                        <span>Assigned to: {issue.assignedTo}</span>
                        {issue.dueDate && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Due: {new Date(issue.dueDate).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onNavigateToCase(issue.caseId)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Case
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    {issue.status === 'open' && (
                      <>
                        <Button variant="success" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                        <Button variant="warning" size="sm">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Escalate
                        </Button>
                      </>
                    )}
                    {issue.status === 'in_progress' && (
                      <Button variant="success" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">High Priority Issues</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AML/PEP list matches - Escalate immediately</li>
                <li>• Document fraud detection - Reject application</li>
                <li>• Income verification failures - Request additional docs</li>
                <li>• Credit score discrepancies - Re-verify with bureau</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Resolution Timeframes</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• High severity: 24 hours</li>
                <li>• Medium severity: 72 hours</li>
                <li>• Low severity: 7 days</li>
                <li>• Escalated issues: As per senior guidance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}