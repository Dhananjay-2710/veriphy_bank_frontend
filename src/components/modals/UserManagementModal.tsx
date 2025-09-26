import React, { useState, useEffect } from 'react';
import { CrudModal } from '../ui/FormModal';
import { ValidatedInput, ValidatedSelect } from '../ui/FormField';
import { useAuth } from '../../contexts/AuthContextFixed';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: any) => void;
  initialUser?: any;
  mode: 'create' | 'edit' | 'view';
  hasPermission?: boolean;
}

export function UserManagementModal({
  isOpen,
  onClose,
  onSave,
  initialUser,
  mode,
  hasPermission = true
}: UserManagementModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    role: '',
    organization_id: user?.organization_id || '',
    status: 'active',
    department_id: ''
  });
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (initialUser) {
        setFormData({
          full_name: initialUser.full_name || '',
          email: initialUser.email || '',
          mobile: initialUser.mobile || '',
          role: initialUser.role || '',
          organization_id: initialUser.organization_id || user?.organization_id || '',
          status: initialUser.status || 'active',
          department_id: initialUser.department_id || ''
        });
      }
    }
  }, [isOpen, initialUser, user?.organization_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load organizations and departments
      const [orgs, deps] = await Promise.all([
        SupabaseDatabaseService.getOrganizations(),
        SupabaseDatabaseService.getDepartments({ organizationId: user?.organization_id })
      ]);
      
      setOrganizations(orgs);
      setDepartments(deps);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const userData = {
        email: formData.email,
        full_name: formData.full_name,
        mobile: formData.mobile,
        role: formData.role,
        department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
        organization_id: formData.organization_id ? parseInt(formData.organization_id) : undefined,
        status: formData.status
      };
      
      if (mode === 'create') {
        const result = await SupabaseDatabaseService.createUser(userData);
        onSave(result);
      } else if (mode === 'edit' && initialUser?.id) {
        const result = await SupabaseDatabaseService.updateUser(initialUser.id, userData);
        onSave(result);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialUser?.id) return;
    
    try {
      setDeleting(true);
      // Use bulk delete method for single user
      await SupabaseDatabaseService.deleteUsers([initialUser.id]);
      onSave({ deleted: true });
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const userRoles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'salesperson', label: 'Salesperson' },
    { value: 'credit-ops', label: 'Credit Operations' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'auditor', label: 'Auditor' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ];

  return (
    <CrudModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      onDelete={mode === 'edit' ? handleDelete : undefined}
      title={`${mode === 'create' ? 'Create' : mode === 'edit' ? 'Edit' : 'View'} User`}
      initialData={initialUser}
      size="md"
      isLoading={loading}
      isSaving={saving}
      isDeleting={deleting}
      submitText={mode === 'view' ? 'Close' : 'Save'}
      cancelText="Cancel"
      deleteText="Delete User"
      showDelete={mode === 'edit' && hasPermission}
    >
      <div className="space-y-4">
        <ValidatedInput
          label="Full Name"
          name="full_name"
          value={formData.full_name}
          onChange={(e) => handleChange('full_name', e.target.value)}
          required
          disabled={mode === 'view'}
        />

        <ValidatedInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
          disabled={mode === 'view'}
        />

        <ValidatedInput
          label="Mobile"
          name="mobile"
          type="tel"
          value={formData.mobile}
          onChange={(e) => handleChange('mobile', e.target.value)}
          disabled={mode === 'view'}
        />

        <ValidatedSelect
          label="Role"
          name="role"
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value)}
          options={userRoles}
          required
          disabled={mode === 'view'}
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

        <ValidatedSelect
          label="Organization"
          name="organization_id"
          value={formData.organization_id}
          onChange={(e) => handleChange('organization_id', e.target.value)}
          options={organizations.map(org => ({
            value: org.id.toString(),
            label: org.name
          }))}
          required
          disabled={mode === 'view'}
        />

        <ValidatedSelect
          label="Department"
          name="department_id"
          value={formData.department_id}
          onChange={(e) => handleChange('department_id', e.target.value)}
          options={departments.map(dept => ({
            value: dept.id.toString(),
            label: dept.name
          }))}
          disabled={mode === 'view'}
        />

        {mode === 'view' && initialUser && (
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">User ID:</span> {initialUser.id}</p>
              <p><span className="font-medium">Created:</span> {new Date(initialUser.created_at || '').toLocaleDateString()}</p>
              <p><span className="font-medium">Last Updated:</span> {new Date(initialUser.updated_at || '').toLocaleDateString()}</p>
              <p><span className="font-medium">Last Login:</span> {initialUser.last_login_at ? new Date(initialUser.last_login_at).toLocaleDateString() : 'Never'}</p>
            </div>
          </div>
        )}
      </div>
    </CrudModal>
  );
}
