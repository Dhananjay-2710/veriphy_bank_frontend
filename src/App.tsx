import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/Auth/LoginPage';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { SalespersonDashboard } from './components/Dashboard/SalespersonDashboard';
import { CreditOpsDashboard } from './components/Dashboard/CreditOpsDashboard';
import { CasePage } from './components/Case/CasePage';
import { WorkloadPlanner } from './components/Workload/WorkloadPlanner';
import { TeamOversight } from './components/Team/TeamOversight';
import { ApprovalQueue } from './components/Approval/ApprovalQueue';
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
import { ManagerDashboard } from './components/Dashboard/ManagerDashboard';
import { ComplianceReports } from './components/Compliance/ComplianceReports';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigateToCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveView('case');
  };

  const handleBackFromCase = () => {
    setSelectedCaseId(null);
    setActiveView('dashboard');
  };

  const renderContent = () => {
    if (activeView === 'case' && selectedCaseId) {
      return <CasePage caseId={selectedCaseId} onBack={handleBackFromCase} />;
    }

    if (activeView === 'workload') {
      return <WorkloadPlanner onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'team') {
      return <TeamOversight onBack={() => setActiveView('dashboard')} onNavigateToCase={handleNavigateToCase} />;
    }

    if (activeView === 'approval-queue') {
      return <ApprovalQueue onBack={() => setActiveView('dashboard')} onNavigateToCase={handleNavigateToCase} />;
    }

    if (activeView === 'communicator') {
      return <CommunicatorPage onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'cases') {
      return <CasesListPage onBack={() => setActiveView('dashboard')} onNavigateToCase={handleNavigateToCase} />;
    }

    if (activeView === 'document-manager') {
      return <DocumentManager onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'compliance-review') {
      return <ComplianceReview onBack={() => setActiveView('dashboard')} onNavigateToCase={handleNavigateToCase} />;
    }

    if (activeView === 'pending-reviews') {
      return <PendingReviews onBack={() => setActiveView('dashboard')} onNavigateToCase={handleNavigateToCase} />;
    }

    if (activeView === 'user-management') {
      return <UserManagement onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'system-settings') {
      return <SystemSettings onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'audit-logs') {
      return <AuditLogs onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'analytics') {
      return <Analytics onBack={() => setActiveView('dashboard')} />;
    }

    if (activeView === 'compliance-reports') {
      return <ComplianceReports onBack={() => setActiveView('dashboard')} />;
    }

    // Dashboard views
    switch (user?.role) {
      case 'salesperson':
        return (
          <SalespersonDashboard 
            onNavigateToCase={handleNavigateToCase}
            onNavigateToWorkload={() => setActiveView('workload')}
            onNavigateToCases={() => setActiveView('cases')}
            onNavigateToDocumentManager={() => setActiveView('document-manager')}
            onNavigateToCommunicator={() => setActiveView('communicator')}
          />
        );
      case 'manager':
        return (
          <ManagerDashboard 
            onNavigateToCase={handleNavigateToCase}
            onNavigateToTeam={() => setActiveView('team')}
            onNavigateToCases={() => setActiveView('cases')}
            onNavigateToAnalytics={() => setActiveView('analytics')}
          />
        );
      case 'credit-ops':
        return (
          <CreditOpsDashboard 
            onNavigateToCase={handleNavigateToCase}
            onNavigateToApprovalQueue={() => setActiveView('approval-queue')}
            onNavigateToComplianceReports={() => setActiveView('compliance-reports')}
            onNavigateToComplianceReview={() => setActiveView('compliance-review')}
            onNavigateToPendingReviews={() => setActiveView('pending-reviews')}
          />
        );
      case 'admin':
        return (
          <AdminDashboard 
            onNavigateToCase={handleNavigateToCase}
            onNavigateToUserManagement={() => setActiveView('user-management')}
            onNavigateToSystemSettings={() => setActiveView('system-settings')}
            onNavigateToAuditLogs={() => setActiveView('audit-logs')}
            onNavigateToAnalytics={() => setActiveView('analytics')}
          />
        );
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;