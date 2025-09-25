import { SupabaseDatabaseService } from './supabase-database';
import { NotificationService } from './notification-service';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'manual' | 'automatic' | 'conditional';
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  nextSteps?: string[];
  timeout?: number; // in minutes
  assignedRole?: string;
  sla?: number; // in hours
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: any;
}

export interface WorkflowAction {
  type: 'update_status' | 'assign_user' | 'send_notification' | 'create_task' | 'escalate' | 'approve' | 'reject';
  parameters: Record<string, any>;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  caseId: string;
  currentStep: string;
  status: 'active' | 'completed' | 'paused' | 'failed';
  startedAt: string;
  completedAt?: string;
  data: Record<string, any>;
  history: WorkflowStepExecution[];
}

export interface WorkflowStepExecution {
  stepId: string;
  executedAt: string;
  executedBy?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
}

export class WorkflowEngine {
  private static workflows: Map<string, WorkflowStep[]> = new Map();
  private static instances: Map<string, WorkflowInstance> = new Map();

  // Predefined loan application workflows
  static initializeWorkflows() {
    // Standard Loan Application Workflow
    const loanApplicationWorkflow: WorkflowStep[] = [
      {
        id: 'application_received',
        name: 'Application Received',
        type: 'automatic',
        actions: [
          { type: 'update_status', parameters: { status: 'received' } },
          { type: 'send_notification', parameters: { type: 'application_received', to: 'customer' } },
          { type: 'create_task', parameters: { title: 'Initial Review', assignedRole: 'salesperson' } }
        ],
        nextSteps: ['initial_review']
      },
      {
        id: 'initial_review',
        name: 'Initial Review',
        type: 'manual',
        assignedRole: 'salesperson',
        sla: 24,
        actions: [
          { type: 'create_task', parameters: { title: 'Review Application', assignedRole: 'salesperson' } }
        ],
        nextSteps: ['document_collection', 'reject_application']
      },
      {
        id: 'document_collection',
        name: 'Document Collection',
        type: 'manual',
        assignedRole: 'salesperson',
        sla: 48,
        actions: [
          { type: 'update_status', parameters: { status: 'document_collection' } },
          { type: 'send_notification', parameters: { type: 'documents_required', to: 'customer' } }
        ],
        nextSteps: ['document_verification', 'reject_application']
      },
      {
        id: 'document_verification',
        name: 'Document Verification',
        type: 'manual',
        assignedRole: 'salesperson',
        sla: 24,
        actions: [
          { type: 'update_status', parameters: { status: 'document_verification' } }
        ],
        nextSteps: ['credit_assessment', 'reject_application']
      },
      {
        id: 'credit_assessment',
        name: 'Credit Assessment',
        type: 'manual',
        assignedRole: 'credit-ops',
        sla: 72,
        actions: [
          { type: 'update_status', parameters: { status: 'credit_assessment' } },
          { type: 'create_task', parameters: { title: 'Credit Assessment', assignedRole: 'credit-ops' } }
        ],
        nextSteps: ['compliance_review', 'reject_application']
      },
      {
        id: 'compliance_review',
        name: 'Compliance Review',
        type: 'manual',
        assignedRole: 'compliance',
        sla: 48,
        actions: [
          { type: 'update_status', parameters: { status: 'compliance_review' } },
          { type: 'create_task', parameters: { title: 'Compliance Review', assignedRole: 'compliance' } }
        ],
        nextSteps: ['final_approval', 'reject_application']
      },
      {
        id: 'final_approval',
        name: 'Final Approval',
        type: 'manual',
        assignedRole: 'manager',
        sla: 24,
        actions: [
          { type: 'update_status', parameters: { status: 'final_approval' } },
          { type: 'create_task', parameters: { title: 'Final Approval', assignedRole: 'manager' } }
        ],
        nextSteps: ['disbursement', 'reject_application']
      },
      {
        id: 'disbursement',
        name: 'Disbursement',
        type: 'manual',
        assignedRole: 'credit-ops',
        sla: 24,
        actions: [
          { type: 'update_status', parameters: { status: 'approved' } },
          { type: 'send_notification', parameters: { type: 'loan_approved', to: 'customer' } },
          { type: 'create_task', parameters: { title: 'Process Disbursement', assignedRole: 'credit-ops' } }
        ],
        nextSteps: ['completed']
      },
      {
        id: 'reject_application',
        name: 'Reject Application',
        type: 'manual',
        assignedRole: 'manager',
        actions: [
          { type: 'update_status', parameters: { status: 'rejected' } },
          { type: 'send_notification', parameters: { type: 'loan_rejected', to: 'customer' } }
        ],
        nextSteps: ['completed']
      },
      {
        id: 'completed',
        name: 'Completed',
        type: 'automatic',
        actions: [
          { type: 'update_status', parameters: { status: 'completed' } }
        ]
      }
    ];

    this.workflows.set('loan_application', loanApplicationWorkflow);
  }

  // Start a new workflow instance
  static async startWorkflow(workflowId: string, caseId: string, initialData: Record<string, any> = {}): Promise<WorkflowInstance> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const instance: WorkflowInstance = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      caseId,
      currentStep: workflow[0].id,
      status: 'active',
      startedAt: new Date().toISOString(),
      data: initialData,
      history: []
    };

    this.instances.set(instance.id, instance);

    // Save to database first
    await this.saveWorkflowInstance(instance);

    // Execute the first step
    await this.executeStep(instance.id, workflow[0]);

    return instance;
  }

  // Execute a workflow step
  static async executeStep(instanceId: string, step: WorkflowStep): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance ${instanceId} not found`);
    }

    const execution: WorkflowStepExecution = {
      stepId: step.id,
      executedAt: new Date().toISOString(),
      status: 'in_progress'
    };

    try {
      // Execute all actions for this step
      for (const action of step.actions) {
        await this.executeAction(action, instance);
      }

      execution.status = 'completed';
      execution.executedAt = new Date().toISOString();

      // Move to next step if defined
      if (step.nextSteps && step.nextSteps.length > 0) {
        const nextStepId = step.nextSteps[0]; // For now, take the first next step
        const workflow = this.workflows.get(instance.workflowId);
        const nextStep = workflow?.find(s => s.id === nextStepId);
        
        if (nextStep) {
          instance.currentStep = nextStepId;
          // Auto-execute if it's an automatic step
          if (nextStep.type === 'automatic') {
            await this.executeStep(instanceId, nextStep);
          }
        }
      }

      // Check if workflow is completed
      if (!step.nextSteps || step.nextSteps.length === 0) {
        instance.status = 'completed';
        instance.completedAt = new Date().toISOString();
      }

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      instance.status = 'failed';
    }

    instance.history.push(execution);
    this.instances.set(instanceId, instance);

    // Save to database
    await this.saveWorkflowInstance(instance);
  }

  // Execute a specific action
  private static async executeAction(action: WorkflowAction, instance: WorkflowInstance): Promise<void> {
    switch (action.type) {
      case 'update_status':
        await SupabaseDatabaseService.updateCase(instance.caseId, {
          status: action.parameters.status
        });
        break;

      case 'assign_user':
        await SupabaseDatabaseService.updateCase(instance.caseId, {
          assigned_to: action.parameters.userId
        });
        break;

      case 'send_notification':
        await NotificationService.sendNotificationWithCaseData(
          action.parameters.type,
          instance.caseId,
          action.parameters.to,
          instance.data
        );
        break;

      case 'create_task':
        await SupabaseDatabaseService.createTask({
          case_id: instance.caseId,
          title: action.parameters.title,
          assigned_to: action.parameters.assignedRole,
          status: 'open',
          priority: 'normal'
        });
        break;

      case 'escalate':
        // Implementation for escalation logic
        console.log('Escalating case:', instance.caseId);
        break;

      case 'approve':
        await SupabaseDatabaseService.updateCase(instance.caseId, {
          status: 'approved'
        });
        break;

      case 'reject':
        await SupabaseDatabaseService.updateCase(instance.caseId, {
          status: 'rejected'
        });
        break;

      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  // Save workflow instance to database
  private static async saveWorkflowInstance(instance: WorkflowInstance): Promise<void> {
    try {
      await SupabaseDatabaseService.createWorkflowInstance({
        id: instance.id,
        workflow_id: instance.workflowId,
        case_id: instance.caseId,
        current_step: instance.currentStep,
        status: instance.status,
        started_at: instance.startedAt,
        completed_at: instance.completedAt,
        data: instance.data,
        history: instance.history
      });
    } catch (error) {
      console.error('Error saving workflow instance:', error);
    }
  }

  // Get workflow instance
  static getWorkflowInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId);
  }

  // Get all workflow instances for a case
  static getWorkflowInstancesForCase(caseId: string): WorkflowInstance[] {
    return Array.from(this.instances.values()).filter(instance => instance.caseId === caseId);
  }

  // Check for SLA violations
  static async checkSLAViolations(): Promise<void> {
    const activeInstances = Array.from(this.instances.values()).filter(instance => instance.status === 'active');
    
    for (const instance of activeInstances) {
      const workflow = this.workflows.get(instance.workflowId);
      const currentStep = workflow?.find(step => step.id === instance.currentStep);
      
      if (currentStep?.sla) {
        const stepStartTime = new Date(instance.history.find(h => h.stepId === instance.currentStep)?.executedAt || instance.startedAt);
        const now = new Date();
        const hoursElapsed = (now.getTime() - stepStartTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursElapsed > currentStep.sla) {
          // SLA violation - escalate or notify
          await NotificationService.sendNotificationWithCaseData(
            'sla_violation',
            instance.caseId,
            'manager',
            {
              step: currentStep.name,
              sla: currentStep.sla,
              elapsed: hoursElapsed
            }
          );
        }
      }
    }
  }

  // Process all active workflows (call this periodically)
  static async processActiveWorkflows(): Promise<void> {
    try {
      // Get all active workflow instances from database
      const activeInstances = await SupabaseDatabaseService.getActiveWorkflowInstances();
      
      for (const instance of activeInstances) {
        const workflow = this.workflows.get(instance.workflow_id);
        if (!workflow) continue;

        const currentStep = workflow.find(step => step.id === instance.current_step);
        if (!currentStep) continue;

        // Check if this is an automatic step that needs execution
        if (currentStep.type === 'automatic' && instance.status === 'active') {
          await this.executeStep(instance.id, currentStep);
        }

        // Check for SLA violations
        await this.checkSLAViolationsForInstance(instance);
      }
    } catch (error) {
      console.error('Error processing active workflows:', error);
    }
  }

  // Check SLA violations for a specific instance
  private static async checkSLAViolationsForInstance(instance: any): Promise<void> {
    const workflow = this.workflows.get(instance.workflow_id);
    const currentStep = workflow?.find(step => step.id === instance.current_step);
    
    if (currentStep?.sla) {
      const stepStartTime = new Date(instance.started_at);
      const now = new Date();
      const hoursElapsed = (now.getTime() - stepStartTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursElapsed > currentStep.sla) {
        // SLA violation - send notification
        await NotificationService.sendNotificationWithCaseData(
          'sla_violation',
          instance.case_id,
          'manager',
          {
            step: currentStep.name,
            sla: currentStep.sla,
            elapsed: hoursElapsed
          }
        );
      }
    }
  }

  // Auto-start workflows for new cases
  static async autoStartWorkflowsForNewCases(): Promise<void> {
    try {
      // Get cases that don't have active workflows
      const casesWithoutWorkflows = await SupabaseDatabaseService.getCasesWithoutWorkflows();
      
      for (const caseData of casesWithoutWorkflows) {
        if (caseData.status === 'open') {
          await this.startWorkflow('loan_application', caseData.id.toString(), {
            case_number: caseData.case_number,
            customer_id: caseData.customer_id,
            product_id: caseData.product_id,
            assigned_to: caseData.assigned_to,
            loan_amount: caseData.loan_amount,
            priority: caseData.priority
          });
        }
      }
    } catch (error) {
      console.error('Error auto-starting workflows:', error);
    }
  }
}

// Initialize workflows when the module loads
WorkflowEngine.initializeWorkflows();

// Set up periodic processing
setInterval(() => {
  WorkflowEngine.processActiveWorkflows();
  WorkflowEngine.autoStartWorkflowsForNewCases();
}, 30000); // Process every 30 seconds
