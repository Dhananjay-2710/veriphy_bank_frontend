// =============================================================================
// PRODUCTS TABLE MANAGER
// =============================================================================

import React from 'react';
import { Package, DollarSign, Percent, Calendar } from 'lucide-react';
import { DynamicTableManager } from '../DynamicTableManager';
import { TableName } from '../../types/permissions';

const PRODUCTS_COLUMNS = [
  {
    key: 'name',
    label: 'Product Name',
    type: 'text' as const,
    sortable: true,
    filterable: true,
    width: '200px'
  },
  {
    key: 'product_code',
    label: 'Code',
    type: 'text' as const,
    sortable: true,
    filterable: true,
    width: '120px'
  },
  {
    key: 'min_amount',
    label: 'Min Amount',
    type: 'number' as const,
    sortable: true,
    render: (value: number) => (
      <div className="flex items-center">
        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
        {value ? `₹${value.toLocaleString()}` : '-'}
      </div>
    )
  },
  {
    key: 'max_amount',
    label: 'Max Amount',
    type: 'number' as const,
    sortable: true,
    render: (value: number) => (
      <div className="flex items-center">
        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
        {value ? `₹${value.toLocaleString()}` : '-'}
      </div>
    )
  },
  {
    key: 'interest_rate',
    label: 'Interest Rate',
    type: 'number' as const,
    sortable: true,
    render: (value: number) => (
      <div className="flex items-center">
        <Percent className="h-4 w-4 mr-1 text-blue-600" />
        {value ? `${value}%` : '-'}
      </div>
    )
  },
  {
    key: 'tenure_min',
    label: 'Min Tenure',
    type: 'number' as const,
    sortable: true,
    render: (value: number) => value ? `${value} months` : '-'
  },
  {
    key: 'tenure_max',
    label: 'Max Tenure',
    type: 'number' as const,
    sortable: true,
    render: (value: number) => value ? `${value} months` : '-'
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
    key: 'view_details',
    label: 'View Details',
    icon: <Package className="h-4 w-4" />,
    variant: 'outline' as const,
    onClick: (record: any) => {
      console.log('View product details:', record);
      // Implement view details functionality
    }
  }
];

export function ProductsTableManager() {
  return (
    <DynamicTableManager
      table={'products' as TableName}
      title="Products Management"
      description="Manage loan products, interest rates, and terms"
      columns={PRODUCTS_COLUMNS}
      customActions={CUSTOM_ACTIONS}
      enableBulkOperations={true}
      enableExport={true}
      pageSize={15}
      autoRefresh={false}
      onRecordSelect={(record) => {
        console.log('Selected product:', record);
      }}
      onRecordEdit={(record) => {
        console.log('Edit product:', record);
      }}
      onRecordDelete={(record) => {
        console.log('Delete product:', record);
      }}
    />
  );
}
