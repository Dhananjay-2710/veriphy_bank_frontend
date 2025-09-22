// =============================================================================
// PAGINATION HOOK - Advanced Pagination with Supabase Integration
// =============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';

// =============================================================================
// PAGINATION INTERFACES
// =============================================================================

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface PaginationConfig {
  initialPage?: number;
  pageSize?: number;
  maxPageSize?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
}

export interface PaginationResult<T> {
  // Data
  data: T[];
  pagination: PaginationState;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Pagination controls
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
  
  // Utility functions
  refresh: () => void;
  reset: () => void;
  
  // Pagination info
  getPageInfo: () => string;
  getRangeInfo: () => string;
}

// =============================================================================
// PAGINATION HOOK
// =============================================================================

export function usePagination<T>(
  fetchFunction: (page: number, pageSize: number, filters?: any) => Promise<{
    data: T[];
    total: number;
    error?: string;
  }>,
  filters?: any,
  config: PaginationConfig = {}
): PaginationResult<T> {
  const {
    initialPage = 1,
    pageSize: initialPageSize = 10,
    maxPageSize = 100
  } = config;

  // State
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  // Computed values
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const pagination: PaginationState = {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage
  };

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(currentPage, pageSize, filters);
      
      if (result.error) {
        setError(result.error);
        setData([]);
        setTotalItems(0);
      } else {
        setData(result.data);
        setTotalItems(result.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, currentPage, pageSize, filters]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    if (size > 0 && size <= maxPageSize) {
      setPageSizeState(size);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  }, [maxPageSize]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
    setData([]);
    setTotalItems(0);
    setError(null);
  }, [initialPage, initialPageSize]);

  // Utility functions
  const getPageInfo = useCallback(() => {
    if (totalItems === 0) return 'No items';
    
    return `Page ${currentPage} of ${totalPages}`;
  }, [currentPage, totalPages, totalItems]);

  const getRangeInfo = useCallback(() => {
    if (totalItems === 0) return 'No items';
    
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    
    return `Showing ${startItem}-${endItem} of ${totalItems} items`;
  }, [currentPage, pageSize, totalItems]);

  return {
    data,
    pagination,
    loading,
    error,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
    refresh,
    reset,
    getPageInfo,
    getRangeInfo
  };
}

// =============================================================================
// PAGINATION COMPONENT HOOK
// =============================================================================

export function usePaginationControls(pagination: PaginationState) {
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const { currentPage, totalPages } = pagination;
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [pagination.currentPage, pagination.totalPages]);

  return {
    pageNumbers,
    canGoNext: pagination.hasNextPage,
    canGoPrevious: pagination.hasPreviousPage,
    isFirstPage: pagination.isFirstPage,
    isLastPage: pagination.isLastPage
  };
}

// =============================================================================
// PAGINATION UTILITIES
// =============================================================================

export function createPaginationQuery(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  return {
    from,
    to,
    limit: pageSize,
    offset: from
  };
}

export function calculatePaginationInfo(totalItems: number, pageSize: number, currentPage: number) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  return {
    totalPages,
    startItem,
    endItem,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}

// =============================================================================
// PAGINATION PRESETS
// =============================================================================

export const PAGINATION_PRESETS = {
  SMALL: { pageSize: 5, pageSizeOptions: [5, 10, 20] },
  MEDIUM: { pageSize: 10, pageSizeOptions: [5, 10, 20, 50] },
  LARGE: { pageSize: 20, pageSizeOptions: [10, 20, 50, 100] },
  EXTRA_LARGE: { pageSize: 50, pageSizeOptions: [20, 50, 100, 200] }
} as const;

// =============================================================================
// PAGINATION HOOKS FOR SPECIFIC USE CASES
// =============================================================================

export function useCasesPagination(filters?: any) {
  return usePagination(
    async (_page, _pageSize, _filters) => {
      // This would integrate with your existing useCases hook
      // For now, return a placeholder
      return { data: [], total: 0 };
    },
    filters,
    PAGINATION_PRESETS.MEDIUM
  );
}

export function useDocumentsPagination(caseId: string, filters?: any) {
  return usePagination(
    async (_page, _pageSize, _filters) => {
      // This would integrate with your existing useDocuments hook
      return { data: [], total: 0 };
    },
    { ...filters, caseId },
    PAGINATION_PRESETS.MEDIUM
  );
}

export function useUsersPagination(filters?: any) {
  return usePagination(
    async (_page, _pageSize, _filters) => {
      // This would integrate with your existing useTeamMembers hook
      return { data: [], total: 0 };
    },
    filters,
    PAGINATION_PRESETS.MEDIUM
  );
}
