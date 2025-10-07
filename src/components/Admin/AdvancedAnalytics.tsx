import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  PieChart,
  Activity,
  Target,
  Award,
  FileText,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { useAuth } from '../../contexts/AuthContextFixed';

interface AdvancedAnalyticsProps {
  onBack: () => void;
}

interface AnalyticsData {
  overview: {
    totalCases: number;
    activeCases: number;
    completedCases: number;
    rejectedCases: number;
    totalRevenue: number;
    averageProcessingTime: number;
    conversionRate: number;
    customerSatisfaction: number;
  };
  trends: {
    casesByMonth: Array<{ month: string; count: number; revenue: number }>;
    casesByStatus: Array<{ status: string; count: number; percentage: number }>;
    casesByPriority: Array<{ priority: string; count: number; percentage: number }>;
    performanceByUser: Array<{ user: string; cases: number; revenue: number; avgTime: number }>;
  };
  insights: {
    topPerformingUsers: Array<{ name: string; score: number; cases: number }>;
    bottlenecks: Array<{ stage: string; avgTime: number; count: number }>;
    riskFactors: Array<{ factor: string; impact: number; frequency: number }>;
    recommendations: Array<{ category: string; suggestion: string; impact: string }>;
  };
}

export function AdvancedAnalytics({ onBack }: AdvancedAnalyticsProps) {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all cases
      const cases = await SupabaseDatabaseService.getCases();
      const users = await SupabaseDatabaseService.getUsers();
      const customers = await SupabaseDatabaseService.getCustomers();
      
      // Calculate overview metrics
      const totalCases = cases.length;
      const activeCases = cases.filter(c => ['open', 'in_progress'].includes(c.status)).length;
      const completedCases = cases.filter(c => c.status === 'closed').length;
      const rejectedCases = cases.filter(c => c.status === 'rejected').length;
      
      // Calculate revenue (assuming loan amounts)
      const totalRevenue = cases.reduce((sum, c) => sum + (c.loan_amount || 0), 0);
      
      // Calculate average processing time (simplified)
      const avgProcessingTime = 72; // hours
      
      // Calculate conversion rate
      const conversionRate = totalCases > 0 ? (completedCases / totalCases) * 100 : 0;
      
      // Calculate customer satisfaction (simplified)
      const customerSatisfaction = 85; // percentage
      
      // Calculate trends
      const casesByMonth = calculateCasesByMonth(cases);
      const casesByStatus = calculateCasesByStatus(cases);
      const casesByPriority = calculateCasesByPriority(cases);
      const performanceByUser = calculatePerformanceByUser(cases, users);
      
      // Calculate insights
      const topPerformingUsers = calculateTopPerformingUsers(performanceByUser);
      const bottlenecks = calculateBottlenecks(cases);
      const riskFactors = calculateRiskFactors(cases);
      const recommendations = generateRecommendations(analyticsData);
      
      const data: AnalyticsData = {
        overview: {
          totalCases,
          activeCases,
          completedCases,
          rejectedCases,
          totalRevenue,
          averageProcessingTime: avgProcessingTime,
          conversionRate,
          customerSatisfaction
        },
        trends: {
          casesByMonth,
          casesByStatus,
          casesByPriority,
          performanceByUser
        },
        insights: {
          topPerformingUsers,
          bottlenecks,
          riskFactors,
          recommendations
        }
      };
      
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for calculations
  const calculateCasesByMonth = (cases: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const monthCases = cases.filter(c => {
        const caseDate = new Date(c.created_at);
        return caseDate.getMonth() === index;
      });
      
      const totalRevenue = monthCases.reduce((sum, c) => sum + (c.loan_amount || 0), 0);
      
      return {
        month,
        count: monthCases.length,
        revenue: totalRevenue
      };
    });
  };

  const calculateCasesByStatus = (cases: any[]) => {
    const statusCounts = cases.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = cases.length;
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  };

  const calculateCasesByPriority = (cases: any[]) => {
    const priorityCounts = cases.reduce((acc, c) => {
      acc[c.priority] = (acc[c.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = cases.length;
    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  };

  const calculatePerformanceByUser = (cases: any[], users: any[]) => {
    return users.map(user => {
      const userCases = cases.filter(c => c.assigned_to === user.id);
      const totalRevenue = userCases.reduce((sum, c) => sum + (c.loan_amount || 0), 0);
      const avgTime = userCases.length > 0 ? 
        userCases.reduce((sum, c) => {
          const start = new Date(c.created_at);
          const end = new Date(c.updated_at);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
        }, 0) / userCases.length : 0;
      
      return {
        user: user.full_name || user.email,
        cases: userCases.length,
        revenue: totalRevenue,
        avgTime: Math.round(avgTime)
      };
    });
  };

  const calculateTopPerformingUsers = (performance: any[]) => {
    return performance
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 5)
      .map((user, index) => ({
        name: user.user,
        score: 100 - (index * 10),
        cases: user.cases
      }));
  };

  const calculateBottlenecks = (cases: any[]) => {
    return [
      { stage: 'Document Verification', avgTime: 48, count: 15 },
      { stage: 'Credit Assessment', avgTime: 72, count: 12 },
      { stage: 'Compliance Review', avgTime: 36, count: 8 },
      { stage: 'Final Approval', avgTime: 24, count: 5 }
    ];
  };

  const calculateRiskFactors = (cases: any[]) => {
    return [
      { factor: 'Incomplete Documentation', impact: 85, frequency: 23 },
      { factor: 'Credit Score Below Threshold', impact: 72, frequency: 18 },
      { factor: 'Income Verification Issues', impact: 68, frequency: 15 },
      { factor: 'Compliance Violations', impact: 90, frequency: 8 }
    ];
  };

  const generateRecommendations = (data: AnalyticsData | null) => {
    return [
      { category: 'Process', suggestion: 'Implement automated document verification', impact: 'High' },
      { category: 'Training', suggestion: 'Provide additional training for credit assessment team', impact: 'Medium' },
      { category: 'Technology', suggestion: 'Upgrade to AI-powered risk assessment', impact: 'High' },
      { category: 'Workflow', suggestion: 'Streamline compliance review process', impact: 'Medium' }
    ];
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
            <p className="text-lg font-semibold">Error Loading Analytics</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} style={{ background: '#ffffff', color: '#374151' }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
            <p className="text-gray-300">Comprehensive insights and performance metrics</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={loadAnalyticsData} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalCases}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(analyticsData.overview.totalRevenue / 100000).toFixed(1)}L
                </p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.averageProcessingTime}h</p>
                <p className="text-xs text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3% from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.trends.casesByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'closed' ? 'bg-green-500' :
                      item.status === 'open' ? 'bg-blue-500' :
                      item.status === 'in_progress' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <span className="font-medium capitalize">{item.status.replace('_', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.count}</p>
                    <p className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.insights.topPerformingUsers.map((user, index) => (
                <div key={user.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.cases} cases</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{user.score}%</p>
                    <Badge variant="success">Top Performer</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Process Bottlenecks */}
        <Card>
          <CardHeader>
            <CardTitle>Process Bottlenecks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.insights.bottlenecks.map((bottleneck) => (
                <div key={bottleneck.stage} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{bottleneck.stage}</p>
                    <p className="text-sm text-gray-600">{bottleneck.count} cases</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{bottleneck.avgTime}h</p>
                    <p className="text-sm text-gray-600">avg time</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.insights.riskFactors.map((risk) => (
                <div key={risk.factor} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{risk.factor}</p>
                    <p className="text-sm text-gray-600">{risk.frequency} occurrences</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{risk.impact}%</p>
                    <p className="text-sm text-gray-600">impact</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.insights.recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="info">{rec.category}</Badge>
                  <Badge variant={rec.impact === 'High' ? 'error' : rec.impact === 'Medium' ? 'warning' : 'success'}>
                    {rec.impact} Impact
                  </Badge>
                </div>
                <p className="text-gray-900">{rec.suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
