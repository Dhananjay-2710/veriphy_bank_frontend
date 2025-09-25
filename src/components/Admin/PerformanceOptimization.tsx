import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Zap, 
  Clock, 
  Database, 
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  Download,
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContextFixed';

interface PerformanceOptimizationProps {
  onBack: () => void;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: {
    warning: number;
    critical: number;
  };
}

interface OptimizationRecommendation {
  id: string;
  category: 'database' | 'frontend' | 'backend' | 'network' | 'storage';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  estimatedImprovement: string;
}

export function PerformanceOptimization({ onBack }: PerformanceOptimizationProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Load performance data
  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock performance metrics
      const mockMetrics: PerformanceMetric[] = [
        {
          name: 'Page Load Time',
          value: 1.2,
          unit: 's',
          status: 'good',
          trend: 'down',
          threshold: { warning: 2, critical: 3 }
        },
        {
          name: 'Database Query Time',
          value: 45,
          unit: 'ms',
          status: 'good',
          trend: 'stable',
          threshold: { warning: 100, critical: 200 }
        },
        {
          name: 'Memory Usage',
          value: 68,
          unit: '%',
          status: 'warning',
          trend: 'up',
          threshold: { warning: 70, critical: 85 }
        },
        {
          name: 'CPU Usage',
          value: 45,
          unit: '%',
          status: 'good',
          trend: 'stable',
          threshold: { warning: 80, critical: 95 }
        },
        {
          name: 'API Response Time',
          value: 120,
          unit: 'ms',
          status: 'good',
          trend: 'down',
          threshold: { warning: 200, critical: 500 }
        },
        {
          name: 'Error Rate',
          value: 0.5,
          unit: '%',
          status: 'good',
          trend: 'down',
          threshold: { warning: 1, critical: 5 }
        }
      ];

      const mockRecommendations: OptimizationRecommendation[] = [
        {
          id: '1',
          category: 'database',
          title: 'Add Database Indexes',
          description: 'Add indexes on frequently queried columns to improve query performance',
          impact: 'high',
          effort: 'medium',
          status: 'pending',
          estimatedImprovement: '30-50% faster queries'
        },
        {
          id: '2',
          category: 'frontend',
          title: 'Implement Code Splitting',
          description: 'Split JavaScript bundles to reduce initial load time',
          impact: 'medium',
          effort: 'low',
          status: 'in_progress',
          estimatedImprovement: '20-30% faster page loads'
        },
        {
          id: '3',
          category: 'backend',
          title: 'Enable Response Caching',
          description: 'Cache API responses for frequently accessed data',
          impact: 'high',
          effort: 'medium',
          status: 'pending',
          estimatedImprovement: '40-60% faster API responses'
        },
        {
          id: '4',
          category: 'storage',
          title: 'Optimize Image Compression',
          description: 'Compress and optimize images for web delivery',
          impact: 'medium',
          effort: 'low',
          status: 'completed',
          estimatedImprovement: '50-70% smaller file sizes'
        },
        {
          id: '5',
          category: 'network',
          title: 'Enable CDN',
          description: 'Use Content Delivery Network for static assets',
          impact: 'high',
          effort: 'high',
          status: 'pending',
          estimatedImprovement: '60-80% faster asset delivery'
        }
      ];

      setMetrics(mockMetrics);
      setRecommendations(mockRecommendations);
    } catch (err) {
      console.error('Error loading performance data:', err);
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
  }, []);

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge variant="success">Good</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'critical':
        return <Badge variant="error">Critical</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
      default:
        return null;
    }
  };

  // Get impact badge
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="error">High Impact</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Impact</Badge>;
      case 'low':
        return <Badge variant="success">Low Impact</Badge>;
      default:
        return <Badge>{impact}</Badge>;
    }
  };

  // Get effort badge
  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'high':
        return <Badge variant="error">High Effort</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Effort</Badge>;
      case 'low':
        return <Badge variant="success">Low Effort</Badge>;
      default:
        return <Badge>{effort}</Badge>;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database':
        return <Database className="h-5 w-5 text-blue-600" />;
      case 'frontend':
        return <Zap className="h-5 w-5 text-yellow-600" />;
      case 'backend':
        return <Cpu className="h-5 w-5 text-green-600" />;
      case 'network':
        return <Wifi className="h-5 w-5 text-purple-600" />;
      case 'storage':
        return <HardDrive className="h-5 w-5 text-orange-600" />;
      default:
        return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
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
            <p className="text-lg font-semibold">Error Loading Performance Data</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={loadPerformanceData}>
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
            <h1 className="text-2xl font-bold text-gray-900">Performance Optimization</h1>
            <p className="text-gray-600">Monitor and optimize application performance</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant={isMonitoring ? "error" : "success"}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button variant="outline" onClick={loadPerformanceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'metrics', label: 'Metrics', icon: Clock },
            { id: 'recommendations', label: 'Recommendations', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold text-green-600 mb-2">87</div>
                <p className="text-lg text-gray-600 mb-4">Performance Score</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
                <p className="text-sm text-gray-500">
                  Based on page load time, API response time, and error rate
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Optimizations Applied</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {recommendations.filter(r => r.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {recommendations.filter(r => r.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {recommendations.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{metric.name}</h3>
                    {getStatusBadge(metric.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {metric.value}{metric.unit}
                      </p>
                      <p className="text-sm text-gray-600">
                        Threshold: {metric.threshold.warning}{metric.unit}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          metric.status === 'good' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min((metric.value / metric.threshold.critical) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getCategoryIcon(rec.category)}
                        <h3 className="font-medium text-gray-900">{rec.title}</h3>
                        <Badge variant={rec.status === 'completed' ? 'success' : rec.status === 'in_progress' ? 'warning' : 'info'}>
                          {rec.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                      <div className="flex items-center space-x-4">
                        {getImpactBadge(rec.impact)}
                        {getEffortBadge(rec.effort)}
                        <span className="text-sm text-gray-500">
                          Expected: {rec.estimatedImprovement}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {rec.status === 'pending' && (
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {rec.status === 'in_progress' && (
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
