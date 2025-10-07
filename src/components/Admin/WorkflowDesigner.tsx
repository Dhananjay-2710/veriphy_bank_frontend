import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Download, 
  Upload,
  GitBranch,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  Save,
  ArrowRight,
  ArrowDown,
  Diamond,
  Circle,
  RotateCcw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'start' | 'process' | 'decision' | 'approval' | 'notification' | 'end';
  description: string;
  assignedRole?: string;
  automationScript?: string;
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value: string;
    nextStep: string;
  }>;
  slaHours?: number;
  position: { x: number; y: number };
  connections: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'loan_processing' | 'document_verification' | 'compliance' | 'approval' | 'custom';
  status: 'draft' | 'active' | 'paused' | 'archived';
  version: string;
  steps: WorkflowStep[];
  triggers: Array<{
    event: string;
    conditions: any;
  }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  totalInstances: number;
  activeInstances: number;
  completedInstances: number;
  averageCompletionTime: string;
  successRate: number;
}

const STEP_TYPES = [
  { type: 'start', name: 'Start', icon: Play, color: 'bg-green-500' },
  { type: 'process', name: 'Process', icon: Settings, color: 'bg-blue-500' },
  { type: 'decision', name: 'Decision', icon: Diamond, color: 'bg-yellow-500' },
  { type: 'approval', name: 'Approval', icon: CheckCircle, color: 'bg-purple-500' },
  { type: 'notification', name: 'Notification', icon: AlertCircle, color: 'bg-orange-500' },
  { type: 'end', name: 'End', icon: Square, color: 'bg-red-500' }
];

const PREDEFINED_WORKFLOWS = [
  {
    name: 'Personal Loan Processing',
    category: 'loan_processing',
    description: 'Standard workflow for personal loan applications',
    steps: [
      { type: 'start', name: 'Application Submitted' },
      { type: 'process', name: 'Initial Document Review' },
      { type: 'decision', name: 'KYC Verification' },
      { type: 'process', name: 'Credit Score Check' },
      { type: 'decision', name: 'Income Verification' },
      { type: 'approval', name: 'Manager Approval' },
      { type: 'notification', name: 'Customer Notification' },
      { type: 'end', name: 'Process Complete' }
    ]
  },
  {
    name: 'Document Verification',
    category: 'document_verification',
    description: 'Automated document verification workflow',
    steps: [
      { type: 'start', name: 'Document Uploaded' },
      { type: 'process', name: 'OCR Processing' },
      { type: 'decision', name: 'Auto Verification' },
      { type: 'process', name: 'Manual Review' },
      { type: 'approval', name: 'Final Verification' },
      { type: 'notification', name: 'Status Update' },
      { type: 'end', name: 'Verification Complete' }
    ]
  },
  {
    name: 'Compliance Check',
    category: 'compliance',
    description: 'Regulatory compliance verification workflow',
    steps: [
      { type: 'start', name: 'Compliance Trigger' },
      { type: 'process', name: 'AML Screening' },
      { type: 'process', name: 'Sanctions Check' },
      { type: 'decision', name: 'Risk Assessment' },
      { type: 'approval', name: 'Compliance Officer Review' },
      { type: 'notification', name: 'Report Generation' },
      { type: 'end', name: 'Compliance Cleared' }
    ]
  }
];

export function WorkflowDesigner() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStepType, setSelectedStepType] = useState<string>('process');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the database
      const mockWorkflows: Workflow[] = [
        {
          id: '1',
          name: 'Personal Loan Processing',
          description: 'Standard workflow for personal loan applications',
          category: 'loan_processing',
          status: 'active',
          version: '1.2',
          steps: generateMockSteps('personal_loan'),
          triggers: [{ event: 'case_created', conditions: { loan_type: 'personal_loan' } }],
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          createdBy: 'Super Admin',
          totalInstances: 45,
          activeInstances: 12,
          completedInstances: 33,
          averageCompletionTime: '2.3 days',
          successRate: 87.5
        },
        {
          id: '2',
          name: 'Home Loan Processing',
          description: 'Comprehensive workflow for home loan applications',
          category: 'loan_processing',
          status: 'active',
          version: '1.0',
          steps: generateMockSteps('home_loan'),
          triggers: [{ event: 'case_created', conditions: { loan_type: 'home_loan' } }],
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          createdBy: 'Super Admin',
          totalInstances: 28,
          activeInstances: 8,
          completedInstances: 20,
          averageCompletionTime: '5.2 days',
          successRate: 92.1
        },
        {
          id: '3',
          name: 'Document Verification',
          description: 'Automated document verification process',
          category: 'document_verification',
          status: 'active',
          version: '2.1',
          steps: generateMockSteps('document'),
          triggers: [{ event: 'document_uploaded', conditions: {} }],
          createdAt: '2024-01-08',
          updatedAt: '2024-01-22',
          createdBy: 'System',
          totalInstances: 156,
          activeInstances: 23,
          completedInstances: 133,
          averageCompletionTime: '4.2 hours',
          successRate: 94.8
        }
      ];
      setWorkflows(mockWorkflows);
    } finally {
      setLoading(false);
    }
  };

  const generateMockSteps = (type: string): WorkflowStep[] => {
    const baseSteps: WorkflowStep[] = [
      {
        id: 'start',
        name: 'Start',
        type: 'start',
        description: 'Workflow initiated',
        position: { x: 100, y: 100 },
        connections: ['step1']
      },
      {
        id: 'step1',
        name: 'Initial Review',
        type: 'process',
        description: 'Initial document and data review',
        assignedRole: 'loan_officer',
        slaHours: 24,
        position: { x: 300, y: 100 },
        connections: ['decision1']
      },
      {
        id: 'decision1',
        name: 'KYC Check',
        type: 'decision',
        description: 'Verify customer KYC status',
        conditions: [
          { field: 'kyc_status', operator: 'equals', value: 'verified', nextStep: 'step2' },
          { field: 'kyc_status', operator: 'equals', value: 'pending', nextStep: 'kyc_process' }
        ],
        position: { x: 500, y: 100 },
        connections: ['step2', 'kyc_process']
      },
      {
        id: 'step2',
        name: 'Credit Verification',
        type: 'process',
        description: 'Verify customer credit score and history',
        assignedRole: 'credit_analyst',
        slaHours: 12,
        position: { x: 700, y: 100 },
        connections: ['approval1']
      },
      {
        id: 'approval1',
        name: 'Manager Approval',
        type: 'approval',
        description: 'Final approval from manager',
        assignedRole: 'manager',
        slaHours: 48,
        position: { x: 900, y: 100 },
        connections: ['notification1']
      },
      {
        id: 'notification1',
        name: 'Customer Notification',
        type: 'notification',
        description: 'Notify customer of decision',
        automationScript: 'send_approval_notification',
        position: { x: 1100, y: 100 },
        connections: ['end']
      },
      {
        id: 'end',
        name: 'End',
        type: 'end',
        description: 'Workflow completed',
        position: { x: 1300, y: 100 },
        connections: []
      }
    ];

    return baseSteps;
  };

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: 'New Workflow',
      description: 'New workflow description',
      category: 'custom',
      status: 'draft',
      version: '1.0',
      steps: [
        {
          id: 'start',
          name: 'Start',
          type: 'start',
          description: 'Workflow start',
          position: { x: 100, y: 100 },
          connections: []
        }
      ],
      triggers: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: 'Super Admin',
      totalInstances: 0,
      activeInstances: 0,
      completedInstances: 0,
      averageCompletionTime: 'N/A',
      successRate: 0
    };
    setSelectedWorkflow(newWorkflow);
    setIsDesigning(true);
  };

  const createFromTemplate = (template: any) => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      category: template.category,
      status: 'draft',
      version: '1.0',
      steps: generateMockSteps(template.category),
      triggers: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: 'Super Admin',
      totalInstances: 0,
      activeInstances: 0,
      completedInstances: 0,
      averageCompletionTime: 'N/A',
      successRate: 0
    };
    setSelectedWorkflow(newWorkflow);
    setIsDesigning(true);
    setShowTemplates(false);
  };

  const saveWorkflow = async () => {
    if (!selectedWorkflow) return;
    
    try {
      // In a real app, this would save to the database
      if (workflows.find(w => w.id === selectedWorkflow.id)) {
        setWorkflows(workflows.map(w => 
          w.id === selectedWorkflow.id ? { ...selectedWorkflow, updatedAt: new Date().toISOString().split('T')[0] } : w
        ));
      } else {
        setWorkflows([...workflows, selectedWorkflow]);
      }
      setIsDesigning(false);
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const toggleWorkflowStatus = async (workflowId: string) => {
    setWorkflows(workflows.map(w => 
      w.id === workflowId 
        ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
        : w
    ));
  };

  const deleteWorkflow = async (workflowId: string) => {
    setWorkflows(workflows.filter(w => w.id !== workflowId));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'loan_processing': return <GitBranch className="h-4 w-4" />;
      case 'document_verification': return <Eye className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      case 'approval': return <CheckCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflows...</p>
        </div>
      </div>
    );
  }

  if (isDesigning && selectedWorkflow) {
    return (
      <div className="space-y-6">
        {/* Designer Header */}
        <div className="relative flex items-center justify-between">
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="text-2xl font-bold text-white">Workflow Designer</h1>
            <p className="text-gray-300">Designing: {selectedWorkflow.name}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsDesigning(false)} style={{ background: '#ffffff', color: '#374151' }}>
              Cancel
            </Button>
            <Button onClick={saveWorkflow} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        </div>

        {/* Designer Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {STEP_TYPES.map((stepType) => (
                <Button
                  key={stepType.type}
                  variant={selectedStepType === stepType.type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStepType(stepType.type)}
                  className="flex items-center"
                >
                  <stepType.icon className="h-4 w-4 mr-2" />
                  {stepType.name}
                </Button>
              ))}
            </div>

            {/* Visual Workflow Designer */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-96 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {selectedWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="relative">
                    <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          {STEP_TYPES.find(t => t.type === step.type)?.icon && (
                            <div className={`p-2 rounded-full ${STEP_TYPES.find(t => t.type === step.type)?.color} text-white mr-2`}>
                              {React.createElement(STEP_TYPES.find(t => t.type === step.type)!.icon, { className: "h-4 w-4" })}
                            </div>
                          )}
                          <h4 className="font-medium text-sm">{step.name}</h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                        {step.assignedRole && (
                          <Badge className="text-xs">{step.assignedRole}</Badge>
                        )}
                        {step.slaHours && (
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {step.slaHours}h SLA
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    {index < selectedWorkflow.steps.length - 1 && (
                      <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-400">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">Workflow Management</h1>
          <p className="text-gray-300">Design and manage business process workflows</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowTemplates(!showTemplates)} style={{ background: '#ffffff', color: '#374151' }}>
            <Copy className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={createNewWorkflow} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PREDEFINED_WORKFLOWS.map((template, index) => (
                <Card key={index} className="border hover:border-blue-300 transition-colors cursor-pointer" onClick={() => createFromTemplate(template)}>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      {getCategoryIcon(template.category)}
                      <h3 className="font-medium ml-2">{template.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <Badge className="text-xs">{template.steps.length} steps</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {getCategoryIcon(workflow.category)}
                    <h3 className="text-lg font-semibold ml-2">{workflow.name}</h3>
                    <Badge className={`ml-3 ${getStatusBadgeColor(workflow.status)}`}>
                      {workflow.status}
                    </Badge>
                    <span className="text-sm text-gray-500 ml-2">v{workflow.version}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{workflow.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Instances</p>
                      <p className="text-xl font-semibold">{workflow.totalInstances}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active</p>
                      <p className="text-xl font-semibold text-blue-600">{workflow.activeInstances}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="text-xl font-semibold text-green-600">{workflow.completedInstances}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg Time</p>
                      <p className="text-lg font-semibold">{workflow.averageCompletionTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Success Rate</p>
                      <p className="text-lg font-semibold text-green-600">{workflow.successRate}%</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <span>Created: {workflow.createdAt}</span>
                    <span className="mx-2">•</span>
                    <span>Updated: {workflow.updatedAt}</span>
                    <span className="mx-2">•</span>
                    <span>{workflow.steps.length} steps</span>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setIsDesigning(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWorkflowStatus(workflow.id)}
                    className={workflow.status === 'active' ? 'text-yellow-600' : 'text-green-600'}
                  >
                    {workflow.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteWorkflow(workflow.id)}
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

      {workflows.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
            <p className="text-gray-600 mb-4">Create your first workflow to get started with process automation.</p>
            <Button onClick={createNewWorkflow} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
