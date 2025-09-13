import React from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, Download, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Document } from '../../types';

interface DocumentChecklistProps {
  documents: Document[];
}

export function DocumentChecklist({ documents }: DocumentChecklistProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'received':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>;
      case 'received':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  const completionRate = Math.round(
    (documents.filter(doc => doc.status === 'verified').length / documents.length) * 100
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Document Checklist</CardTitle>
          <div className="text-right">
            <p className="text-sm text-gray-500">Completion Rate</p>
            <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(doc.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{doc.name}</h3>
                    {doc.required && <span className="text-red-500 text-sm">*</span>}
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{doc.type} document</p>
                  {doc.uploadedAt && (
                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {getStatusBadge(doc.status)}
                {doc.status !== 'pending' && (
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Additional Documents Required</h4>
              <p className="text-sm text-blue-700 mt-1">
                Due to self-employed status, GST returns and property documents are required for final approval.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}