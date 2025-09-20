import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, FileText, Clock, AlertTriangle, Eye, Phone, MessageCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCases } from '../../hooks/useDashboardData';
import { useAuth } from '../../contexts/AuthContextFixed';

interface CasesListPageProps {
  onBack: () => void;
  onNavigateToCase: (caseId: string) => void;
}

export function CasesListPage({ onBack, onNavigateToCase }: CasesListPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const { user } = useAuth();
  
  // Fetch cases from Supabase
  const { cases, loading: casesLoading, error: casesError, refetch } = useCases({
    assignedTo: user?.id,
    status: filterStatus === 'all' ? undefined : filterStatus
  });

  const handleCustomerDoubleClick = (customerName: string, phone: string, caseId: string) => {
    // Navigate to WhatsApp conversation for this customer
    console.log(`Opening WhatsApp conversation with ${customerName} (${phone}) for case ${caseId}`);
    onNavigateToCase(caseId);
  };

  // Helper functions
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const calculateDocumentCompleteness = (documents: any[]) => {
    if (!documents || documents.length === 0) return 0;
    const requiredDocs = documents.filter(doc => doc.required);
    const completedDocs = requiredDocs.filter(doc => doc.status === 'verified' || doc.status === 'received');
    return requiredDocs.length > 0 ? Math.round((completedDocs.length / requiredDocs.length) * 100) : 0;
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'new': return 'Initial document collection';
      case 'in-progress': return 'Follow up on pending documents';
      case 'review': return 'Awaiting credit approval';
      case 'approved': return 'Loan disbursement';
      case 'rejected': return 'Customer notification sent';
      default: return 'Review case status';
    }
  };

  // Transform Supabase cases to match the expected format
  const allCases = cases.map(case_ => ({
    id: case_.id,
    caseNumber: case_.caseNumber,
    customer: case_.customer.name,
    phone: case_.customer.phone,
    loanType: case_.customer.loanType,
    amount: `₹${(case_.customer.loanAmount / 100000).toFixed(0)}L`,
    status: case_.status,
    priority: case_.priority,
    lastActivity: getTimeAgo(case_.updatedAt),
    documentsComplete: calculateDocumentCompleteness(case_.documents),
    assignedTo: 'You',
    createdDate: case_.createdAt.split('T')[0],
    nextAction: getNextAction(case_.status),
    riskProfile: case_.customer.riskProfile
  }));

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

  // Show loading state
  if (casesLoading) {
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
              <p className="text-gray-600">Loading your assigned loan applications...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading cases...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (casesError) {
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
              <p className="text-gray-600">Error loading your assigned loan applications</p>
            </div>
          </div>
          <Button variant="outline" onClick={refetch}>
            Retry
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading cases</h3>
              <p className="mt-1 text-sm text-red-700">{casesError}</p>
            </div>
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
            <h1 className="text-2xl font-bold text-gray-900">My Cases</h1>
            <p className="text-gray-600">Detailed view of all your assigned loan applications</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={refetch} disabled={casesLoading}>
            Refresh
          </Button>
          <div className="text-sm text-gray-600">
            {filteredCases.length} of {allCases.length} cases
          </div>
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