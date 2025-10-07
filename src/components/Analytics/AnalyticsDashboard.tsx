import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Clock,
  Target,
  Award,
  ArrowLeft,
  RefreshCw,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface AnalyticsDashboardProps {
  onBack: () => void;
}

interface AnalyticsData {
  teamPerformance: {
    memberId: string;
    memberName: string;
    casesCompleted: number;
    efficiency: number;
    avgProcessingTime: number;
    customerSatisfaction: number;
  }[];
  caseTrends: {
    date: string;
    newCases: number;
    completedCases: number;
    approvalRate: number;
  }[];
  loanTypeBreakdown: {
    type: string;
    count: number;
    avgAmount: number;
    approvalRate: number;
  }[];
  kpis: {
    totalCases: number;
    completionRate: number;
    avgProcessingTime: number;
    customerSatisfaction: number;
    teamEfficiency: number;
  };
}

export function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalyticsData = async () => {
    if (!user?.organizationId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Get all cases in the organization
      const allCases = await SupabaseDatabaseService.getCasesWithDetails({
        organizationId: user.organizationId
      });
      
      // Get team members
      const teamUsers = await SupabaseDatabaseService.getUsers(user.organizationId);
      const salesTeam = teamUsers.filter(u => u.role === 'salesperson');
      
      // Calculate team performance
      const teamPerformance = await Promise.all(
        salesTeam.map(async (member) => {
          const memberCases = await SupabaseDatabaseService.getCasesWithDetails({
            organizationId: user.organizationId,
            assignedTo: member.id
          });
          
          const completedCases = memberCases.filter(c => c.status === 'approved').length;
          const efficiency = memberCases.length > 0 ? 
            Math.round((completedCases / memberCases.length) * 100) : 0;
          
          // Calculate average processing time (simplified)
          const processingTimes = memberCases
            .filter(c => c.status === 'approved')
            .map(c => {
              const created = new Date(c.createdAt);
              const updated = new Date(c.updatedAt);
              return Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            });
          
          const avgProcessingTime = processingTimes.length > 0 ?
            Math.round(processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length) : 0;
          
          return {
            memberId: member.id,
            memberName: member.full_name,
            casesCompleted: completedCases,
            efficiency,
            avgProcessingTime,
            customerSatisfaction: 85 + Math.random() * 15 // Simulated satisfaction score
          };
        })
      );
      
      // Generate case trends (last 30 days)
      const caseTrends = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayCases = allCases.filter(c => 
          c.createdAt.startsWith(dateStr)
        );
        
        const dayCompleted = allCases.filter(c => 
          c.updatedAt.startsWith(dateStr) && c.status === 'approved'
        );
        
        caseTrends.push({
          date: dateStr,
          newCases: dayCases.length,
          completedCases: dayCompleted.length,
          approvalRate: dayCases.length > 0 ? 
            Math.round((dayCompleted.length / dayCases.length) * 100) : 0
        });
      }
      
      // Calculate loan type breakdown
      const loanTypes = ['Home Loan', 'Personal Loan', 'Car Loan', 'Business Loan'];
      const loanTypeBreakdown = loanTypes.map(type => {
        const typeCases = allCases.filter(c => c.loanType === type);
        const approvedCases = typeCases.filter(c => c.status === 'approved');
        const totalAmount = typeCases.reduce((sum, c) => sum + (c.loanAmount || 0), 0);
        
        return {
          type,
          count: typeCases.length,
          avgAmount: typeCases.length > 0 ? Math.round(totalAmount / typeCases.length / 100000) : 0,
          approvalRate: typeCases.length > 0 ? 
            Math.round((approvedCases.length / typeCases.length) * 100) : 0
        };
      });
      
      // Calculate KPIs
      const totalCases = allCases.length;
      const completedCases = allCases.filter(c => c.status === 'approved').length;
      const completionRate = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;
      
      const allProcessingTimes = allCases
        .filter(c => c.status === 'approved')
        .map(c => {
          const created = new Date(c.createdAt);
          const updated = new Date(c.updatedAt);
          return Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        });
      
      const avgProcessingTime = allProcessingTimes.length > 0 ?
        Math.round(allProcessingTimes.reduce((sum, time) => sum + time, 0) / allProcessingTimes.length) : 0;
      
      const teamEfficiency = teamPerformance.length > 0 ?
        Math.round(teamPerformance.reduce((sum, member) => sum + member.efficiency, 0) / teamPerformance.length) : 0;
      
      setAnalyticsData({
        teamPerformance,
        caseTrends,
        loanTypeBreakdown,
        kpis: {
          totalCases,
          completionRate,
          avgProcessingTime,
          customerSatisfaction: 87, // Simulated
          teamEfficiency
        }
      });
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [user?.organizationId, timeRange]);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Analytics</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={fetchAnalyticsData}>
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
        <Button variant="outline" onClick={onBack} className="dashboard-back-button" style={{ background: '#ffffff', color: '#374151' }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-300">Team performance and business insights</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" onClick={fetchAnalyticsData} className="dashboard-refresh-button">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.kpis.totalCases}</p>
                <p className="text-sm text-gray-600">Total Cases</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.kpis.completionRate}%</p>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.kpis.avgProcessingTime}d</p>
                <p className="text-sm text-gray-600">Avg Processing Time</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.kpis.customerSatisfaction}%</p>
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.kpis.teamEfficiency}%</p>
                <p className="text-sm text-gray-600">Team Efficiency</p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.teamPerformance.map((member, index) => (
              <div key={member.memberId} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{member.memberName}</h3>
                      <p className="text-sm text-gray-600">
                        {member.casesCompleted} completed • {member.avgProcessingTime} days avg
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className={`text-lg font-semibold ${getEfficiencyColor(member.efficiency)}`}>
                        {member.efficiency}%
                      </p>
                      <p className="text-xs text-gray-500">Efficiency</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {member.customerSatisfaction}%
                      </p>
                      <p className="text-xs text-gray-500">Satisfaction</p>
                    </div>
                    
                    <Badge 
                      variant={member.efficiency >= 90 ? "success" : member.efficiency >= 70 ? "warning" : "error"}
                      size="sm"
                    >
                      {member.efficiency >= 90 ? "Excellent" : member.efficiency >= 70 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loan Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loan Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.loanTypeBreakdown.map((loanType) => (
                <div key={loanType.type} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{loanType.type}</h3>
                    <p className="text-sm text-gray-600">
                      {loanType.count} cases • ₹{loanType.avgAmount}L avg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{loanType.approvalRate}%</p>
                    <p className="text-xs text-gray-500">Approval Rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.caseTrends.slice(-7).map((trend, index) => (
                <div key={trend.date} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {new Date(trend.date).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {trend.newCases} new • {trend.completedCases} completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{trend.approvalRate}%</p>
                    <p className="text-xs text-gray-500">Approval Rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
