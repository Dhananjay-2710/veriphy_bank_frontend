import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  MoreVertical
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
  logoUrl?: string;
  description?: string;
  address?: any;
  contactInfo?: any;
  settings?: any;
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  subscriptionPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  maxUsers: number;
  maxLoansPerMonth: number;
  features?: any;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationFormData {
  name: string;
  slug: string;
  domain: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    website: string;
  };
  maxUsers: number;
  maxLoansPerMonth: number;
  subscriptionPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
}

export function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    slug: '',
    domain: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      website: ''
    },
    maxUsers: 10,
    maxLoansPerMonth: 100,
    subscriptionPlan: 'trial'
  });

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SupabaseDatabaseService.getOrganizations();
      setOrganizations(data);
    } catch (err) {
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
      setLoading(true);
      
      if (editingOrg) {
        // Update existing organization
        await SupabaseDatabaseService.updateOrganization(editingOrg.id, formData);
      } else {
        // Create new organization
        await SupabaseDatabaseService.createOrganization(formData);
      }
      
      await fetchOrganizations();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save organization');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await SupabaseDatabaseService.deleteOrganization(orgId);
      await fetchOrganizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      domain: '',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: ''
      },
      contactInfo: {
        email: '',
        phone: '',
        website: ''
      },
      maxUsers: 10,
      maxLoansPerMonth: 100,
      subscriptionPlan: 'trial'
    });
    setEditingOrg(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (org: Organization) => {
    setFormData({
      name: org.name,
      slug: org.slug,
      domain: org.domain || '',
      description: org.description || '',
      address: org.address || {
        street: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: ''
      },
      contactInfo: org.contactInfo || {
        email: '',
        phone: '',
        website: ''
      },
      maxUsers: org.maxUsers,
      maxLoansPerMonth: org.maxLoansPerMonth,
      subscriptionPlan: org.subscriptionPlan
    });
    setEditingOrg(org);
    setShowForm(true);
  };

  // Filter organizations
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (org.domain && org.domain.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'trial':
        return <Badge variant="warning">Trial</Badge>;
      case 'suspended':
        return <Badge variant="error">Suspended</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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

  if (loading && organizations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error && organizations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Organizations</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={fetchOrganizations}>
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
          <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
          <p className="text-gray-600">Manage organizations and their settings</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchOrganizations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrganizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-500">@{org.slug}</p>
                    </div>
                  </div>
                  
                  {org.description && (
                    <p className="text-gray-600 mb-3">{org.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getStatusBadge(org.status)}
                    {getSubscriptionBadge(org.subscriptionPlan)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Max Users:</span> {org.maxUsers}
                    </div>
                    <div>
                      <span className="font-medium">Max Loans/Month:</span> {org.maxLoansPerMonth}
                    </div>
                    {org.domain && (
                      <div>
                        <span className="font-medium">Domain:</span> {org.domain}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Created:</span> {new Date(org.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(org)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(org.id)}
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
      {filteredOrganizations.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No organizations found</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add First Organization
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Organization Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingOrg ? 'Edit Organization' : 'Add New Organization'}
              </CardTitle>
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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Domain
                    </label>
                    <input
                      type="text"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <option value="trial">Trial</option>
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

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingOrg ? 'Update Organization' : 'Create Organization'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
