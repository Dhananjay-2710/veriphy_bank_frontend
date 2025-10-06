import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  TrendingUp, 
  FileText, 
  Clock, 
  BarChart3, 
  UserPlus, 
  RefreshCw, 
  AlertTriangle,
  Target,
  Award,
  Eye,
  Edit,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useDashboardStats, useCases, useTeamMembers } from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { CaseAssignmentModal } from '../modals/CaseAssignmentModal';

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
  const [teamData, setTeamData] = useState<any[]>([]);
  const [teamStats, setTeamStats] = useState<any>({});
  const [highPriorityCases, setHighPriorityCases] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [assigningCase, setAssigningCase] = useState<string | null>(null);
  const [showCreateCase, setShowCreateCase] = useState(false);
  const [editingCase, setEditingCase] = useState<string | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedCaseForAssignment, setSelectedCaseForAssignment] = useState<any>(null);
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    loanType: 'personal_loan',
    loanAmount: 0,
    customerId: ''
  });
  
  // Get real data from Supabase
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats(user?.id || '', user?.role || '');
  // For managers, show all cases in the organization so they can assign them to team members
  const { cases, loading: casesLoading, error: casesError, refetch: refetchCases } = useCases({
    showAll: true,
    organizationId: user?.organizationId
  });
  const { teamMembers, loading: teamLoading, error: teamError, refetch: refetchTeam } = useTeamMembers();

  // Fetch team performance data
  const fetchTeamData = useCallback(async () => {
    if (!user?.organizationId) return;
    
    setLoadingTeam(true);
    try {
      // Get all team members in the organization
      const teamUsers = await SupabaseDatabaseService.getUsers(user.organizationId);
      const salesTeam = teamUsers.filter(u => u.role === 'salesperson');
      
      // Get cases for each team member
      const teamWithCases = await Promise.all(
        salesTeam.map(async (member) => {
          const memberCases = await SupabaseDatabaseService.getCasesWithDetails({
            organizationId: user.organizationId,
            assignedTo: member.id
          });
          
          return {
            ...member,
            activeCases: memberCases.filter(c => c.status === 'in-progress').length,
            completedCases: memberCases.filter(c => c.status === 'approved').length,
            totalCases: memberCases.length,
            efficiency: memberCases.length > 0 ? 
              Math.round((memberCases.filter(c => c.status === 'approved').length / memberCases.length) * 100) : 0,
            status: memberCases.filter(c => c.status === 'in-progress').length > 5 ? 'busy' : 
                   memberCases.filter(c => c.status === 'in-progress').length > 0 ? 'active' : 'available'
          };
        })
      );
      
      setTeamData(teamWithCases);
      
      // Calculate team stats
      const totalActiveCases = teamWithCases.reduce((sum, member) => sum + member.activeCases, 0);
      const totalCompleted = teamWithCases.reduce((sum, member) => sum + member.completedCases, 0);
      const avgEfficiency = teamWithCases.length > 0 ? 
        Math.round(teamWithCases.reduce((sum, member) => sum + member.efficiency, 0) / teamWithCases.length) : 0;
      
      setTeamStats({
        totalMembers: teamWithCases.length,
        totalActiveCases,
        totalCompleted,
        avgEfficiency,
        topPerformer: teamWithCases.reduce((top, member) => 
          member.efficiency > top.efficiency ? member : top, teamWithCases[0] || {})
      });
      
      // Get high priority cases
      const allCases = await SupabaseDatabaseService.getCasesWithDetails({
        organizationId: user.organizationId,
        priority: 'high'
      });
      setHighPriorityCases(allCases.slice(0, 3));
      
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoadingTeam(false);
    }
  }, [user?.organizationId, user?.id]);

  useEffect(() => {
    if (user?.organizationId) {
      fetchTeamData();
    }
  }, [user?.organizationId, fetchTeamData]);

  // Handle case assignment to team members
  const handleAssignCase = async (caseId: string, assignToUserId: string) => {
    try {
      setAssigningCase(caseId);
      await SupabaseDatabaseService.assignCaseToUser(caseId, assignToUserId);
      // Refresh cases and team data
      refetchCases();
      fetchTeamData();
    } catch (error) {
      console.error('Error assigning case:', error);
    } finally {
      setAssigningCase(null);
    }
  };

  // Handle opening assignment modal
  const handleOpenAssignmentModal = (caseData: any) => {
    setSelectedCaseForAssignment(caseData);
    setShowAssignmentModal(true);
  };

  // Handle assignment modal completion
  const handleAssignmentComplete = () => {
    refetchCases();
    fetchTeamData();
  };

  // Handle creating a new case
  const handleCreateCase = async () => {
    try {
      if (!user?.organizationId || !newCase.customerId) {
        alert('Please fill in all required fields');
        return;
      }

      await SupabaseDatabaseService.createCase({
        organizationId: user.organizationId,
        customerId: parseInt(newCase.customerId),
        productId: 1, // Default product
        title: newCase.title,
        description: newCase.description,
        priority: newCase.priority,
        assignedTo: newCase.assignedTo ? parseInt(newCase.assignedTo) : undefined,
        loanType: newCase.loanType,
        loanAmount: newCase.loanAmount
      });

      // Reset form and refresh data
      setNewCase({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        loanType: 'personal_loan',
        loanAmount: 0,
        customerId: ''
      });
      setShowCreateCase(false);
      refetchCases();
    } catch (error) {
      console.error('Error creating case:', error);
      alert('Failed to create case. Please try again.');
    }
  };

  // Handle updating a case
  const handleUpdateCase = async (caseId: string, updates: any) => {
    try {
      await SupabaseDatabaseService.updateCase(caseId, updates);
      setEditingCase(null);
      refetchCases();
    } catch (error) {
      console.error('Error updating case:', error);
      alert('Failed to update case. Please try again.');
    }
  };

  // Handle deleting a case
  const handleDeleteCase = async (caseId: string) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        await SupabaseDatabaseService.deleteCase(caseId);
        refetchCases();
      } catch (error) {
        console.error('Error deleting case:', error);
        alert('Failed to delete case. Please try again.');
      }
    }
  };
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
  const kpis = useMemo(() => [
    { 
      label: 'Team Cases', 
      value: teamStats.totalActiveCases?.toString() || stats?.totalCases?.toString() || '0', 
      change: '+12%', 
      trend: 'up' as const, 
      icon: FileText, 
      type: 'team-cases', 
      details: `Active: ${teamStats.totalActiveCases || 0} | Completed: ${teamStats.totalCompleted || 0} | Total: ${teamData.reduce((sum, member) => sum + member.totalCases, 0)} | High Priority: ${highPriorityCases.length}` 
    },
    { 
      label: 'Team Efficiency', 
      value: `${teamStats.avgEfficiency || 0}%`, 
      change: '+5%', 
      trend: 'up' as const, 
      icon: Target, 
      type: 'processing-time', 
      details: `Avg: ${teamStats.avgEfficiency || 0}% | Top: ${teamStats.topPerformer?.efficiency || 0}% (${teamStats.topPerformer?.full_name || 'N/A'}) | Range: ${teamData.length > 0 ? Math.min(...teamData.map(m => m.efficiency)) : 0}% - ${teamData.length > 0 ? Math.max(...teamData.map(m => m.efficiency)) : 0}%` 
    },
    { 
      label: 'Approval Rate', 
      value: `${teamStats.avgEfficiency || 0}%`, 
      change: '+5%', 
      trend: 'up' as const, 
      icon: TrendingUp, 
      type: 'approval-rate', 
      details: `Team Avg: ${teamStats.avgEfficiency || 0}% | Completed: ${teamStats.totalCompleted || 0} | Active: ${teamStats.totalActiveCases || 0} | Success Rate: ${teamStats.avgEfficiency || 0}%` 
    },
    { 
      label: 'Team Members', 
      value: teamStats.totalMembers?.toString() || teamData.length.toString() || '0', 
      change: '+2', 
      trend: 'up' as const, 
      icon: Users, 
      type: 'team-members', 
      details: `Active: ${teamStats.totalMembers || 0} | Busy: ${teamData.filter(m => m.status === 'busy').length} | Available: ${teamData.filter(m => m.status === 'available').length} | Top: ${teamStats.topPerformer?.full_name || 'N/A'}` 
    }
  ], [stats, teamStats, teamData, highPriorityCases]);

  // Use real team data from Supabase
  const teamPerformance = useMemo(() => {
    return teamData.map(member => ({
      name: member.full_name || 'Unknown Member',
      cases: member.activeCases,
      completed: member.completedCases,
      efficiency: `${member.efficiency}%`,
      status: member.status,
      id: member.id,
      email: member.email,
      totalCases: member.totalCases
    }));
  }, [teamData]);

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
  if (statsLoading || casesLoading || teamLoading || loadingTeam) {
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
          <Button variant="outline" onClick={() => { 
            refetchStats(); 
            refetchCases(); 
            refetchTeam(); 
            fetchTeamData(); 
          }}>
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

      {/* All Cases with Assignment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Cases - Assign to Team Members</CardTitle>
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => setShowCreateCase(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Create Case
              </Button>
              <Button variant="outline" size="sm" onClick={onNavigateToCases}>View All</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cases.length > 0 ? (
              cases.slice(0, 10).map((case_, index) => (
                <div 
                  key={case_.id || index}
                  className="p-4 border border-gray-200 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {case_.customer?.name || 'Unknown Customer'}
                        </h3>
                        <Badge variant={case_.priority === 'high' ? 'error' : case_.priority === 'medium' ? 'warning' : 'info'} size="sm">
                          {case_.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {case_.loanType} • ₹{case_.loanAmount ? (case_.loanAmount / 100000).toFixed(0) + 'L' : 'N/A'} • {case_.customer?.employment || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: {case_.status} • Case: {case_.caseNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        Currently assigned to: {case_.assignedTo ? `User ${case_.assignedTo}` : 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onNavigateToCase(case_.id)}
                          title="View case details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingCase(case_.id)}
                          title="Edit case"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenAssignmentModal(case_)}
                          title="Assign case to team member"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCase(case_.id)}
                          title="Delete case"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No cases found</p>
                <p className="text-sm">Create new cases to start managing your team</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Case Modal */}
      {showCreateCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Case</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID *
                </label>
                <input
                  type="number"
                  value={newCase.customerId}
                  onChange={(e) => setNewCase({...newCase, customerId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter customer ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newCase.title}
                  onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Case title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCase.description}
                  onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Case description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newCase.priority}
                  onChange={(e) => setNewCase({...newCase, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Type
                </label>
                <select
                  value={newCase.loanType}
                  onChange={(e) => setNewCase({...newCase, loanType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="personal_loan">Personal Loan</option>
                  <option value="home_loan">Home Loan</option>
                  <option value="business_loan">Business Loan</option>
                  <option value="car_loan">Car Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount
                </label>
                <input
                  type="number"
                  value={newCase.loanAmount}
                  onChange={(e) => setNewCase({...newCase, loanAmount: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Loan amount in rupees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To (Optional)
                </label>
                <select
                  value={newCase.assignedTo}
                  onChange={(e) => setNewCase({...newCase, assignedTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select team member</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName || member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateCase(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCase}>
                <Save className="h-4 w-4 mr-2" />
                Create Case
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Case Assignment Modal */}
      {showAssignmentModal && selectedCaseForAssignment && (
        <CaseAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedCaseForAssignment(null);
          }}
          caseData={selectedCaseForAssignment}
          teamMembers={teamMembers}
          onAssignmentComplete={handleAssignmentComplete}
        />
      )}
    </div>
  );
}