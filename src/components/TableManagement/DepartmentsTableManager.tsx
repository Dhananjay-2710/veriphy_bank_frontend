// =============================================================================
// DEPARTMENTS TABLE MANAGER
// =============================================================================

import React from 'react';
import { Building2, Users, Settings, Calendar } from 'lucide-react';
import { DynamicTableManager } from '../DynamicTableManager';
import { TableName } from '../../types/permissions';

const DEPARTMENTS_COLUMNS = [
  {
    key: 'name',
    label: 'Department Name',
    type: 'text' as const,
    sortable: true,
    filterable: true,
    width: '200px'
  },
  {
    key: 'code',
    label: 'Code',
    type: 'text' as const,
    sortable: true,
    filterable: true,
    width: '120px'
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text' as const,
    sortable: false,
    filterable: true,
    width: '300px',
    render: (value: string) => (
      <div className="max-w-xs truncate" title={value}>
        {value || '-'}
      </div>
    )
  },
  {
    key: 'head_user_id',
    label: 'Department Head',
    type: 'text' as const,
    sortable: true,
    filterable: true,
    render: (value: any, record: any) => (
      <div className="flex items-center">
        <Users className="h-4 w-4 mr-2 text-blue-600" />
        <span>{record.head_user?.full_name || 'Not Assigned'}</span>
      </div>
    )
  },
  {
    key: 'user_count',
    label: 'Users',
    type: 'number' as const,
    sortable: true,
    render: (value: number) => (
      <div className="flex items-center">
        <Users className="h-4 w-4 mr-1 text-green-600" />
        {value || 0}
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge' as const,
    sortable: true,
    filterable: true,
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {value || 'Inactive'}
      </span>
    )
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'date' as const,
    sortable: true,
    render: (value: string) => (
      <div className="flex items-center">
        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
        {value ? new Date(value).toLocaleDateString() : '-'}
      </div>
    )
  }
];

const CUSTOM_ACTIONS = [
  {
    key: 'view_users',
    label: 'View Users',
    icon: <Users className="h-4 w-4" />,
    variant: 'outline' as const,
    onClick: (record: any) => {
      console.log('View department users:', record);
      // Implement view users functionality
    }
  },
  {
    key: 'manage_settings',
    label: 'Manage Settings',
    icon: <Settings className="h-4 w-4" />,
    variant: 'outline' as const,
    onClick: (record: any) => {
      console.log('Manage department settings:', record);
      // Implement manage settings functionality
    }
  }
];

export function DepartmentsTableManager() {
  return (
    <DynamicTableManager
      table={'departments' as TableName}
      title="Departments Management"
      description="Manage organizational departments and their settings"
      columns={DEPARTMENTS_COLUMNS}
      customActions={CUSTOM_ACTIONS}
      enableBulkOperations={true}
      enableExport={true}
      pageSize={15}
      autoRefresh={false}
      onRecordSelect={(record) => {
        console.log('Selected department:', record);
      }}
      onRecordEdit={(record) => {
        console.log('Edit department:', record);
      }}
      onRecordDelete={(record) => {
        console.log('Delete department:', record);
      }}
    />
  );
}
