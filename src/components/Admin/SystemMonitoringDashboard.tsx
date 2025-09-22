import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Network, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  Eye,
  Zap,
  Shield,
  Globe,
  Users,
  FileText,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    load_average: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    cached: number;
    usage_percent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage_percent: number;
    iops_read: number;
    iops_write: number;
  };
  network: {
    bytes_in: number;
    bytes_out: number;
    packets_in: number;
    packets_out: number;
    connections: number;
  };
  database: {
    connections: number;
    max_connections: number;
    queries_per_second: number;
    cache_hit_ratio: number;
    slow_queries: number;
    table_locks: number;
  };
  application: {
    uptime: number;
    response_time: number;
    error_rate: number;
    active_sessions: number;
    requests_per_minute: number;
    queue_length: number;
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  component: 'cpu' | 'memory' | 'disk' | 'network' | 'database' | 'application';
  value?: number;
  threshold?: number;
  acknowledged: boolean;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  uptime: string;
  response_time: number;
  last_check: string;
  endpoint?: string;
}

const SERVICES: ServiceStatus[] = [
  {
    name: 'Web Application',
    status: 'healthy',
    uptime: '99.98%',
    response_time: 127,
    last_check: '30s ago',
    endpoint: '/api/health'
  },
  {
    name: 'Database',
    status: 'healthy',
    uptime: '99.95%',
    response_time: 45,
    last_check: '15s ago'
  },
  {
    name: 'Authentication Service',
    status: 'healthy',
    uptime: '99.99%',
    response_time: 89,
    last_check: '20s ago',
    endpoint: '/auth/health'
  },
  {
    name: 'File Storage',
    status: 'warning',
    uptime: '99.92%',
    response_time: 234,
    last_check: '45s ago'
  },
  {
    name: 'Notification Service',
    status: 'healthy',
    uptime: '99.96%',
    response_time: 156,
    last_check: '25s ago'
  },
  {
    name: 'Backup Service',
    status: 'maintenance',
    uptime: '99.88%',
    response_time: 0,
    last_check: '2h ago'
  }
];

export function SystemMonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>(SERVICES);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [timeRange, setTimeRange] = useState<'5m' | '15m' | '1h' | '6h' | '24h'>('1h');

  useEffect(() => {
    loadMetrics();
    loadAlerts();
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      // Simulate API call to get real-time metrics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: SystemMetrics = {
        timestamp: new Date().toISOString(),
        cpu: {
          usage: Math.random() * 80 + 10, // 10-90%
          cores: 8,
          temperature: Math.random() * 20 + 45, // 45-65°C
          load_average: [
            Math.random() * 2,
            Math.random() * 2,
            Math.random() * 2
          ]
        },
        memory: {
          total: 32 * 1024 * 1024 * 1024, // 32GB
          used: Math.random() * 20 * 1024 * 1024 * 1024 + 8 * 1024 * 1024 * 1024, // 8-28GB
          free: 0,
          cached: Math.random() * 4 * 1024 * 1024 * 1024, // 0-4GB
          usage_percent: 0
        },
        disk: {
          total: 1024 * 1024 * 1024 * 1024, // 1TB
          used: Math.random() * 600 * 1024 * 1024 * 1024 + 200 * 1024 * 1024 * 1024, // 200-800GB
          free: 0,
          usage_percent: 0,
          iops_read: Math.random() * 1000 + 100,
          iops_write: Math.random() * 500 + 50
        },
        network: {
          bytes_in: Math.random() * 1000000 + 100000,
          bytes_out: Math.random() * 800000 + 80000,
          packets_in: Math.random() * 10000 + 1000,
          packets_out: Math.random() * 8000 + 800,
          connections: Math.random() * 100 + 20
        },
        database: {
          connections: Math.random() * 80 + 10,
          max_connections: 100,
          queries_per_second: Math.random() * 500 + 50,
          cache_hit_ratio: Math.random() * 20 + 80, // 80-100%
          slow_queries: Math.random() * 5,
          table_locks: Math.random() * 3
        },
        application: {
          uptime: Date.now() - (Math.random() * 86400000 * 30), // Up to 30 days
          response_time: Math.random() * 200 + 50,
          error_rate: Math.random() * 2, // 0-2%
          active_sessions: Math.random() * 500 + 100,
          requests_per_minute: Math.random() * 1000 + 200,
          queue_length: Math.random() * 20
        }
      };

      // Calculate derived values
      mockMetrics.memory.free = mockMetrics.memory.total - mockMetrics.memory.used;
      mockMetrics.memory.usage_percent = (mockMetrics.memory.used / mockMetrics.memory.total) * 100;
      mockMetrics.disk.free = mockMetrics.disk.total - mockMetrics.disk.used;
      mockMetrics.disk.usage_percent = (mockMetrics.disk.used / mockMetrics.disk.total) * 100;

      setMetrics(mockMetrics);
      
      // Generate alerts based on thresholds
      generateAlerts(mockMetrics);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    // Load existing alerts
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Memory Usage',
        message: 'Memory usage has exceeded 85% for the past 10 minutes',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        component: 'memory',
        value: 87.3,
        threshold: 85,
        acknowledged: false
      },
      {
        id: '2',
        type: 'info',
        title: 'Database Connection Pool',
        message: 'Database connection pool is at 70% capacity',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        component: 'database',
        value: 70,
        threshold: 80,
        acknowledged: true
      },
      {
        id: '3',
        type: 'critical',
        title: 'Disk Space Critical',
        message: 'Disk usage has exceeded 90% on /var/log partition',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        component: 'disk',
        value: 92.1,
        threshold: 90,
        acknowledged: false
      }
    ];
    setAlerts(mockAlerts);
  };

  const generateAlerts = (currentMetrics: SystemMetrics) => {
    const newAlerts: Alert[] = [];

    // CPU Alert
    if (currentMetrics.cpu.usage > 90) {
      newAlerts.push({
        id: Date.now().toString(),
        type: 'critical',
        title: 'High CPU Usage',
        message: `CPU usage is at ${currentMetrics.cpu.usage.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        component: 'cpu',
        value: currentMetrics.cpu.usage,
        threshold: 90,
        acknowledged: false
      });
    }

    // Memory Alert
    if (currentMetrics.memory.usage_percent > 85) {
      newAlerts.push({
        id: (Date.now() + 1).toString(),
        type: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage is at ${currentMetrics.memory.usage_percent.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        component: 'memory',
        value: currentMetrics.memory.usage_percent,
        threshold: 85,
        acknowledged: false
      });
    }

    // Database Connections Alert
    const dbConnectionsPercent = (currentMetrics.database.connections / currentMetrics.database.max_connections) * 100;
    if (dbConnectionsPercent > 80) {
      newAlerts.push({
        id: (Date.now() + 2).toString(),
        type: 'warning',
        title: 'High Database Connections',
        message: `Database connections at ${dbConnectionsPercent.toFixed(1)}% of limit`,
        timestamp: new Date().toISOString(),
        component: 'database',
        value: dbConnectionsPercent,
        threshold: 80,
        acknowledged: false
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)); // Keep last 50 alerts
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Real-time system performance and health monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Auto-refresh:</span>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="ml-2 text-sm">Enabled</span>
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              disabled={!autoRefresh}
            >
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          </div>
          <Button variant="outline" onClick={loadMetrics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter(alert => alert.type === 'critical' && !alert.acknowledged).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Critical System Alerts</h3>
                <p className="text-sm text-red-700">
                  {alerts.filter(alert => alert.type === 'critical' && !alert.acknowledged).length} critical alerts require immediate attention
                </p>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                View Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-3 ${
                    service.status === 'healthy' ? 'bg-green-500' :
                    service.status === 'warning' ? 'bg-yellow-500' :
                    service.status === 'critical' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-gray-500">
                      {service.response_time > 0 ? `${service.response_time}ms` : 'Offline'} • {service.last_check}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPU Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Cpu className="h-4 w-4 mr-2" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Usage</span>
                    <span>{metrics.cpu.usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        metrics.cpu.usage > 80 ? 'bg-red-500' :
                        metrics.cpu.usage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(metrics.cpu.usage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Cores:</span>
                    <span>{metrics.cpu.cores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temperature:</span>
                    <span>{metrics.cpu.temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Load Avg:</span>
                    <span>{metrics.cpu.load_average[0].toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <MemoryStick className="h-4 w-4 mr-2" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Usage</span>
                    <span>{metrics.memory.usage_percent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        metrics.memory.usage_percent > 85 ? 'bg-red-500' :
                        metrics.memory.usage_percent > 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(metrics.memory.usage_percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Used:</span>
                    <span>{formatBytes(metrics.memory.used)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free:</span>
                    <span>{formatBytes(metrics.memory.free)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cached:</span>
                    <span>{formatBytes(metrics.memory.cached)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disk Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <HardDrive className="h-4 w-4 mr-2" />
                Disk Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Usage</span>
                    <span>{metrics.disk.usage_percent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        metrics.disk.usage_percent > 90 ? 'bg-red-500' :
                        metrics.disk.usage_percent > 75 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(metrics.disk.usage_percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Used:</span>
                    <span>{formatBytes(metrics.disk.used)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free:</span>
                    <span>{formatBytes(metrics.disk.free)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Read IOPS:</span>
                    <span>{metrics.disk.iops_read.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Database className="h-4 w-4 mr-2" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Connections</span>
                    <span>{metrics.database.connections}/{metrics.database.max_connections}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        (metrics.database.connections / metrics.database.max_connections) > 0.8 ? 'bg-red-500' :
                        (metrics.database.connections / metrics.database.max_connections) > 0.6 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(metrics.database.connections / metrics.database.max_connections) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>QPS:</span>
                    <span>{metrics.database.queries_per_second.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Hit:</span>
                    <span>{metrics.database.cache_hit_ratio.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slow Queries:</span>
                    <span>{metrics.database.slow_queries.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Application Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold">{formatUptime(metrics.application.uptime)}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold">{metrics.application.response_time.toFixed(0)}ms</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold">{metrics.application.active_sessions.toFixed(0)}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold">{metrics.application.error_rate.toFixed(2)}%</p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${metrics.application.error_rate > 1 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Recent Alerts ({alerts.filter(a => !a.acknowledged).length} unacknowledged)
            </span>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getAlertColor(alert.type)} ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium">{alert.title}</h4>
                      {alert.value && alert.threshold && (
                        <Badge className="ml-2 text-xs">
                          {alert.value.toFixed(1)} / {alert.threshold}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(alert.timestamp).toLocaleString()} • {alert.component}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {alerts.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No alerts - all systems operating normally</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
