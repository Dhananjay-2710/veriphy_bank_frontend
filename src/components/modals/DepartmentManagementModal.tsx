import React, { useState, useEffect } from 'react';
import { X, Building2, Save, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { 
  ValidatedInput, 
  ValidatedSelect, 
  ValidationSummary,
  FormActions 
} from '../ui/FormField';
import { useFormValidation } from '../../hooks/useFormValidation';
import { VALIDATION_RULES } from '../../utils/validation';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface DepartmentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: any; // Department data for editing
}

export function DepartmentManagementModal({ 
  isOpen, 
  onClose, 
  department 
}: DepartmentManagementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);

  const isEditing = !!department;

  const {
    values,
    errors,
    isValid,
    setValue,
    validateField,
    validateForm,
    resetForm
  } = useFormValidation({
    name: department?.name || '',
    code: department?.code || '',
    description: department?.description || '',
    departmentType: department?.department_type || 'sales',
    organizationId: department?.organization_id?.toString() || '',
    isActive: department?.is_active?.toString() || 'true'
  }, {
    name: VALIDATION_RULES.required,
    code: VALIDATION_RULES.required,
    organizationId: VALIDATION_RULES.required
  });

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setError(null);
      setSuccess(null);
      loadOrganizations();
    }
  }, [isOpen, department]);

  const loadOrganizations = async () => {
    try {
      const orgs = await SupabaseDatabaseService.getOrganizations();
      setOrganizations(orgs);
    } catch (err) {
      console.error('Error loading organizations:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix validation errors');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const departmentData = {
        name: values.name,
        code: values.code,
        description: values.description || undefined,
        departmentType: values.departmentType as 'sales' | 'credit_ops' | 'compliance' | 'admin' | 'support',
        organizationId: values.organizationId
      };

      if (isEditing) {
        await SupabaseDatabaseService.updateDepartment(department.id, {
          ...departmentData,
          isActive: values.isActive === 'true'
        });
        setSuccess('Department updated successfully!');
      } else {
        await SupabaseDatabaseService.createDepartment(departmentData);
        setSuccess('Department created successfully!');
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Error saving department:', err);
      setError(err.message || 'Failed to save department');
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Department' : 'Create New Department'}
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
              <CardTitle>Department Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Department Name"
                  name="name"
                  value={values.name}
                  onChange={(e) => setValue('name', e.target.value)}
                  onBlur={() => validateField('name')}
                  error={errors.name}
                  placeholder="Enter department name"
                  required
                />

                <ValidatedInput
                  label="Department Code"
                  name="code"
                  value={values.code}
                  onChange={(e) => setValue('code', e.target.value.toUpperCase())}
                  onBlur={() => validateField('code')}
                  error={errors.code}
                  placeholder="SALES, CREDIT, etc."
                  required
                />

                <ValidatedSelect
                  label="Organization"
                  name="organizationId"
                  value={values.organizationId}
                  onChange={(e) => setValue('organizationId', e.target.value)}
                  onBlur={() => validateField('organizationId')}
                  error={errors.organizationId}
                  options={organizations.map(org => ({
                    value: org.id.toString(),
                    label: org.name
                  }))}
                  placeholder="Select organization"
                  required
                />

                <ValidatedSelect
                  label="Department Type"
                  name="departmentType"
                  value={values.departmentType}
                  onChange={(e) => setValue('departmentType', e.target.value)}
                  error={errors.departmentType}
                  options={[
                    { value: 'sales', label: 'Sales' },
                    { value: 'credit_ops', label: 'Credit Operations' },
                    { value: 'compliance', label: 'Compliance' },
                    { value: 'admin', label: 'Administration' },
                    { value: 'support', label: 'Support' }
                  ]}
                />
              </div>

              <ValidatedInput
                label="Description"
                name="description"
                value={values.description}
                onChange={(e) => setValue('description', e.target.value)}
                placeholder="Department description"
                multiline
                rows={3}
              />

              {isEditing && (
                <ValidatedSelect
                  label="Status"
                  name="isActive"
                  value={values.isActive}
                  onChange={(e) => setValue('isActive', e.target.value)}
                  error={errors.isActive}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                />
              )}
            </CardContent>
          </Card>

          {/* Validation Summary */}
          <ValidationSummary errors={errors} />

          {/* Form Actions */}
          <FormActions
            onCancel={handleClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Update Department' : 'Create Department'}
            loading={loading}
            disabled={!isValid}
          />
        </form>
      </div>
    </div>
  );
}
