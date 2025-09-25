import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  BellOff, 
  Check, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Mail,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { NotificationService } from '../../services/notification-service';
import { useAuth } from '../../contexts/AuthContextFixed';

interface NotificationCenterProps {
  onBack: () => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  read_at?: string;
  created_at: string;
  case_id?: string;
  data?: Record<string, any>;
}

export function NotificationCenter({ onBack }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: true,
    inApp: true
  });

  // Load notifications
  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await NotificationService.getNotificationsForUser(user.id, 100);
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read_at);
      await Promise.all(unreadNotifications.map(n => NotificationService.markAsRead(n.id)));
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="error">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      case 'low':
        return <Badge variant="success">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="success">Sent</Badge>;
      case 'delivered':
        return <Badge variant="info">Delivered</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  // Get notification statistics
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read_at).length,
    urgent: notifications.filter(n => n.priority === 'urgent').length,
    failed: notifications.filter(n => n.status === 'failed').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
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
            <p className="text-lg font-semibold">Error Loading Notifications</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={loadNotifications}>
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
            <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
            <p className="text-gray-600">Manage your notifications and alerts</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadNotifications}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {stats.unread > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BellOff className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="application_received">Application Received</option>
              <option value="documents_required">Documents Required</option>
              <option value="loan_approved">Loan Approved</option>
              <option value="loan_rejected">Loan Rejected</option>
              <option value="sla_violation">SLA Violation</option>
              <option value="case_assigned">Case Assigned</option>
              <option value="compliance_issue">Compliance Issue</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
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
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    notification.read_at 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getPriorityIcon(notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-medium ${
                          notification.read_at ? 'text-gray-900' : 'text-blue-900'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(notification.priority)}
                          {getStatusBadge(notification.status)}
                          {!notification.read_at && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm ${
                        notification.read_at ? 'text-gray-600' : 'text-blue-700'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                        {notification.case_id && (
                          <Badge variant="outline">Case #{notification.case_id}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span>Email Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.email}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, email: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <span>SMS Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.sms}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, sms: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span>Push Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.push}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, push: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BellOff className="h-5 w-5 text-gray-600" />
                  <span>In-App Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.inApp}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, inApp: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Save settings
                    setShowSettings(false);
                  }}
                  className="flex-1"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
