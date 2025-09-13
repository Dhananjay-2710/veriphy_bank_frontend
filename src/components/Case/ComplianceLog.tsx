import React from 'react';
import { Shield, User, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ComplianceLog as ComplianceLogType } from '../../types';

interface ComplianceLogProps {
  logs: ComplianceLogType[];
}

export function ComplianceLog({ logs }: ComplianceLogProps) {
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getLogBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge variant="success" size="sm">Success</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm">Warning</Badge>;
      case 'error':
        return <Badge variant="error" size="sm">Error</Badge>;
      default:
        return <Badge variant="info" size="sm">Info</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Compliance Log</CardTitle>
          </div>
          <Badge variant="info" size="sm">Immutable</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div key={log.id} className="border-l-4 border-blue-200 pl-4 py-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{log.action}</h4>
                      {getLogBadge(log.type)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{log.user}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Audit Trail Protection</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            All actions are cryptographically signed and cannot be modified. Complete audit trail maintained for regulatory compliance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}