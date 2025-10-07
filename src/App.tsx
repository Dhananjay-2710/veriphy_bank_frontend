import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { Suspense, useEffect } from 'react';
import { useAuth } from './contexts/AuthContextFixed';
import { WhatsAppIntegrationService } from './services/whatsapp-integration-service';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { SessionTimeoutProvider } from './components/Layout/SessionTimeoutProvider';
import './styles/mobile.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoginPage } from './components/Auth/LoginPage';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { FullWidthLayout } from './components/Layout/FullWidthLayout';
import { PageLoadingSpinner, LoadingSpinner } from './components/ui/LoadingSpinner';
import { SalespersonDashboard } from './components/Dashboard/SalespersonDashboard';
import { CreditOpsDashboard } from './components/Dashboard/CreditOpsDashboard';
import { CasePage } from './components/Case/CasePage';
import { WorkloadPlanner } from './components/Workload/WorkloadPlanner';
import { WorkloadManagementPage } from './components/Workload/WorkloadManagementPage';
import { TeamOversight } from './components/Team/TeamOversight';
import { ApprovalQueue } from './components/Approval/ApprovalQueue';
import { ApprovalQueuePage } from './components/Approval/ApprovalQueuePage';
import { SystemHealthMonitor } from './components/System/SystemHealthMonitor';
import { AuditLogs } from './components/Audit/AuditLogs';
import { CommunicatorPage } from './components/Communicator/CommunicatorPage';
import { CasesListPage } from './components/Cases/CasesListPage';
import { DocumentManager } from './components/Documents/DocumentManager';
import { ComplianceReview } from './components/Compliance/ComplianceReview';
import { PendingReviews } from './components/Reviews/PendingReviews';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { UserManagement } from './components/Admin/UserManagement';
import { SystemSettings } from './components/Admin/SystemSettings';
import { Analytics } from './components/Admin/Analytics';
import { DepartmentManagement } from './components/Admin/DepartmentManagement';
import { RolesManagement } from './components/Admin/RolesManagement';
import { PermissionsManagement } from './components/Admin/PermissionsManagement';
import { ProductsManagement } from './components/Admin/ProductsManagement';
import { SubProductsManagement } from './components/Admin/SubProductsManagement';
import { DocumentTypesManagement } from './components/Admin/DocumentTypesManagement';
import { DocumentsManagement } from './components/Admin/DocumentsManagement';
import { ProductDocumentMapping } from './components/Admin/ProductDocumentMapping';
import { FeatureFlagsPage } from './components/Admin/FeatureFlagsPage';
import { SystemIntegrationsPage } from './components/Admin/SystemIntegrationsPage';
import { SystemSettingsPage } from './components/Admin/SystemSettingsPage';
import { OrganizationSettingsPage } from './components/Admin/OrganizationSettingsPage';
import { ManagerDashboard } from './components/Dashboard/ManagerDashboard';
import { ComplianceReports } from './components/Compliance/ComplianceReports';
import { TeamManagement } from './components/Team/TeamManagement';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
// import { SuperAdminDashboardFixed } from './components/Dashboard/SuperAdminDashboardFixed';

// New Admin Components
import { LoanApplicationManagement } from './components/Admin/LoanApplicationManagement';
import { TaskCategoryManagement } from './components/Admin/TaskCategoryManagement';
import { ComplianceIssueManagement } from './components/Admin/ComplianceIssueManagement';
import { UserProfileManagement } from './components/Admin/UserProfileManagement';
import { WorkflowManagementPage } from './components/Admin/WorkflowManagementPage';
import { BackgroundProcessingPage } from './components/Admin/BackgroundProcessingPage';
import { CacheManagementPage } from './components/Admin/CacheManagementPage';
import { EntityManagement } from './components/Admin/EntityManagement';

// Enhanced Admin Components
import { WorkflowDesigner } from './components/Admin/WorkflowDesigner';

import { SystemMonitoringDashboard } from './components/Admin/SystemMonitoringDashboard';
import { SuperAdminDashboard } from './components/Admin/SuperAdminDashboard';
import { OrganizationManagement } from './components/Admin/OrganizationManagement';
import { CustomerManagement } from './components/Admin/CustomerManagement';
import { SuperAdminAuditLogs } from './components/Admin/SuperAdminAuditLogs';

// Navigation Constants
import { ROUTES } from './constants/navigation';

// DocumentManager wrapper to handle URL parameters
function DocumentManagerWrapper() {
  const { caseId } = useParams<{ caseId: string }>();
  const { navigateDirect } = useNavigation();
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DocumentManager 
        caseId={caseId} 
        onBack={() => navigateDirect('/')} 
      />
    </Suspense>
  );
}

// Wrapper components for routes that need navigation
function TeamOversightWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <TeamOversight 
      onBack={() => navigateDirect('/')} 
      onNavigateToCase={(caseId: string) => navigateDirect(`/case/${caseId}`)}
    />
  );
}

function ApprovalQueueWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <ApprovalQueue 
      onBack={() => navigateDirect('/')} 
      onNavigateToCase={(caseId: string) => navigateDirect(`/case/${caseId}`)}
    />
  );
}

function SystemHealthMonitorWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <SystemHealthMonitor 
      onBack={() => navigateDirect('/')} 
    />
  );
}

function CasesListPageWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <CasesListPage 
      onBack={() => navigateDirect('/')} 
      onNavigateToCase={(caseId: string) => navigateDirect(`/case/${caseId}`)}
    />
  );
}

function WorkloadPlannerWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <WorkloadPlanner onBack={() => navigateDirect('/')} />
  );
}

function WorkloadManagementPageWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <WorkloadManagementPage 
      onBack={() => navigateDirect('/')} 
      onNavigateToCases={() => navigateDirect('/cases')}
      onNavigateToTasks={() => navigateDirect('/workload')}
    />
  );
}

function ApprovalQueuePageWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <ApprovalQueuePage 
      onBack={() => navigateDirect('/')} 
      onNavigateToCases={() => navigateDirect('/cases')}
      onNavigateToDocuments={() => navigateDirect('/document-manager')}
    />
  );
}

function DocumentManagerWrapper2() {
  const { navigateDirect } = useNavigation();
  return (
    <DocumentManager onBack={() => navigateDirect('/')} />
  );
}

function CommunicatorPageWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <CommunicatorPage onBack={() => navigateDirect('/')} />
  );
}

function ComplianceReviewWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <ComplianceReview 
      onBack={() => navigateDirect('/')} 
      onNavigateToCase={(caseId: string) => navigateDirect(`/case/${caseId}`)}
    />
  );
}

function PendingReviewsWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <PendingReviews 
      onBack={() => navigateDirect('/')} 
      onNavigateToCase={(caseId: string) => navigateDirect(`/case/${caseId}`)}
    />
  );
}

function ComplianceReportsWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <ComplianceReports onBack={() => navigateDirect('/')} />
  );
}

function CasePageWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <CasePage 
      caseId={window.location.pathname.split('/')[2]} 
      onBack={() => navigateDirect('/')} 
    />
  );
}

function TeamManagementWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <TeamManagement 
      onBack={() => navigateDirect('/')} 
      onNavigateToMember={(memberId: string) => navigateDirect(`/team-member/${memberId}`)}
    />
  );
}

function AnalyticsDashboardWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <AnalyticsDashboard 
      onBack={() => navigateDirect('/')} 
    />
  );
}


function FeatureFlagsPageWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <FeatureFlagsPage onNavigateToSettings={() => navigateDirect('/system-settings')} />
  );
}

function SystemIntegrationsPageWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <SystemIntegrationsPage onNavigateToSettings={() => navigateDirect('/system-settings')} />
  );
}

function SystemSettingsPageWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <SystemSettingsPage onNavigateToIntegrations={() => navigateDirect('/system-integrations')} />
  );
}

function OrganizationSettingsPageWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <OrganizationSettingsPage onNavigateToSystemSettings={() => navigateDirect('/system-settings-new')} />
  );
}

function OrganizationManagementWrapper() {
  const { navigateDirect } = useNavigation();
  return (
    <OrganizationManagement onBack={() => navigateDirect('/')} />
  );
}

function DepartmentManagementWrapper() {
  // Use window.history.back() as a simple fallback to avoid navigation context issues
  return (
    <DepartmentManagement onBack={() => window.history.back()} />
  );
}

function CustomerManagementWrapper() {
  // Use window.history.back() as a simple fallback to avoid navigation context issues
  return (
    <CustomerManagement onBack={() => window.history.back()} />
  );
}

function SuperAdminAuditLogsWrapper() {
  // Use window.history.back() as a simple fallback to avoid navigation context issues
  return (
    <SuperAdminAuditLogs onBack={() => window.history.back()} />
  );
}

function SuperAdminDashboardWrapper() {
  // Use window.location.href for navigation to avoid navigation context issues
  return (
    <SuperAdminDashboard 
      onNavigateToOrganizations={() => window.location.href = '/super-admin/organizations'}
      onNavigateToDepartments={() => window.location.href = '/super-admin/departments'}
      onNavigateToUsers={() => window.location.href = '/super-admin/users'}
      onNavigateToCustomers={() => window.location.href = '/super-admin/customers'}
      onNavigateToAuditLogs={() => window.location.href = '/super-admin/audit-logs'}
    />
  );
}

function SystemMonitoringDashboardWrapper() {
  return <SystemMonitoringDashboard />;
}

function WorkflowDesignerWrapper() {
  return <WorkflowDesigner />;
}

// Route wrapper components that provide navigation context
function UserManagementWrapper() {
  const { navigateDirect } = useNavigation();
  return <UserManagement onBack={() => navigateDirect('/')} />;
}

function SystemSettingsWrapper() {
  const { navigateDirect } = useNavigation();
  return <SystemSettings onBack={() => navigateDirect('/')} />;
}

function AuditLogsWrapper() {
  const { navigateDirect } = useNavigation();
  return <AuditLogs onBack={() => navigateDirect('/')} />;
}

function AnalyticsWrapper() {
  const { navigateDirect } = useNavigation();
  return <Analytics onBack={() => navigateDirect('/')} />;
}

function AppContent() {
  const { user, loading } = useAuth();
  const { navigateDirect } = useNavigation();

  // Initialize WhatsApp integration when user is authenticated
  useEffect(() => {
    if (user && !loading) {
      WhatsAppIntegrationService.initializeIntegration().then((result) => {
        console.log('📱 WhatsApp Integration Status:', result);
        
        // Optionally show notification to user if there are issues
        if (!result.success) {
          console.warn('⚠️ WhatsApp integration has issues:', result.message);
        }
      }).catch((error) => {
        console.error('❌ Failed to initialize WhatsApp integration:', error);
      });
    }

    // Cleanup on unmount
    return () => {
      WhatsAppIntegrationService.disconnect();
    };
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Dashboard views based on user role
  switch (user?.role) {
    case 'super_admin':
      // Redirect to Super Admin dashboard route to enable sidebar navigation
      return <Navigate to="/super-admin/dashboard" replace />;
    case 'salesperson':
      return (
        <DashboardLayout>
          <SalespersonDashboard 
            onNavigateToCase={(caseId: string) => navigateDirect(`/case/${caseId}`)}
            onNavigateToWorkload={() => navigateDirect(ROUTES.WORKLOAD)}
            onNavigateToCases={() => navigateDirect(ROUTES.CASES)}
            onNavigateToDocumentManager={() => navigateDirect(ROUTES.DOCUMENT_MANAGER)}
            onNavigateToCommunicator={() => navigateDirect(ROUTES.COMMUNICATOR)}
          />
        </DashboardLayout>
      );
    case 'manager':
      return (
        <DashboardLayout>
          <ManagerDashboard 
            onNavigateToCase={(caseId: string) => navigateDirect(`/case/${caseId}`)}
            onNavigateToTeam={() => navigateDirect('/team-management')}
            onNavigateToCases={() => navigateDirect(ROUTES.CASES)}
            onNavigateToAnalytics={() => navigateDirect('/analytics-dashboard')}
          />
        </DashboardLayout>
      );
    case 'credit-ops':
      return (
        <DashboardLayout>
          <CreditOpsDashboard 
            onNavigateToCase={(caseId: string) => navigateDirect(`/case/${caseId}`)}
            onNavigateToApprovalQueue={() => navigateDirect(ROUTES.APPROVAL_QUEUE)}
            onNavigateToComplianceReports={() => navigateDirect(ROUTES.COMPLIANCE_REPORTS)}
            onNavigateToComplianceReview={() => navigateDirect(ROUTES.COMPLIANCE_REVIEW)}
            onNavigateToPendingReviews={() => navigateDirect(ROUTES.PENDING_REVIEWS)}
            onNavigateToComplianceManagement={() => navigateDirect(ROUTES.COMPLIANCE_ISSUE_MANAGEMENT)}
          />
        </DashboardLayout>
      );
    case 'admin':
      return (
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>
      );
    case 'compliance':
      return (
        <DashboardLayout>
          <ComplianceIssueManagement 
            onNavigateToIssue={(issueId: string) => navigateDirect(`/admin/compliance-issues?issue=${issueId}`)}
            onCreateIssue={() => navigateDirect('/admin/compliance-issues?action=create')}
            onEditIssue={(issueId: string) => navigateDirect(`/admin/compliance-issues?issue=${issueId}&action=edit`)}
            onDeleteIssue={() => {}}
          />
        </DashboardLayout>
      );
    case 'auditor':
      return (
        <DashboardLayout>
          <AuditLogs 
            onBack={() => navigateDirect('/')}
          />
        </DashboardLayout>
      );
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Role Not Recognized</h1>
            <p className="text-gray-600 mb-4">Your role "{user?.role}" is not recognized.</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 max-w-md">
              <h3 className="font-semibold text-yellow-800 mb-2">Debug Information:</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role || 'null'}</p>
                <p><strong>Full Name:</strong> {user?.full_name || 'null'}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Please contact your system administrator to resolve this role issue.
              </p>
            </div>
          </div>
        </div>
      );
  }
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <NavigationProvider>
        <SessionTimeoutProvider>
          <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Super Admin Routes */}
        <Route
          path="/super-admin/dashboard"
          element={
            <DashboardLayout>
              <SuperAdminDashboardWrapper />
            </DashboardLayout>
          }
        />
        
        <Route
          path="/super-admin/organizations"
          element={
            <DashboardLayout>
              <OrganizationManagementWrapper />
            </DashboardLayout>
          }
        />
        
        <Route
          path="/super-admin/departments"
          element={
            <DashboardLayout>
              <DepartmentManagementWrapper />
            </DashboardLayout>
          }
        />
        
        <Route
          path="/super-admin/users"
          element={
            <DashboardLayout>
              <UserManagementWrapper />
            </DashboardLayout>
          }
        />
        
        <Route
          path="/super-admin/customers"
          element={
            <DashboardLayout>
              <CustomerManagementWrapper />
            </DashboardLayout>
          }
        />
        
        <Route
          path="/super-admin/audit-logs"
          element={
            <DashboardLayout>
              <SuperAdminAuditLogsWrapper />
            </DashboardLayout>
          }
        />
        
        <Route
          path="/super-admin/monitoring"
          element={
            <DashboardLayout>
              <SystemMonitoringDashboardWrapper />
            </DashboardLayout>
          }
        />
        
        <Route
          path="/super-admin/workflow-designer"
          element={
            <DashboardLayout>
              <WorkflowDesignerWrapper />
            </DashboardLayout>
          }
        />
        
        {/* User Management Routes */}
        <Route
          path="/user-management"
          element={
            <DashboardLayout>
              <UserManagementWrapper />
            </DashboardLayout>
          }
        />
        
        {/* System Settings Routes */}
        <Route
          path="/system-settings"
          element={
            <DashboardLayout>
              <SystemSettingsWrapper />
            </DashboardLayout>
          }
        />
        
        {/* Audit Logs Routes */}
        <Route
          path="/audit-logs"
          element={
            <DashboardLayout>
              <AuditLogsWrapper />
            </DashboardLayout>
          }
        />
        
        {/* Analytics Routes */}
        <Route
          path="/analytics"
          element={
            <DashboardLayout>
              <AnalyticsWrapper />
            </DashboardLayout>
          }
        />
        
        {/* Feature Flags Routes */}
        <Route
          path="/feature-flags"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <FeatureFlagsPageWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* System Integrations Routes */}
        <Route
          path="/system-integrations"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <SystemIntegrationsPageWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* System Settings Routes (New) */}
        <Route
          path="/system-settings-new"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <SystemSettingsPageWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Organization Settings Routes */}
        <Route
          path="/organization-settings"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <OrganizationSettingsPageWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Team Oversight Routes */}
        <Route
          path="/team"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <TeamOversightWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Team Management Routes */}
        <Route
          path="/team-management"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <TeamManagementWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Analytics Dashboard Routes */}
        <Route
          path="/analytics-dashboard"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <AnalyticsDashboardWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Approval Queue Routes */}
        <Route
          path="/approval-queue"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <ApprovalQueueWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* System Health Monitor Routes */}
        <Route
          path="/system-health"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <SystemHealthMonitorWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Cases List Routes */}
        <Route
          path="/cases"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <CasesListPageWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Workload Planner Routes */}
        <Route
          path="/workload"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <WorkloadPlannerWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Workload Management Routes */}
        <Route
          path="/workload-management"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <WorkloadManagementPageWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* New Approval Queue Routes */}
        <Route
          path="/approval-queue-new"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <ApprovalQueuePageWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Document Manager Routes */}
        <Route
          path="/document-manager"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <DocumentManagerWrapper2 />
              </Suspense>
            </DashboardLayout>
          }
        />
        <Route
          path="/document-manager/:caseId"
          element={
            <DashboardLayout>
              <DocumentManagerWrapper />
            </DashboardLayout>
          }
        />
        
        {/* Communicator Routes */}
        <Route
          path="/communicator"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <CommunicatorPageWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Compliance Review Routes */}
        <Route
          path="/compliance-review"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <ComplianceReviewWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Pending Reviews Routes */}
        <Route
          path="/pending-reviews"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <PendingReviewsWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Compliance Reports Routes */}
        <Route
          path="/compliance-reports"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <ComplianceReportsWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
        {/* Case Detail Routes */}
        <Route
          path="/case/:caseId"
          element={
            <DashboardLayout>
              <Suspense fallback={<PageLoadingSpinner />}>
                <CasePageWrapper />
              </Suspense>
            </DashboardLayout>
          }
        />
        
                {/* New Admin Management Routes */}
                <Route
                  path="/admin/departments"
                  element={
                    <DashboardLayout>
                      <DepartmentManagement onBack={() => window.history.back()} />
                    </DashboardLayout>
                  }
                />
                
                <Route
                  path="/admin/roles"
                  element={
                    <DashboardLayout>
                      <RolesManagement onBack={() => window.history.back()} />
                    </DashboardLayout>
                  }
                />
                
                <Route
                  path="/admin/permissions"
                  element={
                    <DashboardLayout>
                      <PermissionsManagement onBack={() => window.history.back()} />
                    </DashboardLayout>
                  }
                />
                
                <Route
                  path="/admin/products"
                  element={
                    <DashboardLayout>
                      <ProductsManagement onBack={() => window.history.back()} />
                    </DashboardLayout>
                  }
                />
                
                <Route
                  path="/admin/sub-products"
                  element={
                    <DashboardLayout>
                      <SubProductsManagement onBack={() => window.history.back()} />
                    </DashboardLayout>
                  }
                />
                
                <Route
                  path="/admin/document-types"
                  element={
                    <DashboardLayout>
                      <DocumentTypesManagement onBack={() => window.history.back()} />
                    </DashboardLayout>
                  }
                />
                
                <Route
                  path="/admin/documents"
                  element={
                    <DashboardLayout>
                      <DocumentsManagement onBack={() => window.history.back()} />
                    </DashboardLayout>
                  }
                />
                
                <Route
                  path="/admin/product-document-mapping"
                  element={
                    <DashboardLayout>
                      <ProductDocumentMapping onBack={() => window.history.back()} />
                    </DashboardLayout>
                  }
                />
        
        <Route
          path={ROUTES.LOAN_APPLICATION_MANAGEMENT}
          element={
            <DashboardLayout>
              <LoanApplicationManagement />
            </DashboardLayout>
          }
        />
        
        <Route
          path={ROUTES.TASK_CATEGORY_MANAGEMENT}
          element={
            <DashboardLayout>
              <TaskCategoryManagement />
            </DashboardLayout>
          }
        />
        
        <Route
          path={ROUTES.COMPLIANCE_ISSUE_MANAGEMENT}
          element={
            <DashboardLayout>
              <ComplianceIssueManagement 
                onNavigateToIssue={() => {}}
                onCreateIssue={() => {}}
                onEditIssue={() => {}}
                onDeleteIssue={() => {}}
              />
            </DashboardLayout>
          }
        />
        
        <Route
          path={ROUTES.USER_PROFILE_MANAGEMENT}
          element={
            <DashboardLayout>
              <UserProfileManagement 
                onNavigateToUser={() => {}}
                onCreateUser={() => {}}
                onEditUser={() => {}}
                onDeleteUser={() => {}}
                onViewProfile={() => {}}
              />
            </DashboardLayout>
          }
        />
        
        <Route
          path={ROUTES.WORKFLOW_MANAGEMENT}
          element={
            <DashboardLayout>
              <WorkflowManagementPage />
            </DashboardLayout>
          }
        />
        
        <Route
          path={ROUTES.BACKGROUND_PROCESSING}
          element={
            <DashboardLayout>
              <BackgroundProcessingPage />
            </DashboardLayout>
          }
        />
        
        <Route
          path={ROUTES.CACHE_MANAGEMENT}
          element={
            <DashboardLayout>
              <CacheManagementPage />
            </DashboardLayout>
          }
        />
        
        <Route
          path={ROUTES.ENTITY_MANAGEMENT}
          element={
            <DashboardLayout>
              <EntityManagement />
            </DashboardLayout>
          }
        />
        
        
        <Route
          path={ROUTES.WORKFLOW_DESIGNER}
          element={
            <DashboardLayout>
              <WorkflowDesigner />
            </DashboardLayout>
          }
        />
        
        <Route
          path={ROUTES.ADVANCED_USER_MANAGEMENT}
          element={
            <DashboardLayout>
              <UserManagementWrapper />
            </DashboardLayout>
          }
        />
        
        <Route
          path={ROUTES.SYSTEM_MONITORING}
          element={
            <DashboardLayout>
              <SystemMonitoringDashboard />
            </DashboardLayout>
          }
        />
        
        
        
        
        <Route
          path="/advanced-user-management"
          element={
            <FullWidthLayout>
              <UserManagementWrapper />
            </FullWidthLayout>
          }
        />
        
        
        <Route
          path="/workflow-designer"
          element={
            <FullWidthLayout>
              <WorkflowDesigner />
            </FullWidthLayout>
          }
        />
        
        
        <Route
          path="/system-monitoring"
          element={
            <FullWidthLayout>
              <SystemMonitoringDashboard />
            </FullWidthLayout>
          }
        />
        

        {/* Test Routes */}
        </Routes>
        </SessionTimeoutProvider>
      </NavigationProvider>
      
      {/* Global Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
        }}
      />
    </BrowserRouter>
  );
}

export default App;