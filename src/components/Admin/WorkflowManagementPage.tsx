import React, { useState } from 'react';
import { 
  Workflow, 
  Settings, 
  Users, 
  History, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  Shield
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { 
  useCaseStatusHistory, 
  useCaseWorkflowStages, 
  useAssignCaseSettings, 
  useAssignPermissions 
} from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface WorkflowManagementPageProps {
  onNavigateToCase?: (caseId: string) => void;
  onNavigateToUser?: (userId: string) => void;
}

export function WorkflowManagementPage({ 
  onNavigateToCase,
  onNavigateToUser
}: WorkflowManagementPageProps) {
  const [selectedTab, setSelectedTab] = useState<'history' | 'stages' | 'settings' | 'permissions'>('history');
  const [selectedFilters, setSelectedFilters] = useState<{
    status?: string;
    stage_name?: string;
    setting_name?: string;
    role_id?: string;
  }>({});
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { history, loading: historyLoading, error: historyError, refetch: refetchHistory } = useCaseStatusHistory(undefined, {
    status: selectedFilters.status
  });
  
  const { stages, loading: stagesLoading, error: stagesError, refetch: refetchStages } = useCaseWorkflowStages(undefined, {
    stage_name: selectedFilters.stage_name
  });
  
  const { settings, loading: settingsLoading, error: settingsError, refetch: refetchSettings } = useAssignCaseSettings({
    setting_name: selectedFilters.setting_name
  });
  
  const { permissions, loading: permissionsLoading, error: permissionsError, refetch: refetchPermissions } = useAssignPermissions({
    role_id: selectedFilters.role_id
  });

  // Handle actions
  const handleCreateStatusHistory = async (caseId: string, status: string, reason?: string) => {
    try {
      await SupabaseDatabaseService.createCaseStatusHistory({
        case_id: caseId,
        status,
        changed_by: user?.id || '',
        reason
      });
      refetchHistory();
    } catch (error) {
      console.error('Failed to create status history:', error);
    }
  };

  const handleCreateWorkflowStage = async (caseId: string, stageName: string, stageOrder: number) => {
    try {
      await SupabaseDatabaseService.createCaseWorkflowStage({
        case_id: caseId,
        stage_name: stageName,
        stage_order: stageOrder
      });
      refetchStages();
    } catch (error) {
      console.error('Failed to create workflow stage:', error);
    }
  };

  const handleUpdateWorkflowStage = async (stageId: string, updates: any) => {
    try {
      await SupabaseDatabaseService.updateCaseWorkflowStage(stageId, updates);
      refetchStages();
    } catch (error) {
      console.error('Failed to update workflow stage:', error);
    }
  };

  const handleCreateAssignSetting = async (settingData: any) => {
    try {
      await SupabaseDatabaseService.createAssignCaseSetting(settingData);
      refetchSettings();
    } catch (error) {
      console.error('Failed to create assign setting:', error);
    }
  };

  const handleUpdateAssignSetting = async (settingId: string, updates: any) => {
    try {
      await SupabaseDatabaseService.updateAssignCaseSetting(settingId, updates);
      refetchSettings();
    } catch (error) {
      console.error('Failed to update assign setting:', error);
    }
  };

  const handleCreateAssignPermission = async (permissionData: any) => {
    try {
      await SupabaseDatabaseService.createAssignPermission(permissionData);
      refetchPermissions();
    } catch (error) {
      console.error('Failed to create assign permission:', error);
    }
  };

  const handleUpdateAssignPermission = async (permissionId: string, updates: any) => {
    try {
      await SupabaseDatabaseService.updateAssignPermission(permissionId, updates);
      refetchPermissions();
    } catch (error) {
      console.error('Failed to update assign permission:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageStatusColor = (isActive: boolean, completedAt?: string) => {
    if (completedAt) return 'bg-green-100 text-green-800';
    if (isActive) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStageStatusText = (isActive: boolean, completedAt?: string) => {
    if (completedAt) return 'Completed';
    if (isActive) return 'Active';
    return 'Pending';
  };

  const tabs = [
    { id: 'history', label: 'Status History', icon: History, count: history.length },
    { id: 'stages', label: 'Workflow Stages', icon: Workflow, count: stages.length },
    { id: 'settings', label: 'Assignment Settings', icon: Settings, count: settings.length },
    { id: 'permissions', label: 'Permissions', icon: Shield, count: permissions.length }
  ];

  const renderLoadingState = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading workflow data...</p>
      </div>
    </div>
  );

  const renderErrorState = (error: string, onRetry: () => void) => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-600 mb-4">
          <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Error Loading Data</p>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </div>
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  );

  const renderStatusHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Case Status History</h2>
        <div className="flex space-x-2">
          <select
            value={selectedFilters.status || ''}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button onClick={refetchHistory}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {history.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    {item.previous_status && (
                      <span className="text-sm text-gray-500">
                        from {item.previous_status}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Case:</strong> {item.case?.caseNumber || item.case_id}</p>
                    <p><strong>Changed by:</strong> {item.user?.full_name || item.changed_by}</p>
                    <p><strong>Date:</strong> {new Date(item.changed_at).toLocaleString()}</p>
                    {item.reason && <p><strong>Reason:</strong> {item.reason}</p>}
                    {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {onNavigateToCase && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onNavigateToCase(item.case_id)}
                    >
                      View Case
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {history.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No status history found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderWorkflowStages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Case Workflow Stages</h2>
        <div className="flex space-x-2">
          <select
            value={selectedFilters.stage_name || ''}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, stage_name: e.target.value || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Stages</option>
            <option value="initial_review">Initial Review</option>
            <option value="document_verification">Document Verification</option>
            <option value="credit_assessment">Credit Assessment</option>
            <option value="final_approval">Final Approval</option>
          </select>
          <Button onClick={refetchStages}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stages.map((stage) => (
          <Card key={stage.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold">{stage.stage_name}</h3>
                    <Badge className={getStageStatusColor(stage.is_active, stage.completed_at)}>
                      {getStageStatusText(stage.is_active, stage.completed_at)}
                    </Badge>
                    <span className="text-sm text-gray-500">Order: {stage.stage_order}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Case:</strong> {stage.case?.caseNumber || stage.case_id}</p>
                    <p><strong>Started:</strong> {new Date(stage.started_at).toLocaleString()}</p>
                    {stage.completed_at && (
                      <p><strong>Completed:</strong> {new Date(stage.completed_at).toLocaleString()}</p>
                    )}
                    {stage.assigned_to && (
                      <p><strong>Assigned to:</strong> {stage.user?.full_name || stage.assigned_to}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {onNavigateToCase && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onNavigateToCase(stage.case_id)}
                    >
                      View Case
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUpdateWorkflowStage(stage.id, { 
                      is_active: !stage.is_active,
                      completed_at: stage.is_active ? new Date().toISOString() : null
                    })}
                  >
                    {stage.is_active ? 'Complete' : 'Reactivate'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No workflow stages found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAssignSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Assignment Settings</h2>
        <div className="flex space-x-2">
          <select
            value={selectedFilters.setting_name || ''}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, setting_name: e.target.value || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Settings</option>
            <option value="auto_assign">Auto Assign</option>
            <option value="round_robin">Round Robin</option>
            <option value="workload_based">Workload Based</option>
            <option value="skill_based">Skill Based</option>
          </select>
          <Button onClick={refetchSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {settings.map((setting) => (
          <Card key={setting.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold">{setting.setting_name}</h3>
                    <Badge className={setting.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {setting.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-gray-500">Priority: {setting.priority}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Value:</strong> {setting.setting_value}</p>
                    {setting.description && <p><strong>Description:</strong> {setting.description}</p>}
                    <p><strong>Created:</strong> {new Date(setting.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUpdateAssignSetting(setting.id, { 
                      is_active: !setting.is_active 
                    })}
                  >
                    {setting.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {settings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No assignment settings found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAssignPermissions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Assignment Permissions</h2>
        <div className="flex space-x-2">
          <select
            value={selectedFilters.role_id || ''}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, role_id: e.target.value || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="credit-ops">Credit Ops</option>
            <option value="salesperson">Salesperson</option>
          </select>
          <Button onClick={refetchPermissions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {permissions.map((permission) => (
          <Card key={permission.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold">{permission.role?.name || permission.role_id}</h3>
                    <span className="text-sm text-gray-500">
                      {permission.permission?.name || permission.permission_id}
                    </span>
                  </div>
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <UserCheck className="h-4 w-4" />
                      <span>Assign: {permission.can_assign ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RefreshCw className="h-4 w-4" />
                      <span>Reassign: {permission.can_reassign ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve: {permission.can_approve ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Reject: {permission.can_reject ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUpdateAssignPermission(permission.id, { 
                      can_assign: !permission.can_assign 
                    })}
                  >
                    Toggle Assign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {permissions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No assignment permissions found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Determine loading and error states
  const isLoading = historyLoading || stagesLoading || settingsLoading || permissionsLoading;
  const hasError = historyError || stagesError || settingsError || permissionsError;

  if (isLoading) {
    return renderLoadingState();
  }

  if (hasError) {
    const errorMessage = historyError || stagesError || settingsError || permissionsError || 'Unknown error';
    const retryFunction = () => {
      refetchHistory();
      refetchStages();
      refetchSettings();
      refetchPermissions();
    };
    return renderErrorState(errorMessage, retryFunction);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Management</h1>
          <p className="text-gray-600">Manage case workflows, status history, and assignment settings</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => {
            refetchHistory();
            refetchStages();
            refetchSettings();
            refetchPermissions();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {tab.count}
                </Badge>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {selectedTab === 'history' && renderStatusHistory()}
        {selectedTab === 'stages' && renderWorkflowStages()}
        {selectedTab === 'settings' && renderAssignSettings()}
        {selectedTab === 'permissions' && renderAssignPermissions()}
      </div>
    </div>
  );
}
