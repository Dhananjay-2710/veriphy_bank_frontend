import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from './contexts/AuthContextFixed';
import { LoginPage } from './components/Auth/LoginPage';
import { SalespersonDashboard } from './components/Dashboard/SalespersonDashboard';
import { CreditOpsDashboard } from './components/Dashboard/CreditOpsDashboard';
import { CasePage } from './components/Case/CasePage';
import { WorkloadPlanner } from './components/Workload/WorkloadPlanner';
import { WorkloadManagementPage } from './components/Workload/WorkloadManagementPage';
import { TeamOversight } from './components/Team/TeamOversight';
import { ApprovalQueue } from './components/Approval/ApprovalQueue';
import { ApprovalQueuePage } from './components/Approval/ApprovalQueuePage';
import { CommunicatorPage } from './components/Communicator/CommunicatorPage';
import { CasesListPage } from './components/Cases/CasesListPage';
import { DocumentManager } from './components/Documents/DocumentManager';
import { ComplianceReview } from './components/Compliance/ComplianceReview';
import { PendingReviews } from './components/Reviews/PendingReviews';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { UserManagement } from './components/Admin/UserManagement';
import { SystemSettings } from './components/Admin/SystemSettings';
import { AuditLogs } from './components/Admin/AuditLogs';
import { Analytics } from './components/Admin/Analytics';
import { FeatureFlagsPage } from './components/Admin/FeatureFlagsPage';
import { SystemIntegrationsPage } from './components/Admin/SystemIntegrationsPage';
import { SystemSettingsPage } from './components/Admin/SystemSettingsPage';
import { OrganizationSettingsPage } from './components/Admin/OrganizationSettingsPage';
import { ManagerDashboard } from './components/Dashboard/ManagerDashboard';
import { ComplianceReports } from './components/Compliance/ComplianceReports';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { SuperAdminDashboardFixed } from './components/Dashboard/SuperAdminDashboardFixed';
import { SetupInstructions } from './components/Test/SetupInstructions';
import { SupabaseTest } from './components/Test/SupabaseTest';
import { useParams } from 'react-router-dom';

// DocumentManager wrapper to handle URL parameters
function DocumentManagerWrapper() {
  const { caseId } = useParams<{ caseId: string }>();
  return (
    <DocumentManager 
      caseId={caseId} 
      onBack={() => window.history.back()} 
    />
  );
}

function AppContent() {
  const { user, loading } = useAuth();

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-6">
          <SetupInstructions />
          <LoginPage />
        </div>
      </div>
    );
  }

  // Dashboard views based on user role
  switch (user?.role) {
    case 'salesperson':
      return (
        <DashboardLayout>
          <SalespersonDashboard 
            onNavigateToCase={() => {}}
            onNavigateToWorkload={() => {}}
            onNavigateToCases={() => {}}
            onNavigateToDocumentManager={() => {}}
            onNavigateToCommunicator={() => {}}
          />
        </DashboardLayout>
      );
    case 'manager':
      return (
        <DashboardLayout>
          <ManagerDashboard 
            onNavigateToCase={() => {}}
            onNavigateToTeam={() => {}}
            onNavigateToCases={() => {}}
            onNavigateToAnalytics={() => {}}
          />
        </DashboardLayout>
      );
    case 'credit-ops':
      return (
        <DashboardLayout>
          <CreditOpsDashboard 
            onNavigateToCase={() => {}}
            onNavigateToApprovalQueue={() => {}}
            onNavigateToComplianceReports={() => {}}
            onNavigateToComplianceReview={() => {}}
            onNavigateToPendingReviews={() => {}}
            onNavigateToComplianceManagement={() => window.location.href = '/compliance-management'}
          />
        </DashboardLayout>
      );
    case 'admin':
      return (
        <DashboardLayout>
          <AdminDashboard 
            onNavigateToCase={() => {}}
            onNavigateToUserManagement={() => window.location.href = '/user-management'}
            onNavigateToSystemSettings={() => window.location.href = '/system-settings'}
            onNavigateToAuditLogs={() => window.location.href = '/audit-logs'}
            onNavigateToAnalytics={() => window.location.href = '/analytics'}
            onNavigateToSystemHealth={() => {}}
            onNavigateToComplianceManagement={() => window.location.href = '/compliance-management'}
            onNavigateToFeatureFlags={() => window.location.href = '/feature-flags'}
            onNavigateToSystemIntegrations={() => window.location.href = '/system-integrations'}
            onNavigateToSystemSettingsNew={() => window.location.href = '/system-settings-new'}
            onNavigateToOrganizationSettings={() => window.location.href = '/organization-settings'}
          />
        </DashboardLayout>
      );
    case 'super_admin':
      return (
        <DashboardLayout>
          <SuperAdminDashboardFixed 
            onNavigateToUserManagement={() => window.location.href = '/user-management'}
            onNavigateToSystemSettings={() => window.location.href = '/system-settings'}
            onNavigateToAuditLogs={() => window.location.href = '/audit-logs'}
            onNavigateToAnalytics={() => window.location.href = '/analytics'}
            onNavigateToCase={() => {}}
            onNavigateToFeatureFlags={() => window.location.href = '/feature-flags'}
            onNavigateToSystemIntegrations={() => window.location.href = '/system-integrations'}
            onNavigateToSystemSettingsNew={() => window.location.href = '/system-settings-new'}
            onNavigateToOrganizationSettings={() => window.location.href = '/organization-settings'}
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* User Management Routes */}
        <Route
          path="/user-management"
          element={
            <DashboardLayout>
              <UserManagement onBack={() => window.history.back()} />
            </DashboardLayout>
          }
        />
        
        {/* System Settings Routes */}
        <Route
          path="/system-settings"
          element={
            <DashboardLayout>
              <SystemSettings onBack={() => window.history.back()} />
            </DashboardLayout>
          }
        />
        
        {/* Audit Logs Routes */}
        <Route
          path="/audit-logs"
          element={
            <DashboardLayout>
              <AuditLogs onBack={() => window.history.back()} />
            </DashboardLayout>
          }
        />
        
        {/* Analytics Routes */}
        <Route
          path="/analytics"
          element={
            <DashboardLayout>
              <Analytics onBack={() => window.history.back()} />
            </DashboardLayout>
          }
        />
        
        {/* Feature Flags Routes */}
        <Route
          path="/feature-flags"
          element={
            <DashboardLayout>
              <FeatureFlagsPage onNavigateToSettings={() => window.location.href = '/system-settings'} />
            </DashboardLayout>
          }
        />
        
        {/* System Integrations Routes */}
        <Route
          path="/system-integrations"
          element={
            <DashboardLayout>
              <SystemIntegrationsPage onNavigateToSettings={() => window.location.href = '/system-settings'} />
            </DashboardLayout>
          }
        />
        
        {/* System Settings Routes (New) */}
        <Route
          path="/system-settings-new"
          element={
            <DashboardLayout>
              <SystemSettingsPage onNavigateToIntegrations={() => window.location.href = '/system-integrations'} />
            </DashboardLayout>
          }
        />
        
        {/* Organization Settings Routes */}
        <Route
          path="/organization-settings"
          element={
            <DashboardLayout>
              <OrganizationSettingsPage onNavigateToSystemSettings={() => window.location.href = '/system-settings-new'} />
            </DashboardLayout>
          }
        />
        
        {/* Team Oversight Routes */}
        <Route
          path="/team"
          element={
            <DashboardLayout>
              <TeamOversight 
                onBack={() => window.history.back()} 
                onNavigateToCase={(caseId: string) => window.location.href = `/case/${caseId}`}
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
                onBack={() => window.history.back()} 
                onNavigateToCase={(caseId: string) => window.location.href = `/case/${caseId}`}
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
                onBack={() => window.history.back()} 
                onNavigateToCase={(caseId: string) => window.location.href = `/case/${caseId}`}
              />
            </DashboardLayout>
          }
        />
        
        {/* Workload Planner Routes */}
        <Route
          path="/workload"
          element={
            <DashboardLayout>
              <WorkloadPlanner onBack={() => window.history.back()} />
            </DashboardLayout>
          }
        />
        
        {/* Workload Management Routes */}
        <Route
          path="/workload-management"
          element={
            <DashboardLayout>
              <WorkloadManagementPage 
                onBack={() => window.history.back()} 
                onNavigateToCases={() => window.location.href = '/cases'}
                onNavigateToTasks={() => window.location.href = '/workload'}
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
                onBack={() => window.history.back()} 
                onNavigateToCases={() => window.location.href = '/cases'}
                onNavigateToDocuments={() => window.location.href = '/document-manager'}
              />
            </DashboardLayout>
          }
        />
        
        {/* Document Manager Routes */}
        <Route
          path="/document-manager"
          element={
            <DashboardLayout>
              <DocumentManager onBack={() => window.history.back()} />
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
              <CommunicatorPage onBack={() => window.history.back()} />
            </DashboardLayout>
          }
        />
        
        {/* Compliance Review Routes */}
        <Route
          path="/compliance-review"
          element={
            <DashboardLayout>
              <ComplianceReview 
                onBack={() => window.history.back()} 
                onNavigateToCase={(caseId: string) => window.location.href = `/case/${caseId}`}
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
                onBack={() => window.history.back()} 
                onNavigateToCase={(caseId: string) => window.location.href = `/case/${caseId}`}
              />
            </DashboardLayout>
          }
        />
        
        {/* Compliance Reports Routes */}
        <Route
          path="/compliance-reports"
          element={
            <DashboardLayout>
              <ComplianceReports onBack={() => window.history.back()} />
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
                onBack={() => window.history.back()} 
              />
            </DashboardLayout>
          }
        />
        
        {/* Test Routes */}
        <Route
          path="/test/supabase"
          element={
            <DashboardLayout>
              <SupabaseTest />
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;