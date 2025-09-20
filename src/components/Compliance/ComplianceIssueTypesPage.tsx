import React, { useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  Shield,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useComplianceIssueTypes } from '../../hooks/useDashboardData';
import { ComplianceIssueType } from '../../types';

interface ComplianceIssueTypesPageProps {
  onNavigateToComplianceIssues?: () => void;
  onEditIssueType?: (issueTypeId: string) => void;
}

export function ComplianceIssueTypesPage({ 
  onNavigateToComplianceIssues,
  onEditIssueType
}: ComplianceIssueTypesPageProps) {
  const [selectedFilters, setSelectedFilters] = useState<{category?: string; isActive?: boolean}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { data, loading, error, refetch } = useComplianceIssueTypes(selectedFilters);

  // Filter data based on search term
  const filteredData = data.filter(issueType => 
    issueType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issueType.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issueType.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'regulatory': return 'bg-blue-100 text-blue-800';
      case 'operational': return 'bg-purple-100 text-purple-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'documentation': return 'bg-yellow-100 text-yellow-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance issue types...</p>
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
            <p className="text-lg font-semibold">Error Loading Issue Types</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Compliance Issue Types</h1>
          <p className="text-gray-600">Manage different types of compliance issues and their severity levels</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Issue Type
          </Button>
        </div>
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
                  placeholder="Search issue types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedFilters.category || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="regulatory">Regulatory</option>
                <option value="operational">Operational</option>
                <option value="financial">Financial</option>
                <option value="documentation">Documentation</option>
                <option value="other">Other</option>
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

      {/* Issue Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((issueType) => (
          <Card key={issueType.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{issueType.name}</h3>
                    <p className="text-sm text-gray-600">{issueType.category}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditIssueType?.(issueType.id)}
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
              
              <p className="text-gray-700 mb-4 line-clamp-2">{issueType.description}</p>
              
              <div className="flex items-center justify-between">
                <Badge className={getSeverityColor(issueType.severity)}>
                  {issueType.severity.toUpperCase()}
                </Badge>
                <Badge className={getCategoryColor(issueType.category)}>
                  {issueType.category.toUpperCase()}
                </Badge>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Status: {issueType.isActive ? 'Active' : 'Inactive'}</span>
                  <span>{new Date(issueType.createdAt).toLocaleDateString()}</span>
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
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No compliance issue types found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || Object.keys(selectedFilters).length > 0 
                ? 'Try adjusting your search or filters' 
                : 'Create your first compliance issue type to get started'
              }
            </p>
            {!searchTerm && Object.keys(selectedFilters).length === 0 && (
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Issue Type
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Form Modal - Placeholder */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create Issue Type</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Create form would go here...</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateForm(false)}>
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
