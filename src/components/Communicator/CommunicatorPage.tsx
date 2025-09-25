import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, MessageCircle, Phone, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useCases, useWhatsAppMessages } from '../../hooks/useDashboardData';
import { useAuth } from '../../contexts/AuthContextFixed';
import { WhatsAppCommunicator } from '../Case/WhatsAppCommunicator';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface CommunicatorPageProps {
  onBack: () => void;
}

export function CommunicatorPage({ onBack }: CommunicatorPageProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // Get real cases data from database
  const { cases, loading: casesLoading, error: casesError } = useCases({
    assignedTo: user?.id
  });

  // Transform cases to customer format for the UI
  const customers = cases.map(case_ => ({
    id: case_.id,
    name: case_.customer.name,
    phone: case_.customer.phone,
    lastMessage: 'Click to view conversation',
    lastMessageTime: new Date(case_.updatedAt).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    unreadCount: 0,
    status: 'online' as const,
    caseId: case_.id,
    loanType: case_.customer.loanType || 'Loan'
  }));

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  // Get WhatsApp messages for selected customer
  const { data: whatsappMessages, loading: messagesLoading, error: messagesError, refetch: refetchMessages } = useWhatsAppMessages(selectedCustomer || '');

  // Transform WhatsApp messages to the expected format
  const transformedMessages = whatsappMessages.map(message => ({
    id: message.id,
    timestamp: message.timestamp,
    type: message.type,
    content: message.content,
    sender: message.sender
  }));

  const getStatusIndicator = (status: string) => {
    return status === 'online' ? (
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
    ) : (
      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
    );
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedCustomer || !selectedCustomerData) return;

    try {
      await SupabaseDatabaseService.sendWhatsAppMessage(selectedCustomer, {
        content: message,
        type: 'text',
        sender: 'agent',
        customerPhone: selectedCustomerData.phone
      });
      
      // Refresh messages
      refetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendDocument = async (file: File) => {
    if (!selectedCustomer || !selectedCustomerData) return;

    try {
      // In a real implementation, you would upload the file to Supabase Storage first
      // For now, we'll simulate sending a document message
      await SupabaseDatabaseService.sendWhatsAppDocument(selectedCustomer, {
        documentId: 'temp-doc-id', // This would be the actual document ID from storage
        customerPhone: selectedCustomerData.phone,
        message: `Document: ${file.name}`
      });
      
      // Refresh messages
      refetchMessages();
    } catch (error) {
      console.error('Error sending document:', error);
    }
  };

  if (casesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Communicator</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (casesError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Communicator</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading conversations: {casesError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCustomer && selectedCustomerData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chats
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat with {selectedCustomerData.name}</h1>
            <p className="text-gray-600">{selectedCustomerData.loanType} • Case #{selectedCustomerData.caseId}</p>
          </div>
        </div>

        <Card className="h-[600px]">
          <WhatsAppCommunicator 
            messages={transformedMessages}
            customerName={selectedCustomerData.name}
            customerPhone={selectedCustomerData.phone}
            onSendMessage={handleSendMessage}
            onSendDocument={handleSendDocument}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Communications</h1>
            <p className="text-gray-600">WhatsApp conversations with your customers</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="success" className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Sync Active</span>
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card 
            key={customer.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedCustomer(customer.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {customer.name ? customer.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'C'}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      {getStatusIndicator(customer.status)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <p className="text-xs text-gray-500">{customer.loanType}</p>
                  </div>
                </div>
                {customer.unreadCount > 0 && (
                  <Badge variant="error" size="sm">
                    {customer.unreadCount}
                  </Badge>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 line-clamp-2">{customer.lastMessage}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{customer.lastMessageTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
            <p className="text-gray-600">Try adjusting your search terms or check back later for new messages.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}