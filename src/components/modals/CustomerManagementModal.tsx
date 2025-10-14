import React, { useState, useEffect } from 'react';
import { X, Users, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { 
  ValidatedInput, 
  ValidatedSelect, 
  ValidationSummary
} from '../ui/FormField';
import { useFormValidation } from '../../hooks/useFormValidation';
import { VALIDATION_RULES } from '../../utils/validation';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface CustomerManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
}

export function CustomerManagementModal({ isOpen, onClose, customer }: CustomerManagementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = !!customer;

  const {
    values,
    errors,
    isValid,
    setValue,
    validateField,
    reset: resetForm
  } = useFormValidation({
    validationRules: {
      fullName: { required: true, message: 'Full name is required' },
      email: VALIDATION_RULES.email,
      mobile: VALIDATION_RULES.phone
    },
    initialValues: {
      fullName: customer?.fullName || '',
      email: customer?.email || '',
      mobile: customer?.mobile || '',
      address: customer?.address || '',
      externalCustomerCode: customer?.externalCustomerCode || '',
      kycStatus: customer?.kycStatus || 'pending',
      organizationId: customer?.organizationId?.toString() || '',
      panNumber: customer?.panNumber || '',
      aadhaarNumber: customer?.aadhaarNumber || '',
      dob: customer?.dob || '',
      gender: customer?.gender || '',
      maritalStatus: customer?.maritalStatus || '',
      employmentType: customer?.employmentType || '',
      riskProfile: customer?.riskProfile || 'medium',
      userId: customer?.userId?.toString() || ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, customer]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if form is valid
    if (!isValid) {
      setError('Please fix validation errors');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const customerData = {
        fullName: values.fullName,
        email: values.email || undefined,
        mobile: values.mobile || undefined,
        address: values.address || undefined,
        externalCustomerCode: values.externalCustomerCode || undefined,
        kycStatus: values.kycStatus,
        organizationId: values.organizationId ? parseInt(values.organizationId) : undefined,
        panNumber: values.panNumber || undefined,
        aadhaarNumber: values.aadhaarNumber || undefined,
        dob: values.dob || undefined,
        gender: values.gender || undefined,
        maritalStatus: values.maritalStatus || undefined,
        employmentType: values.employmentType || undefined,
        riskProfile: values.riskProfile,
        userId: values.userId ? parseInt(values.userId) : undefined
      };

      if (isEditing) {
        await SupabaseDatabaseService.updateCustomer(customer.id, customerData);
        setSuccess('Customer updated successfully!');
      } else {
        await SupabaseDatabaseService.createCustomer(customerData);
        setSuccess('Customer created successfully!');
      }

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving customer:', err);
      setError(err.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Customer' : 'Create New Customer'}
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Full Name"
                  name="fullName"
                  value={values.fullName}
                  onChange={(e) => setValue('fullName', e.target.value)}
                  onBlur={() => validateField('fullName')}
                  error={errors.fullName}
                  placeholder="Enter full name"
                  required
                />

                <ValidatedInput
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={(e) => setValue('email', e.target.value)}
                  onBlur={() => validateField('email')}
                  error={errors.email}
                  placeholder="customer@example.com"
                />

                <ValidatedInput
                  label="Mobile"
                  name="mobile"
                  value={values.mobile}
                  onChange={(e) => setValue('mobile', e.target.value)}
                  onBlur={() => validateField('mobile')}
                  error={errors.mobile}
                  placeholder="+91-9999999999"
                />

                <ValidatedInput
                  label="Address"
                  name="address"
                  value={values.address}
                  onChange={(e) => setValue('address', e.target.value)}
                  placeholder="Customer address"
                />

                <ValidatedInput
                  label="External Customer Code"
                  name="externalCustomerCode"
                  value={values.externalCustomerCode}
                  onChange={(e) => setValue('externalCustomerCode', e.target.value)}
                  placeholder="External reference code"
                />
              </div>
            </CardContent>
          </Card>

          {/* Identity Information */}
          <Card>
            <CardHeader>
              <CardTitle>Identity Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="PAN Number"
                  name="panNumber"
                  value={values.panNumber}
                  onChange={(e) => setValue('panNumber', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                />

                <ValidatedInput
                  label="Aadhaar Number"
                  name="aadhaarNumber"
                  value={values.aadhaarNumber}
                  onChange={(e) => setValue('aadhaarNumber', e.target.value)}
                  placeholder="123456789012"
                />

                <ValidatedInput
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={values.dob}
                  onChange={(e) => setValue('dob', e.target.value)}
                  placeholder="YYYY-MM-DD"
                />

                <ValidatedSelect
                  label="Gender"
                  name="gender"
                  value={values.gender}
                  onChange={(e) => setValue('gender', e.target.value)}
                  options={[
                    { value: '', label: 'Select Gender' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' }
                  ]}
                />

                <ValidatedSelect
                  label="Marital Status"
                  name="maritalStatus"
                  value={values.maritalStatus}
                  onChange={(e) => setValue('maritalStatus', e.target.value)}
                  options={[
                    { value: '', label: 'Select Marital Status' },
                    { value: 'single', label: 'Single' },
                    { value: 'married', label: 'Married' },
                    { value: 'divorced', label: 'Divorced' },
                    { value: 'widowed', label: 'Widowed' }
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Employment & Risk */}
          <Card>
            <CardHeader>
              <CardTitle>Employment & Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedSelect
                  label="Employment Type"
                  name="employmentType"
                  value={values.employmentType}
                  onChange={(e) => setValue('employmentType', e.target.value)}
                  options={[
                    { value: '', label: 'Select Employment Type' },
                    { value: 'salaried', label: 'Salaried' },
                    { value: 'self_employed', label: 'Self Employed' },
                    { value: 'business', label: 'Business' },
                    { value: 'retired', label: 'Retired' },
                    { value: 'student', label: 'Student' },
                    { value: 'unemployed', label: 'Unemployed' }
                  ]}
                />

                <ValidatedSelect
                  label="Risk Profile"
                  name="riskProfile"
                  value={values.riskProfile}
                  onChange={(e) => setValue('riskProfile', e.target.value)}
                  options={[
                    { value: 'low', label: 'Low Risk' },
                    { value: 'medium', label: 'Medium Risk' },
                    { value: 'high', label: 'High Risk' }
                  ]}
                />

                <ValidatedSelect
                  label="KYC Status"
                  name="kycStatus"
                  value={values.kycStatus}
                  onChange={(e) => setValue('kycStatus', e.target.value)}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'verified', label: 'Verified' },
                    { value: 'rejected', label: 'Rejected' }
                  ]}
                />

                <ValidatedInput
                  label="Organization ID"
                  name="organizationId"
                  type="number"
                  value={values.organizationId}
                  onChange={(e) => setValue('organizationId', e.target.value)}
                  placeholder="Organization ID"
                />

                <ValidatedInput
                  label="User ID"
                  name="userId"
                  type="number"
                  value={values.userId}
                  onChange={(e) => setValue('userId', e.target.value)}
                  placeholder="Associated User ID"
                />
              </div>
            </CardContent>
          </Card>

          {/* Validation Summary */}
          <ValidationSummary errors={errors} />

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isValid}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Customer' : 'Create Customer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}