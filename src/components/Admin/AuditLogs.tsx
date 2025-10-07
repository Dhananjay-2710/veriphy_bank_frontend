import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Search, Filter, Download, Eye, AlertTriangle, CheckCircle, Info, Clock, RefreshCw, Settings, ChevronLeft, ChevronRight, Calendar, User, Globe, Monitor, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { supabase } from '../../supabase-client';

interface AuditLogsProps {
  onBack: () => void;
}

export function AuditLogs({ onBack }: AuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [logStats, setLogStats] = useState({
    totalLogsToday: 0,
    securityEvents: 0,
    userActions: 0,
    systemEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch audit logs and stats
  const fetchAuditData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching admin audit logs...');
      
      // Get audit logs directly from the logs table (same approach as super admin)
      const { data: logsData, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (logsError) {
        throw new Error(`Failed to fetch audit logs: ${logsError.message}`);
      }
      
      console.log('📊 Fetched logs:', logsData?.length || 0);
      
      // Get user data separately and merge
      const userIds = logsData?.map(log => log.user_id).filter(id => id) || [];
      let usersData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, email, role')
          .in('id', userIds);
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
        } else if (users) {
          usersData = users;
        }
      }
      
      // Merge user data with logs and transform to expected format
      const mergedLogs = logsData?.map(log => {
        const user = usersData.find(u => u.id === log.user_id);
        
        // Map entity_type to component's type field
        const typeMap: Record<string, string> = {
          'user': 'user_management',
          'case': 'case_management',
          'document': 'document_access',
          'task': 'task_management',
          'system': 'system',
          'security': 'security',
          'compliance': 'compliance'
        };

        // Map action to severity based on common patterns
        const getSeverity = (action: string): string => {
          if (action.includes('failed') || action.includes('error') || action.includes('violation')) {
            return 'high';
          }
          if (action.includes('warning') || action.includes('suspicious')) {
            return 'medium';
          }
          if (action.includes('login') || action.includes('logout') || action.includes('view')) {
            return 'info';
          }
          return 'info';
        };

        return {
          id: log.id,
          action: log.action,
          type: typeMap[log.entity_type] || 'system',
          severity: log.log_type === 'error' ? 'high' : log.log_type === 'warning' ? 'medium' : getSeverity(log.action),
          details: log.description || `${log.action} on ${log.entity_type}`,
          user: user?.full_name || 'System',
          ipAddress: log.ip_address || '127.0.0.1',
          timestamp: log.created_at,
          metadata: log.metadata || {}
        };
      }) || [];

      // Apply client-side filtering
      let filteredLogs = mergedLogs;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.user.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower)
        );
      }

      if (selectedType !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.type === selectedType);
      }

      if (selectedSeverity !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.severity === selectedSeverity);
      }

      setAuditLogs(mergedLogs);
      setFilteredLogs(filteredLogs);
      
      // Calculate pagination
      const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
      setTotalPages(totalPages);
      setCurrentPage(1); // Reset to first page when filters change

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = mergedLogs.filter(log => log.timestamp.startsWith(today));
      
      setLogStats({
        totalLogsToday: todayLogs.length,
        securityEvents: todayLogs.filter(log => log.type === 'security').length,
        userActions: todayLogs.filter(log => log.type === 'user_management').length,
        systemEvents: todayLogs.filter(log => log.type === 'system').length
      });

    } catch (err) {
      console.error('Error fetching audit data:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = () => {
    let filtered = auditLogs;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.user.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.details.toLowerCase().includes(searchLower)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(log => log.type === selectedType);
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === selectedSeverity);
    }

    setFilteredLogs(filtered);
    
    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(totalPages);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Load data on component mount
  useEffect(() => {
    fetchAuditData();
  }, []);

  // Handle filter changes
  useEffect(() => {
    if (auditLogs.length > 0) {
      handleFilterChange();
    }
  }, [searchTerm, selectedType, selectedSeverity, auditLogs]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('admin-audit-logs')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'logs' },
        (payload) => {
          console.log('New audit log received:', payload);
          // Refresh data when new audit logs are added
          fetchAuditData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Pagination functions
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Format date and time
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  // Format metadata for better display - remove duplicates and improve readability
  const formatMetadata = (metadata: any, log: any) => {
    if (!metadata || Object.keys(metadata).length === 0) return null;
    
    const formatted: any = {};
    const skipKeys = ['after_state', 'before_state', 'session_id']; // Skip these as they're shown elsewhere
    
    Object.keys(metadata).forEach(key => {
      if (metadata[key] !== null && metadata[key] !== undefined && !skipKeys.includes(key)) {
        if (typeof metadata[key] === 'object') {
          // Format objects nicely
          if (key === 'page' || key === 'operation') {
            formatted[key] = String(metadata[key]);
          } else {
            formatted[key] = JSON.stringify(metadata[key], null, 2);
          }
        } else {
          formatted[key] = metadata[key];
        }
      }
    });
    
    return Object.keys(formatted).length > 0 ? formatted : null;
  };

  // Format state changes for better display
  const formatStateChange = (log: any) => {
    const beforeState = log.metadata?.before_state;
    const afterState = log.metadata?.after_state;
    
    if (!beforeState && !afterState) return null;
    
    return {
      before: beforeState || {},
      after: afterState || {}
    };
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="info" size="sm">Low</Badge>;
      case 'info':
        return <Badge variant="default" size="sm">Info</Badge>;
      default:
        return <Badge size="sm">{severity}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'user_management':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'compliance':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="h-6 w-6 text-blue-300" />
              </div>
              <h1 className="text-2xl font-bold text-white">Audit Logs & Security</h1>
            </div>
            <p className="text-gray-300 text-sm">System security monitoring and audit trail</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchAuditData} 
            disabled={loading} 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Logs Today', 
            value: logStats.totalLogsToday.toLocaleString(), 
            color: 'blue',
            icon: FileText,
            description: 'All audit events today'
          },
          { 
            label: 'Security Events', 
            value: logStats.securityEvents.toLocaleString(), 
            color: 'red',
            icon: Shield,
            description: 'Security-related events'
          },
          { 
            label: 'User Actions', 
            value: logStats.userActions.toLocaleString(), 
            color: 'green',
            icon: User,
            description: 'User management activities'
          },
          { 
            label: 'System Events', 
            value: logStats.systemEvents.toLocaleString(), 
            color: 'purple',
            icon: Settings,
            description: 'System operations'
          }
        ].map((stat, index) => {
          const colorClasses = {
            blue: 'text-blue-600 bg-blue-50 border-blue-200',
            red: 'text-red-600 bg-red-50 border-red-200',
            green: 'text-green-600 bg-green-50 border-green-200',
            purple: 'text-purple-600 bg-purple-50 border-purple-200'
          };
          
          const Icon = stat.icon;
          
          return (
            <Card key={index} className={`border-2 ${colorClasses[stat.color as keyof typeof colorClasses]} hover:shadow-lg transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses].replace('text-', 'bg-').replace('bg-', 'bg-').replace('-600', '-100')}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-gray-500">events</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{stat.label}</h3>
                  <p className="text-xs text-gray-600">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="security">Security</option>
                <option value="user_management">User Management</option>
                <option value="compliance">Compliance</option>
                <option value="system">System</option>
                <option value="document_access">Document Access</option>
              </select>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Audit Trail</span>
              <Badge variant="outline" className="ml-2">
                {filteredLogs.length} entries
              </Badge>
            </CardTitle>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading audit logs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Info className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No audit logs found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {getCurrentPageData().map((log) => {
                const { date, time } = formatDateTime(log.timestamp);
                const formattedMetadata = formatMetadata(log.metadata, log);
                const stateChange = formatStateChange(log);
                
                return (
                  <div 
                    key={log.id}
                    className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 hover:from-blue-50 hover:to-white"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTypeIcon(log.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {log.action.replace(/_/g, ' ').toUpperCase()}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {getSeverityBadge(log.severity)}
                            <span className="text-sm text-gray-500">
                              {log.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{date}</div>
                        <div className="text-sm font-medium text-gray-700">{time}</div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                      {log.details}
                    </p>

                    {/* State Changes - Only show if meaningful */}
                    {stateChange && Object.keys(stateChange.after).length > 0 && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Changes Made
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(stateChange.after).map(([key, value]) => (
                            <div key={key} className="flex items-start space-x-2 text-sm">
                              <span className="font-medium text-blue-800 min-w-0 flex-shrink-0">
                                {key.replace(/_/g, ' ')}:
                              </span>
                              <span className="text-blue-700 font-mono bg-white px-2 py-1 rounded text-xs">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* User Info - Compact */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{log.user}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Globe className="h-4 w-4 text-green-500" />
                          <span className="font-mono text-xs">{log.ipAddress}</span>
                        </div>
                      </div>
                      
                      {/* Additional metadata - only if meaningful */}
                      {formattedMetadata && Object.keys(formattedMetadata).length > 0 && (
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {Object.keys(formattedMetadata).length} additional details
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expandable Additional Details */}
                    {formattedMetadata && Object.keys(formattedMetadata).length > 0 && (
                      <details className="mt-3 group">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                          <Monitor className="h-4 w-4 mr-1" />
                          View Additional Details
                          <span className="ml-2 text-xs text-gray-500">
                            ({Object.keys(formattedMetadata).length} items)
                          </span>
                        </summary>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                          <div className="space-y-2 text-xs">
                            {Object.entries(formattedMetadata).map(([key, value]) => (
                              <div key={key} className="flex items-start space-x-2">
                                <span className="font-medium text-gray-600 min-w-0 flex-shrink-0 w-20">
                                  {key.replace(/_/g, ' ')}:
                                </span>
                                <span className="text-gray-700 font-mono break-all">
                                  {typeof value === 'string' && value.length > 80 
                                    ? `${value.substring(0, 80)}...` 
                                    : String(value)
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {filteredLogs.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <span>Showing</span>
                <span className="font-medium">
                  {((currentPage - 1) * itemsPerPage) + 1}
                </span>
                <span>to</span>
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
                </span>
                <span>of</span>
                <span className="font-medium">{filteredLogs.length}</span>
                <span>results</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}