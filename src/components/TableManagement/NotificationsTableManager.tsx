// =============================================================================
// NOTIFICATIONS TABLE MANAGER
// =============================================================================

import React from 'react';
import { Bell, Mail, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { DynamicTableManager } from '../DynamicTableManager';
import { TableName } from '../../types/permissions';

const NOTIFICATIONS_COLUMNS = [
  {
    key: 'title',
    label: 'Title',
    type: 'text' as const,
    sortable: true,
    filterable: true,
    width: '250px',
    render: (value: string) => (
      <div className="max-w-xs truncate font-medium" title={value}>
        {value}
      </div>
    )
  },
  {
    key: 'message',
    label: 'Message',
    type: 'text' as const,
    sortable: false,
    filterable: true,
    width: '300px',
    render: (value: string) => (
      <div className="max-w-xs truncate text-gray-600" title={value}>
        {value}
      </div>
    )
  },
  {
    key: 'type',
    label: 'Type',
    type: 'badge' as const,
    sortable: true,
    filterable: true,
    render: (value: string) => {
      const typeIcons = {
        info: <Bell className="h-4 w-4 mr-1" />,
        warning: <AlertTriangle className="h-4 w-4 mr-1" />,
        success: <CheckCircle className="h-4 w-4 mr-1" />,
        error: <AlertTriangle className="h-4 w-4 mr-1" />
      };
      
      const typeColors = {
        info: 'bg-blue-100 text-blue-800',
        warning: 'bg-yellow-100 text-yellow-800',
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800'
      };
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
          typeColors[value as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'
        }`}>
          {typeIcons[value as keyof typeof typeIcons]}
          {value || 'Info'}
        </span>
      );
    }
  },
  {
    key: 'user_id',
    label: 'Recipient',
    type: 'text' as const,
    sortable: true,
    filterable: true,
    render: (value: any, record: any) => (
      <div className="flex items-center">
        <User className="h-4 w-4 mr-2 text-blue-600" />
        <span>{record.user?.full_name || 'System'}</span>
      </div>
    )
  },
  {
    key: 'is_read',
    label: 'Status',
    type: 'badge' as const,
    sortable: true,
    filterable: true,
    render: (value: boolean) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
        value 
          ? 'bg-green-100 text-green-800' 
          : 'bg-orange-100 text-orange-800'
      }`}>
        {value ? (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            Read
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 mr-1" />
            Unread
          </>
        )}
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
        <Clock className="h-4 w-4 mr-1 text-gray-400" />
        {value ? new Date(value).toLocaleDateString() : '-'}
      </div>
    )
  },
  {
    key: 'read_at',
    label: 'Read At',
    type: 'date' as const,
    sortable: true,
    render: (value: string) => (
      <div className="flex items-center">
        <CheckCircle className="h-4 w-4 mr-1 text-green-400" />
        {value ? new Date(value).toLocaleDateString() : '-'}
      </div>
    )
  }
];

const CUSTOM_ACTIONS = [
  {
    key: 'mark_read',
    label: 'Mark as Read',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'outline' as const,
    visible: (record: any) => !record.is_read,
    onClick: (record: any) => {
      console.log('Mark as read:', record);
      // Implement mark as read functionality
    }
  },
  {
    key: 'mark_unread',
    label: 'Mark as Unread',
    icon: <Clock className="h-4 w-4" />,
    variant: 'outline' as const,
    visible: (record: any) => record.is_read,
    onClick: (record: any) => {
      console.log('Mark as unread:', record);
      // Implement mark as unread functionality
    }
  },
  {
    key: 'view_details',
    label: 'View Details',
    icon: <Bell className="h-4 w-4" />,
    variant: 'outline' as const,
    onClick: (record: any) => {
      console.log('View notification details:', record);
      // Implement view details functionality
    }
  }
];

export function NotificationsTableManager() {
  return (
    <DynamicTableManager
      table={'notifications' as TableName}
      title="Notifications Management"
      description="Manage system notifications and alerts"
      columns={NOTIFICATIONS_COLUMNS}
      customActions={CUSTOM_ACTIONS}
      enableBulkOperations={true}
      enableExport={true}
      pageSize={25}
      autoRefresh={true}
      refreshInterval={15000}
      onRecordSelect={(record) => {
        console.log('Selected notification:', record);
      }}
      onRecordEdit={(record) => {
        console.log('Edit notification:', record);
      }}
      onRecordDelete={(record) => {
        console.log('Delete notification:', record);
      }}
    />
  );
}
