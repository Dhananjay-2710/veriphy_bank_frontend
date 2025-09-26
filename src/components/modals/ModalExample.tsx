import React, { useState } from 'react';
import { UserManagementModal } from './UserManagementModal';
import { CaseManagementModal } from './CaseManagementModal';
import { DocumentManagementModal } from './DocumentManagementModal';
import { OrganizationManagementModal } from './OrganizationManagementModal';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

/**
 * Example component demonstrating how to integrate CRUD modals with existing pages
 * This shows the usage pattern for implementing modals in components that currently
 * handle direct CRUD operations
 */
export function ModalExample() {
  const [modals, setModals] = useState({
    user: { isOpen: false, mode: 'create' as 'create' | 'edit' | 'view', user: null },
    case: { isOpen: false, mode: 'create' as 'create' | 'edit' | 'view', case: null },
    document: { isOpen: false, mode: 'create' as 'create' | 'edit' | 'view', document: null },
    organization: { isOpen: false, mode: 'create' as 'create' | 'edit' | 'view', organization: null }
  });

  const openModal = (type: keyof typeof modals, mode: 'create' | 'edit' | 'view', data: any = null) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: true, mode, [type]: data }
    }));
  };

  const closeModal = (type: keyof typeof modals) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: false, mode: 'create', [type]: null }
    }));
  };

  const handleSave = (type: keyof typeof modals, data: any) => {
    console.log(`Saved ${type}:`, data);
    closeModal(type);
    // Here you would typically refresh your data
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">CRUD Modal Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => openModal('user', 'create')}>
              Create User
            </Button>
            <Button 
              variant="outline" 
              onClick={() => openModal('user', 'edit', { id: '1', name: 'John Doe' })}
            >
              Edit User
            </Button>
            <Button 
              variant="outline" 
              onClick={() => openModal('user', 'view', { id: '1', name: 'John Doe' })}
            >
              View User
            </Button>
          </CardContent>
        </Card>

        {/* Case Management */}
        <Card>
          <CardHeader>
            <CardTitle>Case Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => openModal('case', 'create')}>
              Create Case
            </Button>
            <Button 
              variant="outline" 
              onClick={() => openModal('case', 'edit', { id: '1', caseNumber: 'CASE-001' })}
            >
              Edit Case
            </Button>
            <Button 
              variant="outline" 
              onClick={() => openModal('case', 'view', { id: '1', caseNumber: 'CASE-001' })}
            >
              View Case
            </Button>
          </CardContent>
        </Card>

        {/* Document Management */}
        <Card>
          <CardHeader>
            <CardTitle>Document Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => openModal('document', 'create')}>
              Upload Document
            </Button>
            <Button 
              variant="outline" 
              onClick={() => openModal('document', 'edit', { id: '1', fileName: 'document.pdf' })}
            >
              Edit Document
            </Button>
            <Button 
              variant="outline" 
              onClick={() => openModal('document', 'view', { id: '1', fileName: 'document.pdf' })}
            >
              View Document
            </Button>
          </CardContent>
        </Card>

        {/* Organization Management */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => openModal('organization', 'create')}>
              Create Organization
            </Button>
            <Button 
              variant="outline" 
              onClick={() => openModal('organization', 'edit', { id: '1', name: 'Company Name' })}
            >
              Edit Organization
            </Button>
            <Button 
              variant="outline" 
              onClick={() => openModal('organization', 'view', { id: '1', name: 'Company Name' })}
            >
              View Organization
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <UserManagementModal
        isOpen={modals.user.isOpen}
        onClose={() => closeModal('user')}
        onSave={(data) => handleSave('user', data)}
        initialUser={modals.user.user}
        mode={modals.user.mode}
      />

      <CaseManagementModal
        isOpen={modals.case.isOpen}
        onClose={() => closeModal('case')}
        onSave={(data) => handleSave('case', data)}
        initialCase={modals.case.case}
        mode={modals.case.mode}
      />

      <DocumentManagementModal
        isOpen={modals.document.isOpen}
        onClose={() => closeModal('document')}
        onSave={(data) => handleSave('document', data)}
        initialDocument={modals.document.document}
        mode={modals.document.mode}
      />

      <OrganizationManagementModal
        isOpen={modals.organization.isOpen}
        onClose={() => closeModal('organization')}
        onSave={(data) => handleSave('organization', data)}
        initialOrganization={modals.organization.organization}
        mode={modals.organization.mode}
      />
    </div>
  );
}
