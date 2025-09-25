import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { WorkflowEngine } from '../../services/workflow-engine';
import { NotificationService } from '../../services/notification-service';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { useAuth } from '../../contexts/AuthContextFixed';

interface WorkflowManagementProps {
  onBack: () => void;
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  caseId: string;
  currentStep: string;
  status: 'active' | 'completed' | 'paused' | 'failed';
  startedAt: string;
  completedAt?: string;
  data: Record<string, any>;
  history: any[];
}

export function WorkflowManagement({ onBack }: WorkflowManagementProps) {
  const { user } = useAuth();
  const [workflowInstances, setWorkflowInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);

  // Load workflow instances
  const loadWorkflowInstances = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all cases first
      const cases = await SupabaseDatabaseService.getCases();
      
      // Get workflow instances for each case
      const instances = [];
      for (const case_ of cases) {
        const caseInstances = await SupabaseDatabaseService.getWorkflowInstancesForCase(case_.id);
        instances.push(...caseInstances);
      }
      
      setWorkflowInstances(instances);
    } catch (err) {
      console.error('Error loading workflow instances:', err);
      setError('Failed to load workflow instances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflowInstances();
  }, []);

  // Start a new workflow
  const handleStartWorkflow = async (caseId: string) => {
    try {
      const instance = await WorkflowEngine.startWorkflow('loan_application', caseId, {
        startedBy: user?.id,
        organizationId: user?.organization_id
      });
      
      await loadWorkflowInstances();
      alert('Workflow started successfully!');
    } catch (err) {
      console.error('Error starting workflow:', err);
      alert('Failed to start workflow');
    }
  };

  // Pause/Resume workflow
  const handleToggleWorkflow = async (instanceId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await SupabaseDatabaseService.updateWorkflowInstance(instanceId, { status: newStatus });
      await loadWorkflowInstances();
    } catch (err) {
      console.error('Error toggling workflow:', err);
      alert('Failed to toggle workflow');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'completed':
        return <Badge variant="info">Completed</Badge>;
      case 'paused':
        return <Badge variant="warning">Paused</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="error">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      case 'low':
        return <Badge variant="success">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  // Filter workflow instances
  const filteredInstances = workflowInstances.filter(instance => {
    const matchesSearch = instance.caseId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || instance.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow management...</p>
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
            <p className="text-lg font-semibold">Error Loading Workflows</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={loadWorkflowInstances}>
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
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow Management</h1>
            <p className="text-gray-600">Manage automated loan application workflows</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadWorkflowInstances}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateWorkflow(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Start Workflow
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{workflowInstances.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflowInstances.filter(w => w.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paused</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflowInstances.filter(w => w.status === 'paused').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflowInstances.filter(w => w.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by case ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Instances List */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Instances</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInstances.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No workflow instances found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInstances.map((instance) => (
                <div
                  key={instance.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">Case #{instance.caseId}</h3>
                        {getStatusBadge(instance.status)}
                        <Badge variant="info">{instance.currentStep}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Started: {new Date(instance.startedAt).toLocaleString()}</p>
                        {instance.completedAt && (
                          <p>Completed: {new Date(instance.completedAt).toLocaleString()}</p>
                        )}
                        <p>Steps completed: {instance.history.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInstance(instance)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {instance.status === 'active' || instance.status === 'paused' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleWorkflow(instance.id, instance.status)}
                        >
                          {instance.status === 'active' ? (
                            <Pause className="h-4 w-4 mr-1" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          {instance.status === 'active' ? 'Pause' : 'Resume'}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Instance Details Modal */}
      {selectedInstance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Workflow Details - Case #{selectedInstance.caseId}</h2>
              <Button variant="outline" onClick={() => setSelectedInstance(null)}>
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">{getStatusBadge(selectedInstance.status)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Step</label>
                  <p className="mt-1 font-medium">{selectedInstance.currentStep}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Started At</label>
                  <p className="mt-1">{new Date(selectedInstance.startedAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Completed At</label>
                  <p className="mt-1">
                    {selectedInstance.completedAt 
                      ? new Date(selectedInstance.completedAt).toLocaleString()
                      : 'Not completed'
                    }
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Execution History</label>
                <div className="space-y-2">
                  {selectedInstance.history.map((step, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : step.status === 'failed' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{step.stepId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(step.executedAt).toLocaleString()} - {step.status}
                        </p>
                        {step.error && (
                          <p className="text-sm text-red-600 mt-1">{step.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Workflow Modal */}
      {showCreateWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Start New Workflow</h2>
            <p className="text-gray-600 mb-4">
              Select a case to start the loan application workflow.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case ID</label>
                <input
                  type="text"
                  placeholder="Enter case ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowCreateWorkflow(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Implementation for starting workflow
                    setShowCreateWorkflow(false);
                  }}
                  className="flex-1"
                >
                  Start Workflow
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
