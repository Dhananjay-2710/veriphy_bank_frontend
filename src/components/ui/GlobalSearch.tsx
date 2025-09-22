// =============================================================================
// GLOBAL SEARCH COMPONENT - Advanced Search UI
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  FileText, 
  User, 
  Users, 
  AlertTriangle,
  Briefcase,
  Loader,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { useGlobalSearch, SearchResult } from '../../hooks/useGlobalSearch';

// =============================================================================
// GLOBAL SEARCH INTERFACES
// =============================================================================

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
  showFilters?: boolean;
  maxResults?: number;
}

// =============================================================================
// GLOBAL SEARCH COMPONENT
// =============================================================================

export function GlobalSearch({
  placeholder = "Search cases, documents, users...",
  className = "",
  onResultClick,
  showFilters = true,
  maxResults = 20
}: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    results,
    isLoading,
    error,
    totalResults,
    hasSearched,
    searchTime,
    filters,
    updateQuery,
    updateFilters,
    clearSearch,
    groupedResults
  } = useGlobalSearch({
    maxResults,
    debounceMs: 300,
    minQueryLength: 2
  });

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleQueryChange = (newQuery: string) => {
    updateQuery(newQuery);
    if (newQuery.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      // Default navigation
      window.location.href = result.url;
    }
    setIsOpen(false);
  };

  const handleFilterChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...selectedTypes, type]
      : selectedTypes.filter(t => t !== type);
    
    setSelectedTypes(newTypes);
    updateFilters({ ...filters, types: newTypes.length > 0 ? newTypes : undefined });
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'case':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'user':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'customer':
        return <Users className="h-4 w-4 text-orange-600" />;
      case 'task':
        return <Briefcase className="h-4 w-4 text-indigo-600" />;
      case 'compliance_issue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'loan_application':
        return <FileText className="h-4 w-4 text-teal-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'case': return 'Cases';
      case 'document': return 'Documents';
      case 'user': return 'Users';
      case 'customer': return 'Customers';
      case 'task': return 'Tasks';
      case 'compliance_issue': return 'Compliance Issues';
      case 'loan_application': return 'Loan Applications';
      default: return type;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && (query.length >= 2 || hasSearched) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {isLoading ? 'Searching...' : `${totalResults} results`}
                </span>
                {searchTime > 0 && (
                  <span className="text-xs text-gray-500">
                    ({searchTime}ms)
                  </span>
                )}
              </div>
              
              {showFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-1"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-gray-600">Filter by type:</div>
                <div className="flex flex-wrap gap-2">
                  {['case', 'document', 'user', 'customer', 'task', 'compliance_issue', 'loan_application'].map(type => (
                    <label key={type} className="flex items-center space-x-1 text-xs">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => handleFilterChange(type, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-gray-700">{getTypeLabel(type)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">No results found</p>
                <p className="text-xs">Try different keywords or check your spelling</p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Grouped Results */}
                {Object.entries(groupedResults).map(([type, typeResults]) => (
                  <div key={type}>
                    <div className="flex items-center space-x-2 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded">
                      {getResultIcon(type)}
                      <span>{getTypeLabel(type)}</span>
                      <Badge variant="default" size="sm">{typeResults.length}</Badge>
                    </div>
                    
                    {typeResults.map((result) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        onClick={() => handleResultClick(result)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Footer */}
          {results.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600 text-center">
                Press <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded">Enter</kbd> to search
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SEARCH RESULT ITEM COMPONENT
// =============================================================================

interface SearchResultItemProps {
  result: SearchResult;
  onClick: () => void;
}

function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'review': 'bg-purple-100 text-purple-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'pending': 'bg-gray-100 text-gray-800',
      'verified': 'bg-green-100 text-green-800',
      'expired': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status] || 'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors: Record<string, string> = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800',
      'urgent': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        priorityColors[priority] || 'bg-gray-100 text-gray-800'
      }`}>
        {priority}
      </span>
    );
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2 hover:bg-gray-50 rounded-md transition-colors"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getResultIcon(result.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {result.title}
            </h4>
            <div className="flex items-center space-x-1 ml-2">
              {result.metadata.status && getStatusBadge(result.metadata.status)}
              {result.metadata.priority && getPriorityBadge(result.metadata.priority)}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            {result.description}
          </p>
          
          {result.metadata.amount && (
            <p className="text-xs text-gray-500 mt-1">
              Amount: ₹{(result.metadata.amount / 100000).toFixed(1)}L
            </p>
          )}
          
          {result.metadata.created_at && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(result.metadata.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

// =============================================================================
// SEARCH RESULT ICON HELPER
// =============================================================================

function getResultIcon(type: string) {
  switch (type) {
    case 'case':
      return <FileText className="h-4 w-4 text-blue-600" />;
    case 'document':
      return <FileText className="h-4 w-4 text-green-600" />;
    case 'user':
      return <User className="h-4 w-4 text-purple-600" />;
    case 'customer':
      return <Users className="h-4 w-4 text-orange-600" />;
    case 'task':
      return <Briefcase className="h-4 w-4 text-indigo-600" />;
    case 'compliance_issue':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case 'loan_application':
      return <FileText className="h-4 w-4 text-teal-600" />;
    default:
      return <Search className="h-4 w-4 text-gray-600" />;
  }
}
