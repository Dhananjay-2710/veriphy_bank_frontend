import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Plus, 
  RefreshCw, 
  Eye, 
  Edit, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Briefcase,
  ShieldCheck,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { useAuth } from '../../contexts/AuthContextFixed';

interface CustomerManagementProps {
  onNavigateToCustomer?: (customerId: string) => void;
  onCreateCustomer?: () => void;
}

interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  panNumber: string;
  aadhaarNumber: string;
  dateOfBirth: string;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'incomplete';
  riskProfile: 'low' | 'medium' | 'high';
  monthlyIncome: number;
  employmentType: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}

export function CustomerManagement({ onNavigateToCustomer, onCreateCustomer }: CustomerManagementProps) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKycStatus, setFilterKycStatus] = useState('all');
  const [filterRiskProfile, setFilterRiskProfile] = useState('all');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());

  // Fetch customers
  const fetchCustomers = async () => {
    if (!user?.organizationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        organizationId: user.organizationId,
        ...(filterKycStatus !== 'all' && { kycStatus: filterKycStatus })
      };
      
      const fetchedCustomers = await SupabaseDatabaseService.getCustomers(filters);
      setCustomers(fetchedCustomers as Customer[]);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  // Load customers on mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, [user?.organizationId, filterKycStatus]);

  // Update KYC status
  const handleKycStatusUpdate = async (customerId: string, newStatus: string) => {
    try {
      await SupabaseDatabaseService.updateCustomerKYC(customerId, newStatus, `KYC status updated to ${newStatus}`);
      fetchCustomers(); // Refresh the list
    } catch (err) {
      console.error('Error updating KYC status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update KYC status');
    }
  };

  // Filter and search customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.panNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesKycFilter = filterKycStatus === 'all' || customer.kycStatus === filterKycStatus;
    const matchesRiskFilter = filterRiskProfile === 'all' || customer.riskProfile === filterRiskProfile;
    
    return matchesSearch && matchesKycFilter && matchesRiskFilter;
  });

  // Get status badges
  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="error"><AlertTriangle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'incomplete':
        return <Badge variant="default"><AlertTriangle className="h-3 w-3 mr-1" />Incomplete</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRiskProfileBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge variant="success" size="sm">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="error" size="sm">High Risk</Badge>;
      default:
        return <Badge size="sm">{risk}</Badge>;
    }
  };

  // Calculate stats
  const kycStats = {
    total: customers.length,
    verified: customers.filter(c => c.kycStatus === 'verified').length,
    pending: customers.filter(c => c.kycStatus === 'pending').length,
    rejected: customers.filter(c => c.kycStatus === 'rejected').length,
    incomplete: customers.filter(c => c.kycStatus === 'incomplete').length
  };

  const riskStats = {
    low: customers.filter(c => c.riskProfile === 'low').length,
    medium: customers.filter(c => c.riskProfile === 'medium').length,
    high: customers.filter(c => c.riskProfile === 'high').length
  };

  // Handle bulk operations
  const handleSelectAll = () => {
    if (selectedCustomers.size === filteredCustomers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const handleBulkKycUpdate = async (newStatus: string) => {
    const selectedIds = Array.from(selectedCustomers);
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(
        selectedIds.map(id => 
          SupabaseDatabaseService.updateCustomerKYC(id, newStatus, `Bulk KYC update to ${newStatus}`)
        )
      );
      setSelectedCustomers(new Set());
      fetchCustomers();
    } catch (err) {
      console.error('Error with bulk KYC update:', err);
      setError(err instanceof Error ? err.message : 'Failed to update KYC status');
    }
  };

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
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading customers</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Button onClick={fetchCustomers}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customer information and KYC verification status</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchCustomers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {onCreateCustomer && (
            <Button onClick={onCreateCustomer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{kycStats.total}</h3>
                <p className="text-sm text-gray-600">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{kycStats.verified}</h3>
                <p className="text-sm text-gray-600">KYC Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{kycStats.pending}</h3>
                <p className="text-sm text-gray-600">KYC Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{riskStats.high}</h3>
                <p className="text-sm text-gray-600">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
              <select
                value={filterKycStatus}
                onChange={(e) => setFilterKycStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Profile</label>
              <select
                value={filterRiskProfile}
                onChange={(e) => setFilterRiskProfile(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCustomers.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  {selectedCustomers.size} customer{selectedCustomers.size > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleBulkKycUpdate('verified')}>
                  Approve KYC
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkKycUpdate('rejected')}>
                  Reject KYC
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedCustomers(new Set())}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer List ({filteredCustomers.length})</CardTitle>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={handleSelectAll}>
                {selectedCustomers.size === filteredCustomers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KYC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Profile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Income
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.has(customer.id)}
                          onChange={() => handleSelectCustomer(customer.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.panNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Mail className="h-3 w-3 mr-1 text-gray-400" />
                            {customer.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getKycStatusBadge(customer.kycStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRiskProfileBadge(customer.riskProfile)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{customer.monthlyIncome?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          {onNavigateToCustomer && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onNavigateToCustomer(customer.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="relative group">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                              <button
                                onClick={() => handleKycStatusUpdate(customer.id, 'verified')}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                Mark KYC Verified
                              </button>
                              <button
                                onClick={() => handleKycStatusUpdate(customer.id, 'rejected')}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                Reject KYC
                              </button>
                              <button
                                onClick={() => handleKycStatusUpdate(customer.id, 'pending')}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                Mark Pending
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
