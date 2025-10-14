import { useState, useEffect } from 'react';
import { X, DollarSign, FileText, Calendar, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { useAuth } from '../../contexts/AuthContextFixed';

interface NewCaseFromCustomerModalProps {
  customer: any;
  onClose: () => void;
  onCaseCreated: (caseData: any) => void;
}

export function NewCaseFromCustomerModal({ customer, onClose, onCaseCreated }: NewCaseFromCustomerModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [formData, setFormData] = useState({
    productId: '',
    loanType: 'Personal Loan',
    loanAmount: '',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const productList = await SupabaseDatabaseService.getProducts({ isActive: true });
      setProducts(productList);
      // Auto-select first product if available
      if (productList.length > 0) {
        setFormData(prev => ({ ...prev, productId: productList[0].id }));
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load loan products. Please try again.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const loanTypes = [
    'Personal Loan',
    'Home Loan',
    'Car Loan',
    'Business Loan',
    'Education Loan',
    'Gold Loan'
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.productId) {
      setError('Please select a loan product');
      return;
    }

    if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) {
      setError('Please enter a valid loan amount');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a case title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ FIXED: Proper type conversion and all required fields
      const caseData = {
        organizationId: Number(user?.organization_id || customer.organizationId),
        customerId: Number(customer.id),           // ✅ Convert to number
        productId: Number(formData.productId),     // ✅ Required field added
        title: formData.title,
        description: formData.description || `${formData.loanType} application`,
        priority: formData.priority,
        assignedTo: Number(user?.id),              // ✅ Convert to number
        loanType: formData.loanType,
        loanAmount: parseFloat(formData.loanAmount)
      };

      console.log('Creating case with proper types:', caseData);
      const result = await SupabaseDatabaseService.createCase(caseData);

      console.log('Case created successfully:', result);
      setSuccess(true);

      // Wait a moment to show success message
      setTimeout(() => {
        onCaseCreated(result);
        onClose();
      }, 1000);

    } catch (err) {
      console.error('Error creating case:', err);
      setError(err instanceof Error ? err.message : 'Failed to create case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Create New Case</span>
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Customer Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-medium">{customer.fullName || customer.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="font-medium">{customer.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="font-medium">{customer.mobile || customer.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">KYC Status:</p>
                <Badge variant={customer.kycStatus === 'verified' ? 'success' : 'warning'} size="sm">
                  {customer.kycStatus}
                </Badge>
              </div>
            </div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <p className="font-semibold">Case created successfully!</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection - REQUIRED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Product * {loadingProducts && <span className="text-xs text-gray-500">(Loading...)</span>}
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={formData.productId}
                  onChange={(e) => handleChange('productId', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loadingProducts}
                >
                  <option value="">Select loan product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.code}) - 
                      {product.interestRate}% interest - 
                      ₹{(product.minAmount / 100000).toFixed(1)}L - ₹{(product.maxAmount / 100000).toFixed(1)}L
                    </option>
                  ))}
                </select>
              </div>
              {products.length === 0 && !loadingProducts && (
                <p className="text-xs text-red-600 mt-1">
                  No active products found. Please contact admin.
                </p>
              )}
            </div>

            {/* Case Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Home Loan Application for Mr. Kumar"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Loan Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Type *
              </label>
              <select
                value={formData.loanType}
                onChange={(e) => handleChange('loanType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {loanTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Loan Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount (₹) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) => handleChange('loanAmount', e.target.value)}
                  placeholder="e.g., 500000"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="1000"
                  step="1000"
                />
              </div>
              {formData.loanAmount && parseFloat(formData.loanAmount) > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  ₹{(parseFloat(formData.loanAmount) / 100000).toFixed(2)} Lakhs
                </p>
              )}
            </div>

            {/* Description/Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description/Purpose
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter case description or loan purpose..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="flex space-x-3">
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handleChange('priority', priority)}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                      formData.priority === priority
                        ? priority === 'high'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : priority === 'medium'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="capitalize">{priority}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || success || !formData.productId || loadingProducts}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Created!
                  </>
                ) : (
                  'Create Case'
                )}
              </Button>
            </div>

            {/* Validation Helper */}
            {!formData.productId && !loadingProducts && (
              <p className="text-xs text-red-600 mt-2">
                Please select a loan product to continue
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

