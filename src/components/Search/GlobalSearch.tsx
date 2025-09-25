import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  FileText, 
  Users, 
  Briefcase, 
  Shield, 
  MessageCircle,
  Calendar,
  Tag,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useNavigation } from '../../contexts/NavigationContext';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface GlobalSearchProps {
  placeholder?: string;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

interface SearchResult {
  id: string;
  type: 'case' | 'user' | 'document' | 'task' | 'customer' | 'notification';
  title: string;
  description: string;
  status?: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
  icon: React.ComponentType<any>;
}

interface SearchFilters {
  type: string[];
  status: string[];
  priority: string[];
  dateRange: {
    start: string;
    end: string;
  };
  assignedTo?: string;
}

export function GlobalSearch({ 
  placeholder = "Search cases, users, documents...", 
  onResultClick,
  className = ""
}: GlobalSearchProps) {
  const { user } = useAuth();
  const { navigateDirect } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    status: [],
    priority: [],
    dateRange: { start: '', end: '' }
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const performSearch = useCallback(async (term: string, searchFilters: SearchFilters) => {
    if (!term.trim() || !user) return;

    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search cases
      if (searchFilters.type.length === 0 || searchFilters.type.includes('case')) {
        const cases = await SupabaseDatabaseService.searchCases(term, {
          organizationId: user.organization_id,
          status: searchFilters.status,
          assignedTo: searchFilters.assignedTo
        });
        
        cases.forEach((case_: any) => {
          searchResults.push({
            id: case_.id,
            type: 'case',
            title: case_.case_number,
            description: `Customer: ${case_.customer?.name || 'Unknown'} - ${case_.loan_amount ? `₹${case_.loan_amount.toLocaleString()}` : 'Amount not set'}`,
            status: case_.status,
            priority: case_.priority,
            createdAt: case_.created_at,
            updatedAt: case_.updated_at,
            metadata: { caseId: case_.id, customerId: case_.customer_id },
            icon: FileText
          });
        });
      }

      // Search users
      if (searchFilters.type.length === 0 || searchFilters.type.includes('user')) {
        const users = await SupabaseDatabaseService.searchUsers(term, {
          organizationId: user.organization_id
        });
        
        users.forEach((user: any) => {
          searchResults.push({
            id: user.id,
            type: 'user',
            title: user.full_name,
            description: `${user.role} - ${user.email}`,
            status: user.status,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            metadata: { userId: user.id },
            icon: Users
          });
        });
      }

      // Search documents
      if (searchFilters.type.length === 0 || searchFilters.type.includes('document')) {
        const documents = await SupabaseDatabaseService.searchDocuments(term, {
          organizationId: user.organization_id,
          status: searchFilters.status
        });
        
        documents.forEach((doc: any) => {
          searchResults.push({
            id: doc.id,
            type: 'document',
            title: doc.name,
            description: `${doc.document_type} - ${doc.customer?.name || 'Unknown Customer'}`,
            status: doc.status,
            createdAt: doc.created_at,
            updatedAt: doc.updated_at,
            metadata: { documentId: doc.id, caseId: doc.case_id },
            icon: Shield
          });
        });
      }

      // Search tasks
      if (searchFilters.type.length === 0 || searchFilters.type.includes('task')) {
        const tasks = await SupabaseDatabaseService.searchTasks(term, {
          organizationId: user.organization_id,
          status: searchFilters.status,
          priority: searchFilters.priority
        });
        
        tasks.forEach((task: any) => {
          searchResults.push({
            id: task.id,
            type: 'task',
            title: task.title,
            description: `${task.task_type} - Assigned to: ${task.assigned_user?.name || 'Unassigned'}`,
            status: task.status,
            priority: task.priority,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            metadata: { taskId: task.id },
            icon: Briefcase
          });
        });
      }

      // Search customers
      if (searchFilters.type.length === 0 || searchFilters.type.includes('customer')) {
        const customers = await SupabaseDatabaseService.searchCustomers(term, {
          organizationId: user.organization_id
        });
        
        customers.forEach((customer: any) => {
          searchResults.push({
            id: customer.id,
            type: 'customer',
            title: customer.name,
            description: `${customer.email} - ${customer.phone}`,
            status: customer.status,
            createdAt: customer.created_at,
            updatedAt: customer.updated_at,
            metadata: { customerId: customer.id },
            icon: Users
          });
        });
      }

      // Sort results by relevance and recency
      searchResults.sort((a, b) => {
        // First by title match (exact matches first)
        const aExact = a.title.toLowerCase().includes(term.toLowerCase());
        const bExact = b.title.toLowerCase().includes(term.toLowerCase());
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then by update date (newer first)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      setResults(searchResults.slice(0, 10)); // Limit to 10 results
      setShowResults(true);

      // Save to recent searches
      const newRecentSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user, recentSearches]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      performSearch(term, filters);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    
    if (onResultClick) {
      onResultClick(result);
      return;
    }

    // Default navigation behavior
    switch (result.type) {
      case 'case':
        navigateDirect(`/case/${result.metadata.caseId}`);
        break;
      case 'user':
        navigateDirect(`/user-management?user=${result.metadata.userId}`);
        break;
      case 'document':
        navigateDirect(`/document-manager/${result.metadata.caseId}?document=${result.metadata.documentId}`);
        break;
      case 'task':
        navigateDirect(`/workload?task=${result.metadata.taskId}`);
        break;
      case 'customer':
        navigateDirect(`/customers?customer=${result.metadata.customerId}`);
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'verified':
      case 'approved':
        return <Badge variant="success" size="sm">{status}</Badge>;
      case 'pending':
      case 'in_progress':
        return <Badge variant="warning" size="sm">{status}</Badge>;
      case 'inactive':
      case 'rejected':
        return <Badge variant="error" size="sm">{status}</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="success" size="sm">Low</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'case': return FileText;
      case 'user': return Users;
      case 'document': return Shield;
      case 'task': return Briefcase;
      case 'customer': return Users;
      case 'notification': return MessageCircle;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'case': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-green-600 bg-green-100';
      case 'document': return 'text-purple-600 bg-purple-100';
      case 'task': return 'text-orange-600 bg-orange-100';
      case 'customer': return 'text-indigo-600 bg-indigo-100';
      case 'notification': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Filter className="h-4 w-4" />
          </button>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setResults([]);
                setShowResults(false);
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Types</label>
                <div className="flex flex-wrap gap-2">
                  {['case', 'user', 'document', 'task', 'customer'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          type: prev.type.includes(type)
                            ? prev.type.filter(t => t !== type)
                            : [...prev.type, type]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filters.type.includes(type)
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['active', 'pending', 'completed', 'rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          status: prev.status.includes(status)
                            ? prev.status.filter(s => s !== status)
                            : [...prev.status, status]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filters.status.includes(status)
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (searchTerm.trim()) {
                      performSearch(searchTerm, filters);
                    }
                    setShowFilters(false);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-40 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {results.map((result) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </h4>
                            <Badge variant="outline" size="sm">
                              {result.type}
                            </Badge>
                            {result.status && getStatusBadge(result.status)}
                            {result.priority && getPriorityBadge(result.priority)}
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {result.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Updated {new Date(result.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : searchTerm.trim() ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No results found for "{searchTerm}"</p>
                <p className="text-xs mt-1">Try different keywords or check your filters</p>
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Searches</h4>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <Clock className="h-3 w-3 inline mr-2" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Start typing to search</p>
                <p className="text-xs mt-1">Search across cases, users, documents, and more</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
