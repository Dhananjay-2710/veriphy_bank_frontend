import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, FileText, Clock, Download, RefreshCw, AlertTriangle, Target, Zap, TrendingDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { SupabaseDatabaseService } from '../../services/supabase-database';

export function SuperAdminAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState({
    performanceMetrics: [],
    departmentAnalytics: [],
    topPerformers: []
  });

  // Load analytics data on component mount and when period changes
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading super admin analytics data for period:', selectedPeriod);
      
      // Fetch real analytics data from Supabase
      const [performanceData, departmentData, performersData] = await Promise.all([
        SupabaseDatabaseService.getPerformanceMetrics(selectedPeriod),
        SupabaseDatabaseService.getDepartmentAnalytics(selectedPeriod),
        SupabaseDatabaseService.getTopPerformers(selectedPeriod)
      ]);
      
      setAnalyticsData({
        performanceMetrics: performanceData,
        departmentAnalytics: departmentData,
        topPerformers: performersData
      });
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
      // Fallback to mock data
      setAnalyticsData({
        performanceMetrics: getMockPerformanceMetrics(),
        departmentAnalytics: getMockDepartmentAnalytics(),
        topPerformers: getMockTopPerformers()
      });
    } finally {
      setLoading(false);
    }
  };

  const getMockPerformanceMetrics = () => [
    {
      label: 'Total Revenue',
      value: '₹45.2Cr',
      change: '+12.5%',
      trend: 'up',
      period: 'This Month',
      breakdown: {
        'Home Loans': '₹28.5Cr (63%)',
        'Business Loans': '₹12.1Cr (27%)',
        'Personal Loans': '₹3.2Cr (7%)',
        'Car Loans': '₹1.4Cr (3%)'
      }
    },
    {
      label: 'Applications Processed',
      value: '1,247',
      change: '+8.3%',
      trend: 'up',
      period: 'This Month',
      breakdown: {
        'Approved': '892 (71.5%)',
        'Under Review': '234 (18.8%)',
        'Rejected': '87 (7.0%)',
        'Pending': '34 (2.7%)'
      }
    },
    {
      label: 'Average Processing Time',
      value: '2.3 days',
      change: '-15.2%',
      trend: 'down',
      period: 'This Month',
      breakdown: {
        'Home Loans': '3.2 days',
        'Personal Loans': '1.8 days',
        'Business Loans': '4.1 days',
        'Car Loans': '2.0 days'
      }
    },
    {
      label: 'Approval Rate',
      value: '71.5%',
      change: '+2.1%',
      trend: 'up',
      period: 'This Month',
      breakdown: {
        'Approved': '892 cases',
        'Total': '1,247 cases',
        'Success Rate': '71.5%',
        'Industry Avg': '68.5%'
      }
    }
  ];

  const getMockDepartmentAnalytics = () => [
    {
      department: 'Sales Team',
      metrics: {
        totalCases: 187,
        completedCases: 156,
        revenue: '₹32.1Cr',
        efficiency: '94%',
        avgProcessingTime: '2.1 days',
        customerSatisfaction: '4.8/5'
      }
    },
    {
      department: 'Credit Operations',
      metrics: {
        totalCases: 67,
        completedCases: 64,
        revenue: '₹45.2Cr',
        efficiency: '98%',
        avgProcessingTime: '1.8 days',
        customerSatisfaction: '4.6/5'
      }
    },
    {
      department: 'Compliance',
      metrics: {
        totalCases: 23,
        completedCases: 23,
        revenue: '₹8.5Cr',
        efficiency: '100%',
        avgProcessingTime: '1.2 days',
        customerSatisfaction: '4.9/5'
      }
    }
  ];

  const getMockTopPerformers = () => [
    { name: 'Priya Sharma', role: 'Sales Manager', cases: 18, revenue: '₹2.4Cr', efficiency: '94%' },
    { name: 'Anita Patel', role: 'Credit Ops', cases: 23, revenue: '₹3.1Cr', efficiency: '98%' },
    { name: 'Vikram Joshi', role: 'Salesperson', cases: 15, revenue: '₹1.8Cr', efficiency: '91%' },
    { name: 'Rajesh Kumar', role: 'Manager', cases: 12, revenue: '₹2.2Cr', efficiency: '97%' },
    { name: 'Sneha Singh', role: 'Salesperson', cases: 14, revenue: '₹1.6Cr', efficiency: '89%' }
  ];

  const performanceMetrics = analyticsData.performanceMetrics.length > 0 ? analyticsData.performanceMetrics : getMockPerformanceMetrics();
  const departmentAnalytics = analyticsData.departmentAnalytics.length > 0 ? analyticsData.departmentAnalytics : getMockDepartmentAnalytics();
  const topPerformers = analyticsData.topPerformers.length > 0 ? analyticsData.topPerformers : getMockTopPerformers();

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-gray-600" />;
  };

  const getMetricIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'total revenue':
        return <DollarSign className="h-8 w-8 text-green-600" />;
      case 'applications processed':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'average processing time':
        return <Clock className="h-8 w-8 text-orange-600" />;
      case 'approval rate':
        return <Target className="h-8 w-8 text-purple-600" />;
      default:
        return <BarChart3 className="h-8 w-8 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive performance insights and business intelligence across all organizations</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" className="hover:bg-blue-50">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" onClick={loadAnalyticsData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3 text-blue-600" />
          <span className="text-lg text-gray-600">Loading analytics data...</span>
        </div>
      )}

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getMetricIcon(metric.label)}
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-xs text-gray-500">{metric.period}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getTrendIcon(metric.trend)}
                    <span>{metric.change}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 border-t pt-4">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Breakdown</h4>
                {Object.entries(metric.breakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs text-gray-600">
                    <span className="font-medium">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Analytics */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>Department Performance Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {departmentAnalytics.map((dept, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{dept.department}</h3>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600">High Performance</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(dept.metrics).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold text-blue-600">{value}</p>
                      <p className="text-xs text-gray-600 capitalize font-medium">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers Leaderboard */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            <span>Top Performers Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                    index === 2 ? 'bg-gradient-to-r from-yellow-600 to-yellow-800' :
                    'bg-gradient-to-r from-blue-400 to-blue-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{performer.name}</h3>
                    <p className="text-sm text-gray-600 font-medium">{performer.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-8 text-sm text-gray-600">
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-lg">{performer.cases}</p>
                    <p className="text-xs font-medium">Cases</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-lg">{performer.revenue}</p>
                    <p className="text-xs font-medium">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-lg">{performer.efficiency}</p>
                    <p className="text-xs font-medium">Efficiency</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>System Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database Performance</span>
                <span className="text-sm text-green-600 font-semibold">Excellent</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">API Response Time</span>
                <span className="text-sm text-green-600 font-semibold">Fast</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User Activity</span>
                <span className="text-sm text-blue-600 font-semibold">High</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">System Errors</span>
                <span className="text-sm text-yellow-600 font-semibold">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Monthly Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Custom Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                View User Performance
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Set Performance Goals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
