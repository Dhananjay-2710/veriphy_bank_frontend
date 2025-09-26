import React, { ReactNode } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isLoading?: boolean;
  showCloseButton?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  isLoading = false,
  showCloseButton = true 
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div 
          className={`
            inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle
            ${sizeClasses[size]} w-full sm:w-full
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModalContentProps {
  children: ReactNode;
}

export function ModalContent({ children }: ModalContentProps) {
  return <div className="bg-white px-6 py-4">{children}</div>;
}

interface ModalFooterProps {
  children: ReactNode;
  align?: 'left' | 'right' | 'center' | 'between';
}

export function ModalFooter({ children, align = 'right' }: ModalFooterProps) {
  const alignmentClasses = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    between: 'justify-between'
  };

  return (
    <div className={`bg-white px-6 py-4 border-t border-gray-200 flex gap-3 ${alignmentClasses[align]}`}>
      {children}
    </div>
  );
}

interface ModalActionsProps {
  onCancel: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  saveText?: string;
  cancelText?: string;
  deleteText?: string;
  isSaving?: boolean;
  isDeleting?: boolean;
  saveDisabled?: boolean;
  showDelete?: boolean;
}

export function ModalActions({ 
  onCancel,
  onSave,
  onDelete,
  saveText = 'Save',
  cancelText = 'Cancel',
  deleteText = 'Delete',
  isSaving = false,
  isDeleting = false,
  saveDisabled = false,
  showDelete = false
}: ModalActionsProps) {
  return (
    <ModalFooter align="right">
      <Button variant="outline" onClick={onCancel} disabled={isSaving || isDeleting}>
        {cancelText}
      </Button>
      {showDelete && (
        <Button 
          variant="error" 
          onClick={onDelete}
          disabled={isSaving || isDeleting || isDeleting}
          isLoading={isDeleting}
        >
          {deleteText}
        </Button>
      )}
      {onSave && (
        <Button 
          variant="primary" 
          onClick={onSave}
          disabled={saveDisabled || isSaving || isDeleting}
          isLoading={isSaving}
        >
          {saveText}
        </Button>
      )}
    </ModalFooter>
  );
}
