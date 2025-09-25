// =============================================================================
// TASKS TABLE MANAGER
// =============================================================================

import React from 'react';
import { CheckSquare, Clock, User, Flag, Calendar, AlertCircle } from 'lucide-react';
import { DynamicTableManager } from '../DynamicTableManager';
import { TableName } from '../../types/permissions';

const TASKS_COLUMNS = [
  {
    key: 'title',
    label: 'Task Title',
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
    key: 'description',
    label: 'Description',
    type: 'text' as const,
    sortable: false,
    filterable: true,
    width: '300px',
    render: (value: string) => (
      <div className="max-w-xs truncate text-gray-600" title={value}>
        {value || '-'}
      </div>
    )
  },
  {
    key: 'assigned_to',
    label: 'Assigned To',
    type: 'text' as const,
    sortable: true,
    filterable: true,
    render: (value: any, record: any) => (
      <div className="flex items-center">
        <User className="h-4 w-4 mr-2 text-blue-600" />
        <span>{record.assigned_user?.full_name || 'Unassigned'}</span>
      </div>
    )
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'badge' as const,
    sortable: true,
    filterable: true,
    render: (value: string) => {
      const priorityColors = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
      };
      return (
        <div className="flex items-center">
          <Flag className="h-4 w-4 mr-1" />
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            priorityColors[value as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'
          }`}>
            {value || 'Normal'}
          </span>
        </div>
      );
    }
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge' as const,
    sortable: true,
    filterable: true,
    render: (value: string) => {
      const statusColors = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        overdue: 'bg-red-100 text-red-800'
      };
      return (
        <div className="flex items-center">
          <CheckSquare className="h-4 w-4 mr-1" />
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
          }`}>
            {value || 'Open'}
          </span>
        </div>
      );
    }
  },
  {
    key: 'due_date',
    label: 'Due Date',
    type: 'date' as const,
    sortable: true,
    filterable: true,
    render: (value: string) => {
      if (!value) return '-';
      
      const dueDate = new Date(value);
      const now = new Date();
      const isOverdue = dueDate < now && dueDate.toDateString() !== now.toDateString();
      
      return (
        <div className={`flex items-center ${isOverdue ? 'text-red-600' : ''}`}>
          <Calendar className="h-4 w-4 mr-1" />
          <span>{dueDate.toLocaleDateString()}</span>
          {isOverdue && <AlertCircle className="h-4 w-4 ml-1 text-red-500" />}
        </div>
      );
    }
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
  }
];

const CUSTOM_ACTIONS = [
  {
    key: 'view_details',
    label: 'View Details',
    icon: <CheckSquare className="h-4 w-4" />,
    variant: 'outline' as const,
    onClick: (record: any) => {
      console.log('View task details:', record);
      // Implement view details functionality
    }
  },
  {
    key: 'assign_task',
    label: 'Assign Task',
    icon: <User className="h-4 w-4" />,
    variant: 'outline' as const,
    onClick: (record: any) => {
      console.log('Assign task:', record);
      // Implement assign task functionality
    }
  }
];

export function TasksTableManager() {
  return (
    <DynamicTableManager
      table={'tasks' as TableName}
      title="Tasks Management"
      description="Manage and track tasks across the organization"
      columns={TASKS_COLUMNS}
      customActions={CUSTOM_ACTIONS}
      enableBulkOperations={true}
      enableExport={true}
      pageSize={20}
      autoRefresh={true}
      refreshInterval={30000}
      onRecordSelect={(record) => {
        console.log('Selected task:', record);
      }}
      onRecordEdit={(record) => {
        console.log('Edit task:', record);
      }}
      onRecordDelete={(record) => {
        console.log('Delete task:', record);
      }}
    />
  );
}
