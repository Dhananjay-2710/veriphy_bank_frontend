import React, { useState } from 'react';
import { ArrowLeft, Settings, Database, Shield, Bell, Globe, Save, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface SystemSettingsProps {
  onBack: () => void;
}

export function SystemSettings({ onBack }: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');

  const systemHealth = [
    { service: 'API Gateway', status: 'healthy', uptime: '99.9%', lastCheck: '2 min ago' },
    { service: 'Database', status: 'healthy', uptime: '99.8%', lastCheck: '1 min ago' },
    { service: 'WhatsApp Integration', status: 'healthy', uptime: '100%', lastCheck: '30 sec ago' },
    { service: 'Document Storage', status: 'warning', uptime: '99.7%', lastCheck: '5 min ago' },
    { service: 'Authentication', status: 'healthy', uptime: '100%', lastCheck: '1 min ago' },
    { service: 'Compliance Engine', status: 'healthy', uptime: '99.9%', lastCheck: '2 min ago' }
  ];

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
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure system parameters and integrations</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

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
                    defaultValue="VERIPHY Banking Document Workflow"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    defaultValue="Happy Bank of India"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    defaultValue="30"
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
                {systemHealth.map((service, index) => (
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
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Require minimum 8 characters</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Require special characters</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Force password change every 90 days</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Two-Factor Authentication</h4>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
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