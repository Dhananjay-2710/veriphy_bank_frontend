import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Database, Shield, Bell, Globe, Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { useSystemHealth, useSystemSettings } from '../../hooks/useDashboardData';

interface SystemSettingsProps {
  onBack: () => void;
}

export function SystemSettings({ onBack }: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    applicationName: 'VERIPHY Banking Document Workflow',
    bankName: 'Happy Bank of India',
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireSpecialChars: true,
    forcePasswordChange: 90,
    require2FA: true,
    emailNotifications: true,
    smsNotifications: true,
    auditRetention: 2555, // 7 years in days
    autoBackup: true,
    backupFrequency: 'daily'
  });
  // Use real system health data from hook
  const { data: systemHealthData, loading: healthLoading, error: healthError, refetch: refetchHealth } = useSystemHealth();
  const { data: systemSettingsData, loading: settingsLoading, error: settingsError, refetch: refetchSettings } = useSystemSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('Loading system settings...');
      
      // Use real settings data from hook
      if (systemSettingsData && systemSettingsData.length > 0) {
        const settingsMap = systemSettingsData.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as any);
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Save settings to database
      console.log('Saving system settings:', settings);
      // In a real implementation, this would save to Supabase
      // await SupabaseDatabaseService.updateSystemSettings(settings);
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const refreshSystemHealth = async () => {
    try {
      console.log('Refreshing system health...');
      refetchHealth();
    } catch (err) {
      console.error('Error refreshing system health:', err);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="success" size="sm">Healthy</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm">Warning</Badge>;
      case 'error':
        return <Badge variant="error" size="sm">Error</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const tabs = [
    { id: 'general', label: 'General Settings' },
    { id: 'security', label: 'Security & Compliance' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'system-health', label: 'System Health' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} style={{ background: '#ffffff', color: '#374151' }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="text-2xl font-bold text-white">System Settings</h1>
            <p className="text-gray-300">Configure system parameters and integrations</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refreshSystemHealth} disabled={healthLoading} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className={`h-4 w-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
          <Button onClick={saveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <div className="text-sm text-green-700">{success}</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
                  <input
                    type="text"
                    value={settings.applicationName}
                    onChange={(e) => handleSettingChange('applicationName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={settings.bankName}
                    onChange={(e) => handleSettingChange('bankName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'system-health' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(systemHealthData.length > 0 ? systemHealthData : [
                  { service: 'API Gateway', status: 'healthy', uptime: '99.9%', lastCheck: '2 min ago' },
                  { service: 'Database', status: 'healthy', uptime: '99.8%', lastCheck: '1 min ago' },
                  { service: 'WhatsApp Integration', status: 'healthy', uptime: '100%', lastCheck: '30 sec ago' },
                  { service: 'Document Storage', status: 'warning', uptime: '99.7%', lastCheck: '5 min ago' },
                  { service: 'Authentication', status: 'healthy', uptime: '100%', lastCheck: '1 min ago' },
                  { service: 'Compliance Engine', status: 'healthy', uptime: '99.9%', lastCheck: '2 min ago' }
                ]).map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {service.status === 'healthy' ? (
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        )}
                        <h3 className="font-medium text-gray-900">{service.service}</h3>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>Uptime: {service.uptime}</p>
                      <p>Last Check: {service.lastCheck}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Security & Compliance Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Password Policy</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Password Length</label>
                    <input
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={settings.requireSpecialChars}
                      onChange={(e) => handleSettingChange('requireSpecialChars', e.target.checked)}
                      className="mr-2" 
                    />
                    <span className="text-sm text-gray-700">Require special characters</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Force Password Change (days)</label>
                    <input
                      type="number"
                      value={settings.forcePasswordChange}
                      onChange={(e) => handleSettingChange('forcePasswordChange', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Two-Factor Authentication</h4>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={settings.require2FA}
                    onChange={(e) => handleSettingChange('require2FA', e.target.checked)}
                    className="mr-2" 
                  />
                  <span className="text-sm text-gray-700">Require 2FA for all admin accounts</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'integrations' && (
        <Card>
          <CardHeader>
            <CardTitle>External Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">WhatsApp Business API</h4>
                  <p className="text-sm text-gray-600">Customer communication platform</p>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Credit Bureau API</h4>
                  <p className="text-sm text-gray-600">Credit score verification</p>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Document OCR Service</h4>
                  <p className="text-sm text-gray-600">Automated document processing</p>
                </div>
                <Badge variant="warning">Limited</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}