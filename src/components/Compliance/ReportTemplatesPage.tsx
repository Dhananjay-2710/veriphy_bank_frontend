import React, { useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  FileText,
  Code,
  Calendar,
  User,
  Filter,
  Search,
  Play,
  Copy,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useReportTemplates } from '../../hooks/useDashboardData';
import { ReportTemplate } from '../../types';

interface ReportTemplatesPageProps {
  onNavigateToComplianceReports?: () => void;
  onEditTemplate?: (templateId: string) => void;
  onGenerateFromTemplate?: (templateId: string) => void;
}

export function ReportTemplatesPage({ 
  onNavigateToComplianceReports,
  onEditTemplate,
  onGenerateFromTemplate
}: ReportTemplatesPageProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    reportType?: string;
    isActive?: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQueryPreview, setShowQueryPreview] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { data, loading, error, refetch } = useReportTemplates(selectedFilters);

  // Filter data based on search term
  const filteredData = data.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.reportType.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const truncateQuery = (query: string, maxLength: number = 100) => {
    if (query.length <= maxLength) return query;
    return query.substring(0, maxLength) + '...';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report templates...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Templates</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={refetch}>
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
          <h1 className="text-2xl font-bold text-gray-900">Report Templates</h1>
          <p className="text-gray-600">Create and manage reusable report templates for compliance reporting</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => onNavigateToComplianceReports?.()}>
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
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
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{data.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.filter(template => template.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Code className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Custom</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.filter(template => template.reportType === 'custom').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Play className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ready to Use</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.filter(template => template.isActive && template.query).length}
                </p>
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
                  placeholder="Search templates..."
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
                value={selectedFilters.isActive === undefined ? '' : selectedFilters.isActive.toString()}
                onChange={(e) => setSelectedFilters(prev => ({ 
                  ...prev, 
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.reportType.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGenerateFromTemplate?.(template.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditTemplate?.(template.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 line-clamp-2">{template.description}</p>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Query Preview:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQueryPreview(template.query)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
                <div className="bg-gray-100 p-3 rounded-md">
                  <code className="text-xs text-gray-700 font-mono">
                    {truncateQuery(template.query)}
                  </code>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <Badge className={getReportTypeColor(template.reportType)}>
                  {template.reportType.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(template.isActive)}>
                  {template.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
              
              {template.parameters && Object.keys(template.parameters).length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-600">Parameters:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.keys(template.parameters).map((param) => (
                      <Badge key={param} variant="outline" className="text-xs">
                        {param}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>Created by: {template.createdBy}</span>
                  </div>
                  <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No report templates found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || Object.keys(selectedFilters).length > 0 
                ? 'Try adjusting your search or filters' 
                : 'Create your first report template to get started'
              }
            </p>
            {!searchTerm && Object.keys(selectedFilters).length === 0 && (
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Form Modal - Placeholder */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4">
            <CardHeader>
              <CardTitle>Create Report Template</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Template creation form would go here...</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateForm(false)}>
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Query Preview Modal */}
      {showQueryPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4">
            <CardHeader>
              <CardTitle>Query Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 p-4 rounded-md">
                <pre className="text-green-400 text-sm overflow-auto max-h-96">
                  <code>{showQueryPreview}</code>
                </pre>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowQueryPreview(null)}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(showQueryPreview)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
