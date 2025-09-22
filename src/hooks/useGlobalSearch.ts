// =============================================================================
// GLOBAL SEARCH HOOK - Advanced Search Across All Components
// =============================================================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import { SupabaseDatabaseService } from '../services/supabase-database';

// =============================================================================
// SEARCH INTERFACES
// =============================================================================

export interface SearchResult {
  id: string;
  type: 'case' | 'document' | 'user' | 'customer' | 'task' | 'compliance_issue' | 'loan_application';
  title: string;
  description: string;
  url: string;
  metadata: Record<string, any>;
  score: number;
  highlightedText?: string;
}

export interface SearchFilters {
  types?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
}

export interface SearchConfig {
  maxResults?: number;
  debounceMs?: number;
  minQueryLength?: number;
  enableFuzzySearch?: boolean;
  enableHighlighting?: boolean;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  hasSearched: boolean;
  searchTime: number;
}

// =============================================================================
// GLOBAL SEARCH HOOK
// =============================================================================

export function useGlobalSearch(config: SearchConfig = {}) {
  const {
    maxResults = 50,
    debounceMs = 300,
    minQueryLength = 2
  } = config;

  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    totalResults: 0,
    hasSearched: false,
    searchTime: 0
  });

  const [filters, setFilters] = useState<SearchFilters>({});
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Search function
  const search = useCallback(async (query: string, searchFilters: SearchFilters = {}) => {
    if (query.length < minQueryLength) {
      setState(prev => ({
        ...prev,
        query,
        results: [],
        totalResults: 0,
        hasSearched: false
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      query,
      isLoading: true,
      error: null
    }));

    const startTime = Date.now();

    try {
      const results = await performGlobalSearch(query, searchFilters, maxResults);
      const searchTime = Date.now() - startTime;

      setState(prev => ({
        ...prev,
        results,
        totalResults: results.length,
        isLoading: false,
        hasSearched: true,
        searchTime
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed',
        results: [],
        totalResults: 0
      }));
    }
  }, [maxResults, minQueryLength]);

  // Debounced search
  const debouncedSearch = useCallback((query: string, searchFilters: SearchFilters = {}) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      search(query, searchFilters);
    }, debounceMs);

    setDebounceTimer(timer);
  }, [search, debounceMs, debounceTimer]);

  // Update query
  const updateQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
    debouncedSearch(query, filters);
  }, [debouncedSearch, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (state.query.length >= minQueryLength) {
      debouncedSearch(state.query, newFilters);
    }
  }, [state.query, debouncedSearch, minQueryLength]);

  // Clear search
  const clearSearch = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      totalResults: 0,
      hasSearched: false,
      error: null
    }));
    setFilters({});
  }, [debounceTimer]);

  // Get search suggestions
  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < minQueryLength) return [];

    try {
      // Get suggestions from recent searches, popular terms, etc.
      const suggestions = await getSearchSuggestions(query);
      return suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }, [minQueryLength]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    
    state.results.forEach(result => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type].push(result);
    });

    return groups;
  }, [state.results]);

  // Get result counts by type
  const resultCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    Object.entries(groupedResults).forEach(([type, results]) => {
      counts[type] = results.length;
    });

    return counts;
  }, [groupedResults]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    // State
    query: state.query,
    results: state.results,
    isLoading: state.isLoading,
    error: state.error,
    totalResults: state.totalResults,
    hasSearched: state.hasSearched,
    searchTime: state.searchTime,
    filters,

    // Actions
    updateQuery,
    updateFilters,
    clearSearch,
    search: debouncedSearch,

    // Computed values
    groupedResults,
    resultCounts,

    // Utilities
    getSuggestions
  };
}

// =============================================================================
// SEARCH IMPLEMENTATION
// =============================================================================

async function performGlobalSearch(
  query: string, 
  filters: SearchFilters, 
  maxResults: number
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    // Search cases
    if (!filters.types || filters.types.includes('case')) {
      const cases = await SupabaseDatabaseService.searchCases(query, {
        limit: Math.floor(maxResults * 0.4) // 40% of results
      });
      
      results.push(...cases.map(case_ => ({
        id: case_.id,
        type: 'case' as const,
        title: `Case #${case_.caseNumber}`,
        description: `${case_.customer.name} - ${case_.customer.loanType}`,
        url: `/case/${case_.id}`,
        metadata: {
          status: case_.status,
          priority: case_.priority,
          amount: case_.customer.loanAmount,
          created_at: case_.createdAt
        },
        score: calculateRelevanceScore(query, case_.caseNumber + ' ' + case_.customer.name)
      })));
    }

    // Search documents
    if (!filters.types || filters.types.includes('document')) {
      const documents = await SupabaseDatabaseService.searchDocuments(query, {
        limit: Math.floor(maxResults * 0.3) // 30% of results
      });
      
      results.push(...documents.map(doc => ({
        id: doc.id,
        type: 'document' as const,
        title: doc.name,
        description: `${doc.type} - ${doc.status}`,
        url: `/document-manager/${doc.caseId}`,
        metadata: {
          type: doc.type,
          status: doc.status,
          size: doc.size,
          uploaded_at: doc.uploadedAt
        },
        score: calculateRelevanceScore(query, doc.name + ' ' + doc.type)
      })));
    }

    // Search users
    if (!filters.types || filters.types.includes('user')) {
      const users = await SupabaseDatabaseService.searchUsers(query, {
        limit: Math.floor(maxResults * 0.2) // 20% of results
      });
      
      results.push(...users.map(user => ({
        id: user.id,
        type: 'user' as const,
        title: user.full_name,
        description: `${user.role} - ${user.email}`,
        url: `/user/${user.id}`,
        metadata: {
          role: user.role,
          email: user.email,
          status: user.status,
          department: user.department?.name
        },
        score: calculateRelevanceScore(query, user.full_name + ' ' + user.email)
      })));
    }

    // Search customers
    if (!filters.types || filters.types.includes('customer')) {
      const customers = await SupabaseDatabaseService.searchCustomers(query, {
        limit: Math.floor(maxResults * 0.1) // 10% of results
      });
      
      results.push(...customers.map(customer => ({
        id: customer.id,
        type: 'customer' as const,
        title: customer.name,
        description: `${customer.phone} - ${customer.loanType}`,
        url: `/customer/${customer.id}`,
        metadata: {
          phone: customer.phone,
          loan_type: customer.loanType,
          status: customer.status,
          created_at: customer.createdAt
        },
        score: calculateRelevanceScore(query, customer.name + ' ' + customer.phone)
      })));
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Apply additional filters
    let filteredResults = results;

    if (filters.status && filters.status.length > 0) {
      filteredResults = filteredResults.filter(result => 
        filters.status!.includes(result.metadata.status)
      );
    }

    if (filters.priority && filters.priority.length > 0) {
      filteredResults = filteredResults.filter(result => 
        filters.priority!.includes(result.metadata.priority)
      );
    }

    if (filters.assignedTo && filters.assignedTo.length > 0) {
      filteredResults = filteredResults.filter(result => 
        filters.assignedTo!.includes(result.metadata.assignedTo)
      );
    }

    return filteredResults.slice(0, maxResults);

  } catch (error) {
    console.error('Global search error:', error);
    throw error;
  }
}

// =============================================================================
// SEARCH UTILITIES
// =============================================================================

function calculateRelevanceScore(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  let score = 0;
  
  // Exact match
  if (textLower === queryLower) {
    score += 100;
  }
  // Starts with query
  else if (textLower.startsWith(queryLower)) {
    score += 80;
  }
  // Contains query
  else if (textLower.includes(queryLower)) {
    score += 60;
  }
  // Word boundary match
  else if (new RegExp(`\\b${queryLower}`, 'i').test(textLower)) {
    score += 40;
  }
  // Fuzzy match (simple implementation)
  else if (fuzzyMatch(queryLower, textLower)) {
    score += 20;
  }
  
  return score;
}

function fuzzyMatch(query: string, text: string): boolean {
  // Simple fuzzy matching - check if all query characters appear in order
  let queryIndex = 0;
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === query.length;
}

async function getSearchSuggestions(query: string): Promise<string[]> {
  // This would typically come from a search suggestions API
  // For now, return some mock suggestions
  const mockSuggestions = [
    'Case #12345',
    'John Doe',
    'Home Loan',
    'Document Upload',
    'High Priority',
    'Approved Status'
  ];
  
  return mockSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);
}

// =============================================================================
// SEARCH HOOKS FOR SPECIFIC USE CASES
// =============================================================================

export function useCaseSearch() {
  return useGlobalSearch({
    maxResults: 20,
    debounceMs: 300,
    minQueryLength: 2
  });
}

export function useDocumentSearch() {
  return useGlobalSearch({
    maxResults: 15,
    debounceMs: 200,
    minQueryLength: 1
  });
}

export function useUserSearch() {
  return useGlobalSearch({
    maxResults: 10,
    debounceMs: 300,
    minQueryLength: 2
  });
}
