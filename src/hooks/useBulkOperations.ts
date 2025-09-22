// =============================================================================
// BULK OPERATIONS HOOK - Advanced Bulk Data Management
// =============================================================================

import { useState, useCallback, useMemo } from 'react';

// =============================================================================
// BULK OPERATIONS INTERFACES
// =============================================================================

export interface BulkOperation<T> {
  id: string;
  name: string;
  description: string;
  icon?: string;
  action: (items: T[]) => Promise<BulkOperationResult>;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  isDestructive?: boolean;
  isDisabled?: (items: T[]) => boolean;
  batchSize?: number;
}

export interface BulkOperationResult {
  success: boolean;
  message: string;
  processedCount: number;
  failedCount: number;
  errors?: string[];
  data?: any;
}

export interface BulkOperationsState<T> {
  selectedItems: Set<string>;
  isSelecting: boolean;
  isProcessing: boolean;
  lastOperation?: BulkOperationResult;
  error: string | null;
}

export interface BulkOperationsConfig {
  maxSelections?: number;
  allowSelectAll?: boolean;
  showProgress?: boolean;
  confirmDestructive?: boolean;
}

// =============================================================================
// BULK OPERATIONS HOOK
// =============================================================================

export function useBulkOperations<T extends { id: string }>(
  operations: BulkOperation<T>[],
  config: BulkOperationsConfig = {}
) {
  const {
    maxSelections = 1000,
    allowSelectAll = true
  } = config;

  const [state, setState] = useState<BulkOperationsState<T>>({
    selectedItems: new Set(),
    isSelecting: false,
    isProcessing: false,
    error: null
  });

  // Selection management
  const selectItem = useCallback((itemId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedItems);
      newSelected.add(itemId);
      
      if (newSelected.size > maxSelections) {
        return prev; // Don't exceed max selections
      }
      
      return {
        ...prev,
        selectedItems: newSelected,
        error: null
      };
    });
  }, [maxSelections]);

  const deselectItem = useCallback((itemId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedItems);
      newSelected.delete(itemId);
      
      return {
        ...prev,
        selectedItems: newSelected,
        error: null
      };
    });
  }, []);

  const toggleItem = useCallback((itemId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedItems);
      
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        if (newSelected.size >= maxSelections) {
          return prev; // Don't exceed max selections
        }
        newSelected.add(itemId);
      }
      
      return {
        ...prev,
        selectedItems: newSelected,
        error: null
      };
    });
  }, [maxSelections]);

  const selectAll = useCallback((items: T[]) => {
    if (!allowSelectAll) return;
    
    const itemIds = items.slice(0, maxSelections).map(item => item.id);
    setState(prev => ({
      ...prev,
      selectedItems: new Set(itemIds),
      error: null
    }));
  }, [allowSelectAll, maxSelections]);

  const deselectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedItems: new Set(),
      error: null
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedItems: new Set(),
      error: null,
      lastOperation: undefined
    }));
  }, []);

  // Operation execution
  const executeOperation = useCallback(async (
    operation: BulkOperation<T>,
    items: T[],
    selectedItems: T[]
  ) => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null
    }));

    try {
      // Check if operation is disabled for selected items
      if (operation.isDisabled && operation.isDisabled(selectedItems)) {
        throw new Error('Operation is disabled for selected items');
      }

      // Execute operation in batches if batchSize is specified
      let result: BulkOperationResult = {
        success: true,
        message: '',
        processedCount: 0,
        failedCount: 0,
        errors: []
      };

      if (operation.batchSize && selectedItems.length > operation.batchSize) {
        // Process in batches
        const batches = [];
        for (let i = 0; i < selectedItems.length; i += operation.batchSize) {
          batches.push(selectedItems.slice(i, i + operation.batchSize));
        }

        for (const batch of batches) {
          try {
            const batchResult = await operation.action(batch);
            result.processedCount += batchResult.processedCount;
            result.failedCount += batchResult.failedCount;
            if (batchResult.errors) {
              result.errors = [...(result.errors || []), ...batchResult.errors];
            }
          } catch (error) {
            result.failedCount += batch.length;
            result.errors = [...(result.errors || []), `Batch failed: ${error instanceof Error ? error.message : 'Unknown error'}`];
          }
        }
      } else {
        // Process all at once
        result = await operation.action(selectedItems);
      }

      setState(prev => ({
        ...prev,
        isProcessing: false,
        lastOperation: result,
        selectedItems: result.success ? new Set() : prev.selectedItems // Clear selection on success
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        lastOperation: {
          success: false,
          message: errorMessage,
          processedCount: 0,
          failedCount: selectedItems.length
        }
      }));

      throw error;
    }
  }, []);

  // Computed values
  const selectedCount = state.selectedItems.size;
  const isAllSelected = useMemo(() => {
    return (items: T[]) => {
      if (items.length === 0) return false;
      const maxItems = Math.min(items.length, maxSelections);
      return state.selectedItems.size === maxItems && 
             items.slice(0, maxItems).every(item => state.selectedItems.has(item.id));
    };
  }, [state.selectedItems, maxSelections]);

  const isPartiallySelected = useMemo(() => {
    return (items: T[]) => {
      if (items.length === 0) return false;
      const maxItems = Math.min(items.length, maxSelections);
      const selectedInRange = items.slice(0, maxItems).filter(item => state.selectedItems.has(item.id)).length;
      return selectedInRange > 0 && selectedInRange < maxItems;
    };
  }, [state.selectedItems, maxSelections]);

  const canSelectMore = selectedCount < maxSelections;

  return {
    // State
    selectedItems: state.selectedItems,
    selectedCount,
    isSelecting: state.isSelecting,
    isProcessing: state.isProcessing,
    lastOperation: state.lastOperation,
    error: state.error,

    // Selection actions
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    clearSelection,

    // Operation execution
    executeOperation,

    // Computed values
    isAllSelected,
    isPartiallySelected,
    canSelectMore,
    maxSelections,

    // Utility functions
    isItemSelected: (itemId: string) => state.selectedItems.has(itemId),
    getSelectedItems: (items: T[]) => items.filter(item => state.selectedItems.has(item.id))
  };
}

// =============================================================================
// BULK OPERATIONS PRESETS
// =============================================================================

export const BULK_OPERATIONS_PRESETS = {
  DELETE: {
    id: 'delete',
    name: 'Delete Selected',
    description: 'Permanently delete selected items',
    action: async (items: any[]) => {
      // This would integrate with your delete functions
      return {
        success: true,
        message: `Deleted ${items.length} items`,
        processedCount: items.length,
        failedCount: 0
      };
    },
    requiresConfirmation: true,
    confirmationMessage: 'Are you sure you want to delete the selected items? This action cannot be undone.',
    isDestructive: true
  },

  EXPORT: {
    id: 'export',
    name: 'Export Selected',
    description: 'Export selected items to CSV',
    action: async (items: any[]) => {
      // This would integrate with your export functions
      return {
        success: true,
        message: `Exported ${items.length} items`,
        processedCount: items.length,
        failedCount: 0
      };
    },
    requiresConfirmation: false
  },

  UPDATE_STATUS: {
    id: 'update_status',
    name: 'Update Status',
    description: 'Update status of selected items',
    action: async (items: any[]) => {
      // This would integrate with your update functions
      return {
        success: true,
        message: `Updated status for ${items.length} items`,
        processedCount: items.length,
        failedCount: 0
      };
    },
    requiresConfirmation: true,
    confirmationMessage: 'Are you sure you want to update the status of selected items?'
  }
} as const;

// =============================================================================
// BULK OPERATIONS HOOKS FOR SPECIFIC USE CASES
// =============================================================================

export function useCasesBulkOperations() {
  const operations: BulkOperation<any>[] = [
    {
      id: 'delete_cases',
      name: 'Delete Cases',
      description: 'Permanently delete selected cases',
      action: async (cases) => {
        // Integrate with SupabaseDatabaseService.deleteCase
        return {
          success: true,
          message: `Deleted ${cases.length} cases`,
          processedCount: cases.length,
          failedCount: 0
        };
      },
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to delete the selected cases? This action cannot be undone.',
      isDestructive: true
    },
    {
      id: 'update_status',
      name: 'Update Status',
      description: 'Update status of selected cases',
      action: async (cases) => {
        // Integrate with SupabaseDatabaseService.updateCase
        return {
          success: true,
          message: `Updated status for ${cases.length} cases`,
          processedCount: cases.length,
          failedCount: 0
        };
      },
      requiresConfirmation: true
    },
    {
      id: 'export_cases',
      name: 'Export Cases',
      description: 'Export selected cases to CSV',
      action: async (cases) => {
        // Integrate with export functionality
        return {
          success: true,
          message: `Exported ${cases.length} cases`,
          processedCount: cases.length,
          failedCount: 0
        };
      }
    }
  ];

  return useBulkOperations(operations, {
    maxSelections: 500,
    allowSelectAll: true,
    showProgress: true
  });
}

export function useDocumentsBulkOperations() {
  const operations: BulkOperation<any>[] = [
    {
      id: 'delete_documents',
      name: 'Delete Documents',
      description: 'Permanently delete selected documents',
      action: async (documents) => {
        return {
          success: true,
          message: `Deleted ${documents.length} documents`,
          processedCount: documents.length,
          failedCount: 0
        };
      },
      requiresConfirmation: true,
      isDestructive: true
    },
    {
      id: 'download_documents',
      name: 'Download Documents',
      description: 'Download selected documents as ZIP',
      action: async (documents) => {
        return {
          success: true,
          message: `Downloaded ${documents.length} documents`,
          processedCount: documents.length,
          failedCount: 0
        };
      }
    }
  ];

  return useBulkOperations(operations);
}
