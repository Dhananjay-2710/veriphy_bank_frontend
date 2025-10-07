import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  RefreshCw,
  ArrowLeft,
  Download,
  MessageSquare,
  FileText,
  Shield,
  TrendingUp,
  Timer,
  Flag,
  CheckSquare,
  XSquare
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface ApprovalQueueProps {
  onBack: () => void;
  onNavigateToCase: (caseId: string) => void;
}

interface ApprovalCase {
  id: string;
  caseNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    panNumber?: string;
    aadhaarNumber?: string;
  };
  loanType: string;
  loanAmount: number;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedUser?: {
    name: string;
    email: string;
  };
  documents?: any[];
  riskScore?: number;
  complianceFlags?: string[];
}

export function ApprovalQueue({ onBack, onNavigateToCase }: ApprovalQueueProps) {
  const { user } = useAuth();
  const [cases, setCases] = useState<ApprovalCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<ApprovalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  const fetchApprovalQueue = async () => {
    if (!user?.organizationId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Get all cases pending approval/review
      const allCases = await SupabaseDatabaseService.getCasesWithDetails({
        organizationId: user.organizationId,
        status: 'review'
      });
      
      // Also get cases with compliance issues
      const complianceCases = await SupabaseDatabaseService.getCasesWithDetails({
        organizationId: user.organizationId,
        status: 'compliance-issue'
      });
      
      // Combine and sort by priority and creation date
      const combinedCases = [...allCases, ...complianceCases].sort((a, b) => {
        // Sort by priority first (high > medium > low)
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // Then by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setCases(combinedCases);
      setFilteredCases(combinedCases);
      
    } catch (err) {
      console.error('Error fetching approval queue:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch approval queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalQueue();
  }, [user?.organizationId]);

  // Filter cases based on search and filters
  useEffect(() => {
    let filtered = cases;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(case_ => 
        case_.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.loanType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(case_ => case_.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(case_ => case_.priority === filterPriority);
    }

    setFilteredCases(filtered);
  }, [cases, searchTerm, filterStatus, filterPriority]);

  const handleApprove = async (caseId: string) => {
    setProcessing(caseId);
    try {
      await SupabaseDatabaseService.updateCaseStatus(caseId, 'approved');
      await fetchApprovalQueue();
    } catch (err) {
      console.error('Error approving case:', err);
      setError('Failed to approve case');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (caseId: string) => {
    setProcessing(caseId);
    try {
      await SupabaseDatabaseService.updateCaseStatus(caseId, 'rejected');
      await fetchApprovalQueue();
    } catch (err) {
      console.error('Error rejecting case:', err);
      setError('Failed to reject case');
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkApprove = async () => {
    setProcessing('bulk');
    try {
      await Promise.all(
        selectedCases.map(caseId => 
          SupabaseDatabaseService.updateCaseStatus(caseId, 'approved')
        )
      );
      setSelectedCases([]);
      await fetchApprovalQueue();
    } catch (err) {
      console.error('Error bulk approving cases:', err);
      setError('Failed to approve cases');
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkReject = async () => {
    setProcessing('bulk');
    try {
      await Promise.all(
        selectedCases.map(caseId => 
          SupabaseDatabaseService.updateCaseStatus(caseId, 'rejected')
        )
      );
      setSelectedCases([]);
      await fetchApprovalQueue();
    } catch (err) {
      console.error('Error bulk rejecting cases:', err);
      setError('Failed to reject cases');
    } finally {
      setProcessing(null);
    }
  };

  const toggleCaseSelection = (caseId: string) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const getWaitTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour';
    if (diffInHours < 24) return `${diffInHours} hours`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error" size="sm">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="info" size="sm">Low Priority</Badge>;
      default:
        return <Badge size="sm">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'review':
        return <Badge variant="warning" size="sm">Under Review</Badge>;
      case 'compliance-issue':
        return <Badge variant="error" size="sm">Compliance Issue</Badge>;
      case 'approved':
        return <Badge variant="success" size="sm">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error" size="sm">Rejected</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const getRiskScoreColor = (riskScore?: number) => {
    if (!riskScore) return 'text-gray-500';
    if (riskScore >= 80) return 'text-red-600';
    if (riskScore >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approval queue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Approval Queue</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={fetchApprovalQueue} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="dashboard-back-button" style={{ background: '#ffffff', color: '#374151' }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
          <p className="text-gray-300">Review and approve pending loan applications</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchApprovalQueue} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredCases.length}</p>
                <p className="text-sm text-gray-600">Total Pending</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredCases.filter(c => c.priority === 'high').length}
                </p>
                <p className="text-sm text-gray-600">High Priority</p>
              </div>
              <Flag className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredCases.filter(c => c.status === 'compliance-issue').length}
                </p>
                <p className="text-sm text-gray-600">Compliance Issues</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredCases.length > 0 ? 
                    Math.round(filteredCases.reduce((sum, c) => sum + (c.riskScore || 0), 0) / filteredCases.length) : 0
                  }
                </p>
                <p className="text-sm text-gray-600">Avg Risk Score</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Approval Queue</CardTitle>
            {selectedCases.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={processing === 'bulk'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Approve Selected ({selectedCases.length})
                </Button>
                <Button
                  size="sm"
                  variant="error"
                  onClick={handleBulkReject}
                  disabled={processing === 'bulk'}
                >
                  <XSquare className="h-4 w-4 mr-1" />
                  Reject Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases by customer name, case number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="review">Under Review</option>
                <option value="compliance-issue">Compliance Issue</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-4">
            {filteredCases.map((case_) => (
              <div 
                key={case_.id}
                className={`p-4 border rounded-lg transition-colors ${
                  selectedCases.includes(case_.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedCases.includes(case_.id)}
                      onChange={() => toggleCaseSelection(case_.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {case_.customer?.name || 'Unknown Customer'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {case_.loanType} • ₹{case_.loanAmount ? (case_.loanAmount / 100000).toFixed(0) + 'L' : 'N/A'} • Case: {case_.caseNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {case_.customer?.email || 'N/A'} • {case_.customer?.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getPriorityBadge(case_.priority)}
                    {getStatusBadge(case_.status)}
                    <span className="text-xs text-gray-500">Wait: {getWaitTime(case_.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-xs text-gray-500">Risk Score</p>
                      <p className={`text-sm font-semibold ${getRiskScoreColor(case_.riskScore)}`}>
                        {case_.riskScore || 'N/A'}
                      </p>
                    </div>
                    
                    {case_.assignedUser && (
                      <div>
                        <p className="text-xs text-gray-500">Assigned To</p>
                        <p className="text-sm font-medium">{case_.assignedUser.name}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-xs text-gray-500">Documents</p>
                      <p className="text-sm font-medium">{case_.documents?.length || 0} uploaded</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigateToCase(case_.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleApprove(case_.id)}
                      disabled={processing === case_.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="error"
                      onClick={() => handleReject(case_.id)}
                      disabled={processing === case_.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredCases.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">No cases found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}