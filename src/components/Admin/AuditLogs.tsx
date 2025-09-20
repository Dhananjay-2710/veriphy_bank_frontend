import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Search, Filter, Download, Eye, AlertTriangle, CheckCircle, Info, Clock, RefreshCw, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface AuditLogsProps {
  onBack: () => void;
}

export function AuditLogs({ onBack }: AuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logStats, setLogStats] = useState({
    totalLogsToday: 0,
    securityEvents: 0,
    userActions: 0,
    systemEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch audit logs and stats
  const fetchAuditData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [logs, stats] = await Promise.all([
        SupabaseDatabaseService.getAuditLogs({
          searchTerm: searchTerm || undefined,
          type: selectedType !== 'all' ? selectedType : undefined,
          severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
          limit: 100
        }),
        SupabaseDatabaseService.getAuditLogStats()
      ]);

      setAuditLogs(logs);
      setLogStats(stats);
    } catch (err) {
      console.error('Error fetching audit data:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchAuditData();
  }, [searchTerm, selectedType, selectedSeverity]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = SupabaseDatabaseService.subscribeToAuditLogs((payload) => {
      console.log('New audit log received:', payload);
      // Refresh data when new audit logs are added
      fetchAuditData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter logs (now handled by the service, but keeping for client-side filtering if needed)
  const filteredLogs = auditLogs;

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
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs & Security</h1>
            <p className="text-gray-600">System security monitoring and audit trail</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" onClick={fetchAuditData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs Today', value: logStats.totalLogsToday.toLocaleString(), color: 'blue' },
          { label: 'Security Events', value: logStats.securityEvents.toLocaleString(), color: 'red' },
          { label: 'User Actions', value: logStats.userActions.toLocaleString(), color: 'green' },
          { label: 'System Events', value: logStats.systemEvents.toLocaleString(), color: 'purple' }
        ].map((stat, index) => {
          const colorClasses = {
            blue: 'text-blue-600 bg-blue-100',
            red: 'text-red-600 bg-red-100',
            green: 'text-green-600 bg-green-100',
            purple: 'text-purple-600 bg-purple-100'
          };
          
          return (
            <Card key={index}>
              <CardContent className="text-center p-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <span className="text-xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
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
          <CardTitle>Audit Trail ({filteredLogs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading audit logs...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <span>{error}</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Info className="h-6 w-6 mr-2" />
              <span>No audit logs found</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
              <div 
                key={log.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(log.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-medium text-gray-900">{log.action}</h4>
                        {getSeverityBadge(log.severity)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>User: {log.user}</span>
                        <span>IP: {log.ipAddress}</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}