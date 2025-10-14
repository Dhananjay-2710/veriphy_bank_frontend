import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  TrendingUp, 
  Target, 
  Award, 
  Users, 
  RefreshCw,
  Trophy,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { 
  useSalespersonStats, 
  useSalespersonPerformance,
  useTeamLeaderboard,
  useCases 
} from '../../hooks/useDashboardData';
import { NewCaseForm } from '../Case/NewCaseForm';

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
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  
  // Fetch real Supabase data using new hooks
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useSalespersonStats(user?.id?.toString() || '');
  const { performance, loading: perfLoading, refetch: refetchPerformance } = useSalespersonPerformance(user?.id?.toString() || '');
  const { leaderboard, loading: leaderboardLoading } = useTeamLeaderboard({
    organizationId: user?.organization_id,
    limit: 10
  });
  const { cases, loading: casesLoading, error: casesError, refetch: refetchCases } = useCases({
    assignedTo: user?.id?.toString(),
    organizationId: user?.organization_id
  });

  // Show loading state while initial data is being fetched
  if (statsLoading && perfLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const handleStatDoubleClick = (statType: string) => {
    switch (statType) {
      case 'active-cases':
        navigate('/cases');
        break;
      case 'pending-documents':
        if (cases && cases.length > 0) {
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
    onNavigateToCommunicator();
  };

  const handleMetricDoubleClick = (metricType: string) => {
    switch (metricType) {
      case 'monthly-target':
        navigate('/salesperson/performance');
        break;
      case 'conversion-rate':
        navigate('/salesperson/performance');
        break;
      case 'customer-satisfaction':
        navigate('/salesperson/customers');
        break;
      case 'team-ranking':
        navigate('/salesperson/team');
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
    refetchPerformance();
    refetchCases();
  };

  const handleNewCase = () => {
    setShowNewCaseForm(true);
  };

  const handleCaseCreated = (caseData: any) => {
    console.log('New case created:', caseData);
    handleRefresh();
  };

  if (statsError || casesError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
            <p className="text-blue-200/80">Performance overview and key metrics</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="dashboard-button-outline">
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

  // Dashboard stats from real Supabase data
  const dashboardStats = [
    { 
      label: 'Active Cases', 
      value: stats?.activeCases?.toString() || '0', 
      icon: FileText, 
      color: 'blue', 
      type: 'active-cases', 
      details: `${stats?.activeCases || 0} cases currently in progress` 
    },
    { 
      label: 'Pending Documents', 
      value: stats?.pendingDocuments?.toString() || '0', 
      icon: Clock, 
      color: 'yellow', 
      type: 'pending-documents', 
      details: 'Documents awaiting verification' 
    },
    { 
      label: 'Completed Today', 
      value: stats?.completedToday?.toString() || '0', 
      icon: CheckCircle, 
      color: 'green', 
      type: 'completed-today', 
      details: 'Cases completed today' 
    },
    { 
      label: 'Overdue Tasks', 
      value: stats?.overdueTasks?.toString() || '0', 
      icon: AlertTriangle, 
      color: 'red', 
      type: 'overdue-tasks', 
      details: 'Tasks requiring immediate attention' 
    }
  ];

  // Performance metrics from real Supabase data
  const performanceMetrics = [
    {
      label: 'Monthly Target',
      value: `₹${((performance?.achievedThisMonth || 0) / 100000).toFixed(2)}L`,
      target: `₹${((performance?.monthlyTarget || 2500000) / 100000).toFixed(2)}L`,
      percentage: parseFloat(performance?.targetAchievement || '0'),
      icon: Target,
      trend: `${parseFloat(performance?.targetAchievement || '0').toFixed(1)}%`,
      type: 'monthly-target',
      details: `Target: ₹${((performance?.monthlyTarget || 0) / 100000).toFixed(2)}L | Achieved: ₹${((performance?.achievedThisMonth || 0) / 100000).toFixed(2)}L`
    },
    {
      label: 'Conversion Rate',
      value: `${parseFloat(performance?.conversionRate || '0').toFixed(1)}%`,
      achieved: `${performance?.completedCases || 0}/${performance?.totalCases || 0}`,
      percentage: parseFloat(performance?.conversionRate || '0'),
      icon: TrendingUp,
      trend: `${performance?.completedCases || 0} closed`,
      type: 'conversion-rate',
      details: `Total: ${performance?.totalCases || 0} | Closed: ${performance?.completedCases || 0} | Active: ${performance?.activeCases || 0}`
    },
    {
      label: 'My Customers',
      value: `${performance?.totalCustomers || 0}`,
      achieved: `${performance?.verifiedCustomers || 0} verified`,
      percentage: performance?.totalCustomers ? ((performance.verifiedCustomers || 0) / performance.totalCustomers) * 100 : 0,
      icon: Users,
      trend: `+${performance?.pendingKycCustomers || 0} pending`,
      type: 'customer-satisfaction',
      details: `Total: ${performance?.totalCustomers || 0} | Verified: ${performance?.verifiedCustomers || 0} | Pending KYC: ${performance?.pendingKycCustomers || 0}`
    },
    {
      label: 'Team Ranking',
      value: (leaderboard || []).find(l => l.userId === user?.id?.toString())?.teamRank ? `#${(leaderboard || []).find(l => l.userId === user?.id?.toString())?.teamRank}` : 'N/A',
      achieved: (leaderboard || []).find(l => l.userId === user?.id?.toString())?.overallRank ? `#${(leaderboard || []).find(l => l.userId === user?.id?.toString())?.overallRank} overall` : '',
      percentage: 85,
      icon: Trophy,
      trend: (leaderboard || []).find(l => l.userId === user?.id?.toString())?.teamName || 'No team',
      type: 'team-ranking',
      details: `Team rank: #${(leaderboard || []).find(l => l.userId === user?.id?.toString())?.teamRank || 'N/A'} | Overall: #${(leaderboard || []).find(l => l.userId === user?.id?.toString())?.overallRank || 'N/A'}`
    }
  ];

  // Get recent activities from actual cases (with safe navigation)
  const recentActivities = (cases || []).slice(0, 5).map((case_, index) => {
    const activityTypes = ['document_received', 'case_updated', 'follow_up', 'document_pending'];
    
    return {
      id: case_.id,
      type: activityTypes[index % activityTypes.length],
      customer: case_.customer?.name || 'Unknown Customer',
      action: `Case ${case_.status} - ${case_.caseNumber}`,
      time: getTimeAgo(case_.updatedAt || case_.createdAt),
      status: case_.status === 'closed' ? 'success' : case_.status === 'in_progress' ? 'pending' : 'warning',
      caseId: case_.id
    };
  });

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
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
        return <Badge variant="warning" size="sm">In Progress</Badge>;
      case 'warning':
        return <Badge variant="error" size="sm">Action Required</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'open': return 'Initial document collection';
      case 'in_progress': return 'Follow up on pending documents';
      case 'review': return 'Awaiting credit approval';
      case 'closed': return 'Case closed';
      case 'rejected': return 'Customer notification sent';
      default: return 'Review case status';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
          <p className="text-blue-200/80">Welcome back, {user?.full_name || user?.email}</p>
          {performance?.teamId && (
            <p className="text-sm text-blue-300/70 mt-1">
              Team Rank: #{(leaderboard || []).find(l => l.userId === user?.id?.toString())?.teamRank || 'N/A'} | 
              Overall Rank: #{(leaderboard || []).find(l => l.userId === user?.id?.toString())?.overallRank || 'N/A'}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={statsLoading || casesLoading || perfLoading} className="dashboard-refresh-button">
            <RefreshCw className={`h-4 w-4 mr-2 ${(statsLoading || casesLoading || perfLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate('/salesperson/customers')} className="dashboard-button-outline">
            <Users className="h-4 w-4 mr-2" />
            My Customers
          </Button>
          <Button variant="outline" onClick={() => navigate('/cases')} className="dashboard-button-outline">
            <FileText className="h-4 w-4 mr-2" />
            All Cases
          </Button>
          <Button onClick={handleNewCase}>
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
              className="hover:shadow-lg transition-shadow cursor-pointer dashboard-card"
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
                    <p className="text-xs text-gray-500 mt-1">Click for details</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <Card className="dashboard-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance Metrics</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/salesperson/performance')}
              className="dashboard-button-outline"
            >
              View Details
            </Button>
          </div>
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
                  title={`Click to view: ${metric.details}`}
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
                  {metric.achieved && (
                    <p className="text-xs text-gray-500 mb-2">{metric.achieved}</p>
                  )}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <Button variant="outline" size="sm" onClick={onNavigateToCases} className="dashboard-button-outline">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onNavigateToCase(activity.caseId)}
                    title="Click to view case details"
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.customer}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <div>
                      {getActivityBadge(activity.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No recent activities</p>
                  <p className="text-sm">Your case activities will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col dashboard-button-outline"
                onClick={handleNewCase}
              >
                <Plus className="h-6 w-6 mb-1" />
                <span className="text-xs">New Case</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col dashboard-button-outline"
                onClick={() => navigate('/salesperson/customers')}
              >
                <Users className="h-6 w-6 mb-1" />
                <span className="text-xs">My Customers</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col dashboard-button-outline" 
                onClick={onNavigateToWorkload}
              >
                <Calendar className="h-6 w-6 mb-1" />
                <span className="text-xs">Workload</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col dashboard-button-outline" 
                onClick={() => navigate('/document-manager')}
              >
                <FileText className="h-6 w-6 mb-1" />
                <span className="text-xs">Documents</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col dashboard-button-outline"
                onClick={() => navigate('/salesperson/team')}
              >
                <UserCheck className="h-6 w-6 mb-1" />
                <span className="text-xs">My Team</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col dashboard-button-outline"
                onClick={() => navigate('/salesperson/performance')}
              >
                <Briefcase className="h-6 w-6 mb-1" />
                <span className="text-xs">Performance</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Priority Cases */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Today's Priority Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(cases || []).filter(c => c.priority === 'high').slice(0, 3).length > 0 ? (
              (cases || []).filter(c => c.priority === 'high').slice(0, 3).map((case_, index) => (
                <div 
                  key={case_.id}
                  className={`flex items-center justify-between p-4 ${
                    index === 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                  } border rounded-lg cursor-pointer transition-colors hover:shadow-md`}
                  onClick={() => onNavigateToCase(case_.id)}
                >
                  <div className="flex items-center space-x-3">
                    {index === 0 ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                      <p className={`font-medium ${index === 0 ? 'text-red-900' : 'text-yellow-900'}`}>
                        {case_.customer?.name || 'Unknown Customer'}
                      </p>
                      <p className={`text-sm ${index === 0 ? 'text-red-700' : 'text-yellow-700'}`}>
                        {case_.caseNumber} - {getNextAction(case_.status)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Click to view case details
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={index === 0 ? "error" : "warning"} 
                    size="sm"
                  >
                    {index === 0 ? 'Urgent' : 'High Priority'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p>No high priority cases</p>
                <p className="text-sm">All your cases are on track!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Case Form Modal */}
      {showNewCaseForm && (
        <NewCaseForm
          onClose={() => setShowNewCaseForm(false)}
          onCaseCreated={handleCaseCreated}
        />
      )}
    </div>
  );
}
