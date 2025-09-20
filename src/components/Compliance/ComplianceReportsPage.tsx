import React, { useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  Download, 
  Eye, 
  FileText,
  Calendar,
  User,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useComplianceReports, useReportTemplates } from '../../hooks/useDashboardData';
import { ComplianceReport } from '../../types';

interface ComplianceReportsPageProps {
  onNavigateToReportTemplates?: () => void;
  onViewReport?: (reportId: string) => void;
  onGenerateReport?: (templateId: string) => void;
}

export function ComplianceReportsPage({ 
  onNavigateToReportTemplates,
  onViewReport,
  onGenerateReport
}: ComplianceReportsPageProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    reportType?: string;
    status?: string;
    generatedBy?: string;
  }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { data: reports, loading: reportsLoading, error: reportsError, refetch: refetchReports } = useComplianceReports(selectedFilters);
  const { data: templates, loading: templatesLoading } = useReportTemplates({ isActive: true });

  // Filter data based on search term
  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeColor = (reportType: string) => {
    switch (reportType) {
      case 'compliance_summary': return 'bg-blue-100 text-blue-800';
      case 'issue_analysis': return 'bg-orange-100 text-orange-800';
      case 'regulatory_report': return 'bg-purple-100 text-purple-800';
      case 'audit_trail': return 'bg-green-100 text-green-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'generating': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Loading state
  if (reportsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance reports...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (reportsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Reports</p>
            <p className="text-sm text-gray-600 mt-2">{reportsError}</p>
          </div>
          <Button onClick={refetchReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Reports</h1>
          <p className="text-gray-600">Generate and manage compliance reports and analytics</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetchReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => onNavigateToReportTemplates?.()}>
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => setShowGenerateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(report => report.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Generating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(report => report.status === 'generating').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={selectedFilters.reportType || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, reportType: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="compliance_summary">Compliance Summary</option>
                <option value="issue_analysis">Issue Analysis</option>
                <option value="regulatory_report">Regulatory Report</option>
                <option value="audit_trail">Audit Trail</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedFilters.status || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="generating">Generating</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFilters({})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">{report.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(report.status)}>
                        <span className="flex items-center">
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{report.status.toUpperCase()}</span>
                        </span>
                      </Badge>
                      <Badge className={getReportTypeColor(report.reportType)}>
                        {report.reportType.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{report.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Generated by: {report.generatedBy}
                    </span>
                    {report.generatedAt && (
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Generated: {new Date(report.generatedAt).toLocaleDateString()}
                      </span>
                    )}
                    {report.filePath && (
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        File available
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {report.status === 'completed' && report.filePath && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewReport?.(report.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                  {report.status === 'completed' && report.filePath && (
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                  {report.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                    {report.updatedAt !== report.createdAt && (
                      <span>Updated: {new Date(report.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {report.filePath && (
                    <span>File: {formatFileSize(report.data?.fileSize)}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No compliance reports found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || Object.keys(selectedFilters).length > 0 
                ? 'Try adjusting your search or filters' 
                : 'No compliance reports have been generated yet'
              }
            </p>
            {!searchTerm && Object.keys(selectedFilters).length === 0 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button 
                  onClick={() => setShowGenerateForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onNavigateToReportTemplates?.()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Templates
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generate Form Modal - Placeholder */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Generate Compliance Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Report generation form would go here...</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowGenerateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowGenerateForm(false)}>
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
