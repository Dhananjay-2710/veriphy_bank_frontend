import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  Lock,
  Unlock,
  Save,
  Users
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useOrganizationSettings } from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { OrganizationSetting } from '../../types';

interface OrganizationSettingsPageProps {
  onNavigateToSystemSettings?: () => void;
}

export function OrganizationSettingsPage({ onNavigateToSystemSettings }: OrganizationSettingsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState<OrganizationSetting | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    category: 'general',
    isEncrypted: false
  });
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { data, loading, error, refetch } = useOrganizationSettings(
    user?.organization_id || '', 
    selectedCategory === 'all' ? undefined : selectedCategory
  );

  // Setting categories
  const categories = [
    { value: 'general', label: 'General', icon: '⚙️' },
    { value: 'security', label: 'Security', icon: '🔒' },
    { value: 'notifications', label: 'Notifications', icon: '🔔' },
    { value: 'integrations', label: 'Integrations', icon: '🔗' },
    { value: 'billing', label: 'Billing', icon: '💳' },
    { value: 'compliance', label: 'Compliance', icon: '📋' },
    { value: 'workflow', label: 'Workflow', icon: '🔄' },
    { value: 'other', label: 'Other', icon: '📝' }
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSetting) {
        await SupabaseDatabaseService.updateOrganizationSetting(editingSetting.id, {
          value: formData.value,
          description: formData.description,
          category: formData.category,
          isEncrypted: formData.isEncrypted
        });
      } else {
        await SupabaseDatabaseService.createOrganizationSetting({
          organizationId: user?.organization_id || '',
          key: formData.key,
          value: formData.value,
          description: formData.description,
          category: formData.category,
          isEncrypted: formData.isEncrypted
        });
      }
      
      setShowCreateForm(false);
      setEditingSetting(null);
      setFormData({ key: '', value: '', description: '', category: 'general', isEncrypted: false });
      refetch();
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  // Handle delete
  const handleDelete = async (settingId: string) => {
    if (window.confirm('Are you sure you want to delete this setting?')) {
      try {
        await SupabaseDatabaseService.deleteOrganizationSetting(settingId);
        refetch();
      } catch (error) {
        console.error('Error deleting setting:', error);
      }
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security': return 'destructive';
      case 'compliance': return 'warning';
      case 'billing': return 'success';
      case 'integrations': return 'default';
      case 'notifications': return 'secondary';
      case 'workflow': return 'default';
      default: return 'secondary';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization settings...</p>
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
            <p className="text-lg font-semibold">Error Loading Settings</p>
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
      <div className="relative flex items-center justify-between">
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">Organization Settings</h1>
          <p className="text-gray-300">Manage settings specific to your organization</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Setting
          </Button>
        </div>
      </div>

      {/* Organization Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Building className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Organization Settings</h3>
              <p className="text-gray-600">These settings apply only to your organization and override global system settings.</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(showCreateForm || editingSetting) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSetting ? 'Edit Organization Setting' : 'Create Organization Setting'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Setting Key
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter setting key"
                    required
                    disabled={!!editingSetting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Setting Value
                </label>
                <textarea
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter setting value"
                  rows={3}
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
                  placeholder="Enter setting description"
                  rows={2}
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isEncrypted}
                    onChange={(e) => setFormData({ ...formData, isEncrypted: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Encrypt this setting</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingSetting ? 'Update Setting' : 'Create Setting'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingSetting(null);
                    setFormData({ key: '', value: '', description: '', category: 'general', isEncrypted: false });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Settings List */}
      <div className="grid grid-cols-1 gap-6">
        {data.map((setting) => {
          const categoryInfo = categories.find(c => c.value === setting.category);
          return (
            <Card key={setting.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{setting.key}</h3>
                      <Badge variant={getCategoryColor(setting.category)}>
                        {categoryInfo?.icon} {categoryInfo?.label}
                      </Badge>
                      {setting.isEncrypted && (
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Encrypted
                        </Badge>
                      )}
                    </div>
                    
                    {setting.description && (
                      <p className="text-gray-600 mb-3">{setting.description}</p>
                    )}

                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Value:</div>
                      <div className="text-sm text-gray-900 font-mono break-all">
                        {setting.isEncrypted ? '••••••••••••••••' : setting.value || '(empty)'}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {new Date(setting.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(setting.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setEditingSetting(setting);
                        setFormData({
                          key: setting.key,
                          value: setting.value || '',
                          description: setting.description || '',
                          category: setting.category,
                          isEncrypted: setting.isEncrypted
                        });
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit setting"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(setting.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete setting"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {data.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No organization settings found</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Setting
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
