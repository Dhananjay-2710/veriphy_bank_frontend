import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowLeft,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Eye,
  Trash2,
  Edit,
  Lock,
  Unlock,
  LogIn,
  LogOut
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface AuditLogsProps {
  onBack: () => void;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function AuditLogs({ onBack }: AuditLogsProps) {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  const fetchAuditLogs = async () => {
    if (!user?.organizationId) return;
    
    setLoading(true);
    setError(null);
    try {
      // For now, we'll generate mock audit logs since we don't have a real audit logs table
      // In a real implementation, this would fetch from SupabaseDatabaseService.getAuditLogs()
      const mockLogs: AuditLog[] = [
        {
          id: 'log-1',
          userId: user.id,
          userName: user.full_name || 'Admin User',
          userRole: user.role || 'admin',
          action: 'user_login',
          resourceType: 'user',
          resourceId: user.id,
          details: { loginMethod: 'password', sessionDuration: '8h 32m' },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          status: 'success',
          severity: 'low'
        },
        {
          id: 'log-2',
          userId: '41',
          userName: 'Priya Sharma',
          userRole: 'salesperson',
          action: 'case_approved',
          resourceType: 'case',
          resourceId: 'case-123',
          details: { caseNumber: 'VBI-PL-2025-001', loanAmount: 500000, customerName: 'Rajesh Kumar' },
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          status: 'success',
          severity: 'medium'
        },
        {
          id: 'log-3',
          userId: '42',
          userName: 'Anita Patel',
          userRole: 'credit-ops',
          action: 'document_uploaded',
          resourceType: 'document',
          resourceId: 'doc-456',
          details: { fileName: 'pan_card.pdf', fileSize: '2.3MB', caseId: 'case-123' },
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          status: 'success',
          severity: 'low'
        },
        {
          id: 'log-4',
          userId: 'unknown',
          userName: 'Unknown User',
          userRole: 'unknown',
          action: 'failed_login',
          resourceType: 'user',
          resourceId: 'unknown',
          details: { attemptedEmail: 'hacker@example.com', attempts: 5, reason: 'invalid_credentials' },
          ipAddress: '203.0.113.1',
          userAgent: 'curl/7.68.0',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
          status: 'failure',
          severity: 'high'
        },
        {
          id: 'log-5',
          userId: user.id,
          userName: user.full_name || 'Admin User',
          userRole: user.role || 'admin',
          action: 'user_created',
          resourceType: 'user',
          resourceId: 'new-user-789',
          details: { newUserEmail: 'newuser@veriphy.com', newUserRole: 'salesperson', assignedBy: user.full_name },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          status: 'success',
          severity: 'medium'
        },
        {
          id: 'log-6',
          userId: '43',
          userName: 'Rajesh Kumar',
          userRole: 'manager',
          action: 'system_settings_changed',
          resourceType: 'system',
          resourceId: 'settings-backup',
          details: { settingType: 'backup_frequency', oldValue: 'daily', newValue: 'hourly' },
          ipAddress: '192.168.1.103',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          status: 'success',
          severity: 'high'
        }
      ];

      setAuditLogs(mockLogs);
      setFilteredLogs(mockLogs);
      
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [user?.organizationId]);

  // Filter logs based on search and filters
  useEffect(() => {
    let filtered = auditLogs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    // Severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === filterSeverity);
    }

    // Date filter
    if (filterDate !== 'all') {
      const now = new Date();
      const filterDateMap: { [key: string]: number } = {
        'today': 24 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000
      };
      
      const cutoffTime = now.getTime() - (filterDateMap[filterDate] || 0);
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= cutoffTime);
    }

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, filterAction, filterSeverity, filterDate]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user_login':
        return <LogIn className="h-4 w-4 text-green-600" />;
      case 'user_logout':
        return <LogOut className="h-4 w-4 text-gray-600" />;
      case 'failed_login':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'case_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'case_rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'document_uploaded':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'user_created':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'user_updated':
        return <Edit className="h-4 w-4 text-yellow-600" />;
      case 'user_deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'system_settings_changed':
        return <Settings className="h-4 w-4 text-purple-600" />;
      case 'permission_granted':
        return <Unlock className="h-4 w-4 text-green-600" />;
      case 'permission_revoked':
        return <Lock className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success" size="sm">Success</Badge>;
      case 'failure':
        return <Badge variant="error" size="sm">Failure</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm">Warning</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge variant="info" size="sm">Low</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'critical':
        return <Badge variant="error" size="sm">Critical</Badge>;
      default:
        return <Badge size="sm">{severity}</Badge>;
    }
  };

  const getActionLabel = (action: string) => {
    const actionLabels: { [key: string]: string } = {
      'user_login': 'User Login',
      'user_logout': 'User Logout',
      'failed_login': 'Failed Login',
      'case_approved': 'Case Approved',
      'case_rejected': 'Case Rejected',
      'document_uploaded': 'Document Uploaded',
      'user_created': 'User Created',
      'user_updated': 'User Updated',
      'user_deleted': 'User Deleted',
      'system_settings_changed': 'System Settings Changed',
      'permission_granted': 'Permission Granted',
      'permission_revoked': 'Permission Revoked'
    };
    return actionLabels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const toggleLogSelection = (logId: string) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit logs...</p>
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
            <p className="text-lg font-semibold">Error Loading Audit Logs</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={fetchAuditLogs}>
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
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600">System activity and security event tracking</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchAuditLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
                <p className="text-sm text-gray-600">Total Events</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredLogs.filter(l => l.status === 'success').length}
                </p>
                <p className="text-sm text-gray-600">Successful</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {filteredLogs.filter(l => l.status === 'failure').length}
                </p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredLogs.filter(l => l.severity === 'high' || l.severity === 'critical').length}
                </p>
                <p className="text-sm text-gray-600">High Severity</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user, action, IP address, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Actions</option>
                <option value="user_login">User Login</option>
                <option value="failed_login">Failed Login</option>
                <option value="case_approved">Case Approved</option>
                <option value="document_uploaded">Document Uploaded</option>
                <option value="user_created">User Created</option>
                <option value="system_settings_changed">System Settings</option>
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Audit Logs List */}
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div 
                key={log.id}
                className={`p-4 border rounded-lg transition-colors ${
                  selectedLogs.includes(log.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedLogs.includes(log.id)}
                      onChange={() => toggleLogSelection(log.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {getActionLabel(log.action)}
                        </h3>
                        {getStatusBadge(log.status)}
                        {getSeverityBadge(log.severity)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">User:</span> {log.userName} 
                          <span className="text-gray-500"> ({log.userRole})</span>
                        </p>
                        <p>
                          <span className="font-medium">Resource:</span> {log.resourceType} 
                          {log.resourceId && <span className="text-gray-500"> - {log.resourceId}</span>}
                        </p>
                        <p>
                          <span className="font-medium">IP:</span> {log.ipAddress} 
                          <span className="text-gray-500"> • {getTimeAgo(log.timestamp)}</span>
                        </p>
                        
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <p className="font-medium text-gray-700 mb-1">Details:</p>
                            <pre className="text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log('View details for:', log.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No audit logs found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

