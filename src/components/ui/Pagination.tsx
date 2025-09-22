// =============================================================================
// PAGINATION COMPONENT - Advanced Pagination UI
// =============================================================================

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from './Button';
import { usePaginationControls } from '../../hooks/usePagination';

// =============================================================================
// PAGINATION INTERFACES
// =============================================================================

interface PaginationProps {
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
  className?: string;
  compact?: boolean;
}

// =============================================================================
// PAGINATION COMPONENT
// =============================================================================

export function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  showSizeChanger = true,
  showQuickJumper = true,
  showTotal = true,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className = ''
}: PaginationProps) {
  const { pageNumbers, canGoNext, canGoPrevious, isFirstPage, isLastPage } = usePaginationControls(pagination);

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value);
    onPageSizeChange?.(newSize);
  };

  const handleQuickJump = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const page = parseInt(event.currentTarget.value);
      if (page >= 1 && page <= pagination.totalPages) {
        onPageChange(page);
        event.currentTarget.value = '';
      }
    }
  };

  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Left side - Page info and size changer */}
      <div className="flex items-center space-x-4">
        {showTotal && (
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
        )}
        
        {showSizeChanger && onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <label htmlFor="page-size" className="text-sm text-gray-700">
              Show:
            </label>
            <select
              id="page-size"
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
        )}
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          className="p-2"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!canGoPrevious}
          className="p-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <div className="px-3 py-2 text-gray-500">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              ) : (
                <Button
                  variant={page === pagination.currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(page)}
                  className={`px-3 py-2 ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!canGoNext}
          className="p-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.totalPages)}
          disabled={isLastPage}
          className="p-2"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick jumper */}
      {showQuickJumper && (
        <div className="flex items-center space-x-2 ml-4">
          <span className="text-sm text-gray-700">Go to:</span>
          <input
            type="number"
            min="1"
            max={pagination.totalPages}
            onKeyDown={handleQuickJump}
            placeholder="Page"
            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPACT PAGINATION COMPONENT
// =============================================================================

interface CompactPaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  onPageChange: (page: number) => void;
  className?: string;
}

export function CompactPagination({
  pagination,
  onPageChange,
  className = ''
}: CompactPaginationProps) {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPreviousPage}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      
      <span className="text-sm text-gray-700 px-3">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasNextPage}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// =============================================================================
// PAGINATION INFO COMPONENT
// =============================================================================

interface PaginationInfoProps {
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  className?: string;
}

export function PaginationInfo({ pagination, className = '' }: PaginationInfoProps) {
  const startItem = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems);

  return (
    <div className={`text-sm text-gray-600 ${className}`}>
      {pagination.totalItems === 0 ? (
        'No items found'
      ) : (
        `Showing ${startItem}-${endItem} of ${pagination.totalItems} items`
      )}
    </div>
  );
}

// =============================================================================
// PAGINATION LOADING COMPONENT
// =============================================================================

interface PaginationLoadingProps {
  className?: string;
}

export function PaginationLoading({ className = '' }: PaginationLoadingProps) {
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-sm text-gray-600">Loading...</span>
    </div>
  );
}
