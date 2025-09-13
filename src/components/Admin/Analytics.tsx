import React, { useState } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Users, FileText, Clock, Download, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AnalyticsProps {
  onBack: () => void;
}

export function Analytics({ onBack }: AnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const performanceMetrics = [
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
      label: 'Customer Satisfaction',
      value: '4.7/5',
      change: '+0.2',
      trend: 'up',
      period: 'This Month',
      breakdown: {
        '5 Stars': '78% (892 reviews)',
        '4 Stars': '18% (205 reviews)',
        '3 Stars': '3% (34 reviews)',
        '2 Stars': '1% (11 reviews)'
      }
    }
  ];

  const departmentAnalytics = [
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
    }
  ];

  const topPerformers = [
    { name: 'Priya Sharma', role: 'Salesperson', cases: 18, revenue: '₹2.4Cr', efficiency: '94%' },
    { name: 'Anita Patel', role: 'Credit Ops', cases: 23, revenue: '₹3.1Cr', efficiency: '98%' },
    { name: 'Vikram Joshi', role: 'Salesperson', cases: 15, revenue: '₹1.8Cr', efficiency: '91%' },
    { name: 'Rajesh Kumar', role: 'Manager', cases: 0, revenue: '₹45.2Cr', efficiency: '97%' }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→';
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
            <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
            <p className="text-gray-600">Comprehensive performance and business intelligence</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-xs text-gray-500">{metric.period}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getTrendIcon(metric.trend)} {metric.change}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {Object.entries(metric.breakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs text-gray-600">
                    <span>{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {departmentAnalytics.map((dept, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{dept.department}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(dept.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-lg font-bold text-blue-600">{value}</p>
                      <p className="text-xs text-gray-600 capitalize">
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

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{performer.name}</h3>
                    <p className="text-sm text-gray-600">{performer.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{performer.cases}</p>
                    <p className="text-xs">Cases</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{performer.revenue}</p>
                    <p className="text-xs">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{performer.efficiency}</p>
                    <p className="text-xs">Efficiency</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}