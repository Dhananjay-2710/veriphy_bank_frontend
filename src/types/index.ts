export interface User {
  id: string;
  name: string;
  email: string;
  role: 'salesperson' | 'manager' | 'credit-ops' | 'admin';
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  age: number;
  maritalStatus: 'single' | 'married';
  employment: 'salaried' | 'self-employed' | 'retired';
  loanType: string;
  loanAmount: number;
  riskProfile: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'received' | 'verified' | 'rejected';
  required: boolean;
  uploadedAt?: string;
  verifiedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  fileUrl?: string;
  notes?: string;
  category: 'identity' | 'financial' | 'business' | 'property' | 'employment' | 'other';
  priority: 'high' | 'medium' | 'low';
  expiryDate?: string;
  fileSize?: number;
  fileType?: string;
}

export interface WhatsAppMessage {
  id: string;
  timestamp: string;
  type: 'text' | 'document' | 'system';
  content: string;
  sender: 'customer' | 'system' | 'agent';
  documentId?: string;
}

export interface ComplianceLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface Case {
  id: string;
  caseNumber: string;
  customer: Customer;
  assignedTo: string;
  status: 'new' | 'in-progress' | 'review' | 'approved' | 'rejected';
  documents: Document[];
  whatsappMessages: WhatsAppMessage[];
  complianceLog: ComplianceLog[];
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface KPI {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
}