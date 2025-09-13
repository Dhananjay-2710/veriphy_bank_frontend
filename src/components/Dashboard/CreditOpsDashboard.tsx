import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Shield, FileCheck, Eye, FileText, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CreditOpsDashboardProps {
  onNavigateToCase: (caseId: string) => void;
  onNavigateToApprovalQueue: () => void;
  onNavigateToComplianceReports: () => void;
  onNavigateToComplianceReview: () => void;
  onNavigateToPendingReviews: () => void;
}

export function CreditOpsDashboard({ 
  onNavigateToCase, 
  onNavigateToApprovalQueue,
  onNavigateToComplianceReports,
  onNavigateToComplianceReview,
  onNavigateToPendingReviews
}: CreditOpsDashboardProps) {
  const handleStatDoubleClick = (statType: string) => {
    switch (statType) {
      case 'pending-reviews':
        onNavigateToPendingReviews();
        break;
      case 'approved-today':
        onNavigateToApprovalQueue();
        break;
      case 'compliance-flags':
        onNavigateToComplianceReview();
        break;
      case 'total-reviewed':
        onNavigateToApprovalQueue();
        break;
      default:
        break;
    }
  };

  const handleStatClick = (statType: string) => {
    handleStatDoubleClick(statType);
  };

  const handleCaseDoubleClick = (caseId: string, customerName: string, phone: string) => {
    // Navigate to WhatsApp-style conversation for this case
    onNavigateToCase(caseId);
  };

  const stats = [
    { label: 'Pending Reviews', value: '23', icon: Clock, color: 'yellow', type: 'pending-reviews', details: 'Final Approval: 8, Credit Assessment: 6, Document Verification: 5, Risk Assessment: 4' },
    { label: 'Approved Today', value: '8', icon: CheckCircle, color: 'green', type: 'approved-today', details: 'Home Loans: 3 (₹1.2Cr), Personal Loans: 3 (₹15L), Business Loans: 2 (₹45L)' },
    { label: 'Compliance Flags', value: '3', icon: AlertTriangle, color: 'red', type: 'compliance-flags', details: 'AML Alert: 1, Document Mismatch: 1, Credit Score Issue: 1' },
    { label: 'Total Reviewed', value: '156', icon: Shield, color: 'blue', type: 'total-reviewed', details: 'This Month: 156 | Approved: 142 | Rejected: 14 | Success Rate: 91%' }
  ];

  const approvalQueue = [
    {
      id: 'case-001',
      customer: 'Ramesh & Sunita Gupta',
      loanType: 'Home Loan',
      amount: '₹50L',
      risk: 'medium',
      completeness: 85,
      waitTime: '2 hours',
      flags: ['Missing GST', 'High Loan Amount']
    },
    {
      id: 'case-004',
      customer: 'Deepak Agarwal',
      loanType: 'Business Loan',
      amount: '₹25L',
      risk: 'high',
      completeness: 100,
      waitTime: '6 hours',
      flags: ['High Risk Profile']
    },
    {
      id: 'case-005',
      customer: 'Kavya Menon',
      loanType: 'Personal Loan',
      amount: '₹3L',
      risk: 'low',
      completeness: 100,
      waitTime: '1 day',
      flags: []
    }
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Operations</h1>
          <p className="text-gray-600">Review and approve loan applications</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Compliance Report
          </Button>
          <Button variant="outline" onClick={onNavigateToComplianceReports}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Compliance Reports
          </Button>
          <Button onClick={onNavigateToApprovalQueue}>
            <Eye className="h-4 w-4 mr-2" />
            Review Queue
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'text-blue-600 bg-blue-100',
            yellow: 'text-yellow-600 bg-yellow-100',
            green: 'text-green-600 bg-green-100',
            red: 'text-red-600 bg-red-100'
          };
          
          return (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStatClick(stat.type)}
              onDoubleClick={() => handleStatDoubleClick(stat.type)}
              title={`Double-click to view details: ${stat.details}`}
            >
              <CardContent className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xs text-gray-500 mt-1">Double-click for details</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Approval Queue Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Priority Review Queue</CardTitle>
            <Button variant="outline" size="sm" onClick={onNavigateToApprovalQueue}>
              View All ({approvalQueue.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvalQueue.map((case_) => (
              <div 
                key={case_.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onNavigateToCase(case_.id)}
                onDoubleClick={() => handleCaseDoubleClick(case_.id, case_.customer, '+91-9876543210')}
                title="Click or double-click to view case details"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{case_.customer}</h3>
                    <p className="text-sm text-gray-600">{case_.loanType} • {case_.amount}</p>
                    <p className="text-xs text-blue-500">Click to review • Double-click for WhatsApp chat</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRiskBadge(case_.risk)}
                    <span className="text-xs text-gray-500">Wait: {case_.waitTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Completeness</span>
                      <span className="font-medium">{case_.completeness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${case_.completeness}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {case_.flags.length > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Compliance Flags:</p>
                      <div className="space-y-1">
                        {case_.flags.map((flag, idx) => (
                          <Badge key={idx} variant="warning" size="sm">{flag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}