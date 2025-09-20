import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  BarChart3, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  Lock,
  Unlock,
  Tag,
  Hash,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { 
  useCacheStatistics, 
  useCacheHitRatio, 
  useMigrations, 
  useCacheInvalidationLogs 
} from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface CacheManagementPageProps {
  onNavigateToSystemSettings?: () => void;
  onNavigateToPerformanceMonitor?: () => void;
}

export function CacheManagementPage({ 
  onNavigateToSystemSettings,
  onNavigateToPerformanceMonitor
}: CacheManagementPageProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    cacheType?: string;
    days?: number;
    organizationId?: string;
  }>({});
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isClearingLocks, setIsClearingLocks] = useState(false);
  const [showCacheStats, setShowCacheStats] = useState(true);
  const [showMigrations, setShowMigrations] = useState(false);
  const [showInvalidationLogs, setShowInvalidationLogs] = useState(false);
  
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { data: cacheStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useCacheStatistics(
    selectedFilters.organizationId, 
    selectedFilters.cacheType, 
    selectedFilters.days || 7
  );
  
  const { data: hitRatios, loading: hitRatioLoading, error: hitRatioError, refetch: refetchHitRatios } = useCacheHitRatio(
    selectedFilters.organizationId, 
    selectedFilters.cacheType, 
    selectedFilters.days || 7
  );
  
  const { data: migrations, loading: migrationsLoading, error: migrationsError, refetch: refetchMigrations } = useMigrations();
  
  const { data: invalidationLogs, loading: logsLoading, error: logsError, refetch: refetchLogs } = useCacheInvalidationLogs(
    selectedFilters.organizationId, 
    50
  );

  // Handle cache operations
  const handleClearExpiredCache = async () => {
    try {
      setIsClearingCache(true);
      await SupabaseDatabaseService.clearExpiredCache();
      refetchStats();
      refetchLogs();
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleClearExpiredLocks = async () => {
    try {
      setIsClearingLocks(true);
      await SupabaseDatabaseService.clearExpiredCacheLocks();
      refetchStats();
    } catch (error) {
      console.error('Error clearing expired locks:', error);
    } finally {
      setIsClearingLocks(false);
    }
  };

  const handleInvalidateByTags = async (tags: string[]) => {
    try {
      if (!selectedFilters.organizationId) return;
      await SupabaseDatabaseService.invalidateCacheByTags(selectedFilters.organizationId, tags, user?.id || 'system');
      refetchStats();
      refetchLogs();
    } catch (error) {
      console.error('Error invalidating cache by tags:', error);
    }
  };

  // Calculate summary statistics
  const totalRequests = cacheStats.reduce((sum, stat) => sum + stat.totalRequests, 0);
  const totalHits = cacheStats.reduce((sum, stat) => sum + stat.cacheHits, 0);
  const totalMisses = cacheStats.reduce((sum, stat) => sum + stat.cacheMisses, 0);
  const overallHitRatio = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
  const totalSizeBytes = cacheStats.reduce((sum, stat) => sum + stat.totalSizeBytes, 0);
  const totalErrors = cacheStats.reduce((sum, stat) => sum + stat.errorCount, 0);

  // Loading state
  if (statsLoading && hitRatioLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cache management data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError || hitRatioError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Cache Data</p>
            <p className="text-sm text-gray-600 mt-2">{statsError || hitRatioError}</p>
          </div>
          <Button onClick={() => { refetchStats(); refetchHitRatios(); }}>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cache Management</h1>
          <p className="text-gray-600">Monitor and manage application caching performance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => { refetchStats(); refetchHitRatios(); refetchMigrations(); refetchLogs(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button variant="outline" onClick={onNavigateToSystemSettings}>
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
          <Button variant="outline" onClick={onNavigateToPerformanceMonitor}>
            <Activity className="h-4 w-4 mr-2" />
            Performance Monitor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{totalRequests.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hit Ratio</p>
                <p className="text-2xl font-bold text-green-600">{overallHitRatio.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(totalSizeBytes / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{totalErrors}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cache Type</label>
              <select
                value={selectedFilters.cacheType || ''}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, cacheType: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="general">General</option>
                <option value="query">Query</option>
                <option value="session">Session</option>
                <option value="api_response">API Response</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedFilters.days || 7}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Last 24 Hours</option>
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => setSelectedFilters({})}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Cache Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleClearExpiredCache}
              disabled={isClearingCache}
              variant="outline"
              className="flex items-center justify-center"
            >
              {isClearingCache ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Expired Cache
            </Button>
            
            <Button 
              onClick={handleClearExpiredLocks}
              disabled={isClearingLocks}
              variant="outline"
              className="flex items-center justify-center"
            >
              {isClearingLocks ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Unlock className="h-4 w-4 mr-2" />
              )}
              Clear Expired Locks
            </Button>
            
            <Button 
              onClick={() => handleInvalidateByTags(['general'])}
              variant="outline"
              className="flex items-center justify-center"
            >
              <Tag className="h-4 w-4 mr-2" />
              Invalidate by Tags
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => { setShowCacheStats(true); setShowMigrations(false); setShowInvalidationLogs(false); }}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showCacheStats 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Cache Statistics
        </button>
        <button
          onClick={() => { setShowCacheStats(false); setShowMigrations(true); setShowInvalidationLogs(false); }}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showMigrations 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Database className="h-4 w-4 inline mr-2" />
          Migrations
        </button>
        <button
          onClick={() => { setShowCacheStats(false); setShowMigrations(false); setShowInvalidationLogs(true); }}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showInvalidationLogs 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Invalidation Logs
        </button>
      </div>

      {/* Cache Statistics */}
      {showCacheStats && (
        <div className="space-y-6">
          {/* Hit Ratio Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Hit Ratios</CardTitle>
            </CardHeader>
            <CardContent>
              {hitRatios.length > 0 ? (
                <div className="space-y-4">
                  {hitRatios.map((ratio, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">{ratio.cacheType}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {(ratio.hitRatio * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {ratio.cacheHits.toLocaleString()} hits / {ratio.totalRequests.toLocaleString()} requests
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hit ratio data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {cacheStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hits</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Misses</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hit Ratio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cacheStats.map((stat, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(stat.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{stat.cacheType}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stat.totalRequests.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {stat.cacheHits.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {stat.cacheMisses.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stat.totalRequests > 0 ? ((stat.cacheHits / stat.totalRequests) * 100).toFixed(1) : 0}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(stat.totalSizeBytes / 1024 / 1024).toFixed(1)} MB
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stat.averageResponseTimeMs.toFixed(2)} ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No cache statistics available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Migrations */}
      {showMigrations && (
        <Card>
          <CardHeader>
            <CardTitle>Database Migrations</CardTitle>
          </CardHeader>
          <CardContent>
            {migrations.length > 0 ? (
              <div className="space-y-4">
                {migrations.map((migration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {migration.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : migration.status === 'failed' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{migration.migrationName}</div>
                        <div className="text-sm text-gray-600">
                          Version: {migration.migrationVersion} | Type: {migration.migrationType}
                        </div>
                        <div className="text-sm text-gray-500">
                          Applied: {new Date(migration.appliedAt).toLocaleString()} by {migration.appliedBy}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={migration.status === 'success' ? 'default' : migration.status === 'failed' ? 'destructive' : 'secondary'}
                      >
                        {migration.status}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">
                        {migration.executionTimeMs}ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No migrations found
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invalidation Logs */}
      {showInvalidationLogs && (
        <Card>
          <CardHeader>
            <CardTitle>Cache Invalidation Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {invalidationLogs.length > 0 ? (
              <div className="space-y-4">
                {invalidationLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Hash className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{log.cacheKey}</div>
                        <div className="text-sm text-gray-600">
                          Type: {log.invalidationType} | Reason: {log.invalidationReason}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(log.invalidatedAt).toLocaleString()} by {log.invalidatedBy}
                        </div>
                        {log.affectedTags.length > 0 && (
                          <div className="flex space-x-1 mt-1">
                            {log.affectedTags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">
                        {log.cacheSizeBefore.toLocaleString()} → {log.cacheSizeAfter.toLocaleString()} bytes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No invalidation logs found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
