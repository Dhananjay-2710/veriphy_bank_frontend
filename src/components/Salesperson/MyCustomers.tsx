import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  Mail, 
  Phone, 
  MapPin,
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useSalespersonCustomers } from '../../hooks/useDashboardData';
import { NewCaseFromCustomerModal } from './NewCaseFromCustomerModal';

interface MyCustomersProps {
  onBack?: () => void;
}

export function MyCustomers({ onBack }: MyCustomersProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomerForCase, setSelectedCustomerForCase] = useState<any>(null);

  const { customers, loading, error, refetch } = useSalespersonCustomers(
    user?.id?.toString() || '',
    {
      kycStatus: kycFilter,
      riskProfile: riskFilter,
      searchTerm: searchTerm
    }
  );

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success" size="sm"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="error" size="sm"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return <Badge variant="success" size="sm">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="error" size="sm">High Risk</Badge>;
      default:
        return <Badge size="sm">{risk || 'N/A'}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Customers</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Memoize stats to avoid recalculation on every render
  const stats = useMemo(() => ({
    total: customers?.length || 0,
    verified: customers?.filter(c => c.kycStatus === 'verified').length || 0,
    pending: customers?.filter(c => c.kycStatus === 'pending').length || 0,
    rejected: customers?.filter(c => c.kycStatus === 'rejected').length || 0
  }), [customers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                ← Back
              </Button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">My Customers</h1>
          </div>
          <p className="text-gray-600">Manage your assigned customers</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Customers</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending KYC</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KYC Status
                </label>
                <select
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Profile
                </label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Risk Levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid grid-cols-1 gap-4">
        {customers && customers.length > 0 ? (
          customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {customer.fullName || customer.name}
                        </h3>
                        {getKycStatusBadge(customer.kycStatus)}
                        {getRiskBadge(customer.riskProfile)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        {customer.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.mobile && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{customer.mobile}</span>
                          </div>
                        )}
                        {customer.employment && (
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-4 w-4" />
                            <span className="capitalize">{customer.employment}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{customer.address}</span>
                          </div>
                        )}
                      </div>

                      {(customer.panNumber || customer.aadhaarNumber) && (
                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                          {customer.panNumber && (
                            <span>PAN: {customer.panNumber}</span>
                          )}
                          {customer.aadhaarNumber && (
                            <span>Aadhaar: ****-{customer.aadhaarNumber.slice(-4)}</span>
                          )}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        Added on {formatDate(customer.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/cases')}
                      title="View all your cases (filtered view coming soon)"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Cases
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCustomerForCase(customer)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Case
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || kycFilter || riskFilter
                  ? 'Try adjusting your search or filters'
                  : 'You don\'t have any customers assigned yet'}
              </p>
              {(searchTerm || kycFilter || riskFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setKycFilter('');
                    setRiskFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Case Modal */}
      {selectedCustomerForCase && (
        <NewCaseFromCustomerModal
          customer={selectedCustomerForCase}
          onClose={() => setSelectedCustomerForCase(null)}
          onCaseCreated={(caseData) => {
            console.log('Case created:', caseData);
            setSelectedCustomerForCase(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

