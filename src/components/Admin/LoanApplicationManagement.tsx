import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useLoanApplications } from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { LoanApplication } from '../../types';

interface LoanApplicationManagementProps {
  onNavigateToLoanApplication?: (loanApplicationId: string) => void;
  onEditLoanApplication?: (loanApplicationId: string) => void;
}

export function LoanApplicationManagement({ 
  onNavigateToLoanApplication,
  onEditLoanApplication
}: LoanApplicationManagementProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    status?: string;
    priority?: string;
    customerId?: string;
    assignedSalesAgent?: string;
    assignedCreditAnalyst?: string;
  }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { loanApplications, loading, error, refetch } = useLoanApplications(selectedFilters);

  // Filter applications based on search term
  const filteredApplications = loanApplications.filter(app => 
    app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.customerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle actions
  const handleViewApplication = (loanApplicationId: string) => {
    if (onNavigateToLoanApplication) {
      onNavigateToLoanApplication(loanApplicationId);
    }
  };

  const handleEditApplication = (loanApplicationId: string) => {
    if (onEditLoanApplication) {
      onEditLoanApplication(loanApplicationId);
    }
  };

  const handleDeleteApplication = async (loanApplicationId: string) => {
    if (window.confirm('Are you sure you want to delete this loan application?')) {
      try {
        await SupabaseDatabaseService.deleteLoanApplication(loanApplicationId);
        refetch(); // Refresh data
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete loan application');
      }
    }
  };

  const handleStatusChange = async (loanApplicationId: string, newStatus: string) => {
    try {
      await SupabaseDatabaseService.updateLoanApplication(loanApplicationId, { 
        status: newStatus as any,
        ...(newStatus === 'approved' && { approvedAt: new Date().toISOString() }),
        ...(newStatus === 'rejected' && { rejectedAt: new Date().toISOString() }),
        ...(newStatus === 'disbursed' && { disbursedAt: new Date().toISOString() }),
        ...(newStatus === 'closed' && { closedAt: new Date().toISOString() })
      });
      refetch(); // Refresh data
    } catch (error) {
      console.error('Status update failed:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      disbursed: { color: 'bg-purple-100 text-purple-800', icon: DollarSign },
      closed: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loan applications...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Loan Applications</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={refetch}>
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
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">Loan Application Management</h1>
          <p className="text-gray-300">Manage and track loan applications</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetch} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedFilters.status || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="disbursed">Disbursed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={selectedFilters.priority || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, priority: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
              <Button 
                variant="outline" 
                onClick={() => setSelectedFilters({})}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.applicationNumber}
                    </h3>
                    {getStatusBadge(application.status)}
                    {getPriorityBadge(application.priority)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Amount:</span> ${application.requestedAmount.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Tenure:</span> {application.requestedTenure} months
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Purpose:</span> {application.purpose}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Customer:</span> {application.customerId}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Sales Agent:</span> {application.assignedSalesAgent || 'Unassigned'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Credit Analyst:</span> {application.assignedCreditAnalyst || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Created:</span> {new Date(application.createdAt).toLocaleDateString()}
                    {application.submittedAt && (
                      <span className="ml-4">
                        <span className="font-medium">Submitted:</span> {new Date(application.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewApplication(application.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditApplication(application.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  {application.status === 'under_review' && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(application.id, 'approved')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteApplication(application.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No loan applications found</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your search terms or filters
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
