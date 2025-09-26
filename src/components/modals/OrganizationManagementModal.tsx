import React, { useState, useEffect } from 'react';
import { CrudModal } from '../ui/FormModal';
import { ValidatedInput, ValidatedSelect, ValidatedTextarea } from '../ui/FormField';
import { useAuth } from '../../contexts/AuthContextFixed';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface OrganizationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (org: any) => void;
  initialOrganization?: any;
  mode: 'create' | 'edit' | 'view';
  hasPermission?: boolean;
}

export function OrganizationManagementModal({
  isOpen,
  onClose,
  onSave,
  initialOrganization,
  mode,
  hasPermission = true
}: OrganizationManagementModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    description: '',
    address: '',
    contact_info: '',
    max_users: 10,
    max_loans_per_month: 100,
    subscription_plan: 'trial' as 'trial' | 'basic' | 'premium' | 'enterprise',
    status: 'trial',
    features: '{}'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && initialOrganization) {
      setFormData({
        name: initialOrganization.name || '',
        slug: initialOrganization.slug || '',
        domain: initialOrganization.domain || '',
        description: initialOrganization.description || '',
        address: initialOrganization.address ? JSON.stringify(initialOrganization.address) : '',
        contact_info: initialOrganization.contact_info ? JSON.stringify(initialOrganization.contact_info) : '',
        max_users: initialOrganization.maxUsers || initialOrganization.max_users || 10,
        max_loans_per_month: initialOrganization.maxLoansPerMonth || initialOrganization.max_loans_per_month || 100,
        subscription_plan: initialOrganization.subscriptionPlan || initialOrganization.subscription_plan || 'trial',
        status: initialOrganization.status || 'trial',
        features: initialOrganization.features ? JSON.stringify(initialOrganization.features) : '{}'
      });
    }
  }, [isOpen, initialOrganization]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const orgData = {
        ...formData,
        address: formData.address ? JSON.parse(formData.address) : null,
        contact_info: formData.contact_info ? JSON.parse(formData.contact_info) : null,
        features: formData.features ? JSON.parse(formData.features) : {},
        maxUsers: formData.max_users,
        maxLoansPerMonth: formData.max_loans_per_month,
        max_users: formData.max_users,
        max_loans_per_month: formData.max_loans_per_month,
        subscriptionPlan: formData.subscription_plan,
        subscription_plan: formData.subscription_plan
      };
      
      if (mode === 'create') {
        await SupabaseDatabaseService.createOrganization(orgData);
      } else if (mode === 'edit' && initialOrganization?.id) {
        await SupabaseDatabaseService.updateOrganization(initialOrganization.id, orgData);
      }
      
      onSave(orgData);
      onClose();
    } catch (error) {
      console.error('Error saving organization:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialOrganization?.id) return;
    
    try {
      setDeleting(true);
      await SupabaseDatabaseService.deleteOrganization(initialOrganization.id);
      onSave({ deleted: true });
      onClose();
    } catch (error) {
      console.error('Error deleting organization:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const subscriptionPlans = [
    { value: 'trial', label: 'Trial' },
    { value: 'basic', label: 'Basic' },
    { value: 'premium', label: 'Premium' },
    { value: 'enterprise', label: 'Enterprise' }
  ];

  const statusOptions = [
    { value: 'trial', label: 'Trial' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <CrudModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      onDelete={mode === 'edit' ? handleDelete : undefined}
      title={`${mode === 'create' ? 'Create' : mode === 'edit' ? 'Edit' : 'View'} Organization`}
      initialData={initialOrganization}
      size="lg"
      isLoading={loading}
      isSaving={saving}
      isDeleting={deleting}
      submitText={mode === 'view' ? 'Close' : 'Save'}
      cancelText="Cancel"
      deleteText="Delete Organization"
      showDelete={mode === 'edit' && hasPermission}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedInput
            label="Organization Name"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            disabled={mode === 'view'}
            placeholder="Enter organization name"
          />

          <ValidatedInput
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            disabled={mode === 'view'}
            placeholder="organization-slug"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedInput
            label="Domain"
            name="domain"
            value={formData.domain}
            onChange={(e) => handleChange('domain', e.target.value)}
            type="url"
            disabled={mode === 'view'}
            placeholder="example.com"
          />

          <ValidatedSelect
            label="Status"
            name="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
            required
            disabled={mode === 'view'}
          />
        </div>

        <ValidatedTextarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          disabled={mode === 'view'}
          placeholder="Brief description of the organization"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedTextarea
            label="Address (JSON)"
            name="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
            disabled={mode === 'view'}
            placeholder='{"street": "123 Main St", "city": "City", "state": "State"}'
          />

          <ValidatedTextarea
            label="Contact Info (JSON)"
            name="contact_info"
            value={formData.contact_info}
            onChange={(e) => handleChange('contact_info', e.target.value)}
            rows={3}
            disabled={mode === 'view'}
            placeholder='{"phone": "+1234567890", "email": "contact@example.com"}'
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ValidatedInput
            label="Max Users"
            name="max_users"
            type="number"
            value={formData.max_users.toString()}
            onChange={(e) => handleChange('max_users', e.target.value)}
            required
            disabled={mode === 'view'}
            min="1"
          />

          <ValidatedInput
            label="Max Loans/Month"
            name="max_loans_per_month"
            type="number"
            value={formData.max_loans_per_month.toString()}
            onChange={(e) => handleChange('max_loans_per_month', e.target.value)}
            required
            disabled={mode === 'view'}
            min="1"
          />

          <ValidatedSelect
            label="Subscription Plan"
            name="subscription_plan"
            value={formData.subscription_plan}
            onChange={(e) => handleChange('subscription_plan', e.target.value)}
            options={subscriptionPlans}
            required
            disabled={mode === 'view'}
          />
        </div>

        <ValidatedTextarea
          label="Features (JSON)"
          name="features"
          value={formData.features}
          onChange={(e) => handleChange('features', e.target.value)}
          rows={3}
          disabled={mode === 'view'}
          placeholder='{"basic_features": true, "advanced_features": false}'
        />

        {mode === 'view' && initialOrganization && (
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Organization ID:</span> {initialOrganization.id}</p>
              <p><span className="font-medium">Created:</span> {new Date(initialOrganization.created_at || '').toLocaleDateString()}</p>
              <p><span className="font-medium">Last Updated:</span> {new Date(initialOrganization.updated_at || '').toLocaleDateString()}</p>
              {initialOrganization.trial_ends_at && (
                <p><span className="font-medium">Trial Ends:</span> {new Date(initialOrganization.trial_ends_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </CrudModal>
  );
}
