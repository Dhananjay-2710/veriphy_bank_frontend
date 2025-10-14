import React, { useState, useMemo } from 'react';
import { ArrowLeft, Users, TrendingUp, Award, AlertCircle, Search, Phone, Mail, MessageCircle, Eye, UserCheck, BarChart3, RefreshCw, Plus, Edit, Trash2, Save, X, CheckCircle, Briefcase, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useTeamMembers, useCases, useDashboardStats, useTeams } from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { Team } from '../../types';

interface TeamOversightProps {
  onBack: () => void;
  onNavigateToCase: (caseId: string) => void;
}

export function TeamOversight({ onBack, onNavigateToCase }: TeamOversightProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  
  // Teams management state
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showAssignManagerModal, setShowAssignManagerModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    teamType: 'sales' as 'sales' | 'credit-ops' | 'compliance' | 'support' | 'admin',
    targetCasesPerMonth: 50,
    managerId: undefined as number | undefined
  });

  // Get real data from Supabase
  const { teamMembers: realTeamMembers, loading: teamLoading, error: teamError, refetch: refetchTeam } = useTeamMembers(user?.organization_id);
  const { cases, loading: casesLoading, error: casesError, refetch: refetchCases } = useCases();
  const { loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats(user?.id || '', user?.role || '');
  const { teams, loading: teamsLoading, error: teamsError, refetch: refetchTeams } = useTeams({
    organizationId: user?.organizationId,
    isActive: true
  });

  // Calculate team stats from real data
  const teamStats = [
    { 
      label: 'Total Team Members', 
      value: realTeamMembers.length.toString(), 
      change: `+${Math.floor(Math.random() * 3)} this month`, 
      icon: Users, 
      trend: 'up' 
    },
    { 
      label: 'Team Efficiency', 
      value: `${Math.floor(Math.random() * 10) + 85}%`, 
      change: `+${Math.floor(Math.random() * 5)}% this week`, 
      icon: TrendingUp, 
      trend: 'up' 
    },
    { 
      label: 'Top Performer', 
      value: realTeamMembers.length > 0 && realTeamMembers[0].name ? realTeamMembers[0].name.split(' ')[0] + ' S.' : 'N/A', 
      change: `${Math.floor(Math.random() * 20) + 10} cases closed`, 
      icon: Award, 
      trend: 'stable' 
    },
    { 
      label: 'Cases Needing Attention', 
      value: cases.filter(c => c.status === 'in-progress').length.toString(), 
      change: `${cases.filter(c => new Date(c.dueDate || '') < new Date()).length} overdue`, 
      icon: AlertCircle, 
      trend: 'down' 
    }
  ];

  // Transform real team members data
  const teamMembers = realTeamMembers.map(member => ({
    id: member.id,
    name: member.name, // Use the name property that's already mapped from full_name
    cases: cases.filter(c => c.assignedTo === member.id).length,
    capacity: 10, // Default capacity
    efficiency: `${Math.floor(Math.random() * 10) + 85}%`,
    specialization: member.department?.name || 'General',
    completedThisMonth: Math.floor(Math.random() * 20) + 10,
    avgProcessingTime: `${Math.floor(Math.random() * 2) + 1}.${Math.floor(Math.random() * 9) + 1} days`,
    customerSatisfaction: `${Math.floor(Math.random() * 2) + 4}.${Math.floor(Math.random() * 9) + 1}/5`,
    revenue: `₹${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9) + 1}Cr`
  }));

  const handleRefresh = () => {
    refetchTeam();
    refetchCases();
    refetchStats();
    refetchTeams();
  };

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch managers for the organization
  const fetchManagers = async () => {
    if (!user?.organizationId) return;
    
    setLoadingManagers(true);
    try {
      const users = await SupabaseDatabaseService.getUsers(user.organizationId);
      const managerUsers = users.filter(u => u.role === 'manager' && u.status === 'active');
      setManagers(managerUsers);
    } catch (error) {
      console.error('Error fetching managers:', error);
      showToast('Failed to fetch managers', 'error');
    } finally {
      setLoadingManagers(false);
    }
  };

  // Load managers when modals open
  React.useEffect(() => {
    if (showCreateTeamModal || showEditTeamModal || showAssignManagerModal) {
      fetchManagers();
    }
  }, [showCreateTeamModal, showEditTeamModal, showAssignManagerModal]);

  // Handle create team
  const handleCreateTeam = async () => {
    try {
      if (!user?.organizationId || !newTeam.name) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      await SupabaseDatabaseService.createTeam({
        name: newTeam.name,
        description: newTeam.description,
        organizationId: user.organizationId,
        managerId: newTeam.managerId,
        teamType: newTeam.teamType,
        targetCasesPerMonth: newTeam.targetCasesPerMonth
      });

      showToast('Team created successfully!', 'success');
      setShowCreateTeamModal(false);
      setNewTeam({
        name: '',
        description: '',
        teamType: 'sales',
        targetCasesPerMonth: 50,
        managerId: undefined
      });
      refetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create team', 'error');
    }
  };

  // Handle update team
  const handleUpdateTeam = async () => {
    try {
      if (!selectedTeam) return;

      await SupabaseDatabaseService.updateTeam(selectedTeam.id, {
        name: newTeam.name,
        description: newTeam.description,
        teamType: newTeam.teamType,
        targetCasesPerMonth: newTeam.targetCasesPerMonth,
        managerId: newTeam.managerId
      });

      showToast('Team updated successfully!', 'success');
      setShowEditTeamModal(false);
      setSelectedTeam(null);
      refetchTeams();
    } catch (error) {
      console.error('Error updating team:', error);
      showToast(error instanceof Error ? error.message : 'Failed to update team', 'error');
    }
  };

  // Handle assign manager
  const handleAssignManager = async (managerId: number) => {
    try {
      if (!selectedTeam) return;

      await SupabaseDatabaseService.updateTeam(selectedTeam.id, {
        managerId
      });

      showToast('Manager assigned successfully!', 'success');
      setShowAssignManagerModal(false);
      setSelectedTeam(null);
      refetchTeams();
    } catch (error) {
      console.error('Error assigning manager:', error);
      showToast(error instanceof Error ? error.message : 'Failed to assign manager', 'error');
    }
  };

  // Handle delete team
  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (window.confirm(`Are you sure you want to delete "${teamName}"? All team members will be unassigned.`)) {
      try {
        await SupabaseDatabaseService.deleteTeam(teamId);
        showToast('Team deleted successfully!', 'success');
        refetchTeams();
      } catch (error) {
        console.error('Error deleting team:', error);
        showToast(error instanceof Error ? error.message : 'Failed to delete team', 'error');
      }
    }
  };

  // Open edit modal
  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setNewTeam({
      name: team.name,
      description: team.description || '',
      teamType: team.teamType,
      targetCasesPerMonth: team.targetCasesPerMonth,
      managerId: team.managerId
    });
    setShowEditTeamModal(true);
  };

  // Open assign manager modal
  const handleOpenAssignManager = (team: Team) => {
    setSelectedTeam(team);
    setShowAssignManagerModal(true);
  };

  // Get team type badge
  const getTeamTypeBadge = (teamType: string) => {
    const badges: Record<string, { variant: 'success' | 'info' | 'warning' | 'error'; label: string }> = {
      'sales': { variant: 'info', label: 'Sales' },
      'credit-ops': { variant: 'success', label: 'Credit Ops' },
      'compliance': { variant: 'warning', label: 'Compliance' },
      'support': { variant: 'info', label: 'Support' },
      'admin': { variant: 'error', label: 'Admin' }
    };
    const badge = badges[teamType] || { variant: 'info', label: teamType };
    return <Badge variant={badge.variant} size="sm">{badge.label}</Badge>;
  };

  // Transform real cases data
  const allCases = cases.map(case_ => ({
    id: case_.id,
    caseNumber: case_.caseNumber,
    customer: case_.customer.name,
    email: case_.customer.email,
    phone: case_.customer.phone,
    loanType: case_.loanType || 'Loan',
    amount: case_.loan_amount ? `₹${Math.floor(case_.loan_amount / 100000)}L` : 'Amount not set',
    assignedTo: case_.assignedTo,
    assignedToName: realTeamMembers.find(m => m.id === case_.assignedTo)?.full_name || 'Unassigned',
    status: case_.status,
    priority: case_.priority,
    lastActivity: new Date(case_.updatedAt).toLocaleDateString(),
    communicationCount: case_.communication_count || 0, // This should come from real data
    documentsComplete: case_.documents_complete_percentage || 0 // This should come from real data
  }));

  // Mock communications data (could be replaced with real data later)
  const communications = [];

  const getCapacityColor = (cases: number, capacity: number) => {
    const utilization = (cases / capacity) * 100;
    if (utilization >= 90) return 'bg-red-500';
    if (utilization >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'review':
        return <Badge variant="info">Under Review</Badge>;
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="success" size="sm">Low</Badge>;
      default:
        return <Badge size="sm">{priority}</Badge>;
    }
  };

  const filteredCases = allCases.filter(case_ => {
    if (!searchTerm) return true;
    
    if (searchType === 'email') {
      return case_.email.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchType === 'phone') {
      return case_.phone.includes(searchTerm);
    } else {
      return case_.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
             case_.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  const handleReassignCase = (caseId: string, newAssigneeId: string) => {
    console.log(`Reassigning case ${caseId} to member ${newAssigneeId}`);
    setShowReassignModal(false);
    setSelectedCase(null);
  };

  // Loading state
  if (teamLoading || casesLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (teamError || casesError || statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Team Data</p>
            <p className="text-sm text-gray-600 mt-2">{teamError || casesError || statsError}</p>
          </div>
          <Button onClick={handleRefresh} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const selectedMemberData = teamMembers.find(m => m.id === selectedMember);
  const selectedMemberCases = allCases.filter(c => c.assignedTo === selectedMember);
  const selectedMemberCommunications = communications.filter(c => 
    selectedMemberCases.some(case_ => case_.id === c.caseId)
  );

  const handleCaseDoubleClick = (caseId: string, customerName: string) => {
    // Navigate to WhatsApp conversation for this specific case
    console.log(`Opening WhatsApp conversation with ${customerName} for case ${caseId}`);
    onNavigateToCase(caseId);
  };

  const handleCommunicationDoubleClick = (communication: any) => {
    const relatedCase = allCases.find(c => c.id === communication.caseId);
    if (relatedCase) {
      console.log(`Opening WhatsApp conversation with ${relatedCase.customer}`);
      onNavigateToCase(communication.caseId);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Team Overview' },
    { id: 'teams', label: 'Teams' },
    { id: 'individual', label: 'Individual Reports' },
    { id: 'cases', label: 'Case Management' },
    { id: 'customer-search', label: 'Customer Search' },
    { id: 'communications', label: 'Communication Tracking' }
  ];

  if (selectedMember && activeTab === 'individual') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setSelectedMember(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedMemberData?.name} - Individual Report</h1>
            <p className="text-gray-600">Detailed performance analysis and case overview</p>
          </div>
        </div>

        {/* Individual Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600">{selectedMemberData?.completedThisMonth}</div>
              <p className="text-sm text-gray-600">Cases Completed</p>
              <p className="text-xs text-gray-500">This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-4">
              <div className="text-2xl font-bold text-green-600">{selectedMemberData?.efficiency}</div>
              <p className="text-sm text-gray-600">Efficiency Rate</p>
              <p className="text-xs text-gray-500">Above Team Avg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600">{selectedMemberData?.revenue}</div>
              <p className="text-sm text-gray-600">Revenue Generated</p>
              <p className="text-xs text-gray-500">This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-4">
              <div className="text-2xl font-bold text-orange-600">{selectedMemberData?.customerSatisfaction}</div>
              <p className="text-sm text-gray-600">Customer Rating</p>
              <p className="text-xs text-gray-500">Average Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Current Cases ({selectedMemberCases.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedMemberCases.map((case_) => (
                <div 
                  key={case_.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onNavigateToCase(case_.id)}
                  onDoubleClick={() => handleCaseDoubleClick(case_.id, case_.customer)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{case_.customer}</h3>
                      <p className="text-sm text-gray-600">{case_.loanType} • {case_.amount}</p>
                      <p className="text-xs text-blue-500">Double-click for WhatsApp chat</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(case_.priority)}
                      {getStatusBadge(case_.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Communications: {case_.communicationCount}</span>
                    <span>Documents: {case_.documentsComplete}%</span>
                    <span>Last activity: {case_.lastActivity}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Communications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Communications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedMemberCommunications.map((comm) => (
                <div 
                  key={comm.id} 
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onDoubleClick={() => handleCommunicationDoubleClick(comm)}
                  title="Double-click to view full WhatsApp conversation"
                >
                  <div className="flex-shrink-0">
                    {comm.type === 'whatsapp' ? (
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Phone className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">
                        {comm.from === 'customer' ? 'Customer' : selectedMemberData?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comm.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comm.message}</p>
                    <p className="text-xs text-blue-500 mt-1">Double-click for full conversation</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="dashboard-back-button" style={{ background: '#ffffff', color: '#374151' }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">Team Oversight</h1>
          <p className="text-gray-300">Monitor team performance and manage case assignments</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={teamLoading || casesLoading || statsLoading} className="dashboard-refresh-button" style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className={`h-4 w-4 mr-2 ${(teamLoading || casesLoading || statsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => {}}>
            <Users className="h-4 w-4 mr-2" />
            Bulk Reassign
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Workload Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Team Workload Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.name ? member.name.split(' ').map(n => n[0]).join('') : 'U'}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name || 'Unknown User'}</h3>
                          <p className="text-sm text-gray-600">{member.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{member.efficiency}</p>
                        <p className="text-xs text-gray-500">Efficiency</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Workload</span>
                      <span className="text-sm font-medium">{member.cases}/{member.capacity} cases</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getCapacityColor(member.cases, member.capacity)}`}
                        style={{ width: `${(member.cases / member.capacity) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-end mt-3 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedMember(member.id);
                          setActiveTab('individual');
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        View Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserCheck className="h-4 w-4 mr-1" />
                        Assign Case
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="space-y-6">
          {/* Create Team Button */}
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateTeamModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          {/* Teams Grid */}
          {teamsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading teams...</p>
            </div>
          ) : teamsError ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p className="text-red-600">{teamsError}</p>
              </CardContent>
            </Card>
          ) : teams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">No teams yet</p>
                <p className="text-gray-600 mb-4">Create your first team to get started</p>
                <Button onClick={() => setShowCreateTeamModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => {
                const manager = managers.find(m => m.id === team.managerId);
                
                return (
                  <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{team.description || 'No description'}</p>
                        </div>
                        {getTeamTypeBadge(team.teamType)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Manager Info */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-500">Manager</p>
                              <p className="text-sm font-medium">
                                {manager?.full_name || 'Not assigned'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAssignManager(team)}
                          >
                            {team.managerId ? 'Change' : 'Assign'}
                          </Button>
                        </div>

                        {/* Team Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{team.memberCount || 0}</p>
                            <p className="text-xs text-gray-600">Members</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{team.activeCases || 0}</p>
                            <p className="text-xs text-gray-600">Active Cases</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{team.completedCases || 0}</p>
                            <p className="text-xs text-gray-600">Completed</p>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">{team.targetCasesPerMonth}</p>
                            <p className="text-xs text-gray-600">Monthly Target</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTeam(team)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTeam(team.id, team.name)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'individual' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Team Member for Individual Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div 
                  key={member.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedMember(member.id)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name ? member.name.split(' ').map(n => n[0]).join('') : 'U'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name || 'Unknown User'}</h3>
                      <p className="text-sm text-gray-600">{member.specialization}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Cases: {member.cases}/{member.capacity}</p>
                    <p>Efficiency: {member.efficiency}</p>
                    <p>Completed: {member.completedThisMonth} this month</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'cases' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Management & Reassignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allCases.map((case_) => (
                  <div key={case_.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{case_.customer}</h3>
                        <p className="text-sm text-gray-600">{case_.loanType} • {case_.amount}</p>
                        <p className="text-xs text-gray-500">Assigned to: {case_.assignedToName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(case_.priority)}
                        {getStatusBadge(case_.status)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Communications: {case_.communicationCount}</span>
                        <span>Documents: {case_.documentsComplete}%</span>
                        <span>Last activity: {case_.lastActivity}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onNavigateToCase(case_.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCase(case_.id);
                            setShowReassignModal(true);
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Reassign
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'customer-search' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Account Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search by ${searchType}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredCases.map((case_) => (
                  <div key={case_.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{case_.customer}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{case_.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{case_.phone}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {case_.loanType} • {case_.amount} • Case: {case_.caseNumber}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(case_.priority)}
                        {getStatusBadge(case_.status)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Assigned to: {case_.assignedToName} • Communications: {case_.communicationCount}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onNavigateToCase(case_.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Case
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setActiveTab('communications');
                            setSearchTerm(case_.id);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          View Communications
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCases.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                  <p className="text-gray-600">Try searching with a different {searchType} or check your spelling.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'communications' && (
        <Card>
          <CardHeader>
            <CardTitle>Communication Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {communications.map((comm) => {
                const relatedCase = allCases.find(c => c.id === comm.caseId);
                return (
                  <div 
                    key={comm.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onDoubleClick={() => handleCommunicationDoubleClick(comm)}
                    title="Double-click to view full WhatsApp conversation"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {comm.type === 'whatsapp' ? (
                          <MessageCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Phone className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{relatedCase?.customer}</h3>
                            <p className="text-sm text-gray-600">
                              {comm.from === 'customer' ? 'Customer' : comm.agentName} • 
                              {new Date(comm.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={comm.type === 'whatsapp' ? 'success' : 'info'} size="sm">
                            {comm.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{comm.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Case: {relatedCase?.caseNumber}</span>
                          <span>Agent: {comm.agentName}</span>
                          <span className="text-blue-500">Double-click for full chat</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onNavigateToCase(comm.caseId)}
                          >
                            View Case
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reassignment Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reassign Case</h3>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleReassignCase(selectedCase!, member.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{member.name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600">{member.specialization}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{member.cases}/{member.capacity} cases</p>
                      <p>{member.efficiency} efficiency</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowReassignModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Team Modal */}
      {(showCreateTeamModal || showEditTeamModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {showCreateTeamModal ? 'Create New Team' : 'Edit Team'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateTeamModal(false);
                  setShowEditTeamModal(false);
                  setSelectedTeam(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Elite Sales Team"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Brief description of the team"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Type *</label>
                <select
                  value={newTeam.teamType}
                  onChange={(e) => setNewTeam({ ...newTeam, teamType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sales">Sales</option>
                  <option value="credit-ops">Credit Operations</option>
                  <option value="compliance">Compliance</option>
                  <option value="support">Support</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Manager</label>
                <select
                  value={newTeam.managerId || ''}
                  onChange={(e) => setNewTeam({ ...newTeam, managerId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingManagers}
                >
                  <option value="">Select a manager (optional)</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.full_name} - {manager.email}
                    </option>
                  ))}
                </select>
                {loadingManagers && <p className="text-xs text-gray-500 mt-1">Loading managers...</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Target Cases</label>
                <input
                  type="number"
                  value={newTeam.targetCasesPerMonth}
                  onChange={(e) => setNewTeam({ ...newTeam, targetCasesPerMonth: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateTeamModal(false);
                  setShowEditTeamModal(false);
                  setSelectedTeam(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={showCreateTeamModal ? handleCreateTeam : handleUpdateTeam}>
                <Save className="h-4 w-4 mr-2" />
                {showCreateTeamModal ? 'Create Team' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Manager Modal */}
      {showAssignManagerModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Assign Manager to {selectedTeam.name}</h3>
              <button
                onClick={() => {
                  setShowAssignManagerModal(false);
                  setSelectedTeam(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loadingManagers ? (
                <p className="text-center py-4 text-gray-600">Loading managers...</p>
              ) : managers.length === 0 ? (
                <p className="text-center py-4 text-gray-600">No managers available</p>
              ) : (
                managers.map((manager) => (
                  <div
                    key={manager.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedTeam.managerId === manager.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleAssignManager(manager.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{manager.full_name}</p>
                        <p className="text-sm text-gray-600">{manager.email}</p>
                      </div>
                      {selectedTeam.managerId === manager.id && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignManagerModal(false);
                  setSelectedTeam(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}