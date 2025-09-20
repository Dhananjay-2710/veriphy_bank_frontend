import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  FileText, 
  BarChart3,
  Settings,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ComplianceIssueTypesPage } from './ComplianceIssueTypesPage';
import { ComplianceIssuesPage } from './ComplianceIssuesPage';
import { ComplianceReportsPage } from './ComplianceReportsPage';
import { ReportTemplatesPage } from './ReportTemplatesPage';
import { ComplianceReports } from './ComplianceReports';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useComplianceIssues, useComplianceMetrics, useComplianceAlerts } from '../../hooks/useDashboardData';

interface ComplianceManagementProps {
  onBack: () => void;
}

type ComplianceView = 'overview' | 'issue-types' | 'issues' | 'reports' | 'templates';

export function ComplianceManagement({ onBack }: ComplianceManagementProps) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ComplianceView>('overview');
  const [selectedIssueType, setSelectedIssueType] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Get real compliance data from Supabase
  const { data: complianceIssuesData, loading: issuesLoading, error: issuesError, refetch: refetchIssues } = useComplianceIssues();
  const { data: complianceMetricsData, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useComplianceMetrics('month');
  const { data: complianceAlertsData, loading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useComplianceAlerts('month');

  // Calculate compliance stats from real data
  const complianceStats = {
    totalIssues: complianceIssuesData.length,
    openIssues: complianceIssuesData.filter(issue => issue.status === 'open').length,
    resolvedIssues: complianceIssuesData.filter(issue => issue.status === 'resolved').length,
    criticalIssues: complianceIssuesData.filter(issue => issue.severity === 'high').length,
    totalReports: 12, // This would come from a reports hook
    activeTemplates: 6, // This would come from a templates hook
    complianceScore: 98.5 // This would be calculated from metrics
  };

  const handleRefresh = () => {
    refetchIssues();
    refetchMetrics();
    refetchAlerts();
  };

  // Loading state
  if (issuesLoading || metricsLoading || alertsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (issuesError || metricsError || alertsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Compliance Data</p>
            <p className="text-sm text-gray-600 mt-2">{issuesError || metricsError || alertsError}</p>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Transform real compliance issues data
  const recentIssues = complianceIssuesData.slice(0, 5).map(issue => ({
    id: issue.id,
    title: issue.title || issue.description || 'Compliance Issue',
    severity: issue.severity || 'medium',
    status: issue.status || 'open',
    caseId: issue.caseId || 'N/A',
    reportedAt: new Date(issue.createdAt || new Date()).toISOString().split('T')[0],
    assignedTo: issue.assignedTo || 'Unassigned'
  }));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'issue-types':
        return (
          <ComplianceIssueTypesPage
            onNavigateToComplianceIssues={() => setCurrentView('issues')}
            onEditIssueType={(issueTypeId) => {
              setSelectedIssueType(issueTypeId);
              // Handle edit logic
            }}
          />
        );
      case 'issues':
        return (
          <ComplianceIssuesPage
            onNavigateToComplianceIssueTypes={() => setCurrentView('issue-types')}
            onEditIssue={(issueId) => {
              setSelectedIssue(issueId);
              // Handle edit logic
            }}
            onViewComments={(issueId) => {
              setSelectedIssue(issueId);
              // Handle view comments logic
            }}
          />
        );
      case 'reports':
        return (
          <ComplianceReportsPage
            onNavigateToReportTemplates={() => setCurrentView('templates')}
            onViewReport={(reportId) => {
              setSelectedReport(reportId);
              // Handle view report logic
            }}
            onGenerateReport={(templateId) => {
              setSelectedTemplate(templateId);
              // Handle generate report logic
            }}
          />
        );
      case 'templates':
        return (
          <ReportTemplatesPage
            onNavigateToComplianceReports={() => setCurrentView('reports')}
            onEditTemplate={(templateId) => {
              setSelectedTemplate(templateId);
              // Handle edit template logic
            }}
            onGenerateFromTemplate={(templateId) => {
              setSelectedTemplate(templateId);
              setCurrentView('reports');
              // Handle generate from template logic
            }}
          />
        );
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Compliance Management</h1>
                <p className="text-gray-600">Monitor and manage compliance across all operations</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setCurrentView('issues')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
                <Button variant="outline" onClick={handleRefresh} disabled={issuesLoading || metricsLoading || alertsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${(issuesLoading || metricsLoading || alertsLoading) ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                      <p className="text-2xl font-bold text-gray-900">{complianceStats.complianceScore}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Open Issues</p>
                      <p className="text-2xl font-bold text-gray-900">{complianceStats.openIssues}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Reports</p>
                      <p className="text-2xl font-bold text-gray-900">{complianceStats.totalReports}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Templates</p>
                      <p className="text-2xl font-bold text-gray-900">{complianceStats.activeTemplates}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCurrentView('issues')}
              >
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Compliance Issues</h3>
                  <p className="text-sm text-gray-600">Track and manage issues</p>
                </CardContent>
              </Card>
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCurrentView('issue-types')}
              >
                <CardContent className="p-6 text-center">
                  <Settings className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Issue Types</h3>
                  <p className="text-sm text-gray-600">Manage issue categories</p>
                </CardContent>
              </Card>
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCurrentView('reports')}
              >
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Reports</h3>
                  <p className="text-sm text-gray-600">Generate compliance reports</p>
                </CardContent>
              </Card>
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setCurrentView('templates')}
              >
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Templates</h3>
                  <p className="text-sm text-gray-600">Manage report templates</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Compliance Issues</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentView('issues')}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentIssues.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Case: {issue.caseId}</span>
                          <span>Assigned to: {issue.assignedTo}</span>
                          <span>Reported: {new Date(issue.reportedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedIssue(issue.id);
                          setCurrentView('issues');
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Compliance Management</h1>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-1">
            <Button
              variant={currentView === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('overview')}
            >
              Overview
            </Button>
            <Button
              variant={currentView === 'issues' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('issues')}
            >
              Issues
            </Button>
            <Button
              variant={currentView === 'reports' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('reports')}
            >
              Reports
            </Button>
            <Button
              variant={currentView === 'templates' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('templates')}
            >
              Templates
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {renderCurrentView()}
      </div>
    </div>
  );
}
