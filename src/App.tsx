import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useAuth } from './contexts/AuthContextFixed';
import { NavigationProvider } from './contexts/NavigationContext';
import { LoginPage } from './components/Auth/LoginPage';
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
import { FeatureFlagsPage } from './components/Admin/FeatureFlagsPage';
import { SystemIntegrationsPage } from './components/Admin/SystemIntegrationsPage';
import { SystemSettingsPage } from './components/Admin/SystemSettingsPage';
import { OrganizationSettingsPage } from './components/Admin/OrganizationSettingsPage';
import { ManagerDashboard } from './components/Dashboard/ManagerDashboard';
import { ComplianceReports } from './components/Compliance/ComplianceReports';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { FullWidthLayout } from './components/Layout/FullWidthLayout';
import { TeamManagement } from './components/Team/TeamManagement';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
// import { SuperAdminDashboardFixed } from './components/Dashboard/SuperAdminDashboardFixed';
import { SuperAdminSetup } from './components/Admin/SuperAdminSetup';

// New Admin Components
import { LoanApplicationManagement } from './components/Admin/LoanApplicationManagement';
import { TaskCategoryManagement } from './components/Admin/TaskCategoryManagement';
import { ComplianceIssueManagement } from './components/Admin/ComplianceIssueManagement';
import { UserProfileManagement } from './components/Admin/UserProfileManagement';
import { WorkflowManagementPage } from './components/Admin/WorkflowManagementPage';
import { BackgroundProcessingPage } from './components/Admin/BackgroundProcessingPage';
import { CacheManagementPage } from './components/Admin/CacheManagementPage';
import { EntityManagement } from './components/Admin/EntityManagement';

// Enhanced Super Admin Components
import { SuperAdminDashboard } from './components/Admin/SuperAdminDashboard';
import { WorkflowDesigner } from './components/Admin/WorkflowDesigner';
import { AdvancedUserManagement } from './components/Admin/AdvancedUserManagement';

// Table Management Components
import { TableManagementDashboard } from './components/TableManagement/TableManagementDashboard';
import { DatabaseManagement } from './components/Admin/DatabaseManagement';
import { SystemMonitoringDashboard } from './components/Admin/SystemMonitoringDashboard';
import { SuperAdminAnalytics } from './components/Admin/SuperAdminAnalytics';
import { SuperAdminAuditLogs } from './components/Admin/SuperAdminAuditLogs';
import { WorkflowManagement } from './components/Admin/WorkflowManagement';
import { NotificationCenter } from './components/Admin/NotificationCenter';
import { AdvancedAnalytics } from './components/Admin/AdvancedAnalytics';
import { SecurityCompliance } from './components/Admin/SecurityCompliance';
import { PerformanceOptimization } from './components/Admin/PerformanceOptimization';

// Navigation Constants
import { ROUTES } from './constants/navigation';

// DocumentManager wrapper to handle URL parameters
function DocumentManagerWrapper() {
  const { caseId } = useParams<{ caseId: string }>();
  const { navigateDirect } = useNavigation();
  return (
    <DocumentManager 
      caseId={caseId} 
      onBack={() => navigateDirect(-1)} 
    />
  );
}

// Route wrapper components that provide navigation context
function UserManagementWrapper() {
  const { navigateDirect } = useNavigation();
  return <UserManagement onBack={() => navigateDirect(-1)} />;
}

function SystemSettingsWrapper() {
  const { navigateDirect } = useNavigation();
  return <SystemSettings onBack={() => navigateDirect(-1)} />;
}

function AuditLogsWrapper() {
  const { navigateDirect } = useNavigation();
  return <AuditLogs onBack={() => navigateDirect(-1)} />;
}

function AnalyticsWrapper() {
  const { navigateDirect } = useNavigation();
  return <Analytics onBack={() => navigateDirect(-1)} />;
}

function AppContent() {
  const { user, loading } = useAuth();
  const { navigateDirect } = useNavigation();

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
      // Redirect to the proper super admin dashboard route
      navigateDirect('/super-admin/', { replace: true });
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to Super Admin Dashboard...</p>
          </div>
        </div>
      );
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
          <AdminDashboard 
            onNavigateToCase={(caseId: string) => navigateDirect(`/case/${caseId}`)}
            onNavigateToUserManagement={() => navigateDirect(ROUTES.USER_MANAGEMENT)}
            onNavigateToSystemSettings={() => navigateDirect(ROUTES.SYSTEM_SETTINGS)}
            onNavigateToAuditLogs={() => navigateDirect(ROUTES.AUDIT_LOGS)}
            onNavigateToAnalytics={() => navigateDirect(ROUTES.ANALYTICS)}
            onNavigateToSystemHealth={() => navigateDirect('/system-health')}
            onNavigateToComplianceManagement={() => navigateDirect(ROUTES.COMPLIANCE_ISSUE_MANAGEMENT)}
            onNavigateToFeatureFlags={() => navigateDirect(ROUTES.FEATURE_FLAGS)}
            onNavigateToSystemIntegrations={() => navigateDirect(ROUTES.SYSTEM_INTEGRATIONS)}
            onNavigateToSystemSettingsNew={() => navigateDirect(ROUTES.SYSTEM_SETTINGS_NEW)}
            onNavigateToOrganizationSettings={() => navigateDirect(ROUTES.ORGANIZATION_SETTINGS)}
          />
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
            onBack={() => navigateDirect(-1)}
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
                If you're a Super Admin, make sure to populate the database first using the Database Populator.
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
        <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SuperAdminSetup />} />
        
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
              <FeatureFlagsPage onNavigateToSettings={() => navigate('/system-settings')} />
            </DashboardLayout>
          }
        />
        
        {/* System Integrations Routes */}
        <Route
          path="/system-integrations"
          element={
            <DashboardLayout>
              <SystemIntegrationsPage onNavigateToSettings={() => navigate('/system-settings')} />
            </DashboardLayout>
          }
        />
        
        {/* System Settings Routes (New) */}
        <Route
          path="/system-settings-new"
          element={
            <DashboardLayout>
              <SystemSettingsPage onNavigateToIntegrations={() => navigate('/system-integrations')} />
            </DashboardLayout>
          }
        />
        
        {/* Organization Settings Routes */}
        <Route
          path="/organization-settings"
          element={
            <DashboardLayout>
              <OrganizationSettingsPage onNavigateToSystemSettings={() => navigate('/system-settings-new')} />
            </DashboardLayout>
          }
        />
        
        {/* Team Oversight Routes */}
        <Route
          path="/team"
          element={
            <DashboardLayout>
              <TeamOversight 
                onBack={() => navigate(-1)} 
                onNavigateToCase={(caseId: string) => navigate(`/case/${caseId}`)}
              />
            </DashboardLayout>
          }
        />
        
        {/* Team Management Routes */}
        <Route
          path="/team-management"
          element={
            <DashboardLayout>
              <TeamManagement 
                onBack={() => navigate(-1)} 
                onNavigateToMember={(memberId: string) => navigate(`/team-member/${memberId}`)}
              />
            </DashboardLayout>
          }
        />
        
        {/* Analytics Dashboard Routes */}
        <Route
          path="/analytics-dashboard"
          element={
            <DashboardLayout>
              <AnalyticsDashboard 
                onBack={() => navigate(-1)} 
              />
            </DashboardLayout>
          }
        />
        
        {/* Approval Queue Routes */}
        <Route
          path="/approval-queue"
          element={
            <DashboardLayout>
              <ApprovalQueue 
                onBack={() => navigate(-1)} 
                onNavigateToCase={(caseId: string) => navigate(`/case/${caseId}`)}
              />
            </DashboardLayout>
          }
        />
        
        {/* System Health Monitor Routes */}
        <Route
          path="/system-health"
          element={
            <DashboardLayout>
              <SystemHealthMonitor 
                onBack={() => navigate(-1)} 
              />
            </DashboardLayout>
          }
        />
        
        {/* Cases List Routes */}
        <Route
          path="/cases"
          element={
            <DashboardLayout>
              <CasesListPage 
                onBack={() => navigate(-1)} 
                onNavigateToCase={(caseId: string) => navigate(`/case/${caseId}`)}
              />
            </DashboardLayout>
          }
        />
        
        {/* Workload Planner Routes */}
        <Route
          path="/workload"
          element={
            <DashboardLayout>
              <WorkloadPlanner onBack={() => navigate(-1)} />
            </DashboardLayout>
          }
        />
        
        {/* Workload Management Routes */}
        <Route
          path="/workload-management"
          element={
            <DashboardLayout>
              <WorkloadManagementPage 
                onBack={() => navigate(-1)} 
                onNavigateToCases={() => navigate('/cases')}
                onNavigateToTasks={() => navigate('/workload')}
              />
            </DashboardLayout>
          }
        />
        
        {/* New Approval Queue Routes */}
        <Route
          path="/approval-queue-new"
          element={
            <DashboardLayout>
              <ApprovalQueuePage 
                onBack={() => navigate(-1)} 
                onNavigateToCases={() => navigate('/cases')}
                onNavigateToDocuments={() => navigate('/document-manager')}
              />
            </DashboardLayout>
          }
        />
        
        {/* Document Manager Routes */}
        <Route
          path="/document-manager"
          element={
            <DashboardLayout>
              <DocumentManager onBack={() => navigate(-1)} />
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
              <CommunicatorPage onBack={() => navigate(-1)} />
            </DashboardLayout>
          }
        />
        
        {/* Compliance Review Routes */}
        <Route
          path="/compliance-review"
          element={
            <DashboardLayout>
              <ComplianceReview 
                onBack={() => navigate(-1)} 
                onNavigateToCase={(caseId: string) => navigate(`/case/${caseId}`)}
              />
            </DashboardLayout>
          }
        />
        
        {/* Pending Reviews Routes */}
        <Route
          path="/pending-reviews"
          element={
            <DashboardLayout>
              <PendingReviews 
                onBack={() => navigate(-1)} 
                onNavigateToCase={(caseId: string) => navigate(`/case/${caseId}`)}
              />
            </DashboardLayout>
          }
        />
        
        {/* Compliance Reports Routes */}
        <Route
          path="/compliance-reports"
          element={
            <DashboardLayout>
              <ComplianceReports onBack={() => navigate(-1)} />
            </DashboardLayout>
          }
        />
        
        {/* Case Detail Routes */}
        <Route
          path="/case/:caseId"
          element={
            <DashboardLayout>
              <CasePage 
                caseId={window.location.pathname.split('/')[2]} 
                onBack={() => navigate(-1)} 
              />
            </DashboardLayout>
          }
        />
        
        {/* New Admin Management Routes */}
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
        
        {/* Enhanced Super Admin Routes */}
        <Route
          path={ROUTES.SUPER_ADMIN_DASHBOARD}
          element={
            <DashboardLayout>
              <SuperAdminDashboard />
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
              <AdvancedUserManagement />
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
        
        {/* Additional Super Admin Routes */}
        <Route
          path="/super-admin/activity-logs"
          element={
            <DashboardLayout>
              <SystemMonitoringDashboard />
            </DashboardLayout>
          }
        />
        
        <Route
          path="/super-admin/system-logs"
          element={
            <DashboardLayout>
              <SystemMonitoringDashboard />
            </DashboardLayout>
          }
        />
        
        {/* Enhanced Super Admin Routes with Full Width Layout */}
        <Route
          path="/super-admin/"
          element={
            <FullWidthLayout>
              <SuperAdminDashboard />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/super-admin/dashboard"
          element={
            <FullWidthLayout>
              <SuperAdminDashboard />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/super-admin/users"
          element={
            <FullWidthLayout>
              <AdvancedUserManagement />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/super-admin/database"
          element={
            <FullWidthLayout>
              <DatabaseManagement />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/super-admin/workflow-management"
          element={
            <FullWidthLayout>
              <WorkflowManagement onBack={() => navigate(-1)} />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/super-admin/notifications"
          element={
            <FullWidthLayout>
              <NotificationCenter onBack={() => navigate(-1)} />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/super-admin/advanced-analytics"
          element={
            <FullWidthLayout>
              <AdvancedAnalytics onBack={() => navigate(-1)} />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/super-admin/security-compliance"
          element={
            <FullWidthLayout>
              <SecurityCompliance onBack={() => navigate(-1)} />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/super-admin/performance-optimization"
          element={
            <FullWidthLayout>
              <PerformanceOptimization onBack={() => navigate(-1)} />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/advanced-user-management"
          element={
            <FullWidthLayout>
              <AdvancedUserManagement />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/super-admin/workflow-designer"
          element={
            <FullWidthLayout>
              <WorkflowDesigner />
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
          path="/super-admin/monitoring"
          element={
            <FullWidthLayout>
              <SystemMonitoringDashboard />
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
        
        <Route
          path="/super-admin/analytics"
          element={
            <FullWidthLayout>
              <SuperAdminAnalytics />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/super-admin/audit-logs"
          element={
            <FullWidthLayout>
              <SuperAdminAuditLogs />
            </FullWidthLayout>
          }
        />
        
        <Route
          path="/super-admin/table-management"
          element={
            <FullWidthLayout>
              <TableManagementDashboard />
            </FullWidthLayout>
          }
        />

        {/* Test Routes */}
        </Routes>
      </NavigationProvider>
    </BrowserRouter>
  );
}

export default App;