import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Plus, 
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkloadSchedules, useWorkloadAssignments } from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface WorkloadManagementPageProps {
  onBack?: () => void;
  onNavigateToCases?: () => void;
  onNavigateToTasks?: () => void;
}

export function WorkloadManagementPage({ 
  onNavigateToCases,
  onNavigateToTasks
}: WorkloadManagementPageProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }>({});
  const [activeTab, setActiveTab] = useState<'schedules' | 'assignments'>('schedules');
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { data: schedules, loading: schedulesLoading, error: schedulesError, refetch: refetchSchedules } = useWorkloadSchedules({
    organizationId: user?.organization_id?.toString(),
    ...selectedFilters
  });
  
  const { data: assignments, loading: assignmentsLoading, error: assignmentsError, refetch: refetchAssignments } = useWorkloadAssignments({
    organizationId: user?.organization_id?.toString(),
    ...selectedFilters
  });

  // Handle actions
  const handleCreateSchedule = async () => {
    try {
      // This would open a modal or navigate to a form
      console.log('Create schedule clicked');
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      // This would open a modal or navigate to a form
      console.log('Create assignment clicked');
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  const handleUpdateAssignment = async (assignmentId: string, status: string) => {
    try {
      await SupabaseDatabaseService.updateWorkloadAssignment(assignmentId, { status });
      refetchAssignments();
    } catch (error) {
      console.error('Failed to update assignment:', error);
    }
  };

  // Loading state
  if (schedulesLoading || assignmentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workload data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (schedulesError || assignmentsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Workload Data</p>
            <p className="text-sm text-gray-600 mt-2">{schedulesError || assignmentsError}</p>
          </div>
          <Button onClick={() => { refetchSchedules(); refetchAssignments(); }}>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workload Management</h1>
          <p className="text-gray-600">Manage team schedules and task assignments</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => { refetchSchedules(); refetchAssignments(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={activeTab === 'schedules' ? handleCreateSchedule : handleCreateAssignment}>
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'schedules' ? 'New Schedule' : 'New Assignment'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Schedules</p>
                <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => a.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(schedules.map(s => s.userId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schedules.length > 0 
                    ? Math.round(schedules.reduce((sum, s) => sum + s.capacityPercentage, 0) / schedules.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={selectedFilters.dateFrom || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={selectedFilters.dateTo || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedFilters.status || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFilters({})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Schedules ({schedules.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assignments ({assignments.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'schedules' ? (
        <div className="grid grid-cols-1 gap-6">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {schedule.user?.full_name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">{schedule.date}</p>
                      </div>
                      <Badge variant="outline">
                        {schedule.capacityPercentage}% Capacity
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Planned Hours</p>
                        <p className="text-lg font-semibold">{schedule.plannedHours}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Actual Hours</p>
                        <p className="text-lg font-semibold">{schedule.actualHours}h</p>
                      </div>
                    </div>
                    {schedule.notes && (
                      <p className="mt-2 text-sm text-gray-600">{schedule.notes}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {schedules.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No schedules found</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.user?.full_name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {assignment.taskId ? `Task: ${assignment.taskId}` : `Loan: ${assignment.loanApplicationId}`}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          assignment.status === 'completed' ? 'default' :
                          assignment.status === 'in_progress' ? 'secondary' :
                          assignment.status === 'cancelled' ? 'destructive' : 'outline'
                        }
                      >
                        {assignment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Assigned Hours</p>
                        <p className="text-lg font-semibold">{assignment.assignedHours || 0}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Start Time</p>
                        <p className="text-sm font-medium">
                          {assignment.startTime ? new Date(assignment.startTime).toLocaleString() : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Time</p>
                        <p className="text-sm font-medium">
                          {assignment.endTime ? new Date(assignment.endTime).toLocaleString() : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {assignment.status === 'scheduled' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateAssignment(assignment.id, 'in_progress')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {assignment.status === 'in_progress' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateAssignment(assignment.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {assignments.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No assignments found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
