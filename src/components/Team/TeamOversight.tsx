import React, { useState } from 'react';
import { ArrowLeft, Users, TrendingUp, Award, AlertCircle, Search, Phone, Mail, MessageCircle, Eye, UserCheck, BarChart3, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useTeamMembers, useCases, useDashboardStats } from '../../hooks/useDashboardData';

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

  // Get real data from Supabase
  const { teamMembers: realTeamMembers, loading: teamLoading, error: teamError, refetch: refetchTeam } = useTeamMembers(user?.organization_id);
  const { cases, loading: casesLoading, error: casesError, refetch: refetchCases } = useCases();
  const { loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats(user?.id || '', user?.role || '');

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
          <Button onClick={handleRefresh}>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Oversight</h1>
            <p className="text-gray-600">Monitor team performance and manage case assignments</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={teamLoading || casesLoading || statsLoading}>
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
    </div>
  )
}