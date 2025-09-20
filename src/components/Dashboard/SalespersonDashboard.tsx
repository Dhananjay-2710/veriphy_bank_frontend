import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, Calendar, Plus, TrendingUp, Target, Award, Users, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useDashboardStats, useCases } from '../../hooks/useDashboardData';

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
  onNavigateToDocumentManager: _onNavigateToDocumentManager,
  onNavigateToCommunicator 
}: SalespersonDashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats(user?.id || '', user?.role || '');
  const { cases, loading: casesLoading, error: casesError, refetch: refetchCases } = useCases({
    assignedTo: user?.id,
    status: 'in-progress'
  });
  const handleStatDoubleClick = (statType: string) => {
    switch (statType) {
      case 'active-cases':
        navigate('/cases');
        break;
      case 'pending-documents':
        // Navigate to the first active case's document manager
        if (cases.length > 0) {
          navigate(`/document-manager/${cases[0].id}`);
        } else {
          navigate('/document-manager');
        }
        break;
      case 'completed-today':
        navigate('/cases');
        break;
      case 'overdue-tasks':
        navigate('/workload');
        break;
      default:
        break;
    }
  };

  const handleStatClick = (statType: string) => {
    handleStatDoubleClick(statType);
  };

  const handleCustomerDoubleClick = (_customerName: string, _phone: string) => {
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

  const handleRefresh = () => {
    refetchStats();
    refetchCases();
  };

  if (statsError || casesError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
            <p className="text-gray-600">Performance overview and key metrics</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard data</h3>
              <p className="mt-1 text-sm text-red-700">
                {statsError || casesError}. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    { 
      label: 'Active Cases', 
      value: statsLoading ? '...' : stats.activeCases.toString(), 
      icon: FileText, 
      color: 'blue', 
      type: 'active-cases', 
      details: `Home Loans: ${cases.filter(c => c.customer.loanType.includes('Home')).length}, Personal Loans: ${cases.filter(c => c.customer.loanType.includes('Personal')).length}, Car Loans: ${cases.filter(c => c.customer.loanType.includes('Car')).length}, Business Loans: ${cases.filter(c => c.customer.loanType.includes('Business')).length}` 
    },
    { 
      label: 'Pending Documents', 
      value: statsLoading ? '...' : stats.pendingDocuments.toString(), 
      icon: Clock, 
      color: 'yellow', 
      type: 'pending-documents', 
      details: 'GST Returns: 4, Bank Statements: 3, Property Docs: 2, Others: 3' 
    },
    { 
      label: 'Completed Today', 
      value: statsLoading ? '...' : stats.completedToday.toString(), 
      icon: CheckCircle, 
      color: 'green', 
      type: 'completed-today', 
      details: 'Recent completions will appear here' 
    },
    { 
      label: 'Overdue Tasks', 
      value: statsLoading ? '...' : stats.overdueTasks.toString(), 
      icon: AlertTriangle, 
      color: 'red', 
      type: 'overdue-tasks', 
      details: 'Tasks requiring immediate attention' 
    }
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

  // Generate recent activities from cases data
  const recentActivities = cases.slice(0, 4).map((case_, index) => {
    const activityTypes = ['document_received', 'case_updated', 'follow_up', 'document_pending'];
    const statuses = ['success', 'pending', 'warning'];
    
    return {
      id: `activity-${index + 1}`,
      type: activityTypes[index % activityTypes.length],
      customer: case_.customer.name,
      action: getActivityAction(case_, activityTypes[index % activityTypes.length]),
      time: getTimeAgo(case_.updatedAt),
      status: statuses[index % statuses.length]
    };
  });

  const getActivityAction = (case_: any, type: string) => {
    switch (type) {
      case 'document_received':
        return 'uploaded required documents';
      case 'case_updated':
        return `case status updated to ${case_.status}`;
      case 'follow_up':
        return 'follow-up call scheduled';
      case 'document_pending':
        return 'pending document upload';
      default:
        return 'case activity';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'new': return 'Initial document collection';
      case 'in-progress': return 'Follow up on pending documents';
      case 'review': return 'Awaiting credit approval';
      case 'approved': return 'Loan disbursement';
      case 'rejected': return 'Customer notification sent';
      default: return 'Review case status';
    }
  };

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
          <Button variant="outline" onClick={handleRefresh} disabled={statsLoading || casesLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${(statsLoading || casesLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate('/workload')}>
            <Calendar className="h-4 w-4 mr-2" />
            Workload Planner
          </Button>
          <Button variant="outline" onClick={() => navigate('/cases')}>
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
        {dashboardStats.map((stat, index) => {
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
            >
              <CardContent className="flex items-center">
                <div
                  className="flex items-center w-full cursor-pointer"
                  onClick={() => handleStatClick(stat.type)}
                  onDoubleClick={() => handleStatDoubleClick(stat.type)}
                  title={`Double-click to view details: ${stat.details}`}
                >
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-xs text-gray-500 mt-1">Double-click for details</p>
                  </div>
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
            {cases.filter(c => c.priority === 'high').slice(0, 2).map((case_, index) => (
              <div 
                key={case_.id}
                className={`flex items-center justify-between p-4 ${
                  index === 0 ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                } border rounded-lg cursor-pointer transition-colors`}
                onClick={() => onNavigateToCase(case_.id)}
                onDoubleClick={() => onNavigateToCase(case_.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleCustomerDoubleClick(case_.customer.name, case_.customer.phone);
                }}
              >
                <div className="flex items-center space-x-3">
                  {index === 0 ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  )}
                  <div>
                    <p className={`font-medium ${index === 0 ? 'text-red-900' : 'text-yellow-900'}`}>
                      {index === 0 ? 'Follow up:' : 'Schedule call:'} {case_.customer.name}
                    </p>
                    <p className={`text-sm ${index === 0 ? 'text-red-700' : 'text-yellow-700'}`}>
                      {case_.customer.loanType} - {getNextAction(case_.status)} - ₹{(case_.customer.loanAmount / 100000).toFixed(0)}L
                    </p>
                    <p className={`text-xs ${index === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {index === 0 ? 'Click or double-click to view case' : 'Double-click to schedule'}
                    </p>
                    <p className="text-xs text-blue-500">Right-click for WhatsApp chat</p>
                  </div>
                </div>
                <Badge 
                  variant={index === 0 ? "error" : "warning"} 
                  size="sm"
                >
                  {index === 0 ? 'High Priority' : 'Today'}
                </Badge>
              </div>
            ))}
            
            {cases.filter(c => c.priority === 'high').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No high priority tasks for today</p>
                <p className="text-sm">All cases are on track!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}