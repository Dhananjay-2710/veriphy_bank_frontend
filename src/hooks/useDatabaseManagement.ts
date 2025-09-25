import { useState, useEffect, useCallback } from 'react';
import { SupabaseDatabaseService } from '../services/supabase-database';

interface DatabaseTable {
  name: string;
  rowCount: number;
  status: 'active' | 'error' | 'missing';
  error?: string;
  isCore?: boolean;
}

interface TableSchema {
  tableName: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
  }>;
  sampleData: any[];
}

interface TableData {
  data: any[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DatabaseStats {
  totalTables: number;
  totalRecords: number;
  healthyTables: number;
  missingTables: number;
  errorTables: number;
  healthScore: number;
  coreHealthScore: number;
  tableStats: DatabaseTable[];
}

export function useDatabaseManagement() {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatabaseOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tablesData, statsData] = await Promise.all([
        SupabaseDatabaseService.getDatabaseTables(),
        SupabaseDatabaseService.getDatabaseStats()
      ]);
      
      setTables(tablesData);
      setDbStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load database overview');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTableSchema = useCallback(async (tableName: string): Promise<TableSchema | null> => {
    try {
      return await SupabaseDatabaseService.getTableSchema(tableName);
    } catch (err) {
      console.error('Error loading table schema:', err);
      return null;
    }
  }, []);

  const fetchTableData = useCallback(async (
    tableName: string,
    page = 0,
    limit = 50,
    filters?: Record<string, any>,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<TableData | null> => {
    try {
      return await SupabaseDatabaseService.getTableData(
        tableName,
        page,
        limit,
        filters,
        sortBy,
        sortOrder
      );
    } catch (err) {
      console.error('Error loading table data:', err);
      return null;
    }
  }, []);

  const insertRecord = useCallback(async (tableName: string, recordData: Record<string, any>) => {
    try {
      const result = await SupabaseDatabaseService.insertTableRecord(tableName, recordData);
      await fetchDatabaseOverview(); // Refresh overview to update counts
      return result;
    } catch (err) {
      throw err;
    }
  }, [fetchDatabaseOverview]);

  const updateRecord = useCallback(async (
    tableName: string, 
    recordId: string | number, 
    updates: Record<string, any>
  ) => {
    try {
      const result = await SupabaseDatabaseService.updateTableRecord(tableName, recordId, updates);
      return result;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteRecord = useCallback(async (tableName: string, recordId: string | number) => {
    try {
      await SupabaseDatabaseService.deleteTableRecord(tableName, recordId);
      await fetchDatabaseOverview(); // Refresh overview to update counts
    } catch (err) {
      throw err;
    }
  }, [fetchDatabaseOverview]);

  const clearTable = useCallback(async (tableName: string) => {
    try {
      await SupabaseDatabaseService.clearTable(tableName);
      await fetchDatabaseOverview(); // Refresh overview to update counts
    } catch (err) {
      throw err;
    }
  }, [fetchDatabaseOverview]);

  const executeCustomQuery = useCallback(async (query: string) => {
    try {
      const result = await SupabaseDatabaseService.executeCustomQuery(query);
      await fetchDatabaseOverview(); // Refresh overview in case data changed
      return result;
    } catch (err) {
      throw err;
    }
  }, [fetchDatabaseOverview]);

  // Set up initial data load
  useEffect(() => {
    fetchDatabaseOverview();
  }, [fetchDatabaseOverview]);

  return {
    // State
    tables,
    dbStats,
    loading,
    error,

    // Actions
    fetchDatabaseOverview,
    fetchTableSchema,
    fetchTableData,
    insertRecord,
    updateRecord,
    deleteRecord,
    clearTable,
    executeCustomQuery,
    refresh: fetchDatabaseOverview
  };
}

export function useTableData(tableName: string | null, autoRefresh = false) {
  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const loadTableData = useCallback(async () => {
    if (!tableName) return;
    
    try {
      setLoading(true);
      
      const [schema, data] = await Promise.all([
        SupabaseDatabaseService.getTableSchema(tableName),
        SupabaseDatabaseService.getTableData(
          tableName,
          currentPage,
          50,
          filters,
          sortBy,
          sortOrder
        )
      ]);
      
      setTableSchema(schema);
      setTableData(data);
    } catch (err) {
      console.error('Error loading table data:', err);
    } finally {
      setLoading(false);
    }
  }, [tableName, currentPage, sortBy, sortOrder, filters]);

  // Auto-refresh when table changes
  useEffect(() => {
    if (tableName) {
      setCurrentPage(0);
      setFilters({});
    }
  }, [tableName]);

  // Load data when dependencies change
  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  // Set up real-time updates (optional)
  useEffect(() => {
    if (!autoRefresh || !tableName) return;

    const interval = setInterval(() => {
      loadTableData();
    }, 30000); // Refresh every 30 seconds (reduced frequency)

    return () => clearInterval(interval);
  }, [autoRefresh, tableName, loadTableData]);

  return {
    // State
    tableSchema,
    tableData,
    loading,
    currentPage,
    sortBy,
    sortOrder,
    filters,

    // Actions
    setCurrentPage,
    setSortBy,
    setSortOrder,
    setFilters,
    refresh: loadTableData
  };
}
