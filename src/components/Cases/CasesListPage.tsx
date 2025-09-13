import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, FileText, Clock, AlertTriangle, Eye, Phone, MessageCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface CasesListPageProps {
  onBack: () => void;
  onNavigateToCase: (caseId: string) => void;
}

export function CasesListPage({ onBack, onNavigateToCase }: CasesListPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  const handleCustomerDoubleClick = (customerName: string, phone: string, caseId: string) => {
    // Navigate to WhatsApp conversation for this customer
    console.log(`Opening WhatsApp conversation with ${customerName} (${phone}) for case ${caseId}`);
    onNavigateToCase(caseId);
  };

  const allCases = [
    {
      id: 'case-001',
      caseNumber: 'HBI-HL-2025-001',
      customer: 'Ramesh & Sunita Gupta',
      phone: '+91-9876543210',
      loanType: 'Home Loan',
      amount: '₹50L',
      status: 'in-progress',
      priority: 'high',
      lastActivity: '2 hours ago',
      documentsComplete: 85,
      assignedTo: 'You',
      createdDate: '2025-01-09',
      nextAction: 'Follow up on GST documents',
      riskProfile: 'medium'
    },
    {
      id: 'case-002',
      caseNumber: 'HBI-PL-2025-002',
      customer: 'Amit Verma',
      phone: '+91-9876543211',
      loanType: 'Personal Loan',
      amount: '₹5L',
      status: 'review',
      priority: 'medium',
      lastActivity: '1 day ago',
      documentsComplete: 100,
      assignedTo: 'You',
      createdDate: '2025-01-08',
      nextAction: 'Awaiting credit approval',
      riskProfile: 'low'
    },
    {
      id: 'case-003',
      caseNumber: 'HBI-CL-2025-003',
      customer: 'Neha Singh',
      phone: '+91-9876543212',
      loanType: 'Car Loan',
      amount: '₹8L',
      status: 'new',
      priority: 'low',
      lastActivity: '3 days ago',
      documentsComplete: 60,
      assignedTo: 'You',
      createdDate: '2025-01-06',
      nextAction: 'Initial document collection',
      riskProfile: 'low'
    },
    {
      id: 'case-004',
      caseNumber: 'HBI-BL-2025-004',
      customer: 'Pradeep Kumar',
      phone: '+91-9876543213',
      loanType: 'Business Loan',
      amount: '₹25L',
      status: 'approved',
      priority: 'high',
      lastActivity: '5 hours ago',
      documentsComplete: 100,
      assignedTo: 'You',
      createdDate: '2025-01-05',
      nextAction: 'Loan disbursement',
      riskProfile: 'high'
    },
    {
      id: 'case-005',
      caseNumber: 'HBI-HL-2025-005',
      customer: 'Kavya Menon',
      phone: '+91-9876543214',
      loanType: 'Home Loan',
      amount: '₹35L',
      status: 'rejected',
      priority: 'medium',
      lastActivity: '2 days ago',
      documentsComplete: 95,
      assignedTo: 'You',
      createdDate: '2025-01-04',
      nextAction: 'Customer notification sent',
      riskProfile: 'high'
    },
    {
      id: 'case-006',
      caseNumber: 'HBI-PL-2025-006',
      customer: 'Rohit Sharma',
      phone: '+91-9876543215',
      loanType: 'Personal Loan',
      amount: '₹3L',
      status: 'in-progress',
      priority: 'low',
      lastActivity: '4 hours ago',
      documentsComplete: 75,
      assignedTo: 'You',
      createdDate: '2025-01-07',
      nextAction: 'Bank statement verification',
      riskProfile: 'low'
    }
  ];

  const filteredCases = allCases.filter(case_ => {
    const matchesSearch = case_.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.loanType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || case_.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const sortedCases = [...filteredCases].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      case 'date':
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      case 'amount':
        return parseInt(b.amount.replace(/[₹L]/g, '')) - parseInt(a.amount.replace(/[₹L]/g, ''));
      default:
        return 0;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'review':
        return <Badge variant="info">Under Review</Badge>;
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
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

  const statusCounts = {
    all: allCases.length,
    new: allCases.filter(c => c.status === 'new').length,
    'in-progress': allCases.filter(c => c.status === 'in-progress').length,
    review: allCases.filter(c => c.status === 'review').length,
    approved: allCases.filter(c => c.status === 'approved').length,
    rejected: allCases.filter(c => c.status === 'rejected').length
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
            <h1 className="text-2xl font-bold text-gray-900">My Cases</h1>
            <p className="text-gray-600">Detailed view of all your assigned loan applications</p>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {filteredCases.length} of {allCases.length} cases
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card 
            key={status}
            className={`cursor-pointer transition-all hover:shadow-md ${
              filterStatus === status ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setFilterStatus(status)}
          >
            <CardContent className="text-center p-3">
              <div className="text-lg font-bold text-gray-900">{count}</div>
              <p className="text-xs text-gray-600 capitalize">{status.replace('-', ' ')}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, case number, or loan type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="priority">Sort by Priority</option>
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div className="space-y-4">
        {sortedCases.map((case_) => (
          <Card key={case_.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 
                      className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                      onDoubleClick={() => handleCustomerDoubleClick(case_.customer, case_.phone, case_.id)}
                      title="Double-click to open WhatsApp conversation"
                    >
                      {case_.customer}
                    </h3>
                    {getPriorityBadge(case_.priority)}
                    {getRiskBadge(case_.riskProfile)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="font-medium">{case_.caseNumber}</span>
                    <span>{case_.loanType}</span>
                    <span className="font-semibold text-green-600">{case_.amount}</span>
                    <span>{case_.phone}</span>
                    <span className="text-blue-500 text-xs">Double-click name for WhatsApp</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created: {new Date(case_.createdDate).toLocaleDateString()}</span>
                    <span>Last activity: {case_.lastActivity}</span>
                    <span>Assigned to: {case_.assignedTo}</span>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(case_.status)}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Document Completeness</span>
                  <span className="font-medium">{case_.documentsComplete}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      case_.documentsComplete === 100 ? 'bg-green-500' :
                      case_.documentsComplete >= 75 ? 'bg-blue-500' :
                      case_.documentsComplete >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${case_.documentsComplete}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">Next: {case_.nextAction}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onNavigateToCase(case_.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Case
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedCases.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}