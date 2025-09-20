import React, { useState } from 'react';
import { 
  Flag, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Settings
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureFlags } from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { FeatureFlag } from '../../types';

interface FeatureFlagsPageProps {
  onNavigateToSettings?: () => void;
}

export function FeatureFlagsPage({ onNavigateToSettings }: FeatureFlagsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [formData, setFormData] = useState({
    flagName: '',
    flagValue: false,
    description: '',
    isActive: true
  });
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { data, loading, error, refetch } = useFeatureFlags(user?.organization_id);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFlag) {
        await SupabaseDatabaseService.updateFeatureFlag(editingFlag.id, {
          flagValue: formData.flagValue,
          description: formData.description,
          isActive: formData.isActive
        });
      } else {
        await SupabaseDatabaseService.createFeatureFlag({
          organizationId: user?.organization_id,
          flagName: formData.flagName,
          flagValue: formData.flagValue,
          description: formData.description
        });
      }
      
      setShowCreateForm(false);
      setEditingFlag(null);
      setFormData({ flagName: '', flagValue: false, description: '', isActive: true });
      refetch();
    } catch (error) {
      console.error('Error saving feature flag:', error);
    }
  };

  // Handle flag toggle
  const handleToggleFlag = async (flagId: string, currentValue: boolean) => {
    try {
      await SupabaseDatabaseService.updateFeatureFlag(flagId, {
        flagValue: !currentValue
      });
      refetch();
    } catch (error) {
      console.error('Error toggling feature flag:', error);
    }
  };

  // Handle delete
  const handleDelete = async (flagId: string) => {
    if (window.confirm('Are you sure you want to delete this feature flag?')) {
      try {
        await SupabaseDatabaseService.deleteFeatureFlag(flagId);
        refetch();
      } catch (error) {
        console.error('Error deleting feature flag:', error);
      }
    }
  };

  // Filter data by category
  const filteredData = selectedCategory === 'all' 
    ? data 
    : data.filter(flag => flag.organizationId ? 'organization' : 'global' === selectedCategory);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feature flags...</p>
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
            <p className="text-lg font-semibold">Error Loading Feature Flags</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-gray-600">Manage feature flags for your organization</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Flag
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Flags</option>
              <option value="global">Global Flags</option>
              <option value="organization">Organization Flags</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(showCreateForm || editingFlag) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flag Name
                </label>
                <input
                  type="text"
                  value={formData.flagName}
                  onChange={(e) => setFormData({ ...formData, flagName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter flag name"
                  required
                  disabled={!!editingFlag}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter flag description"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.flagValue}
                    onChange={(e) => setFormData({ ...formData, flagValue: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Enabled by default</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <Button type="submit">
                  {editingFlag ? 'Update Flag' : 'Create Flag'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingFlag(null);
                    setFormData({ flagName: '', flagValue: false, description: '', isActive: true });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Feature Flags List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredData.map((flag) => (
          <Card key={flag.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Flag className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{flag.flagName}</h3>
                    <Badge variant={flag.organizationId ? 'default' : 'secondary'}>
                      {flag.organizationId ? 'Organization' : 'Global'}
                    </Badge>
                    <Badge variant={flag.isActive ? 'success' : 'destructive'}>
                      {flag.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  {flag.description && (
                    <p className="text-gray-600 mb-3">{flag.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Created: {new Date(flag.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(flag.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleFlag(flag.id, flag.flagValue)}
                    className={`p-2 rounded-lg transition-colors ${
                      flag.flagValue 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={flag.flagValue ? 'Disable flag' : 'Enable flag'}
                  >
                    {flag.flagValue ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setEditingFlag(flag);
                      setFormData({
                        flagName: flag.flagName,
                        flagValue: flag.flagValue,
                        description: flag.description || '',
                        isActive: flag.isActive
                      });
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit flag"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(flag.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete flag"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
            <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No feature flags found</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Flag
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
