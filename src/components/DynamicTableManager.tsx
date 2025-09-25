// =============================================================================
// DYNAMIC TABLE MANAGER COMPONENT
// =============================================================================
// This component provides a universal interface for managing any table with full CRUD operations

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Upload,
  Eye,
  EyeOff,
  MoreHorizontal,
  CheckSquare,
  Square
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { UniversalCrudService, CrudOptions, CrudResult } from '../services/universal-crud-service';
import { UserRole, TableName, Operation } from '../types/permissions';
import { useAuth } from '../contexts/AuthContextFixed';
import { useRealTimeTableUpdates, TableUpdateEvent } from '../hooks/useRealTimeTableUpdates';

// =============================================================================
// INTERFACES
// =============================================================================

interface DynamicTableManagerProps {
  table: TableName;
  title: string;
  description?: string;
  columns: TableColumn[];
  onRecordSelect?: (record: any) => void;
  onRecordEdit?: (record: any) => void;
  onRecordDelete?: (record: any) => void;
  customActions?: CustomAction[];
  enableBulkOperations?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
  pageSize?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'action';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, record: any) => React.ReactNode;
}

interface CustomAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: (record: any) => void;
  visible?: (record: any) => boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface FilterState {
  [key: string]: any;
}

interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DynamicTableManager({
  table,
  title,
  description,
  columns,
  onRecordSelect,
  onRecordEdit,
  onRecordDelete,
  customActions = [],
  enableBulkOperations = true,
  enableExport = true,
  enableImport = false,
  pageSize = 10,
  autoRefresh = false,
  refreshInterval = 30000
}: DynamicTableManagerProps) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Filters and sorting
  const [filters, setFilters] = useState<FilterState>({});
  const [sorting, setSorting] = useState<SortState>({ field: 'created_at', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection
  const [selectedRecords, setSelectedRecords] = useState<Set<string | number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [showColumns, setShowColumns] = useState(true);
  
  // Permissions
  const [permissions, setPermissions] = useState<Operation[]>([]);
  
  // Real-time updates
  const handleRealTimeUpdate = useCallback((event: TableUpdateEvent) => {
    console.log(`📡 Real-time update for ${table}:`, event);
    
    if (event.table === table) {
      // Refresh data when our table is updated
      loadData();
    }
  }, [table]);
  
  const { getAllSubscriptionStatuses, reconnect } = useRealTimeTableUpdates(
    [table],
    handleRealTimeUpdate,
    {
      enabled: autoRefresh,
      debounceMs: 500
    }
  );
  
  // =============================================================================
  // EFFECTS
  // =============================================================================
  
  useEffect(() => {
    if (user?.role) {
      const userRole = user.role as UserRole;
      const tablePermissions = UniversalCrudService.getTableOperations(userRole, table);
      setPermissions(tablePermissions);
    }
  }, [user?.role, table]);
  
  useEffect(() => {
    loadData();
  }, [currentPage, filters, sorting, searchTerm]);
  
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);
  
  // =============================================================================
  // DATA LOADING
  // =============================================================================
  
  const loadData = useCallback(async () => {
    if (!user?.role) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const options: CrudOptions = {
        userRole: user.role as UserRole,
        userId: user.id,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        filters: {
          ...filters,
          ...(searchTerm && { search: searchTerm })
        },
        pagination: {
          page: currentPage,
          limit: pageSize
        },
        sorting: sorting
      };
      
      const result: CrudResult = await UniversalCrudService.read(table, options);
      
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
        setTotal(result.total);
        setHasMore(result.hasMore);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user, table, currentPage, filters, sorting, searchTerm, pageSize]);
  
  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================
  
  const handleCreate = async (recordData: any) => {
    if (!user?.role) return;
    
    try {
      const options: CrudOptions = {
        userRole: user.role as UserRole,
        userId: user.id,
        organizationId: user.organizationId,
        departmentId: user.departmentId
      };
      
      const result = await UniversalCrudService.create(table, recordData, options);
      
      if (result.error) {
        setError(result.error);
      } else {
        setShowCreateForm(false);
        loadData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create record');
    }
  };
  
  const handleUpdate = async (id: string | number, recordData: any) => {
    if (!user?.role) return;
    
    try {
      const options: CrudOptions = {
        userRole: user.role as UserRole,
        userId: user.id,
        organizationId: user.organizationId,
        departmentId: user.departmentId
      };
      
      const result = await UniversalCrudService.update(table, id, recordData, options);
      
      if (result.error) {
        setError(result.error);
      } else {
        setEditingRecord(null);
        loadData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record');
    }
  };
  
  const handleDelete = async (id: string | number) => {
    if (!user?.role) return;
    
    try {
      const options: CrudOptions = {
        userRole: user.role as UserRole,
        userId: user.id,
        organizationId: user.organizationId,
        departmentId: user.departmentId
      };
      
      const result = await UniversalCrudService.delete(table, id, options);
      
      if (result.error) {
        setError(result.error);
      } else {
        loadData();
        onRecordDelete?.(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    }
  };
  
  const handleBulkDelete = async () => {
    if (!user?.role || selectedRecords.size === 0) return;
    
    try {
      const options: CrudOptions = {
        userRole: user.role as UserRole,
        userId: user.id,
        organizationId: user.organizationId,
        departmentId: user.departmentId
      };
      
      const result = await UniversalCrudService.bulkDelete(table, Array.from(selectedRecords), options);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSelectedRecords(new Set());
        setSelectAll(false);
        loadData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete records');
    }
  };
  
  // =============================================================================
  // SELECTION HANDLERS
  // =============================================================================
  
  const handleSelectRecord = (recordId: string | number) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
    setSelectAll(newSelected.size === data.length);
  };
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(data.map(record => record.id)));
    }
    setSelectAll(!selectAll);
  };
  
  // =============================================================================
  // FILTER HANDLERS
  // =============================================================================
  
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };
  
  const handleSort = (field: string) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  
  const renderCell = (column: TableColumn, record: any) => {
    const value = record[column.key];
    
    if (column.render) {
      return column.render(value, record);
    }
    
    switch (column.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';
      case 'badge':
        return <Badge variant="secondary">{value || 'N/A'}</Badge>;
      default:
        return value || '-';
    }
  };
  
  const canCreate = permissions.includes('create');
  const canUpdate = permissions.includes('update');
  const canDelete = permissions.includes('delete');
  const canBulkDelete = permissions.includes('bulk_operations');
  
  // =============================================================================
  // RENDER
  // =============================================================================
  
  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {title}...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Error Loading {title}</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
        <div className="flex space-x-3">
          {autoRefresh && (
            <Badge variant="outline" className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </Badge>
          )}
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {autoRefresh && (
            <Button variant="outline" onClick={reconnect} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reconnect
            </Button>
          )}
          {canCreate && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>
      
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters & Search</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {columns
                .filter(col => col.filterable)
                .map(column => (
                  <div key={column.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.label}
                    </label>
                    <input
                      type="text"
                      placeholder={`Filter by ${column.label.toLowerCase()}...`}
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Bulk Actions */}
      {enableBulkOperations && selectedRecords.size > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {selectedRecords.size} record{selectedRecords.size !== 1 ? 's' : ''} selected
                </span>
                {canBulkDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRecords(new Set());
                  setSelectAll(false);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {enableBulkOperations && (
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center"
                      >
                        {selectAll ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                  )}
                  {columns.map(column => (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={column.sortable ? () => handleSort(column.key) : undefined}
                      style={{ width: column.width }}
                    >
                      <div className="flex items-center">
                        {column.label}
                        {column.sortable && sorting.field === column.key && (
                          <span className="ml-1">
                            {sorting.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map(record => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onRecordSelect?.(record)}
                  >
                    {enableBulkOperations && (
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRecord(record.id);
                          }}
                        >
                          {selectedRecords.has(record.id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map(column => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {renderCell(column, record)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRecord(record);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(record.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {customActions.map(action => (
                          action.visible?.(record) !== false && (
                            <Button
                              key={action.key}
                              variant={action.variant || 'ghost'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(record);
                              }}
                            >
                              {action.icon}
                            </Button>
                          )
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {data.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No records found</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {data.length} of {total} records
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasMore}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
