import React, { useState, useEffect, useRef } from 'react';
import { CrudModal } from '../ui/FormModal';
import { ValidatedInput, ValidatedSelect, ValidatedTextarea } from '../ui/FormField';
import { useAuth } from '../../contexts/AuthContextFixed';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { Upload, FileText } from 'lucide-react';

interface DocumentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: any) => void;
  initialDocument?: any;
  mode: 'create' | 'edit' | 'view';
  hasPermission?: boolean;
  caseId?: string;
  customerId?: string;
}

export function DocumentManagementModal({
  isOpen,
  onClose,
  onSave,
  initialDocument,
  mode,
  hasPermission = true,
  caseId,
  customerId
}: DocumentManagementModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    file_name: '',
    file_path: '',
    file_size: 0,
    file_type: '',
    file_id: '',
    customer_id: customerId || '',
    case_id: caseId || '',
    document_type_id: '',
    category: 'identity',
    status: 'pending',
    notes: '',
    uploaded_by: user?.id || '',
    verified_by: '',
    organization_id: user?.organization_id || ''
  });
  const [documentTypes, setDocumentTypes] = useState([]);
  const [fixedFile, setFixedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (initialDocument) {
        setFormData({
          file_name: initialDocument.file_name || '',
          file_path: initialDocument.file_path || '',
          file_size: initialDocument.file_size || 0,
          file_type: initialDocument.file_type || '',
          file_id: initialDocument.file_id || '',
          customer_id: initialDocument.customer_id || customerId || '',
          case_id: initialDocument.case_id || caseId || '',
          document_type_id: initialDocument.document_type_id || '',
          category: initialDocument.category || 'identity',
          status: initialDocument.status || 'pending',
          notes: initialDocument.notes || '',
          uploaded_by: initialDocument.uploaded_by || user?.id || '',
          verified_by: initialDocument.verified_by || '',
          organization_id: initialDocument.organization_id || user?.organization_id || ''
        });
      }
    }
  }, [isOpen, initialDocument, caseId, customerId, user?.id, user?.organization_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load document types
      const documentTypesData = await SupabaseDatabaseService.getDocumentTypes();
      setDocumentTypes(documentTypesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // Create file metadata for document
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documents/${fileName}`;
      
      // Upload file metadata to database (actual file storage would be handled by Supabase client library)
      const uploadFileData = {
        fileName: fileName,
        originalName: file.name,
        filePath: filePath,
        fileSize: file.size,
        mimeType: file.type,
        fileType: fileExt || 'unknown',
        uploaderId: user?.id || '',
        isPublic: false
      };
      
      const uploadData = await SupabaseDatabaseService.uploadFile(uploadFileData);
      
      // Update form data with file information
      setFormData(prev => ({
        ...prev,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        file_id: uploadData?.id || ''
      }));
      
      setFixedFile(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const documentData = {
        ...formData,
        file_size: Number(formData.file_size)
      };
      
      if (mode === 'create') {
        await SupabaseDatabaseService.createDocument(documentData);
      } else if (mode === 'edit' && initialDocument?.id) {
        await SupabaseDatabaseService.updateDocument(initialDocument.id, documentData);
      }
      
      onSave(documentData);
      onClose();
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialDocument?.id) return;
    
    try {
      setDeleting(true);
      await SupabaseDatabaseService.deleteDocument(initialDocument.id);
      
      // Also delete the file from storage
      if (initialDocument.file_path) {
        await SupabaseDatabaseService.deleteFile(initialDocument.file_path);
      }
      
      onSave({ deleted: true });
      onClose();
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const documentCategories = [
    { value: 'identity', label: 'Identity' },
    { value: 'financial', label: 'Financial' },
    { value: 'business', label: 'Business' },
    { value: 'property', label: 'Property' },
    { value: 'employment', label: 'Employment' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'under_review', label: 'Under Review' }
  ];

  const fileTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'jpg', label: 'JPG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'doc', label: 'DOC' },
    { value: 'docx', label: 'DOCX' },
    { value: 'xls', label: 'XLS' },
    { value: 'xlsx', label: 'XLSX' }
  ];

  return (
    <CrudModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      onDelete={mode === 'edit' ? handleDelete : undefined}
      title={`${mode === 'create' ? 'Upload' : mode === 'edit' ? 'Edit' : 'View'} Document`}
      initialData={initialDocument}
      size="lg"
      isLoading={loading}
      isSaving={saving || uploading}
      isDeleting={deleting}
      submitText={mode === 'view' ? 'Close' : 'Save'}
      cancelText="Cancel"
      deleteText="Delete Document"
      showDelete={mode === 'edit' && hasPermission}
    >
      <div className="space-y-4">
        {/* File Upload Section */}
        {(mode === 'create' || !initialDocument) && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                className="hidden"
                disabled={mode === 'view' || uploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={mode === 'view' || uploading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {fixedFile ? 'Change File' : 'Upload Document'}
              </button>
              {fixedFile && (
                <div className="mt-2 flex items-center justify-center text-sm text-green-600">
                  <FileText className="w-4 h-4 mr-1" />
                  {fixedFile.name}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedInput
            label="File Name"
            name="file_name"
            value={formData.file_name}
            onChange={(e) => handleChange('file_name', e.target.value)}
            disabled={mode === 'view'}
            placeholder="Document file name"
          />

          <ValidatedSelect
            label="File Type"
            name="file_type"
            value={formData.file_type}
            onChange={(e) => handleChange('file_type', e.target.value)}
            options={fileTypes}
            disabled={mode === 'view' || fixedFile !== null}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedSelect
            label="Document Type"
            name="document_type_id"
            value={formData.document_type_id}
            onChange={(e) => handleChange('document_type_id', e.target.value)}
            options={documentTypes.map(type => ({
              value: type.id.toString(),
              label: type.name
            }))}
            required
            disabled={mode === 'view'}
          />

          <ValidatedSelect
            label="Category"
            name="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            options={documentCategories}
            required
            disabled={mode === 'view'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedInput
            label="Customer ID"
            name="customer_id"
            value={formData.customer_id}
            onChange={(e) => handleChange('customer_id', e.target.value)}
            disabled={mode === 'view' || customerId !== undefined}
          />

          <ValidatedInput
            label="Case ID"
            name="case_id"
            value={formData.case_id}
            onChange={(e) => handleChange('case_id', e.target.value)}
            disabled={mode === 'view' || caseId !== undefined}
          />
        </div>

        <ValidatedSelect
          label="Status"
          name="status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={statusOptions}
          required
          disabled={mode === 'view'}
        />

        <ValidatedTextarea
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          disabled={mode === 'view'}
          placeholder="Additional notes about the document..."
        />

        {mode === 'view' && initialDocument && (
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Document Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">File Size:</span> {initialDocument.file_size ? Math.round(initialDocument.file_size / 1024) + ' KB' : 'N/A'}</p>
              <p><span className="font-medium">File Path:</span> {initialDocument.file_path || 'N/A'}</p>
              <p><span className="font-medium">Uploaded By:</span> {initialDocument.uploaded_by || 'N/A'}</p>
              <p><span className="font-medium">Uploaded:</span> {initialDocument.created_at ? new Date(initialDocument.created_at).toLocaleDateString() : 'N/A'}</p>
              {initialDocument.verified_by && (
                <p><span className="font-medium">Verified By:</span> {initialDocument.verified_by}</p>
              )}
              {initialDocument.verified_on && (
                <p><span className="font-medium">Verified On:</span> {new Date(initialDocument.verified_on).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </CrudModal>
  );
}
