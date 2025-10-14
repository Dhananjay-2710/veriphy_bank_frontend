import React, { useState } from 'react';
import { 
  Users, 
  RefreshCw, 
  Trophy,
  TrendingUp,
  Target,
  Award,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useSalespersonTeam, useTeamLeaderboard, useTeams } from '../../hooks/useDashboardData';

interface MyTeamProps {
  onBack?: () => void;
}

export function MyTeam({ onBack }: MyTeamProps) {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<'members' | 'leaderboard'>('members');

  // Get team data
  const { data: teams } = useTeams({
    organizationId: user?.organization_id
  });
  
  const userTeam = teams?.find(t => t.id === user?.team_id?.toString());
  
  const { teamMembers, loading: membersLoading, error: membersError, refetch: refetchMembers } = useSalespersonTeam(
    user?.team_id?.toString()
  );

  const { leaderboard, loading: leaderboardLoading, refetch: refetchLeaderboard } = useTeamLeaderboard({
    organizationId: user?.organization_id,
    teamId: user?.team_id
  });

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(2)}L`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const loading = membersLoading || leaderboardLoading;

  if (loading && !teamMembers.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Team</h2>
          <p className="text-gray-600 mb-4">{membersError}</p>
          <Button onClick={refetchMembers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!user?.team_id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              {onBack && (
                <Button variant="outline" size="sm" onClick={onBack}>
                  ← Back
                </Button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">My Team</h1>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Not Assigned to a Team</h3>
            <p className="text-gray-600">
              You haven't been assigned to a team yet. Please contact your manager.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teamStats = {
    totalMembers: teamMembers.length,
    totalCustomers: teamMembers.reduce((sum, m) => sum + (m.totalCustomers || 0), 0),
    activeCases: teamMembers.reduce((sum, m) => sum + (m.activeCases || 0), 0),
    completedThisMonth: teamMembers.reduce((sum, m) => sum + (m.completedThisMonth || 0), 0),
    totalTarget: teamMembers.reduce((sum, m) => sum + (m.monthlyTarget || 0), 0),
    totalAchieved: teamMembers.reduce((sum, m) => sum + (m.achievedThisMonth || 0), 0)
  };

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
            <h1 className="text-2xl font-bold text-gray-900">My Team</h1>
          </div>
          <p className="text-gray-600">
            {userTeam?.name || 'Sales Team'} - {teamStats.totalMembers} members
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedView('members')}
              className={`px-4 py-2 text-sm font-medium ${
                selectedView === 'members'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Team Members
            </button>
            <button
              onClick={() => setSelectedView('leaderboard')}
              className={`px-4 py-2 text-sm font-medium ${
                selectedView === 'leaderboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Leaderboard
            </button>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              refetchMembers();
              refetchLeaderboard();
            }}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
                <p className="text-sm text-gray-600">Team Members</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{teamStats.activeCases}</p>
                <p className="text-sm text-gray-600">Active Cases</p>
              </div>
              <Briefcase className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{teamStats.completedThisMonth}</p>
                <p className="text-sm text-gray-600">Completed This Month</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {teamStats.totalTarget > 0 
                    ? `${((teamStats.totalAchieved / teamStats.totalTarget) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
                <p className="text-sm text-gray-600">Target Achievement</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Target</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(teamStats.totalTarget)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Achieved</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(teamStats.totalAchieved)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Remaining</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(teamStats.totalTarget - teamStats.totalAchieved)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${teamStats.totalTarget > 0 ? Math.min((teamStats.totalAchieved / teamStats.totalTarget) * 100, 100) : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members or Leaderboard */}
      {selectedView === 'members' ? (
        <div className="grid grid-cols-1 gap-4">
          {teamMembers && teamMembers.length > 0 ? (
            teamMembers.map((member) => {
            const isCurrentUser = member.id === user?.id?.toString();
            return (
              <Card 
                key={member.id} 
                className={`hover:shadow-lg transition-shadow ${
                  isCurrentUser ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className={`h-14 w-14 rounded-full ${
                          isCurrentUser ? 'bg-blue-100' : 'bg-gray-100'
                        } flex items-center justify-center`}>
                          <Users className={`h-7 w-7 ${
                            isCurrentUser ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                      </div>

                      {/* Member Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {member.fullName}
                            {isCurrentUser && (
                              <span className="ml-2 text-sm text-blue-600">(You)</span>
                            )}
                          </h3>
                          <Badge variant="default" size="sm">{member.role}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          {member.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{member.email}</span>
                            </div>
                          )}
                          {member.mobile && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{member.mobile}</span>
                            </div>
                          )}
                          {member.lastLoginAt && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Last active: {formatDate(member.lastLoginAt)}</span>
                            </div>
                          )}
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500">Active Cases</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {member.activeCases || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Completed</p>
                            <p className="text-lg font-semibold text-green-600">
                              {member.completedThisMonth || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Target</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(member.monthlyTarget || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Achieved</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {formatCurrency(member.achievedThisMonth || 0)}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Target Progress</span>
                            <span>
                              {member.monthlyTarget > 0 
                                ? `${((member.achievedThisMonth / member.monthlyTarget) * 100).toFixed(1)}%`
                                : '0%'
                              }
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isCurrentUser 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500'
                              }`}
                              style={{ 
                                width: `${member.monthlyTarget > 0 ? Math.min((member.achievedThisMonth / member.monthlyTarget) * 100, 100) : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
                <p className="text-gray-600">
                  Your team doesn't have any members yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Leaderboard View */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span>Team Leaderboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.userId === user?.id?.toString();
                const rankColor = index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-orange-600' : 'text-gray-400';
                
                return (
                  <div 
                    key={entry.userId}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      isCurrentUser 
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Rank */}
                      <div className={`text-2xl font-bold ${rankColor} w-8 text-center`}>
                        #{entry.teamRank}
                      </div>

                      {/* Trophy for top 3 */}
                      {index < 3 && (
                        <Trophy className={`h-6 w-6 ${rankColor}`} />
                      )}

                      {/* Name */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {entry.fullName}
                          {isCurrentUser && (
                            <span className="ml-2 text-sm text-blue-600">(You)</span>
                          )}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <Briefcase className="h-3 w-3" />
                            <span>{entry.completedThisMonth} completed</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Target className="h-3 w-3" />
                            <span>{entry.targetAchievementPercentage.toFixed(1)}% of target</span>
                          </span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="hidden md:flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Achieved</p>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(entry.achievedThisMonth)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {entry.performanceScore.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">No Leaderboard Data</p>
                <p className="text-gray-600">
                  Complete some cases to appear on the leaderboard!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

