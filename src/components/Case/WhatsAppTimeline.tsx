import React from 'react';
import { MessageCircle, FileText, Bot, User, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { WhatsAppMessage } from '../../types';

interface WhatsAppTimelineProps {
  messages: WhatsAppMessage[];
}

export function WhatsAppTimeline({ messages }: WhatsAppTimelineProps) {
  const getMessageIcon = (type: string, sender: string) => {
    if (type === 'document') return <FileText className="h-4 w-4" />;
    if (sender === 'system') return <Bot className="h-4 w-4" />;
    return <MessageCircle className="h-4 w-4" />;
  };

  const getMessageStyle = (sender: string) => {
    switch (sender) {
      case 'customer':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'system':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>WhatsApp Timeline</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Live Sync Active</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <div key={message.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'customer' ? 'bg-green-100 text-green-600' :
                  message.sender === 'system' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getMessageIcon(message.type, message.sender)}
                </div>
              </div>
              
              <div className="flex-1">
                <div className={`p-3 rounded-lg border ${getMessageStyle(message.sender)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium capitalize">
                      {message.sender === 'system' ? 'VERIPHY Bot' : 
                       message.sender === 'customer' ? 'Customer' : 'Agent'}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  
                  {message.type === 'document' && (
                    <div className="mt-2 flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600">Document uploaded securely</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Customer is typing...</span>
            </div>
            <span className="text-xs text-gray-500">End-to-end encrypted</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}