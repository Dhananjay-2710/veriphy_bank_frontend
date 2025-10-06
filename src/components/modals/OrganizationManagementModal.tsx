import React, { useState, useEffect } from 'react';
import { X, Building2, AlertCircle } from 'lucide-react';
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

interface OrganizationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization?: any; // Organization data for editing
}

export function OrganizationManagementModal({
  isOpen,
  onClose,
  organization 
}: OrganizationManagementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = !!organization;

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
      name: { required: true, message: 'Organization name is required' },
      code: { required: true, message: 'Organization code is required' },
      email: VALIDATION_RULES.email,
      phone: VALIDATION_RULES.phone
    },
    initialValues: {
      name: organization?.name || '',
      code: organization?.code || '',
      description: organization?.description || '',
      email: organization?.email || '',
      phone: organization?.phone || '',
      website: organization?.website || '',
      logoUrl: organization?.logoUrl || '',
      address: organization?.address || '',
      metadata: organization?.metadata || '',
      settings: organization?.settings || '{}',
      isActive: organization?.isActive?.toString() || 'true'
    }
  });

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationResult = validateForm();
    if (!validationResult) {
      setError('Please fix validation errors');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const organizationData = {
        name: values.name,
        code: values.code,
        description: values.description || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        website: values.website || undefined,
        logoUrl: values.logoUrl || undefined,
        address: values.address || undefined,
        metadata: values.metadata || undefined,
        settings: values.settings || '{}',
        isActive: values.isActive === 'true'
      };

      if (isEditing) {
        await SupabaseDatabaseService.updateOrganization(organization.id, organizationData);
        setSuccess('Organization updated successfully!');
      } else {
        await SupabaseDatabaseService.createOrganization(organizationData);
        setSuccess('Organization created successfully!');
      }

      // Close modal after a short delay
      setTimeout(() => {
      onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Error saving organization:', err);
      setError(err.message || 'Failed to save organization');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Organization' : 'Create New Organization'}
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
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2 text-sm text-green-700">{success}</div>
                </div>
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
            label="Organization Name"
            name="name"
                  value={values.name}
                  onChange={(e) => setValue('name', e.target.value)}
                  onBlur={() => validateField('name')}
                  error={errors.name}
                  placeholder="Enter organization name"
                  required
                />

                <ValidatedInput
                  label="Organization Code"
                  name="code"
                  value={values.code}
                  onChange={(e) => setValue('code', e.target.value.toUpperCase())}
                  onBlur={() => validateField('code')}
                  error={errors.code}
                  placeholder="VERIPHY"
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
                  placeholder="info@organization.com"
                />

                <ValidatedInput
                  label="Phone"
                  name="phone"
                  value={values.phone}
                  onChange={(e) => setValue('phone', e.target.value)}
                  onBlur={() => validateField('phone')}
                  error={errors.phone}
                  placeholder="+91-9999999999"
                />

                <ValidatedInput
                  label="Website"
                  name="website"
                  value={values.website}
                  onChange={(e) => setValue('website', e.target.value)}
                  placeholder="https://organization.com"
          />

          <ValidatedInput
                  label="Logo URL"
                  name="logoUrl"
                  value={values.logoUrl}
                  onChange={(e) => setValue('logoUrl', e.target.value)}
                  placeholder="https://organization.com/logo.png"
                />

                <ValidatedInput
                  label="Description"
                  name="description"
                  value={values.description}
                  onChange={(e) => setValue('description', e.target.value)}
                  placeholder="Organization description"
                />

          <ValidatedSelect
            label="Status"
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
              {loading ? 'Saving...' : (isEditing ? 'Update Organization' : 'Create Organization')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}