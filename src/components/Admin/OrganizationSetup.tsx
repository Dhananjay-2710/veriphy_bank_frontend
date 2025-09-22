import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  ArrowRight,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  description?: string;
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  subscriptionPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
  maxUsers: number;
  maxLoansPerMonth: number;
  createdAt: string;
}

interface OrganizationFormData {
  name: string;
  slug: string;
  domain: string;
  description: string;
  maxUsers: number;
  maxLoansPerMonth: number;
  subscriptionPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
}

interface OrganizationSetupProps {
  onComplete?: () => void;
  onNext?: () => void;
}

export function OrganizationSetup({ onComplete, onNext }: OrganizationSetupProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    slug: '',
    domain: '',
    description: '',
    maxUsers: 10,
    maxLoansPerMonth: 100,
    subscriptionPlan: 'trial'
  });

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching organizations from Supabase...');
      
      const data = await SupabaseDatabaseService.getOrganizations();
      console.log('✅ Organizations fetched:', data);
      
      setOrganizations(data);
      
      // If organizations exist, mark as complete
      if (data.length > 0 && onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('❌ Error fetching organizations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      console.log('🚀 Creating organization:', formData);
      
      // Create organization
      const newOrg = await SupabaseDatabaseService.createOrganization(formData);
      console.log('✅ Organization created:', newOrg);
      
      // Refresh organizations list
      await fetchOrganizations();
      
      // Reset form
      setFormData({
        name: '',
        slug: '',
        domain: '',
        description: '',
        maxUsers: 10,
        maxLoansPerMonth: 100,
        subscriptionPlan: 'trial'
      });
      setShowForm(false);
      
      // Call completion callback
      if (onComplete) {
        onComplete();
      }
      
    } catch (err) {
      console.error('❌ Error creating organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    setFormData({ ...formData, name, slug });
  };

  // Get subscription plan badge
  const getSubscriptionBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Badge variant="success">Enterprise</Badge>;
      case 'premium':
        return <Badge variant="primary">Premium</Badge>;
      case 'basic':
        return <Badge variant="secondary">Basic</Badge>;
      case 'trial':
        return <Badge variant="warning">Trial</Badge>;
      default:
        return <Badge variant="secondary">{plan}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 p-3 rounded-full">
            <Building2 className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Organization Setup</h2>
        <p className="text-gray-600 mt-2">Create your first organization to get started</p>
      </div>

      {/* Current Organizations */}
      {organizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Existing Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-500">@{org.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSubscriptionBadge(org.subscriptionPlan)}
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Organization Form */}
      {!showForm ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {organizations.length === 0 ? 'Create Your First Organization' : 'Add Another Organization'}
            </h3>
            <p className="text-gray-600 mb-6">
              {organizations.length === 0 
                ? 'Start by creating an organization to manage your banking operations'
                : 'Add additional organizations to your system'
              }
            </p>
            <Button onClick={() => setShowForm(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create New Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Happy Bank of India"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., happy-bank-india"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., happybank.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={formData.subscriptionPlan}
                    onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="trial">Trial (30 days)</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your organization..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Users
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Loans per Month
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxLoansPerMonth}
                    onChange={(e) => setFormData({ ...formData, maxLoansPerMonth: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-800">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Error:</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Organization
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Next Step Button */}
      {organizations.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Organization Setup Complete!</h3>
                  <p className="text-green-700 text-sm">
                    You have {organizations.length} organization{organizations.length > 1 ? 's' : ''} configured.
                  </p>
                </div>
              </div>
              {onNext && (
                <Button onClick={onNext} className="bg-green-600 hover:bg-green-700">
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">About Organizations</h4>
              <p className="text-blue-700 text-sm mt-1">
                Organizations are the top-level entities in your system. Each organization can have its own departments, 
                users, and loan products. You can create multiple organizations for different branches or business units.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
