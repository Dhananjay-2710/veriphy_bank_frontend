import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Calendar, Filter, TrendingUp, AlertTriangle, CheckCircle, Shield, BarChart3, Eye, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { useComplianceMetrics, useComplianceAlerts, useComplianceBreakdown } from '../../hooks/useDashboardData';

interface ComplianceReportsProps {
  onBack: () => void;
}

export function ComplianceReports({ onBack }: ComplianceReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  // Use real compliance data from hooks
  const { data: complianceMetrics, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useComplianceMetrics(selectedPeriod);
  const { data: complianceAlerts, loading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useComplianceAlerts(selectedPeriod);
  const { data: complianceBreakdown, loading: breakdownLoading, error: breakdownError, refetch: refetchBreakdown } = useComplianceBreakdown(selectedPeriod);

  // Load compliance data on component mount and when period changes
  useEffect(() => {
    // Data is automatically loaded by hooks when selectedPeriod changes
    setError(metricsError || alertsError || breakdownError);
  }, [selectedPeriod, metricsError, alertsError, breakdownError]);

  const generateReport = async (reportType: string) => {
    try {
      setGeneratingReport(reportType);
      console.log('Generating compliance report:', reportType);
      
      const reportData = await SupabaseDatabaseService.generateComplianceReport({
        reportType,
        period: selectedPeriod,
        generatedBy: 'current_user_id' // This should come from auth context
      });
      
      // Trigger download or show report
      downloadReport(reportData, reportType);
      
      // Show success message
      alert(`${reportType} report generated successfully!`);
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(null);
    }
  };

  const downloadReport = (data: any, reportType: string) => {
    // Create and download report file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-${reportType}-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getMockComplianceMetrics = () => [
    {
      label: 'Overall Compliance Score',
      value: '98.5%',
      change: '+0.3%',
      trend: 'up',
      target: '98%',
      status: 'excellent'
    },
    {
      label: 'AML Screening Pass Rate',
      value: '100%',
      change: '0%',
      trend: 'stable',
      target: '100%',
      status: 'excellent'
    },
    {
      label: 'KYC Completion Rate',
      value: '97.8%',
      change: '+1.2%',
      trend: 'up',
      target: '95%',
      status: 'good'
    },
    {
      label: 'Document Verification Rate',
      value: '96.2%',
      change: '-0.5%',
      trend: 'down',
      target: '95%',
      status: 'good'
    }
  ];

  const getMockComplianceAlerts = () => [
    {
      id: 'alert-1',
      type: 'aml',
      severity: 'high',
      title: 'PEP List Match Detected',
      description: 'Customer Kavya Menon appears on Politically Exposed Person list',
      timestamp: '2025-01-09T15:45:00Z',
      status: 'investigating',
      caseId: 'HBI-HL-2025-005'
    },
    {
      id: 'alert-2',
      type: 'document',
      severity: 'medium',
      title: 'Document Verification Delay',
      description: 'GST returns verification taking longer than SLA (>48 hours)',
      timestamp: '2025-01-09T14:20:00Z',
      status: 'in_progress',
      caseId: 'HBI-HL-2025-001'
    },
    {
      id: 'alert-3',
      type: 'kyc',
      severity: 'low',
      title: 'Address Verification Pending',
      description: 'Field verification pending for business address',
      timestamp: '2025-01-09T13:10:00Z',
      status: 'scheduled',
      caseId: 'HBI-BL-2025-004'
    }
  ];

  const getMockComplianceBreakdown = () => [
    {
      category: 'Identity Verification',
      total: 1247,
      compliant: 1235,
      rate: '99.0%',
      issues: 12,
      trend: 'stable'
    },
    {
      category: 'Financial Documentation',
      total: 1247,
      compliant: 1198,
      rate: '96.1%',
      issues: 49,
      trend: 'improving'
    },
    {
      category: 'AML Screening',
      total: 1247,
      compliant: 1247,
      rate: '100%',
      issues: 0,
      trend: 'stable'
    },
    {
      category: 'Credit Assessment',
      total: 1247,
      compliant: 1189,
      rate: '95.3%',
      issues: 58,
      trend: 'declining'
    },
    {
      category: 'Regulatory Compliance',
      total: 1247,
      compliant: 1223,
      rate: '98.1%',
      issues: 24,
      trend: 'improving'
    }
  ];

  const metricsData = complianceMetrics.length > 0 ? complianceMetrics : getMockComplianceMetrics();

  const reportTypes = [
    {
      id: 'overview',
      name: 'Compliance Overview',
      description: 'High-level compliance metrics and trends',
      lastGenerated: '2025-01-09T16:00:00Z',
      frequency: 'Daily'
    },
    {
      id: 'aml',
      name: 'AML Screening Report',
      description: 'Anti-Money Laundering screening results and alerts',
      lastGenerated: '2025-01-09T15:30:00Z',
      frequency: 'Real-time'
    },
    {
      id: 'kyc',
      name: 'KYC Compliance Report',
      description: 'Know Your Customer verification status and gaps',
      lastGenerated: '2025-01-09T14:00:00Z',
      frequency: 'Daily'
    },
    {
      id: 'regulatory',
      name: 'Regulatory Compliance',
      description: 'RBI guidelines adherence and regulatory requirements',
      lastGenerated: '2025-01-09T12:00:00Z',
      frequency: 'Weekly'
    },
    {
      id: 'audit',
      name: 'Audit Trail Report',
      description: 'Complete audit trail for regulatory submissions',
      lastGenerated: '2025-01-09T10:00:00Z',
      frequency: 'Monthly'
    },
    {
      id: 'risk',
      name: 'Risk Assessment Report',
      description: 'Risk profiling and assessment compliance',
      lastGenerated: '2025-01-09T08:00:00Z',
      frequency: 'Weekly'
    }
  ];

  const recentAlerts = complianceAlerts.length > 0 ? complianceAlerts : [
    {
      id: 'alert-1',
      type: 'aml',
      severity: 'high',
      title: 'PEP List Match Detected',
      description: 'Customer Kavya Menon appears on Politically Exposed Person list',
      timestamp: '2025-01-09T15:45:00Z',
      status: 'investigating',
      caseId: 'HBI-HL-2025-005'
    },
    {
      id: 'alert-2',
      type: 'document',
      severity: 'medium',
      title: 'Document Verification Delay',
      description: 'GST returns verification taking longer than SLA (>48 hours)',
      timestamp: '2025-01-09T14:20:00Z',
      status: 'in_progress',
      caseId: 'HBI-HL-2025-001'
    },
    {
      id: 'alert-3',
      type: 'kyc',
      severity: 'low',
      title: 'Address Verification Pending',
      description: 'Field verification pending for business address',
      timestamp: '2025-01-09T13:10:00Z',
      status: 'scheduled',
      caseId: 'HBI-BL-2025-004'
    }
  ];

  const breakdownData = complianceBreakdown.length > 0 ? complianceBreakdown : [
    {
      category: 'Identity Verification',
      total: 1247,
      compliant: 1235,
      rate: '99.0%',
      issues: 12,
      trend: 'stable'
    },
    {
      category: 'Financial Documentation',
      total: 1247,
      compliant: 1198,
      rate: '96.1%',
      issues: 49,
      trend: 'improving'
    },
    {
      category: 'AML Screening',
      total: 1247,
      compliant: 1247,
      rate: '100%',
      issues: 0,
      trend: 'stable'
    },
    {
      category: 'Credit Assessment',
      total: 1247,
      compliant: 1189,
      rate: '95.3%',
      issues: 58,
      trend: 'declining'
    },
    {
      category: 'Regulatory Compliance',
      total: 1247,
      compliant: 1223,
      rate: '98.1%',
      issues: 24,
      trend: 'improving'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge variant="success">Excellent</Badge>;
      case 'good':
        return <Badge variant="info">Good</Badge>;
      case 'warning':
        return <Badge variant="warning">Needs Attention</Badge>;
      case 'critical':
        return <Badge variant="error">Critical</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="info" size="sm">Low</Badge>;
      default:
        return <Badge size="sm">{severity}</Badge>;
    }
  };

  const getAlertStatusBadge = (status: string) => {
    switch (status) {
      case 'investigating':
        return <Badge variant="error" size="sm">Investigating</Badge>;
      case 'in_progress':
        return <Badge variant="warning" size="sm">In Progress</Badge>;
      case 'scheduled':
        return <Badge variant="info" size="sm">Scheduled</Badge>;
      case 'resolved':
        return <Badge variant="success" size="sm">Resolved</Badge>;
      default:
        return <Badge size="sm">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compliance Reports</h1>
            <p className="text-gray-600">Comprehensive compliance monitoring and regulatory reporting</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" onClick={() => { refetchMetrics(); refetchAlerts(); refetchBreakdown(); }} disabled={metricsLoading || alertsLoading || breakdownLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => generateReport('comprehensive')} disabled={generatingReport === 'comprehensive'}>
            <Download className="h-4 w-4 mr-2" />
            {generatingReport === 'comprehensive' ? 'Generating...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(metricsLoading || alertsLoading || breakdownLoading) && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading compliance data...</span>
        </div>
      )}

      {/* Compliance Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-xs text-gray-500">Target: {metric.target}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(metric.status)}
                  <p className={`text-sm font-medium mt-1 ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '→'} {metric.change}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Types */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <div 
                key={report.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedReport === report.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Updated: {new Date(report.lastGenerated).toLocaleString()}</span>
                  <Badge variant="info" size="sm">{report.frequency}</Badge>
                </div>
                <div className="mt-3 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => generateReport(report.id)}
                    disabled={generatingReport === report.id}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {generatingReport === report.id ? 'Generating...' : 'Export'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Compliance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Compliance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div 
                key={alert.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.severity === 'high' ? 'text-red-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Case: {alert.caseId}</span>
                        <span>Type: {alert.type.toUpperCase()}</span>
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getAlertStatusBadge(alert.status)}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {breakdownData.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{category.category}</h3>
                    {getTrendIcon(category.trend)}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{category.rate}</p>
                    <p className="text-xs text-gray-500">{category.compliant}/{category.total} compliant</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        parseFloat(category.rate) >= 98 ? 'bg-green-500' :
                        parseFloat(category.rate) >= 95 ? 'bg-blue-500' :
                        parseFloat(category.rate) >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: category.rate }}
                    ></div>
                  </div>
                </div>

                {category.issues > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-gray-700">{category.issues} issues requiring attention</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Requirements Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">RBI Guidelines Compliance</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">KYC Norms</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">100%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">AML Guidelines</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">100%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Credit Information</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">98.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Fair Practices Code</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">97.2%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Internal Policies</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Document Retention</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">100%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Data Privacy</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">99.8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Risk Assessment</span>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">94.1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Audit Trail</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="comprehensive">Comprehensive Compliance</option>
                <option value="aml">AML Screening Only</option>
                <option value="kyc">KYC Verification Only</option>
                <option value="regulatory">Regulatory Compliance</option>
                <option value="audit">Audit Trail</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}