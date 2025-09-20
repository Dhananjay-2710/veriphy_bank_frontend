import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  AlertTriangle, 
  Plus, 
  Filter,
  RefreshCw,
  Eye,
  Edit,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useApprovalQueues, useApprovalQueueItems } from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface ApprovalQueuePageProps {
  onBack?: () => void;
  onNavigateToCases?: () => void;
  onNavigateToDocuments?: () => void;
}

export function ApprovalQueuePage({ 
  onNavigateToCases,
  onNavigateToDocuments
}: ApprovalQueuePageProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    queueId?: string;
    status?: string;
    priority?: string;
    itemType?: string;
  }>({});
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { data: queues, loading: queuesLoading, error: queuesError, refetch: refetchQueues } = useApprovalQueues({
    organizationId: user?.organization_id?.toString(),
    isActive: true
  });
  
  const { data: queueItems, loading: itemsLoading, error: itemsError, refetch: refetchItems } = useApprovalQueueItems({
    organizationId: user?.organization_id?.toString(),
    queueId: selectedQueue || undefined,
    ...selectedFilters
  });

  // Handle actions
  const handleCreateQueue = async () => {
    try {
      // This would open a modal or navigate to a form
      console.log('Create queue clicked');
    } catch (error) {
      console.error('Failed to create queue:', error);
    }
  };

  const handleApproveItem = async (itemId: string) => {
    try {
      await SupabaseDatabaseService.updateApprovalQueueItem(itemId, {
        status: 'approved',
        completedAt: new Date().toISOString(),
        decision: 'approved'
      });
      refetchItems();
    } catch (error) {
      console.error('Failed to approve item:', error);
    }
  };

  const handleRejectItem = async (itemId: string) => {
    try {
      await SupabaseDatabaseService.updateApprovalQueueItem(itemId, {
        status: 'rejected',
        completedAt: new Date().toISOString(),
        decision: 'rejected'
      });
      refetchItems();
    } catch (error) {
      console.error('Failed to reject item:', error);
    }
  };

  const handleAssignItem = async (itemId: string, userId: string) => {
    try {
      await SupabaseDatabaseService.updateApprovalQueueItem(itemId, {
        assignedTo: userId,
        assignedAt: new Date().toISOString(),
        status: 'assigned'
      });
      refetchItems();
    } catch (error) {
      console.error('Failed to assign item:', error);
    }
  };

  // Loading state
  if (queuesLoading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approval queue data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (queuesError || itemsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Approval Queue Data</p>
            <p className="text-sm text-gray-600 mt-2">{queuesError || itemsError}</p>
          </div>
          <Button onClick={() => { refetchQueues(); refetchItems(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'escalated': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Queues</h1>
          <p className="text-gray-600">Manage approval workflows and queue items</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => { refetchQueues(); refetchItems(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateQueue}>
            <Plus className="h-4 w-4 mr-2" />
            New Queue
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueItems.filter(item => item.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueItems.filter(item => item.status === 'in_review').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueItems.filter(item => 
                    item.status === 'approved' && 
                    item.completedAt && 
                    new Date(item.completedAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Escalated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {queueItems.filter(item => item.status === 'escalated').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queues List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Approval Queues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {queues.map((queue) => (
                  <div
                    key={queue.id}
                    onClick={() => setSelectedQueue(queue.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedQueue === queue.id 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{queue.name}</h3>
                        <p className="text-sm text-gray-600">{queue.queueType.replace('_', ' ')}</p>
                      </div>
                      <Badge variant={queue.isActive ? 'default' : 'secondary'}>
                        {queue.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>SLA: {queue.slaHours}h • Max: {queue.maxConcurrentItems}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Queue Items</span>
                <div className="flex space-x-2">
                  <select
                    value={selectedFilters.status || ''}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="escalated">Escalated</option>
                  </select>
                  <select
                    value={selectedFilters.priority || ''}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {item.itemType.replace('_', ' ')} #{item.itemId}
                          </h3>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Assigned to:</strong> {item.user?.full_name || 'Unassigned'}</p>
                            <p><strong>Created:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p><strong>Due Date:</strong> {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Not set'}</p>
                            <p><strong>Queue:</strong> {queues.find(q => q.id === item.queueId)?.name || 'Unknown'}</p>
                          </div>
                        </div>
                        
                        {item.comments && (
                          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Comments:</strong> {item.comments}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {item.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignItem(item.id, user?.id || '')}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        )}
                        {item.status === 'assigned' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveItem(item.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {item.status === 'assigned' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectItem(item.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {queueItems.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No queue items found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
