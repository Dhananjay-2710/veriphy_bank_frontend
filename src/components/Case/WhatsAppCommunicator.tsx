import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { WhatsAppMessage } from '../../types';

interface WhatsAppCommunicatorProps {
  messages: WhatsAppMessage[];
  customerName: string;
  customerPhone: string;
  onSendMessage?: (message: string) => void;
  onSendDocument?: (file: File) => void;
}

export function WhatsAppCommunicator({ 
  messages, 
  customerName, 
  customerPhone,
  onSendMessage,
  onSendDocument 
}: WhatsAppCommunicatorProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendDocument) {
      onSendDocument(file);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageBubbleStyle = (sender: string) => {
    switch (sender) {
      case 'customer':
        return 'bg-white border border-gray-200 text-gray-900 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md';
      case 'agent':
        return 'bg-green-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-md rounded-br-2xl ml-auto';
      case 'system':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg mx-auto text-center';
      default:
        return 'bg-gray-100 text-gray-800 rounded-lg';
    }
  };

  // Quick reply templates
  const quickReplies = [
    "Thank you for uploading the document. We'll review it shortly.",
    "Could you please upload your PAN card?",
    "We need your bank statements for the last 6 months.",
    "Your loan application is being processed.",
    "Please upload your GST returns for verification."
  ];

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Chat Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
              <span className="font-semibold text-sm">
                {customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="font-medium">{customerName}</h3>
              <p className="text-xs text-green-100">{customerPhone}</p>
              <div className="flex items-center space-x-1 text-xs text-green-100">
                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-green-700">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-green-700">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-green-700">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border-b border-blue-200 p-2">
        <div className="flex items-center justify-center space-x-2 text-xs text-blue-700">
          <Shield className="h-3 w-3" />
          <span>End-to-end encrypted • Bank-grade security</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'agent' ? 'justify-end' : message.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 ${getMessageBubbleStyle(message.sender)}`}>
              {message.type === 'document' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm font-medium">Document uploaded</span>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
              <div className="flex items-center justify-end mt-1 space-x-1">
                <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                {message.sender === 'agent' && (
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-white rounded-full opacity-70"></div>
                    <div className="w-1 h-1 bg-white rounded-full opacity-70"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => setNewMessage(reply)}
              className="flex-shrink-0 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white p-4 rounded-b-lg border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="flex-shrink-0 bg-green-500 hover:bg-green-600 text-white rounded-full p-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}