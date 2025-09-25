import { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  ChevronLeft,
  ChevronRight,
  Activity,
  FileText,
  Loader
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDatabaseManagement, useTableData } from '../../hooks/useDatabaseManagement';
import { MissingTablesHelper } from './MissingTablesHelper';


export function DatabaseManagement() {
  // Use custom hooks for database management
  const {
    tables,
    dbStats,
    loading,
    error,
    deleteRecord,
    clearTable,
    refresh
  } = useDatabaseManagement();

  // Local state
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMissingTablesHelper, setShowMissingTablesHelper] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  // Use table data hook for real-time table data
  const {
    tableSchema,
    tableData,
    loading: dataLoading,
    currentPage,
    sortBy,
    sortOrder,
    setCurrentPage,
    setSortBy,
    setSortOrder,
    refresh: refreshTableData
  } = useTableData(selectedTable, autoRefreshEnabled);

  // Reset selected records when table changes
  useEffect(() => {
    setSelectedRecords(new Set());
  }, [selectedTable]);

  // Set up auto-refresh for database overview
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      refresh();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refresh]);

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setSelectedRecords(new Set());
  };


  const handleDeleteRecord = async (recordId: string | number) => {
    if (!selectedTable) return;
    
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteRecord(selectedTable, recordId);
        refreshTableData();
        setSelectedRecords(new Set());
      } catch (err) {
        console.error('Error deleting record:', err);
      }
    }
  };

  const handleClearTable = async () => {
    if (!selectedTable) return;
    
    if (confirm(`Are you sure you want to clear ALL data from table "${selectedTable}"? This action cannot be undone.`)) {
      try {
        await clearTable(selectedTable);
        refreshTableData();
        refresh(); // Refresh the database overview
      } catch (err) {
        console.error('Error clearing table:', err);
      }
    }
  };

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'missing':
        return <Badge variant="warning" size="sm">Missing</Badge>;
      case 'error':
        return <Badge variant="error" size="sm">Error</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading database management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Database Error</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={refresh}>
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Database className="h-8 w-8 mr-3 text-blue-600" />
            Database Management
          </h1>
          <div className="flex items-center space-x-2">
            <p className="text-gray-600">Manage your Supabase database tables and data</p>
            {autoRefreshEnabled && (
              <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="auto-refresh" className="text-sm text-gray-600">
              Auto-refresh (30s)
            </label>
          </div>
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Database Statistics */}
      {dbStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Tables</p>
                  <p className="text-2xl font-bold text-gray-900">{dbStats.totalTables}</p>
                </div>
                <div className="flex-shrink-0">
                  <Table className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Tables</p>
                  <p className="text-2xl font-bold text-green-900">{dbStats.healthyTables}</p>
                </div>
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Missing Tables</p>
                  <p className="text-2xl font-bold text-yellow-900">{dbStats.missingTables}</p>
                </div>
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{dbStats.totalRecords.toLocaleString()}</p>
                </div>
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Health Score</p>
                  <p className="text-2xl font-bold text-gray-900">{dbStats.healthScore}%</p>
                </div>
                <div className="flex-shrink-0">
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Missing Tables Alert */}
      {dbStats && dbStats.missingTables > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800">Missing Database Tables</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {dbStats.missingTables} tables are missing from your database. These tables are required for full application functionality.
                </p>
                <div className="mt-3 flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowMissingTablesHelper(true)}
                  >
                    Create Missing Tables
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const missingTables = dbStats.tableStats
                        .filter(table => table.status === 'missing')
                        .map(table => table.name);
                      
                      alert(`Missing tables:\n${missingTables.join('\n')}\n\nThese tables are required for advanced features.`);
                    }}
                  >
                    View List
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Database Tables</span>
                <Badge variant="info">{filteredTables.length}</Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tables..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredTables.map((table) => (
                  <div
                    key={table.name}
                    className={`p-4 border-b border-gray-200 transition-colors ${
                      table.status === 'missing' 
                        ? 'cursor-not-allowed opacity-60' 
                        : 'cursor-pointer hover:bg-gray-50'
                    } ${
                      selectedTable === table.name ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => {
                      if (table.status !== 'missing') {
                        handleTableSelect(table.name);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{table.name}</p>
                          {table.isCore && (
                            <Badge variant="info" size="sm">Core</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {table.status === 'missing' ? 'Table not found' : `${table.rowCount.toLocaleString()} rows`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(table.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Data */}
        <div className="lg:col-span-2">
          {selectedTable ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>{selectedTable}</span>
                    {tables.find(t => t.name === selectedTable)?.isCore && (
                      <Badge variant="info" size="sm">Core Table</Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshTableData}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                    <Button
                      variant="error"
                      size="sm"
                      onClick={handleClearTable}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear Table
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : tableData?.data.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No data found in this table</p>
                  </div>
                ) : (
                  <>
                    {/* Table Data */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300"
                                checked={(tableData?.data?.length || 0) > 0 && selectedRecords.size === (tableData?.data?.filter(row => row.id)?.length || 0)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const validIds = tableData?.data.filter(row => row.id).map(row => row.id) || [];
                                    setSelectedRecords(new Set(validIds));
                                  } else {
                                    setSelectedRecords(new Set());
                                  }
                                }}
                              />
                            </th>
                            {(tableSchema?.columns || []).map((column) => (
                              <th
                                key={`${selectedTable}-col-${column.name}`}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                  if (sortBy === column.name) {
                                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                  } else {
                                    setSortBy(column.name);
                                    setSortOrder('asc');
                                  }
                                }}
                              >
                                <div className="flex items-center">
                                  {column.name}
                                  {sortBy === column.name && (
                                    <span className="ml-1">
                                      {sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                  )}
                                </div>
                              </th>
                            ))}
                            <th className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(tableData?.data || []).map((row, index) => (
                            <tr key={`${selectedTable}-row-${row.id || index}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300"
                                  checked={row.id ? selectedRecords.has(row.id) : false}
                                  onChange={(e) => {
                                    if (!row.id) return;
                                    const newSelected = new Set(selectedRecords);
                                    if (e.target.checked) {
                                      newSelected.add(row.id);
                                    } else {
                                      newSelected.delete(row.id);
                                    }
                                    setSelectedRecords(newSelected);
                                  }}
                                />
                              </td>
                              {(tableSchema?.columns || []).map((column) => (
                                <td key={`${selectedTable}-cell-${row.id || index}-${column.name}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="max-w-xs truncate" title={formatValue(row[column.name])}>
                                    {formatValue(row[column.name])}
                                  </div>
                                </td>
                              ))}
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setShowEditModal(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="error"
                                    size="sm"
                                    onClick={() => handleDeleteRecord(row.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {tableData && tableData.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-700">
                          Showing {currentPage * 50 + 1} to {Math.min((currentPage + 1) * 50, tableData.count)} of {tableData.count} results
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <span className="text-sm text-gray-700">
                            Page {currentPage + 1} of {tableData.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(tableData.totalPages - 1, currentPage + 1))}
                            disabled={currentPage >= tableData.totalPages - 1}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a table to view its data</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals would go here - Add/Edit Record Modals */}
      {/* For now, we'll implement them as simple alerts */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Record</h3>
            <p className="text-gray-600 mb-4">This feature will be implemented in the next update.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddModal(false)}>
                Add Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Record</h3>
            <p className="text-gray-600 mb-4">This feature will be implemented in the next update.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowEditModal(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Missing Tables Helper Modal */}
      {showMissingTablesHelper && dbStats && (
        <MissingTablesHelper
          missingTables={dbStats.tableStats
            .filter(table => table.status === 'missing')
            .map(table => table.name)
          }
          onClose={() => setShowMissingTablesHelper(false)}
        />
      )}
    </div>
  );
}
