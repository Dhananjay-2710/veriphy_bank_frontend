import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ValidatedSelect } from '../ui/FormField';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { CustomerManagementModal } from '../modals/CustomerManagementModal';

interface Customer {
  id: string;
  fullName: string;
  dob?: string;
  mobile?: string;
  email?: string;
  address?: string;
  externalCustomerCode?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  metadata?: any;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  panNumber?: string;
  aadhaarNumber?: string;
  gender?: string;
  maritalStatus?: string;
  employmentType?: string;
  riskProfile?: string;
  deletedAt?: string;
  userId?: string;
}

interface CustomerManagementProps {
  onBack: () => void;
}

export function CustomerManagement({ onBack }: CustomerManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCustomers = await SupabaseDatabaseService.getCustomers();
      setCustomers(fetchedCustomers);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const orgs = await SupabaseDatabaseService.getOrganizations();
      setOrganizations(orgs);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchOrganizations();
  }, []);

  const handleRefresh = () => {
    fetchCustomers();
  };

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer? This will also delete all related records (cases, documents, tasks, etc.). This action cannot be undone.')) {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Starting cascading delete for customer:', customerId);
        await SupabaseDatabaseService.deleteCustomer(customerId);
        
        console.log('Customer deleted successfully');
        await fetchCustomers(); // Refresh the list
      } catch (err: any) {
        console.error('Error deleting customer:', err);
        
        // Provide more specific error messages based on the error type
        let errorMessage = 'Failed to delete customer.';
        
        if (err.message.includes('foreign key')) {
          errorMessage = 'Cannot delete customer because they have active cases, documents, or other related records. Please contact an administrator for assistance.';
        } else if (err.message.includes('not found')) {
          errorMessage = 'Customer not found. It may have already been deleted.';
        } else if (err.message.includes('permission')) {
          errorMessage = 'You do not have permission to delete this customer.';
        } else {
          errorMessage = err.message || 'An unexpected error occurred while deleting the customer.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCustomer(null);
    fetchCustomers(); // Refresh data after modal closes
  };

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile?.includes(searchTerm) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.panNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.aadhaarNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.externalCustomerCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.kycStatus === statusFilter;
    const matchesOrganization = organizationFilter === 'all' || customer.organizationId === organizationFilter;
    
    return matchesSearch && matchesStatus && matchesOrganization;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
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
            <p className="text-lg font-semibold">Error Loading Customers</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={handleRefresh} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="relative flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="dashboard-back-button flex items-center" style={{ background: '#ffffff', color: '#374151' }}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h2 className="text-2xl font-bold text-white">Customer Management</h2>
          <p className="text-gray-300">Manage customers and their information</p>
        </div>
        <Button onClick={handleCreateCustomer} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add New Customer
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
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <ValidatedSelect
              label="KYC Status"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'verified', label: 'Verified' },
                { value: 'rejected', label: 'Rejected' }
              ]}
            />

            <ValidatedSelect
              label="Organization"
              name="organizationFilter"
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Organizations' },
                ...organizations.map(org => ({
                  value: org.id.toString(),
                  label: org.name
                }))
              ]}
            />

            <Button variant="outline" onClick={handleRefresh} className="dashboard-refresh-button" style={{ background: '#ffffff', color: '#374151' }}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p className="text-lg mb-2">No customers found.</p>
          <p>Click "Add New Customer" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">
                  {customer.fullName || 'Unknown Customer'}
                </CardTitle>
                <Badge 
                  variant="default"
                >
                  {customer.kycStatus}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Customer ID:</strong> {customer.id}</p>
                  <p><strong>Full Name:</strong> {customer.fullName}</p>
                  <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
                  <p><strong>Mobile:</strong> {customer.mobile || 'N/A'}</p>
                  <p><strong>PAN:</strong> {customer.panNumber || 'N/A'}</p>
                  <p><strong>Aadhaar:</strong> {customer.aadhaarNumber || 'N/A'}</p>
                  <p><strong>DOB:</strong> {customer.dob ? new Date(customer.dob).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Gender:</strong> {customer.gender || 'N/A'}</p>
                  <p><strong>Marital Status:</strong> {customer.maritalStatus || 'N/A'}</p>
                  <p><strong>Employment:</strong> {customer.employmentType || 'N/A'}</p>
                  <p><strong>Risk Profile:</strong> {customer.riskProfile || 'N/A'}</p>
                  <p><strong>External Code:</strong> {customer.externalCustomerCode || 'N/A'}</p>
                  <p><strong>Organization ID:</strong> {customer.organizationId || 'N/A'}</p>
                  <p><strong>User ID:</strong> {customer.userId || 'N/A'}</p>
                  <p><strong>Created:</strong> {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditCustomer(customer)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteCustomer(customer.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Customer Management Modal */}
      {showModal && (
        <CustomerManagementModal
          isOpen={showModal}
          onClose={handleModalClose}
          customer={editingCustomer}
        />
      )}
    </div>
  );
}
