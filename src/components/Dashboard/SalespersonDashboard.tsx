import React from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, Calendar, Plus, TrendingUp, Target, Award, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface SalespersonDashboardProps {
  onNavigateToCase: (caseId: string) => void;
  onNavigateToWorkload: () => void;
  onNavigateToCases: () => void;
  onNavigateToDocumentManager: () => void;
  onNavigateToCommunicator: () => void;
}

export function SalespersonDashboard({ 
  onNavigateToCase, 
  onNavigateToWorkload, 
  onNavigateToCases,
  onNavigateToDocumentManager,
  onNavigateToCommunicator 
}: SalespersonDashboardProps) {
  const handleStatDoubleClick = (statType: string) => {
    switch (statType) {
      case 'active-cases':
        onNavigateToCases();
        break;
      case 'pending-documents':
        onNavigateToDocumentManager();
        break;
      case 'completed-today':
        onNavigateToCases();
        break;
      case 'overdue-tasks':
        onNavigateToWorkload();
        break;
      default:
        break;
    }
  };

  const handleStatClick = (statType: string) => {
    handleStatDoubleClick(statType);
  };

  const handleCustomerDoubleClick = (customerName: string, phone: string) => {
    // Navigate to WhatsApp-style conversation view
    onNavigateToCommunicator();
  };

  const handleMetricDoubleClick = (metricType: string) => {
    switch (metricType) {
      case 'monthly-target':
        onNavigateToCases();
        break;
      case 'conversion-rate':
        onNavigateToCases();
        break;
      case 'customer-satisfaction':
        onNavigateToCommunicator();
        break;
      case 'team-ranking':
        onNavigateToCases();
        break;
      default:
        break;
    }
  };

  const handleMetricClick = (metricType: string) => {
    handleMetricDoubleClick(metricType);
  };
  const stats = [
    { label: 'Active Cases', value: '8', icon: FileText, color: 'blue', type: 'active-cases', details: 'Home Loans: 3, Personal Loans: 2, Car Loans: 2, Business Loans: 1' },
    { label: 'Pending Documents', value: '12', icon: Clock, color: 'yellow', type: 'pending-documents', details: 'GST Returns: 4, Bank Statements: 3, Property Docs: 2, Others: 3' },
    { label: 'Completed Today', value: '3', icon: CheckCircle, color: 'green', type: 'completed-today', details: 'Pradeep Kumar (₹25L), Amit Verma (₹5L), Neha Singh (₹8L)' },
    { label: 'Overdue Tasks', value: '2', icon: AlertTriangle, color: 'red', type: 'overdue-tasks', details: 'GST follow-up: Ramesh Gupta, Property docs: Kavya Menon' }
  ];

  const performanceMetrics = [
    {
      label: 'Monthly Target',
      value: '₹2.5Cr',
      achieved: '₹1.8Cr',
      percentage: 72,
      icon: Target,
      trend: '+15%',
      type: 'monthly-target',
      details: 'Target: ₹2.5Cr | Achieved: ₹1.8Cr | Remaining: ₹0.7Cr | Days left: 22'
    },
    {
      label: 'Conversion Rate',
      value: '89%',
      achieved: '89%',
      percentage: 89,
      icon: TrendingUp,
      trend: '+5%',
      type: 'conversion-rate',
      details: 'Applications: 45 | Approved: 40 | Rejected: 3 | Pending: 2'
    },
    {
      label: 'Customer Satisfaction',
      value: '4.8/5',
      achieved: '4.8/5',
      percentage: 96,
      icon: Award,
      trend: '+0.2',
      type: 'customer-satisfaction',
      details: '5 Star: 85% | 4 Star: 12% | 3 Star: 3% | Total Reviews: 67'
    },
    {
      label: 'Team Ranking',
      value: '#2',
      achieved: '#2',
      percentage: 85,
      icon: Users,
      trend: '↑1',
      type: 'team-ranking',
      details: 'Rank: #2/12 | Score: 94.5 | Above: Vikram (96.2) | Below: Meera (91.8)'
    }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'document_received',
      customer: 'Ramesh Gupta',
      action: 'uploaded GST returns',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'case_approved',
      customer: 'Pradeep Kumar',
      action: 'loan approved - ₹25L',
      time: '5 hours ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'follow_up',
      customer: 'Neha Singh',
      action: 'follow-up call scheduled',
      time: '1 day ago',
      status: 'pending'
    },
    {
      id: '4',
      type: 'document_pending',
      customer: 'Amit Verma',
      action: 'bank statements pending',
      time: '2 days ago',
      status: 'warning'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_received':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'case_approved':
        return <Award className="h-4 w-4 text-green-600" />;
      case 'follow_up':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'document_pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'warning':
        return <Badge variant="error" size="sm">Action Required</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600">Performance overview and key metrics</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onNavigateToWorkload}>
            <Calendar className="h-4 w-4 mr-2" />
            Workload Planner
          </Button>
          <Button variant="outline" onClick={onNavigateToCases}>
            <FileText className="h-4 w-4 mr-2" />
            View All Cases
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'text-blue-600 bg-blue-100',
            yellow: 'text-yellow-600 bg-yellow-100',
            green: 'text-green-600 bg-green-100',
            red: 'text-red-600 bg-red-100'
          };
          
          return (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => handleStatClick(stat.type)}
              onDoubleClick={() => handleStatDoubleClick(stat.type)}
              title={`Double-click to view details: ${stat.details}`}
            >
              <CardContent className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xs text-gray-500 mt-1">Double-click for details</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={index} 
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleMetricClick(metric.type)}
                  onDoubleClick={() => handleMetricDoubleClick(metric.type)}
                  title={`Double-click to view details: ${metric.details}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{metric.label}</h3>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600">{metric.trend}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Double-click for breakdown</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${metric.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <Button variant="outline" size="sm" onClick={onNavigateToCases}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onDoubleClick={() => onNavigateToCase('case-001')}
                  title="Double-click to view case details"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.customer}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <p className="text-xs text-blue-500">Double-click to view case</p>
                  </div>
                  <div>
                    {getActivityBadge(activity.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-16 flex-col">
                <FileText className="h-6 w-6 mb-1" />
                <span className="text-xs">Send Document Request</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <CheckCircle className="h-6 w-6 mb-1" />
                <span className="text-xs">Mark Complete</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col" onClick={onNavigateToWorkload}>
                <Calendar className="h-6 w-6 mb-1" />
                <span className="text-xs">Schedule Follow-up</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col" onClick={onNavigateToCases}>
                <Users className="h-4 w-4 mb-1" />
                <span className="text-xs">Customer Chat</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Priority Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Priority Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => onNavigateToCase('case-001')}
              onDoubleClick={() => onNavigateToCase('case-001')}
              onContextMenu={(e) => {
                e.preventDefault();
                handleCustomerDoubleClick('Ramesh & Sunita Gupta', '+91-9876543210');
              }}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Follow up: Ramesh & Sunita Gupta</p>
                  <p className="text-sm text-red-700">GST documents still pending - Home Loan ₹50L</p>
                  <p className="text-xs text-red-600">Click or double-click to view case</p>
                  <p className="text-xs text-red-600">Click to review • Right-click for WhatsApp</p>
                </div>
              </div>
              <Badge variant="error" size="sm">High Priority</Badge>
            </div>
            
            <div 
              className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
              onDoubleClick={() => onNavigateToWorkload()}
            >
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Schedule call: Neha Singh</p>
                  <p className="text-sm text-yellow-700">Car loan application - initial document collection</p>
                  <p className="text-xs text-yellow-600">Double-click to schedule</p>
                  <p className="text-xs text-blue-500">Click for WhatsApp chat • Double-click for case</p>
                </div>
              </div>
              <Badge variant="warning" size="sm">Today</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}