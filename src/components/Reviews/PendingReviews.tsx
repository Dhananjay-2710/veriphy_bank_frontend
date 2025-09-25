import { useState } from 'react';
import { ArrowLeft, Clock, FileText, AlertCircle, CheckCircle, XCircle, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { usePendingReviews } from '../../hooks/useDashboardData';
import { useAuth } from '../../contexts/AuthContextFixed';

interface PendingReviewsProps {
  onBack: () => void;
  onNavigateToCase: (caseId: string) => void;
}

export function PendingReviews({ onBack, onNavigateToCase }: PendingReviewsProps) {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  
  // Use real pending reviews data from hook
  const { data: pendingReviewsData, loading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = usePendingReviews({
    reviewType: selectedFilter !== 'all' ? selectedFilter : undefined,
    sortBy: sortBy
  });
  
  // Use live data from Supabase
  const pendingReviews = pendingReviewsData || [];
  
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Filter and sort reviews based on selected criteria
  const filteredReviews = pendingReviews.filter(review => {
    if (selectedFilter === 'all') return true;
    return review.reviewType === selectedFilter;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      }
      case 'waitTime':
        return b.waitTime.localeCompare(a.waitTime);
      case 'amount': {
        const amountA = parseFloat(a.amount.replace(/[₹,]/g, ''));
        const amountB = parseFloat(b.amount.replace(/[₹,]/g, ''));
        return amountB - amountA;
      }
      default:
        return 0;
    }
  });

  const handleApproveReview = async (reviewId: string) => {
    try {
      setProcessingAction(reviewId);
      console.log('Approving review:', reviewId);
      
      await SupabaseDatabaseService.approveReview(reviewId, {
        approvedBy: user?.id || '', // Get from auth context
        approvedAt: new Date().toISOString(),
        approvalNotes: 'Approved via pending reviews'
      });
      
      // Refresh the reviews list
      refetchReviews();
      
      // Show success message
      console.log('Review approved successfully!');
      // TODO: Replace with proper toast notification
    } catch (err) {
      console.error('Error approving review:', err);
      console.error('Failed to approve review. Please try again.');
      // TODO: Replace with proper error toast notification
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      setProcessingAction(reviewId);
      console.log('Rejecting review:', reviewId);
      
      await SupabaseDatabaseService.rejectReview(reviewId, {
        rejectedBy: 'current_user_id', // This should come from auth context
        rejectedAt: new Date().toISOString(),
        rejectionReason: 'Rejected via pending reviews'
      });
      
      // Refresh the reviews list
      refetchReviews();
      
      // Show success message
      console.log('Review rejected successfully!');
      // TODO: Replace with proper toast notification
    } catch (err) {
      console.error('Error rejecting review:', err);
      console.error('Failed to reject review. Please try again.');
      // TODO: Replace with proper error toast notification
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRequestInfo = async (reviewId: string) => {
    try {
      setProcessingAction(reviewId);
      console.log('Requesting additional info for review:', reviewId);
      
      await SupabaseDatabaseService.requestAdditionalInfo(reviewId, {
        requestedBy: 'current_user_id', // This should come from auth context
        requestedAt: new Date().toISOString(),
        infoRequest: 'Additional documentation required'
      });
      
      // Refresh the reviews list
      refetchReviews();
      
      // Show success message
      console.log('Information request sent successfully!');
      // TODO: Replace with proper toast notification
    } catch (err) {
      console.error('Error requesting information:', err);
      console.error('Failed to request information. Please try again.');
      // TODO: Replace with proper error toast notification
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCustomerDoubleClick = (customer: string, phone: string, caseId: string) => {
    console.log(`Opening WhatsApp conversation with ${customer} (${phone}) for case ${caseId}`);
    onNavigateToCase(caseId);
  };

  const reviewStats = [
    { label: 'Total Pending', value: '23', color: 'blue' },
    { label: 'High Priority', value: '8', color: 'red' },
    { label: 'Overdue (>24h)', value: '3', color: 'orange' },
    { label: 'Avg Review Time', value: '4.2h', color: 'green' }
  ];

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

  const getReviewTypeIcon = (type: string) => {
    switch (type) {
      case 'final_approval':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'credit_assessment':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'document_verification':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'risk_assessment':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
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
            <h1 className="text-2xl font-bold text-gray-900">Pending Reviews</h1>
            <p className="text-gray-600">Cases awaiting credit operations review</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refetchReviews} disabled={reviewsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${reviewsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{sortedReviews.length} cases pending</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {reviewsError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{reviewsError}</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {reviewsLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading pending reviews...</span>
        </div>
      )}

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reviewStats.map((stat, index) => {
          const colorClasses = {
            blue: 'text-blue-600 bg-blue-100',
            red: 'text-red-600 bg-red-100',
            orange: 'text-orange-600 bg-orange-100',
            green: 'text-green-600 bg-green-100'
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

      {/* Filters and Sort */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex space-x-2">
              <span className="text-sm font-medium text-gray-700 py-2">Filter by type:</span>
              {['all', 'final_approval', 'credit_assessment', 'document_verification', 'risk_assessment'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setSelectedFilter(filter);
                    refetchReviews();
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedFilter === filter
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  refetchReviews();
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="priority">Priority</option>
                <option value="time">Wait Time</option>
                <option value="amount">Loan Amount</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedReviews.map((review) => (
              <div 
                key={review.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getReviewTypeIcon(review.reviewType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 
                          className="text-lg font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onDoubleClick={() => handleCustomerDoubleClick(review.customer, review.phone, review.caseId)}
                          title="Double-click to open WhatsApp conversation"
                        >
                          {review.customer}
                        </h3>
                        {getPriorityBadge(review.priority)}
                        {getRiskBadge(review.riskRating)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span>{review.loanType}</span>
                        <span className="font-semibold text-green-600">{review.amount}</span>
                        <span>{review.phone}</span>
                        <span>Credit Score: {review.creditScore}</span>
                        <span>Submitted by: {review.submittedBy}</span>
                        <span className="text-blue-500 text-xs">Double-click name for WhatsApp</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{review.reviewNotes}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Waiting: {review.waitTime}</span>
                        </span>
                        <span>Documents: {review.documentsComplete}% complete</span>
                        <span>Review Type: {review.reviewType.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Document Completeness</span>
                    <span className="font-medium">{review.documentsComplete}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        review.documentsComplete === 100 ? 'bg-green-500' :
                        review.documentsComplete >= 90 ? 'bg-blue-500' :
                        review.documentsComplete >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${review.documentsComplete}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigateToCase(review.caseId)}
                    className="flex-1 mr-2"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review Case
                  </Button>
                  <div className="flex space-x-2">
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => handleApproveReview(review.id)}
                      disabled={processingAction === review.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {processingAction === review.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button 
                      variant="error" 
                      size="sm"
                      onClick={() => handleRejectReview(review.id)}
                      disabled={processingAction === review.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {processingAction === review.id ? 'Processing...' : 'Reject'}
                    </Button>
                    <Button 
                      variant="warning" 
                      size="sm"
                      onClick={() => handleRequestInfo(review.id)}
                      disabled={processingAction === review.id}
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {processingAction === review.id ? 'Processing...' : 'Request Info'}
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