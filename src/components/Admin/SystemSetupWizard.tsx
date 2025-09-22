import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Users, 
  Package, 
  Settings, 
  Database,
  Play,
  RefreshCw,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { OrganizationSetup } from './OrganizationSetup';
import { DepartmentManagement } from './DepartmentManagement';
import { ProductManagement } from './ProductManagement';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  required: boolean;
  completed: boolean;
}

interface SetupProgress {
  currentStep: number;
  completedSteps: number;
  totalSteps: number;
  stepStatus: { [key: string]: 'pending' | 'in-progress' | 'completed' | 'error' };
}

export function SystemSetupWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [setupProgress, setSetupProgress] = useState<SetupProgress>({
    currentStep: 0,
    completedSteps: 0,
    totalSteps: 4,
    stepStatus: {
      'organizations': 'pending',
      'departments': 'pending',
      'products': 'pending',
      'workflows': 'pending'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupSteps: SetupStep[] = [
    {
      id: 'organizations',
      title: 'Organization Setup',
      description: 'Create and configure organizations for multi-tenant support',
      icon: Building2,
      component: OrganizationSetup,
      required: true,
      completed: false
    },
    {
      id: 'departments',
      title: 'Department Structure',
      description: 'Set up departments and organizational hierarchy',
      icon: Users,
      component: DepartmentManagement,
      required: true,
      completed: false
    },
    {
      id: 'products',
      title: 'Loan Products',
      description: 'Configure loan products and their parameters',
      icon: Package,
      component: ProductManagement,
      required: true,
      completed: false
    },
    {
      id: 'workflows',
      title: 'Workflow Configuration',
      description: 'Set up approval workflows and task categories',
      icon: Settings,
      component: WorkflowSetup,
      required: false,
      completed: false
    }
  ];

  // Check setup progress
  const checkSetupProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const [orgs, depts, products] = await Promise.all([
        SupabaseDatabaseService.getOrganizations(),
        SupabaseDatabaseService.getDepartments(),
        SupabaseDatabaseService.getLoanProducts()
      ]);

      const newStepStatus = {
        'organizations': orgs.length > 0 ? 'completed' : 'pending',
        'departments': depts.length > 0 ? 'completed' : 'pending',
        'products': products.length > 0 ? 'completed' : 'pending',
        'workflows': 'pending' // Will be implemented later
      };

      const completedSteps = Object.values(newStepStatus).filter(status => status === 'completed').length;

      setSetupProgress({
        currentStep: currentStepIndex,
        completedSteps,
        totalSteps: setupSteps.length,
        stepStatus: newStepStatus
      });

      // Update step completion status
      setupSteps.forEach((step, index) => {
        step.completed = newStepStatus[step.id as keyof typeof newStepStatus] === 'completed';
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check setup progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSetupProgress();
  }, [currentStepIndex]);

  // Navigation handlers
  const goToNextStep = () => {
    if (currentStepIndex < setupSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  };

  // Handle step completion
  const handleStepComplete = (stepId: string) => {
    console.log(`✅ Step completed: ${stepId}`);
    // Refresh progress to update completion status
    checkSetupProgress();
  };

  // Handle next step from current step
  const handleNextStep = () => {
    console.log('➡️ Moving to next step');
    goToNextStep();
  };

  // Get step status
  const getStepStatus = (stepId: string) => {
    return setupProgress.stepStatus[stepId] || 'pending';
  };

  // Get step status icon
  const getStepStatusIcon = (stepId: string) => {
    const status = getStepStatus(stepId);
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get step status badge
  const getStepStatusBadge = (stepId: string) => {
    const status = getStepStatus(stepId);
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="primary">In Progress</Badge>;
      case 'error':
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const currentStep = setupSteps[currentStepIndex];
  const CurrentComponent = currentStep.component;

  // Render component with proper props
  const renderCurrentStepComponent = () => {
    const stepId = currentStep.id;
    
    switch (stepId) {
      case 'organizations':
        return (
          <OrganizationSetup 
            onComplete={() => handleStepComplete(stepId)}
            onNext={handleNextStep}
          />
        );
      case 'departments':
        return (
          <DepartmentManagement />
        );
      case 'products':
        return (
          <ProductManagement />
        );
      case 'workflows':
        return <WorkflowSetup />;
      default:
        return <CurrentComponent />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">System Setup Wizard</h1>
        <p className="text-gray-600 mt-2">Configure your VERIPHY banking system step by step</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Setup Progress</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {setupProgress.completedSteps} of {setupProgress.totalSteps} completed
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(setupProgress.completedSteps / setupProgress.totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {setupSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = step.completed;
              const isClickable = index <= currentStepIndex || isCompleted;

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-50' 
                        : isClickable 
                          ? 'border-gray-300 hover:border-gray-400' 
                          : 'border-gray-200 bg-gray-50'
                  }`}
                  onClick={() => isClickable && goToStep(index)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`h-6 w-6 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                    {getStepStatusIcon(step.id)}
                  </div>
                  <div className="flex items-center justify-between">
                    {getStepStatusBadge(step.id)}
                    {step.required && (
                      <span className="text-xs text-red-600 font-medium">Required</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <currentStep.icon className="h-6 w-6 text-blue-600" />
            <span>{currentStep.title}</span>
            {currentStep.required && (
              <Badge variant="error">Required</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderCurrentStepComponent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={checkSetupProgress}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Progress
              </Button>

              {currentStepIndex < setupSteps.length - 1 ? (
                <Button
                  onClick={goToNextStep}
                  disabled={!currentStep.completed && currentStep.required}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    // Setup complete - redirect to dashboard
                    window.location.href = '/admin';
                  }}
                  disabled={!currentStep.completed && currentStep.required}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Placeholder Workflow Setup Component
function WorkflowSetup() {
  return (
    <div className="text-center py-12">
      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow Configuration</h3>
      <p className="text-gray-600 mb-4">
        This feature will be available in the next update. You can continue with the current setup.
      </p>
      <Badge variant="warning">Coming Soon</Badge>
    </div>
  );
}
