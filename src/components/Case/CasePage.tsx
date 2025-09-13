import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Briefcase, Home, MapPin, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DocumentChecklist } from './DocumentChecklist';
import { WhatsAppTimeline } from './WhatsAppTimeline';
import { ComplianceLog } from './ComplianceLog';
import { WhatsAppCommunicator } from './WhatsAppCommunicator';
import { DocumentManager } from '../Documents/DocumentManager';
import { mockCase } from '../../data/mockData';

interface CasePageProps {
  caseId: string;
  onBack: () => void;
}

export function CasePage({ caseId, onBack }: CasePageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState(mockCase.whatsappMessages);
  const case_ = mockCase; // In real app, fetch by caseId

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'document-manager', label: 'Document Manager' },
    { id: 'whatsapp', label: 'WhatsApp Timeline' },
    { id: 'communicator', label: 'Chat with Customer' },
    { id: 'compliance', label: 'Compliance Log' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'review':
        return <Badge variant="info">Under Review</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="error">High Risk</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="success">Low Risk</Badge>;
      default:
        return <Badge>{risk}</Badge>;
    }
  };

  const handleSendMessage = (message: string) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'text' as const,
      content: message,
      sender: 'agent' as const
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    // Simulate customer typing and response
    setTimeout(() => {
      const customerResponse = {
        id: `msg-${Date.now() + 1}`,
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        content: "Thank you for the message. I'll get back to you shortly.",
        sender: 'customer' as const
      };
      setChatMessages(prev => [...prev, customerResponse]);
    }, 2000);
  };

  const handleSendDocument = (file: File) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'document' as const,
      content: `Document request sent: ${file.name}`,
      sender: 'agent' as const
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Case #{case_.caseNumber}</h1>
            <p className="text-gray-600">{case_.customer.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(case_.status)}
          {getRiskBadge(case_.customer.riskProfile)}
        </div>
      </div>

      {/* Customer Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{case_.customer.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{case_.customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Employment</p>
                <p className="font-medium capitalize">{case_.customer.employment}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Home className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Loan Amount</p>
                <p className="font-medium">₹{(case_.customer.loanAmount / 100000).toFixed(0)}L</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DocumentChecklist documents={case_.documents} />
            <WhatsAppTimeline messages={case_.whatsappMessages.slice(-5)} />
          </div>
        )}
        {activeTab === 'documents' && <DocumentChecklist documents={case_.documents} />}
        {activeTab === 'document-manager' && (
          <DocumentManager 
            onBack={() => setActiveView('overview')}
            onSendMessage={handleSendMessage}
          />
        )}
        {activeTab === 'whatsapp' && <WhatsAppTimeline messages={chatMessages} />}
        {activeTab === 'communicator' && (
          <div className="max-w-4xl mx-auto">
            <WhatsAppCommunicator 
              messages={chatMessages}
              customerName={case_.customer.name}
              customerPhone={case_.customer.phone}
              onSendMessage={handleSendMessage}
              onSendDocument={handleSendDocument}
            />
          </div>
        )}
        {activeTab === 'compliance' && <ComplianceLog logs={case_.complianceLog} />}
      </div>
    </div>
  );
}