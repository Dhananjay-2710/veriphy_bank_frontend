import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Server, 
  Database, 
  Wifi, 
  Shield, 
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  Bell,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useSystemAlerts, useAdminDashboardStats } from '../../hooks/useDashboardData';

interface SystemHealthMonitorProps {
  onBack?: () => void;
}

interface SystemMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  lastChecked: string;
  icon: React.ComponentType<any>;
}

export function SystemHealthMonitor({ onBack }: SystemHealthMonitorProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const { alerts: systemAlerts, loading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useSystemAlerts();
  const { stats: adminStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useAdminDashboardStats();

  // Mock system metrics (in a real app, these would come from monitoring APIs)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: 'API Server',
      status: 'healthy',
      value: '99.9%',
      change: '+0.1%',
      trend: 'up',
      lastChecked: new Date().toISOString(),
      icon: Server
    },
    {
      name: 'Database',
      status: 'healthy',
      value: '99.8%',
      change: '+0.2%',
      trend: 'up',
      lastChecked: new Date().toISOString(),
      icon: Database
    },
    {
      name: 'WhatsApp Integration',
      status: 'healthy',
      value: '100%',
      change: '0%',
      trend: 'stable',
      lastChecked: new Date().toISOString(),
      icon: Wifi
    },
    {
      name: 'Document Storage',
      status: 'warning',
      value: '97.2%',
      change: '-1.8%',
      trend: 'down',
      lastChecked: new Date().toISOString(),
      icon: Database
    },
    {
      name: 'Security System',
      status: 'healthy',
      value: '99.5%',
      change: '+0.3%',
      trend: 'up',
      lastChecked: new Date().toISOString(),
      icon: Shield
    },
    {
      name: 'Response Time',
      status: 'healthy',
      value: '95ms',
      change: '-5ms',
      trend: 'up',
      lastChecked: new Date().toISOString(),
      icon: Clock
    }
  ]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchAlerts();
      refetchStats();
      // Update last checked times
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        lastChecked: new Date().toISOString()
      })));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetchAlerts, refetchStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="success" size="sm">Healthy</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm">Warning</Badge>;
      case 'critical':
        return <Badge variant="error" size="sm">Critical</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleRefresh = () => {
    refetchAlerts();
    refetchStats();
    setSystemMetrics(prev => prev.map(metric => ({
      ...metric,
      lastChecked: new Date().toISOString()
    })));
  };

  if (alertsLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system health data...</p>
        </div>
      </div>
    );
  }

  if (alertsError || statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading System Health</p>
            <p className="text-sm text-gray-600 mt-2">
              {alertsError || statsError}
            </p>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">System Health Monitor</h1>
          <p className="text-gray-300">Real-time monitoring of VERIPHY banking infrastructure</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Auto-refresh:</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
          </div>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!autoRefresh}
          >
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>1m</option>
            <option value={300}>5m</option>
          </select>
          <Button variant="outline" onClick={handleRefresh} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {onBack && (
            <Button variant="outline" onClick={onBack} style={{ background: '#ffffff', color: '#374151' }}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center">
            <div className="p-3 rounded-lg text-green-600 bg-green-100">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {systemMetrics.filter(m => m.status === 'healthy').length}
              </p>
              <p className="text-sm text-gray-600">Healthy Systems</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center">
            <div className="p-3 rounded-lg text-yellow-600 bg-yellow-100">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {systemMetrics.filter(m => m.status === 'warning').length}
              </p>
              <p className="text-sm text-gray-600">Warning Systems</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center">
            <div className="p-3 rounded-lg text-red-600 bg-red-100">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {systemMetrics.filter(m => m.status === 'critical').length}
              </p>
              <p className="text-sm text-gray-600">Critical Systems</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center">
            <div className="p-3 rounded-lg text-blue-600 bg-blue-100">
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{adminStats?.securityAlerts || 0}</p>
              <p className="text-sm text-gray-600">Active Alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="ml-3 font-medium text-gray-900">{metric.name}</h3>
                    </div>
                    {getStatusBadge(metric.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                      <div className="flex items-center">
                        {getTrendIcon(metric.trend)}
                        <span className={`ml-1 text-sm ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Last checked: {new Date(metric.lastChecked).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active System Alerts</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-1" />
                Configure Alerts
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {systemAlerts.length > 0 ? (
            <div className="space-y-4">
              {systemAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        alert.severity === 'high' ? 'text-red-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge 
                        variant={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'} 
                        size="sm"
                      >
                        {alert.severity}
                      </Badge>
                      <Badge 
                        variant={alert.status === 'investigating' ? 'warning' : 
                                alert.status === 'action_required' ? 'error' : 'info'} 
                        size="sm"
                      >
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Systems Operational</h3>
              <p className="text-gray-600">No active alerts at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {Array.from({ length: 24 }, (_, i) => {
              const hour = new Date(Date.now() - (23 - i) * 60 * 60 * 1000).getHours();
              const uptime = 95 + Math.random() * 5; // Mock data
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${uptime * 2}px` }}
                    title={`${hour}:00 - ${uptime.toFixed(1)}% uptime`}
                  ></div>
                  <p className="text-xs text-gray-600 mt-2">{hour}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
