import React, { useState } from 'react';
import { ArrowLeft, Users, TrendingUp, Award, AlertCircle, Clock, Search, Phone, Mail, MessageCircle, Eye, UserCheck, BarChart3, Filter, Calendar, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface TeamOversightProps {
  onBack: () => void;
  onNavigateToCase: (caseId: string) => void;
}

export function TeamOversight({ onBack, onNavigateToCase }: TeamOversightProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const teamStats = [
    { label: 'Total Team Members', value: '12', change: '+2 this month', icon: Users, trend: 'up' },
    { label: 'Team Efficiency', value: '91%', change: '+3% this week', icon: TrendingUp, trend: 'up' },
    { label: 'Top Performer', value: 'Priya S.', change: '18 cases closed', icon: Award, trend: 'stable' },
    { label: 'Cases Needing Attention', value: '5', change: '2 overdue', icon: AlertCircle, trend: 'down' }
  ];

  const teamMembers = [
    { 
      id: '1', 
      name: 'Priya Sharma', 
      cases: 8, 
      capacity: 10, 
      efficiency: '94%', 
      specialization: 'Home Loans',
      completedThisMonth: 18,
      avgProcessingTime: '2.1 days',
      customerSatisfaction: '4.8/5',
      revenue: '₹2.4Cr'
    },
    { 
      id: '2', 
      name: 'Vikram Joshi', 
      cases: 6, 
      capacity: 8, 
      efficiency: '91%', 
      specialization: 'Personal Loans',
      completedThisMonth: 15,
      avgProcessingTime: '1.8 days',
      customerSatisfaction: '4.6/5',
      revenue: '₹1.8Cr'
    },
    { 
      id: '3', 
      name: 'Meera Nair', 
      cases: 10, 
      capacity: 10, 
      efficiency: '87%', 
      specialization: 'Business Loans',
      completedThisMonth: 12,
      avgProcessingTime: '3.2 days',
      customerSatisfaction: '4.5/5',
      revenue: '₹3.1Cr'
    },
    { 
      id: '4', 
      name: 'Arjun Reddy', 
      cases: 4, 
      capacity: 8, 
      efficiency: '85%', 
      specialization: 'Car Loans',
      completedThisMonth: 10,
      avgProcessingTime: '2.5 days',
      customerSatisfaction: '4.7/5',
      revenue: '₹1.2Cr'
    },
    { 
      id: '5', 
      name: 'Shruti Iyer', 
      cases: 7, 
      capacity: 9, 
      efficiency: '89%', 
      specialization: 'Home Loans',
      completedThisMonth: 14,
      avgProcessingTime: '2.3 days',
      customerSatisfaction: '4.6/5',
      revenue: '₹2.0Cr'
    }
  ];

  const allCases = [
    {
      id: 'case-001',
      caseNumber: 'HBI-HL-2025-001',
      customer: 'Ramesh & Sunita Gupta',
      email: 'ramesh.gupta@email.com',
      phone: '+91-9876543210',
      loanType: 'Home Loan',
      amount: '₹50L',
      assignedTo: '1',
      assignedToName: 'Priya Sharma',
      status: 'in-progress',
      priority: 'high',
      lastActivity: '2 hours ago',
      communicationCount: 15,
      documentsComplete: 85
    },
    {
      id: 'case-002',
      caseNumber: 'HBI-PL-2025-002',
      customer: 'Amit Verma',
      email: 'amit.verma@email.com',
      phone: '+91-9876543211',
      loanType: 'Personal Loan',
      amount: '₹5L',
      assignedTo: '2',
      assignedToName: 'Vikram Joshi',
      status: 'review',
      priority: 'medium',
      lastActivity: '1 day ago',
      communicationCount: 8,
      documentsComplete: 100
    },
    {
      id: 'case-003',
      caseNumber: 'HBI-CL-2025-003',
      customer: 'Neha Singh',
      email: 'neha.singh@email.com',
      phone: '+91-9876543212',
      loanType: 'Car Loan',
      amount: '₹8L',
      assignedTo: '4',
      assignedToName: 'Arjun Reddy',
      status: 'new',
      priority: 'low',
      lastActivity: '3 days ago',
      communicationCount: 3,
      documentsComplete: 60
    },
    {
      id: 'case-004',
      caseNumber: 'HBI-BL-2025-004',
      customer: 'Pradeep Kumar',
      email: 'pradeep.kumar@email.com',
      phone: '+91-9876543213',
      loanType: 'Business Loan',
      amount: '₹25L',
      assignedTo: '3',
      assignedToName: 'Meera Nair',
      status: 'approved',
      priority: 'high',
      lastActivity: '5 hours ago',
      communicationCount: 22,
      documentsComplete: 100
    }
  ];

  const communications = [
    {
      id: 'comm-1',
      caseId: 'case-001',
      timestamp: '2025-01-09T15:30:00Z',
      type: 'whatsapp',
      from: 'customer',
      to: 'agent',
      message: 'I have uploaded the GST documents. Please review.',
      agentName: 'Priya Sharma'
    },
    {
      id: 'comm-2',
      caseId: 'case-001',
      timestamp: '2025-01-09T14:15:00Z',
      type: 'call',
      from: 'agent',
      to: 'customer',
      message: 'Follow-up call regarding missing documents - 15 min duration',
      agentName: 'Priya Sharma'
    },
    {
      id: 'comm-3',
      caseId: 'case-001',
      timestamp: '2025-01-09T10:30:00Z',
      type: 'whatsapp',
      from: 'agent',
      to: 'customer',
      message: 'Hi! We need your GST returns for the last 12 months to proceed with your home loan application.',
      agentName: 'Priya Sharma'
    }
  ];

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
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Bulk Reassign
        </Button>
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
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
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
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
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
                      <p className="font-medium text-gray-900">{member.name}</p>
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
  );
}