import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Modal, ModalContent, ModalFooter } from './Modal';
import { ValidatedInput, ValidatedSelect, ValidatedTextarea } from './FormField';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  initialData?: any;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  children,
  size = 'md',
  isLoading = false,
  submitText = 'Save',
  cancelText = 'Cancel'
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(initialData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      isLoading={isLoading}
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ModalContent>
          {children}
        </ModalContent>
        
        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            isLoading={isLoading}
          >
            {submitText}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: (id: string) => void;
  title: string;
  initialData?: any;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isLoading?: boolean;
  isSaving?: boolean;
  isDeleting?: boolean;
  submitText?: string;
  cancelText?: string;
  deleteText?: string;
  showDelete?: boolean;
}

export function CrudModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  title,
  initialData,
  children,
  size = 'md',
  isLoading = false,
  isSaving = false,
  isDeleting = false,
  submitText = 'Save',
  cancelText = 'Cancel',
  deleteText = 'Delete',
  showDelete = false
}: CrudModalProps) {
  const [data, setData] = useState(initialData || {});

  useEffect(() => {
    setData(initialData || {});
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  const handleDelete = () => {
    if (data?.id && onDelete) {
      onDelete(data.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      isLoading={isLoading}
      showCloseButton={!isLoading}
    >
      <div className="space-y-4">
        <ModalContent>
          <div className="space-y-4">
            {children}
          </div>
        </ModalContent>
        
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSaving || isDeleting}
          >
            {cancelText}
          </Button>
          {showDelete && data?.id && (
            <Button 
              variant="error" 
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              isLoading={isDeleting}
            >
              {deleteText}
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            isLoading={isSaving}
          >
            {submitText}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'select' | 'textarea' | 'number';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  validation?: any;
}

interface DynamicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  fields: FieldConfig[];
  initialData?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isLoading?: boolean;
  isSaving?: boolean;
  submitText?: string;
  cancelText?: string;
}

export function DynamicFormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  initialData,
  size = 'md',
  isLoading = false,
  isSaving = false,
  submitText = 'Save',
  cancelText = 'Cancel'
}: DynamicFormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData, isOpen]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field: FieldConfig) => {
    const commonProps = {
      name: field.name,
      label: field.label,
      value: formData[field.name] || '',
      onChange: (value: any) => handleChange(field.name, value),
      placeholder: field.placeholder,
      required: field.required,
      validation: field.validation,
      className: "w-full"
    };

    switch (field.type) {
      case 'select':
        return (
          <ValidatedSelect
            {...commonProps}
            options={field.options || []}
          />
        );
      case 'textarea':
        return (
          <ValidatedTextarea
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => { handleChange(field.name, e.target.value); }}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
            containerClassName="w-full"
          />
        );
      default:
        return (
          <ValidatedInput
            {...commonProps}
            type={field.type}
          />
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      isLoading={isLoading}
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ModalContent>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="form-field">
                {renderField(field)}
              </div>
            ))}
          </div>
        </ModalContent>
        
        <ModalFooter>
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose} 
            disabled={isSaving}
          >
            {cancelText}
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving}
            isLoading={isSaving}
          >
            {submitText}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
