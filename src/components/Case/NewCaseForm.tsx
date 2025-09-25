import React, { useState } from 'react';
import { X, User, Phone, Mail, DollarSign, FileText, CreditCard, MapPin, Briefcase, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { useAuth } from '../../contexts/AuthContextFixed';

interface NewCaseFormProps {
  onClose: () => void;
  onCaseCreated: (caseData: any) => void;
}

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  panNumber: string;
  aadhaarNumber: string;
  monthlyIncome: number;
  employmentType: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface LoanData {
  loanType: string;
  loanAmount: number;
  purpose: string;
  tenure: number;
  priority: 'low' | 'medium' | 'high';
}

export function NewCaseForm({ onClose, onCaseCreated }: NewCaseFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    panNumber: '',
    aadhaarNumber: '',
    monthlyIncome: 0,
    employmentType: 'salaried',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  const [loanData, setLoanData] = useState<LoanData>({
    loanType: 'Personal Loan',
    loanAmount: 0,
    purpose: '',
    tenure: 12,
    priority: 'medium'
  });

  const loanTypes = [
    'Personal Loan',
    'Home Loan',
    'Car Loan',
    'Business Loan',
    'Education Loan',
    'Gold Loan'
  ];

  const employmentTypes = [
    'salaried',
    'self-employed',
    'business',
    'freelancer',
    'retired',
    'unemployed'
  ];

  const handleCustomerDataChange = (field: keyof CustomerData, value: any) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: keyof CustomerData['address'], value: string) => {
    setCustomerData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleLoanDataChange = (field: keyof LoanData, value: any) => {
    setLoanData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    return (
      customerData.firstName.trim() &&
      customerData.lastName.trim() &&
      customerData.email.trim() &&
      customerData.phone.trim() &&
      customerData.panNumber.trim() &&
      customerData.aadhaarNumber.trim()
    );
  };

  const validateStep2 = () => {
    return (
      loanData.loanAmount > 0 &&
      loanData.purpose.trim() &&
      loanData.tenure > 0
    );
  };

  const handleSubmit = async () => {
    if (!user?.organizationId) {
      setError('Organization not found. Please contact support.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create customer
      console.log('Creating customer with data:', customerData);
      const customerResult = await SupabaseDatabaseService.createCustomer({
        ...customerData,
        address: customerData.address,
        organizationId: user.organizationId
      });

      console.log('Customer created:', customerResult);

      // Step 2: Create case
      const customerId = customerResult.customerDetails?.id;
      if (!customerId) {
        throw new Error('Failed to get customer ID after creation');
      }

      console.log('Creating case with customer ID:', customerId);
      const caseResult = await SupabaseDatabaseService.createCase({
        customerId: customerId,
        loanType: loanData.loanType,
        loanAmount: loanData.loanAmount,
        assignedTo: user.id,
        priority: loanData.priority,
        organizationId: user.organizationId
      });

      console.log('Case created:', caseResult);

      // Success callback
      onCaseCreated({
        case: caseResult,
        customer: customerResult
      });

      onClose();
    } catch (err) {
      console.error('Error creating case:', err);
      setError(err instanceof Error ? err.message : 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Case</h2>
            <p className="text-sm text-gray-600">Add customer and loan application details</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className="ml-2">
                  <span className={`text-sm font-medium ${
                    step >= stepNumber ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stepNumber === 1 ? 'Customer Info' : stepNumber === 2 ? 'Loan Details' : 'Review'}
                  </span>
                </div>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 ml-4 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Customer Information */}
          {step === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={customerData.firstName}
                      onChange={(e) => handleCustomerDataChange('firstName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={customerData.lastName}
                      onChange={(e) => handleCustomerDataChange('lastName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => handleCustomerDataChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => handleCustomerDataChange('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={customerData.dateOfBirth}
                      onChange={(e) => handleCustomerDataChange('dateOfBirth', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Type
                    </label>
                    <select
                      value={customerData.employmentType}
                      onChange={(e) => handleCustomerDataChange('employmentType', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {employmentTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Identity & Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number *
                    </label>
                    <input
                      type="text"
                      value={customerData.panNumber}
                      onChange={(e) => handleCustomerDataChange('panNumber', e.target.value.toUpperCase())}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number *
                    </label>
                    <input
                      type="text"
                      value={customerData.aadhaarNumber}
                      onChange={(e) => handleCustomerDataChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1234 5678 9012"
                      maxLength={12}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Income (₹)
                    </label>
                    <input
                      type="number"
                      value={customerData.monthlyIncome}
                      onChange={(e) => handleCustomerDataChange('monthlyIncome', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter monthly income"
                      min="0"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Address Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={customerData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={customerData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={customerData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={customerData.address.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter PIN code"
                      maxLength={6}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Loan Details */}
          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Loan Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Type *
                    </label>
                    <select
                      value={loanData.loanType}
                      onChange={(e) => handleLoanDataChange('loanType', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {loanTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Amount (₹) *
                    </label>
                    <input
                      type="number"
                      value={loanData.loanAmount}
                      onChange={(e) => handleLoanDataChange('loanAmount', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter loan amount"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tenure (Months) *
                    </label>
                    <input
                      type="number"
                      value={loanData.tenure}
                      onChange={(e) => handleLoanDataChange('tenure', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter tenure in months"
                      min="1"
                      max="360"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={loanData.priority}
                      onChange={(e) => handleLoanDataChange('priority', e.target.value as 'low' | 'medium' | 'high')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Purpose *
                    </label>
                    <textarea
                      value={loanData.purpose}
                      onChange={(e) => handleLoanDataChange('purpose', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe the purpose of the loan"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Summary */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{customerData.firstName} {customerData.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{customerData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{customerData.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">PAN</p>
                        <p className="font-medium">{customerData.panNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Monthly Income</p>
                        <p className="font-medium">₹{customerData.monthlyIncome.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Employment</p>
                        <p className="font-medium">{customerData.employmentType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Loan Summary */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Loan Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Loan Type</p>
                        <p className="font-medium">{loanData.loanType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-medium">₹{loanData.loanAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tenure</p>
                        <p className="font-medium">{loanData.tenure} months</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Priority</p>
                        <Badge variant={loanData.priority === 'high' ? 'error' : loanData.priority === 'medium' ? 'warning' : 'default'}>
                          {loanData.priority}
                        </Badge>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Purpose</p>
                        <p className="font-medium">{loanData.purpose}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button 
                onClick={nextStep}
                disabled={step === 1 ? !validateStep1() : !validateStep2()}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Case'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
