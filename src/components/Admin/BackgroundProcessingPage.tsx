import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  RefreshCw,
  Settings,
  Activity,
  Database,
  Webhook,
  FileText,
  Zap,
  BarChart3,
  Filter,
  Search,
  Plus,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { 
  useJobs, 
  useJobBatches, 
  useFailedJobs, 
  useThirdPartyApiLogs, 
  useWebhooks 
} from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface BackgroundProcessingPageProps {
  onNavigateToSettings?: () => void;
  onNavigateToLogs?: () => void;
}

export function BackgroundProcessingPage({ 
  onNavigateToSettings,
  onNavigateToLogs
}: BackgroundProcessingPageProps) {
  const [selectedTab, setSelectedTab] = useState<'jobs' | 'batches' | 'failed' | 'api-logs' | 'webhooks'>('jobs');
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: any}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { jobs, loading: jobsLoading, error: jobsError, refetch: refetchJobs } = useJobs(selectedFilters);
  const { batches, loading: batchesLoading, error: batchesError, refetch: refetchBatches } = useJobBatches(selectedFilters);
  const { failedJobs, loading: failedLoading, error: failedError, refetch: refetchFailed } = useFailedJobs(selectedFilters);
  const { apiLogs, loading: apiLogsLoading, error: apiLogsError, refetch: refetchApiLogs } = useThirdPartyApiLogs(selectedFilters);
  const { webhooks, loading: webhooksLoading, error: webhooksError, refetch: refetchWebhooks } = useWebhooks(selectedFilters);

  // Handle actions
  const handleCreateJob = async () => {
    try {
      await SupabaseDatabaseService.createJob({
        organizationId: '1',
        jobType: 'email',
        jobName: 'Test Email Job',
        payload: { to: 'test@example.com', subject: 'Test' },
        priority: 'normal'
      });
      refetchJobs();
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      await SupabaseDatabaseService.updateJobStatus(jobId, 'pending');
      refetchJobs();
    } catch (error) {
      console.error('Failed to retry job:', error);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await SupabaseDatabaseService.updateJobStatus(jobId, 'cancelled');
      refetchJobs();
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  const handleResolveFailedJob = async (failedJobId: string) => {
    try {
      await SupabaseDatabaseService.resolveFailedJob(failedJobId, 'Manually resolved', user?.id || '');
      refetchFailed();
    } catch (error) {
      console.error('Failed to resolve failed job:', error);
    }
  };

  const handleCreateWebhook = async () => {
    try {
      await SupabaseDatabaseService.createWebhook({
        organizationId: '1',
        webhookName: 'Test Webhook',
        webhookUrl: 'https://example.com/webhook',
        eventType: 'case_created'
      });
      refetchWebhooks();
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      running: { color: 'bg-blue-100 text-blue-800', icon: Play },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: Pause },
      error: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      success: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      timeout: { color: 'bg-orange-100 text-orange-800', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal}>
        {priority}
      </Badge>
    );
  };

  const renderJobsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Background Jobs</h2>
        <div className="flex gap-2">
          <Button onClick={handleCreateJob} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
          <Button variant="outline" onClick={refetchJobs} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {jobsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      ) : jobsError ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading jobs: {jobsError}</p>
          <Button onClick={refetchJobs}>Retry</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{job.jobName}</h3>
                      {getStatusBadge(job.status)}
                      {getPriorityBadge(job.priority)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Type: {job.jobType} • Attempts: {job.attempts}/{job.maxAttempts}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(job.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {job.status === 'failed' && (
                      <Button size="sm" variant="outline" onClick={() => handleRetryJob(job.id)}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                    {job.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => handleCancelJob(job.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderBatchesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Job Batches</h2>
        <Button variant="outline" onClick={refetchBatches} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {batchesLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading batches...</p>
        </div>
      ) : batchesError ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading batches: {batchesError}</p>
          <Button onClick={refetchBatches}>Retry</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {batches.map((batch) => (
            <Card key={batch.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{batch.batchName}</h3>
                      {getStatusBadge(batch.status)}
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{batch.totalJobs}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{batch.pendingJobs}</p>
                        <p className="text-xs text-gray-600">Pending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{batch.processedJobs}</p>
                        <p className="text-xs text-gray-600">Processed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{batch.failedJobs}</p>
                        <p className="text-xs text-gray-600">Failed</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${batch.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Progress: {batch.progress}% • Created: {new Date(batch.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderFailedTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Failed Jobs</h2>
        <Button variant="outline" onClick={refetchFailed} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {failedLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading failed jobs...</p>
        </div>
      ) : failedError ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading failed jobs: {failedError}</p>
          <Button onClick={refetchFailed}>Retry</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {failedJobs.map((failedJob) => (
            <Card key={failedJob.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{failedJob.jobName}</h3>
                      <Badge className="bg-red-100 text-red-800">
                        {failedJob.isResolved ? 'Resolved' : 'Failed'}
                      </Badge>
                    </div>
                    <p className="text-sm text-red-600 mb-2">{failedJob.errorMessage}</p>
                    <p className="text-xs text-gray-500">
                      Type: {failedJob.jobType} • Retries: {failedJob.retryCount}/{failedJob.maxRetries} • 
                      Failed: {new Date(failedJob.failedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!failedJob.isResolved && (
                      <Button size="sm" onClick={() => handleResolveFailedJob(failedJob.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderApiLogsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Third Party API Logs</h2>
        <Button variant="outline" onClick={refetchApiLogs} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {apiLogsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API logs...</p>
        </div>
      ) : apiLogsError ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading API logs: {apiLogsError}</p>
          <Button onClick={refetchApiLogs}>Retry</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {apiLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{log.apiName}</h3>
                      {getStatusBadge(log.status)}
                      <Badge className={log.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {log.isSuccess ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {log.method} {log.endpoint} • Status: {log.statusCode} • 
                      Response Time: {log.responseTime}ms
                    </p>
                    {log.errorMessage && (
                      <p className="text-sm text-red-600 mb-2">{log.errorMessage}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Created: {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderWebhooksTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Webhooks</h2>
        <div className="flex gap-2">
          <Button onClick={handleCreateWebhook} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Webhook
          </Button>
          <Button variant="outline" onClick={refetchWebhooks} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {webhooksLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading webhooks...</p>
        </div>
      ) : webhooksError ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading webhooks: {webhooksError}</p>
          <Button onClick={refetchWebhooks}>Retry</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{webhook.webhookName}</h3>
                      {getStatusBadge(webhook.status)}
                      <Badge className={webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {webhook.webhookUrl} • Event: {webhook.eventType}
                    </p>
                    <p className="text-xs text-gray-500">
                      Failures: {webhook.failureCount} • 
                      Last Triggered: {webhook.lastTriggeredAt ? new Date(webhook.lastTriggeredAt).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'jobs', label: 'Jobs', icon: Clock },
    { id: 'batches', label: 'Batches', icon: Database },
    { id: 'failed', label: 'Failed Jobs', icon: AlertTriangle },
    { id: 'api-logs', label: 'API Logs', icon: FileText },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Background Processing</h1>
          <p className="text-gray-600">Manage background jobs, batches, and system integrations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onNavigateToSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" onClick={onNavigateToLogs}>
            <Activity className="h-4 w-4 mr-2" />
            System Logs
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
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {selectedTab === 'jobs' && renderJobsTab()}
        {selectedTab === 'batches' && renderBatchesTab()}
        {selectedTab === 'failed' && renderFailedTab()}
        {selectedTab === 'api-logs' && renderApiLogsTab()}
        {selectedTab === 'webhooks' && renderWebhooksTab()}
      </div>
    </div>
  );
}
