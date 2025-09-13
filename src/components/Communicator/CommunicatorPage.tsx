import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, MessageCircle, Phone, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { WhatsAppCommunicator } from '../Case/WhatsAppCommunicator';
import { mockCase } from '../../data/mockData';

interface CommunicatorPageProps {
  onBack: () => void;
}

export function CommunicatorPage({ onBack }: CommunicatorPageProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock customer list with recent conversations
  const customers = [
    {
      id: 'cust1',
      name: 'Ramesh & Sunita Gupta',
      phone: '+91-9876543210',
      lastMessage: 'We are still working on getting the GST documents ready.',
      lastMessageTime: '15:00',
      unreadCount: 2,
      status: 'online',
      caseId: 'case-001',
      loanType: 'Home Loan'
    },
    {
      id: 'cust2',
      name: 'Amit Verma',
      phone: '+91-9876543211',
      lastMessage: 'Thank you for the quick response!',
      lastMessageTime: '14:30',
      unreadCount: 0,
      status: 'offline',
      caseId: 'case-002',
      loanType: 'Personal Loan'
    },
    {
      id: 'cust3',
      name: 'Neha Singh',
      phone: '+91-9876543212',
      lastMessage: 'When can I expect the loan approval?',
      lastMessageTime: '12:45',
      unreadCount: 1,
      status: 'online',
      caseId: 'case-003',
      loanType: 'Car Loan'
    },
    {
      id: 'cust4',
      name: 'Pradeep Kumar',
      phone: '+91-9876543213',
      lastMessage: 'I have uploaded all the required documents.',
      lastMessageTime: '11:20',
      unreadCount: 0,
      status: 'offline',
      caseId: 'case-004',
      loanType: 'Business Loan'
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  const getStatusIndicator = (status: string) => {
    return status === 'online' ? (
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
    ) : (
      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
    );
  };

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
            messages={mockCase.whatsappMessages}
            customerName={selectedCustomerData.name}
            customerPhone={selectedCustomerData.phone}
            onSendMessage={(message) => console.log('Sending message:', message)}
            onSendDocument={(file) => console.log('Sending document:', file.name)}
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
                      {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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