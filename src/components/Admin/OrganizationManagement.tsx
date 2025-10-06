import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ValidatedSelect } from '../ui/FormField';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { OrganizationManagementModal } from '../modals/OrganizationManagementModal';

interface Organization {
  id: string;
  name: string;
  code: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  address?: any;
  metadata?: any;
  settings?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationManagementProps {
  onBack: () => void;
}

export function OrganizationManagement({ onBack }: OrganizationManagementProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedOrganizations = await SupabaseDatabaseService.getOrganizations();
      console.log('📊 Fetched organizations:', fetchedOrganizations);
      setOrganizations(fetchedOrganizations);
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError(err.message || 'Failed to fetch organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleRefresh = () => {
    fetchOrganizations();
  };

  const handleCreateOrganization = () => {
    setEditingOrganization(null);
    setShowModal(true);
  };

  const handleEditOrganization = (org: Organization) => {
    setEditingOrganization(org);
    setShowModal(true);
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      try {
      await SupabaseDatabaseService.deleteOrganization(orgId);
        fetchOrganizations();
      } catch (err: any) {
        console.error('Error deleting organization:', err);
        setError(err.message || 'Failed to delete organization.');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingOrganization(null);
    fetchOrganizations(); // Refresh data after modal closes
  };

  // Filter organizations based on search and filters
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = !searchTerm || 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && org.isActive) ||
      (statusFilter === 'inactive' && !org.isActive);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Organizations</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        <h2 className="text-2xl font-semibold text-gray-800">Organization Management</h2>
        <Button onClick={handleCreateOrganization} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add New Organization
          </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            <ValidatedSelect
              label="Status"
              name="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />

            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organization List */}
      {filteredOrganizations.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p className="text-lg mb-2">No organizations found.</p>
          <p>Click "Add New Organization" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{org.name}</CardTitle>
                <Badge 
                  variant="default"
                >
                  {org.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Code:</strong> {org.code}</p>
                  <p><strong>Email:</strong> {org.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {org.phone || 'N/A'}</p>
                  <p><strong>Website:</strong> {org.website || 'N/A'}</p>
                  <p><strong>Created:</strong> {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                {org.description && (
                  <p className="text-sm text-gray-500 mt-2">{org.description}</p>
                )}
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditOrganization(org)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteOrganization(org.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Organization Management Modal */}
      {showModal && (
        <OrganizationManagementModal
          isOpen={showModal}
          onClose={handleModalClose}
          organization={editingOrganization}
        />
      )}
    </div>
  );
}