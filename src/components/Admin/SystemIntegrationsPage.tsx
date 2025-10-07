import React, { useState } from 'react';
import { 
  Plug, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  Play,
  Pause,
  Settings,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useSystemIntegrations } from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { SystemIntegration } from '../../types';

interface SystemIntegrationsPageProps {
  onNavigateToSettings?: () => void;
}

export function SystemIntegrationsPage({ onNavigateToSettings }: SystemIntegrationsPageProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<SystemIntegration | null>(null);
  const [formData, setFormData] = useState({
    integrationName: '',
    integrationType: 'whatsapp',
    configuration: '{}',
    credentials: '{}'
  });
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { data, loading, error, refetch } = useSystemIntegrations(user?.organization_id || '');

  // Integration types
  const integrationTypes = [
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'sms', label: 'SMS', icon: '📱' },
    { value: 'crm', label: 'CRM', icon: '👥' },
    { value: 'erp', label: 'ERP', icon: '🏢' },
    { value: 'payment_gateway', label: 'Payment Gateway', icon: '💳' },
    { value: 'credit_bureau', label: 'Credit Bureau', icon: '📊' },
    { value: 'other', label: 'Other', icon: '🔗' }
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const configData = JSON.parse(formData.configuration);
      const credData = formData.credentials ? JSON.parse(formData.credentials) : undefined;

      if (editingIntegration) {
        await SupabaseDatabaseService.updateSystemIntegration(editingIntegration.id, {
          configuration: configData,
          credentials: credData
        });
      } else {
        await SupabaseDatabaseService.createSystemIntegration({
          organizationId: user?.organization_id || '',
          integrationName: formData.integrationName,
          integrationType: formData.integrationType,
          configuration: configData,
          credentials: credData
        });
      }
      
      setShowCreateForm(false);
      setEditingIntegration(null);
      setFormData({ integrationName: '', integrationType: 'whatsapp', configuration: '{}', credentials: '{}' });
      refetch();
    } catch (error) {
      console.error('Error saving integration:', error);
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (integrationId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await SupabaseDatabaseService.updateSystemIntegration(integrationId, {
        status: newStatus
      });
      refetch();
    } catch (error) {
      console.error('Error toggling integration status:', error);
    }
  };

  // Handle delete
  const handleDelete = async (integrationId: string) => {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      try {
        await SupabaseDatabaseService.deleteSystemIntegration(integrationId);
        refetch();
      } catch (error) {
        console.error('Error deleting integration:', error);
      }
    }
  };

  // Filter data by type
  const filteredData = selectedType === 'all' 
    ? data 
    : data.filter(integration => integration.integrationType === selectedType);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'error': return 'destructive';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system integrations...</p>
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
            <p className="text-lg font-semibold">Error Loading Integrations</p>
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
          <h1 className="text-2xl font-bold text-white">System Integrations</h1>
          <p className="text-gray-300">Manage third-party integrations and APIs</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {integrationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(showCreateForm || editingIntegration) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingIntegration ? 'Edit Integration' : 'Create Integration'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Integration Name
                  </label>
                  <input
                    type="text"
                    value={formData.integrationName}
                    onChange={(e) => setFormData({ ...formData, integrationName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter integration name"
                    required
                    disabled={!!editingIntegration}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Integration Type
                  </label>
                  <select
                    value={formData.integrationType}
                    onChange={(e) => setFormData({ ...formData, integrationType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!!editingIntegration}
                  >
                    {integrationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Configuration (JSON)
                </label>
                <textarea
                  value={formData.configuration}
                  onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='{"api_url": "https://api.example.com", "timeout": 30000}'
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credentials (JSON) - Will be encrypted
                </label>
                <textarea
                  value={formData.credentials}
                  onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='{"api_key": "your-api-key", "secret": "your-secret"}'
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <Button type="submit">
                  {editingIntegration ? 'Update Integration' : 'Create Integration'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingIntegration(null);
                    setFormData({ integrationName: '', integrationType: 'whatsapp', configuration: '{}', credentials: '{}' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Integrations List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredData.map((integration) => {
          const typeInfo = integrationTypes.find(t => t.value === integration.integrationType);
          return (
            <Card key={integration.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Plug className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{integration.integrationName}</h3>
                      <span className="text-2xl">{typeInfo?.icon}</span>
                      <Badge variant={getStatusColor(integration.status)}>
                        {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Type:</span> {typeInfo?.label}
                    </div>

                    {integration.errorMessage && (
                      <div className="text-sm text-red-600 mb-3 bg-red-50 p-2 rounded">
                        <strong>Error:</strong> {integration.errorMessage}
                      </div>
                    )}

                    {integration.lastSyncAt && (
                      <div className="text-sm text-gray-500 mb-3">
                        <span className="font-medium">Last Sync:</span> {new Date(integration.lastSyncAt).toLocaleString()}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {new Date(integration.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(integration.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleStatus(integration.id, integration.status)}
                      className={`p-2 rounded-lg transition-colors ${
                        integration.status === 'active'
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={integration.status === 'active' ? 'Deactivate integration' : 'Activate integration'}
                    >
                      {integration.status === 'active' ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setEditingIntegration(integration);
                        setFormData({
                          integrationName: integration.integrationName,
                          integrationType: integration.integrationType,
                          configuration: JSON.stringify(integration.configuration, null, 2),
                          credentials: integration.credentials ? JSON.stringify(integration.credentials, null, 2) : '{}'
                        });
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit integration"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(integration.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete integration"
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
      {filteredData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Plug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No integrations found</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Integration
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
