import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  FileText,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  Key,
  Database,
  Activity,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { useAuth } from '../../contexts/AuthContextFixed';

interface SecurityComplianceProps {
  onBack: () => void;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'investigating';
}

interface ComplianceCheck {
  id: string;
  name: string;
  category: 'data_protection' | 'access_control' | 'audit_trail' | 'encryption' | 'backup';
  status: 'pass' | 'fail' | 'warning' | 'pending';
  lastChecked: string;
  nextCheck: string;
  description: string;
  remediation?: string;
}

interface SecurityPolicy {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  lastUpdated: string;
  description: string;
  requirements: string[];
}

export function SecurityCompliance({ onBack }: SecurityComplianceProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load security data
  const loadSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demonstration
      const mockSecurityEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'failed_login',
          severity: 'high',
          user: 'unknown@example.com',
          description: 'Multiple failed login attempts detected',
          ipAddress: '192.168.1.100',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'investigating'
        },
        {
          id: '2',
          type: 'data_access',
          severity: 'medium',
          user: 'john.doe@veriphy.com',
          description: 'Accessed sensitive customer data',
          ipAddress: '192.168.1.50',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: 'active'
        },
        {
          id: '3',
          type: 'permission_denied',
          severity: 'low',
          user: 'jane.smith@veriphy.com',
          description: 'Attempted to access restricted resource',
          ipAddress: '192.168.1.75',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          status: 'resolved'
        }
      ];

      const mockComplianceChecks: ComplianceCheck[] = [
        {
          id: '1',
          name: 'Password Policy Enforcement',
          category: 'access_control',
          status: 'pass',
          lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          nextCheck: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
          description: 'Ensures all passwords meet security requirements'
        },
        {
          id: '2',
          name: 'Data Encryption at Rest',
          category: 'encryption',
          status: 'pass',
          lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          nextCheck: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
          description: 'Verifies all sensitive data is encrypted'
        },
        {
          id: '3',
          name: 'Audit Log Integrity',
          category: 'audit_trail',
          status: 'warning',
          lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          nextCheck: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
          description: 'Checks audit log completeness and integrity',
          remediation: 'Review log retention policies'
        },
        {
          id: '4',
          name: 'Backup Verification',
          category: 'backup',
          status: 'fail',
          lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          nextCheck: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
          description: 'Verifies backup system functionality',
          remediation: 'Check backup system configuration'
        }
      ];

      const mockSecurityPolicies: SecurityPolicy[] = [
        {
          id: '1',
          name: 'Password Security Policy',
          category: 'Access Control',
          isActive: true,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          description: 'Defines password requirements and security standards',
          requirements: [
            'Minimum 8 characters',
            'Must contain uppercase and lowercase letters',
            'Must contain numbers and special characters',
            'Password expires every 90 days',
            'Cannot reuse last 5 passwords'
          ]
        },
        {
          id: '2',
          name: 'Data Classification Policy',
          category: 'Data Protection',
          isActive: true,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
          description: 'Defines how data should be classified and protected',
          requirements: [
            'Public data: No restrictions',
            'Internal data: Company access only',
            'Confidential data: Role-based access',
            'Restricted data: Need-to-know basis only'
          ]
        },
        {
          id: '3',
          name: 'Incident Response Policy',
          category: 'Security Operations',
          isActive: true,
          lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
          description: 'Defines procedures for security incident response',
          requirements: [
            'Immediate containment of threats',
            'Evidence preservation',
            'Stakeholder notification',
            'Post-incident review',
            'Documentation and reporting'
          ]
        }
      ];

      setSecurityEvents(mockSecurityEvents);
      setComplianceChecks(mockComplianceChecks);
      setSecurityPolicies(mockSecurityPolicies);
    } catch (err) {
      console.error('Error loading security data:', err);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="error">Critical</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      case 'low':
        return <Badge variant="success">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="success">Pass</Badge>;
      case 'fail':
        return <Badge variant="error">Fail</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'pending':
        return <Badge variant="info">Pending</Badge>;
      case 'active':
        return <Badge variant="warning">Active</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'investigating':
        return <Badge variant="error">Investigating</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get compliance status
  const getComplianceStatus = () => {
    const total = complianceChecks.length;
    const passed = complianceChecks.filter(c => c.status === 'pass').length;
    const failed = complianceChecks.filter(c => c.status === 'fail').length;
    const warnings = complianceChecks.filter(c => c.status === 'warning').length;
    
    return { total, passed, failed, warnings, score: total > 0 ? Math.round((passed / total) * 100) : 0 };
  };

  // Filter security events
  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const complianceStatus = getComplianceStatus();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading security data...</p>
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
            <p className="text-lg font-semibold">Error Loading Security Data</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={loadSecurityData}>
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
          <Button variant="outline" onClick={onBack} style={{ background: '#ffffff', color: '#374151' }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1 className="text-2xl font-bold text-white">Security & Compliance</h1>
            <p className="text-gray-300">Monitor security events and compliance status</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadSecurityData} style={{ background: '#ffffff', color: '#374151' }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'events', label: 'Security Events', icon: Activity },
            { id: 'compliance', label: 'Compliance', icon: CheckCircle },
            { id: 'policies', label: 'Policies', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Critical Events</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {securityEvents.filter(e => e.severity === 'critical').length}
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
                    <p className="text-sm font-medium text-gray-600">Active Events</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {securityEvents.filter(e => e.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                    <p className="text-2xl font-bold text-gray-900">{complianceStatus.score}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Policies</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {securityPolicies.filter(p => p.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Compliance</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${complianceStatus.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{complianceStatus.score}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{complianceStatus.passed}</p>
                    <p className="text-sm text-gray-600">Passed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{complianceStatus.warnings}</p>
                    <p className="text-sm text-gray-600">Warnings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{complianceStatus.failed}</p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="investigating">Investigating</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No security events found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">{event.description}</h3>
                            {getSeverityBadge(event.severity)}
                            {getStatusBadge(event.status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>User:</strong> {event.user}</p>
                            <p><strong>IP Address:</strong> {event.ipAddress}</p>
                            <p><strong>Type:</strong> {event.type.replace('_', ' ')}</p>
                            <p><strong>Time:</strong> {new Date(event.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {event.status === 'active' && (
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceChecks.map((check) => (
                  <div key={check.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{check.name}</h3>
                          {getStatusBadge(check.status)}
                          <Badge variant="outline">{check.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{check.description}</p>
                        {check.remediation && (
                          <p className="text-sm text-orange-600">
                            <strong>Remediation:</strong> {check.remediation}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          <p>Last checked: {new Date(check.lastChecked).toLocaleString()}</p>
                          <p>Next check: {new Date(check.nextCheck).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Re-run
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
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

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityPolicies.map((policy) => (
                  <div key={policy.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{policy.name}</h3>
                          <Badge variant={policy.isActive ? 'success' : 'error'}>
                            {policy.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{policy.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Requirements:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                            {policy.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Last updated: {new Date(policy.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
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
    </div>
  );
}
