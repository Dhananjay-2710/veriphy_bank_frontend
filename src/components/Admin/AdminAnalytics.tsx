import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  useAdminDashboardStats, 
  useDepartmentPerformance, 
  useSystemAlerts,
  useRecentActivities,
  useComplianceMetrics,
  useComplianceAlerts
} from '../../hooks/useDashboardData';

interface AdminAnalyticsProps {
  onBack?: () => void;
}

export function AdminAnalytics({ onBack }: AdminAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const { stats: adminStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useAdminDashboardStats();
  const { performance: departmentPerformance, loading: deptLoading, error: deptError, refetch: refetchDept } = useDepartmentPerformance();
  const { alerts: systemAlerts, loading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useSystemAlerts();
  const { activities: recentActivities, loading: activitiesLoading, error: activitiesError, refetch: refetchActivities } = useRecentActivities();
  const { data: complianceMetrics, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useComplianceMetrics(selectedPeriod);
  const { data: complianceAlerts, loading: alertsLoading2, error: alertsError2, refetch: refetchAlerts2 } = useComplianceAlerts(selectedPeriod);

  // Mock data for charts (in a real app, this would come from Supabase)
  const revenueData = [
    { month: 'Jan', revenue: 35.2, cases: 245 },
    { month: 'Feb', revenue: 42.1, cases: 289 },
    { month: 'Mar', revenue: 38.7, cases: 267 },
    { month: 'Apr', revenue: 45.8, cases: 312 },
    { month: 'May', revenue: 52.3, cases: 356 },
    { month: 'Jun', revenue: 48.9, cases: 334 }
  ];

  const caseStatusDistribution = [
    { status: 'Approved', count: adminStats?.totalCases ? Math.floor(adminStats.totalCases * 0.65) : 0, color: 'bg-green-500' },
    { status: 'In Progress', count: adminStats?.activeCases || 0, color: 'bg-blue-500' },
    { status: 'Under Review', count: adminStats?.totalCases ? Math.floor(adminStats.totalCases * 0.15) : 0, color: 'bg-yellow-500' },
    { status: 'Rejected', count: adminStats?.totalCases ? Math.floor(adminStats.totalCases * 0.20) : 0, color: 'bg-red-500' }
  ];

  // Use real compliance metrics data or fallback to mock data
  const performanceMetrics = complianceMetrics.length > 0 ? [
    {
      title: 'Overall Compliance Score',
      value: complianceMetrics[0]?.value || '98.5%',
      change: complianceMetrics[0]?.change || '+0.3%',
      trend: complianceMetrics[0]?.trend || 'up',
      icon: BarChart3,
      color: 'green'
    },
    {
      title: 'AML Screening Pass Rate',
      value: complianceMetrics[1]?.value || '100%',
      change: complianceMetrics[1]?.change || '0%',
      trend: complianceMetrics[1]?.trend || 'stable',
      icon: CheckCircle,
      color: 'blue'
    },
    {
      title: 'KYC Completion Rate',
      value: complianceMetrics[2]?.value || '97.8%',
      change: complianceMetrics[2]?.change || '+1.2%',
      trend: complianceMetrics[2]?.trend || 'up',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Document Verification Rate',
      value: complianceMetrics[3]?.value || '96.2%',
      change: complianceMetrics[3]?.change || '-0.5%',
      trend: complianceMetrics[3]?.trend || 'down',
      icon: Clock,
      color: 'green'
    }
  ] : [
    {
      title: 'Average Processing Time',
      value: '4.2 days',
      change: '-0.8 days',
      trend: 'down',
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Customer Satisfaction',
      value: '94.8%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle,
      color: 'blue'
    },
    {
      title: 'Document Verification Rate',
      value: '97.3%',
      change: '+1.5%',
      trend: 'up',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'System Uptime',
      value: '99.8%',
      change: '+0.1%',
      trend: 'up',
      icon: BarChart3,
      color: 'green'
    }
  ];

  const handleExportData = () => {
    // In a real app, this would export data to CSV/Excel
    console.log('Exporting analytics data...');
  };

  if (statsLoading || deptLoading || alertsLoading || activitiesLoading || metricsLoading || alertsLoading2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (statsError || deptError || alertsError || activitiesError || metricsError || alertsError2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Analytics</p>
            <p className="text-sm text-gray-600 mt-2">
              {statsError || deptError || alertsError || activitiesError || metricsError || alertsError2}
            </p>
          </div>
          <Button onClick={() => { refetchStats(); refetchDept(); refetchAlerts(); refetchActivities(); refetchMetrics(); refetchAlerts2(); }}>
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
          <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
          <p className="text-gray-300">Comprehensive insights into VERIPHY banking operations</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={handleExportData} style={{ background: '#ffffff', color: '#374151' }}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => { refetchStats(); refetchDept(); refetchAlerts(); refetchActivities(); refetchMetrics(); refetchAlerts2(); }} style={{ background: '#ffffff', color: '#374151' }}>
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

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const colorClasses = {
            green: 'text-green-600 bg-green-100',
            blue: 'text-blue-600 bg-blue-100',
            yellow: 'text-yellow-600 bg-yellow-100',
            red: 'text-red-600 bg-red-100'
          };
          
          return (
            <Card key={index}>
              <CardContent className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <div className="flex items-center mt-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <p className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue and Cases Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue & Cases Trend</CardTitle>
            <div className="flex space-x-2">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="revenue">Revenue (₹Cr)</option>
                <option value="cases">Number of Cases</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {revenueData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ 
                    height: `${((selectedMetric === 'revenue' ? data.revenue : data.cases) / 
                      Math.max(...revenueData.map(d => selectedMetric === 'revenue' ? d.revenue : d.cases))) * 200}px` 
                  }}
                ></div>
                <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                <p className="text-xs font-semibold text-gray-900">
                  {selectedMetric === 'revenue' ? `₹${data.revenue}Cr` : data.cases}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance & Case Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentPerformance.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{dept.department}</h4>
                    <p className="text-sm text-gray-600">{dept.members} members</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{dept.revenue}</p>
                    <p className="text-sm text-gray-600">{dept.completionRate} completion</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Case Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Case Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseStatusDistribution.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${status.color} mr-3`}></div>
                    <span className="text-sm text-gray-900">{status.status}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-900 mr-2">{status.count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${status.color}`}
                        style={{ 
                          width: `${(status.count / Math.max(...caseStatusDistribution.map(s => s.count))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Response Time</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">95ms</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Performance</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">98%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Document Processing</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-yellow-600">87%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">WhatsApp Integration</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">100%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent High-Impact Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent High-Impact Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'approval' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : activity.type === 'compliance' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.action}</h4>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()} • {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
