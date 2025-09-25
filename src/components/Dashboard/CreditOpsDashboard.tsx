import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Shield, 
  FileCheck, 
  Eye, 
  FileText, 
  BarChart3, 
  RefreshCw,
  TrendingUp,
  Target,
  Award,
  Users,
  Timer,
  Flag,
  CheckSquare,
  XCircle,
  MessageSquare,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useDashboardStats, useCases, useApprovalQueue } from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface CreditOpsDashboardProps {
  onNavigateToCase: (caseId: string) => void;
  onNavigateToApprovalQueue: () => void;
  onNavigateToComplianceReports: () => void;
  onNavigateToComplianceReview: () => void;
  onNavigateToPendingReviews: () => void;
  onNavigateToComplianceManagement: () => void;
}

export function CreditOpsDashboard({ 
  onNavigateToCase, 
  onNavigateToApprovalQueue,
  onNavigateToComplianceReports,
  onNavigateToComplianceReview,
  onNavigateToPendingReviews,
  onNavigateToComplianceManagement
}: CreditOpsDashboardProps) {
  const { user } = useAuth();
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const [complianceFlags, setComplianceFlags] = useState<any[]>([]);
  const [processingStats, setProcessingStats] = useState<any>({});
  const [loadingApproval, setLoadingApproval] = useState(false);
  
  // Get real data from Supabase
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats(user?.id || '', user?.role || '');
  const { cases, loading: casesLoading, error: casesError, refetch: refetchCases } = useCases();
  const { data: approvalQueue, loading: approvalLoading, error: approvalError, refetch: refetchApproval } = useApprovalQueue();

  // Fetch real approval queue data
  const fetchApprovalData = async () => {
    if (!user?.organizationId) return;
    
    setLoadingApproval(true);
    try {
      // Get cases pending approval/review
      const pendingCases = await SupabaseDatabaseService.getCasesWithDetails({
        organizationId: user.organizationId,
        status: 'review'
      });
      
      // Get cases with compliance issues (using on-hold status for compliance issues)
      const complianceCases = await SupabaseDatabaseService.getCasesWithDetails({
        organizationId: user.organizationId,
        status: 'on-hold'
      });
      
      // Calculate processing statistics
      const allCases = await SupabaseDatabaseService.getCasesWithDetails({
        organizationId: user.organizationId
      });
      
      const approvedToday = allCases.filter(c => {
        const today = new Date().toISOString().split('T')[0];
        return c.status === 'approved' && c.updatedAt.startsWith(today);
      });
      
      const totalReviewed = allCases.filter(c => 
        c.status === 'approved' || c.status === 'rejected'
      );
      
      const avgProcessingTime = allCases
        .filter(c => c.status === 'approved')
        .map(c => {
          const created = new Date(c.createdAt);
          const updated = new Date(c.updatedAt);
          return Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        });
      
      setApprovalData(pendingCases.slice(0, 5)); // Show top 5 pending
      setComplianceFlags(complianceCases.slice(0, 3)); // Show top 3 compliance issues
      setProcessingStats({
        pendingReviews: pendingCases.length,
        approvedToday: approvedToday.length,
        complianceFlags: complianceCases.length,
        totalReviewed: totalReviewed.length,
        avgProcessingTime: avgProcessingTime.length > 0 ? 
          Math.round(avgProcessingTime.reduce((sum, time) => sum + time, 0) / avgProcessingTime.length) : 0,
        approvalRate: totalReviewed.length > 0 ? 
          Math.round((allCases.filter(c => c.status === 'approved').length / totalReviewed.length) * 100) : 0
      });
      
    } catch (error) {
      console.error('Error fetching approval data:', error);
    } finally {
      setLoadingApproval(false);
    }
  };

  useEffect(() => {
    fetchApprovalData();
  }, [user?.organizationId]);
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

  // Use real data from Supabase, with fallbacks for missing data
  const dashboardStats = [
    { 
      label: 'Pending Reviews', 
      value: processingStats.pendingReviews?.toString() || approvalQueue?.length?.toString() || '0', 
      icon: Clock, 
      color: 'yellow', 
      type: 'pending-reviews', 
      details: `Final Approval: ${approvalData.filter(a => a.priority === 'high').length || 0}, Credit Assessment: ${approvalData.filter(a => a.priority === 'medium').length || 0}, Document Verification: ${approvalData.filter(a => a.priority === 'low').length || 0}, Avg Wait: ${processingStats.avgProcessingTime || 0} days` 
    },
    { 
      label: 'Approved Today', 
      value: processingStats.approvedToday?.toString() || cases?.filter(c => c.status === 'approved').length?.toString() || '0', 
      icon: CheckCircle, 
      color: 'green', 
      type: 'approved-today', 
      details: `Home Loans: ${cases?.filter(c => c.status === 'approved' && c.loanType?.includes('Home')).length || 0}, Personal Loans: ${cases?.filter(c => c.status === 'approved' && c.loanType?.includes('Personal')).length || 0}, Business Loans: ${cases?.filter(c => c.status === 'approved' && c.loanType?.includes('Business')).length || 0}` 
    },
    { 
      label: 'Compliance Flags', 
      value: processingStats.complianceFlags?.toString() || complianceFlags.length.toString() || '0', 
      icon: AlertTriangle, 
      color: 'red', 
      type: 'compliance-flags', 
      details: `High Priority: ${complianceFlags.filter(c => c.priority === 'high').length}, Medium: ${complianceFlags.filter(c => c.priority === 'medium').length}, Low: ${complianceFlags.filter(c => c.priority === 'low').length}` 
    },
    { 
      label: 'Approval Rate', 
      value: `${processingStats.approvalRate || 0}%`, 
      icon: Target, 
      color: 'blue', 
      type: 'total-reviewed', 
      details: `Total Reviewed: ${processingStats.totalReviewed || 0} | Approved: ${cases?.filter(c => c.status === 'approved').length || 0} | Rejected: ${cases?.filter(c => c.status === 'rejected').length || 0} | Success Rate: ${processingStats.approvalRate || 0}%` 
    }
  ];

  // Quick approval actions
  const handleQuickApprove = async (caseId: string) => {
    try {
      await SupabaseDatabaseService.updateCaseStatus(caseId, 'approved');
      await fetchApprovalData(); // Refresh data
    } catch (error) {
      console.error('Error approving case:', error);
    }
  };

  const handleQuickReject = async (caseId: string) => {
    try {
      await SupabaseDatabaseService.updateCaseStatus(caseId, 'rejected');
      await fetchApprovalData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting case:', error);
    }
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

  // Show loading state
  if (statsLoading || casesLoading || approvalLoading || loadingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (statsError || casesError || approvalError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Dashboard</p>
            <p className="text-sm text-gray-600 mt-2">
              {statsError || casesError || approvalError}
            </p>
          </div>
          <div className="space-x-2">
            <Button onClick={() => { refetchStats(); refetchCases(); refetchApproval(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Operations</h1>
          <p className="text-gray-600">Review and approve loan applications</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => { refetchStats(); refetchCases(); refetchApproval(); fetchApprovalData(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Compliance Report
          </Button>
          <Button variant="outline" onClick={onNavigateToComplianceReports}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Compliance Reports
          </Button>
          <Button variant="outline" onClick={onNavigateToComplianceManagement}>
            <Shield className="h-4 w-4 mr-2" />
            Compliance Management
          </Button>
          <Button onClick={onNavigateToApprovalQueue}>
            <Eye className="h-4 w-4 mr-2" />
            Review Queue
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
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
            >
              <div
                onClick={() => handleStatClick(stat.type)}
                onDoubleClick={() => handleStatDoubleClick(stat.type)}
                className="w-full h-full"
                style={{ cursor: 'pointer' }}
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
              </div>
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
              View All ({approvalQueue?.length || 0})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvalData.length > 0 ? (
              approvalData.map((case_) => (
                <div 
                  key={case_.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {case_.customer?.name || 'Unknown Customer'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {case_.loanType} • ₹{case_.loanAmount ? (case_.loanAmount / 100000).toFixed(0) + 'L' : 'N/A'} • Case: {case_.caseNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {case_.customer?.email || 'N/A'} • {case_.customer?.phone || 'N/A'}
                      </p>
                      <p className="text-xs text-blue-500">Wait: {getWaitTime(case_.createdAt)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRiskBadge(case_.priority || 'medium')}
                      <span className="text-xs text-gray-500">Priority: {case_.priority || 'medium'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Status</span>
                        <span className="font-medium">{case_.status}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            case_.status === 'review' ? 'bg-yellow-500' : 
                            case_.status === 'approved' ? 'bg-green-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: case_.status === 'review' ? '75%' : '100%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigateToCase(case_.id)}
                        className="flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => handleQuickApprove(case_.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="error"
                        onClick={() => handleQuickReject(case_.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending reviews at the moment</p>
                <p className="text-sm text-gray-400">All cases are being processed efficiently</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}