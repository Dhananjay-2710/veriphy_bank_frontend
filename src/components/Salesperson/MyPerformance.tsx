import React from 'react';
import { 
  TrendingUp,
  Target,
  Award,
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  DollarSign,
  Calendar,
  Trophy,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { 
  useSalespersonPerformance,
  useTeamLeaderboard 
} from '../../hooks/useDashboardData';

interface MyPerformanceProps {
  onBack?: () => void;
}

export function MyPerformance({ onBack }: MyPerformanceProps) {
  const { user } = useAuth();

  const { performance, loading, error, refetch } = useSalespersonPerformance(
    user?.id?.toString() || ''
  );

  const { leaderboard, loading: leaderboardLoading } = useTeamLeaderboard({
    organizationId: user?.organization_id,
    limit: 10
  });

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(2)}L`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (loading && !performance) {
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
          <TrendingUp className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Performance</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const myRank = (leaderboard || []).find(l => l.userId === user?.id?.toString());
  const targetAchievementPercent = parseFloat(performance?.targetAchievement || '0');
  const conversionRatePercent = parseFloat(performance?.conversionRate || '0');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack}>
                ← Back
              </Button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">My Performance</h1>
          </div>
          <p className="text-gray-600">Track your sales performance and achievements</p>
        </div>
        <Button variant="outline" onClick={refetch}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Ranking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Team Rank</p>
                <p className="text-4xl font-bold text-yellow-700">
                  #{myRank?.teamRank || 'N/A'}
                </p>
              </div>
              <Trophy className="h-12 w-12 text-yellow-600" />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Out of {(leaderboard || []).filter(l => l.teamId === myRank?.teamId).length} team members
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Rank</p>
                <p className="text-4xl font-bold text-blue-700">
                  #{myRank?.overallRank || 'N/A'}
                </p>
              </div>
              <Award className="h-12 w-12 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Out of {(leaderboard || []).length} salespeople
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Performance Score</p>
                <p className="text-4xl font-bold text-green-700">
                  {myRank?.performanceScore.toFixed(1) || '0'}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Weighted score across metrics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Target Achievement */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Monthly Target Achievement</span>
            </CardTitle>
            <Badge 
              variant={targetAchievementPercent >= 100 ? "success" : targetAchievementPercent >= 50 ? "warning" : "error"}
              size="lg"
            >
              {targetAchievementPercent.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Target</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(performance?.monthlyTarget || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Achieved</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(performance?.achievedThisMonth || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Remaining</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency((performance?.monthlyTarget || 0) - (performance?.achievedThisMonth || 0))}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{performance?.completedThisMonth || 0} cases closed this month</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  targetAchievementPercent >= 100 
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : targetAchievementPercent >= 50 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${Math.min(targetAchievementPercent, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Conversion Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              {getTrendIcon(5)}
            </div>
            <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-gray-900">
              {conversionRatePercent.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {performance?.completedCases || 0} / {performance?.totalCases || 0} cases
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              {getTrendIcon(3)}
            </div>
            <p className="text-sm text-gray-600 mb-1">My Customers</p>
            <p className="text-3xl font-bold text-gray-900">
              {performance?.totalCustomers || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {performance?.verifiedCustomers || 0} verified
            </p>
          </CardContent>
        </Card>

        {/* Active Cases */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-orange-600" />
              </div>
              {getTrendIcon(2)}
            </div>
            <p className="text-sm text-gray-600 mb-1">Active Cases</p>
            <p className="text-3xl font-bold text-gray-900">
              {performance?.activeCases || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {performance?.highPriorityCases || 0} high priority
            </p>
          </CardContent>
        </Card>

        {/* Pipeline Amount */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              {getTrendIcon(8)}
            </div>
            <p className="text-sm text-gray-600 mb-1">Pipeline Value</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(performance?.pipelineAmount || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              In progress cases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Case Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Case Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">Total Cases</span>
                </div>
                <span className="text-lg font-bold">{performance?.totalCases || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Open Cases</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{performance?.openCases || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">In Progress</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{performance?.activeCases || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <span className="text-lg font-bold text-green-600">{performance?.completedCases || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">Rejected</span>
                </div>
                <span className="text-lg font-bold text-red-600">{performance?.rejectedCases || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer & Document Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Customer & Document Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">Customer KYC Status</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Verified</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ 
                            width: `${performance?.totalCustomers && performance.totalCustomers > 0
                              ? Math.min((performance.verifiedCustomers / performance.totalCustomers) * 100, 100)
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">
                        {performance?.verifiedCustomers || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{ 
                            width: `${performance?.totalCustomers && performance.totalCustomers > 0
                              ? Math.min((performance.pendingKycCustomers / performance.totalCustomers) * 100, 100)
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">
                        {performance?.pendingKycCustomers || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">Document Status</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{performance?.totalDocuments || 0}</p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{performance?.pendingDocuments || 0}</p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{performance?.verifiedDocuments || 0}</p>
                    <p className="text-xs text-gray-600">Verified</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">Task Management</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{performance?.totalTasks || 0}</p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{performance?.openTasks || 0}</p>
                    <p className="text-xs text-gray-600">Open</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{performance?.overdueTasks || 0}</p>
                    <p className="text-xs text-gray-600">Overdue</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Revenue Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Total Closed Value</p>
              <p className="text-3xl font-bold text-green-700">
                {formatCurrency(performance?.totalClosedAmount || 0)}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                From {performance?.completedCases || 0} closed cases
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Pipeline Value</p>
              <p className="text-3xl font-bold text-blue-700">
                {formatCurrency(performance?.pipelineAmount || 0)}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                From {performance?.activeCases || 0} active cases
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-2">Total Value</p>
              <p className="text-3xl font-bold text-purple-700">
                {formatCurrency((performance?.totalClosedAmount || 0) + (performance?.pipelineAmount || 0))}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Closed + Pipeline
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Activity */}
      {performance?.lastCaseActivity && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Last case activity</span>
              </div>
              <span className="font-medium">
                {new Date(performance.lastCaseActivity).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

