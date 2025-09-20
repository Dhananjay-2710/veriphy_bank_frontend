import React from 'react';
import { Users, TrendingUp, FileText, Clock, BarChart3, UserPlus, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useDashboardStats, useCases, useTeamMembers } from '../../hooks/useDashboardData';

interface ManagerDashboardProps {
  onNavigateToTeam: () => void;
  onNavigateToCase: (caseId: string) => void;
  onNavigateToCases: () => void;
  onNavigateToAnalytics: () => void;
}

export function ManagerDashboard({ 
  onNavigateToTeam, 
  onNavigateToCase,
  onNavigateToCases,
  onNavigateToAnalytics 
}: ManagerDashboardProps) {
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats(user?.id || '', user?.role || '');
  const { cases, loading: casesLoading, error: casesError, refetch: refetchCases } = useCases();
  const { teamMembers, loading: teamLoading, error: teamError, refetch: refetchTeam } = useTeamMembers();
  const handleKPIClick = (kpiType: string) => {
    switch (kpiType) {
      case 'team-cases':
        onNavigateToCases();
        break;
      case 'processing-time':
        onNavigateToAnalytics();
        break;
      case 'approval-rate':
        onNavigateToAnalytics();
        break;
      case 'team-members':
        onNavigateToTeam();
        break;
      default:
        break;
    }
  };

  const handleTeamMemberDoubleClick = (memberName: string) => {
    // In a real implementation, this would show team member's customer conversations
    console.log(`Viewing conversations handled by ${memberName}`);
    onNavigateToTeam();
  };

  // Use real data from Supabase, with fallbacks for missing data
  const kpis = [
    { 
      label: 'Team Cases', 
      value: stats?.totalCases?.toString() || cases?.length?.toString() || '0', 
      change: '+12%', 
      trend: 'up' as const, 
      icon: FileText, 
      type: 'team-cases', 
      details: `Active: ${cases?.filter(c => c.status === 'in-progress').length || 0} | Completed: ${cases?.filter(c => c.status === 'approved').length || 0} | Pending: ${cases?.filter(c => c.status === 'review').length || 0} | Overdue: ${cases?.filter(c => c.status === 'overdue').length || 0}` 
    },
    { 
      label: 'Avg. Processing Time', 
      value: '2.3 days', 
      change: '-15%', 
      trend: 'down' as const, 
      icon: Clock, 
      type: 'processing-time', 
      details: 'Home Loans: 3.2 days | Personal: 1.8 days | Business: 4.1 days | Car: 2.0 days' 
    },
    { 
      label: 'Approval Rate', 
      value: '89%', 
      change: '+5%', 
      trend: 'up' as const, 
      icon: TrendingUp, 
      type: 'approval-rate', 
      details: `Approved: ${cases?.filter(c => c.status === 'approved').length || 0} | Rejected: ${cases?.filter(c => c.status === 'rejected').length || 0} | Pending: ${cases?.filter(c => c.status === 'review').length || 0} | Success Rate: 89%` 
    },
    { 
      label: 'Team Members', 
      value: teamMembers?.length?.toString() || '0', 
      change: '+2', 
      trend: 'up' as const, 
      icon: Users, 
      type: 'team-members', 
      details: `Active: ${teamMembers?.length || 0} | New Hires: 2 | Avg Efficiency: 91% | Top Performer: ${teamMembers?.[0]?.name || 'N/A'} (94%)` 
    }
  ];

  const teamPerformance = [
    { name: 'Priya Sharma', cases: 8, completed: 15, efficiency: '94%', status: 'active' },
    { name: 'Vikram Joshi', cases: 6, completed: 12, efficiency: '91%', status: 'active' },
    { name: 'Meera Nair', cases: 10, completed: 18, efficiency: '87%', status: 'busy' },
    { name: 'Arjun Reddy', cases: 4, completed: 8, efficiency: '85%', status: 'available' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'busy':
        return <Badge variant="warning" size="sm">Busy</Badge>;
      case 'available':
        return <Badge variant="info" size="sm">Available</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  // Show loading state
  if (statsLoading || casesLoading || teamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (statsError || casesError || teamError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Dashboard</p>
            <p className="text-sm text-gray-600 mt-2">
              {statsError || casesError || teamError}
            </p>
          </div>
          <div className="space-x-2">
            <Button onClick={() => { refetchStats(); refetchCases(); refetchTeam(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Management Dashboard</h1>
          <p className="text-gray-600">Team oversight and performance monitoring</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => { refetchStats(); refetchCases(); refetchTeam(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={onNavigateToTeam}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Team Analytics
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Cases
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend === 'up' || (kpi.trend === 'down' && kpi.label.includes('Time'));
          
          return (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div 
                onClick={() => handleKPIClick(kpi.type)}
                title={`Click to view details: ${kpi.details}`}
              >
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    <p className="text-sm text-gray-600">{kpi.label}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {getTrendIcon(kpi.trend)} {kpi.change}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Click for breakdown</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamPerformance.map((member, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onNavigateToTeam()}
                onDoubleClick={() => handleTeamMemberDoubleClick(member.name)}
                title="Click to view detailed team analytics"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">
                      {member.cases} active cases • {member.completed} completed this month
                    </p>
                    <p className="text-xs text-blue-500">Click for team details • Double-click for conversations</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{member.efficiency}</p>
                    <p className="text-xs text-gray-500">Efficiency</p>
                  </div>
                  {getStatusBadge(member.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* High Priority Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>High Priority Cases</CardTitle>
            <Button variant="outline" size="sm" onClick={onNavigateToCases}>View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="p-4 border border-red-200 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => onNavigateToCase('case-001')}
            title="Click to view case details"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Ramesh & Sunita Gupta</h3>
                <p className="text-sm text-gray-600">Home Loan • ₹50L • Self-employed</p>
                <p className="text-xs text-gray-500 mt-1">Missing: GST Returns, Property Documents</p>
                <p className="text-xs text-red-600">Click to review</p>
              </div>
              <div className="text-right">
                <Badge variant="error" size="sm">High Priority</Badge>
                <p className="text-xs text-gray-500 mt-1">Assigned to Priya</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}