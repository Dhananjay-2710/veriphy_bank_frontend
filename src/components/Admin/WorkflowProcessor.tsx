import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Users,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { WorkflowEngine } from '../../services/workflow-engine';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface WorkflowProcessorProps {
  onWorkflowUpdate?: () => void;
}

interface WorkflowStats {
  activeInstances: number;
  completedToday: number;
  slaViolations: number;
  processingRate: number;
}

interface WorkflowInstance {
  id: string;
  workflow_id: string;
  case_id: string;
  current_step: string;
  status: string;
  started_at: string;
  data: any;
}

export function WorkflowProcessor({ onWorkflowUpdate }: WorkflowProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<WorkflowStats>({
    activeInstances: 0,
    completedToday: 0,
    slaViolations: 0,
    processingRate: 0
  });
  const [activeInstances, setActiveInstances] = useState<WorkflowInstance[]>([]);
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null);
  const [processingLog, setProcessingLog] = useState<string[]>([]);

  // Load workflow statistics
  const loadStats = useCallback(async () => {
    try {
      const activeInstances = await SupabaseDatabaseService.getActiveWorkflowInstances();
      const today = new Date().toISOString().split('T')[0];
      
      // Get completed instances for today
      const { data: completedData } = await SupabaseDatabaseService.supabase
        .from('workflow_instances')
        .select('*')
        .eq('status', 'completed')
        .gte('completed_at', today);

      // Calculate SLA violations (instances running longer than expected)
      const slaViolations = activeInstances.filter(instance => {
        const startTime = new Date(instance.started_at);
        const now = new Date();
        const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return hoursElapsed > 72; // Assume 72 hours as max SLA
      }).length;

      setStats({
        activeInstances: activeInstances.length,
        completedToday: completedData?.length || 0,
        slaViolations,
        processingRate: activeInstances.length > 0 ? (completedData?.length || 0) / activeInstances.length * 100 : 0
      });

      setActiveInstances(activeInstances.slice(0, 10)); // Show last 10
    } catch (error) {
      console.error('Error loading workflow stats:', error);
    }
  }, []);

  // Process workflows
  const processWorkflows = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    const startTime = new Date();
    
    try {
      setProcessingLog(prev => [...prev, `[${startTime.toLocaleTimeString()}] Starting workflow processing...`]);
      
      // Process active workflows
      await WorkflowEngine.processActiveWorkflows();
      setProcessingLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Processed active workflows`]);
      
      // Auto-start workflows for new cases
      await WorkflowEngine.autoStartWorkflowsForNewCases();
      setProcessingLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Auto-started workflows for new cases`]);
      
      // Reload stats
      await loadStats();
      
      setLastProcessed(new Date());
      setProcessingLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Workflow processing completed`]);
      
      // Notify parent component
      onWorkflowUpdate?.();
      
    } catch (error) {
      console.error('Error processing workflows:', error);
      setProcessingLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, loadStats, onWorkflowUpdate]);

  // Auto-process every 30 seconds when enabled
  useEffect(() => {
    const interval = setInterval(() => {
      if (isProcessing) {
        processWorkflows();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isProcessing, processWorkflows]);

  // Load initial data
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const toggleProcessing = () => {
    setIsProcessing(!isProcessing);
    if (!isProcessing) {
      processWorkflows();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepName = (stepId: string) => {
    const stepNames: Record<string, string> = {
      'application_received': 'Application Received',
      'initial_review': 'Initial Review',
      'document_collection': 'Document Collection',
      'document_verification': 'Document Verification',
      'credit_assessment': 'Credit Assessment',
      'compliance_review': 'Compliance Review',
      'final_approval': 'Final Approval',
      'disbursement': 'Disbursement',
      'completed': 'Completed'
    };
    return stepNames[stepId] || stepId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Processor</h2>
          <p className="text-gray-600">Automated loan processing workflow engine</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={toggleProcessing}
            variant={isProcessing ? "destructive" : "default"}
            className="flex items-center space-x-2"
          >
            {isProcessing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isProcessing ? 'Stop Processing' : 'Start Processing'}</span>
          </Button>
          <Button
            onClick={processWorkflows}
            disabled={isProcessing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Process Now</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Instances</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeInstances}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SLA Violations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.slaViolations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.processingRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Instances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Active Workflow Instances</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeInstances.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active workflow instances</p>
          ) : (
            <div className="space-y-4">
              {activeInstances.map((instance) => (
                <div key={instance.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(instance.status)}>
                        {instance.status}
                      </Badge>
                      <span className="font-medium">Case #{instance.data?.case_number || instance.case_id}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-sm text-gray-600">
                        {getStepName(instance.current_step)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Started: {new Date(instance.started_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {Math.round((new Date().getTime() - new Date(instance.started_at).getTime()) / (1000 * 60 * 60))}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Processing Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {processingLog.length === 0 ? (
              <p className="text-gray-500">No processing activity yet</p>
            ) : (
              processingLog.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
          {lastProcessed && (
            <p className="text-sm text-gray-500 mt-2">
              Last processed: {lastProcessed.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
