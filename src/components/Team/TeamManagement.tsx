import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface TeamManagementProps {
  onBack: () => void;
  onNavigateToMember: (memberId: string) => void;
}

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  activeCases: number;
  completedCases: number;
  totalCases: number;
  efficiency: number;
  lastActivity: string;
}

interface UnassignedCase {
  id: string;
  caseNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  loanType: string;
  loanAmount: number;
  priority: string;
  status: string;
  createdAt: string;
}

export function TeamManagement({ onBack, onNavigateToMember }: TeamManagementProps) {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [unassignedCases, setUnassignedCases] = useState<UnassignedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const fetchTeamData = async () => {
    if (!user?.organizationId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Get all team members in the organization
      const allUsers = await SupabaseDatabaseService.getUsers(user.organizationId);
      const salesTeam = allUsers.filter(u => u.role === 'salesperson');
      
      // Get performance data for each team member
      const teamWithPerformance = await Promise.all(
        salesTeam.map(async (member) => {
          const memberCases = await SupabaseDatabaseService.getCasesWithDetails({
            organizationId: user.organizationId,
            assignedTo: member.id
          });
          
          const activeCases = memberCases.filter(c => c.status === 'in-progress').length;
          const completedCases = memberCases.filter(c => c.status === 'approved').length;
          const efficiency = memberCases.length > 0 ? 
            Math.round((completedCases / memberCases.length) * 100) : 0;
          
          return {
            ...member,
            activeCases,
            completedCases,
            totalCases: memberCases.length,
            efficiency,
            status: activeCases > 5 ? 'busy' : 
                   activeCases > 0 ? 'active' : 'available',
            lastActivity: memberCases.length > 0 ? 
              memberCases.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt :
              member.updated_at || member.created_at
          };
        })
      );
      
      setTeamMembers(teamWithPerformance);
      
      // Get unassigned cases
      const allCases = await SupabaseDatabaseService.getCasesWithDetails({
        organizationId: user.organizationId
      });
      const unassigned = allCases.filter(c => !c.assignedTo || c.assignedTo === '');
      
      setUnassignedCases(unassigned.slice(0, 10)); // Show top 10 unassigned cases
      
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [user?.organizationId]);

  const handleAssignCase = async (caseId: string, memberId: string) => {
    if (!memberId) return;
    
    setAssigning(true);
    try {
      await SupabaseDatabaseService.assignCase(caseId, memberId);
      await fetchTeamData(); // Refresh data
    } catch (err) {
      console.error('Error assigning case:', err);
      setError('Failed to assign case');
    } finally {
      setAssigning(false);
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="info" size="sm">Low</Badge>;
      default:
        return <Badge size="sm">{priority}</Badge>;
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team management data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Team Data</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={fetchTeamData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage team members and case assignments</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchTeamData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.reduce((sum, member) => sum + member.activeCases, 0)}
                </p>
                <p className="text-sm text-gray-600">Active Cases</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.length > 0 ? 
                    Math.round(teamMembers.reduce((sum, member) => sum + member.efficiency, 0) / teamMembers.length) : 0}%
                </p>
                <p className="text-sm text-gray-600">Avg Efficiency</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{unassignedCases.length}</p>
                <p className="text-sm text-gray-600">Unassigned Cases</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="active">Active</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>

          {/* Team Members List */}
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <div 
                key={member.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{member.full_name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-xs text-gray-500">
                        {member.activeCases} active • {member.completedCases} completed • {member.totalCases} total
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${getEfficiencyColor(member.efficiency)}`}>
                        {member.efficiency}%
                      </p>
                      <p className="text-xs text-gray-500">Efficiency</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(member.status)}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigateToMember(member.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredMembers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No team members found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unassigned Cases */}
      {unassignedCases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Cases - Quick Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unassignedCases.map((case_) => (
                <div key={case_.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{case_.customer.name}</h3>
                      <p className="text-sm text-gray-600">
                        {case_.loanType} • ₹{(case_.loanAmount / 100000).toFixed(0)}L • Case: {case_.caseNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {case_.customer.email} • {case_.customer.phone}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getPriorityBadge(case_.priority)}
                      
                      <select
                        onChange={(e) => handleAssignCase(case_.id, e.target.value)}
                        disabled={assigning}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Assign to...</option>
                        {teamMembers
                          .filter(member => member.status !== 'busy')
                          .map(member => (
                            <option key={member.id} value={member.id}>
                              {member.full_name} ({member.activeCases} active)
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
