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

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export function UserManagementModal({ isOpen, onClose, user }: UserManagementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dropdown data states
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<any[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const isEditing = !!user;

  const {
    values,
    errors,
    isValid,
    setValue,
    validateField,
    handleSubmit: validateForm,
    reset: resetForm
  } = useFormValidation({
    validationRules: {
      fullName: { required: true, message: 'Full name is required' },
      email: VALIDATION_RULES.email,
      mobile: VALIDATION_RULES.phone,
      role: { required: true, message: 'Role is required' }
    },
    initialValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      phone: user?.phone || '',
      role: user?.role || 'salesperson',
      departmentId: user?.departmentId?.toString() || '',
      organizationId: user?.organizationId?.toString() || '',
      employmentTypeId: user?.employmentTypeId?.toString() || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      passwordHash: user?.passwordHash || '',
      isActive: user?.isActive?.toString() || 'true',
      status: user?.status || 'active'
    }
  });

  // Fetch dropdown data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
      resetForm();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, user]);

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [orgsData, deptsData, empTypesData] = await Promise.all([
        SupabaseDatabaseService.getOrganizations(),
        SupabaseDatabaseService.getDepartments(),
        SupabaseDatabaseService.getEmploymentTypes()
      ]);
      
      setOrganizations(orgsData || []);
      setDepartments(deptsData || []);
      setEmploymentTypes(empTypesData || []);
      
      console.log('📋 Dropdown data loaded:', {
        organizations: orgsData?.length,
        departments: deptsData?.length,
        employmentTypes: empTypesData?.length
      });
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      setError('Failed to load dropdown options');
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if form is valid
    if (!isValid) {
      setError('Please fix validation errors before submitting');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userData = {
        fullName: values.fullName,
        email: values.email,
        mobile: values.mobile || undefined,
        phone: values.phone || undefined,
        role: values.role,
        departmentId: values.departmentId ? parseInt(values.departmentId) : undefined,
        organizationId: values.organizationId ? parseInt(values.organizationId) : undefined,
        employmentTypeId: values.employmentTypeId ? parseInt(values.employmentTypeId) : undefined,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        passwordHash: values.passwordHash || undefined,
        isActive: values.isActive === 'true',
        status: values.status
      };

      console.log('💾 Submitting user data:', {
        action: isEditing ? 'UPDATE' : 'CREATE',
        userId: user?.id,
        userData
      });

      if (isEditing) {
        await SupabaseDatabaseService.updateUser(user.id, userData);
        console.log('✅ User updated successfully:', user.id);
        setSuccess('User updated successfully!');
      } else {
        const createdUser = await SupabaseDatabaseService.createUser(userData);
        console.log('✅ User created successfully:', createdUser);
        setSuccess('User created successfully!');
      }

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error('❌ Error saving user:', err);
      const errorMessage = err.message || 'Failed to save user. Please check your input and try again.';
      setError(errorMessage);
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
              {isEditing ? 'Edit User' : 'Create New User'}
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
          {/* Loading Dropdowns Indicator */}
          {loadingDropdowns && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <p className="text-sm text-blue-800">Loading form options...</p>
              </div>
            </div>
          )}

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
                  placeholder="user@example.com"
          required
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
                  label="Phone"
                  name="phone"
                  value={values.phone}
                  onChange={(e) => setValue('phone', e.target.value)}
                  placeholder="+91-9999999999"
                />

                <ValidatedInput
                  label="First Name"
                  name="firstName"
                  value={values.firstName}
                  onChange={(e) => setValue('firstName', e.target.value)}
                  placeholder="First name"
                />

                <ValidatedInput
                  label="Last Name"
                  name="lastName"
                  value={values.lastName}
                  onChange={(e) => setValue('lastName', e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Role & Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Role & Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ValidatedSelect
          label="Role"
          name="role"
                  value={values.role}
                  onChange={(e) => setValue('role', e.target.value)}
                  error={errors.role}
                  options={[
                    { value: 'super_admin', label: 'Super Admin' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'salesperson', label: 'Salesperson' },
                    { value: 'credit_ops', label: 'Credit Ops' },
                    { value: 'compliance', label: 'Compliance' },
                    { value: 'auditor', label: 'Auditor' }
                  ]}
          required
                />

                <ValidatedSelect
                  label="Organization"
                  name="organizationId"
                  value={values.organizationId}
                  onChange={(e) => setValue('organizationId', e.target.value)}
                  options={[
                    { value: '', label: 'Select Organization' },
                    ...organizations.map(org => ({
                      value: org.id.toString(),
                      label: org.name
                    }))
                  ]}
                  disabled={loadingDropdowns}
                />

                <ValidatedSelect
                  label="Department"
                  name="departmentId"
                  value={values.departmentId}
                  onChange={(e) => setValue('departmentId', e.target.value)}
                  options={[
                    { value: '', label: 'Select Department' },
                    ...departments.map(dept => ({
                      value: dept.id.toString(),
                      label: dept.name
                    }))
                  ]}
                  disabled={loadingDropdowns}
                />

                <ValidatedSelect
                  label="Employment Type"
                  name="employmentTypeId"
                  value={values.employmentTypeId}
                  onChange={(e) => setValue('employmentTypeId', e.target.value)}
                  options={[
                    { value: '', label: 'Select Employment Type' },
                    ...employmentTypes.map(empType => ({
                      value: empType.id.toString(),
                      label: empType.name
                    }))
                  ]}
                  disabled={loadingDropdowns}
        />

        <ValidatedSelect
          label="Status"
          name="status"
                  value={values.status}
                  onChange={(e) => setValue('status', e.target.value)}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'pending', label: 'Pending' }
                  ]}
        />

        <ValidatedSelect
                  label="Is Active"
                  name="isActive"
                  value={values.isActive}
                  onChange={(e) => setValue('isActive', e.target.value)}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ValidatedInput
                  label="Password"
                  name="passwordHash"
                  type="password"
                  value={values.passwordHash}
                  onChange={(e) => setValue('passwordHash', e.target.value)}
                  placeholder="Enter initial password (optional - defaults to 'default123')"
                />
                <p className="text-sm text-gray-500">
                  💡 Leave blank to use default password. User will be prompted to change on first login.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Validation Summary */}
          <ValidationSummary errors={errors} />

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading || loadingDropdowns}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isValid || loadingDropdowns}
            >
              {loading ? 'Saving...' : loadingDropdowns ? 'Loading...' : (isEditing ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}