import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  TrendingUp,
  Users
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useComplianceIssues, useComplianceIssueTypes } from '../../hooks/useDashboardData';
import { ComplianceIssue, ComplianceIssueType } from '../../types';

interface ComplianceIssueManagementProps {
  onNavigateToIssue?: (issueId: string) => void;
  onCreateIssue?: () => void;
  onEditIssue?: (issueId: string) => void;
  onDeleteIssue?: (issueId: string) => void;
}

export function ComplianceIssueManagement({ 
  onNavigateToIssue,
  onCreateIssue,
  onEditIssue,
  onDeleteIssue
}: ComplianceIssueManagementProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    status?: string;
    severity?: string;
    priority?: string;
    assignedTo?: string;
  }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssueType, setSelectedIssueType] = useState<string>('');
  
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { data: complianceIssues, loading, error, refetch } = useComplianceIssues(selectedFilters);
  const { data: issueTypes } = useComplianceIssueTypes({ isActive: true });

  // Filter issues based on search term and issue type
  const filteredIssues = complianceIssues.filter((issue: ComplianceIssue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedIssueType || issue.issueTypeId === selectedIssueType;
    return matchesSearch && matchesType;
  });

  // Get issue type name by ID
  const getIssueTypeName = (issueTypeId: string) => {
    const issueType = issueTypes.find((type: ComplianceIssueType) => type.id === issueTypeId);
    return issueType?.name || 'Unknown Type';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle actions
  const handleViewIssue = (issueId: string) => {
    if (onNavigateToIssue) {
      onNavigateToIssue(issueId);
    }
  };

  const handleEditIssue = (issueId: string) => {
    if (onEditIssue) {
      onEditIssue(issueId);
    }
  };

  const handleDeleteIssue = (issueId: string) => {
    if (onDeleteIssue) {
      onDeleteIssue(issueId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance issues...</p>
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
            <p className="text-lg font-semibold">Error Loading Compliance Issues</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={refetch}>
            <CheckCircle className="h-4 w-4 mr-2" />
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
          <h1 className="text-2xl font-bold text-gray-900">Compliance Issue Management</h1>
          <p className="text-gray-600">Track and manage compliance issues across the organization</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetch}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onCreateIssue}>
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {complianceIssues.filter((issue: ComplianceIssue) => issue.status === 'open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {complianceIssues.filter((issue: ComplianceIssue) => issue.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {complianceIssues.filter((issue: ComplianceIssue) => issue.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Escalated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {complianceIssues.filter((issue: ComplianceIssue) => issue.status === 'escalated').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedFilters.status || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={selectedFilters.severity || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, severity: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
              <select
                value={selectedIssueType}
                onChange={(e) => setSelectedIssueType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {issueTypes.map((type: ComplianceIssueType) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredIssues.map((issue: ComplianceIssue) => (
          <Card key={issue.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity.toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{issue.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {getIssueTypeName(issue.issueTypeId)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(issue.reportedAt).toLocaleDateString()}
                    </div>
                    {issue.assignedTo && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Assigned to: {issue.assignedTo}
                      </div>
                    )}
                    {issue.dueDate && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Due: {new Date(issue.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewIssue(issue.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditIssue(issue.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteIssue(issue.id)}
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

      {/* Empty state */}
      {filteredIssues.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No compliance issues found</p>
            {searchTerm || selectedIssueType || Object.values(selectedFilters).some(Boolean) && (
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ComplianceIssueManagement;
